import fs from "fs";
import path from "path";

const STANDARDS_DIR = path.join(process.cwd(), "docs", "standards");

export function readStandardsFile(filename: string): string {
  const filePath = path.join(STANDARDS_DIR, filename);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

export function getSystemPrompt(): string {
  return readStandardsFile("00-SYSTEM_PROMPT.md");
}

export function getProjectTemplate(): string {
  return readStandardsFile("01-PROJECT_TEMPLATE.md");
}

export function getSectionDetails(): string {
  const files = [
    "02-SECTION_DETAILS.md",
    "03-QUALITY_GATES.md",
    "04-BRAND_VOICE.md",
  ];
  return files.map(f => readStandardsFile(f)).filter(Boolean).join("\n\n---\n\n");
}

export function buildGenerationPrompt(data: {
  client_name: string;
  project_name: string;
  project_type: string;
  tech_stack: string[];
  primary_color: string;
  short_description: string;
  long_description: string;
}): string {
  return `Du er en ekspert systemarkitekt hos Myrvoll-Lunde IT Drift. Generer en komplett PROJECT.md for følgende prosjekt.

## Prosjektinformasjon

- **Kunde:** ${data.client_name}
- **Prosjektnavn:** ${data.project_name}
- **Prosjekttype:** ${data.project_type}
- **Teknologier:** ${data.tech_stack.join(", ")}
- **Primærfarge:** ${data.primary_color || "Ikke spesifisert"}
- **Kort beskrivelse:** ${data.short_description}

## Detaljert beskrivelse

${data.long_description}

## Instruksjoner

Generer PROJECT.md i 5 deler som dekker:
1. Prosjektoversikt, mål og interessenter
2. Teknisk arkitektur og systemdesign
3. Datamodell og API-spesifikasjon
4. UI/UX-krav og komponentliste
5. Implementasjonsplan, testing og deploy

Følg MLIT-standardmalen nøye. Skriv på norsk.`;
}
