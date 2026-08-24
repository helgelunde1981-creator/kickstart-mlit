# 0003 — Databaseskjemaet bor i repoet

**Status:** Vedtatt
**Dato:** 2026-08-24

## Kontekst

Tabellen `kickstart_projects` fantes kun i Supabase-dashboardet. Repoet hadde
ingen fasit for hvilke kolonner som eksisterte — TypeScript-typen i
`types.ts` var nærmeste dokumentasjon, og den kunne ikke verifiseres mot noe.
Et nytt miljø (eller en gjenoppretting) måtte gjettes fram, og alle spec-ene
vi selv genererer krever migrasjoner i repo av kundeprosjektene.

## Alternativer

| Alternativ | For | Mot |
|---|---|---|
| Fortsette i dashboardet | Ingenting å sette opp | Ingen historikk, ingen review, ikke reproduserbart |
| Supabase-migrasjoner i repo | Reproduserbart, reviewbart, samme regel som vi gir kundene | Må huske å skrive dem |
| Full ORM (Prisma/Drizzle) | Typer generert fra skjema | Stor omlegging av all databasekode for én tabell |

## Beslutning

`supabase/migrations/` er fasiten for skjemaet, skrevet idempotent
(`create table if not exists`, `add column if not exists`) — fordi et skjema
ingen kan lese i repoet er et skjema ingen kan gjenskape.

Koden tåler en database der siste migrasjon ikke er kjørt: mangler
`generated_parts`, lagres teksten uten fremdriftsteller og det logges en
oppfordring om å kjøre migrasjonen.

## Konsekvenser

**Dette gir oss:** Et nytt miljø settes opp med én SQL-fil. Skjemaendringer går
gjennom review som all annen kode.

**Dette koster oss:** Ett ekstra steg ved skjemaendring.

**Dette må vi passe på:** Filene må forbli idempotente så lenge prod er endret
manuelt fra før. Endrer man en kolonne, skriv en ny migrasjon — ikke rediger
en gammel.

## Når bør dette tas opp igjen

Hvis verktøyet får flere tabeller og relasjoner, bør vi vurdere generering av
typer fra skjemaet (`supabase gen types`) framfor håndskrevne interfaces.
