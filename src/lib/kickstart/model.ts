// Ett sted for modellvalg. Modell-ID-er er ikke noe som skal ligge spredt i
// tre filer og drive fra hverandre — se docs/adr/0002-modellvalg-og-prompt-caching.md.

/** Modellen som skriver PROJECT.md og prisestimat. Kan overstyres i Doppler. */
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-5";

/**
 * Én del av specen. Streaming, så en høy grense koster ingenting med mindre
 * modellen faktisk bruker den — men en for lav grense kutter teksten midt i en
 * setning, og da er hele delen bortkastet.
 *
 * Satt ned fra 32 000 etter at del 1 ble drept av tidsgrensen i produksjon:
 * tokens tar tid, og en del som ikke rekker å bli ferdig er verdt null.
 * 20 000 er fortsatt godt over det dobbelte av den gamle grensen på 8 500.
 */
export const MAX_TOKENS_PER_PART = 20_000;

/**
 * Hvor lenge én invokasjon får lov å leve. Vercel dreper funksjonen når denne
 * er nådd — og dør vi midt i en del, er hele delen tapt.
 */
export const FUNCTION_MAX_DURATION_SECONDS = 800;

/**
 * Vår egen frist per del, med margin til plattformens. Poenget er å avbryte
 * SELV, med en forklaring vi kan logge og lagre, framfor å bli drept uten spor.
 * Da står det «rakk ikke tidsgrensen» i last_error i stedet for at jobben bare
 * slutter å puste.
 */
export const PART_DEADLINE_MS = (FUNCTION_MAX_DURATION_SECONDS - 60) * 1000;

/** Prompt-cachen holder standard-prompten varm gjennom hele 12-dels-løpet. */
export const CACHE_TTL = "1h" as const;

/** Retry på 429/5xx/overload — ett nettverksrykk skal ikke koste en hel del. */
export const MAX_ATTEMPTS_PER_PART = 3;
