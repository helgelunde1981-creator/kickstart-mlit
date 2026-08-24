-- Skjemaet for kickstart-verktøyet. Tabellen har levd kun i Supabase-dashboardet
-- fram til nå; denne filen er fasiten som gjør at et nytt miljø kan settes opp
-- uten å gjette. Idempotent — trygg å kjøre mot eksisterende prod-database.

create extension if not exists "pgcrypto";

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
  tech_stack           text[] not null default '{}',
  integrations         text[] not null default '{}',
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
  generated_parts      integer not null default 0,
  price_estimate       jsonb,
  mockup_images        text[] not null default '{}',
  step_completed       integer not null default 0,

  -- Bootstrap
  github_repo_url      text,
  supabase_project_ref text,
  vercel_project_id    text
);

-- Kolonner lagt til etter at tabellen ble opprettet manuelt i dashboardet.
alter table public.kickstart_projects
  add column if not exists generated_parts integer not null default 0;
alter table public.kickstart_projects
  add column if not exists mockup_images text[] not null default '{}';

create index if not exists kickstart_projects_created_at_idx
  on public.kickstart_projects (created_at desc);
create index if not exists kickstart_projects_status_idx
  on public.kickstart_projects (status);

-- updated_at vedlikeholdes i databasen, ikke i appen — da kan ingen kodesti
-- glemme det.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kickstart_projects_set_updated_at on public.kickstart_projects;
create trigger kickstart_projects_set_updated_at
  before update on public.kickstart_projects
  for each row execute function public.set_updated_at();

-- RLS på uten policyer: appen snakker med databasen som service_role (som går
-- utenom RLS), og ingen anon-klient skal noensinne lese kundedata herfra.
alter table public.kickstart_projects enable row level security;
