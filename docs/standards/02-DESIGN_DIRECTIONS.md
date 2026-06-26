# 02 — Design Directions (2026)

> Indeks over de 9 kurerte 2026-designretningene. Hver retning har en undermappe i `EXAMPLES/design-directions/NN-name/` med tokens, ferdig kode, screenshots og referanser.

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

## Hvordan velge

1. **Match bransje** — først, identifiser hvilken kolonne i "Passer for" som matcher kundens bransje
2. **Match målgruppe** — er det B2C-volum eller B2B-spesialist? Premium eller volum?
3. **Match kundepersonlighet** — hvis kunden selv er "loud and proud", går Brutalism. Hvis de er "kompetent og diskret", går Swiss eller Industrial.
4. **Match eksisterende brand** — hvis kunden har etablert merkeprofil, velg retning som forsterker (ikke kollidere)
5. **Sjekk EXAMPLES** — gå inn i undermappen for retningene som er kandidater, se på screenshots og referanser

## Når ingen passer

Hvis kundedata åpenbart ikke matcher noen av de 9, gjør AI dette:

1. Velg den nærmeste (vanligvis Swiss Minimal Refined for "trygg default")
2. I PROJECT.md §2 (Designretning), dokumenter avvikene eksplisitt
3. Lever en hybridversjon med klar primær + sekundær påvirkning
4. I åpne spørsmål: "Vurder å lage egen 10. retning hvis dette prosjektet representerer en ny kategori vi vil bygge flere av"

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

## De 9 retningene — kort beskrivelse

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

## Sekundær-retning (kombinasjoner)

Noen kombinasjoner fungerer:

| Primær | Sekundær | Når |
|--------|----------|-----|
| Dark Luxury Motion | Editorial Bento | Premium agency-site med portefølje |
| Swiss Minimal | Glassmorphism Depth | Fintech med trygg-tone |
| Brutalism Refined | Retro-Futurism | Creative tech med personality |
| Industrial Robust | Editorial Bento | B2B med caser/portefølje |
| Scrollytelling Editorial | Dark Luxury Motion | Premium kampanjeside |

Andre kombinasjoner krever eksplisitt begrunnelse.
