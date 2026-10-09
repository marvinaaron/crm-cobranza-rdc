import type { User } from "@supabase/supabase-js";

/** Id numérico del cliente en app_metadata del usuario portal. */
export function clienteIdDesdeUsuarioPortal(
  user: User | null | undefined
): number | null {
  if (!user) return null;
  const meta = user.app_metadata as Record<string, unknown>;
  const id = Number(meta.clienteId);
  return Number.isFinite(id) ? id : null;
}
