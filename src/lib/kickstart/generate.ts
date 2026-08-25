import Anthropic from "@anthropic-ai/sdk";
import { buildGenerationPrompt, getSystemPrompt } from "./standards";
import { WizardFormData, StreamEvent } from "./types";
import {
  CACHE_TTL,
  CLAUDE_MODEL,
  MAX_ATTEMPTS_PER_PART,
  MAX_SEGMENTS_PER_PART,
  MAX_TOKENS_PER_PART,
  PART_DEADLINE_MS,
} from "./model";
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


/**
 * Modellen får ikke vite hvor lengdegrensen går, og skriver til den treffer den
 * — midt i en setning. Dette ber den om å lande delen selv.
 */
const AVSLUTT_ORDENTLIG =
  "Du har begrenset plass i dette svaret. Prioriter det viktigste, og AVSLUTT delen ordentlig " +
  "med en fullført setning — aldri midt i et ord, en tabell eller en kodeblokk.";

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
                text:
                  `Generer nå KUN ${title}. Start direkte med innholdet (# overskrift og videre).\n\n` +
                  AVSLUTT_ORDENTLIG,
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
            content:
              `Fortsett PROJECT.md. Generer nå KUN ${title}. Start direkte med innholdet — ikke gjenta noe fra delene over.\n\n` +
              AVSLUTT_ORDENTLIG,
          },
        ];

  let partContent = "";
  let usage: { cached_input_tokens: number; input_tokens: number; output_tokens: number } | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_PART; attempt++) {
    partContent = "";
    const startedAt = Date.now();

    // Egen frist, litt innenfor plattformens: avbryter vi selv, får vi en
    // feilmelding vi kan logge og lagre. Blir vi drept av Vercel, etterlater
    // det seg ingenting annet enn et livstegn som stopper.
    const deadline = new AbortController();
    const deadlineTimer = setTimeout(() => deadline.abort(), PART_DEADLINE_MS);

    try {
      // Én del skrives i inntil MAX_SEGMENTS_PER_PART segmenter. Modellen
      // treffer nemlig taket hver gang: 2026-08-24 endte hele specen midt i
      // ordet «d». Treffer den taket, ber vi den fortsette der den slapp —
      // men bare hvis det er tid igjen til å fullføre et segment til.
      let segments = 0;
      let truncated = false;

      while (true) {
        const segmentStartedAt = Date.now();
        const segmentMessages: Anthropic.MessageParam[] = partContent
          ? [
              ...messages,
              { role: "assistant", content: partContent },
              {
                role: "user",
                content:
                  "Du ble avbrutt av lengdegrensen. Fortsett nøyaktig der du slapp — " +
                  "ikke gjenta noe, ikke oppsummer, ikke start på nytt. Skriv ferdig delen.",
              },
            ]
          : messages;

        const stream = client().messages.stream(
          {
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
            messages: segmentMessages,
          },
          { signal: deadline.signal },
        );

        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            partContent += chunk.delta.text;
            yield { type: "delta", text: chunk.delta.text };
          }
        }

        const final = await stream.finalMessage();
        segments++;
        usage = {
          cached_input_tokens: (usage?.cached_input_tokens ?? 0) + (final.usage.cache_read_input_tokens ?? 0),
          input_tokens: (usage?.input_tokens ?? 0) + final.usage.input_tokens,
          output_tokens: (usage?.output_tokens ?? 0) + final.usage.output_tokens,
        };

        if (final.stop_reason !== "max_tokens") break;

        if (segments >= MAX_SEGMENTS_PER_PART) {
          truncated = true;
          console.warn(
            `[kickstart] Del ${partIndex + 1} traff taket i alle ${segments} segmenter — teksten kan være kuttet`,
          );
          break;
        }

        // Start aldri et segment vi ikke rekker å fullføre: da ville fristen
        // avbrutt oss midtveis og hele delen vært tapt.
        const segmentMs = Date.now() - segmentStartedAt;
        const remainingMs = PART_DEADLINE_MS - (Date.now() - startedAt);
        if (remainingMs < segmentMs * 1.3) {
          truncated = true;
          console.warn(
            `[kickstart] Del ${partIndex + 1} traff taket, men det er ikke tid til et segment til ` +
              `(${Math.round(remainingMs / 1000)} s igjen, forrige tok ${Math.round(segmentMs / 1000)} s)`,
          );
          break;
        }

        console.log(
          `[kickstart] Del ${partIndex + 1} traff taket etter segment ${segments} — fortsetter der den slapp`,
        );
      }

      if (!truncated && segments > 1) {
        console.log(`[kickstart] Del ${partIndex + 1} ble ferdig etter ${segments} segmenter`);
      }

      console.log(
        `[kickstart] Del ${partIndex + 1} brukte ${Math.round((Date.now() - startedAt) / 1000)} s`,
      );
      break;
    } catch (e) {
      const message = deadline.signal.aborted
        ? `Del ${partIndex + 1} rakk ikke innenfor tidsgrensen (${Math.round(PART_DEADLINE_MS / 1000)} s). Vurder lavere max_tokens eller høyere maxDuration.`
        : (e as Error).message;
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
      throw new Error(message);
    } finally {
      clearTimeout(deadlineTimer);
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
