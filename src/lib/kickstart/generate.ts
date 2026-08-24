import Anthropic from "@anthropic-ai/sdk";
import { buildGenerationPrompt, getSystemPrompt } from "./standards";
import { WizardFormData, StreamEvent } from "./types";
import { CACHE_TTL, CLAUDE_MODEL, MAX_ATTEMPTS_PER_PART, MAX_TOKENS_PER_PART } from "./model";
import { PART_TITLES, TOTAL_PARTS } from "./parts";

let cachedClient: Anthropic | null = null;

function client(): Anthropic {
  if (!cachedClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY mangler — kjør via Doppler (se AGENTS.md)");
    }
    cachedClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cachedClient;
}

export { PART_TITLES, TOTAL_PARTS } from "./parts";


const FALLBACK_SYSTEM_PROMPT =
  "Du er Senior Design-Tech Architect for Myrvoll-Lunde IT Drift. Lever 10/10-kvalitet på alt.";

function isRetryable(error: unknown): boolean {
  if (error instanceof Anthropic.RateLimitError) return true;
  if (error instanceof Anthropic.APIConnectionError) return true;
  if (error instanceof Anthropic.APIError) return (error.status ?? 0) >= 500;
  return false;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Hver del er én separat HTTP-request — ingen 300s timeout-risiko
export async function* streamPart(
  data: WizardFormData,
  partIndex: number,
  previousContent: string
): AsyncGenerator<StreamEvent> {
  const systemPrompt = getSystemPrompt() || FALLBACK_SYSTEM_PROMPT;
  const userPrompt = buildGenerationPrompt(data);
  const title = PART_TITLES[partIndex];

  console.log(
    `[kickstart] Del ${partIndex + 1}/${TOTAL_PARTS} starter — prosjekt="${data.project_name}" modell=${CLAUDE_MODEL}`,
  );
  yield { type: "start_part", part: partIndex + 1, total: TOTAL_PARTS, title };

  // Prompt caching: standardene (~40 000 tokens) og alt som allerede er skrevet
  // sendes på nytt for hver av de 12 delene. Uten cache betaler vi full pris
  // 12 ganger; med cache_control leses det samme prefikset for ~10 %.
  // Rekkefølgen system → messages er cache-prefikset — endres noe tidlig i det,
  // ryker resten av cachen.
  const messages: Anthropic.MessageParam[] =
    partIndex === 0
      ? [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt,
                cache_control: { type: "ephemeral", ttl: CACHE_TTL },
              },
              {
                type: "text",
                text: `Generer nå KUN ${title}. Start direkte med innholdet (# overskrift og videre).`,
              },
            ],
          },
        ]
      : [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt,
                cache_control: { type: "ephemeral", ttl: CACHE_TTL },
              },
            ],
          },
          // Bevisst UTEN cache_control: teksten vokser for hver del, så et
          // brytepunkt her ville blitt skrevet til cachen (1,25x) uten noen
          // gang å bli truffet. Se docs/ROADMAP.md for hvordan det kan gjøres
          // inkrementelt hvis delene lagres hver for seg.
          { role: "assistant", content: previousContent },
          {
            role: "user",
            content: `Fortsett PROJECT.md. Generer nå KUN ${title}. Start direkte med innholdet — ikke gjenta noe fra delene over.`,
          },
        ];

  let partContent = "";
  let usage: { cached_input_tokens: number; input_tokens: number; output_tokens: number } | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_PART; attempt++) {
    partContent = "";
    try {
      const stream = client().messages.stream({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS_PER_PART,
        output_config: { effort: "high" },
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral", ttl: CACHE_TTL },
          },
        ],
        messages,
      });

      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          partContent += chunk.delta.text;
          yield { type: "delta", text: chunk.delta.text };
        }
      }

      const final = await stream.finalMessage();
      usage = {
        cached_input_tokens: final.usage.cache_read_input_tokens ?? 0,
        input_tokens: final.usage.input_tokens,
        output_tokens: final.usage.output_tokens,
      };
      if (final.stop_reason === "max_tokens") {
        console.warn(
          `[kickstart] Del ${partIndex + 1} traff max_tokens (${MAX_TOKENS_PER_PART}) — teksten kan være kuttet`,
        );
      }
      break;
    } catch (e) {
      const message = (e as Error).message;
      if (attempt < MAX_ATTEMPTS_PER_PART && isRetryable(e)) {
        const waitMs = 2000 * 2 ** (attempt - 1);
        console.warn(
          `[kickstart] Del ${partIndex + 1} forsøk ${attempt}/${MAX_ATTEMPTS_PER_PART} feilet (${message}) — prøver igjen om ${waitMs} ms`,
        );
        // Delvis tekst fra forsøket kastes: neste forsøk starter delen på nytt.
        // UI-et må få vite det, ellers står halve teksten igjen på skjermen.
        yield { type: "restart_part", part: partIndex + 1, attempt: attempt + 1, reason: message };
        await sleep(waitMs);
        continue;
      }
      throw e;
    }
  }

  console.log(
    `[kickstart] Del ${partIndex + 1}/${TOTAL_PARTS} ferdig — ${partContent.length} tegn` +
      (usage
        ? `, ${usage.output_tokens} output-tokens, ${usage.cached_input_tokens} fra cache`
        : ""),
  );
  yield { type: "part", part: partIndex + 1, total: TOTAL_PARTS, title, content: partContent, usage };
}
