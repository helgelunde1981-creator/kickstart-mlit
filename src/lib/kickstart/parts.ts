// Ren data — ingen server-avhengigheter. Ligger for seg selv fordi
// klientkomponentene trenger titlene, og generate.ts drar med seg Anthropic-SDK
// og filsystem.

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
