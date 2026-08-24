# 0004 — Serveren driver genereringen, ikke nettleseren

**Status:** Vedtatt
**Dato:** 2026-08-24

## Kontekst

Genereringen av PROJECT.md tar 10–20 minutter fordelt på 12 deler. Fram til nå
sendte nettleseren én request per del og startet neste når forrige var ferdig.
Det betyr at klienten *var* motoren: lukket fane, byttet app eller skjermlås på
telefon (som suspenderer JavaScript og kutter forbindelsen) stoppet løpet midt i.

I praksis måtte man sitte og se på skjermen i et kvarter — på mobil var det nok
at skjermspareren slo inn. Delene som var ferdige ble riktignok lagret, men noen
måtte komme tilbake og trykke «Fortsett» manuelt, og det var ikke åpenbart at
det var det som hadde skjedd.

## Alternativer

| Alternativ | For | Mot |
|---|---|---|
| Beholde klientdrevet løp, men be brukeren la fanen stå åpen | Ingen endring | Løser ingenting; skjermlås er utenfor brukerens kontroll |
| Én lang serverkjøring for alle 12 delene | Enkel modell | Umulig: Vercel kutter ved 300 s |
| Jobbkø i databasen + worker som kjeder seg selv + cron som vaktpost | Overlever alt klientsiden gjør, ingen nye tjenester | Vi eier tilstandsmaskinen selv |
| Ekstern kø (QStash, Inngest) | Ferdig retry og observability | Ny leverandør, ny hemmelighet, ny feilkilde for én kø med få jobber |
| Long-running worker (Fly.io e.l.) | Ingen tidsgrense | Egen infrastruktur å drifte for én oppgave |

## Beslutning

Fremdriften eies av tabellen `kickstart_generation_jobs`. `/api/kickstart/worker`
genererer **én** del, svarer 202 med en gang og gjør arbeidet i `after()`, og
kaller så seg selv for neste del — fordi et løp som tar et kvarter ikke kan være
avhengig av at noen ser på skjermen.

Klienten kan bare to ting: legge en jobb i kø og spørre om status.

Tre lag sikrer at løpet kommer i mål:

1. **Kjedingen** — normalveien, starter neste del i det forrige er lagret.
2. **Cron hvert 5. minutt** (`/api/kickstart/cron`) — setter jobber som står som
   `running` uten livstegn (`heartbeat_at` eldre enn 8 min) tilbake i kø, og
   sparker i gang det som ligger i kø.
3. **`attempts` per del, maks 3** — en jobb som feiler konsekvent gir opp i
   stedet for å brenne API-penger i en løkke.

En unik delvis indeks (`status in ('queued','running')`) sikrer ett aktivt løp
per prosjekt, og `claimJob` bruker `update … where status = 'queued'` slik at to
samtidige workere ikke kan ta samme del.

## Konsekvenser

**Dette gir oss:** Skjermlås, lukket fane, tapt nett og til og med en avlivet
lambda stopper ikke lenger genereringen. LeadRadar-intaket svarer på under et
sekund i stedet for å vente på del 1. Man kan starte på mobil og følge med fra
PC-en etterpå.

**Dette koster oss:** Token-for-token-streamingen i UI-et er borte — ingen
holder lenger forbindelsen som strømmet dem. Statusen viser i stedet fremdrift
per del og de siste linjene som er lagret. Vi har også en tilstandsmaskin til å
vedlikeholde.

**Dette må vi passe på:** Cron krever `vercel.json` og et abonnement som tillater
hyppige kjøringer (teamet er på Pro, så `*/5 * * * *` er greit; på Hobby ville
det blitt én gang i døgnet). Worker-endepunktet må alltid være autentisert; det
kan starte betalt arbeid.

Og den lumske: **kjedingen går ut på nettet og inn igjen.** Prosjektet har
Vercel Deployment Protection (SSO) på for alt unntatt egendefinerte domener, så
treffer selvkallet et `.vercel.app`-domene, svarer Vercel med sin egen
innloggingsside og jobben starter aldri. `NEXT_PUBLIC_SITE_URL` må derfor peke
på `kickstart.mlit.no`. Kallet sender `x-vercel-protection-bypass` når Vercel har
gitt oss en slik nøkkel, `triggerWorker` logger eksplisitt hva som er galt ved
401/403, og `/api/kickstart/health` prøver selvkallet på ekte så feilen kan
oppdages med ett klikk i stedet for ved at ingenting skjer.

## Når bør dette tas opp igjen

Hvis vi får mange samtidige løp, eller trenger ordentlig observability på kø og
retries, er en ekte kø (QStash/Inngest) riktig neste steg. Ønsker vi
token-streaming tilbake, er Supabase Realtime veien — worker-en publiserer,
klienten lytter, uten at noen av dem eier løpet.
