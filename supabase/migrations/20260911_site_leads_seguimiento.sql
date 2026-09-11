-- Seguimiento de prospectos: siguiente paso, bitácora y vínculo a cartera.

alter table public.site_leads
  add column if not exists siguiente_paso_en timestamptz,
  add column if not exists siguiente_paso_nota text,
  add column if not exists bitacora jsonb not null default '[]'::jsonb,
  add column if not exists cliente_id integer;

comment on column public.site_leads.siguiente_paso_en is
  'Cuándo volver a contactar. Si vence y sigue abierto, el semáforo se pone rojo.';
comment on column public.site_leads.siguiente_paso_nota is
  'Qué hacer en el siguiente paso (ej. mandar cotización, llamar).';
comment on column public.site_leads.bitacora is
  'Eventos internos: WhatsApp, cotización, llamada, cambios de estatus.';
comment on column public.site_leads.cliente_id is
  'Id del cliente en el CRM local cuando se dio de alta en cartera.';

create index if not exists site_leads_siguiente_paso_idx
  on public.site_leads (siguiente_paso_en)
  where siguiente_paso_en is not null;
