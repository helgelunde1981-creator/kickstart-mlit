import { KickstartProject } from "../types";
import { DESIGN_DIRECTIONS, PROJECT_TYPES, TECH_OPTIONS } from "../tech-options";
import { repoSlug } from "./github";

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
  // Doppler-prosjektet heter det samme som repoet, så kommandoene under kan kjøres som de står.
  const doppler = repoSlug(project.project_name);
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
3. **Kvalitetsportene i PROJECT.md gjelder hver PR** — typecheck, lint, bygg,
   a11y og ytelsesbudsjett.
4. **Alt offentlig innhold skal være redigerbart** (CMS-kravet, PROJECT.md §10.5).

## Linear er planen

- Prosjektet settes opp i Linear før arbeidet starter: team (eget eller felles —
  spør Helge), prosjekt og én milepæl per sprint. Hver sprintoppgave er en sak.
- Planen og sakene bor i Linear — ikke i \`docs/plans/\` eller GitHub Issues.
- Grener får Linear-navnet (\`helgelunde1981/<nøkkel>-<nr>-…\`), så PR-en kobles.
- En sak settes til Done først når endringen er verifisert.
- Hendelser og nye ønsker legges i Linear med en gang.

## Faste arbeidsregler

- **Språk:** norsk bokmål i chat, dokumentasjon og UI. Kode og commit-meldinger
  følger prosjektet.
- **Hemmeligheter skrives aldri ut.** De ligger i Doppler:
  \`doppler run -p ${doppler} -c dev -- pnpm dev\`. Aldri \`.env\`-filer, aldri
  \`doppler secrets get/download\`. Nye verdier skrives via stdin. Se nøkler med
  \`doppler secrets --only-names\`.
- **Spør før produksjon:** push/merge til \`main\`, deploy, \`supabase db push\` og
  migrasjoner, Doppler \`prd\`, DNS og live data krever ja fra Helge først.
- **\`dev\` → \`main\`:** grener lages fra \`dev\`, PR-er går mot \`dev\`, og \`main\`
  får bare promoteringer. Synk \`main\` → \`dev\` rett etter en promotering —
  \`git log origin/dev..origin/main\` skal være tom. Aldri force-push.
- **Sikkerhet:** skillen \`sikkerhet\` ved oppstart, før PR og før deploy, pluss
  spesialskillene (\`sikker-database\`, \`sikker-ai-agent\`, \`sikker-mcp\`,
  \`sikker-azure\`, \`sikker-container\`). Actions pinnes til full SHA, Gitleaks
  på alle PR-er, RLS på alle tabeller, og \`anon\`-allowlisten er tom til Helge
  godkjenner noe.
- **Fjernstyring:** ingen verktøy som venter på svar i terminalen. Bruk CLI som
  kan godkjennes eksternt.
- **GitHub Actions nøkternt:** \`concurrency\` med \`cancel-in-progress\`,
  \`paths-ignore\` for docs, \`timeout-minutes\`, ingen dobbeltkjøring, og
  AI-review ikke på synk- eller Renovate-PR-er.
- **Spørsmål** stilles med alternativer og en anbefaling, det anbefalte først.
- **Superpowers:** disse reglene går foran, planer ligger i Linear, og worktrees
  bare når Helge ber om det.

## Før du melder ferdig

- [ ] typecheck, lint og bygg grønne
- [ ] UI verifisert i nettleseren med ekte data — ingen tekst kuttet
- [ ] E2E kjørt lokalt mot lokal Supabase og Chromium
- [ ] \`gh pr checks\` lest i sin helhet — alle grønne
- [ ] Liten PR; sikkerhetsrevisjon gjort hvis den rører database eller API
- [ ] Nye RLS-tabeller har \`mfa_required\`-policyen der standarden krever det
- [ ] Ingen hemmeligheter i diffen
- [ ] Linear-saken oppdatert — først nå
`;
}

export function buildRepoReadme(project: KickstartProject): string {
  return `# ${project.project_name}

${project.short_description ?? ""}

Kunde: **${project.client_name}**${project.new_domain ? ` · Domene: ${project.new_domain}` : ""}

## Kom i gang

\`\`\`bash
pnpm install
doppler run -p ${repoSlug(project.project_name)} -c dev -- pnpm dev
\`\`\`

Hemmeligheter ligger i Doppler — det finnes ingen \`.env\`-filer.

Planen og sakene ligger i Linear.

## Dokumentasjon

- \`PROJECT.md\` — komplett spec: visjon, design, datamodell, sprintplan, pre-launch.
- \`AGENTS.md\` — reglene som gjelder for AI-økter i dette repoet.

Generert av [kickstart-mlit](https://github.com/helgelunde1981-creator/kickstart-mlit)
for Myrvoll-Lunde IT Drift.
`;
}
