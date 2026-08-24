import Anthropic from "@anthropic-ai/sdk";
import { buildGenerationPrompt, getSystemPrompt } from "./standards";
import { WizardFormData, StreamEvent } from "./types";
import { CACHE_TTL, CLAUDE_MODEL, MAX_ATTEMPTS_PER_PART, MAX_TOKENS_PER_PART } from "./model";

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

export const PART_TITLES = [
  "Del 1 av 12 — Visjon, designretning, brand voice, signature moment, designsystem (CSS tokens + Tailwind config), konkurrenter, anti-template-sjekkliste, kundeinfo",
  "Del 2 av 12 — Tech-stack (detaljert per teknologi med versjon, begrunnelse og konfig-eksempler), integrasjoner, autentisering (flows + JWT-håndtering)",
  "Del 3 av 12 — CMS-krav, innholdsmodell, funksjonell spec intro, komplett feature-liste (alle features listet med prioritet og avhengigheter)",
  "Del 4 av 12 — Feature deep-dives del A: de viktigste features grundig gjennomgått med UX-flyt, happy path, edge cases og feilscenarioer",
  "Del 5 av 12 — Feature deep-dives del B: resterende features + wireframe-beskrivelser for alle nøkkelskjermer + komplette brukerreiser",
  "Del 6 av 12 — Sider og URL-struktur (komplett sitemap med metadata), datamodell del A (alle tabeller med kolonner, typer og constraints)",
  "Del 7 av 12 — Datamodell del B (RLS policies for alle tabeller), API-endepunkter (alle ruter med request/response-skjema), komponenthierarki",
  "Del 8 av 12 — SEO (meta-tags, Open Graph, sitemap.xml, robots.txt), AEO (JSON-LD schemas per sidetype), Core Web Vitals-strategi",
  "Del 9 av 12 — Sikkerhet (CSP-headers, rate limiting, input-validering, OWASP-sjekkliste), GDPR (cookies, personvernserklæring, databehandleravtale), DNS-oppsett",
  "Del 10 av 12 — Analytics (events, funnels, KPIer), monitoring (Sentry, uptime, alerting), feilhåndtering (error boundaries, retry-logikk), CI/CD-flyt (GitHub Actions, preview deploys, produksjonsdeploy)",
  "Del 11 av 12 — Komplett sprintplan: alle sprinter med alle oppgaver eksplisitt listet, estimater, avhengigheter og definition of done per sprint",
  "Del 12 av 12 — E-postmaler (alle transaksjons-e-poster med HTML og tekst), Project Memory bootstrap, AGENTS.md, Pre-launch verify-sjekkliste, spørsmål til kunden, risiko + suksesskriterier",
];

export const TOTAL_PARTS = PART_TITLES.length;

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
