// Signert admin-sesjon. Kjører både i proxy.ts (Edge-runtime) og i API-ruter
// (Node), derfor WebCrypto og ikke node:crypto.
//
// Bakgrunn: cookien var tidligere den faste strengen "authenticated" — hvem som
// helst kunne sette den i devtools og komme rett inn i admin. Nå er verdien
// `<utstedt-ms>.<hmac>` signert med en nøkkel som aldri forlater serveren.

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dager

const encoder = new TextEncoder();

/**
 * Nøkkelen hentes fra ADMIN_SESSION_SECRET. Er den ikke satt, avledes den fra
 * ADMIN_PASSWORD slik at oppsettet fungerer uten en ny hemmelighet i Doppler —
 * konsekvensen er at alle sesjoner invalideres når passordet byttes.
 */
function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!value) {
    throw new Error(
      "ADMIN_SESSION_SECRET (eller ADMIN_PASSWORD) mangler — kan ikke signere admin-sesjon",
    );
  }
  return value;
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Konstant-tid-sammenligning — unngår at responstiden lekker hvor mange tegn som stemte. */
export function safeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  // Lengden i seg selv er ikke hemmelig; innholdet er.
  let diff = aBytes.length ^ bBytes.length;
  const len = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export async function createSessionToken(now = Date.now()): Promise<string> {
  const issuedAt = String(now);
  return `${issuedAt}.${await hmac(issuedAt)}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const issuedAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!/^\d+$/.test(issuedAt)) return false;

  const ageSeconds = (now - Number(issuedAt)) / 1000;
  if (ageSeconds < 0 || ageSeconds > SESSION_MAX_AGE_SECONDS) return false;

  try {
    return safeEqual(signature, await hmac(issuedAt));
  } catch {
    return false;
  }
}
