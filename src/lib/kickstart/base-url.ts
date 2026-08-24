/**
 * Hvor appen når seg selv. Bakgrunnsjobben kjeder seg videre ved å kalle sitt
 * eget worker-endepunkt, og trenger derfor en absolutt URL.
 *
 * Rekkefølgen er valgt etter hva som er mest til å stole på:
 *
 * 1. NEXT_PUBLIC_SITE_URL — eksplisitt satt, vinner alltid.
 * 2. Domenet i den innkommende forespørselen. Dette er det viktigste steget:
 *    kommer kallet fra nettleseren på kickstart.mlit.no, kaller vi oss selv på
 *    kickstart.mlit.no. Da treffer vi verken feil domene eller Vercels
 *    SSO-beskyttelse, uten at noen må huske å sette en miljøvariabel.
 * 3. Vercels egne variabler — finnes bare når «Automatically expose System
 *    Environment Variables» er på, så de kan ikke være eneste kilde.
 * 4. Lokalt.
 */
export function siteUrl(request?: { headers: Headers }): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit?.startsWith("http")) return explicit.replace(/\/$/, "");

  if (request) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host) {
      const local = /^(localhost|127\.|\[::1\])/.test(host);
      const proto = request.headers.get("x-forwarded-proto") ?? (local ? "http" : "https");
      return `${proto}://${host}`;
    }
  }

  // Produksjonsdomenet, ikke deployment-URL-en: sistnevnte kan ligge bak
  // Vercels deployment protection og svare 401 på vårt eget kall.
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
}
