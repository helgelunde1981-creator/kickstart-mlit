-- Skjemaet for kickstart-verktøyet, slik det faktisk ser ut i prod.
--
-- Tabellen ble opprettet før repoet hadde migrasjonsfiler; denne filen er
-- fasiten som gjør at et nytt miljø kan settes opp uten å gjette. Idempotent —
-- trygg å kjøre mot den eksisterende produksjonsdatabasen.
--
-- Merk: tech_stack og integrations er jsonb (ikke text[]), fordi det er slik de
-- ble laget. Endres det, må queries.ts endres samtidig.

create table if not exists public.kickstart_projects (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- Kunde og prosjekt
  client_name          text not null,
  project_name         text not null,
  contact_person       text,
  new_domain           text,
  existing_url         text,

  -- Omfang
  project_type         text not null,
  auth_type            text default 'supabase-auth',
  sprint_estimate      integer default 6,
  requires_scrape      boolean not null default false,

  -- Valg
  tech_stack           jsonb not null default '[]'::jsonb,
  integrations         jsonb not null default '[]'::jsonb,
  design_direction     text,
  primary_color        text,
  secondary_color      text,
  motion_preference    text default 'subtil',

  -- Innhold
  features             text,
  extra_notes          text,
  short_description    text,
  long_description     text,

  -- Generering
  status               text not null default 'draft'
                         check (status in ('draft', 'generated', 'bootstrapped')),
  project_md           text,
  price_estimate       jsonb,
  mockup_images        text[] not null default '{}',
  step_completed       integer not null default 1,

  -- Bootstrap
  github_repo_url      text,
  supabase_project_ref text,
  vercel_project_id    text
);

-- Kolonner som er kommet til etter at tabellen ble opprettet.
alter table public.kickstart_projects
  add column if not exists mockup_images text[] not null default '{}';
-- Hvor mange av de 12 delene som er ferdig generert. Uten denne vet ikke
-- verktøyet hvor en avbrutt generering skal fortsette.
alter table public.kickstart_projects
  add column if not exists generated_parts integer not null default 0;

-- Prosjekter som ble ferdige før kolonnen fantes: alt som har status generated
-- eller bootstrapped er et fullført løp, og skal ikke tilby «fortsett».
update public.kickstart_projects
   set generated_parts = 12
 where status in ('generated', 'bootstrapped')
   and generated_parts = 0;

create index if not exists kickstart_projects_created_at_idx
  on public.kickstart_projects (created_at desc);
create index if not exists kickstart_projects_status_idx
  on public.kickstart_projects (status);

-- updated_at vedlikeholdes i databasen, ikke i appen — da kan ingen kodesti
-- glemme det. Funksjonen finnes allerede i prod under dette navnet.
create or replace function public.update_updated_at()
returns trigger
language plpgsql
-- Fast search_path: Supabase-linteren flagger funksjoner uten. Funksjonen
-- bruker bare now() (pg_catalog), så tom er trygt.
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggeren finnes i prod som kickstart_projects_updated_at. Vi lager den kun
-- hvis tabellen mangler en — to triggere som gjør det samme er bare støy.
do $$
begin
  if not exists (
    select 1
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
     where not t.tgisinternal
       and c.relname = 'kickstart_projects'
       and c.relnamespace = 'public'::regnamespace
  ) then
    create trigger kickstart_projects_updated_at
      before update on public.kickstart_projects
      for each row execute function public.update_updated_at();
  end if;
end $$;

-- RLS på uten policyer: appen snakker med databasen som service_role (som går
-- utenom RLS), og ingen anon-klient skal noensinne lese kundedata herfra.
alter table public.kickstart_projects enable row level security;
