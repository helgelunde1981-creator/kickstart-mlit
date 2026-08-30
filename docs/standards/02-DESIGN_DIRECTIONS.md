# 02 — Design Directions (2026)

> Indeks over de 16 kurerte 2026-designretningene. Hver retning har en undermappe i `EXAMPLES/design-directions/NN-name/` med tokens, ferdig kode, screenshots og referanser. Retning 10–16 er destillert merkenøytralt fra etablerte designsystem-skoler (produkt-UI-, humanist-, utvikler- og AI-estetikk) — de beskriver en skole, aldri et merke.

**AI må velge én primær + maks én sekundær fra denne lista.** Aldri "clean modern", "moderne og premium" eller andre generiske formuleringer. Hvis ingen passer perfekt, velg den nærmeste + dokumenter avvik.

---

## Oversikt

| # | Retning | Passer for | Eksempel-prosjekter |
|---|---------|------------|---------------------|
| 1 | **Dark Luxury Motion** | Premium tjenester, transport, eiendom, SaaS-hjemmesider | budogvare.no |
| 2 | **Editorial Bento** | Media, blogg, portefølje, agency-sider | mlit.no (kandidat) |
| 3 | **Swiss Minimal Refined** | Konsulent, finans, juridisk, B2B SaaS | — |
| 4 | **Brutalism Refined** | Tech-startups, kreative byråer, kultur | — |
| 5 | **Glassmorphism Depth** | Fintech, dashboards, AI-produkter | — |
| 6 | **Retro-Futurism** | Gaming, musikk, alt-tech, Web3 | — |
| 7 | **Scrollytelling Editorial** | Long-form innhold, kampanjer, dokumentar | — |
| 8 | **3D Integration** | Produkt-launch, hardware, immersive brands | — |
| 9 | **Industrial / Robust** | B2B, transport, anlegg, entreprenør | anleggoggraveservice.no (kandidat) |
| 10 | **Calm Product UI** | SaaS-apper, dashboards, interne verktøy, portaler | — |
| 11 | **Soft Organic Warmth** | Helse, utdanning, booking, lokale tjenester | — |
| 12 | **Playful Vibrant** | Barn/familie, mat og drikke, events, forbrukermerker | — |
| 13 | **Nordic Natural** | Reiseliv, sjømat/landbruk, håndverk, bærekraft | — |
| 14 | **Dark Developer Mono** | Utviklerverktøy, API-produkter, tech-plattformer | — |
| 15 | **Heritage Editorial** | Kultur, museum, tradisjon, vin/håndverksmat, forlag | — |
| 16 | **Aurora Gradient** | AI-produkter, startups, produktlansering | — |

## Hvordan velge

1. **Match bransje** — først, identifiser hvilken kolonne i "Passer for" som matcher kundens bransje
2. **Match målgruppe** — er det B2C-volum eller B2B-spesialist? Premium eller volum?
3. **Match kundepersonlighet** — hvis kunden selv er "loud and proud", går Brutalism. Hvis de er "kompetent og diskret", går Swiss eller Industrial.
4. **Match eksisterende brand** — hvis kunden har etablert merkeprofil, velg retning som forsterker (ikke kollidere)
5. **Sjekk EXAMPLES** — gå inn i undermappen for retningene som er kandidater, se på screenshots og referanser

## Når ingen passer

Hvis kundedata åpenbart ikke matcher noen av de 16, gjør AI dette:

1. Velg den nærmeste (vanligvis Swiss Minimal Refined for "trygg default"; for app/dashboard-prosjekter er Calm Product UI den trygge defaulten)
2. I PROJECT.md §2 (Designretning), dokumenter avvikene eksplisitt
3. Lever en hybridversjon med klar primær + sekundær påvirkning
4. I åpne spørsmål: "Vurder å lage egen 17. retning hvis dette prosjektet representerer en ny kategori vi vil bygge flere av"

## Hvordan retningene er bygd

Hver retning har felles struktur i `EXAMPLES/design-directions/NN-name/`:

- `README.md` — beskrivelse, "use når", "ikke bruk når"
- `references.md` — 5-10 navngitte URL-eksempler med begrunnelse
- `screenshots/` — bilder vi har lov til å bruke
- `tokens.css` — komplett CSS custom properties
- `tailwind.config.snippet.ts` — Tailwind v4-config
- `font-pairings.md` — anbefalte font-pairings
- `motion.example.ts` — Framer Motion-vokabular
- `hero.example.tsx` — ferdig 10/10 hero
- `card.example.tsx` — ferdig 10/10 card med states
- `nav.example.tsx` — ferdig 10/10 navigation

## De 16 retningene — kort beskrivelse

### 1. Dark Luxury Motion

Warme darks (ikke pure black), gold/amber/orange accents, glassmorphism med ekte dybde, scroll-baserte motion-reveals, store typografi-moments. Inspirert av luksusmerker og high-end SaaS som har vokst opp.

**Signaturmoves:** orange-glow radial gradients, glass-cards med backdrop-blur, monospace "live"-indikatorer, scroll-triggered fade-up med stagger.

**Eksempel:** budogvare.no (selv om transport er nede på "industriell"-spekteret, valgte vi denne for premium-posisjonering).

→ `EXAMPLES/design-directions/01-dark-luxury-motion/`

### 2. Editorial Bento

Asymmetriske grids, store typografi-moments, magazine-feel. Bento-blokker av varierende størrelser med klar visuell hierarki. Mix av tekst, bilder, og interaktive elementer.

**Signaturmoves:** grid-brytende komposisjon, store quote-blokker, sticky scroll-elementer, magazine-style nummerering.

→ `EXAMPLES/design-directions/02-editorial-bento/`

### 3. Swiss Minimal Refined

Disiplinert rutenett, typografi-driven, mikro-detaljer. Inspirert av sveitsisk designtradisjon men oppdatert for 2026 med subtile motion og bedre digital ergonomi.

**Signaturmoves:** strenge baselines, hairline-borders, monospace til metadata, generøs whitespace, fokus på typografisk rytme.

→ `EXAMPLES/design-directions/03-swiss-minimal-refined/`

### 4. Brutalism Refined

Rå struktur, intensjonell kontrast, hover-kunst. Brutalism uten å være lesefiendlig — bevisst kjedede skrifter, bold farge-blokker, asymmetri som kommentar.

**Signaturmoves:** monospace headlines, primær-farge i blokker, harde shadows, hover-states som "snapper" i posisjon.

→ `EXAMPLES/design-directions/04-brutalism-refined/`

### 5. Glassmorphism Depth

Ekte lag, ikke flat dekorasjon. Backdrop-blur brukt målbevisst for å skape z-akse. Ofte kombinert med subtil noise/grain for å unngå "plast"-følelse.

**Signaturmoves:** kort med faktisk dybde, hover som trekker frem, gradient mesh i bakgrunn, fokus på visuell stabilitet.

→ `EXAMPLES/design-directions/05-glassmorphism-depth/`

### 6. Retro-Futurism

VHS/CRT-elementer, neon, monospace, scanlines. Y2K-revival med moderne build-kvalitet.

**Signaturmoves:** chromatic aberration, scanline-overlays, neon-glow, monospace UI, retro grids.

→ `EXAMPLES/design-directions/06-retro-futurism/`

### 7. Scrollytelling Editorial

Narrativ scroll, sticky stages, progressive reveal. Innholdet er fortellingen — scroll er hvordan vi forteller den.

**Signaturmoves:** sticky containers med sequenced reveals, parallax brukt sparsomt, scroll-progress-indikator, fading transitions mellom stages.

→ `EXAMPLES/design-directions/07-scrollytelling-editorial/`

### 8. 3D Integration

Three.js/Spline integrert i kjerneopplevelsen. Ikke gimmick — bygger forståelse av produktet.

**Signaturmoves:** roterende produkt-modeller, scroll-styrt kamera, GPU-akselererte transitions, fallback til static-render for low-end devices.

→ `EXAMPLES/design-directions/08-3d-integration/`

### 9. Industrial / Robust

Matt, taktil, no-nonsense. For B2B/transport/anlegg/entreprenør der "premium luxury" føles feil. Inspirert av godt industri-design — funksjonalitet først, men ikke kjedelig.

**Signaturmoves:** materielle teksturer, monospace til tall, harde rutenett, høyt informasjons-tetthet, knapper som ser ut som de tåler en støvete hånd.

→ `EXAMPLES/design-directions/09-industrial-robust/`

### 10. Calm Product UI

Lys-først, stille og presis flate for produkter man jobber *i*, ikke bare ser på. Lav visuell støy: hairline-borders, én rolig aksentfarge, alt på 8px-grid, tett men lesbar UI-typografi (13–15px). Skygger er nesten usynlige — hierarki bygges med flatenivåer og border, ikke drop-shadow. De 9 første retningene er markedsføringsflater; denne er for selve appen.

**Signaturmoves:** hairline-borders med lav kontrast, kbd-hints for snarveier, monospace til ID-er og tall, 120ms mikro-transitions (aldri tregere i app-UI), tomme tilstander med ett tydelig neste steg, kommandopalett som førsteklasses navigasjon.

**Ikke bruk når:** prosjektet er en ren markedsføringsside — da mangler retningen personlighet alene (kombiner, eller velg en annen primær).

→ `EXAMPLES/design-directions/10-calm-product-ui/`

### 11. Soft Organic Warmth

Varme nøytraler (krem, sand, varmhvit — aldri kald `#FFFFFF` rett på skjerm), store radier (16–24px), vennlig humanist sans og myke duotone-illustrasjoner. Imøtekommende og menneskelig uten å tippe over i barnslig — kontrastkravene holdes selv om paletten er myk.

**Signaturmoves:** kremhvite flater med varm skygge, organiske blob-former som bakgrunnselement (sparsomt), generøs linjehøyde (1.6+), illustrasjon framfor stockfoto, avrundede input-felter som ser trygge ut å fylle ut.

**Ikke bruk når:** målgruppen forventer autoritet og presisjon (finans, juridisk) — da går Swiss.

→ `EXAMPLES/design-directions/11-soft-organic-warmth/`

### 12. Playful Vibrant

Mettede primærfarger på store flater, tykke konturer, sticker-elementer og bevegelse med sprett. Energien til et forbrukermerke, bygget med samme kodekvalitet som alt annet — leken er en presisjonsjobb, ikke en unnskyldning.

**Signaturmoves:** bold fargeblokker med bevisst palett (3–4 farger, ikke regnbue), tykke outlines (2–3px), sticker-badges med lett rotasjon, spring-basert hover-bounce, rund display-font til headlines med nøktern sans til brødtekst.

**Ikke bruk når:** B2B-spesialist eller myndighetsnær tjeneste — energien leses som useriøs der.

→ `EXAMPLES/design-directions/12-playful-vibrant/`

### 13. Nordic Natural

Jordtoner (mose, skifer, sand, fjordblå), fullbredde naturfotografi og en rolig serif/sans-miks. Stedsfølelse og materialitet framfor effekter — riktig for kunder som selger noe ekte fra et ekte sted. Spesielt relevant for lokale kunder innen reiseliv, sjømat og håndverk.

**Signaturmoves:** fotodrevne heroes med rolig tekstoverlegg, subtil papir/grain-tekstur, palett hentet fra landskapet (aldri neon), rolige crossfades framfor slides, typografi som puster — store marger, få elementer per skjerm.

**Ikke bruk når:** kunden mangler (eller ikke vil investere i) godt fotografi — retningen står og faller på bildene.

→ `EXAMPLES/design-directions/13-nordic-natural/`

### 14. Dark Developer Mono

Mørk-først med kalde grånyanser (aldri pure black — `#0A0A0C`-området), monospace som bærende UI-element og terminalblokker som designelement. For produkter der målgruppen er utviklere og troverdighet måles i om flaten ser ut som verktøyene de allerede bruker.

**Signaturmoves:** terminal/kodeblokk som hero, syntax-highlight-aksenter (grønn/lilla/cyan — velg to), statuspunkter og badges i monospace, kopierbar kode med synlig copy-knapp, diskret grid-mønster i bakgrunn, lysmodus som fullverdig variant (ikke etterlatt).

**Forskjell fra Dark Luxury Motion:** ingen gull, ingen glass, ingen scroll-teater — flat, rask og teknisk. **Forskjell fra Retro-Futurism:** ingen nostalgi-lag; dette er nåtidens verktøyestetikk.

→ `EXAMPLES/design-directions/14-dark-developer-mono/`

### 15. Heritage Editorial

Klassisk serif-display, varme papirtoner og trykktradisjonens ro. Underspilt eleganse for virksomheter der historie og håndverk er selve verdiforslaget — ikke støvete nostalgi, men print-kvalitet overført til skjerm med moderne ergonomi.

**Signaturmoves:** stor transitional serif til display, small-caps og sperret versal til metadata, tynne linjaler (aldri tykke borders), spaltebasert grid med klassiske proporsjoner, én dyp aksentfarge (burgunder, flaskegrønn, marineblå), ornamentikk brukt maksimalt ett sted per side.

**Forskjell fra Editorial Bento:** Bento er magasin-moderne og grid-brytende; Heritage er klassisk og grid-tro.

→ `EXAMPLES/design-directions/15-heritage-editorial/`

### 16. Aurora Gradient

Lys flate med mesh/aurora-gradienter bak nøkkelseksjoner og sterk sort typografi. AI-æraens visuelle språk uten den mørke klisjeen: luftig, optimistisk, med glød som identitetsbærer — ikke som dekorasjon overalt.

**Signaturmoves:** mesh-gradient bak hero og maks én seksjon til, gradient-tekst kun på nøkkelord (aldri hele headlines), glow-shadows i aksentfargen på primærknapper, raus whitespace, subtil animert gradient-drift (respekterer `prefers-reduced-motion`).

**Forskjell fra Glassmorphism Depth:** ingen blur-kort og z-akse-lag — Aurora er flat og lys med gradienten som bakteppe, ikke som materiale.

→ `EXAMPLES/design-directions/16-aurora-gradient/`

## Sekundær-retning (kombinasjoner)

Noen kombinasjoner fungerer:

| Primær | Sekundær | Når |
|--------|----------|-----|
| Dark Luxury Motion | Editorial Bento | Premium agency-site med portefølje |
| Swiss Minimal | Glassmorphism Depth | Fintech med trygg-tone |
| Brutalism Refined | Retro-Futurism | Creative tech med personality |
| Industrial Robust | Editorial Bento | B2B med caser/portefølje |
| Scrollytelling Editorial | Dark Luxury Motion | Premium kampanjeside |
| Calm Product UI | Dark Developer Mono | SaaS med app + utviklerdokumentasjon |
| Aurora Gradient | Calm Product UI | AI-produkt med markedsside + innlogget app |
| Nordic Natural | Soft Organic Warmth | Reiseliv/lokalmat med booking-flyt |
| Heritage Editorial | Scrollytelling Editorial | Kultur/museum med fortellende innhold |
| Playful Vibrant | Editorial Bento | Forbrukermerke med innholdsunivers |

Andre kombinasjoner krever eksplisitt begrunnelse.
