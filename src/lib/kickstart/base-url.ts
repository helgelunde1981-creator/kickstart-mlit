export type UrlSource = "env" | "request" | "vercel" | "fallback";

function isLocal(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(url);
}

function fromEnv(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  return explicit?.startsWith("http") ? explicit.replace(/\/$/, "") : null;
}

function fromRequest(request?: { headers: Headers }): string | null {
  if (!request) return null;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return null;
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/i.test(host);
  const proto = request.headers.get("x-forwarded-proto") ?? (local ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Hvor appen når seg selv. Bakgrunnsjobben kjeder seg videre ved å kalle sitt
 * eget worker-endepunkt, og trenger derfor en absolutt URL.
 *
 * Kilder, i prioritert rekkefølge:
 *
 * 1. NEXT_PUBLIC_SITE_URL — men se unntaket under.
 * 2. Domenet i den innkommende forespørselen. Kommer kallet fra
 *    kickstart.mlit.no, kaller vi oss selv der: riktig domene, og utenom
 *    SSO-beskyttelsen som gjelder .vercel.app-domenene.
 * 3. Vercels egne variabler — finnes bare når «Automatically expose System
 *    Environment Variables» er på, så de kan ikke være eneste kilde.
 * 4. Lokalt.
 *
 * Unntaket: en NEXT_PUBLIC_SITE_URL som peker på localhost er i et deployet
 * miljø en rest fra lokal utvikling, ikke en instruks. Da vinner domenet fra
 * forespørselen. Nettopp dette sto i produksjon og gjorde at appen forsøkte å
 * kalle seg selv på localhost:3000.
 */
export function resolveSiteUrl(request?: { headers: Headers }): { url: string; source: UrlSource } {
  const env = fromEnv();
  const req = fromRequest(request);

  if (env && !(isLocal(env) && req && !isLocal(req))) {
    return { url: env, source: "env" };
  }
  if (req) return { url: req, source: "request" };

  // Produksjonsdomenet, ikke deployment-URL-en: sistnevnte kan ligge bak
  // Vercels deployment protection og svare 401 på vårt eget kall.
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return { url: `https://${production}`, source: "vercel" };

  const deployment = process.env.VERCEL_URL;
  if (deployment) return { url: `https://${deployment}`, source: "vercel" };

  return { url: `http://127.0.0.1:${process.env.PORT ?? 3000}`, source: "fallback" };
}

export function siteUrl(request?: { headers: Headers }): string {
  return resolveSiteUrl(request).url;
}
