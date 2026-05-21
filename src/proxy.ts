import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { getRol } from "@/lib/supabase/roles";
import {
  RUTA_DEFAULT_ADMIN,
  RUTA_DEFAULT_CLIENTE,
  esRutaAdmin,
  esRutaPortal,
} from "@/lib/auth/rutas";
import {
  esPropietario,
  getPermisos,
  jwtSinInfoPermisos,
  moduloDeRuta,
} from "@/lib/admin/permisos";

const PORTAL_PUBLICAS = new Set([
  "/portal/login",
  "/portal/recuperar",
  "/portal/cambiar-clave", // accesible vía link de recuperación
]);

/**
 * Proxy global (Next.js 16+ reemplaza middleware.ts).
 * Refresca sesión Supabase y protege rutas admin y portal.
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request);
  const pathname = request.nextUrl.pathname;
  const rol = getRol(user);

  // Backoffice (admin)
  if (esRutaAdmin(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (rol !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = rol === "cliente" ? RUTA_DEFAULT_CLIENTE : "/login";
      return NextResponse.redirect(url);
    }

    // Permisos por módulo: el propietario tiene acceso a todo; el resto solo
    // a los módulos asignados. /perfil siempre es accesible para cualquier
    // admin. Si el JWT es de antes de introducir permisos, lo dejamos pasar
    // para no romper la sesión activa; en cuanto vuelva a hacer login, su
    // JWT tendrá la info de permisos.
    if (
      pathname !== "/perfil" &&
      !esPropietario(user) &&
      !jwtSinInfoPermisos(user)
    ) {
      const modulo = moduloDeRuta(pathname);
      if (modulo) {
        const permisos = getPermisos(user);
        if (!permisos.includes(modulo)) {
          const url = request.nextUrl.clone();
          url.pathname = permisos[0] ? `/${permisos[0]}` : "/perfil";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  // Portal cliente
  if (esRutaPortal(pathname) && !PORTAL_PUBLICAS.has(pathname)) {
    // Permite portales legacy con id numérico en /portal/[id] (mantener compat)
    const esLegacyId = /^\/portal\/\d+$/.test(pathname);
    if (!esLegacyId) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/portal/login";
        return NextResponse.redirect(url);
      }
      if (rol !== "cliente") {
        const url = request.nextUrl.clone();
        url.pathname = rol === "admin" ? RUTA_DEFAULT_ADMIN : "/portal/login";
        return NextResponse.redirect(url);
      }
    }
  }

  // Si está logueado y entra a /login o /portal/login, mandarlo a su panel.
  if ((pathname === "/login" || pathname === "/portal/login") && user) {
    const url = request.nextUrl.clone();
    if (rol === "admin") url.pathname = RUTA_DEFAULT_ADMIN;
    else if (rol === "cliente") url.pathname = RUTA_DEFAULT_CLIENTE;
    else return response;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clientes/:path*",
    "/cobranza/:path*",
    "/cumplimiento/:path*",
    "/configuracion/:path*",
    "/perfil/:path*",
    "/login",
    "/portal/:path*",
    "/auth/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)",
  ],
};
