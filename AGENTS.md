
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

## Før du melder ferdig

`pnpm check` (typecheck + lint + test) skal være grønn, og `pnpm build` skal gå
gjennom. Se sjekklista i CONTRIBUTING.md.
