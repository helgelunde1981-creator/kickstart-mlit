import { NextRequest } from "next/server";
import { streamProjectMd } from "@/lib/kickstart/generate";
import { createProject, updateProjectMd } from "@/lib/kickstart/queries";
import { WizardFormData } from "@/lib/kickstart/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body: WizardFormData = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const project = await createProject(body);
        send({ type: "project_id", id: project.id });

        let fullMd = "";
        for await (const event of streamProjectMd(body)) {
          if (event.type === "start_part") {
            send({ type: "start_part", part: event.part, title: event.title });
          } else if (event.type === "delta") {
            send({ type: "delta", text: event.text });
          } else if (event.type === "part") {
            fullMd += (fullMd ? "\n\n---\n\n" : "") + event.content;
            send({ type: "part", part: event.part, title: event.title });
          } else if (event.type === "done") {
            await updateProjectMd(project.id, event.project_md);
            send({ type: "done", id: project.id });
          }
        }
      } catch (e) {
        send({ type: "error", message: (e as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
