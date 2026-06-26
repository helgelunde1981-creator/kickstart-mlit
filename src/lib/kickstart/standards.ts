import fs from "fs";
import path from "path";
import { WizardFormData } from "./types";
import { DESIGN_DIRECTIONS, PROJECT_TYPES, MOTION_OPTIONS, AUTH_OPTIONS, TECH_OPTIONS, INTEGRATION_OPTIONS } from "./tech-options";

const STANDARDS_DIR = path.join(process.cwd(), "docs", "standards");

function readStandardsFile(filename: string): string {
  const filePath = path.join(STANDARDS_DIR, filename);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

export function getSystemPrompt(): string {
  return readStandardsFile("00-SYSTEM_PROMPT.md");
}

function label(id: string, options: { id: string; label: string }[]): string {
  return options.find(o => o.id === id)?.label ?? id;
}

export function buildGenerationPrompt(data: WizardFormData): string {
  const direction = DESIGN_DIRECTIONS.find(d => d.id === data.design_direction);
  const specTemplate = readStandardsFile("01-SPEC_TEMPLATE.md");
  const designGuide  = readStandardsFile("02-DESIGN_DIRECTIONS.md");
  const techCanon    = readStandardsFile("03-TECH_STACK_CANON.md");
  const qualityGates = readStandardsFile("04-QUALITY_GATES.md");
  const brandVoice   = readStandardsFile("05-BRAND_VOICE.md");

  const techLabels = data.tech_stack.map(id => label(id, TECH_OPTIONS)).join(", ");
  const integrationLabels = data.integrations.length
    ? data.integrations.map(id => label(id, INTEGRATION_OPTIONS)).join(", ")
    : "Ingen ekstra integrasjoner";
  const motionLabel  = label(data.motion_preference, MOTION_OPTIONS);
  const authLabel    = label(data.auth_type, AUTH_OPTIONS);
  const projectTypeLabel = label(data.project_type, PROJECT_TYPES);

  return `# Prosjektdata — fyll inn PROJECT.md basert på dette

## Kunde og prosjekt
- **Kunde:** ${data.client_name}
- **Prosjektnavn:** ${data.project_name}
- **Kontaktperson:** ${data.contact_person || "Ikke oppgitt"}
- **Nytt domene:** ${data.new_domain || "Ikke besluttet ennå"}
- **Eksisterende nettsted (migrering):** ${data.existing_url || "Ingen"}
- **Scrape eksisterende innhold:** ${data.requires_scrape ? "Ja — følg scrape-pipeline-regelen (regel #27)" : "Nei"}

## Prosjekttype og omfang
- **Type:** ${projectTypeLabel}
- **Autentisering:** ${authLabel}
- **Estimert sprinter:** ${data.sprint_estimate}
- **Kort beskrivelse:** ${data.short_description}

## Detaljert beskrivelse
${data.long_description}

## Ønskede features og krav
${data.features || "Se beskrivelse over — ingen eksplisitt feature-liste oppgitt. Still spørsmål i §18 Spørsmål til kunden."}

## Tech-stack
- **Primærteknologier:** ${techLabels}
- **Integrasjoner:** ${integrationLabels}

## Designretning
- **Valgt retning:** ${direction?.label ?? data.design_direction} (${data.design_direction})
- **Primærfarge:** ${data.primary_color || "#3B82F6"}
- **Sekundærfarge:** ${data.secondary_color || "Avled fra primærfarge"}
- **Bevegelse/motion:** ${motionLabel}

## Ekstra notater fra Helge
${data.extra_notes || "Ingen ekstra notater."}

---

# Standarder og maler du skal følge

Disse filene definerer EKSAKT hva du skal levere. Les dem nøye:

## Spec-template (følg denne strukturen slavisk)

${specTemplate || "MERK: 01-SPEC_TEMPLATE.md ikke funnet i docs/standards/ — bruk 20-seksjon-strukturen fra system-prompt."}

---

## Designretninger (02-DESIGN_DIRECTIONS.md)

${designGuide || "Se system-prompt for designretnings-beskrivelser."}

---

## Tech Stack Canon (03-TECH_STACK_CANON.md)

${techCanon || "Bruk default-stacken fra system-prompt."}

---

## Quality Gates — 10/10-definisjon (04-QUALITY_GATES.md)

${qualityGates || "Se quality-gates i system-prompt."}

---

## Brand Voice (05-BRAND_VOICE.md)

${brandVoice || "Se brand-voice-regler i system-prompt."}

---

# Instruksjon

Du er nå klar til å generere PROJECT.md for **${data.client_name} — ${data.project_name}**.

Følg spec-malen over eksakt (alle 20+ seksjoner). Fyll ut ALLE {{placeholder}}-verdier med ekte data fra prosjektdataene over. Ingen «TBD», ingen «[...]», ingen «osv.».

Designretning er **${direction?.label ?? data.design_direction}** — bruk tokens, typografi og signature moves fra denne retningen.

Skriv på norsk bokmål. Lever 10/10-kvalitet.`;
}
