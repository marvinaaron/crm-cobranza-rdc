import { NextResponse, NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { getRol } from "@/lib/supabase/roles";
import {
  RUTA_DEFAULT_ADMIN,
  RUTA_DEFAULT_CLIENTE,
  RUTA_LOGIN_ADMIN,
  RUTAS_ALIAS_LOGIN_ADMIN,
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
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const requestWithPath = new NextRequest(request.url, {
    headers: requestHeaders,
  });

  // Rutas SEO: no pasar por sesión Supabase (evita 500 en sitemap/robots)
  if (pathname === "/sitemap.xml" || pathname === "/robots.txt") {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  const { response, user } = await updateSupabaseSession(requestWithPath);
  const rol = getRol(user);

  // Rutas "alias" tipo /admin, /login, /wp-admin... Las redirigimos
  // siempre al login real para no filtrar la existencia del back
  // office ni mostrar chrome admin en un 404. Si el usuario ya está
  // autenticado como admin, lo mandamos directo al dashboard.
  if (RUTAS_ALIAS_LOGIN_ADMIN.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = rol === "admin" ? RUTA_DEFAULT_ADMIN : RUTA_LOGIN_ADMIN;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Backoffice (admin)
  if (esRutaAdmin(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = RUTA_LOGIN_ADMIN;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (rol !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = rol === "cliente" ? RUTA_DEFAULT_CLIENTE : RUTA_LOGIN_ADMIN;
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

  // Si está logueado y entra a un login, mandarlo a su panel.
  // (la raíz "/" es una página pública/informativa: NO redirigimos aunque
  // el usuario esté logueado para que pueda navegar el sitio del despacho)
  if (
    (pathname === RUTA_LOGIN_ADMIN || pathname === "/portal/login") &&
    user
  ) {
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
    "/cfdi/:path*",
    "/cobranza/:path*",
    "/presupuestos/:path*",
    "/cumplimiento/:path*",
    "/encargos/:path*",
    "/efirmas/:path*",
    "/configuracion/:path*",
    "/blog-comentarios/:path*",
    "/perfil/:path*",
    "/acceso/:path*",
    "/portal/:path*",
    "/auth/:path*",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)",
  ],
};
