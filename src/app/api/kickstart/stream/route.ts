import { NextRequest } from "next/server";
import { streamPart, TOTAL_PARTS } from "@/lib/kickstart/generate";
import { createProject, updateProjectMd, savePartialMd, getProject } from "@/lib/kickstart/queries";
import { updateProjectMdInGitHub } from "@/lib/kickstart/bootstrap/github";
import { WizardFormData, KickstartProject, VerifyCheck } from "@/lib/kickstart/types";
import { wizardSchema } from "@/lib/kickstart/validation";

export const runtime = "nodejs";
export const maxDuration = 300;

const PART_SEPARATOR = "\n\n---\n\n";
const CF_FLUSH_PADDING = ": " + "x".repeat(1024) + "\n\n";

function toFormData(p: KickstartProject): WizardFormData {
  return {
    client_name:       p.client_name,
    project_name:      p.project_name,
    contact_person:    p.contact_person ?? "",
    new_domain:        p.new_domain ?? "",
    existing_url:      p.existing_url ?? "",
    project_type:      p.project_type,
    auth_type:         p.auth_type ?? "supabase-auth",
    sprint_estimate:   p.sprint_estimate ?? 6,
    requires_scrape:   p.requires_scrape ?? false,
    tech_stack:        p.tech_stack ?? [],
    integrations:      p.integrations ?? [],
    design_direction:  p.design_direction ?? "",
    primary_color:     p.primary_color ?? "",
    secondary_color:   p.secondary_color ?? "",
    motion_preference: p.motion_preference ?? "subtil",
    features:          p.features ?? "",
    extra_notes:       p.extra_notes ?? "",
    short_description: p.short_description ?? "",
    long_description:  p.long_description ?? "",
  };
}

/**
 * Sjekker at det faktisk står noe i specen — ikke bare at genereringen svarte.
 * Tegn-grensene er grove, men de fanger den vanlige feilen: en del som stoppet
 * etter tre avsnitt fordi modellen ble avbrutt.
 */
export function verifyContent(md: string): { ok: boolean; checks: VerifyCheck[] } {
  const placeholders = md.match(/\{\{[a-z_]+\}\}|\bTBD\b|\[\.\.\.\]/gi) ?? [];
  const checks: VerifyCheck[] = [
    { label: "Full spec (>100 000 tegn)",  ok: md.length > 100_000 },
    { label: "Sprintplan",                 ok: /sprint[\s-]?plan|sprintplan|sprint\s+\d/i.test(md) },
    { label: "Datamodell / SQL",           ok: /create table|datamodell|rls|policy/i.test(md) },
    { label: "SEO + AEO",                  ok: /json-ld|schema\.org|sitemap/i.test(md) },
    { label: "Sikkerhet + GDPR",           ok: /content-security-policy|csp|gdpr|personvern/i.test(md) },
    { label: "Designsystem (tokens)",      ok: /--color|tokens\.css|designtokens|designsystem/i.test(md) },
    { label: "AGENTS.md",                  ok: /AGENTS\.md/i.test(md) },
    { label: "Pre-launch-sjekkliste",      ok: /pre.?launch/i.test(md) },
    { label: "E-postmaler",                ok: /e-postmal|epostmal|transaksjons/i.test(md) },
    { label: "Spørsmål til kunden",        ok: /spørsmål til kunden/i.test(md) },
    { label: "Ingen ufylte placeholders",  ok: placeholders.length === 0 },
  ];
  return { ok: checks.every((c) => c.ok), checks };
}

interface RequestBody extends Partial<WizardFormData> {
  project_id?: string;
  regenerate?: boolean;
  /** 1-indeksert. Utelates den, fortsetter vi der prosjektet faktisk står. */
  part?: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as RequestBody | null;
  if (!body) {
    return new Response(JSON.stringify({ error: "Ugyldig JSON" }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const enqueue = (s: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(s));
        } catch {
          closed = true;
        }
      };
      enqueue(CF_FLUSH_PADDING);
      const send = (data: object) => enqueue(`data: ${JSON.stringify(data)}\n\n`);
      let heartbeat: ReturnType<typeof setInterval> | null = null;

      try {
        // === 1. Finn prosjektet og hvilken del som skal genereres ===
        let project: KickstartProject | null = null;
        let partIndex: number;
        let previousContent: string;

        if (!body.project_id) {
          // Nytt prosjekt — del 1. Valideres også her, ikke bare i wizarden:
          // et halvutfylt prosjekt gir en halvgod spec til full pris.
          const parsed = wizardSchema.safeParse(body);
          if (!parsed.success) {
            throw new Error(
              `Ugyldige prosjektdata: ${parsed.error.issues
                .map((i) => `${i.path.join(".")} ${i.message}`)
                .join(", ")}`,
            );
          }
          project = await createProject(parsed.data as WizardFormData);
          console.log(`[stream] Nytt prosjekt id=${project.id} klient="${project.client_name}"`);
          send({ type: "project_id", id: project.id });
          partIndex = 0;
          previousContent = "";
        } else {
          project = await getProject(body.project_id);
          if (!project) throw new Error(`Prosjekt ${body.project_id} ikke funnet`);

          if (body.regenerate) {
            // Regenerering starter forfra; det gamle innholdet blir liggende i
            // basen til del 1 er skrevet, slik at et avbrudd ikke tømmer specen.
            partIndex = 0;
            previousContent = "";
          } else {
            const done = project.generated_parts ?? (project.project_md ? 1 : 0);
            partIndex = (body.part ?? done + 1) - 1;
            previousContent = project.project_md ?? "";

            if (partIndex > 0 && !previousContent) {
              throw new Error(
                `Kan ikke fortsette på del ${partIndex + 1}: prosjektet har ingen lagret tekst. Bruk «Regenerer spec».`,
              );
            }
          }
        }

        if (partIndex < 0 || partIndex >= TOTAL_PARTS) {
          throw new Error(`Ugyldig del ${partIndex + 1} — specen har ${TOTAL_PARTS} deler`);
        }

        const formData = toFormData(project);
        const isLastPart = partIndex === TOTAL_PARTS - 1;
        console.log(
          `[stream] Del ${partIndex + 1}/${TOTAL_PARTS} start — id=${project.id} akkumulert=${previousContent.length} tegn`,
        );

        // Cloudflare/Vercel kutter en stille strøm; heartbeat holder den åpen.
        heartbeat = setInterval(() => enqueue(": heartbeat\n\n"), 10_000);

        // === 2. Generer delen ===
        let newPartContent = "";
        for await (const event of streamPart(formData, partIndex, previousContent)) {
          if (event.type === "part") {
            newPartContent = event.content;
            send({ type: "part", part: event.part, total: event.total, title: event.title, usage: event.usage });
          } else {
            send(event);
          }
        }

        if (!newPartContent.trim()) {
          throw new Error(`Del ${partIndex + 1} kom tom tilbake fra modellen`);
        }

        // === 3. Lagre ===
        const combined = previousContent ? previousContent + PART_SEPARATOR + newPartContent : newPartContent;
        const partsDone = partIndex + 1;

        if (isLastPart) {
          await updateProjectMd(project.id, combined, partsDone);
          console.log(`[stream] Siste del lagret — total ${combined.length} tegn`);

          const verify = verifyContent(combined);
          console.log(
            `[stream] Verifisering: ${verify.ok ? "OK" : "MANGLER"} — ${
              verify.checks.filter((c) => !c.ok).map((c) => c.label).join(", ") || "alt OK"
            }`,
          );
          send({ type: "verify", ok: verify.ok, checks: verify.checks });

          if (project.github_repo_url) {
            try {
              await updateProjectMdInGitHub(project.github_repo_url, combined);
              send({ type: "github_updated", url: project.github_repo_url });
            } catch (e) {
              console.error(`[stream] GitHub-push feilet: ${(e as Error).message}`);
              // Ikke fatalt: specen ER lagret. Sendes som advarsel, ikke error,
              // slik at klienten fortsetter til done og viser resultatet.
              send({ type: "warning", message: `PROJECT.md er lagret, men GitHub-push feilet: ${(e as Error).message}` });
            }
          }

          send({ type: "done", project_md: combined });
        } else {
          await savePartialMd(project.id, combined, partsDone);
          console.log(`[stream] Del ${partsDone} lagret — ${combined.length} tegn`);
          send({ type: "continue", project_id: project.id, next_part: partsDone + 1 });
        }
      } catch (e) {
        const msg = (e as Error).message;
        console.error(`[stream] FEIL: ${msg}`, e);
        send({ type: "error", message: msg });
      } finally {
        if (heartbeat) clearInterval(heartbeat);
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-cache, no-transform",
      "CDN-Cache-Control": "no-store",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Transfer-Encoding": "chunked",
    },
  });
}
