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
idempotent. **Bakgrunnsgenereringen krever at migrasjonene er kjørt** — uten
tabellen `kickstart_generation_jobs` kan ingen jobb legges i kø. Kjør det mot en ny database (eller mot prod for å få kolonner som er
kommet til senere) via Supabase SQL-editor eller `supabase db push`.

`GET /api/kickstart/health` (krever innlogging) svarer på om standardfilene og
miljøvariablene er på plass — og om appen faktisk **når seg selv** på URL-en
bakgrunnsjobben bruker. Svarer den `ok: false` med `self_url.reachable: false`,
kommer ingen generering i gang.

---

## Slik henger det sammen

```
Wizard (9 steg)
      │
      │ POST /api/kickstart/generate   ← svarer på under et sekund
      ▼
kickstart_generation_jobs (kø i databasen)
      │
      │ POST /api/kickstart/worker  ──▶  én del  ──▶ Claude
      │        ▲                            │
      │        │  kjeder seg selv videre    ├── docs/standards/*.md
      │        │  til alle 12 er ferdige    ▼
      │        │                     kickstart_projects
      │        │                     (project_md + generated_parts per del)
      │        │
      │   /api/kickstart/cron (hvert 5. min): vaktpost som gjenoppliver
      │   jobber som har stoppet opp
      ▼
Prosjektside (poller status) ──▶ prisestimat · mockup-bilder · bootstrap
```

**Genereringen kjører på serveren, ikke i nettleseren.** Klienten starter et løp
og poller status; den driver ingenting. Derfor stopper ikke genereringen av at
telefonen låser seg, fanen lukkes eller nettet forsvinner — man kommer bare
tilbake til en side som har kommet lenger.

**Hver del er én invokasjon.** Én request på ~100 000 tokens ville truffet
Vercels 300-sekundersgrense; med én del per kjøring er marginen god, og et krasj
koster maks én del. Worker-en svarer med en gang og gjør arbeidet i `after()`,
så kjedingen mellom delene aldri holder en forbindelse åpen i minutter.

Tre ting sikrer at løpet kommer i mål: kjedingen (rask, normalveien),
cron-vaktposten hvert 5. minutt (fanger jobber som stoppet opp, og **kjører en
del selv** hvis selvkallene ikke kommer fram — da fullfører en spec seg på en
times tid uten at noe HTTP-kall mellom deler virker), og `attempts`-telleren som
gir opp etter tre forsøk på samme del i stedet for å brenne penger i en løkke.

Selv-URL-en hentes fra domenet forespørselen kom inn på. Det er med vilje:
`VERCEL_URL` finnes bare når «Automatically expose System Environment Variables»
er på, og `.vercel.app`-domenene her ligger bak Vercels SSO — begge deler ville
gjort kjedingen avhengig av riktig oppsett i dashbordet.

Standardene i `docs/standards/` er *inputen* til hver eneste del, og sendes med
prompt caching (`cache_control`) slik at de ~40 000 tokenene betales fullt kun
én gang per kjøring.

### Kildekart

| Sti | Ansvar |
| --- | --- |
| `src/app/admin/kickstart/` | Liste, prosjektside, PROJECT.md-visning |
| `src/components/kickstart/` | Wizard, redigering, fremdriftspanel, valgkomponenter |
| `src/lib/kickstart/jobs.ts` | Kø og tilstandsmaskin for genereringsløp |
| `src/lib/kickstart/worker.ts` | Genererer én del og setter jobben klar til neste |
| `src/components/kickstart/useGenerationJob.ts` | Klientens statuspolling (driver ingenting selv) |
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
| `NEXT_PUBLIC_SITE_URL` | Appen leser domenet fra den innkommende forespørselen i stedet. Settes den, overstyrer den alt annet — nyttig hvis noe skal tvinges til ett bestemt domene |
| `GENERATION_WORKER_SECRET` | Appen bruker `ADMIN_PASSWORD` når den kaller seg selv (worker/cron) |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Settes automatisk av Vercel hvis «Protection Bypass for Automation» er på — brukes som reserve når selvkallet treffer et beskyttet domene |
| `CRON_SECRET` | Samme — settes den, brukes den også av Vercel Cron |
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
oppretter prosjektet, legger et genereringsløp i kø og svarer umiddelbart med
`project_id`, `project_url` og `job_id`. Hele specen genereres i bakgrunnen —
LeadRadar venter ikke.

Hemmeligheten er bevisst en annen enn admin-passordet: LeadRadar skal kunne
opprette prosjekter, ikke logge inn.

---

## Videre arbeid

Prioritert liste over det som gjenstår: [docs/ROADMAP.md](./docs/ROADMAP.md).
Regler for hvordan vi jobber i repoet: [CONTRIBUTING.md](./CONTRIBUTING.md).
