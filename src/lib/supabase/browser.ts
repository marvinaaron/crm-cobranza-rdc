"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para el navegador.
 *
 * - Usa la `anon key` (pública). Toda la lectura/escritura pasa por RLS.
 * - Lee/escribe la sesión en cookies (compatibles con SSR de Next.js).
 * - Singleton por pestaña.
 */

let cached: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno."
    );
  }

  cached = createBrowserClient(url, anonKey);
  return cached;
}
