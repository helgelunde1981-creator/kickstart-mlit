# Videre arbeid

Prioritert liste over hull som er identifisert, men bevisst ikke lukket i
gjennomgangen 2026-08-24. Rekkefølgen er etter hvor vondt det gjør når det slår
til, ikke etter hvor gøy det er å fikse.

---

## P1 — bør gjøres snart

### Mockup-bilder ligger som base64 i Postgres
`mockup_images` er en `text[]` med `data:image/png;base64,…`. Ti bilder er fort
10 MB i én rad. Listevisningen henter ikke lenger kolonnen, så det svir mindre
enn før, men prosjektsiden laster fortsatt alt på én gang og databasen brukes
som filserver.

**Løsning:** Supabase Storage-bøtte per prosjekt, lagre URL-er i stedet.
Migrasjon må håndtere eksisterende data-URL-er.

### Brute-force-brems er per lambda-instans
`/api/auth` teller forsøk i minnet. På Vercel betyr det at telleren nullstilles
når en ny instans starter. Det stopper et enkelt skript, ikke en distribuert
kampanje.

**Løsning:** Upstash Redis (allerede i integrasjonslista vår) eller Vercel KV.

### Ingen kostnadsoversikt per prosjekt
`usage` (input/output/cachede tokens) logges per del, men vises ingen steder og
lagres ikke. Vi vet ikke hva en spec faktisk koster før fakturaen kommer.

**Løsning:** Lagre `usage` per del i en `generation_runs`-tabell, vis sum og
estimert kostnad på prosjektsiden.

### Akkumulert spec-tekst caches ikke
Standardene (~40 000 tokens) treffer prompt-cachen for hver del, men teksten som
allerede er generert sendes ucachet — og den vokser til å bli den største posten
i prompten mot slutten av et løp.

**Løsning:** Lagre delene hver for seg (`project_md_parts jsonb`) i stedet for
én tekststreng, send dem som separate content-blocks, og sett `cache_control` på
de *to* siste blokkene. Da treffer brytepunktet fra forrige del alltid, og alt
tidligere innhold leses for 0,1x. Krever at delene ikke lenger limes sammen med
`\n\n---\n\n` før lagring — dagens separator kan ikke splittes tilbake
pålitelig, fordi modellen selv skriver `---`.

### Ingen E2E-test av selve genereringsflyten
Enhetstestene dekker rendering, validering, sesjon og verifisering. Selve
12-dels-løkken (avbrudd, gjenopptakelse, lagring) er kun testet manuelt.

**Løsning:** Playwright mot mockede `/api/kickstart/generate` og `/api/kickstart/job`
som spiller av et helt løp — inkludert en jobb som feiler på del 5 og blir
gjenopptatt.

---

## P2 — verdt å gjøre

### Ingen token-streaming mens jobben går
Bakgrunnskjøringen (ADR 0004) kostet oss den løpende teksten: statusen viser
fremdrift per del og de siste lagrede linjene, ikke ord for ord.

**Løsning:** Supabase Realtime — worker-en publiserer deltaer på en kanal,
klienten lytter når den er åpen. Ingen av dem eier løpet, så robustheten består.

### Ingen versjonshistorikk på PROJECT.md
«Regenerer spec» overskriver forrige versjon. Var den forrige bedre, finnes den
ikke lenger.

**Løsning:** `project_md_versions`-tabell, med diff-visning mellom kjøringer.

### Verifiseringen teller tegn, ikke innhold
`verifyContent` sjekker lengde og at nøkkelord finnes. En del som er tynn, men
inneholder ordet «sprintplan», passerer.

**Løsning:** Verifiser per seksjon i spec-malen (finnes §12 Datamodell? har den
`create table`?), eller la modellen selv score utkastet mot
`04-QUALITY_GATES.md` §10-rubrikken.

### Standardene har ingen tester
`docs/standards/*.md` er produktet, men ingenting fanger opp at en fil er tom,
mangler en seksjon eller har mistet en `{{placeholder}}` som prompten regner med.

**Løsning:** En test som leser filene og sjekker struktur og lengde. Billig, og
den fanger den verste feilen: en fil som stille ble halvert.

### Bootstrap setter ikke miljøvariabler
Vi oppretter GitHub-repo, Supabase-prosjekt og Vercel-prosjekt — men Vercel-
prosjektet får ingen `NEXT_PUBLIC_SUPABASE_URL` osv. Første deploy feiler alltid.

**Løsning:** Sett variablene via Vercel API rett etter oppretting, med nøklene
fra Supabase-svaret.

---

## P3 — nice to have

- **Duplisering av prosjekt** — «Nytt prosjekt basert på Acme» sparer mye
  utfylling for kunder i samme bransje.
- **Eksport til PDF** for kundemøter (specen leses i dag kun i nettleseren).
- **Søk i innholdet av specene**, ikke bare i navn og beskrivelse.
- **Vis diff mellom valgt tech-stack og `03-TECH_STACK_CANON.md`** i wizarden,
  slik at avvik blir et bevisst valg der og da.
- **`supabase gen types`** i stedet for håndskrevet `KickstartProject`.
