# Slik jobber vi i dette repoet

## Branch

Standardbranch er `master`. Arbeid på egen branch og merge inn:

    <type>/<kort-beskrivelse>

`type` er en av `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `wip`.

## Commit

Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
Én logisk endring per commit. Meldingen forklarer **hvorfor** — diffen viser hva.
Meldinger skrives på norsk, som resten av repoet.

Stage filer eksplisitt med full sti. Aldri `git add -A` eller `git add -u` —
i et repo der flere økter kan jobbe samtidig sluker de hverandres ucommittede filer.

Ingen commit med røde sjekker.

## Før du melder ferdig

- [ ] typecheck (`pnpm exec tsc --noEmit`) grønn
- [ ] lint (`pnpm lint`) grønn
- [ ] bygg (`pnpm build`) grønn
- [ ] Ingen hemmeligheter i diffen

Feiler noe du ikke klarer å fikse: si det rett ut, med utdata. Ikke rapporter
ferdig med røde tester, og aldri basert på kodelesing alene.

## Beslutninger med konsekvenser

Bibliotek, arkitektur eller mønstre andre må følge: skriv en ADR i [docs/adr/](./docs/adr/).
