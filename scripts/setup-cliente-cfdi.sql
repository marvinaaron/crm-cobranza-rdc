-- Ejecutar UNA VEZ en Supabase → SQL Editor (proyecto de producción).
-- Crea la tabla cliente_cfdi y columnas del visor Hacienda.
-- También corre: node scripts/setup-storage.mjs  (bucket `cfdi`)

-- 1) Tabla base
create table if not exists public.cliente_cfdi (
  id uuid primary key default gen_random_uuid(),
  cliente_id bigint not null,
  uuid_sat text not null,
  tipo text not null check (tipo in ('emitido', 'recibido')),
  tipo_comprobante text not null default 'I',
  rfc_emisor text not null,
  nombre_emisor text,
  rfc_receptor text not null,
  nombre_receptor text,
  fecha timestamptz not null,
  mes smallint not null,
  anio smallint not null,
  subtotal numeric(14, 2) not null,
  total numeric(14, 2) not null,
  moneda text not null default 'MXN',
  concepto_resumen text,
  xml_path text not null,
  nombre_archivo text,
  tamano_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cliente_id, uuid_sat)
);

create index if not exists cliente_cfdi_cliente_periodo_idx
  on public.cliente_cfdi (cliente_id, anio desc, mes desc);

create index if not exists cliente_cfdi_cliente_fecha_idx
  on public.cliente_cfdi (cliente_id, fecha desc);

create index if not exists cliente_cfdi_cliente_tipo_idx
  on public.cliente_cfdi (cliente_id, tipo);

alter table public.cliente_cfdi enable row level security;

comment on table public.cliente_cfdi is
  'CFDI por cliente. XML en bucket cfdi; listado en portal vía API con auth.';

-- 2) Columnas consulta / visor
alter table public.cliente_cfdi
  add column if not exists estatus text not null default 'vigente'
    check (estatus in ('vigente', 'cancelado'));

alter table public.cliente_cfdi
  add column if not exists categoria_visor text;

create index if not exists cliente_cfdi_categoria_idx
  on public.cliente_cfdi (cliente_id, categoria_visor);

-- Recargar schema cache de PostgREST (opcional; a veces ayuda al instante)
notify pgrst, 'reload schema';
