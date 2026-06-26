import { NextRequest } from "next/server";
import { streamPart, TOTAL_PARTS } from "@/lib/kickstart/generate";
import { createProject, updateProjectMd, savePartialMd, getProject } from "@/lib/kickstart/queries";
import { updateProjectMdInGitHub } from "@/lib/kickstart/bootstrap/github";
import { WizardFormData, KickstartProject, VerifyCheck } from "@/lib/kickstart/types";

export const runtime = "nodejs";
export const maxDuration = 300;

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

function verifyContent(md: string): { ok: boolean; checks: VerifyCheck[] } {
  const checks: VerifyCheck[] = [
    { label: "Del 1 fullført (>15 000 tegn)",  ok: md.length > 15_000 },
    { label: "Del 2 til stede (>30 000 tegn)", ok: md.length > 30_000 },
    { label: "Sprintplan",                     ok: /sprint[\s-]?plan|sprintplan|sprint\s+\d/i.test(md) },
    { label: "SQL / datamodell",               ok: /CREATE TABLE|datamodell|SQL|schema/i.test(md) },
    { label: "SEO / AEO",                      ok: /SEO|AEO|JSON-LD|meta.{0,20}description/i.test(md) },
    { label: "AGENTS.md",                      ok: /AGENTS/i.test(md) },
    { label: "Pre-launch sjekkliste",          ok: /pre.launch|prelaunch|launch/i.test(md) },
  ];
  return { ok: checks.every(c => c.ok), checks };
}

export async function POST(req: NextRequest) {
  const body: WizardFormData & { project_id?: string; regenerate?: boolean; part?: number } = await req.json();

  // Tre moduser:
  // 1. Nytt prosjekt Del 1: ingen project_id
  // 2. Regenerer Del 1: project_id + regenerate: true
  // 3. Fortsettelse Del N: project_id + part (2..TOTAL_PARTS)
  const isNewPart1   = !body.project_id;
  const isRegenPart1 = !!body.project_id && body.regenerate === true;
  const isContinuation = !!body.project_id && !body.regenerate;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (s: string) => controller.enqueue(encoder.encode(s));
      enqueue(CF_FLUSH_PADDING);
      const send = (data: object) => enqueue(`data: ${JSON.stringify(data)}\n\n`);
      let heartbeat: ReturnType<typeof setInterval> | null = null;

      try {
        if (isContinuation) {
          // === FORTSETTELSE DEL N (2..TOTAL_PARTS) ===
          const partIndex = (body.part ?? 2) - 1; // 0-indeksert
          const isLastPart = partIndex === TOTAL_PARTS - 1;

          const project = await getProject(body.project_id!);
          if (!project) throw new Error(`Prosjekt ${body.project_id} ikke funnet`);
          const formData = toFormData(project);
          const previousContent = project.project_md ?? "";
          console.log(`[stream] Del ${partIndex + 1}/${TOTAL_PARTS} start — id=${project.id} akkumulert=${previousContent.length} tegn`);

          heartbeat = setInterval(() => enqueue(": heartbeat\n\n"), 10_000);

          let newPartContent = "";
          for await (const event of streamPart(formData, partIndex, previousContent)) {
            if (event.type === "start_part") {
              send({ type: "start_part", part: event.part, title: event.title });
            } else if (event.type === "delta") {
              send({ type: "delta", text: event.text });
            } else if (event.type === "part") {
              newPartContent = event.content;
            }
          }

          const combined = previousContent + "\n\n---\n\n" + newPartContent;

          if (isLastPart) {
            // Siste del: lagre ferdig, verifiser, push til GitHub
            await updateProjectMd(project.id, combined);
            console.log(`[stream] Del ${partIndex + 1}/${TOTAL_PARTS} (SISTE) lagret — total ${combined.length} tegn`);

            const verify = verifyContent(combined);
            console.log(`[stream] Verifisering: ${verify.ok ? "OK" : "FEIL"} — ${verify.checks.filter(c => !c.ok).map(c => c.label).join(", ") || "alt OK"}`);
            send({ type: "verify", ok: verify.ok, checks: verify.checks });

            if (project.github_repo_url) {
              try {
                await updateProjectMdInGitHub(project.github_repo_url, combined);
                console.log(`[stream] GitHub oppdatert: ${project.github_repo_url}`);
                send({ type: "github_updated", url: project.github_repo_url } as object);
              } catch (e) {
                console.error(`[stream] GitHub-push feilet: ${(e as Error).message}`);
              }
            }

            send({ type: "done", project_md: combined });
          } else {
            // Mellomliggende del: lagre delvis, start neste
            await savePartialMd(project.id, combined);
            console.log(`[stream] Del ${partIndex + 1}/${TOTAL_PARTS} lagret — ${combined.length} tegn, starter del ${partIndex + 2}`);
            send({ type: "continue", project_id: project.id, next_part: partIndex + 2 });
          }

        } else if (isRegenPart1) {
          // === REGENERER DEL 1 (eksisterende prosjekt) ===
          const project = await getProject(body.project_id!);
          if (!project) throw new Error(`Prosjekt ${body.project_id} ikke funnet`);
          const formData = toFormData(project);
          console.log(`[stream] Regen Del 1 start — id=${project.id}`);

          heartbeat = setInterval(() => enqueue(": heartbeat\n\n"), 10_000);

          let part1Content = "";
          for await (const event of streamPart(formData, 0, "")) {
            if (event.type === "start_part") {
              send({ type: "start_part", part: event.part, title: event.title });
            } else if (event.type === "delta") {
              send({ type: "delta", text: event.text });
            } else if (event.type === "part") {
              part1Content = event.content;
            }
          }

          await savePartialMd(project.id, part1Content);
          console.log(`[stream] Regen Del 1 lagret — ${part1Content.length} tegn`);
          send({ type: "continue", project_id: project.id, next_part: 2 });

        } else if (isNewPart1) {
          // === NYTT PROSJEKT DEL 1 ===
          const formData = body as WizardFormData;
          console.log(`[stream] Nytt prosjekt Del 1 — klient="${formData.client_name}"`);
          const project = await createProject(formData);
          console.log(`[stream] Prosjekt opprettet id=${project.id}`);
          send({ type: "project_id", id: project.id });

          heartbeat = setInterval(() => enqueue(": heartbeat\n\n"), 10_000);

          let part1Content = "";
          for await (const event of streamPart(formData, 0, "")) {
            if (event.type === "start_part") {
              send({ type: "start_part", part: event.part, title: event.title });
            } else if (event.type === "delta") {
              send({ type: "delta", text: event.text });
            } else if (event.type === "part") {
              part1Content = event.content;
            }
          }

          await savePartialMd(project.id, part1Content);
          console.log(`[stream] Del 1 lagret — ${part1Content.length} tegn`);
          send({ type: "continue", project_id: project.id, next_part: 2 });
        }

      } catch (e) {
        const msg = (e as Error).message;
        console.error(`[stream] FEIL: ${msg}`, e);
        send({ type: "error", message: msg });
      } finally {
        if (heartbeat) clearInterval(heartbeat);
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
