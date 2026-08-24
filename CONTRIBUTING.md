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

`pnpm check` kjører de tre første i ett:

- [ ] typecheck (`pnpm typecheck`) grønn
- [ ] lint (`pnpm lint`) grønn
- [ ] tester (`pnpm test`) grønne
- [ ] bygg (`pnpm build`) grønt
- [ ] Ingen hemmeligheter i diffen
- [ ] Skjemaendring? Migrasjon lagt i `supabase/migrations/`

De samme sjekkene kjører i CI (`.github/workflows/ci.yml`) på hver PR — men
finn feilene lokalt, ikke i en rød pipeline.

Feiler noe du ikke klarer å fikse: si det rett ut, med utdata. Ikke rapporter
ferdig med røde tester, og aldri basert på kodelesing alene.

## Beslutninger med konsekvenser

Bibliotek, arkitektur eller mønstre andre må følge: skriv en ADR i [docs/adr/](./docs/adr/).
