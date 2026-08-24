import { NextRequest } from "next/server";
import { getProject, saveMockupImages } from "@/lib/kickstart/queries";
import { generateMockupImage, isGeminiConfigured } from "@/lib/kickstart/gemini-image";
import { buildMockupPrompts } from "@/lib/kickstart/mockup-scenes";

export const runtime = "nodejs";
// Opptil 10 sekvensielle Gemini-bildekall — matcher samme 300s-forsiktighet
// som resten av kickstart etter FUNCTION_INVOCATION_TIMEOUT-funnet 2026-07-20
// på /api/leadradar-handoff (undervurderte tidligere hvor lenge AI-generering
// faktisk tar, anta ALDRI at et lite antall sekunder holder).
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { id, count } = (await req.json()) as { id?: string; count?: number };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      if (!id) {
        send({ type: "error", message: "id er påkrevd" });
        controller.close();
        return;
      }
      if (!isGeminiConfigured()) {
        send({ type: "error", message: "GEMINI_API_KEY er ikke konfigurert" });
        controller.close();
        return;
      }

      const project = await getProject(id);
      if (!project) {
        send({ type: "error", message: "Prosjekt ikke funnet" });
        controller.close();
        return;
      }
      if (!project.project_md) {
        send({ type: "error", message: "Generer PROJECT.md først" });
        controller.close();
        return;
      }

      const prompts = buildMockupPrompts(project, count ?? 6);
      const images: string[] = [];

      for (let i = 0; i < prompts.length; i++) {
        send({ type: "progress", index: i + 1, total: prompts.length });
        try {
          const { base64, mimeType } = await generateMockupImage(prompts[i]!);
          const dataUrl = `data:${mimeType};base64,${base64}`;
          images.push(dataUrl);
          send({ type: "image", index: i + 1, total: prompts.length, dataUrl });

          // Lagre etter hvert bilde: lukkes fanen midt i, beholder vi det som
          // faktisk er generert i stedet for å kaste hele runden.
          await saveMockupImages(project.id, images);
        } catch (e) {
          send({ type: "image_error", index: i + 1, total: prompts.length, message: (e as Error).message });
        }
      }

      if (images.length === 0) {
        send({ type: "error", message: "Ingen bilder ble generert" });
        controller.close();
        return;
      }

      send({ type: "done", images });
      controller.close();
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
