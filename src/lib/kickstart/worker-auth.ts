import { safeEqual } from "@/lib/auth/session";

/**
 * Hemmeligheten appen bruker mot seg selv (worker og cron). Faller tilbake på
 * ADMIN_PASSWORD slik at bakgrunnskjøring virker uten en ny Doppler-nøkkel —
 * sett GENERATION_WORKER_SECRET når det skal kunne roteres for seg.
 */
export function workerSecret(): string {
  const secret =
    process.env.GENERATION_WORKER_SECRET || process.env.CRON_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "GENERATION_WORKER_SECRET (eller CRON_SECRET/ADMIN_PASSWORD) mangler — bakgrunnsgenerering kan ikke autentisere mot seg selv",
    );
  }
  return secret;
}

export function workerAuthHeader(): Record<string, string> {
  return { Authorization: `Bearer ${workerSecret()}` };
}

/** Vercel Cron sender CRON_SECRET som bearer-token; worker-kall sender vår egen. */
export function isTrustedWorkerRequest(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const candidates = [
    process.env.GENERATION_WORKER_SECRET,
    process.env.CRON_SECRET,
    process.env.ADMIN_PASSWORD,
  ].filter((s): s is string => Boolean(s));

  // Alle kandidater sjekkes uansett — ingen tidlig retur som lekker hvilken som traff.
  return candidates.reduce((ok, secret) => safeEqual(header, `Bearer ${secret}`) || ok, false);
}
