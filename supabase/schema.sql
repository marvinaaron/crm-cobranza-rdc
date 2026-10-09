-- ─────────────────────────────────────────────────────────────────────────────
-- CRM Cobranza RDC · Esquema base
-- Aplicar con: node scripts/apply-schema.mjs
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ════════════════════════════════════════════════════════════════════════════
-- Enums
-- ════════════════════════════════════════════════════════════════════════════
do $$ begin
  create type public.cumplimiento_flujo as enum (
    'por_trabajar',
    'iniciando',
    'preliminar',
    'aceptacion',
    'declaraciones',
    'pago',
    'completado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.categoria_impuesto as enum (
    'federales',
    'imss',
    'estatales',
    'otros'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.estado_pago_mensual as enum (
    'pagado',
    'extemporaneo',
    'cero',
    'pendiente',
    'vencido',
    'sin_dato'
  );
exception when duplicate_object then null; end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- Tablas
-- ════════════════════════════════════════════════════════════════════════════

-- Clientes -----------------------------------------------------------------
create table if not exists public.clientes (
  id                    uuid primary key default gen_random_uuid(),
  nombre                text not null,
  rfc                   text,
  email                 text,
  telefono              text,
  honorarios            numeric(12,2) default 0,
  dia_pago              smallint,
  esquema               text,
  es_ingreso_diverso    boolean default false,
  sin_pago_impuestos    boolean default false,
  notas                 text,
  metadata              jsonb default '{}'::jsonb,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Cumplimiento por periodo --------------------------------------------------
create table if not exists public.cumplimiento_registros (
  id                        uuid primary key default gen_random_uuid(),
  cliente_id                uuid not null references public.clientes(id) on delete cascade,
  periodo                   text not null,                       -- 'YYYY-MM'
  flujo                     public.cumplimiento_flujo default 'por_trabajar',
  sin_pago_impuestos        boolean default false,
  totales                   jsonb default '{}'::jsonb,           -- {federales, imss, estatales, otros, total}
  fechas_limite             jsonb default '{}'::jsonb,
  preliminar_publicado_at   timestamptz,
  aceptado_at               timestamptz,
  completado_at             timestamptz,
  notas                     text,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now(),
  unique (cliente_id, periodo)
);

create index if not exists idx_cumplimiento_cliente on public.cumplimiento_registros(cliente_id);
create index if not exists idx_cumplimiento_periodo on public.cumplimiento_registros(periodo);

-- Documentos del cumplimiento (preliminares, declaraciones, etc.) ----------
create table if not exists public.cumplimiento_documentos (
  id              uuid primary key default gen_random_uuid(),
  registro_id     uuid not null references public.cumplimiento_registros(id) on delete cascade,
  categoria       public.categoria_impuesto not null,
  tipo            text not null,        -- 'preliminar' | 'sipare' | 'ema' | 'eba' | 'linea_captura' | 'nomina' | 'declaracion' | 'otros' ...
  storage_path    text not null,        -- ruta en bucket 'pdfs-cumplimiento'
  file_name       text,
  mime_type       text,
  size_bytes      bigint,
  monto           numeric(12,2),
  fecha_limite    date,
  notas           text,
  created_at      timestamptz default now()
);

create index if not exists idx_cumpl_docs_registro on public.cumplimiento_documentos(registro_id);

-- Comprobantes de pago de IMPUESTOS (los sube el cliente) -------------------
create table if not exists public.comprobantes_pago_impuestos (
  id              uuid primary key default gen_random_uuid(),
  registro_id     uuid not null references public.cumplimiento_registros(id) on delete cascade,
  categoria       public.categoria_impuesto not null,
  storage_path    text not null,        -- bucket 'comprobantes-impuestos'
  file_name       text,
  mime_type       text,
  size_bytes      bigint,
  monto           numeric(12,2),
  validado        boolean default false,
  validado_at     timestamptz,
  validado_por    uuid,                 -- auth.users(id)
  created_at      timestamptz default now()
);

create index if not exists idx_comp_imp_registro on public.comprobantes_pago_impuestos(registro_id);

-- Comprobantes de pago de HONORARIOS (cobranza) -----------------------------
create table if not exists public.comprobantes_honorarios (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid not null references public.clientes(id) on delete cascade,
  storage_path        text not null,        -- bucket 'comprobantes-honorarios'
  file_name           text,
  mime_type           text,
  size_bytes          bigint,
  monto_declarado     numeric(12,2),
  meses_cubiertos     text[] default '{}',  -- ['2026-05', '2026-06']
  validado            boolean default false,
  validado_at         timestamptz,
  validado_por        uuid,
  notas               text,
  created_at          timestamptz default now()
);

create index if not exists idx_comp_hon_cliente on public.comprobantes_honorarios(cliente_id);

-- Pagos aplicados (de honorarios, por mes) ---------------------------------
create table if not exists public.pagos_realizados (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid not null references public.clientes(id) on delete cascade,
  periodo           text not null,            -- 'YYYY-MM'
  monto             numeric(12,2) not null,
  fecha             date not null default current_date,
  comprobante_id    uuid references public.comprobantes_honorarios(id) on delete set null,
  notas             text,
  created_at        timestamptz default now()
);

create index if not exists idx_pagos_cliente_periodo on public.pagos_realizados(cliente_id, periodo);
create index if not exists idx_pagos_comprobante on public.pagos_realizados(comprobante_id);

-- Facturas emitidas ---------------------------------------------------------
create table if not exists public.facturas (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references public.clientes(id) on delete cascade,
  periodo         text not null,            -- 'YYYY-MM'
  storage_path    text not null,            -- bucket 'facturas'
  file_name       text,
  mime_type       text,
  size_bytes      bigint,
  monto           numeric(12,2),
  uuid_sat        text,
  emitida_at      timestamptz default now(),
  created_at      timestamptz default now(),
  unique (cliente_id, periodo)
);

create index if not exists idx_facturas_cliente on public.facturas(cliente_id);

-- Historial impuestos anual (por mes + categoría) --------------------------
create table if not exists public.historial_impuestos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.clientes(id) on delete cascade,
  anio        smallint not null,
  mes         smallint not null check (mes between 1 and 12),
  categoria   public.categoria_impuesto not null,
  estado      public.estado_pago_mensual default 'sin_dato',
  monto       numeric(12,2) default 0,
  notas       text,
  unique (cliente_id, anio, mes, categoria)
);

create index if not exists idx_hist_cliente_anio on public.historial_impuestos(cliente_id, anio);

-- Notificaciones (bandeja de campana) --------------------------------------
create table if not exists public.notificaciones (
  id                         uuid primary key default gen_random_uuid(),
  destinatario_rol           text not null check (destinatario_rol in ('admin', 'cliente')),
  destinatario_cliente_id    uuid references public.clientes(id) on delete cascade,
  tipo                       text not null,
  titulo                     text not null,
  mensaje                    text,
  metadata                   jsonb default '{}'::jsonb,
  leida                      boolean default false,
  created_at                 timestamptz default now()
);

create index if not exists idx_notif_admin
  on public.notificaciones (destinatario_rol, leida, created_at desc)
  where destinatario_rol = 'admin';

create index if not exists idx_notif_cliente
  on public.notificaciones (destinatario_cliente_id, leida, created_at desc)
  where destinatario_rol = 'cliente';

-- Credenciales portal cliente ----------------------------------------------
create table if not exists public.credenciales_portal (
  cliente_id        uuid primary key references public.clientes(id) on delete cascade,
  auth_user_id      uuid unique,            -- referencia a auth.users(id)
  email             text not null,
  ultimo_login_at   timestamptz,
  activo            boolean default true,
  created_at        timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- Trigger genérico updated_at
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_clientes_updated_at on public.clientes;
create trigger trg_clientes_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_cumplimiento_registros_updated_at on public.cumplimiento_registros;
create trigger trg_cumplimiento_registros_updated_at
  before update on public.cumplimiento_registros
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════════
-- Row Level Security
--   - Activamos RLS en todas las tablas para que NUNCA queden expuestas con
--     la anon key sin políticas explícitas.
--   - Las políticas finas se irán agregando cuando integremos auth de cliente
--     y admin. Por ahora el código del CRM hablará con la base usando la
--     service_role key, que ignora RLS.
-- ════════════════════════════════════════════════════════════════════════════
alter table public.clientes                     enable row level security;
alter table public.cumplimiento_registros       enable row level security;
alter table public.cumplimiento_documentos      enable row level security;
alter table public.comprobantes_pago_impuestos  enable row level security;
alter table public.comprobantes_honorarios      enable row level security;
alter table public.pagos_realizados             enable row level security;
alter table public.facturas                     enable row level security;
alter table public.historial_impuestos          enable row level security;
alter table public.notificaciones               enable row level security;
alter table public.credenciales_portal          enable row level security;
