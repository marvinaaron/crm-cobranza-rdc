-- Suscripciones Web Push para administradores del despacho.
-- Una fila por (admin_user_id, endpoint). Permite que el admin reciba
-- notificaciones en su iPhone/Mac cuando un cliente sube comprobantes, etc.

create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_push_subscriptions_admin_idx
  on public.admin_push_subscriptions (admin_user_id);

alter table public.admin_push_subscriptions enable row level security;

comment on table public.admin_push_subscriptions is
  'Suscripciones Web Push del equipo del despacho (admins). Las maneja el backend con service_role.';
