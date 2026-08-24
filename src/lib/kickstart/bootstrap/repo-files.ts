import { KickstartProject } from "../types";
import { DESIGN_DIRECTIONS, PROJECT_TYPES, TECH_OPTIONS } from "../tech-options";

function label(id: string | null, options: { id: string; label: string }[]): string {
  if (!id) return "–";
  return options.find((o) => o.id === id)?.label ?? id;
}

/**
 * AGENTS.md i kundeprosjektet. Den fulle AI-kontrakten står i PROJECT.md §23 —
 * denne filen er inngangsdøren som sørger for at neste økt leser den.
 */
export function buildAgentsMd(project: KickstartProject): string {
  const stack = (project.tech_stack ?? []).map((t) => label(t, TECH_OPTIONS)).join(", ");
  return `# AGENTS.md — ${project.project_name}

Generert av kickstart-mlit ved prosjektoppstart. Den fullstendige AI-kontrakten
står i \`PROJECT.md\` (§23 AGENTS.md). Denne filen er kortversjonen.

## Prosjektet

- **Kunde:** ${project.client_name}
- **Type:** ${label(project.project_type, PROJECT_TYPES)}
- **Designretning:** ${label(project.design_direction, DESIGN_DIRECTIONS)}
- **Stack:** ${stack || "se PROJECT.md §8"}

## Regler

1. **Les \`PROJECT.md\` før du skriver kode.** Den er fasiten for scope, design,
   datamodell og sprintplan. Er noe uklart der, spør — ikke gjett.
2. **Designsystemet er tokens, ikke tilfeldige verdier.** Farger, spacing og
   typografi hentes fra tokens definert i PROJECT.md §9.
3. **Ingen hemmeligheter i repoet.** Verdier settes i Doppler/Vercel, aldri i
   en committet fil.
4. **Kvalitetsportene i PROJECT.md gjelder hver PR** — typecheck, lint, bygg,
   a11y og ytelsesbudsjett.
5. **Alt offentlig innhold skal være redigerbart** (CMS-kravet, PROJECT.md §10.5).

## Før du melder ferdig

- [ ] typecheck grønn
- [ ] lint grønn
- [ ] bygg grønn
- [ ] Ingen hemmeligheter i diffen
`;
}

export function buildRepoReadme(project: KickstartProject): string {
  return `# ${project.project_name}

${project.short_description ?? ""}

Kunde: **${project.client_name}**${project.new_domain ? ` · Domene: ${project.new_domain}` : ""}

## Kom i gang

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Dokumentasjon

- \`PROJECT.md\` — komplett spec: visjon, design, datamodell, sprintplan, pre-launch.
- \`AGENTS.md\` — reglene som gjelder for AI-økter i dette repoet.

Generert av [kickstart-mlit](https://github.com/helgelunde1981-creator/kickstart-mlit)
for Myrvoll-Lunde IT Drift.
`;
}
