/**
 * Hvor appen når seg selv. Bakgrunnsjobben kjeder seg videre ved å kalle sitt
 * eget worker-endepunkt, og trenger derfor en absolutt URL.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit?.startsWith("http")) return explicit.replace(/\/$/, "");

  // Produksjonsdomenet, ikke deployment-URL-en: sistnevnte kan ligge bak
  // Vercels deployment protection og svare 401 på vårt eget kall.
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
}
