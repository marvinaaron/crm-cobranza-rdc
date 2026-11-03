import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { RUTA_LOGIN_ADMIN } from "@/lib/auth/rutas";

/**
 * Cierra sesión y borra las cookies de auth en la respuesta HTTP.
 * Más fiable que signOut() desde un server action (ahí setAll suele fallar).
 *
 * Destino:
 * - `?next=` si es una ruta de login conocida
 * - Referer bajo /portal → /portal/login
 * - Referer admin → login admin
 * - Por defecto → /portal/login (webapp de clientes, no la home de marketing)
 */
function destinoLogout(request: NextRequest): URL {
  const next = request.nextUrl.searchParams.get("next");
  if (next === "/portal/login" || next === RUTA_LOGIN_ADMIN) {
    return new URL(next, request.url);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const ref = new URL(referer);
      if (ref.origin === new URL(request.url).origin) {
        if (ref.pathname.startsWith("/portal")) {
          return new URL("/portal/login", request.url);
        }
        if (
          ref.pathname.startsWith("/dashboard") ||
          ref.pathname.startsWith("/clientes") ||
          ref.pathname.startsWith("/cobranza") ||
          ref.pathname === RUTA_LOGIN_ADMIN ||
          ref.pathname.startsWith("/acceso/")
        ) {
          return new URL(RUTA_LOGIN_ADMIN, request.url);
        }
      }
    } catch {
      // ignore
    }
  }

  return new URL("/portal/login", request.url);
}

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const landingUrl = destinoLogout(request);
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
