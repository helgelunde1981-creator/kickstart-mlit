# Renovate — oppsett og bruk

Renovate er en GitHub-app som automatisk lager pull requests når avhengigheter i
`package.json` har nyere versjoner tilgjengelig. Den erstatter manuell sjekk av
`pnpm outdated` med jevnlige, ferdig testede PR-forslag.

## Status

- `renovate.json` er lagt i repo-roten (2026-07-28) — konfigurasjonen under er allerede
  gjort, resten av stegene er manuelle og gjøres av Helge på github.com.
- **Ingen GitHub Actions-CI finnes ennå** i dette repoet (ingen `.github/workflows`).
  Det betyr at Renovate-PR-er ikke blir automatisk sjekket for typecheck/build før de
  er klare til merge — se «Viktig: ingen CI-gate ennå» nedenfor før du begynner å
  merge PR-er.

## Steg 1 — installer Renovate-appen på GitHub

1. Gå til <https://github.com/apps/renovate>.
2. Klikk **Install** (eller **Configure** hvis den alt er installert på kontoen din).
3. Velg **Only select repositories** og huk av `kickstart-mlit` (installer ikke på
   alle repoer med mindre du vil ha Renovate overalt med én gang).
4. Bekreft installasjonen.

Renovate kjører nå periodisk (typisk innen timer) og leser `renovate.json` fra
`master`-branchen med det samme — siden filen allerede finnes trenger den ingen egen
onboarding-PR, den går rett til å foreslå oppdateringer.

## Steg 2 — se etter Dependency Dashboard-issuet

Renovate oppretter et GitHub-issue kalt **"Dependency Dashboard"** i repoet. Dette er
oversikten din:

- Viser alle avhengigheter Renovate har oppdaget, og hvilke som har ventende
  oppdateringer.
- Du kan huke av bokser i issuet for å tvinge frem en PR med en gang, i stedet for å
  vente på neste kjøring.
- Bruk dette issuet som fast holdepunkt fremfor å lete gjennom PR-listen.

## Steg 3 — vurder de første PR-ene

Med konfigurasjonen som er satt opp nå får du:

- **Grupperte PR-er** for `devDependencies` med minor/patch-oppdateringer (mindre
  støy — én PR for typer, linting-verktøy osv. i stedet for mange).
- **Én egen, tydelig merket PR-gruppe** for major-oppdateringer av kjernen
  (`next`, `react`, `react-dom`, `@supabase/supabase-js`, `@anthropic-ai/sdk`) —
  disse utgjør selve wizard-motoren i kickstart-mlit (rammeverket, databaseklienten
  og AI-genereringen appen er bygget rundt), så de er mest sannsynlig å knekke noe
  og bør testes grundig lokalt før merge.
- Maks 3 åpne PR-er samtidig (`prConcurrentLimit`), så du ikke druknes første uken.
- Ukentlig lockfile-vedlikehold (`lockFileMaintenance`) som samler opp mindre
  transitive oppdateringer.

**Ingen automerge er satt opp noe sted.** Alle PR-er må merges manuelt av deg.

## Viktig: ingen CI-gate ennå

Dette repoet har ingen GitHub Actions-workflow som kjører typecheck/build/test
automatisk på hver PR (`.github/workflows` finnes ikke). Det betyr **ingen
automatisk sjekk** før du trykker merge på en Renovate-PR. (`package.json` har
ingen egen `typecheck`-script i dag — bruk `pnpm exec tsc --noEmit` direkte, som i
kommandoene under.)

Frem til CI er på plass, gjør dette for hver PR før merge:

```bash
git fetch origin
git switch renovate/<branch-navn>
pnpm install
pnpm exec tsc --noEmit
pnpm run build
```

Se over at begge kommandoene går gjennom uten feil før du merger.

## Justere konfigurasjonen senere

Alt styres fra `renovate.json` i repo-roten. Vanlige endringer:

- **Automerge for trygge patch-oppdateringer** (når CI finnes): legg til
  `"automerge": true` på en `packageRules`-regel avgrenset til
  `"matchUpdateTypes": ["patch"]` og gjerne `"matchCurrentVersion": "!/^0/"`.
- **Stoppe oppdateringer for en pakke midlertidig:** legg til en regel med
  `"matchPackageNames": ["pakkenavn"]` og `"enabled": false`.
- **Endre hvor mange PR-er som er åpne samtidig:** juster `prConcurrentLimit`.

Full referanse: <https://docs.renovatebot.com/configuration-options/>.
