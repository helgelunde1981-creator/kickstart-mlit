import Anthropic from "@anthropic-ai/sdk";
import { buildGenerationPrompt, getSystemPrompt } from "./standards";
import { WizardFormData, StreamEvent } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 2 deler = maks ~2 min totalt (trygt under Vercels 300s og brukerens 2-min-ønske)
const PART_TITLES = [
  "Del 1 av 2 — Visjon, designretning, brand voice, signature moment, designsystem (CSS tokens + Tailwind), konkurrenter, anti-template-sjekkliste, kundeinfo, tech-stack, funksjonell spec + feature-deep-dives, CMS-krav",
  "Del 2 av 2 — Sider og URL-struktur, datamodell (SQL + RLS), SEO + AEO + JSON-LD, sikkerhet (CSP + RLS + secrets), GDPR, DNS, analytics, monitoring, CI/CD-flyt, komplett sprintplan (alle oppgaver eksplisitt), e-postmaler, Project Memory bootstrap, AGENTS.md, Pre-launch verify, spørsmål til kunden, risiko + suksesskriterier",
];

export async function* streamProjectMd(data: WizardFormData): AsyncGenerator<StreamEvent> {
  const systemPrompt = getSystemPrompt();
  const userPrompt = buildGenerationPrompt(data);
  const parts: string[] = [];

  console.log(`[kickstart] START generate — prosjekt="${data.project_name}" klient="${data.client_name}" retning="${data.design_direction}"`);

  for (let i = 0; i < 2; i++) {
    yield { type: "start_part", part: i + 1, title: PART_TITLES[i] };
    console.log(`[kickstart] Del ${i + 1}/2 starter — ${PART_TITLES[i].substring(0, 60)}…`);

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: userPrompt },
    ];

    if (i > 0) {
      messages.push({
        role: "assistant",
        content: parts.join("\n\n---\n\n"),
      });
      messages.push({
        role: "user",
        content: `Fortsett PROJECT.md. Generer nå KUN ${PART_TITLES[i]}. Start direkte med innholdet — ikke gjenta noe fra delene over.`,
      });
    } else {
      messages[0] = {
        role: "user",
        content: userPrompt + `\n\n---\n\nGenerer nå KUN ${PART_TITLES[i]}. Start direkte med innholdet (# overskrift og videre).`,
      };
    }

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
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

    console.log(`[kickstart] Del ${i + 1}/2 ferdig — ${partContent.length} tegn, ${tokenCount} delta-events`);
    parts.push(partContent);
    yield { type: "part", part: i + 1, title: PART_TITLES[i], content: partContent };
  }

  const project_md = parts.join("\n\n---\n\n");
  console.log(`[kickstart] DONE — total ${project_md.length} tegn`);
  yield { type: "done", project_md };
}
