-- Leads del sitio público (/empezar, futuros formularios).

create table if not exists public.site_leads (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text,
  mensaje text,
  fuente text not null default 'empezar',
  created_at timestamptz not null default now()
);

create index if not exists site_leads_created_at_idx
  on public.site_leads (created_at desc);

create index if not exists site_leads_email_idx
  on public.site_leads (lower(email));

alter table public.site_leads enable row level security;

comment on table public.site_leads is
  'Prospectos capturados desde el sitio público (página /empezar).';
