import { KickstartProject } from "./types";
import { DESIGN_DIRECTIONS } from "./tech-options";

// Forhåndsvisnings-bilder før byggestart ("er dette retningen jeg vil?") —
// Helges eksplisitte ønske 2026-07-20: 4-10 bilder, web-prosjekter skal vise
// web-skjermer, app-prosjekter skal vise app-skjermer, IKKE samme hero gjentatt
// N ganger. Hvert scene-navn er en distinkt skjerm/side, ikke en variasjon av
// forsiden — gir faktisk spredning å vurdere retningen ut fra.
const WEB_SCENES = [
  "forsiden med hero-seksjon og hovedbudskap",
  "en oversiktsside over tjenester/produkter/tilbud",
  "en detaljside for én konkret tjeneste/produkt/artikkel",
  "en om-oss-side med historie og team",
  "en kontakt-/lokasjonsside med skjema og kart",
  "en nyhets-/blogg-oversikt med flere artikkel-kort",
  "en påmeldings-/bestillings-/kontaktskjema-seksjon i bruk",
  "en footer-seksjon med lenker, kontaktinfo og sosiale medier",
  "en mobilvisning (responsiv) av forsiden",
  "en prissside eller sammenligningstabell",
];

const APP_SCENES = [
  "hjem-/dashboard-skjermen rett etter innlogging",
  "en hovedliste (produkter/artikler/kamper/tjenester, avhengig av hva appen faktisk handler om)",
  "en detaljvisning av ett element fra listen",
  "en handlekurv-/bestillings-/påmeldingsskjerm",
  "en profil-/min side-skjerm med brukerinfo",
  "en varsler-/nyhetsfeed-skjerm",
  "en innstillinger-skjerm",
  "en søk-/filter-skjerm",
  "en onboarding-/velkomstskjerm",
  "bunn-navigasjonen synlig i bruk på en av hovedskjermene",
];

function isAppProject(project: KickstartProject): boolean {
  return project.project_type === "mobile";
}

export function buildMockupPrompts(project: KickstartProject, count: number): string[] {
  const n = Math.max(4, Math.min(10, count));
  const app = isAppProject(project);
  const scenes = (app ? APP_SCENES : WEB_SCENES).slice(0, n);

  const direction = DESIGN_DIRECTIONS.find((d) => d.id === project.design_direction);
  const directionText = direction
    ? `Designretning: "${direction.label}" — ${direction.description} Signaturtrekk: ${direction.signature}.`
    : "";
  const colorText = `Bruk EKSAKT fargen ${project.primary_color || "#3B82F6"} som primærfarge${
    project.secondary_color ? ` og ${project.secondary_color} som sekundær-/aksentfarge` : ""
  } — ikke velg andre farger.`;

  const context = `Kunde: ${project.client_name}. Prosjekt: ${project.short_description ?? project.project_name}.
${(project.features ?? "").slice(0, 600)}
${directionText}
${colorText}`.trim();

  return scenes.map((scene) => {
    const subject = app
      ? `Lag et konsept-mockup av ÉN skjerm i en moderne mobilapp: ${scene}.`
      : `Lag et konsept-mockup av ÉN side på en moderne, profesjonell nettside: ${scene}.`;
    return `${subject}\n\n${context}\n\nRealistisk skjermdump (${app ? "telefon-ramme" : "nettleser-ramme"}), rent moderne design med god kontrast, ekte-følende innhold tilpasset AKKURAT dette prosjektet (bruk konkrete navn/tekster der det er mulig, ikke generiske plassholdere som "Lorem ipsum"). Ikke bruk ekte logoer eller varemerker — bruk kun kundenavnet som tekst.`;
  });
}
