-- Certificados de e.firma (FIEL) por cliente — almacenamiento de metadatos.
-- Los archivos .cer y .key viven en el bucket privado `efirmas` (service_role).

create table if not exists public.cliente_efirma (
  id uuid primary key default gen_random_uuid(),
  cliente_id bigint not null unique,
  titular text not null,
  rfc_certificado text,
  vigencia_inicio timestamptz not null,
  vigencia_fin timestamptz not null,
  cer_path text not null,
  key_path text,
  -- Recordatorios automáticos enviados (correo + push vía admin)
  notificado_30 boolean not null default false,
  notificado_15 boolean not null default false,
  notificado_7 boolean not null default false,
  notificado_3 boolean not null default false,
  ultimo_correo_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cliente_efirma_vigencia_fin_idx
  on public.cliente_efirma (vigencia_fin);

alter table public.cliente_efirma enable row level security;

comment on table public.cliente_efirma is
  'Metadatos de e.firma por cliente. Archivos en bucket efirmas; solo backend con service_role.';
