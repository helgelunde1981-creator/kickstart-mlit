# 03 — Tech Stack Canon

> Default-stack for hvert nytt prosjekt med begrunnelse. Avvik krever eksplisitt rasjonale i PROJECT.md §8.

---

## Default-stack

| Lag | Teknologi | Hvorfor |
|-----|-----------|---------|
| Framework | **Next.js 15 App Router** | RSC + partial prerendering, beste Vercel-integrasjon, beste SEO out-of-the-box |
| Språk | **TypeScript strict** | Type-sikkerhet på tvers av server/client/DB |
| Styling | **Tailwind CSS v4** | Design-tokens som CSS-variabler, ingen runtime CSS-in-JS |
| Komponentbibliotek | **shadcn/ui** (selektiv) | Eierskap over kode, ingen black-box-deps, customizable per token |
| Ikoner | **Lucide React** | Konsistent stroke-width, treeshakeable |
| Animasjon | **Framer Motion** | Best balanse mellom kraft og bundle-size, scroll-triggers, layout-animations |
| Forms | **react-hook-form + Zod** | Performant, schema-validert client + server |
| Database | **Supabase Postgres** | RLS + auth + storage + realtime + branching i én pakke |
| Auth | **Supabase Auth** | Magic link + e-post/passord + OAuth, integrert med RLS |
| Storage | **Supabase Storage** | Same auth, CDN-backed, signed URLs for privat innhold |
| E-post | **Resend** | Norsk-vennlig, react-email templates, god deliverability |
| Hosting | **Vercel** | RSC-optimalisert, preview-deploys per PR, edge functions |
| Rich text | **TipTap** | Strukturert JSON i DB, RSC-renderable |
| Anti-spam | **Cloudflare Turnstile** | Ingen CAPTCHA-friksjon, gratis, GDPR-vennlig |
| Rate-limit | **Upstash Redis** eller **Vercel KV** | Edge-kompatibel, lav latency |
| Bildeoptimalisering | **Next.js Image** + **sharp** | AVIF/WebP, lazy, eksplisitte dimensjoner |
| Testing — unit | **Vitest** | Raskere enn Jest, native ESM |
| Testing — E2E | **Playwright** | Multi-browser, video/screenshot på fail |
| Testing — a11y | **@axe-core/playwright** | Automatisert WCAG-test i CI |
| Linting | **ESLint** + **Prettier** + **Stylelint** | Standard, ingen konfig-rabbit-holes |
| Pakkebehandler | **pnpm** | Disk-effektivt, raskere installer, strict deps |
| CI/CD | **GitHub Actions** | Native til repo, godt MCP-integrasjon |
| Performance-monitoring | **Vercel Analytics** + **Speed Insights** | Innebygd, ingen ekstra setup |
| Error tracking | **Sentry** | Industristandard, godt Next.js-integrasjon, source maps |
| Analytics (produkt) | **PostHog** (consent-bundet) eller **Plausible** | Cookie-fritt eller granulært samtykke |

## Godkjente alternativer (per use case)

### Hvis IKKE Next.js

- **Astro** — for ren content-tunge sites uten interaktivitet (blogger, dokumentasjon)
- **Vite + React** — for SaaS-internals der SSR ikke er kritisk
- **SvelteKit** — kun hvis kunde har Svelte-ekspertise; må begrunnes

### Hvis IKKE Supabase

- **Convex** — for realtime-heavy apps med kompleks state; krever eget oppsett (se `~/.claude/skills/convex-setup`)
- **PlanetScale + Drizzle** — kun hvis vi trenger horizontal scaling fra dag 1
- **Firebase** — kun hvis kunde har eksisterende Firebase-investering

### Hvis IKKE Vercel

- **Cloudflare Pages + Workers** — for global edge med lavere kostnad
- **Hetzner VPS + Docker** — kun for spesialcase med store data-volumer eller GDPR-krav om EU-only hosting
- **Railway** — for full-stack monorepos med backend-services

### Hvis IKKE Resend

- **Postmark** — bedre for high-volume transactional
- **AWS SES** — kun hvis kunde har AWS-investering

## Mobil-stack (når aktuelt)

| Lag | Teknologi | Hvorfor |
|-----|-----------|---------|
| Framework | **Expo (React Native)** | Cross-platform, OTA updates, samme React-modell som web |
| Auth | **Supabase Auth** | Samme backend som web |
| Push | **Expo Push Notifications** | Native integrasjon, FCM/APNS abstrahert |
| Secure storage | **expo-secure-store** | Keychain/Keystore |
| Biometrics | **expo-local-authentication** | Face ID, Touch ID, fingerprint |
| Deep linking | **expo-linking** | Universal links + custom schemes |
| Updates | **expo-updates** | OTA, ingen App Store-review for bugfixes |

## Standard miljøvariabler

Hvert prosjekt skal ha disse env-vars (sett i `.env.local` + Vercel + GitHub secrets):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # kun server-side
SUPABASE_JWT_SECRET=               # for custom JWT-verifisering

# Site
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=

# E-post
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Anti-spam
TURNSTILE_SITE_KEY=                # public
TURNSTILE_SECRET_KEY=              # server-side

# Rate-limit (hvis Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cron
CRON_SECRET=                       # for Vercel Cron auth

# Sentry (hvis brukt)
SENTRY_DSN=
SENTRY_AUTH_TOKEN=                 # for source map upload

# Andre vanlige
ANTHROPIC_API_KEY=                 # hvis AI-features
OPENAI_API_KEY=                    # hvis AI-features
```

AI **må** liste hver env-var som faktisk brukes i prosjektet i seksjon 14 (Sikkerhet) av PROJECT.md med:
- Hva den brukes til
- Hvor den settes (.env.local / Vercel / GitHub secrets)
- Om den er public (`NEXT_PUBLIC_*`) eller server-only

## Standard CI/CD pipeline

GitHub Actions med disse jobbene i denne rekkefølgen:

1. **lint** — ESLint + Prettier + Stylelint
2. **typecheck** — `tsc --noEmit --incremental`
3. **unit** — Vitest med coverage
4. **build** — Next.js build, fail-on-warning
5. **e2e** — Playwright (kun på `main` eller manuelt)
6. **lighthouse** — Lighthouse CI med assertions fra `04-QUALITY_GATES.md`
7. **supabase-migrate** — på push til `dev` eller `main`

PR-krav: alle 7 grønne + minst 1 review.

## Supabase branching

| Branch | Supabase environment |
|--------|----------------------|
| `main` | Production Supabase |
| `dev` | Dev-branch (auto-migrert) |
| `feature/*` | Bruker dev-branch eller egen branch hvis schema-endring |

Migrasjons-filer i `supabase/migrations/YYYYMMDDHHMMSS_navn.sql` (per memory).

Auto-deploy via GitHub Actions ved push:

```yaml
- name: Run migrations
  if: github.ref == 'refs/heads/main'
  run: supabase db push
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## Vercel-prosjekt-oppsett

- **Team:** `myrvoll-lunde-it-drift-s-projects` for klient-prosjekter, `Helge Myrvoll-Lunde's projects` for personlige
- **Auto-deploy fra GitHub:** main → prod, dev → preview
- **Aldri** `vercel deploy` manuelt — push til GitHub
- **Env vars:** speil av `.env.local`, sett per environment (Production / Preview / Development)

## Standard mappestruktur

```
src/
├── app/                          → Next.js App Router
│   ├── (public)/                 → Public-rutgruppe
│   ├── (auth)/                   → Auth-rutgruppe
│   ├── admin/                    → CMS / admin
│   └── api/                      → Route handlers
├── components/
│   ├── ui/                       → shadcn-baserte primitives
│   ├── features/                 → Feature-spesifikke komponenter
│   └── layout/                   → Header, footer, etc.
├── lib/
│   ├── supabase/                 → Server + browser clients
│   ├── actions/                  → Server Actions
│   ├── validations/              → Zod-skjemaer
│   └── utils.ts
├── hooks/                        → Custom React hooks
├── styles/
│   ├── globals.css               → Tailwind base + tokens
│   └── tokens.css                → Design-system custom properties
└── types/
    ├── database.types.ts         → Auto-generert fra Supabase
    └── ...
```

## Avvik fra default

Hvis prosjektet krever avvik fra default-stack, MÅ AI:

1. Liste avviket eksplisitt i seksjon 8 (Tech-stack)
2. Begrunne hvorfor i én setning
3. Identifisere risiko i seksjon 12 (Risiko)
