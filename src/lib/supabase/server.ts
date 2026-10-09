import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para server components, route handlers y server actions.
 *
 * - Usa la `anon key` con la sesión almacenada en cookies. Toda la
 *   lectura/escritura pasa por RLS según el usuario logueado.
 * - Crear UNA instancia por request (no se puede cachear como singleton,
 *   porque cada request tiene sus propias cookies).
 */
export async function getSupabaseServer(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll desde un Server Component lanza error; lo ignoramos porque
          // el middleware ya se encarga de refrescar la sesión.
        }
      },
    },
  });
}
