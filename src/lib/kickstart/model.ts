// Ett sted for modellvalg. Modell-ID-er er ikke noe som skal ligge spredt i
// tre filer og drive fra hverandre — se docs/adr/0002-modellvalg-og-prompt-caching.md.

/** Modellen som skriver PROJECT.md og prisestimat. Kan overstyres i Doppler. */
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-5";

/**
 * Én del av specen. Streaming, så en høy grense koster ingenting med mindre
 * modellen faktisk bruker den — men en for lav grense kutter teksten midt i en
 * setning, og da er hele delen bortkastet.
 */
export const MAX_TOKENS_PER_PART = 32_000;

/** Prompt-cachen holder standard-prompten varm gjennom hele 12-dels-løpet. */
export const CACHE_TTL = "1h" as const;

/** Retry på 429/5xx/overload — ett nettverksrykk skal ikke koste en hel del. */
export const MAX_ATTEMPTS_PER_PART = 3;
