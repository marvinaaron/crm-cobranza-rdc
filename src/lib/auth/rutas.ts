/**
 * Mapa de rutas del CRM y a quién pertenecen. Lo usa el middleware para
 * decidir redirecciones, y los layouts para decidir qué chrome mostrar.
 */

/** Rutas que cualquiera puede visitar sin estar logueado. */
export const RUTAS_PUBLICAS: readonly string[] = [
  "/",
  "/login",
  "/portal/login",
  "/portal/recuperar",
];

/** Rutas privadas del back office (requieren rol admin). */
export const PREFIJOS_ADMIN: readonly string[] = [
  "/dashboard",
  "/clientes",
  "/cobranza",
  "/cumplimiento",
  "/configuracion",
  "/perfil",
];

/** Rutas privadas del portal de clientes (requieren rol cliente). */
export const PREFIJO_PORTAL = "/portal";

/** Donde mandar al admin después de login exitoso. */
export const RUTA_DEFAULT_ADMIN = "/dashboard";

/** Donde mandar al cliente después de login exitoso. */
export const RUTA_DEFAULT_CLIENTE = "/portal/honorarios";

export function esRutaPublica(pathname: string): boolean {
  return RUTAS_PUBLICAS.includes(pathname);
}

export function esRutaAdmin(pathname: string): boolean {
  return PREFIJOS_ADMIN.some(
    (prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`)
  );
}

export function esRutaPortal(pathname: string): boolean {
  return (
    pathname === PREFIJO_PORTAL || pathname.startsWith(`${PREFIJO_PORTAL}/`)
  );
}
