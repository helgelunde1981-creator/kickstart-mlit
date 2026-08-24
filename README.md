# MLIT Kickstart

Internt verktøy for **Myrvoll-Lunde IT Drift**. Du fyller ut ni steg om et nytt
kundeprosjekt, og Claude skriver en komplett `PROJECT.md` — en spec som tar
prosjektet fra kick-off til lansering: visjon, designsystem, datamodell,
sikkerhet, GDPR, sprintplan og pre-launch-sjekkliste.

Deretter kan verktøyet estimere pris, generere mockup-bilder av løsningen, og
bootstrappe GitHub-repo, Supabase-prosjekt og Vercel-prosjekt.

> Verktøyet inneholder kundedata og er ikke ment for offentligheten. Alt bak
> `/admin` og `/api/kickstart` krever innlogging, og appen er merket `noindex`.

---

## Kom i gang

Hemmeligheter ligger i **Doppler** — det finnes ingen `.env.local` her, og det
skal ikke opprettes en (se [AGENTS.md](./AGENTS.md)).

```bash
pnpm install
doppler run -- pnpm dev          # http://localhost:3000
```

| Kommando | Hva den gjør |
| --- | --- |
| `pnpm dev` | Utviklingsserver |
| `pnpm build` | Produksjonsbygg |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (enhetstester) |
| `pnpm check` | Typecheck + lint + test — kjør denne før du melder ferdig |

CI-workflowen ligger i [`docs/ci/`](./docs/ci/) og mangler ett manuelt steg før
den er aktiv.

Databaseskjemaet ligger i [`supabase/migrations/`](./supabase/migrations/) og er
idempotent. Kjør det mot en ny database (eller mot prod for å få kolonner som er
kommet til senere) via Supabase SQL-editor eller `supabase db push`.

`GET /api/kickstart/health` (krever innlogging) svarer på om standardfilene og
miljøvariablene faktisk er på plass i miljøet du kjører i.

---

## Slik henger det sammen

```
Wizard (9 steg)  ──POST──▶  /api/kickstart/stream ──▶ Claude (12 kall)
      │                            │                        │
      │                            ├── docs/standards/*.md ──┘   (systemprompt,
      │                            │                             spec-mal,
      │                            │                             quality gates …)
      │                            ▼
      │                     Supabase: kickstart_projects
      │                     (project_md + generated_parts oppdateres per del)
      ▼
Prosjektside ──▶ prisestimat · mockup-bilder · bootstrap (GitHub/Supabase/Vercel)
```

**Genereringen skjer i 12 deler, én HTTP-request per del.** Det er ikke en
detalj — det er hele grunnen til at den fungerer: én request på ~100 000 tokens
ville truffet Vercels 300-sekundersgrense. Hver ferdig del lagres i databasen
med `generated_parts`, så et avbrudd (mobilnett, lukket fane) kan gjenopptas
med **«Fortsett generering»** i stedet for å starte forfra.

Standardene i `docs/standards/` er *inputen* til hver eneste del, og sendes med
prompt caching (`cache_control`) slik at de ~40 000 tokenene betales fullt kun
én gang per kjøring.

### Kildekart

| Sti | Ansvar |
| --- | --- |
| `src/app/admin/kickstart/` | Liste, prosjektside, PROJECT.md-visning |
| `src/components/kickstart/` | Wizard, redigering, fremdriftspanel, valgkomponenter |
| `src/components/kickstart/useSpecGeneration.ts` | SSE-løkken for hele 12-dels-genereringen |
| `src/lib/kickstart/generate.ts` | Claude-kallet per del (caching, retry, usage) |
| `src/lib/kickstart/standards.ts` | Bygger prompten av `docs/standards/*.md` |
| `src/lib/kickstart/bootstrap/` | GitHub-, Supabase- og Vercel-oppretting |
| `src/lib/auth/session.ts` | Signert admin-sesjon (brukes av både proxy og API) |
| `src/lib/markdown.ts` | Renderer PROJECT.md til lesbar HTML |
| `docs/standards/` | Fasiten Claude skriver etter |
| `docs/adr/` | Beslutninger med konsekvenser |

---

## Miljøvariabler

Alle settes i Doppler (`prd`). Produksjon i Vercel styres fortsatt manuelt — se
advarselen i [AGENTS.md](./AGENTS.md).

**Påkrevd for kjerneflyten**

| Variabel | Brukes til |
| --- | --- |
| `ANTHROPIC_API_KEY` | All generering |
| `NEXT_PUBLIC_SUPABASE_URL` | Databasen |
| `SUPABASE_SERVICE_ROLE_KEY` | Databasen (server-side, går utenom RLS) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Innlogging |

**Valgfritt**

| Variabel | Uten den |
| --- | --- |
| `ADMIN_SESSION_SECRET` | Sesjonsnøkkelen avledes fra `ADMIN_PASSWORD` — bytte av passord logger deg ut |
| `ANTHROPIC_MODEL` | Bruker `claude-opus-5` (se [ADR 0002](./docs/adr/0002-modellvalg-og-prompt-caching.md)) |
| `GEMINI_API_KEY` | Ingen mockup-bilder |
| `BOOTSTRAP_GITHUB_TOKEN`, `BOOTSTRAP_GITHUB_OWNER` | Ingen GitHub-repo i bootstrap |
| `SUPABASE_MANAGEMENT_TOKEN`, `SUPABASE_ORG_ID` | Ingen Supabase-prosjekt i bootstrap |
| `VERCEL_TOKEN`, `VERCEL_TEAM_ID` | Ingen Vercel-prosjekt i bootstrap |
| `LEADRADAR_HANDOFF_SECRET` | `/api/leadradar-handoff` svarer 401 på alt |
| `NEXT_PUBLIC_SITE_URL` | LeadRadar får `https://kickstart.mlit.no` som lenkebase |

---

## LeadRadar-integrasjon

LeadRadar kan opprette prosjekter direkte:

```http
POST /api/leadradar-handoff
Authorization: Bearer $LEADRADAR_HANDOFF_SECRET
Content-Type: application/json

{ "client_name": "Acme AS", "project_name": "Acme Portal", "short_description": "…" }
```

Kun `client_name` og `project_name` er påkrevd; resten får defaults. Endepunktet
genererer **del 1 av 12** og returnerer `project_id` + `project_url`. Resten
fullføres i admin med «Fortsett generering».

Hemmeligheten er bevisst en annen enn admin-passordet: LeadRadar skal kunne
opprette prosjekter, ikke logge inn.

---

## Videre arbeid

Prioritert liste over det som gjenstår: [docs/ROADMAP.md](./docs/ROADMAP.md).
Regler for hvordan vi jobber i repoet: [CONTRIBUTING.md](./CONTRIBUTING.md).
