# 01 — Spec Template

> Den eksakte strukturen for hver generert `PROJECT.md`. AI fyller ut placeholders `{{...}}` med kundedata + ekspanderer hver seksjon i tråd med 00-SYSTEM_PROMPT, 04-QUALITY_GATES og 06-SECTION_DETAILS.

> **Bruk:** kickstart-verktøyet leser dette ved buildtime, fletter inn placeholders, sender til Claude API som user-message (sammen med 00-SYSTEM_PROMPT som system-message).

---

```markdown
# {{client_name}} — Project Spec

**Status:** Spec — venter på kunde-review
**Dato:** {{today_yyyy_mm_dd}}
**Kunde:** {{client_name}} ({{client_address_if_any}})
**Domene:** {{new_domain}} {{existing_url_note_if_any}}
**Tech-stack:** {{tech_stack_summary}}
**Eier:** Myrvoll-Lunde IT Drift / Myrvoll-Lunde IT Drift
**Designretning:** {{design_direction_primary}}{{design_direction_secondary_if_any}}

---

## 1. Visjon + 10/10-mandat

### 1.1 Visjon

[2-3 setninger som fanger hvorfor dette prosjektet eksisterer. Basert på kundens `vision`-felt + `core_product`. Skriv det for en utenforstående leser.]

### 1.2 10/10-mandat

Hvert prosjekt vi leverer skal være 10/10 på:

- **Design** — én klar 2026-retning, ikke generic template
- **Brukeropplevelse** — signature moments + designede states
- **Funksjonalitet** — alle krav dekket, ingen pseudokode
- **UI** — designsystem som faktisk kode
- **Ytelse** — Lighthouse ≥ 95 alle kategorier
- **Sikkerhet** — RLS, CSP, secrets fra dag 1
- **Compliance** — GDPR + Norge-spesifikt

Konkrete suksesskriterier er listet i siste seksjon.

### 1.3 Suksesskriterier (kort versjon — full liste sist)

[5-10 målbare KPI-er som svarer på "når er dette prosjektet ferdig". Tall, ikke vagt.]

---

## 2. Designretning (2026)

### 2.1 Valgt retning

**Primær:** {{design_direction_primary}}
**Sekundær:** {{design_direction_secondary_if_any}}

**Hvorfor denne retningen for {{client_name}}:**

[1-2 avsnitt om hvorfor retningen passer for kundens bransje, målgruppe og personlighet. Referer til `EXAMPLES/design-directions/NN-name/README.md`.]

### 2.2 Designtokens (oversikt)

Fullstendige tokens i seksjon 9 (Designsystem). Her: oversikt over fargevalg.

- **Primær accent:** {{color_primary}} ([beskrivelse, f.eks. "orange = brand"])
- **Sekundær accent:** {{color_secondary}} eller derivert
- **Bakgrunn:** [oklch-verdi fra valgt retnings tokens.css]
- **Tekst-hierarki:** primary / secondary / muted / mono

### 2.3 Typografi

[Font-pairing fra `EXAMPLES/design-directions/NN-name/font-pairings.md`. Hva er display, body, mono.]

### 2.4 Motion-strategi

[Hvilke patterns fra retningens `motion.example.ts`. Hvor brukes scroll-triggered, hvor brukes hover-states.]

### 2.5 Visuelle referanser

[3-5 URL-er fra `references.md` for valgt retning. AI kan også inkludere kundespesifikke refs fra `design_references`-feltet.]

---

## 3. Konkurranseanalyse + posisjonering

### 3.1 Konkurrenter

[Minst 3 navngitte konkurrenter, identifisert basert på bransje og geografi.]

| Konkurrent | Hva de gjør bra | Hva de gjør dårlig | Vår mulighet |
|------------|------------------|---------------------|--------------|
| [...] | [...] | [...] | [...] |

### 3.2 Vår unike vinkel

[Én setning som svarer: hvorfor velger en kunde {{client_name}} fremfor konkurrentene? Ikke "vi er best", men noe konkret.]

---

## 4. Brand voice + content guidelines

### 4.1 Default voice

Følg `05-BRAND_VOICE.md` (Myrvoll-Lunde IT Drift-tone): du-form, direkte, ærlig, ingen markedsfraser.

### 4.2 Tilpasning for {{client_name}}

[Hvis bransje/målgruppe krever tilpasning, beskriv her. Eks: "Mer formelt enn default fordi finansbransje".]

### 4.3 Forbudte fraser (kunde-spesifikt + standard)

Fra `05-BRAND_VOICE.md` + følgende kunde-spesifikke:

- [Konkurrent-fraser å unngå]
- [Klisjéer kunden har takket nei til]

### 4.4 CTA-bibliotek

Primær CTA-er for {{client_name}}:

- [Eks: "Beregn pris" hvis kalkulator-produkt]
- [Eks: "Be om tilbud" hvis B2B-tjeneste]

---

## 4.5 AI-foreslåtte forbedringer

**Du er ikke en stenograf — du er en rådgiver.** Du har vurdert kundens input kritisk og har minst 2 forslag her som kan forbedre prosjektet.

Hvert forslag følger malen:

> **Forslag:** [hva]
> **Hvorfor:** [konkret begrunnelse — gjerne med data hvis du har det]
> **Trade-off:** [hva må kunden gi opp]
> **Kundens valg:** [avvent svar]

### 4.6 Korrektur og ærlighet (obligatorisk)

[Norsk korrektur skal leses på ALL offentlig tekst før hver public-side er ferdig (rettskriving, bøying,
tegnsetting, norske typografiregler). ALDRI overdriv, fantaser eller skriv noe kunden ikke kan stå inne
for: ingen oppdiktede tall/årstall/kundeantall/erfaring/sertifiseringer/garantier/utmerkelser, ingen
hyperbol, ingen ubekreftede løfter (responstid/leveringstid/resultater), ingen placeholder i levert tekst.
Uverifiserte påstander flagges under «Spørsmål til kunden» — aldri gjett. Se `05-BRAND_VOICE.md` →
«Korrektur og ærlighet». Korrektur + faktasjekk per side er et steg i sprint-done og pre-launch.]

[Minst 2 forslag her. Eksempler du kan tilpasse:]

- Forslag om å bytte feature-prioritering basert på konvertering
- Forslag om bytte av tech-valg basert på målgruppen (eks: Vipps > Stripe for norsk B2C)
- Forslag om å fjerne planlagt feature fordi den senker UX
- Forslag om å splitte fase 1 annerledes
- Forslag om å bytte signature moment til noe mer karakteristisk for kunden
- Forslag om accessibility-tiltak utover standard WCAG

---

## 5. Signature moment (påkrevd)

### 5.1 Hva

[Én setning om hva signature moment er for dette prosjektet. Eks: "Live fraktkalkulator med Lucide-ikoner og real-time pris-breakdown".]

### 5.2 Hvor

[URL/seksjon der det er plassert. Hvilke flater (forside-hero, dedikert side, embed-widget).]

### 5.3 Oppførsel

[Detaljert beskrivelse av hvordan det fungerer. Hvilke states, hvilke transitions, hva brukeren ser når.]

### 5.4 Hvorfor signature

[Hvorfor er DETTE signature for {{client_name}}? Hvordan reflekterer det kundens kjernekompetanse?]

### 5.5 Suksessmetrikk

[Hvordan måler vi at det fungerer. Konvertering, engagement-rate, time-on-feature.]

---

## 6. Anti-template-sjekkliste

Dette prosjektet er IKKE:

[Skriv ut alle relevante avvisninger fra `04-QUALITY_GATES.md` §3.1, og legg til kunde-spesifikke avvisninger:]

- ❌ Sentrert hero med gradient-blob + standard CTA
- ❌ Uniform card-grid med lik padding
- ❌ Gray-on-white safe-styling med kun én accent
- ❌ Default shadcn-utseende uten customisering
- ❌ Stock Unsplash-bilder uten relevans
- ❌ [Kunde-spesifikke avvisninger basert på konkurrent-analyse]

Dette prosjektet ER:

[Beskriv positivt hva som gjør dette 10/10. Minst 4 av 10 design-kvaliteter fra `04-QUALITY_GATES.md` §3.2:]

- ✓ [Hvilken design-kvalitet adresseres her]
- ✓ [...]

---

## 7. Kunde og kontekst

### 7.1 Om {{client_name}}

[Kort om kunden: hva de gjør, hvor lenge, geografi, størrelse, målgruppe. Fra `industry` + `core_product` + ev. eksisterende site.]

### 7.2 Kontaktinfo

[Fra `contact_person`-feltet.]

### 7.3 Eksisterende løsning

[Beskriv `existing_url` hvis finnes. Hva som funker, hva som ikke funker.]

**Hvis `requires_scrape=true` (obligatorisk hvis krysset av i wizarden):**

Følg `06-SECTION_DETAILS/scrape-pipeline.md`. Sprint 1 MÅ levere alle 4 skript + CI-workflow + verifisering. Hardkoded URL-liste eller hardkodet whitelist over hvilke scrape-filer som importeres er **forbudt** — alt skal auto-discoveres.

Scrape-leveranser:

| # | Skript | Hva |
|---|--------|-----|
| 1 | `scripts/scrape-existing-site.ts` | Auto-discover URL-er fra sitemap.xml (fallback: crawl), én JSON per side til `data/scraped/<slug>.json`, alle bilder til `data/scraped/images/` |
| 2 | `scripts/import-scraped-content.ts` | Auto-leser ALLE `data/scraped/*.json`, upserter til `pages` + `page_sections` + `articles` + `settings`. Bruker `(SUPABASE_URL \|\| NEXT_PUBLIC_SUPABASE_URL)?.trim()` og section-types fra DB-CHECK-constraint |
| 3 | `scripts/import-scraped-images.ts` | Last alle bilder til Supabase Storage `media/scraped/` + insert i `public.media` med filnavn-basert alt-text fallback |
| 4 | `scripts/verify-scrape-import.ts` | Sammenligner fil-count vs DB-count. Exit !=0 ved mismatch. Blokkerer Sprint 1 done |
| 5 | `.github/workflows/verify-scrape.yml` | Kjører verify-skriptet på hver PR — feiler PR hvis dekning ikke matcher |

### 7.4 Målgruppe

[Hvem bruker produktet? B2B/B2C? Geografi? Tekniske ferdigheter?]

---

## 8. Tech-stack

[Tabell med tech-stack basert på kundedata. Default fra `03-TECH_STACK_CANON.md`. Avvik må begrunnes.]

| Lag | Teknologi | Hvorfor |
|-----|-----------|---------|
| Framework | {{frontend_choice}} | [...] |
| Database | {{backend_choice}} | [...] |
| [...] | [...] | [...] |

### 8.1 Avvik fra default

[Hvis avvik, list her med begrunnelse.]

### 8.2 Mobil-stack

[Hvis `mobile_stack` er angitt, ekspander. Ellers "Ikke aktuelt — kun web i denne fasen".]

---

## 9. Designsystem som kode

[Følg `06-SECTION_DETAILS/designsystem.md` template eksakt. Inkluder:]

### 9.1 Tokens (`src/styles/tokens.css`)

[Full CSS — kopiert fra valgt retnings `tokens.css` med kundens accent-farger overstyrt.]

### 9.2 Tailwind v4-config

[Snutt som mapper tokens til klasser.]

### 9.3 shadcn-komponenter (customisert)

[Tabell over hvilke shadcn-komponenter som er customisert + hvordan.]

### 9.4 Ikon-system

[Lucide React + liste over ikoner faktisk brukt.]

### 9.5 Component variants

[Eksempel: Button med variants.]

---

## 10. Funksjonell spec + feature-deep-dives

### 10.1 Oversikt over features

[Tabell over alle features fra `features`-feltet, gruppert etter prioritet.]

| Feature | Type | Sprint | Kjernefeature? |
|---------|------|--------|----------------|
| [...] | [...] | [...] | [Ja/Nei] |

### 10.2-10.N Kjernefeature deep-dives

[Per kjernefeature, lag en deep-dive etter `06-SECTION_DETAILS/feature-deep-dive-template.md`-mal. Minst én er signature moment fra §5.]

---

## 10.5 CMS — alt redigerbart (hvis public-innhold finnes)

[Følg `06-SECTION_DETAILS/cms-requirements.md`. Dette er IKKE valgfritt hvis prosjektet har public-innhold. Det er ikke et alternativ å «gjøre litt av CMS» — enten er det 10/10 eller så er det ikke et CMS.]

### Hovedregel

**ALL tekst, alle bilder, alle lenker, alle SEO-felt, alle CTA-er, alle prislister, alle åpningstider, alt vist på public-siden MÅ kunne redigeres i CMS av en ikke-teknisk bruker.** Hardkodet innhold er en bug, ikke en feature.

### Påkrevde komponenter

- **Rich-text editor** (TipTap, JSON-lagring) med h2/h3, bold/italic, lenker, lister, embed
- **Bilde-opplastingsmodul** med drag-and-drop, multi-file, alt-tekst-krav, crop i nettleseren, auto AVIF/WebP-konvertering — **aldri URL-input**
- **Mediabibliotek** med søk på filnavn + alt-tekst, mappestruktur, «brukt på»-info
- **Seksjon-system** for forside + andre sammensatte sider (legg til, slett, drag-drop reorder, vis/skjul)
- **SEO per side** (meta title, description, OG image, canonical, noindex)
- **Live preview** (split-screen eller toggle) som oppdateres innen 500ms
- **Auto-save** hvert 5. sekund + recovery av kladd
- **Publiseringsflyt** (draft → published) + schedulert publisering
- **Versjonering / revisjonshistorikk** med rollback til hvilken som helst tidligere versjon
- **Roller** (superadmin / editor minimum) med klar tilgangs-indikasjon
- **Audit log** (hvem + når + hva + før/etter)

### Per side må PROJECT.md liste

| URL | Side | Redigerbare felter | Bilder | Seksjoner |
|-----|------|--------------------|--------|-----------|
| / | Forside | Hero h1, hero subtekst, hero CTA-tekst+lenke, intro-tekst, ... | Hero-bilde, logo, gallery (10 maks) | Hero, USP, Gallery, CTA |
| [...] | [...] | [...] | [...] | [...] |

«Alt på siden» betyr ALT — inkludert footer-tekst, kontaktinfo, åpningstider, sosiale lenker, etc.

---

## 11. Sider og URL-struktur

| URL | Side | Innhold | Auth-krav | CMS-styrt? |
|-----|------|---------|-----------|------------|
| / | Forside | [...] | Ingen | Ja |
| [...] | [...] | [...] | [...] | [...] |

[Basert på `pages_structure`-feltet + standard side-struktur (personvern, cookies, vilkår etc.).]

### 11.0.1 CMS-coverage per side (OBLIGATORISK — jf. regel #15)

**Krav:** For HVER public-side i tabellen over, lag en egen `### CMS-coverage for [URL]`-undersksjon med en tabell som lister HVER tekstklynge, HVERT bilde, HVER lenke, HVER CTA, HVER SEO-felt med presis DB-mapping (`tabell.felt`) og redigeringsplass. Hvis et element finnes på siden men ikke i tabellen → det er hardkodet → bug.

Maks 3 ✗-statuser per side (kun «Utviklet av Myrvoll-Lunde IT Drift» + ev. juridiske disclaimers som krever utvikler-review).

Mal i `06-SECTION_DETAILS/cms-requirements.md` (avsnittet «Anti-hardkoding-mandate»). Eksempel-tabell for hver side:

```markdown
### CMS-coverage for `/` (Forside)

| Element på siden | Type | DB-kilde | Redigeringsplassering | Status |
|------------------|------|----------|----------------------|--------|
| Hero overskrift | Tekst | `page_sections[type=hero].data.headline` | /admin/sider/forside → Hero | ✓ CMS |
| Hero CTA-tekst | Tekst | `page_sections[type=hero].data.cta_label` | /admin/sider/forside → Hero | ✓ CMS |
| Hero CTA-lenke | URL | `page_sections[type=hero].data.cta_href` | /admin/sider/forside → Hero | ✓ CMS |
| Hero-bilde | Bilde | `media[id=...]` via `page_sections[type=hero].data.image_id` | /admin/sider/forside → Hero (opplastingsmodul) | ✓ CMS |
| Hero-bilde alt-tekst | Tekst | `media[id=...].alt_text` | Opplastingsmodul (påkrevd) | ✓ CMS |
| [...alle øvrige elementer på forsiden...] | | | | |
| Footer-credit «Utviklet av Myrvoll-Lunde IT Drift» | Tekst | HARDKODET (jf. regel #11) | — | ✗ Lovlig |
```

**Repeter dette per side:** `/` · `/om-oss` · `/om-oss/[underseksjoner]` · `/[tjeneste]` · `/[sted]` · `/[tjeneste]/[sted]` (for HVER kombinasjon hvis lokal virksomhet) · `/kontakt` · `/blogg` · `/blogg/[slug]` · `/personvern` · `/cookies` · `/vilkar` · `/apenhetsloven` (hvis terskel) · `/tilgjengelighet` (hvis universell utforming) · 404 · 500.

### 11.0.2 Anti-hardkoding-script (obligatorisk leveranse)

Lag `scripts/check-cms-coverage.ts` som greper gjennom `src/app/(public)/**/*.tsx` for hardkodede strenger og rapporterer brudd. Kjøres i Sprint 3 og Pre-launch. Whitelist: Tailwind-klasser, design-tokens, route-paths.

### 11.1 Globale layout-krav (alle public-sider)

- **Footer-credit:** "Utviklet av Myrvoll-Lunde IT Drift" med lenke til https://mlit.no — alltid synlig, stiles mot valgt design-direction. Se `05-BRAND_VOICE.md` for eksakt formulering og kode-eksempler per retning. Verifiseres i E2E.
- **Cookiebot consent:** Cookiebot-banner (aldri egen) lastes før noen analytics/marketing-scripts (se §15)
- **Skip-til-innhold-link** for keyboard-brukere
- **Konsekvent header + footer** på tvers av alle public-sider

---

## 12. Datamodell (Supabase Postgres)

[Følg `06-SECTION_DETAILS/datamodell.md` template. Inkluder:]

- Komplett SQL for alle tabeller
- RLS aktivert + policyer per tabell
- Triggers (updated_at)
- Indekser

### 12.1 Migrasjons-rekkefølge

[Liste over migrasjoner i rekkefølge, med filnavn-format `YYYYMMDDHHMMSS_navn.sql`.]

### 12.2 RLS-policyer (oppsummering)

[Hvem kan lese hva, hvem kan skrive hva, separert per sprint.]

---

## 13. SEO + AEO + LLM-søk

[**Følg `06-SECTION_DETAILS/seo-discovery.md` fullt ut.** Hvis lokal virksomhet med flere tjenester+steder, bygg full kombinasjons-grid. Ikke 10 generiske sider — alle relevante sted×tjeneste-URLs.]

### 13.1 URL-grid (kritisk for lokale virksomheter)

| | Tjeneste 1 | Tjeneste 2 | Tjeneste 3 | ... |
|-|------------|------------|------------|-----|
| Sted A | /[t1]/[a] | /[t2]/[a] | /[t3]/[a] | ... |
| Sted B | /[t1]/[b] | /[t2]/[b] | /[t3]/[b] | ... |
| ... | | | | |

Hver celle har egen URL med minst 800 ord unikt innhold, JSON-LD `Service` + `LocalBusiness`, AEO-blokker, og redigerbar SEO i CMS. Generelle tjeneste-sider og stedssider også separat.

### 13.2 JSON-LD per side-type (med fullstendige eksempler)

- Forside: `Organization` + `LocalBusiness` + `WebSite` med `SearchAction`
- Sted × tjeneste: `Service` med `areaServed` + `LocalBusiness` + `BreadcrumbList` + `FAQPage`
- Tjeneste-side: `Service` + `FAQPage` + `BreadcrumbList`
- Sted-side: `Place` + lenker til alle tjenester
- Blogg-post: `Article` + `BreadcrumbList` + `ImageObject`
- Kontakt: `LocalBusiness` + `ContactPage`
- Om oss: `AboutPage` + `Organization` med ansatte
- Person-sider: `Person` med `jobTitle` + `sameAs`

### 13.3 Sitemap + robots + llms

- `app/sitemap.ts` — auto-generert fra DB inkl. ALLE sted×tjeneste-URLs
- `app/robots.ts` — auto-generert
- `app/llms.txt/route.ts` — index av tjenester + områder + kontakt
- `app/llms-full.txt/route.ts` — full markdown-eksport av alle published sider

### 13.4 OG image-strategi

- `app/opengraph-image.tsx` per side-type med design-tokens fra valgt retning
- Per side: egen OG image (1200×630, ikke gjenbrukt)
- Editerbar i CMS

### 13.5 AEO (Answer Engine Optimization)

- FAQ-blokker på alle service-sider og kombinasjons-sider
- Korte, faktisk-presise avsnitt LLM-er kan sitere direkte
- Inkluder år, by-navn, tall der relevant
- 5+ Q&A per kombinasjons-side

### 13.6 Bilde-SEO

- Beskrivende filnavn (ikke `IMG_1234.jpg`)
- Alt-tekst krav i CMS (jf. regel #15)
- Caption + dimensjoner lagret
- AVIF/WebP auto-konvertering
- `ImageObject` JSON-LD for hovedbilder
- Geolocation i EXIF for lokale bilder

### 13.7 Internal linking-strategi

- Hver tjeneste-side → alle steds-versjoner
- Hver sted-side → alle tjeneste-versjoner
- Footer: full liste over alle hovedtjenester + alle områder
- Brødsmuler på alle dyp-sider

### 13.8 Core Web Vitals-mål

[Fra `04-QUALITY_GATES.md`. List eksplisitt: LCP <2.5s, INP <200ms, CLS <0.1, FCP <1.5s, TBT <200ms.]

### 13.9 CMS-integrasjon for SEO

Per side i CMS, redigerbart:
- Meta title (override site-default)
- Meta description
- OG image (egen + override)
- Canonical URL (default = self)
- noindex/nofollow flag
- JSON-LD-overstyring

---

## 14. Sikkerhet

[Følg `04-QUALITY_GATES.md` §6. Inkluder:]

### 14.1 CSP

[Nonce-basert CSP. Konkret header.]

### 14.2 Andre headers

[HSTS, X-Frame, etc.]

### 14.3 RLS

[Per-tabell policy-oversikt — referer til §12.]

### 14.4 Skjemaer

[Turnstile + honeypot + Zod + rate-limit per skjema.]

### 14.5 Secrets — 3-stedssync

[Følg `06-SECTION_DETAILS/vercel-cli-and-secrets.md`. **AI skal selv** sette secrets via Vercel CLI + `gh secret set` — ikke be brukeren gå i Dashboard. Hver secret må settes **tre steder samtidig**: `.env.local` + Vercel (Production + Preview + Development) + GitHub Actions.]

| Secret | Bruk | .env.local | Vercel (3 env) | GH secret |
|--------|------|------------|----------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Klient + server | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Klient | ✓ | ✓ | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | ✓ | ✓ | ✓ |
| `SUPABASE_ACCESS_TOKEN` | Migrations workflow | — | — | ✓ |
| `SUPABASE_PROJECT_REF` | Workflow id | — | — | ✓ |
| `SUPABASE_DEV_DB_URL` | Dev-branch | — | — | ✓ |
| `RESEND_API_KEY` | Email-send | ✓ | ✓ | ✓ |
| `RESEND_FROM_EMAIL` | Sender | ✓ | ✓ | ✓ |
| `TURNSTILE_SITE_KEY` | Public anti-spam | ✓ | ✓ | ✓ |
| `TURNSTILE_SECRET_KEY` | Server anti-spam | ✓ | ✓ | ✓ |
| `UPSTASH_REDIS_REST_URL` | Rate-limit | ✓ | ✓ | ✓ |
| `UPSTASH_REDIS_REST_TOKEN` | Rate-limit | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SITE_URL` | Absolutt URLs | ✓ | ✓ | ✓ |
| `CRON_SECRET` | Vercel Cron auth | ✓ | ✓ | ✓ |
| [+ prosjektspesifikke] | | | | |

**Initial-setup-script** (kjøres på Sprint 0):

```bash
# AI: erstatt verdiene før kjøring
TOKEN="$env:VERCEL_TOKEN"  # Sett VERCEL_TOKEN som Windows-miljøvariabel
REPO=helgelunde1981-creator/[prosjekt-repo]

for SECRET_PAIR in \
  "NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co" \
  "SUPABASE_SERVICE_ROLE_KEY=eyJxxx" \
  ; do
  NAME="${SECRET_PAIR%%=*}"
  VALUE="${SECRET_PAIR#*=}"
  echo "$NAME=\"$VALUE\"" >> .env.local
  for ENV in production preview development; do
    printf "%s" "$VALUE" | npx vercel env add "$NAME" "$ENV" --token "$TOKEN"
  done
  gh secret set "$NAME" --body "$VALUE" -R "$REPO"
done

# Bekreft alle 3
grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | head -1
npx vercel env ls --token "$TOKEN" | grep NEXT_PUBLIC_SUPABASE_URL
gh secret list -R "$REPO" | grep NEXT_PUBLIC_SUPABASE_URL
```

**`.gitignore`** må inkludere `.env`, `.env.local`, `.env.*.local`.

### 14.6 Rate-limiting

[Konkrete grenser per endpoint.]

### 14.7 Supabase admin-oppsett (Dashboard-only — krever manuell gjennomføring)

[Automatiseres av kickstart-bootstrap via Supabase Management API (`PATCH /v1/projects/{ref}/config/auth`). Re-kan kjøres fra prosjektsiden i admin via «Sett Supabase Auth-config»-knappen.]

**Automatisert (via Management API — du gjør INGENTING i Dashboard):**
- [x] **Auth → URL Configuration**: Site URL + redirect URLs (også for dev-branch)
- [x] **Auth → Email Templates**: alle 6 designede HTML-maler (Confirm signup, Magic link, Reset password, Invite user, Change email, Reauthentication)
- [x] **Auth → SMTP Settings**: Resend SMTP (smtp.resend.com:587, sender: prosjektnavn)

**Krever Dashboard (kan ikke automatiseres):**
- [ ] **Auth → Providers**: OAuth (Google/GitHub osv.) — krever client-secret som må genereres hos provider
- [ ] **Database → Backups**: Point-in-Time Recovery (krever Pro-plan-bekreftelse)
- [ ] **Storage → Bucket-policyer**: per bucket public/private + custom RLS-policyer per prosjekt

Test-email mottatt og verifisert (etter automatisk oppsett).

---

## 15. GDPR + lovpålagt (Norge)

[Følg `06-SECTION_DETAILS/compliance-norge.md`. Inkluder alle lover som gjelder basert på kundedata:]

### 15.1 GDPR

[Personvern-policy, slett/innsyn-endpoints. Samtykke-logg ligger hos Cookiebot — ikke egen tabell.]

### 15.2 Cookies — KUN Cookiebot (aldri egen banner)

[Consent håndteres ALLTID av Cookiebot. Vi bygger ALDRI egen cookie-banner eller `cookie_consents`-tabell.
Beskriv: Cookiebot-script i `<head>` med `data-cbid` + `data-blockingmode="auto"`, `/cookies` med Cookiebots
`CookieDeclaration`-script, footer-lenke som åpner Cookiebot-dialogen på nytt, og at analytics/marketing kun
lastes etter samtykke for riktig kategori. CSP MÅ ha `consent.cookiebot.com` + `consentcdn.cookiebot.com` i
script-src OG connect-src (se §14.2 / `csp-config.md`). **Spør Helge om Cookiebot-CBID/kode — kan ikke gjettes
(legg i «Spørsmål til kunden»).**

Lever en **cookie-oversikt** (tabell): hver cookie/tracker med navn, 1st/3rd party, kategori (Nødvendig/
Statistikk/Markedsføring/Preferanser), formål, varighet, hvor den settes (offentlig/innlogget), og om den
fanges av Cookiebots auto-scan eller MÅ legges inn manuelt. **Cookiebot-scanneren ser kun offentlige sider** —
cookies/trackere bak innlogging (dashboard/admin/min side), etter brukerhandling, dynamisk injisert, eller
server-/first-party (Supabase `sb-*`, CSRF, rate-limit, Turnstile `cf_*`) MÅ føres manuelt i Cookiebot →
«Manually added cookies and trackers». Se `06-SECTION_DETAILS/compliance-norge.md`.]

### 15.3 E-handelsloven

[Hvis salg.]

### 15.4 Åpenhetsloven

[Hvis terskel (omsetning > 70 mill, > 50 ansatte). Hvis ikke: "Ikke aktuelt — under terskel".]

### 15.5 Universell utforming-loven

[Hvis offentlig sektor eller B2C-skala. Tilgjengelighetserklæring.]

### 15.6 Markedsføringsloven

[Hvis markedsføring.]

### 15.7 Andre

[Bransjespesifikke.]

### 15.8 GDPR-behandlingsprotokoll (Myrvoll-Lunde IT Drift master)

[OBLIGATORISK Sprint 0-oppgave. Registrer prosjektet i master-protokollen
`~/Documents/GitHub/mlit/docs/compliance/Behandlingsprotokoll-MLITDrift.md`
(single source of truth — ALDRI dupliser inn i dette repoet). Skriv ut: rolle (egen=behandlingsansvarlig
/ klient=databehandler), kartlagte databehandlere + funksjoner (fra package.json+src+.env), rad i
«Prosjektregister» (Supabase-ref + region + repo + rolle + Cookiebot-status), rad i riktig art.30-seksjon,
nye underdatabehandlere ført i «Underdatabehandlere» + speilet i personvern, og oppdatert Forside-dato.
**Vedlikehold:** AGENTS.md «sjekk først» minner om å oppdatere protokollen ved ny databehandler/datatype/
funksjon. Se `06-SECTION_DETAILS/compliance-norge.md` → «GDPR art. 30-behandlingsprotokoll».]

---

## 15.5 E-postmaler (designet HTML)

[Følg `06-SECTION_DETAILS/email-templates.md`. Liste over ALLE maler som skal lages, med react-email-mønster + matchende design-tokens fra valgt retning. Auth-maler kopieres til Supabase Dashboard (se §14 admin-sjekkliste). Footer i hver mal: «Utviklet av Myrvoll-Lunde IT Drift» → mlit.no.]

| Mal | Type | Trigger | Sender via |
|-----|------|---------|------------|
| MagicLink | Auth | Innlogging | Supabase Auth SMTP (Resend) |
| ConfirmEmail | Auth | Etter registrering | Supabase Auth SMTP |
| ResetPassword | Auth | Glemt passord | Supabase Auth SMTP |
| Invitation | Auth | Superadmin inviterer | Supabase Auth SMTP |
| ContactReceipt | Transactional | Bruker sender kontaktskjema | Resend (Server Action) |
| [...] | [...] | [...] | [...] |

Mappestruktur: `emails/{auth,transactional,marketing}/*.tsx`.

---

## 16. DNS + email-deliverability

[Følg `06-SECTION_DETAILS/dns-email.md`.]

### 16.1 Domain setup
### 16.2 DNS-records
### 16.3 Email-deliverability (Resend)
### 16.4 Redirect-strategi
### 16.5 www-canonical
### 16.6 TLS / cert
### 16.7 Robots / sitemap / llms.txt

---

## 17. Analytics + KPI + post-launch måling

[Følg `06-SECTION_DETAILS/analytics-kpi.md`.]

### 17.1 Analytics-stack
### 17.2 Måleplan per side
### 17.3 Konkrete KPI-er (måned 1, 3, 6)
### 17.4 Dashboards
### 17.5 Rapportering
### 17.6 GDPR-håndtering

---

## 18. Monitoring + alerting + DR

[Følg `06-SECTION_DETAILS/monitoring-dr.md`.]

### 18.1 Uptime-monitoring
### 18.2 Error tracking (Sentry)
### 18.3 Performance-monitoring
### 18.4 Alerting
### 18.5 Backup-strategi (Supabase PITR)
### 18.6 Disaster Recovery Plan
### 18.7 Status-page
### 18.8 Incident response runbook

---

## 19. GitHub-flyt + CI/CD + Supabase branching

### 19.1 Branching

- `main` → produksjon (Vercel + Supabase prod)
- `dev` → preview/staging (Vercel preview + Supabase dev-branch)
- `feature/*` → PR mot `dev`

PR-krav: minst 1 review + alle CI-sjekker grønne.

### 19.1.1 Migrasjoner — KUN via GitHub Actions + Supabase Branching

**Forbudt** (ingen unntak):
- ❌ `npx supabase db push` lokalt mot prod
- ❌ `psql` mot prod-connection
- ❌ MCP-Supabase `apply_migration`
- ❌ Endringer via Dashboard SQL Editor
- ❌ Manuelle skjema-endringer i Studio

### Filnavn-konvensjon

`supabase/migrations/YYYYMMDDHHMMSS_kort_beskrivelse.sql`

| Del | Format | Eksempel |
|-----|--------|----------|
| Timestamp | YYYYMMDDHHMMSS (UTC) | `20260528143052` |
| Separator | `_` | `_` |
| Beskrivelse | snake_case, ASCII, ≤ 40 tegn | `add_kickstart_projects` |
| Filendelse | `.sql` | `.sql` |

Generer ALLTID med: `npx supabase migration new <navn>` (CLI gir riktig timestamp).

### Flyt

1. **Lokalt:** `npx supabase migration new <navn>` → skriv SQL → commit til feature-branch
2. **PR mot `dev`:** GitHub Actions kjører dry-run i PR → migrerer dev-branch DB ved merge
3. **PR fra `dev` til `main`:** GitHub Actions kjører migrasjonene mot prod-DB

### Supabase Branching

Aktiveres i Dashboard → Settings → Branching:
- **Persistent dev-branch:** felles for `dev`-Git-branch
- **Hoved-branch (prod):** for `main`-Git-branch

### Sprint 0-leveranser (obligatorisk)

- [ ] `.github/workflows/supabase-migrations.yml` (mal i `06-SECTION_DETAILS/datamodell.md`)
- [ ] GitHub secrets: `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DEV_DB_URL`
- [ ] Supabase Branching aktivert
- [ ] Initial migrasjon kjørt via workflow (ikke lokalt)

### 19.2 GitHub Actions

Jobber (i denne rekkefølgen):

1. lint
2. typecheck
3. unit (Vitest)
4. build
5. e2e (Playwright — kun main)
6. lighthouse (med assertions fra `04-QUALITY_GATES.md`)
7. supabase-migrate (på push til dev/main)

### 19.3 Vercel auto-deploy

- main → produksjon
- dev → preview-deploy
- Aldri manuell `vercel deploy`

### 19.4 Secrets-flyt

- `.env.local` (gitignored)
- `vercel env add NAVN` per environment
- `gh secret set NAVN`

[Liste alle secrets fra §14.5 med kommandoer.]

---

## 20. Sprintplan

[**Følg `06-SECTION_DETAILS/sprint-planning.md` fullt ut.** Hver eneste oppgave fra alle 19 regler + alle 04-QUALITY_GATES-sjekklister + alle fragmenter skal være eksplisitt bullet i en sprint. Ingen «osv.». Hver sprint har mål, varighet, avhengigheter, oppgaver (eksplisitt), test-kriterier, og leveranse.]

Basert på `sprint_estimate` fra kundedata. Standard mal:

### Sprint 0 — Grunnmur (1 dag)
- [ ] GitHub repo opprettet
- [ ] Next.js 15 scaffolded
- [ ] Dependencies installert
- [ ] Supabase prosjekt opprettet og linked
- [ ] Vercel prosjekt opprettet + auto-deploy aktivert
- [ ] Resend domain verifisert
- [ ] Turnstile-konto + keys
- [ ] `.env.local` + Vercel env + GitHub secrets satt
- [ ] Obsidian-vault auto-registrering kjørt
- [ ] CI/CD pipeline grønn
- **Leveranse:** Tom Next.js-app deployer automatisk

### Sprint 1 — Database + Auth + skall + brand-assets + (hvis `requires_scrape`) scrape-pipeline (3 dager)
[...]

**Brand-assets (alltid — Sprint 2 starter ikke uten alle 6):**

- [ ] `public/logo.svg` (eller .png ≥240×80 retina) — kilde: wizard → scrape → plassholder med initialer
- [ ] `public/favicon.ico` (multi-res) generert via `pnpm dlx pwa-asset-generator`
- [ ] `public/apple-icon.png` 180×180
- [ ] `public/icon-192.png` + `public/icon-512.png` for PWA-manifest
- [ ] OG-image: enten `public/og-image.png` (1200×630, designet — ikke screenshot) eller `src/app/opengraph-image.tsx` (dynamisk via Next 16 ImageResponse — anbefalt)
- [ ] `<link rel="icon">` + manifest.json + `<meta property="og:image">` koblet i layout

Hvis plassholder er brukt: flag i §6 + risikoliste at kunden må levere ekte logo innen Sprint 2. Full spec i `06-SECTION_DETAILS/brand-assets.md`.

**Sprint 1 done-verification (alltid):**

- [ ] `scripts/check-public-pages.ts` på plass + kjørt mot dev → snitt ≥9.0 over alle published pages
- [ ] CSP-konfigurert basert på `project.integrations` (se `06-SECTION_DETAILS/csp-config.md`) — zero violations i console
- [ ] Logo (C1), favicon (C2), OG-image (C3) verifisert grønne i Playwright-rapporten
- [ ] Footer-credit «Utviklet av Myrvoll-Lunde IT Drift» synlig på alle sider (C4)

**Hvis `requires_scrape: true` — i tillegg:**

- [ ] `scripts/scrape-existing-site.ts` skrevet og kjørt → `data/scraped/*.json` finnes med ALLE sider fra sitemap.xml (ikke whitelist)
- [ ] `scripts/import-scraped-content.ts` skrevet og kjørt → pages + page_sections + articles + settings populated, **bilder koblet til seksjoner via `data.image_id`** (ikke bare uploadet)
- [ ] `scripts/import-scraped-images.ts` skrevet og kjørt → media-tabellen + storage populated
- [ ] `scripts/verify-scrape-import.ts` skrevet og kjørt → exit-code 0
- [ ] `.github/workflows/verify-scrape.yml` på plass — PR-blokker hvis dekning ikke matcher
- [ ] Output fra verify-skriptet limt inn i sprint-rapporten (DB-count vs fil-count)
- [ ] Manuell sjekk: åpne 3 tilfeldige scrapede sider i CMS-admin og verifiser at innhold er der

**Ingen Sprint 2 før alle punktene er huket av.** Se `06-SECTION_DETAILS/scrape-pipeline.md` + `sprint-done-verification.md` for kode-eksempler.

### Sprint 2 — Public design-system + layout + meny fra pages-tabellen (3 dager)
[...]

Meny-arkitektur (kritisk — anti-pattern fra container-consult-as):

- [ ] `pages`-tabellen utvidet med `show_in_nav boolean default true` + `nav_order integer default 100`
- [ ] `MainNav.tsx` itererer ALLE `pages WHERE is_published AND show_in_nav` ordnet på `nav_order` — ikke services
- [ ] Tjenester (hvis `services`-tabell finnes) vises som dropdown under «Tjenester»-pages-rad
- [ ] Alle scrapede sider (om-oss, faq, nyheter, kontakt, etc.) er nådbare via meny ELLER footer
- [ ] `check-public-pages.ts D1/D2` grønn (≥4 header-lenker + alle returnerer 200)

[Antall sprinter justeres etter `sprint_estimate`. Hver sprint har: nummer, navn, varighet, oppgaveliste (checkbox), leveranse, **+ done-verification: `check-public-pages.ts` snitt ≥9.0**.]

### ALLE sprinter — done-verification (alltid)

Ingen sprint kan rapporteres som ferdig uten:

- [ ] Alle planlagte oppgaver implementert + tests grønne
- [ ] `pnpm tsx scripts/check-public-pages.ts` lokalt mot dev — snitt ≥9.0 over berørte sider
- [ ] CI `.github/workflows/quality-gate.yml` grønn på siste PR mot dev
- [ ] `docs/sprint-reports/sprint-<N>-quality.md` committed med per-side score
- [ ] Hvis snitt <9.0: gjenta sprinten med fokus på topp-3 manglene fra rapporten

**Forbud:** «Det ser bra ut i koden», «ingen feil i koden», «burde være riktig» — åpne siden, mål, iterer. Full standard i `06-SECTION_DETAILS/sprint-done-verification.md`.

### Siste sprint — Pre-launch (sikkerhet + readiness)

**OBLIGATORISK. Kan ikke hoppes over.** Full sjekkliste i `06-SECTION_DETAILS/pre-launch-checklist.md`.

15 områder skal gjennomgås, dokumenteres og signeres av minst 2 personer (utvikler + Helge/kunde):

1. **Sikkerhet** — headers (A+ på securityheaders.com), RLS, secrets-audit, input-validering, anti-spam, auth-flyt, light penetrasjonstest, security-reviewer-agent
2. **Performance** — Lighthouse ≥ 95 alle, CWV «good» p75, bundle-budsjett, bilder optimalisert
3. **Accessibility (WCAG 2.2 AA)** — axe-core 0 violations, keyboard-test, kontrast, ARIA, reduced-motion
4. **SEO** — sitemap + robots + llms.txt, JSON-LD validert, OG-tags, indeksering aktivert
5. **Compliance (Norge)** — GDPR-endpoints, Cookiebot consent (aldri egen banner), Åpenhetsloven, universell utforming, vilkår, angrerett
6. **DNS + e-post** — A/CNAME, DKIM+SPF+DMARC, HTTPS enforced, Mail-Tester ≥ 9/10
7. **Supabase admin** — Auth-config (URL/redirects/SMTP/Email Templates) automatisert via Management API — verifiseres. Manuelt i Dashboard: OAuth-providers, PITR, Storage-policyer (§14.7)
8. **CMS** (hvis aktuelt) — alt redigerbart verifisert, bilde-opplasting, live preview, versjonering, roller, audit-log
9. **Forms** — alle skjemaer testet med ekte data, validering, rate-limit, Turnstile, honeypot
10. **Monitoring + DR** — uptime, /api/health, Sentry, alerts, PITR-restore testet i staging, runbooks skrevet
11. **Cross-browser + responsive** — Chrome/Firefox/Safari/Edge desktop + iPhone/Android/iPad
12. **Innhold** — ingen lorem/TODO/placeholder, stavekontroll, footer-credit, alt-tekst, kontaktinfo testet. Hvis `requires_scrape`: kjør `pnpm tsx scripts/verify-scrape-import.ts` mot prod-DB (exit 0), spot-sjekk 5 tilfeldige scrapede sider i prod, manuelt redigert alt-tekst på hero + topp-20 bilder, 301-redirects fra gamle URL-er på plass (mapping fra scraped `url`-felter)
13. **Sprint-leveranser** — alle suksesskriterier krysset av, test-dekning ≥ 80%, E2E grønn, Lighthouse CI grønn
14. **Kunde-sign-off** — sett alle sider, testet CMS, skriftlig akseptert, opplæring + dokumentasjon mottatt
15. **Lansering** — DNS TTL redusert 24t før, backup tatt, cutover-tid avtalt, rollback-plan, 24t vakt etter

**Leveranser:**
- [ ] `docs/launches/YYYYMMDD-launch-report.md` med status per sjekkliste-bullet + 2-personers sign-off
- [ ] Alle 15 områdene grønne eller eksplisitt akseptert som N/A
- [ ] Cutover utført — Live på {{new_domain}}

---

## 21. Project Memory bootstrap

> Lokal Claude oppretter `~/.claude/projects/c--Github-{{repo_name}}/memory/` ved første økt og kopierer filene under inn. AI **fyller ut Tier 1 helt** her, basert på wizard-input — ingen `<TBD>`. Tier 2-filene er skjeletter som lokal Claude fyller inn i Sprint 0.
>
> Full standard: `06-SECTION_DETAILS/project-memory.md`.

### 21.1 MEMORY.md (indeks)

```markdown
# {{project_name}} — Project Memory Index

> Globale regler ligger i ~/.claude/CLAUDE.md + ~/Documents/GitHub/CLAUDE.md.
> Her står kun det som er spesifikt for {{project_name}}.

## Tier 1 — Prosjekt-fakta
- [Stack & infra](project_stack.md) — Supabase ref, Vercel team+project, domener
- [Klient & kontakt](project_klient.md) — kunde, kontakt, org.nr hvis relevant
- [Secrets-strategi](project_secrets.md) — hvor secrets bor

## Tier 2 — Arkitektur (fylles inn av lokal Claude i Sprint 0)
- [Auth & roller](project_auth.md) — Supabase Auth, MFA, roller, RLS
- [Scope](project_scope.md) — multi-tenancy, team_id vs user_id
- [Integrasjoner](project_integrasjoner.md) — Resend, n8n, Stripe, etc.
```

### 21.2 project_stack.md

```markdown
---
name: project-stack
description: Infrastruktur-IDer og domener for {{project_name}}
metadata:
  type: project
---

# Stack & infra

- **Supabase project-ref (prod):** `{{supabase_prod_ref}}`
- **Supabase project-ref (dev/preview):** `{{supabase_dev_ref}}`
- **Vercel team:** `{{vercel_team_name}}` (`{{vercel_team_id}}`)
- **Vercel project-ID:** `{{vercel_project_id}}`
- **Prod-domene:** `{{prod_domain}}`
- **Repo:** `{{repo_url}}`
- **Default branch:** `{{default_branch}}` (Vercel deployer fra denne)

## Lokal CLI-shortcut

```bash
# Supabase SQL mot prod (via CLI, aldri MCP)
npx supabase db execute --project-ref {{supabase_prod_ref}} -f fil.sql

# Vercel CLI (token via VERCEL_TOKEN env-var eller allerede innlogget med 'vercel login')
TOKEN="$env:VERCEL_TOKEN"  # Sett VERCEL_TOKEN som Windows-miljøvariabel
npx vercel env add NAVN production --token "$TOKEN"
```
```

### 21.3 project_klient.md

```markdown
---
name: project-klient
description: Klient og kontakt-info for {{project_name}}
metadata:
  type: project
---

# Klient & kontakt

- **Klient:** {{client_name}}
- **Primær kontakt:** {{client_contact_name}}
- **Epost:** {{client_contact_email}}
- **Telefon:** {{client_contact_phone}}
- **Org.nr:** {{client_org_nr}} (hvis vi fakturerer)
- **Vault-notat:** `C:\Github\vault\klienter\{{client_name}}.md`
- **Prosjektnotat:** `C:\Github\vault\prosjekter\{{project_name}}.md`

## Bransje + kontekst

{{client_industry_context}}
```

### 21.4 project_secrets.md

```markdown
---
name: project-secrets
description: Hvor hver secret-kategori bor i {{project_name}}
metadata:
  type: project
---

# Secrets-strategi

Hver secret skal eksistere på alle tre steder:
1. `.env.local` (lokalt, gitignored)
2. Vercel env vars (Production + Preview + Development)
3. GitHub Actions secrets (`gh secret set`)

## Default-snippet for å sette en ny secret

```bash
NAME=MIN_SECRET
VALUE=hemmelig_verdi

# 1) .env.local
echo "$NAME=$VALUE" >> .env.local

# 2) Vercel (alle tre miljøer)
TOKEN="$env:VERCEL_TOKEN"  # Sett VERCEL_TOKEN som Windows-miljøvariabel
echo "$VALUE" | npx vercel env add $NAME production --token "$TOKEN"
echo "$VALUE" | npx vercel env add $NAME preview --token "$TOKEN"
echo "$VALUE" | npx vercel env add $NAME development --token "$TOKEN"

# 3) GitHub Actions
gh secret set $NAME --body "$VALUE"
```

## Spesielle plasseringer (overstyrer default)

- **Supabase service role key:** kun server-side i Vercel + Edge Functions, aldri klient
- **Supabase JWT-secret:** kun Supabase Dashboard, aldri eksportert
- **{{custom_secret_locations}}**
```

### 21.5 project_auth.md (skjelett)

```markdown
---
name: project-auth
description: Auth-flyt, roller og RLS-mønster for {{project_name}}
metadata:
  type: project
---

# Auth & roller

> Fylles inn av lokal Claude i Sprint 0 etter at auth er implementert.

- **Auth-provider:** {{auth_provider}}
- **MFA:** {{mfa_required}}
- **Roller:** {{roles_list}}
- **RLS-mønster:** {{rls_pattern}}
- **Helper-funksjoner (security definer):** {{rls_helpers}}
- **Edge Functions JWT:** {{edge_jwt_strategy}}
```

### 21.6 project_scope.md (skjelett)

```markdown
---
name: project-scope
description: Multi-tenancy og scope-modell for {{project_name}}
metadata:
  type: project
---

# Scope og multi-tenancy

> Fylles inn av lokal Claude i Sprint 0.

- **Multi-tenancy-modell:** {{tenancy_model}} (team-scoped / user-scoped / single-tenant)
- **Tabeller med team_id:** {{team_scoped_tables}}
- **Tabeller med user_id:** {{user_scoped_tables}}
- **Impersonation-mønster:** {{impersonation_pattern}}
```

### 21.7 project_integrasjoner.md (skjelett)

```markdown
---
name: project-integrasjoner
description: Eksterne tjenester koblet til {{project_name}}
metadata:
  type: project
---

# Eksterne integrasjoner

> Fylles inn av lokal Claude i Sprint 0 etter integrasjonene er koblet opp.

| Tjeneste | URL/Account | Nøkkelfaktum |
|----------|-------------|--------------|
| Resend | {{resend_from_domain}} | Fra-adresse, SPF/DKIM verifisert |
| n8n | https://n8n.mlit.no | Webhook for transaksjonseposter |
| Stripe | {{stripe_account_id}} | {{stripe_mode}} (live/test) |
| {{other_integrations}} | ... | ... |
```

### 21.8 Bootstrap-instruks (kjøres av lokal Claude i første økt)

```powershell
# Windows PowerShell (primær shell)
$PROJ_PATH = "c--Github-{{repo_name}}"
$MEM_DIR = "$env:USERPROFILE\.claude\projects\$PROJ_PATH\memory"
New-Item -ItemType Directory -Force -Path $MEM_DIR

# Kopier hver av de 7 filene over inn i $MEM_DIR\<filnavn>.md
# (MEMORY.md, project_stack.md, project_klient.md, project_secrets.md,
#  project_auth.md, project_scope.md, project_integrasjoner.md)
```

Lokal Claude bekrefter med én linje: `✅ Memory bootstrap fullført — {{count}} filer opprettet i $MEM_DIR`.

---

## 22. Auto-evaluator (10/10 målbart på hver PR)

> Full standard: `06-SECTION_DETAILS/auto-evaluator.md`.
> Hver PR til `main` MÅ passere alle 7 sjekker — ellers blokkeres merge.

### 22.1 Filer som SKAL ligge i prosjektet

| Fil | Formål |
|-----|--------|
| `.github/workflows/quality-gate.yml` | Kjører ved push + PR |
| `scripts/check-cms-coverage.ts` | 0 hardkodet kundetekst |
| `scripts/check-footer-credit.ts` | «Utviklet av Myrvoll-Lunde IT Drift» på alle public-ruter |
| `scripts/check-a11y.ts` | axe-core: 0 critical/serious |
| `scripts/check-lighthouse.ts` | Performance/A11y/BP/SEO ≥ 95 |
| `scripts/check-email-rendering.ts` | Alle react-email-maler rendrer + footer-credit |
| `scripts/check-broken-links.ts` | Sitemap + internlenker svarer 2xx/3xx |
| `scripts/score-delivery.ts` | Samler, scorer 0-10 per dimensjon, persister til mlit-DB |

Mal-filer i `EXAMPLES/scripts/check-*.ts.example` og `EXAMPLES/github-workflows/quality-gate.yml.example`.

### 22.2 package.json-scripts

```json
{
  "scripts": {
    "check:cms-coverage": "tsx scripts/check-cms-coverage.ts",
    "check:footer-credit": "tsx scripts/check-footer-credit.ts",
    "check:a11y": "tsx scripts/check-a11y.ts",
    "check:lighthouse": "tsx scripts/check-lighthouse.ts",
    "check:email-rendering": "tsx scripts/check-email-rendering.ts",
    "check:broken-links": "tsx scripts/check-broken-links.ts",
    "score:delivery": "tsx scripts/score-delivery.ts",
    "quality:check": "pnpm check:cms-coverage && pnpm check:footer-credit && pnpm check:broken-links && pnpm check:email-rendering && pnpm check:lighthouse && pnpm check:a11y",
    "quality:score": "pnpm score:delivery"
  }
}
```

### 22.3 GitHub Secrets som workflow trenger

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for `pnpm start`)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (for å skrive til `delivery_scores` i mlit-DB)

### 22.4 PR-kommentar

Action poster en markdown-tabell som PR-kommentar med 0-10 score per dimensjon + total + bevis-link.

---

## 23. AGENTS.md (AI-kontrakt for fremtidige økter)

> Full standard: `06-SECTION_DETAILS/agents-md.md`.

`AGENTS.md` ligger i prosjekt-roten og leses av Claude Code, Codex, og andre AI-verktøy ved sesjon-start. Den definerer:

1. **Obligatorisk lese-rekkefølge:** PROJECT.md → memory → ~/.claude/CLAUDE.md → standardene → koden
2. **Source-of-truth-hierarki:** spec > standards > memory > globale regler > default
3. **Aldri-liste:** dev-server, force-push, db push lokalt, commit secrets
4. **Sjekk-først-liste:** grep før du bygger nytt
5. **Stack-snapshot:** versjoner og valg
6. **Conventions:** branch-flyt, commit-format, migrasjons-filnavn
7. **Quality gates:** referanse til §22

Mal i `EXAMPLES/templates/AGENTS.md.example`. AI fyller ut placeholders fra wizard-data.

---

## 24. Design Preview (Sprint 0 leveranse, før Sprint 1)

> Full standard: `06-SECTION_DETAILS/design-preview.md`.

Sprint 0 leverer **én statisk HTML-side** med hero + nav + footer + 3 mid-sections i valgt 2026-retning. Deployes til `preview-{{repo_name}}.mlit.no`. Klienten godkjenner skriftlig FØR Sprint 1 starter.

### 24.1 Innhold

- Hero (full viewport, overskrift, tagline, 1-2 CTA, visuell stil per retning)
- Sticky nav med 5-7 lenker + theme-toggle
- 3 mid-sections (features, statement, proof)
- Footer med «Utviklet av Myrvoll-Lunde IT Drift» + lenke

### 24.2 Tekniske krav

- Ren HTML + CSS (mal i `EXAMPLES/templates/design-preview.html.example`)
- Maks 200 kB total
- Mobile + desktop responsiv
- Light + dark variant hvis retning støtter begge

### 24.3 Godkjennings-flyt

1. CLI deployer preview
2. Auto-mail til klient med link + «Godkjenn ved å svare 'Godkjent'»
3. Helge følger opp etter 48t hvis stille
4. Lagre `design_approved_at` + `design_approved_by` i `kickstart_projects`
5. Sprint 1 starter ikke uten godkjenning

### 24.4 Iterasjon

2 runder gratis. Etter det: konsulent-timer (lagt i §7).

---

## 25. Pre-launch verify-skript

> Full standard: `06-SECTION_DETAILS/pre-launch-checklist.md` (manuell) + dette automatiserte skriptet.

`scripts/prelaunch-verify.ts` automatiserer det målbare i sjekklisten. Kjøres som obligatorisk steg i siste sprint.

### 25.1 Hva skriptet sjekker

| ID | Sjekk | Pass-krav |
|----|-------|-----------|
| `dns-a` | DNS A-record på prod-domene | Minst 1 record |
| `dns-mx` | DNS MX | Minst 1 record |
| `email-spf` | SPF TXT | `v=spf1` tilstede |
| `email-dmarc` | DMARC | `_dmarc.{{prod_domain}}` finnes |
| `ssl` | HTTPS svarer | < 500 |
| `supabase-conn` | Supabase REST tilgjengelig | 200 |
| `rls` | RLS på alle public-tabeller | 0 uten RLS |
| `health` | `/api/health` | 200 |
| `sitemap` | `sitemap.xml` | 200 |
| `robots` | `robots.txt` | 200 |
| `stripe-prod` | Stripe live-key (ikke test_) | `sk_live_*` |

### 25.2 Bruk

```bash
PROD_DOMAIN={{prod_domain}} \
NEXT_PUBLIC_SUPABASE_URL=<supabase-url> \
SUPABASE_SERVICE_ROLE_KEY=<key> \
SUPABASE_PAT=<pat> \
pnpm tsx scripts/prelaunch-verify.ts
```

Ingen lansering hvis output er rødt.

---

## 26. Post-launch survey + monitoring

> Full standard: `06-SECTION_DETAILS/post-launch-survey.md`.

3 leveranser:

### 26.1 Plausible Analytics

Personvernvennlig (ingen cookies), GDPR-compliant. Script i `app/layout.tsx`. Standard custom events:
- `cta_clicked`, `contact_submitted`, `signup_completed`, `purchase_completed`

### 26.2 Vercel Speed Insights

Aktivert i `next.config.ts`. Gir reelle CWV-tall fra P75 av besøkende — supplerer Lighthouse lab-tall.

### 26.3 Customer Survey (14d + 90d)

Cron i mlit sender HTML-mail til `client_email` 14 og 90 dager etter `launched_at`. 3 spørsmål: NPS + best_thing + improvement_wanted. Svar lagres i `customer_surveys`-tabellen, auto-tagges med LLM, eksporteres til klient-notatet i Vault.

---

## 27. Sprint 0 bootstrap-CLI

> Full standard: `06-SECTION_DETAILS/sprint-0-bootstrap.md`.

Etter at PROJECT.md er ferdig generert kjører Helge:

```bash
pnpm tsx scripts/create-mlit-project.ts --kickstart-id {{id}}
```

CLI-en gjør (idempotent):
1. Verifiser kickstart-data
2. Opprett GitHub repo (helgelunde1981-creator/{{repo_name}})
3. Opprett Supabase-prosjekt
4. Koble Vercel project
5. Distribuer secrets på 3 steder (.env.local + Vercel + GH)
6. Første migrasjon + GitHub Actions
7. Memory bootstrap (kopierer §21-filene inn)
8. Vault-registrering
9. Deploy design preview
10. Endrapport

Estimert tid: 5 minutter (vs. 60-90 manuelt).

State-fil i `~/.claude/bootstrap-state/{{repo_name}}/bootstrap-state.json` for å støtte resume etter krasj.

---

## Ikke i scope (sprint 1)

[Fra `out_of_scope`-feltet. Eksplisitt liste over bevisst utsatte features.]

- [...]

---

## Self-review (AI fyller ut helt til slutt — obligatorisk)

> Helt på slutten av PROJECT.md, etter sprintplanen er ferdig, leser AI gjennom HELE specen som nettopp ble generert. For HVERT punkt nedenfor: kryss av ✓ + nevn hvor i specen det er adressert (seksjonsnummer), eller kryss ✗ med eksplisitt forklaring + hva som må fikses. **Hvis det er noe ✗, gå tilbake og fiks før du leverer.**

### Prinsipper (4)

- [ ] **Prinsipp 1 — Kundeopplevelse er HOVEDPARAMETER:** hvert ikke-trivielt valg har én-setnings UX-rasjonale (sjekk §2, §5, §8, §10)
- [ ] **Prinsipp 2 — Still spørsmål om alt uavklart:** «Spørsmål til kunden» har minst 3 konkrete spørsmål
- [ ] **Prinsipp 3 — Foreslå forbedringer aktivt:** §4.5 har minst 2 forbedringsforslag
- [ ] **Prinsipp 4 — Aldri hopp over, aldri juks:** ingen «[...] osv.», «[Følger samme mønster]», «[Resten av tabellen]» i hele specen (søk gjennom: hvis du finner ett tilfelle, gå tilbake og fyll ut)

### Absolutte regler (19)

- [ ] **Regel 1 — Aldri generic templates:** § 2 bekrefter valgt 2026-retning + § 9 har faktiske tokens
- [ ] **Regel 2 — Konkret designretning:** § 2 nevner én av de 9, ikke «clean modern»
- [ ] **Regel 3 — Designsystem som kode:** § 9 har CSS custom properties + Tailwind-config-snutter
- [ ] **Regel 4 — Signature moment:** § 5 har hva/hvor/oppførsel/hvorfor/suksessmetrikk
- [ ] **Regel 5 — 10/10-suksesskriterier:** suksesskriterier-seksjonen lister ALLE terskler fra `04-QUALITY_GATES.md`
- [ ] **Regel 6 — Norge-compliance:** § 15 nevner alle relevante lover (GDPR + Åpenhetsloven hvis terskel + universell utforming hvis aktuelt + e-handel hvis salg + markedsføring)
- [ ] **Regel 7 — Aldri anta features:** ingen features lagt til ut over kundedata uten å være flagget som «Forutsetning: X» eller i forbedringsforslag
- [ ] **Regel 8 — Ingen forbudte fraser:** søk gjennom spec for «SEO-innhold på autopilot», «revolusjonerende», «game-changer», «sømløs integrasjon», «world-class», «best-in-class», «skreddersydd løsning», «innovativ», «klikk her» — 0 funn
- [ ] **Regel 9 — Ingen hardkodede brand-fraser:** alle taglines / brand-tekster i specen er enten fra kundedata eller flagget som forslag
- [ ] **Regel 10 — Norsk bokmål:** hele specen på bokmål (med mindre kunden eksplisitt vil engelsk)
- [ ] **Regel 11 — Footer-credit:** §11 nevner «Utviklet av Myrvoll-Lunde IT Drift» → mlit.no på alle public-sider + § 14.5 E2E-test
- [ ] **Regel 12 — Designede HTML-eposter:** §15.5 lister ALLE eposter prosjektet trenger med react-email + design-tokens + footer-credit
- [ ] **Regel 13 — Supabase admin-sjekkliste:** §14.7 har komplett Dashboard-sjekkliste (Redirect/Email/SMTP/Providers/PITR/Storage)
- [ ] **Regel 14 — Migrasjoner via GitHub Actions:** §19.1.1 spesifiserer flyt + filnavn-konvensjon + workflow-fil + GitHub secrets-liste
- [ ] **Regel 15 — CMS alt redigerbart:** § 10.5 + § 11 spesifiserer per side hvilke felter som er redigerbart, alle bilder via opplastingsmodul (ikke URL). **§ 11 har CMS-coverage-tabell for HVER public-side** (forside + alle tjeneste-sider + alle sted-sider + alle sted×tjeneste-kombinasjoner + kontakt + blogg + lovpålagt + 404/500). Hver rad har faktisk DB-mapping + redigeringsplass. Maks 3 ✗-statuser per side. `scripts/check-cms-coverage.ts` listet som leveranse
- [ ] **Regel 16 — Pre-launch sprint:** siste sprint har alle 15 områder fra `06-SECTION_DETAILS/pre-launch-checklist.md` som eksplisitte oppgaver + lanseringsrapport
- [ ] **Regel 17 — Vercel CLI + 3-stedssync:** §14.5 har secret-tabell med ✓ for hvor hver settes + initial-setup-script
- [ ] **Regel 18 — SEO sted×tjeneste-grid (skjulte sider):** §13.1 har full grid hvis lokal virksomhet, datamodell i §12 har `locations` + `services` + `service_locations`, footer-strategi + `/dekningsomrade`-side spesifisert
- [ ] **Regel 19 — Sprintplan med ALLE oppgaver eksplisitt:** ingen «osv.», hver regel/sjekkliste/side/mal/tabell/kombinasjon/skjema/secret/feature er konkret bullet
- [ ] **Regel 20 — Project Memory bootstrap:** §21 ferdig med Tier 1-filer fylt, ingen `<TBD>`
- [ ] **Regel 21 — Auto-evaluator:** §22 har 7 sjekk-skript + workflow listet
- [ ] **Regel 22 — AGENTS.md:** §23 har AGENTS.md-mal med alle 7 seksjoner
- [ ] **Regel 23 — Design Preview:** §24 har preview-leveranse spesifisert + godkjenningsflyt
- [ ] **Regel 24 — Pre-launch verify-skript:** §25 har skript listet som steg i siste sprint
- [ ] **Regel 25 — Post-launch monitoring:** §26 har Plausible + Speed Insights + survey-cron
- [ ] **Regel 26 — Sprint 0 bootstrap-CLI:** §27 nevner CLI-bruk eksplisitt

### Quality gates (`04-QUALITY_GATES.md`)

- [ ] **§ 0 Kundeopplevelse:** hvert ikke-trivielt valg har UX-rasjonale
- [ ] **§ 1 Ytelse:** Lighthouse ≥ 95 + CWV «good» + bundle-budsjett listet i suksesskriterier
- [ ] **§ 2 Bundle:** JS-/CSS-budget per side-type spesifisert
- [ ] **§ 3 Design-floor:** Anti-pattern listet i §6, minst 4 av 10 design-kvaliteter i §9
- [ ] **§ 4 Signature moment:** § 5 har alle 5 påkrevde komponenter
- [ ] **§ 5 Accessibility:** § 14/15 + suksesskriterier nevner WCAG 2.2 AA + axe-core + keyboard + reduced-motion + kontrast + touch-targets + tilgjengelighetserklæring
- [ ] **§ 6 Sikkerhet:** § 14 har RLS + CSP + Turnstile + rate-limit + secrets + headers + sanitization
- [ ] **§ 7 Compliance Norge:** § 15 har alle gjeldende lover
- [ ] **§ 8 Testdekning:** § 20 sprintplan nevner Vitest 80% + Playwright + axe + visual regression + cross-browser
- [ ] **§ 9 Critical paths:** § 20 lister forside, signature moment, skjemaer, auth, CMS, 404/500, RLS, footer-credit, e-postmaler, Supabase admin, CMS-redigering
- [ ] **§ 9.02 Sprintplan:** §20 oppfyller eksplisitt-krav (regel #19)
- [ ] **§ 9.03 Pre-launch sjekkliste:** siste sprint har alle 15 områder
- [ ] **§ 9.04 CMS:** § 10.5 spesifiserer alt redigerbart
- [ ] **§ 9.05 E-postmaler:** § 15.5 har alle maler designet + footer-credit + testet

### Spesifikke ting som ofte glemmes

- [ ] **Antall sider:** hvis lokal virksomhet med flere tjenester+steder, antall URLs er > 50, ikke «5-10 sider»
- [ ] **Antall eposter:** ≥ 8 (auth) + alle transaksjonelle per feature, ikke kun «kontakt + bekreftelse»
- [ ] **Antall sprint-oppgaver:** hver sprint har ≥ 10 konkrete oppgaver, ikke «implementer X»
- [ ] **Antall sekrets:** §14.5 har ≥ 15 secrets med 3-stedssync, ikke «sett env vars»
- [ ] **Antall JSON-LD-typer:** § 13.2 har ≥ 5 typer med fullstendige eksempler, ikke kun «JSON-LD»
- [ ] **Antall E2E-scenarier:** § 20 spesifiserer ≥ 10 scenarier, ikke «Playwright-tester»

### Konklusjon

- [ ] **Specen er produksjonsklar** — en utvikler kan bygge den uten å spørre om noe
- [ ] **Hvis noe ✗ over:** gått tilbake og fiksa det FØR levering
- [ ] **Hvis noe `N/A`:** eksplisitt begrunnet hvorfor (eks: «Ikke aktuelt — virksomhet ikke lokal»)

> AI som leverer en spec uten å fylle ut denne self-review-seksjonen jukser. Self-review er ikke valgfri.

---

## Spørsmål til kunden (krever avklaring)

**Du har stilt MINST 3 spørsmål her.** Hvert spørsmål er svarbart med ja/nei eller én linje tekst. Hvis du tok beslutninger på vegne av kunden i specen ovenfor (fordi du måtte for å fullføre datamodellen el.l.), flagg dem her som «Forutsetning: X. Vennligst bekreft.»

Mal per spørsmål:

> **Q1.** [konkret spørsmål — kort]
> *Hvorfor vi spør:* [én setning]
> *Hva som påvirkes:* [hvilke deler av specen som henger av svaret]
> *Vårt forslag:* [hvis du har en anbefaling — alltid begrunnet i kundeopplevelse]

[Minst 3 spørsmål. Eksempler:]

- Spørsmål om beslutninger som er antagelser (eks: «Skal bestilling være bindende, eller alltid tilbudsforespørsel?»)
- Spørsmål om manglende info (eks: «Hva er gjennomsnittlig leveringstid?»)
- Spørsmål om integrasjoner kunden ikke har spesifisert (eks: «Har dere eksisterende CRM vi skal koble mot?»)
- Spørsmål om compliance som krever bekreftelse (eks: «Omsetning > 70 mill NOK = Åpenhetsloven gjelder?»)
- Spørsmål om brand voice / tone (eks: «Du-form eller dere-form?»)

---

## Risiko

| Risiko | Sannsynlighet | Mitigering |
|--------|---------------|------------|
| [...] | [...] | [...] |

---

## Suksesskriterier (fullstendig sjekkliste)

Prosjektet er ferdig når **ALLE** disse er sant:

### Ytelse (fra 04-QUALITY_GATES §1)

- [ ] Lighthouse Performance ≥ 95 alle hovedsider
- [ ] Lighthouse SEO ≥ 95 alle hovedsider
- [ ] Lighthouse Accessibility ≥ 95 alle hovedsider
- [ ] Lighthouse Best Practices ≥ 95 alle hovedsider
- [ ] LCP < 2.5s p75
- [ ] INP < 200ms p75
- [ ] CLS < 0.1 p75
- [ ] FCP < 1.5s
- [ ] TBT < 200ms

### Bundle-budsjett (fra 04-QUALITY_GATES §2)

- [ ] Landing pages < 150 KB JS gzipped
- [ ] App-sider < 300 KB JS gzipped
- [ ] CSS < 30 KB gzipped landing

### Design (fra 04-QUALITY_GATES §3)

- [ ] Ingen anti-patterns levert
- [ ] Minst 4 av 10 design-kvaliteter demonstrert
- [ ] Signature moment implementert og fungerer

### Accessibility (fra 04-QUALITY_GATES §5)

- [ ] WCAG 2.2 AA verifisert med axe-core på alle sider
- [ ] Keyboard-nav på alle interaktive flater
- [ ] `prefers-reduced-motion` respektert overalt
- [ ] Kontrast ≥ 4.5:1 body, ≥ 3:1 stort
- [ ] Touch-targets ≥ 44×44 px på mobil

### Sikkerhet (fra 04-QUALITY_GATES §6)

- [ ] RLS aktivert på alle public tabeller
- [ ] CSP med nonce
- [ ] Alle skjemaer: Turnstile + Zod + rate-limit
- [ ] Secrets aldri commited
- [ ] HSTS + alle security headers

### Compliance (fra 04-QUALITY_GATES §7)

- [ ] GDPR-implementering komplett (banner, slett/innsyn)
- [ ] [Andre lover som gjelder]

### Test-dekning (fra 04-QUALITY_GATES §8)

- [ ] Vitest ≥ 80% statement coverage
- [ ] Alle critical paths E2E-testet
- [ ] Cross-browser grønn (Chrome, Firefox, Safari, Edge)
- [ ] Visual regression grønn på 320, 768, 1024, 1440

### Cross-cutting

- [ ] Alt innhold redigerbart i CMS (hvis CMS)
- [ ] Alle skjemaer leverer e-post (Resend verifisert)
- [ ] Cookiebot consent aktiv (aldri egen banner), `data-blockingmode="auto"` blokkerer pre-consent; Cookiebot-CBID mottatt fra Helge
- [ ] DNS-cutover gjennomført
- [ ] 301-redirects fra gamle URL-er (hvis migrering)
- [ ] **"Utviklet av Myrvoll-Lunde IT Drift" + lenke i footer på alle public-sider** (verifisert i E2E)
- [ ] **Alle email-maler er designet HTML med matchende design-tokens** — auth + transactional + marketing der relevant
- [ ] **Alle email-maler har «Utviklet av Myrvoll-Lunde IT Drift» → mlit.no i footer**
- [ ] **Supabase admin-sjekkliste fullført** — Auth-config (URL/redirects/SMTP/Email Templates) automatisert via Management API + verifisert. Manuelt: OAuth-providers, PITR (Pro), Storage-policyer
- [ ] **Custom SMTP verifisert** — test-email mottatt fra `noreply@[domene]`
- [ ] **CMS dekker ALT** (hvis public-innhold): hver tekst + bilde + lenke + SEO-felt + CTA testet endret i CMS og verifisert på public-siden
- [ ] **Bilde-opplastingsmodul** brukt i CMS (ingen URL-input-felter for bilder) — testet med drag-drop + multi-file + alt-tekst-validering
- [ ] **Live preview** fungerer på alle redigerings-sider
- [ ] **Versjonering** testet — bruker kan rulle tilbake til tidligere versjon
- [ ] **Pre-launch-rapport** signert av minst 2 personer (utvikler + Helge/kunde) og committed til `docs/launches/`
- [ ] **Sikkerhets-audit** fullført: securityheaders.com A+, RLS-test som anon, secrets ikke i git, input-validering verifisert
- [ ] **Cross-browser** verifisert: Chrome, Firefox, Safari, Edge desktop + iPhone, Android, iPad
- [ ] **DR-test** kjørt: PITR-restore i staging fungerer + runbooks dokumentert
- [ ] Kunde har gitt skriftlig godkjenning
```

---

## For AI: placeholder-liste

Verktøyet `lib/kickstart/generate.ts` skal flette inn disse fra kundedata:

| Placeholder | Kilde i wizard |
|-------------|----------------|
| `{{client_name}}` | Steg 1 — `client_name` |
| `{{client_address_if_any}}` | Steg 1 — `contact_person` (kun adresse-del) |
| `{{new_domain}}` | Steg 1 — `new_domain` |
| `{{existing_url_note_if_any}}` | Steg 1 — `existing_url` (formattert som "Erstatter {url}" hvis gitt) |
| `{{tech_stack_summary}}` | Steg 3 — frontend + backend som komma-separert |
| `{{design_direction_primary}}` | Steg 5 — `design_style[0]` |
| `{{design_direction_secondary_if_any}}` | Steg 5 — `design_style[1]` hvis 2+ valgt |
| `{{color_primary}}` | Steg 5 — `color_primary` |
| `{{color_secondary}}` | Steg 5 — `color_secondary` |
| `{{today_yyyy_mm_dd}}` | System-dato ved generering |
| `{{contact_person}}` | Steg 1 — `contact_person` |
| `{{frontend_choice}}` | Steg 3 — `frontend_stack` |
| `{{backend_choice}}` | Steg 3 — `backend_stack` |

Andre felter (`features`, `pages_structure`, `out_of_scope`, `open_questions`, `extra_notes`) brukes som råstoff for AI å ekspandere de relevante seksjonene fra.
