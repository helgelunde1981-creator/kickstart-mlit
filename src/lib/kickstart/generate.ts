import Anthropic from "@anthropic-ai/sdk";
import { buildGenerationPrompt, getSystemPrompt } from "./standards";
import { WizardFormData } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PART_TITLES = [
  "Del 1: Prosjektoversikt og mål",
  "Del 2: Teknisk arkitektur",
  "Del 3: Datamodell og API",
  "Del 4: UI/UX og komponenter",
  "Del 5: Implementasjonsplan og deploy",
];

export async function* streamProjectMd(data: WizardFormData): AsyncGenerator<
  { type: "part"; part: number; title: string; content: string } | { type: "done"; project_md: string }
> {
  const systemPrompt = getSystemPrompt();
  const userPrompt = buildGenerationPrompt(data);
  const parts: string[] = [];

  for (let i = 0; i < 5; i++) {
    const partPrompt = i === 0
      ? userPrompt + `\n\nGenerer nå KUN ${PART_TITLES[i]}. Start direkte med innholdet.`
      : `Generer nå KUN ${PART_TITLES[i]} for prosjektet. Fortsett fra de forrige delene.`;

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: userPrompt },
    ];

    if (i > 0) {
      messages.push({ role: "assistant", content: parts.slice(0, i).join("\n\n") });
      messages.push({ role: "user", content: `Generer nå KUN ${PART_TITLES[i]}. Start direkte med innholdet.` });
    } else {
      messages[0] = { role: "user", content: partPrompt };
    }

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 16384,
      system: systemPrompt || "Du er en ekspert systemarkitekt hos Myrvoll-Lunde IT Drift.",
      messages,
      betas: ["output-128k-2025-02-19"],
    } as Parameters<typeof client.messages.stream>[0]);

    let partContent = "";
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        partContent += chunk.delta.text;
      }
    }

    parts.push(partContent);
    yield { type: "part", part: i + 1, title: PART_TITLES[i], content: partContent };
  }

  const project_md = parts.join("\n\n---\n\n");
  yield { type: "done", project_md };
}
