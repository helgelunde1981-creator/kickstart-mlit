// Mockup-forhåndsvisning før byggestart — Google Gemini (gemini-2.5-flash-image,
// «Nano Banana»), krever GEMINI_API_KEY. Samme modul/mønster som LeadRadar sin
// F56-implementasjon (src/lib/integrations/gemini-image.ts) — kopiert hit
// fremfor delt pakke siden de er to separate Next.js-apper/deploys.

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

const MODEL = "gemini-2.5-flash-image";

export async function generateMockupImage(prompt: string): Promise<{ base64: string; mimeType: string }> {
  if (!isGeminiConfigured()) {
    throw new Error("GEMINI_API_KEY er ikke konfigurert");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    },
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini bilde-API feil (${res.status}): ${errText.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      finishReason?: string;
      content?: { parts?: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> };
    }>;
    promptFeedback?: { blockReason?: string };
  };

  const parts = json.candidates?.[0]?.content?.parts;
  const inlineData = parts?.find((p) => p.inlineData)?.inlineData;
  if (!inlineData) {
    const reason =
      json.promptFeedback?.blockReason ??
      json.candidates?.[0]?.finishReason ??
      parts?.find((p) => p.text)?.text?.slice(0, 200) ??
      "ukjent årsak";
    throw new Error(`Gemini returnerte ikke noe bilde (${reason})`);
  }

  return { base64: inlineData.data, mimeType: inlineData.mimeType };
}
