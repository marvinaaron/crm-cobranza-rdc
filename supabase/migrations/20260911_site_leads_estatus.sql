-- Embudo interno de prospectos. No afecta la gráfica de nuevos clientes (cartera).
-- motivo_rechazo se guarda para un análisis posterior (IA / resumen de porqués).

alter table public.site_leads
  add column if not exists estatus text not null default 'nuevo',
  add column if not exists estatus_en timestamptz not null default now(),
  add column if not exists motivo_rechazo text;

alter table public.site_leads
  drop constraint if exists site_leads_estatus_check;
alter table public.site_leads
  add constraint site_leads_estatus_check
  check (estatus in ('nuevo', 'contactado', 'aceptado', 'rechazado'));

alter table public.site_leads
  drop constraint if exists site_leads_motivo_rechazo_check;
alter table public.site_leads
  add constraint site_leads_motivo_rechazo_check
  check (
    estatus <> 'rechazado'
    or (
      motivo_rechazo is not null
      and char_length(btrim(motivo_rechazo)) >= 20
    )
  );

create index if not exists site_leads_estatus_idx
  on public.site_leads (estatus, created_at desc);

comment on column public.site_leads.estatus is
  'Embudo interno: nuevo, contactado, aceptado, rechazado.';
comment on column public.site_leads.estatus_en is
  'Última vez que cambió el estatus.';
comment on column public.site_leads.motivo_rechazo is
  'Texto libre obligatorio al rechazar. Base para resumir razones con IA más adelante.';
