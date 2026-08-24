# Arkitekturbeslutninger (ADR)

En ADR skrives når et valg binder andre. Tommelfingerregel: hvis noen om seks
måneder kan komme til å gjøre om på dette uten å kjenne begrunnelsen, skriv en.

**Skriv ADR for:** valg av bibliotek eller tjeneste, datamodell som andre bygger på,
autentisering og tilgangsstyring, mønstre som skal følges i resten av koden,
bevisste avvik fra normal praksis.

**Ikke skriv ADR for:** navngiving, formatering, enkeltbugfikser, ting diffen forklarer selv.

## Slik gjør du det

1. Kopier `0000-mal.md` til `NNNN-kort-tittel.md` med neste ledige nummer.
2. Fyll ut. Vær ærlig om hva alternativet ville gitt.
3. Legg den til i registeret under.

Endres en beslutning senere: skriv en ny ADR som erstatter den gamle, og sett
den gamle til **Status: Erstattet av NNNN**. Ikke rediger historikken.

## Register

| Nr | Tittel | Status | Dato |
|---|---|---|---|
| [0001](./0001-signert-admin-sesjon.md) | Signert admin-sesjon i stedet for fast cookie-verdi | Vedtatt | 2026-08-24 |
| [0002](./0002-modellvalg-og-prompt-caching.md) | Claude Opus 5 med prompt caching for spec-generering | Vedtatt | 2026-08-24 |
| [0003](./0003-database-migrasjoner-i-repo.md) | Databaseskjemaet bor i repoet | Vedtatt | 2026-08-24 |
| [0004](./0004-bakgrunnsjobb-for-generering.md) | Serveren driver genereringen, ikke nettleseren | Vedtatt | 2026-08-24 |

