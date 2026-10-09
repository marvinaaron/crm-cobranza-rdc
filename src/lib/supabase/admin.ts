import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con privilegios de administrador (service_role).
 *
 * - Ignora Row Level Security: usar SOLO desde servidor para tareas
 *   privilegiadas (crear usuarios, semillas, jobs admin).
 * - Nunca importar desde código que termine en el bundle del navegador.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error(
      "getSupabaseAdmin() es solo para servidor (usa la service_role key)."
    );
  }
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
