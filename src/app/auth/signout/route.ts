import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Cierra sesión y borra las cookies de auth en la respuesta HTTP.
 * Más fiable que signOut() desde un server action (ahí setAll suele fallar).
 */
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Después de cerrar sesión volvemos a la home pública. Tanto el admin
  // (que conoce su URL no estándar) como el cliente saben cómo regresar
  // desde ahí, y evitamos exponer la URL de admin a quien no debe verla.
  const landingUrl = new URL("/", request.url);
  let response = NextResponse.redirect(landingUrl);

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.signOut();
  return response;
}
