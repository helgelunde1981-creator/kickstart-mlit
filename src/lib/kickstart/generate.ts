import Anthropic from "@anthropic-ai/sdk";
import { buildGenerationPrompt, getSystemPrompt } from "./standards";
import { WizardFormData, StreamEvent } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const PART_TITLES = [
  "Del 1 av 2 — Visjon, designretning, brand voice, signature moment, designsystem (CSS tokens + Tailwind), konkurrenter, anti-template-sjekkliste, kundeinfo, tech-stack, funksjonell spec + feature-deep-dives, CMS-krav",
  "Del 2 av 2 — Sider og URL-struktur, datamodell (SQL + RLS), SEO + AEO + JSON-LD, sikkerhet (CSP + RLS + secrets), GDPR, DNS, analytics, monitoring, CI/CD-flyt, komplett sprintplan (alle oppgaver eksplisitt), e-postmaler, Project Memory bootstrap, AGENTS.md, Pre-launch verify, spørsmål til kunden, risiko + suksesskriterier",
];

// Hver del er én separat HTTP-request — ingen 300s timeout-risiko
export async function* streamPart(
  data: WizardFormData,
  partIndex: number,
  previousContent: string
): AsyncGenerator<StreamEvent> {
  const systemPrompt = getSystemPrompt();
  const userPrompt = buildGenerationPrompt(data);
  const title = PART_TITLES[partIndex];

  console.log(`[kickstart] Del ${partIndex + 1}/2 starter — prosjekt="${data.project_name}"`);
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
    max_tokens: 8000,
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

  console.log(`[kickstart] Del ${partIndex + 1}/2 ferdig — ${partContent.length} tegn, ${tokenCount} delta-events`);
  yield { type: "part", part: partIndex + 1, title, content: partContent };
}
