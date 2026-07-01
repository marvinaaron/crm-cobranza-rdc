-- Campos de consulta (sin descarga) para el visor Hacienda del portal.

alter table public.cliente_cfdi
  add column if not exists estatus text not null default 'vigente'
    check (estatus in ('vigente', 'cancelado'));

alter table public.cliente_cfdi
  add column if not exists categoria_visor text;

create index if not exists cliente_cfdi_categoria_idx
  on public.cliente_cfdi (cliente_id, categoria_visor);
