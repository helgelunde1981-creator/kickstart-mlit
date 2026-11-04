
<!-- BEGIN:doppler-secrets -->
# Hemmeligheter ligger i Doppler — ikke i .env-filer

Migrert 2026-07-27. **Det finnes ingen `.env.local` her, og det skal ikke opprettes en.**
Prosjektet har KUN miljøet `prd`.

- **Kjør lokalt:** `doppler run -- npm run dev`
- **Bygg:** `doppler run -- npm run build`
- **Endre en hemmelighet:** `doppler secrets set NAVN` eller dashboard.doppler.com
- **Se nøkler:** `doppler secrets --only-names`

## ⚠️ Vercel-produksjon er IKKE Doppler-styrt

**Ikke opprett en Doppler→Vercel-synk uten å lese
`Smarthus/docs/doppler-migrering-runbook.md` felle 3.0 først.**

12 av produksjonsvariablene i Vercel er av typen `sensitive`. Vercel gir aldri fra seg
verdien til slike, så Doppler har dem ikke — en synk ville **slettet dem i produksjon**.
Produksjonsvariabler endres derfor fortsatt direkte i Vercel.
<!-- END:doppler-secrets -->

---

# Regler for arbeid i dette repoet

Alt over gjelder hemmeligheter. Alt under gjelder koden. (Repoet bruker
**pnpm** — `doppler run -- pnpm dev`.)

## Hva dette er

Et internt verktøy som genererer `PROJECT.md` for nye kundeprosjekter med
Claude, etter standardene i `docs/standards/`. Arkitekturen står i
[README.md](./README.md); arbeidsflyten i [CONTRIBUTING.md](./CONTRIBUTING.md).

## De viktigste reglene

1. **`docs/standards/*.md` er produktet, ikke dokumentasjon.** Filene sendes til
   modellen ved hver generering. En endring der endrer hva kundene faktisk får —
   behandle den som en kodeendring, ikke en tekstjustering. Legger du til en fil,
   må den også registreres i `outputFileTracingIncludes` i `next.config.ts`,
   ellers følger den ikke med i Vercel-bunten.
2. **Verktøyet skal holde samme standard som det krever av andre.** Vi kan ikke
   kreve 10/10 UI, a11y og ytelse i hver kundespec og selv levere default-grått
   Tailwind. Nye flater bruker tokens fra `globals.css` (`bg-surface`,
   `text-muted`, `.btn`, `.card`, `.input`) — aldri hardkodede `gray-500`/`white`,
   som gir ødelagt mørkt tema.
3. **Hver `input` har en `label` med `htmlFor`.** Feilmeldinger får `role="alert"`,
   lange operasjoner får `aria-live` og synlig fremdrift.
4. **Ingen hemmeligheter i repoet eller i loggene.** Databasepassord og tokens
   vises maks én gang i UI-et og lagres aldri i `kickstart_projects`.
5. **Skjemaendringer skal ha en migrasjon** i `supabase/migrations/`, skrevet
   idempotent (`if not exists`). Databasen har levd i dashboardet før — vi går
   ikke tilbake dit.
6. **Kode som snakker med Claude eller eksterne API-er sjekker svaret.** En
   ignorert `Response` er en feil som ser ut som suksess i loggen.
7. **Modell-ID-er bor i `src/lib/kickstart/model.ts`.** Ikke skriv dem inn i
   kallene.
8. **Langvarig arbeid skal aldri drives av nettleseren.** Genereringen eies av
   jobbkøen (`kickstart_generation_jobs`, ADR 0004): klienten legger i kø og
   poller status. Nye oppgaver som tar mer enn noen sekunder skal gjøres på
   samme måte — en lukket fane eller en låst telefon skal ikke kunne stoppe
   noe.

## Før du melder ferdig

`pnpm check` (typecheck + lint + test) skal være grønn, og `pnpm build` skal gå
gjennom. Se sjekklista i CONTRIBUTING.md.

## Supabase og RLS — tre feller som har stengt et produkt

- **Et `EXISTS` inne i en RLS-policy er selv underlagt RLS på tabellen det peker
  på.** Kan ikke brukeren lese den tabellen, blir uttrykket alltid usant, og
  policyen er umulig å oppfylle uansett hvilke rader som finnes. Bruk
  `SECURITY DEFINER`-hjelpere, eller gi brukeren lesetilgang til sine EGNE rader.
- **En ulest `error` gjør en feilet spørring til «ingen rader».**
  `const { data } = await db.from(...).select(...)` uten `error` gir tom liste,
  ingen logg og ingen som vet. Destrukturer alltid `error` og si fra når den er satt.
- **Mer enn én fremmednøkkel til samme måltabell gjør embeds tvetydige** —
  PostgREST svarer med feil i stedet for data. Skriv `mål!fk_navn(felt)`
  eksplisitt. Én ny nullbar FK er nok til å tømme en liste som har virket lenge.
- Etter enhver RLS-endring: kjør flytene som en VANLIG bruker, ikke bare som
  admin. En rolle som ser 0 rader der admin ser data må forklares, ikke antas.

*(Alle tre ble funnet i drift i Brannappen 26.08.2026. Ingen av dem ga
feilmelding — alt så ut til å virke.)*

## Felles sikkerhetsstandard (innført 04.11.2026)

Gjelder alle Helges repoer. Selve workflowene (Gitleaks, Supabase-sjekker) og
migrasjonene kommer som egne PR-er fra den som eier standarden. Ikke lag dem
selv, og ikke skriv om dem når de er kommet.

**Gjelder allerede nå:**

- **Actions pinnes til full SHA.** Hver ny `uses:` i en workflow skrives med
  full 40-tegns commit-SHA og versjonskommentar, f.eks.
  `uses: actions/checkout@<40 tegn> # v5`. Aldri `@v5`, `@main` eller kort SHA.
  Renovate pinner eksisterende linjer. Pin-PR-ene automerges og skal ikke
  lukkes. En GitHub-regel som feiler workflows med upinnede actions kommer senere.
- **Genererte filer redigeres ikke for hånd.** Filer med headeren «generert»
  (bl.a. `supabase/tests/database/0N-*.test.sql`) endres bare av generatoren.
  Drift-sjekken feiler hvis de er endret.

**Kommer med standard-PR-en:**

- **Gitleaks på alle PR-er.** Finner den en hemmelighet i en ny commit, blir
  PR-en rød. Da: roter nøkkelen først (den kan være live), fjern den fra koden,
  og si fra til Helge. Offentlige verdier (`NEXT_PUBLIC_*`, `VITE_*`,
  anon-nøkkelen, Sentry DSN) gir ikke varsel.
- Sjekkene rapporterer bare i en prøveperiode, og blir deretter påkrevde i
  branch protection. Helge får beskjed før det slås på.

**Supabase (dette repoet har Supabase):**

- En baseline-migrasjon fjerner standardtilgangen `anon` har til nye tabeller
  og funksjoner. `anon` får ikke lenger noe automatisk.
- Seks pgTAP-tester (`supabase test db`) og en lint kjører i CI. **En ny tabell
  uten RLS gir rød CI.**
- Alt `anon` skal kunne gjøre, åpnes eksplisitt i en migrasjon og føres i
  `supabase/tests/database/_config.sqlinc` med en kommentar om hvorfor.
- Funksjonene (RPC-ene) appen kaller *før innlogging* er `anon`-allowlisten.
  Den foreslås fra koden og godkjennes av Helge. Ikke legg til eller fjern noe
  der uten hans godkjenning: gjetter vi feil, slutter innlogging eller
  offentlige sider å virke.
- Baseline kjøres aldri mot en eksisterende database uten tørrkjøring først.

**Uendret:**

- Grenflyten slik den står beskrevet for repoet: PR, grønn CI, merge til `dev`,
  verifiser, så `main` (der repoet har `dev`). Ingen force push til `main` eller
  `dev`.
- Hemmeligheter ligger i Doppler.
