import { NextRequest } from "next/server";
import { streamProjectMd } from "@/lib/kickstart/generate";
import { createProject, updateProjectMd } from "@/lib/kickstart/queries";
import { WizardFormData } from "@/lib/kickstart/types";

export const runtime = "nodejs";
export const maxDuration = 300;

// SSE padding — Cloudflare buffers small chunks; >1KB initial comment forces flush
const CF_FLUSH_PADDING = ": " + "x".repeat(1024) + "\n\n";

export async function POST(req: NextRequest) {
  const body: WizardFormData = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (s: string) => controller.enqueue(encoder.encode(s));

      // Flush Cloudflare's buffer immediately with 1KB comment
      enqueue(CF_FLUSH_PADDING);

      const send = (data: object) => {
        enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      let heartbeat: ReturnType<typeof setInterval> | null = null;

      try {
        console.log(`[stream] POST — klient="${body.client_name}" tech=${body.tech_stack?.length} integrations=${body.integrations?.length ?? "undefined"}`);
        const project = await createProject(body);
        console.log(`[stream] Prosjekt opprettet id=${project.id}`);
        send({ type: "project_id", id: project.id });

        // Heartbeat every 10s keeps Cloudflare from closing idle connection between parts
        heartbeat = setInterval(() => enqueue(": heartbeat\n\n"), 10_000);

        for await (const event of streamProjectMd(body)) {
          if (event.type === "start_part") {
            send({ type: "start_part", part: event.part, title: event.title });
          } else if (event.type === "delta") {
            send({ type: "delta", text: event.text });
          } else if (event.type === "part") {
            send({ type: "part", part: event.part, title: event.title });
          } else if (event.type === "done") {
            await updateProjectMd(project.id, event.project_md);
            send({ type: "done", id: project.id });
          }
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
      // no-transform: hindrer Cloudflare fra å komprimere (gzip ville bufret alt)
      "Cache-Control": "no-store, no-cache, no-transform",
      "CDN-Cache-Control": "no-store",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Transfer-Encoding": "chunked",
    },
  });
}
