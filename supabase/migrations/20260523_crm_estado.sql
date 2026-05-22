-- Estado central del CRM (reemplaza localStorage en producción).
-- Cada fila guarda un arreglo JSON completo por dominio (clientes, cumplimiento, etc.).

create table if not exists public.crm_estado (
  clave text primary key,
  payload jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.crm_estado enable row level security;

comment on table public.crm_estado is
  'Almacén JSON del CRM RDC. Claves: clientes, comprobantes, facturas, cumplimiento, historial_impuestos, notificaciones.';
