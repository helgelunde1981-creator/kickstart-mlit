import Anthropic from "@anthropic-ai/sdk";
import { buildGenerationPrompt, getSystemPrompt } from "./standards";
import { WizardFormData, StreamEvent } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const PART_TITLES = [
  "Del 1 av 6 — Visjon, designretning, brand voice, signature moment, designsystem (CSS tokens + Tailwind config), konkurrenter, anti-template-sjekkliste, kundeinfo",
  "Del 2 av 6 — Tech-stack (detaljert per teknologi), integrasjoner, autentisering, CMS-krav, funksjonell spec intro, komplett feature-liste",
  "Del 3 av 6 — Feature deep-dives (alle features grundig gjennomgått med UX-flyt, edge cases og implementeringsdetaljer), wireframe-beskrivelser, brukerreiser",
  "Del 4 av 6 — Sider og URL-struktur, datamodell (komplett SQL-skjema + RLS policies), API-endepunkter, komponenthierarki",
  "Del 5 av 6 — SEO + AEO + JSON-LD, sikkerhet (CSP + RLS + secrets-håndtering), GDPR, DNS-oppsett, analytics, monitoring, feilhåndtering",
  "Del 6 av 6 — CI/CD-flyt, komplett sprintplan (alle sprinter med alle oppgaver eksplisitt), e-postmaler, Project Memory bootstrap, AGENTS.md, Pre-launch verify-sjekkliste, spørsmål til kunden, risiko + suksesskriterier",
];

export const TOTAL_PARTS = PART_TITLES.length;

// Hver del er én separat HTTP-request — ingen 300s timeout-risiko
export async function* streamPart(
  data: WizardFormData,
  partIndex: number,
  previousContent: string
): AsyncGenerator<StreamEvent> {
  const systemPrompt = getSystemPrompt();
  const userPrompt = buildGenerationPrompt(data);
  const title = PART_TITLES[partIndex];

  console.log(`[kickstart] Del ${partIndex + 1}/${TOTAL_PARTS} starter — prosjekt="${data.project_name}"`);
  yield { type: "start_part", part: partIndex + 1, title };

  const messages: Anthropic.MessageParam[] =
    partIndex === 0
      ? [{ role: "user", content: userPrompt + `\n\n---\n\nGenerer nå KUN ${title}. Start direkte med innholdet (# overskrift og videre).` }]
      : [
          { role: "user", content: userPrompt },
          { role: "assistant", content: previousContent },
          { role: "user", content: `Fortsett PROJECT.md. Generer nå KUN ${title}. Start direkte med innholdet — ikke gjenta noe fra delene over.` },
        ];

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8500,
    system: systemPrompt || "Du er Senior Design-Tech Architect for Myrvoll-Lunde IT Drift. Lever 10/10-kvalitet på alt.",
    messages,
  });

  let partContent = "";
  let tokenCount = 0;
  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      partContent += chunk.delta.text;
      tokenCount++;
      yield { type: "delta", text: chunk.delta.text };
    }
  }

  console.log(`[kickstart] Del ${partIndex + 1}/${TOTAL_PARTS} ferdig — ${partContent.length} tegn, ${tokenCount} delta-events`);
  yield { type: "part", part: partIndex + 1, title, content: partContent };
}
