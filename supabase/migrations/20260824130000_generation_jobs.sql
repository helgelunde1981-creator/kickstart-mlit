-- Bakgrunnsjobber for spec-generering.
--
-- Bakgrunn: genereringen ble tidligere drevet av nettleseren — én request per
-- del, startet av klienten. Skjermlås på telefon eller en lukket fane stoppet
-- derfor hele løpet midt i. Nå eier databasen fremdriften, og serveren driver
-- den videre uavhengig av om noen ser på.

create table if not exists public.kickstart_generation_jobs (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.kickstart_projects(id) on delete cascade,

  status        text not null default 'queued'
                  check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  -- 1-indeksert: neste del som skal genereres.
  next_part     integer not null default 1,
  total_parts   integer not null default 12,
  -- Forsøk på inneværende del. Nullstilles når en del blir ferdig.
  attempts      integer not null default 0,
  last_error    text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Settes underveis i en del. Stopper den opp, ser vaktposten det her.
  heartbeat_at  timestamptz,
  completed_at  timestamptz
);

-- Ett aktivt løp per prosjekt. Uten dette kunne to faner (eller en utålmodig
-- bruker) startet to jobber som skriver over hverandres deler.
create unique index if not exists kickstart_generation_jobs_one_active
  on public.kickstart_generation_jobs (project_id)
  where status in ('queued', 'running');

create index if not exists kickstart_generation_jobs_status_idx
  on public.kickstart_generation_jobs (status, updated_at);

drop trigger if exists kickstart_generation_jobs_set_updated_at on public.kickstart_generation_jobs;
create trigger kickstart_generation_jobs_set_updated_at
  before update on public.kickstart_generation_jobs
  for each row execute function public.set_updated_at();

alter table public.kickstart_generation_jobs enable row level security;

-- Statusvisningen poller mens jobben går. Uten dette måtte serveren dra hele
-- project_md (100 000+ tegn) for hvert kall bare for å vise de siste linjene.
create or replace function public.kickstart_project_tail(p_id uuid, p_len integer default 1200)
returns table (tail text, total_chars integer)
language sql
stable
as $$
  select right(coalesce(project_md, ''), p_len), length(coalesce(project_md, ''))
  from public.kickstart_projects
  where id = p_id;
$$;
