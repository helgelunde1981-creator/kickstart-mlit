import { NextRequest } from "next/server";
import { getProject } from "@/lib/kickstart/queries";
import { bootstrapProject } from "@/lib/kickstart/bootstrap";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const project = await getProject(id);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      if (!project) {
        send({ type: "error", message: "Prosjekt ikke funnet" });
        controller.close();
        return;
      }

      try {
        const result = await bootstrapProject(project, (msg) => send({ type: "step", message: msg }));
        send({ type: "done", result });
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
    },
  });
}
