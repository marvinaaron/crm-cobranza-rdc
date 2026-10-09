-- Uso freemium de la Calculadora de Facturación (contador servidor).

create table if not exists public.herramientas_facturacion_uso (
  visitor_id text primary key,
  calculos integer not null default 0 check (calculos >= 0),
  cuenta_verificada boolean not null default false,
  es_pro boolean not null default false,
  user_id uuid,
  email_pro text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists herramientas_facturacion_uso_email_idx
  on public.herramientas_facturacion_uso (lower(email_pro))
  where email_pro is not null;

alter table public.herramientas_facturacion_uso enable row level security;

comment on table public.herramientas_facturacion_uso is
  'Contador de consultas gratuitas de la Calculadora de Facturación por visitante.';
