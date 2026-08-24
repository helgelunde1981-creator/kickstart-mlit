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

/**
 * Vercel Cron legger på `Authorization: Bearer $CRON_SECRET` KUN hvis den
 * variabelen er satt. Er den ikke det, kommer cron-kallet uten autentisering i
 * det hele tatt — og vaktposten ville svart 401 på sin egen planlagte kjøring.
 *
 * Vercel merker sine cron-kall med denne headeren. Vi godtar den for
 * cron-ruta alene: det verste noen kan oppnå med et forfalsket kall er å
 * fremskynde arbeid som allerede ligger i kø og er betalt for — den kan verken
 * opprette jobber eller lese data.
 */
export function isVercelCron(request: Request): boolean {
  if (request.headers.get("x-vercel-cron") !== null) return true;
  // Det Vercel faktisk sender er en egen user-agent. Beholder begge: headeren
  // koster ingenting, og user-agenten er den som er observert i praksis.
  return /vercel-cron/i.test(request.headers.get("user-agent") ?? "");
}

/**
 * Hva et avvist kall hadde med seg. Uten dette blir en 401 fra cron stående som
 * et mysterium — det var nettopp slik den forrige gjetningen overlevde en
 * deploy.
 */
export function describeRejectedRequest(request: Request): string {
  const interessante = [...request.headers.keys()].filter(
    (k) => k.startsWith("x-vercel") || k === "user-agent" || k === "authorization",
  );
  const beskrivelse = interessante.map((k) =>
    k === "authorization" ? "authorization=<satt>" : `${k}=${request.headers.get(k)}`,
  );
  return beskrivelse.join(" ") || "ingen relevante headere";
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
