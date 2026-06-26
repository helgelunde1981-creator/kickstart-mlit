import { NextRequest } from "next/server";
import { streamPart } from "@/lib/kickstart/generate";
import { createProject, updateProjectMd, savePartialMd, getProject } from "@/lib/kickstart/queries";
import { WizardFormData, KickstartProject } from "@/lib/kickstart/types";

export const runtime = "nodejs";
export const maxDuration = 300;

// SSE padding — Cloudflare buffers small chunks; >1KB initial comment forces flush
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

export async function POST(req: NextRequest) {
  const body: WizardFormData & { project_id?: string } = await req.json();
  // Del 2: har project_id men ikke client_name (form-data)
  const isPart2 = !!body.project_id && !body.client_name;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (s: string) => controller.enqueue(encoder.encode(s));
      enqueue(CF_FLUSH_PADDING);
      const send = (data: object) => enqueue(`data: ${JSON.stringify(data)}\n\n`);
      let heartbeat: ReturnType<typeof setInterval> | null = null;

      try {
        if (isPart2) {
          // === DEL 2 — fortsettelse av eksisterende prosjekt ===
          const project = await getProject(body.project_id!);
          if (!project) throw new Error(`Prosjekt ${body.project_id} ikke funnet`);
          const formData = toFormData(project);
          const part1Content = project.project_md ?? "";
          console.log(`[stream] Del 2 start — id=${project.id} part1=${part1Content.length} tegn`);

          heartbeat = setInterval(() => enqueue(": heartbeat\n\n"), 10_000);

          let part2Content = "";
          for await (const event of streamPart(formData, 1, part1Content)) {
            if (event.type === "start_part") {
              send({ type: "start_part", part: event.part, title: event.title });
            } else if (event.type === "delta") {
              send({ type: "delta", text: event.text });
            } else if (event.type === "part") {
              part2Content = event.content;
            }
          }

          const fullMd = part1Content + "\n\n---\n\n" + part2Content;
          await updateProjectMd(project.id, fullMd);
          console.log(`[stream] Del 2 ferdig og lagret — total ${fullMd.length} tegn`);
          send({ type: "done", project_md: fullMd });

        } else {
          // === DEL 1 — nytt prosjekt ===
          const formData = body as WizardFormData;
          console.log(`[stream] Del 1 start — klient="${formData.client_name}" tech=${formData.tech_stack?.length} integrations=${formData.integrations?.length ?? "undefined"}`);
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

          // Lagre Del 1 med en gang — Del 2 starter i ny request
          await savePartialMd(project.id, part1Content);
          console.log(`[stream] Del 1 ferdig og lagret — ${part1Content.length} tegn`);
          send({ type: "continue", project_id: project.id });
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
