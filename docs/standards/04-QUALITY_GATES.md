# 04 — Quality Gates (10/10-definisjon)

> Den **enforceable** definisjonen av 10/10. Hver `PROJECT.md` MÅ liste alle disse i suksesskriterier-seksjonen. Hver leveranse MÅ måles mot disse før vi sier "ferdig".

---

## 0. Kundeopplevelse er HOVEDPARAMETER

Dette er det fundamentale prinsippet som overstyrer alle andre. Når du må velge mellom to alternativer, velg det som gir best opplevelse for **sluttbrukeren av produktet** — ikke det som er enklest å bygge, ser kulest ut, eller matcher en trend.

**Hvert ikke-trivielt valg i PROJECT.md skal kunne forsvares med:** «Vi velger X fordi sluttbrukeren får [konkret verdi].»

Sjekkliste — hver leveranse skal kunne svare ja på:

- [ ] Konvertering — vi har faktisk målt om sluttbrukeren kommer videre (CTA-klikk, signup, bestilling)
- [ ] Reduksjon av friksjon — vi har eliminert minst ett unødvendig steg eller felt
- [ ] Tydelig verdi-løfte — sluttbrukeren skjønner på under 5 sekunder hva produktet gir hen
- [ ] Mobile-first — mobile-versjonen er ikke en simplifisering, den er optimalisert
- [ ] Tilgjengelig — WCAG 2.2 AA = baseline, ikke mål
- [ ] Live-data over løfter — hvis vi kan vise «det virker akkurat nå», gjør vi det
- [ ] Ærlig — ingen mørke mønstre (dark patterns), ingen falske scarcity-meldinger, ingen pre-tikkede samtykker

Hvis et 10/10-krav under konflikter med kundeopplevelse, kundeopplevelsen vinner — og du flagger konflikten i «Risiko»-seksjonen.

---

## 1. Ytelse (Lighthouse + Core Web Vitals)

| Metrikk | Terskel | Verktøy |
|---------|---------|---------|
| Lighthouse Performance | ≥ 95 | Lighthouse CI i pipeline |
| Lighthouse SEO | ≥ 95 | Lighthouse CI |
| Lighthouse Accessibility | ≥ 95 | Lighthouse CI |
| Lighthouse Best Practices | ≥ 95 | Lighthouse CI |
| LCP (Largest Contentful Paint) | < 2.5s | CrUX + lab |
| INP (Interaction to Next Paint) | < 200ms | CrUX + lab |
| CLS (Cumulative Layout Shift) | < 0.1 | CrUX + lab |
| FCP (First Contentful Paint) | < 1.5s | Lab |
| TBT (Total Blocking Time) | < 200ms | Lab |
| TTFB (Time to First Byte) | < 800ms | RUM |

## 2. Bundle-budsjett (gzipped)

| Side-type | JS-budget | CSS-budget |
|-----------|-----------|------------|
| Landing page | < 150 KB | < 30 KB |
| App-side (innlogget) | < 300 KB | < 50 KB |
| Microsite | < 80 KB | < 15 KB |
| Admin-panel | < 400 KB | < 60 KB |

Verifiseres via `@next/bundle-analyzer` og Lighthouse CI assertions.

## 3. Design-floor (anti-template)

### 3.1 Avvist (vi leverer aldri dette)

- Sentrert hero med gradient-blob bak + standard CTA-knapp uten karakter
- Uniform card-grid med lik padding og ingen visuelt hierarki
- Gray-on-white safe-styling med kun én dekorativ accent-farge
- Default shadcn-utseende uten customisering av tokens, hover, focus, active
- "Dashboard-by-numbers" (sidebar + cards + charts uten egenart)
- Default font-stack (system-ui, sans-serif) uten bevisst pairing
- Kopierte hero-seksjoner fra Vercel/Tailwind UI showcases
- Stock Unsplash-bilder uten relevans til kunden

### 3.2 Påkrevd — minst 4 av 10 design-kvaliteter

Hver leveranse skal demonstrere minst 4 av disse på meningsfulle flater (forside, kjernefeature, signature moment):

1. **Klar hierarki gjennom skala-kontrast** — h1 betydelig større enn body, ikke "alle headings ser like ut"
2. **Intensjonell rytme i spacing** — ikke uniform padding på alt; bevisst kompresjon og pust
3. **Dybde / lagring** — overlap, shadows som faktisk simulerer lys, surfaces, motion ved scroll
4. **Typografi med karakter** — minst én distinkt font (ikke kun Inter), bevisst pairing med begrunnelse
5. **Farge brukt semantisk** — ikke kun dekorativ accent; suksess/feil/info-tilstander med egen mening
6. **Hover/focus/active-states som føles designet** — ikke kun opacity-endring; egen motion, mikro-interaksjon
7. **Grid-brytende editorial/bento** — der det passer prosjekttypen, asymmetriske flater
8. **Tekstur, grain, atmosfære** — noise, gradient mesh, ambient elementer der visuell direction krever det
9. **Motion som klargjør flyt** — ikke distraherer; støtter brukerens forståelse av hva som skjer
10. **Datavisualisering integrert i designsystem** — chart-fargene matcher tokens; tooltip ser ut som resten av UI-en

## 4. Signature moment (påkrevd)

- Hvert prosjekt MÅ ha **minst én** signature moment
- Definisjon: et interaktivt eller visuelt distinkt element som er **produktets fingeravtrykk** — det kunden husker etterpå
- Eksempel: budogvare = live fraktkalkulator med Lucide-ikoner og real-time pris-breakdown
- Skal beskrives i seksjon 5 av PROJECT.md med:
  - **Hva** det er (én setning)
  - **Hvor** det er plassert (URL/seksjon)
  - **Oppførsel** (states, transitions, edge cases)
  - **Hvorfor** det er signature for akkurat dette produktet
  - **Suksessmetrikk** — hvordan måler vi at det fungerer (engagement, konvertering, tid)

## 5. Accessibility (WCAG 2.2 AA)

| Krav | Verifisert via |
|------|----------------|
| WCAG 2.2 AA på alle sider | axe-core i Playwright |
| Keyboard-nav fullført på alle interaktive flater | Manuell + Playwright |
| `prefers-reduced-motion` respektert | Manuell test |
| Kontrast ≥ 4.5:1 body, ≥ 3:1 stort | Lighthouse + axe |
| Focus visible på alle interaktive elementer | Manuell |
| ARIA-labels der ikoner brukes uten tekst | axe |
| Skjema-feilmeldinger lest av screen readers | NVDA/VoiceOver-test |
| Touch-targets ≥ 44×44 px på mobil | Lighthouse |
| Språk-attributt på `<html>` | Lighthouse |

## 6. Sikkerhet

| Krav | Hvordan |
|------|---------|
| RLS aktivert på ALLE public tabeller | Supabase migrasjon + RLS-test i CI |
| Policyer per tabell (ikke wildcard) | Manuell review per migrasjon |
| CSP med nonce — ikke `'unsafe-inline'` for script-src | `middleware.ts` |
| Alle skjemaer: Turnstile + honeypot + Zod + rate-limit | Server Actions |
| Secrets kun via env, aldri commited | `.gitignore` + `gh secret list`-sjekk |
| Aldri service-role i klient | Lint-regel + manuell review |
| HSTS preload | Vercel headers config |
| X-Content-Type-Options: nosniff | Vercel headers |
| X-Frame-Options: DENY | Vercel headers |
| Referrer-Policy: strict-origin-when-cross-origin | Vercel headers |
| Permissions-Policy (camera, mic, geo lock down) | Vercel headers |
| Input-sanitization på rich-text-render | TipTap-renderer eller DOMPurify |
| Rate-limit på public form-endpoints | 5 req/min/IP via Vercel KV eller Upstash |
| Rate-limit på auth-endpoints | 10 req/min/IP |

## 7. Compliance (Norge)

| Lov | Når gjelder | Hva må være på plass |
|-----|-------------|----------------------|
| GDPR | Alltid | Personvernpolicy, samtykkelogg, slett/innsyn-endpoints, DPO-kontakt |
| Cookie-policy | Alltid hvis cookies | **Cookiebot** consent (ALDRI egen banner) — `data-blockingmode="auto"` blokkerer ikke-essentials før consent; Cookiebot-domener i CSP; CBID fra Helge |
| E-handelsloven | E-handel | Priser inkl/eks mva, leveringsbetingelser, angrerett |
| Åpenhetsloven | Omsetning > 70 mill NOK eller > 50 ansatte | Egen side + aktsomhetsvurdering + årlig redegjørelse |
| Universell utforming-loven | Offentlig sektor eller privat virksomhet rettet mot allmennheten | WCAG 2.1 AA minimum, WCAG 2.2 AA anbefalt |
| Likestillings- og diskrimineringsloven | Alltid | Universell utforming-prinsipper |
| Markedsføringsloven | Alltid hvis markedsføring | Pristransparens, ingen villedende markedsføring |
| Hvitvaskingsloven | Finansiell tjeneste | KYC-flyt hvis aktuelt |

AI **må** identifisere hvilke som gjelder basert på kundedata (bransje, størrelse, sektor) og inkludere i seksjon 15 av PROJECT.md.

## 8. Testdekning

| Type | Terskel | Verktøy |
|------|---------|---------|
| Unit (Vitest) | ≥ 80% statement coverage | `vitest --coverage` |
| Integration | Per Server Action / API route | Vitest med Supabase test-client |
| E2E (Playwright) | Alle critical user paths | Playwright i CI |
| Visual regression | Hovedsider på 320, 768, 1024, 1440 | Playwright screenshots |
| a11y | axe-core på alle public sider | Playwright + @axe-core/playwright |
| Cross-browser | Chrome, Firefox, Safari, Edge | Playwright browsers |

## 9. Critical paths (skal alltid være E2E-testet)

- Forside laster og hovedinnhold er synlig
- Hovedfunksjon (signature moment) fungerer ende-til-ende
- Alle skjemaer: validering + happy path + Resend-leveranse
- Auth-flyt (login, logout, hvis aktuelt)
- CMS critical actions (publish, edit, delete) hvis CMS
- 404 og 500-sider
- RLS: anon-rolle kan IKKE endre noe
- **Footer-credit:** "Utviklet av Myrvoll-Lunde IT Drift" med lenke til https://mlit.no er synlig på alle public-sider
- **E-postmaler:** alle relevante HTML-maler bygget med design-tokens + footer-credit + testet i hovedmail-klienter
- **Supabase admin-oppsett:** Redirect URLs, Email Templates limt inn, SMTP konfigurert, PITR aktivert, Storage-policyer (sjekkliste i §14.7)
- **CMS (hvis aktuelt):** ALT redigerbart fra CMS — testet ved å endre tekst, bilde, lenke, SEO på hver public-side
- **Bilde-opplasting:** drag-drop fungerer, multi-file fungerer, alt-tekst-validering, auto AVIF/WebP-konvertering
- **Pre-launch-sjekkliste:** alle 15 områder gjennomgått, lanseringsrapport `docs/launches/YYYYMMDD-launch-report.md` skrevet og signert av 2 personer

## 9.02 Mandatory sprintplan med alle oppgaver eksplisitt

**Krav:** Hver regel, hver sjekkliste, hver public-side, hver sted×tjeneste-kombinasjon, hver e-postmal, hvert skjema, hver Supabase-tabell, hver secret, hver kjernefeature, og hvert pre-launch-bullet skal være eksplisitt checkbox i en sprint.

**Forbudt:**
- ❌ «Sprint 4: implementer alt listet over»
- ❌ «osv.»
- ❌ «standard-oppsett»
- ❌ «se §X»
- ❌ «resten følger samme mønster»

Per sprint må PROJECT.md ha:
- Sprint-nummer + navn
- Estimert varighet
- Mål (én setning)
- Avhengigheter
- Oppgaver (eksplisitte checkboxes)
- Test-kriterier
- Leveranse

Full mal i `06-SECTION_DETAILS/sprint-planning.md`.

## 9.03 Mandatory Pre-launch sjekkliste (alle prosjekter)

**Krav:** Hvert prosjekt skal ha en dedikert «Pre-launch»-sprint som siste sprint. Sjekklisten i `06-SECTION_DETAILS/pre-launch-checklist.md` har 15 områder som ALLE skal gjennomgås, dokumenteres og signeres FØR cutover.

### De 15 områdene

1. **Sikkerhet** — Headers (A+ securityheaders.com), RLS, secrets-audit, input-validering, anti-spam, auth-flyt, penetrasjonstest, security-reviewer
2. **Performance** — Lighthouse ≥ 95, CWV p75 «good», bundle-budsjett, bilder
3. **Accessibility** — WCAG 2.2 AA, axe-core, keyboard, kontrast
4. **SEO** — sitemap, robots, llms.txt, JSON-LD, OG-tags
5. **Compliance** — GDPR, Åpenhetsloven, universell utforming, vilkår
6. **DNS + e-post** — DKIM/SPF/DMARC, Mail-Tester ≥ 9/10
7. **Supabase admin** — Auth-config (URL/redirects/SMTP/Email Templates) automatisert via Management API + verifisert. Manuelt Dashboard: OAuth-providers, PITR, Storage-policyer
8. **CMS** — alt redigerbart, bilde-opplasting, live preview, versjonering
9. **Forms** — alle skjemaer testet, validering, rate-limit, Turnstile
10. **Monitoring + DR** — uptime, Sentry, PITR-restore testet, runbooks
11. **Cross-browser** — Chrome/Firefox/Safari/Edge + iPhone/Android/iPad
12. **Innhold** — ingen lorem/TODO/placeholder, stavekontroll. **Hvis `requires_scrape`**: `pnpm tsx scripts/verify-scrape-import.ts` mot prod-DB exit 0 + spot-sjekk 5 tilfeldige scrapede sider + manuelt redigert alt-tekst på hero + topp-20 bilder + 301-redirects fra gamle URL-er på plass
16. **Per-side kvalitetsscore (NY hard-gate)** — `pnpm tsx scripts/check-public-pages.ts` mot prod-URL: alle sider ≥9.0/10 i 40-punkts rubrikken (struktur, visuelt, identitet/logo+favicon, navigasjon fra pages-tabellen, interaktivitet inkl. funksjonell theme-toggle, zero console-errors, zero CSP-violations, SEO, innhold). Rapport committed i `docs/sprint-reports/launch-quality.md`. Snitt <9.0 = lansering blokkert. Full rubrikk i `06-SECTION_DETAILS/sprint-done-verification.md`.
17. **Brand-assets verifisert** — logo i header (ikke plassholder), favicon laster (ikke default Next), OG-image 1200×630 designet (ikke screenshot). `check-public-pages.ts C1/C2/C3` grønn.
18. **CSP matcher faktiske integrasjoner** — alle tredjeparts-skripter (analytics, maps, Stripe etc.) whitelisted, zero console-violations i prod. Mapping i `06-SECTION_DETAILS/csp-config.md`.
13. **Sprint-leveranser** — alle kriterier krysset av
14. **Kunde-sign-off** — testet CMS, skriftlig akseptert, opplæring
15. **Lansering** — DNS TTL, backup, cutover-plan, 24t vakt

### Påkrevde leveranser

- [ ] `docs/launches/YYYYMMDD-launch-report.md` skrevet og committed
- [ ] **2-personers sign-off** (utvikler + Helge/kunde med navn + dato)
- [ ] Alle 15 områdene grønne eller eksplisitt akseptert som N/A med begrunnelse
- [ ] Lanseringsrapport delt med kunde

**Ingen lansering uten fullført sjekkliste og signert rapport.** Hvis Helge/kunde insisterer på lansering uten dette → dokumenter som risiko + få skriftlig aksept fra kunde.

Full spec i `06-SECTION_DETAILS/pre-launch-checklist.md`.

## 9.04 Mandatory CMS — alt redigerbart (hvis public-innhold)

**Krav:** Hvis prosjektet har et CMS, skal **ALT på alle public-sider være redigerbart** av en ikke-teknisk bruker. Ikke «delvis» — alt. Hvis noe er hardkodet og ikke kan endres i CMS, er det en bug.

Eneste unntak:
- Footer-credit «Utviklet av Myrvoll-Lunde IT Drift» (regel #11)
- Juridiske disclaimers som krever utvikler-review
- Tekniske routes-strukturen

### Påkrevde komponenter

- **Rich-text editor** (TipTap eller liknende, JSON-lagring, RSC-render for SEO + ytelse)
- **Bilde-opplastingsmodul** — drag-and-drop + multi-file + alt-tekst-krav + crop + auto AVIF/WebP. **ALDRI URL-input.**
- **Mediabibliotek** med søk, mapper, «brukt på»-info, bulk-handlinger
- **Seksjon-system** for sammensatte sider (add/delete/reorder/toggle)
- **SEO per side** (meta title/description/OG image/canonical/noindex)
- **Live preview** — innen 500ms etter endring
- **Auto-save** hvert 5. sek + recovery
- **Publiseringsflyt** (draft → published) + schedulert publisering
- **Versjonering** + rollback til hvilken som helst tidligere versjon
- **Roller** (superadmin + editor minimum)
- **Audit log** (hvem + når + før/etter)

### Anti-patterns vi avviser

- ❌ URL-input for bilder
- ❌ «Endre dette i koden» for noen public-tekst
- ❌ Lagre uten visuell feedback
- ❌ Sletting uten confirm
- ❌ Tap av innhold ved navigering
- ❌ Mediabibliotek uten søk
- ❌ Endring som krever utvikler-deploy

### Verifisering

- Test alle redigerbare felter manuelt og verifiser på public-siden
- E2E-test for hvert CMS-CRUD-mønster (sider, bilder, blogg)
- Tilgangs-test: editor kan ikke gjøre superadmin-actions

Full spec i `06-SECTION_DETAILS/cms-requirements.md`.

## 9.05 Mandatory e-postmaler (alle prosjekter)

**Krav:** Alle e-poster fra prosjektet — auth, transactional, marketing — MÅ være designede HTML-eposter som matcher sidens visuelle stil. Ingen default-Supabase tekst-eposter.

- Bygges med react-email (eller liknende komponent-basert HTML-bibliotek)
- Bruker design-tokens fra valgt 2026-retning (palette, typografi, spacing)
- Inkluderer preheader, responsive layout, accessible kontrast
- Hver mal har «Utviklet av Myrvoll-Lunde IT Drift» → mlit.no i footer
- Auth-maler limt inn i Supabase Dashboard (via §14.7-sjekkliste)
- Testet på iPhone Mail, Apple Mail, Gmail (web + iOS), Outlook (web + desktop), dark mode
- Sendes via Resend med verifisert domene (DKIM/SPF/DMARC fra §16)

Mal-sett som ALLE prosjekter må ha (per `06-SECTION_DETAILS/email-templates.md`):
- Auth: Magic Link · Confirm Email · Reset Password · Invitation · Change Email
- Transactional: Contact Receipt · Contact Internal Alert · [+ prosjektspesifikke]

Verifiseres via:
- E2E-test som rendrer hver mal og sjekker DOM/skjermbilde
- Manuell test-mail mottatt i hovedsystemer
- Litmus eller Mailtrap snapshot for ulike clients

## 9.06 Mandatory Project Memory bootstrap (alle prosjekter)

**Krav:** Hver PROJECT.md MÅ inneholde §21 «Project Memory bootstrap» med ferdig utfylte Tier 1-filer (`MEMORY.md`, `project_stack.md`, `project_klient.md`, `project_secrets.md`) basert på wizard-input — ingen `<TBD>`. Tier 2-skjeletter (`project_auth.md`, `project_scope.md`, `project_integrasjoner.md`) er klare for Sprint 0.

- Memory bor lokalt på utviklerens PC: `C:\Users\Helge Myrvoll-Lunde\.claude\projects\c--Github-<repo_name>\memory\`
- Lokal Claude oppretter mappa i første økt og kopierer inn de 7 filene fra §21
- Memory inneholder kun prosjekt-spesifikke fakta — globale regler bor i `~/.claude/CLAUDE.md`
- Ingen entry skal duplikere global CLAUDE.md, lint-regler, eller noe som er avledbart fra koden

Full standard: `06-SECTION_DETAILS/project-memory.md`.

Verifiseres via:
- §21 finnes med alle 7 underseksjoner
- Tier 1-feltene har konkrete verdier (Supabase-ref, Vercel-team, klient, domener) — ikke placeholder
- Self-review krysser av at §21 er fullført

## 9.07 Mandatory Auto-evaluator (alle prosjekter)

**Krav:** Hvert prosjekt MÅ ha `.github/workflows/quality-gate.yml` + 7 sjekk-skript som kjører på hver PR til `main`. Workflow BLOKKERER merge hvis terskler ikke nås.

Sjekker (alle MÅ være grønne):
- Lighthouse ≥ 95 alle 4 kategorier på alle public-ruter
- axe-core: 0 critical/serious violations
- CMS-coverage: 0 hardkodet kundetekst funnet
- Footer-credit på alle public-ruter
- Alle react-email-maler rendrer + har footer-credit
- 0 broken internal links

Score persisteres til `delivery_scores`-tabellen i mlit-Supabase. PR-kommentar med markdown-tabell.

Full standard: `06-SECTION_DETAILS/auto-evaluator.md`. Mal-skripts i `EXAMPLES/scripts/check-*.ts.example`.

## 9.08 Mandatory AGENTS.md (alle prosjekter)

**Krav:** Hvert prosjekt MÅ ha `AGENTS.md` i prosjekt-roten som definerer:
- Obligatorisk lese-rekkefølge for AI-agenter
- Source-of-truth-hierarki
- Aldri-liste (dev-server, force-push, db push lokalt)
- Sjekk-først-liste (grep før du bygger nytt)
- Stack-snapshot + conventions

Mal i `EXAMPLES/templates/AGENTS.md.example`. Full standard: `06-SECTION_DETAILS/agents-md.md`.

## 9.09 Mandatory Design Preview før Sprint 1

**Krav:** Sprint 0 MÅ levere statisk preview-side i valgt 2026-retning på `preview-<slug>.mlit.no`. Klienten godkjenner skriftlig FØR Sprint 1 starter. `kickstart_projects.design_approved_at` MÅ være satt.

Mal i `EXAMPLES/templates/design-preview.html.example`. Full standard: `06-SECTION_DETAILS/design-preview.md`.

## 9.10 Mandatory Pre-launch verify-skript

**Krav:** Hvert prosjekt MÅ ha `scripts/prelaunch-verify.ts` som automatisert sjekker DNS, SSL, Supabase RLS, helse-endpoint, sitemap, robots.txt, og at prod ikke har test-secrets. Skriptet kjøres som obligatorisk steg i siste sprint. Ingen lansering hvis det er rødt.

Mal i `EXAMPLES/scripts/prelaunch-verify.ts.example`.

## 9.11 Mandatory Post-launch monitoring

**Krav:** Hvert prosjekt MÅ levere:
- Plausible Analytics-script + custom events for kritiske flows
- Vercel Speed Insights aktivert
- Customer survey-cron registrert (14d + 90d NPS + free-text)

Surveys lagres i `customer_surveys`-tabellen. Full standard: `06-SECTION_DETAILS/post-launch-survey.md`.

## 9.12 Mandatory Sprint 0 bootstrap (CLI eller manuelt sjekket)

**Krav:** Sprint 0 MÅ være ferdig før Sprint 1 starter. Verifiseres ved at:
- GitHub repo finnes under helgelunde1981-creator
- Supabase prosjekt opprettet + linket
- Vercel project koblet
- Alle secrets på 3 steder (.env.local + Vercel + GitHub)
- AGENTS.md, MEMORY.md, vault-notat opprettet

Bruk `pnpm tsx scripts/create-mlit-project.ts --kickstart-id <id>` for automatisering. Full standard: `06-SECTION_DETAILS/sprint-0-bootstrap.md`.

## 9.13 Mandatory Delivery-score-historikk

**Krav:** Hver PR til `main` skriver én rad til `delivery_scores`-tabellen i mlit-Supabase via `score-delivery.ts`. Brukes til trendanalyse, salg, og intern læring.

Full standard: `06-SECTION_DETAILS/delivery-score.md`.

## 9.1 Mandatory footer-credit (alle prosjekter)

**Krav:** Alle public-sider MÅ ha "Utviklet av Myrvoll-Lunde IT Drift" i footer med lenke til https://mlit.no.

- Plassering: alltid synlig footer, gjerne nederst eller helt nederst
- Stiles mot valgt design-direction (mono for dark luxury, sans for swiss minimal, etc.) — men tekst og lenke er fast
- Kan ikke skjules eller fjernes uten eksplisitt avklaring med Helge Myrvoll-Lunde
- Verifiseres i Playwright E2E (sjekk at lenken finnes og peker til mlit.no på minst forsiden)

## 10. Self-check rubric (for AI før output)

Når AI har generert PROJECT.md, skal den verifisere:

```
[ ] Kundeopplevelse-prinsippet (§0) — hvert ikke-trivielt valg har én-setnings UX-rasjonale
[ ] Seksjon 4.5 (AI-foreslåtte forbedringer) har MINST 2 forslag med begrunnelse
[ ] Seksjon "Spørsmål til kunden" har MINST 3 konkrete spørsmål
[ ] Lighthouse-tersklene fra §1 er listet i suksesskriterier
[ ] Bundle-budsjett fra §2 er listet i suksesskriterier
[ ] Anti-template-sjekklisten fra §3.1 er adressert i seksjon 6
[ ] Minst 4 design-kvaliteter fra §3.2 er identifisert i seksjon 9
[ ] Signature moment i seksjon 5 har alle 5 påkrevde komponenter (§4)
[ ] WCAG-kravene fra §5 er listet i suksesskriterier
[ ] Sikkerhetskravene fra §6 er adressert i seksjon 14
[ ] Compliance-kravene fra §7 som gjelder dette prosjektet er adressert i seksjon 15
[ ] Testdekning-kravene fra §8 er nevnt i seksjon 20 (sprintplan, test-sprint)
[ ] Critical paths fra §9 er listet i E2E-test-planen
[ ] §21 Project Memory bootstrap (§9.06) — alle 7 filer ferdig fylt, Tier 1 har konkrete verdier, ingen `<TBD>`
```

Hvis noen av disse er **uadressert eller utelatt**, regenerer den relevante seksjonen.

## 11. Eskalering ved konflikt

Hvis kundedata sier noe som bryter med 10/10-standarden (f.eks. "vi vil ha gray-on-white minimal"), gjør AI dette:

1. Lever standarden — ikke kompromiss
2. I risiko-seksjonen (§12), legg til en åpen post: "Kunde har bedt om X, som potensielt bryter med 10/10-floor for design. Diskuter i kick-off."
3. La Helge ta beslutningen i samråd med kunden
