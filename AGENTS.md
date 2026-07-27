
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
