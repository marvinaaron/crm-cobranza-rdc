-- Tabla para almacenar las suscripciones Web Push de cada cliente.
-- Cada navegador/dispositivo genera una suscripción distinta (endpoint único).

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  cliente_id bigint not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_cliente_id_idx
  on public.push_subscriptions (cliente_id);

-- RLS: solo accesible vía service_role (las API routes lo usan).
alter table public.push_subscriptions enable row level security;

-- Sin políticas públicas → bloqueado por defecto para anon/authenticated.
-- (El service_role bypassa RLS, que es lo que queremos.)

comment on table public.push_subscriptions is
  'Suscripciones Web Push activas por cliente. Las maneja el backend con service_role.';
