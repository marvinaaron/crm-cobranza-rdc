import type { User } from "@supabase/supabase-js";

/**
 * Roles que reconoce el CRM. Se guardan en `auth.users.app_metadata.rol`
 * (no en `user_metadata`, que el propio usuario podría reescribir).
 */
export type RolUsuario = "admin" | "cliente";

export function getRol(user: User | null | undefined): RolUsuario | null {
  if (!user) return null;
  const rol = (user.app_metadata as Record<string, unknown> | undefined)?.rol;
  if (rol === "admin" || rol === "cliente") return rol;
  return null;
}

export function esAdmin(user: User | null | undefined): boolean {
  return getRol(user) === "admin";
}

export function esCliente(user: User | null | undefined): boolean {
  return getRol(user) === "cliente";
}
