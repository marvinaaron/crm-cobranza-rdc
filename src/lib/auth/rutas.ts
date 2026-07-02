/**
 * Mapa de rutas del CRM y a quién pertenecen. Lo usa el middleware para
 * decidir redirecciones, y los layouts para decidir qué chrome mostrar.
 */

/**
 * URL de acceso al CRM (administradores).
 *
 * Esta URL es deliberadamente no estándar para reducir ataques automatizados
 * de bots que escanean rutas comunes (`/login`, `/admin`, `/wp-admin`).
 * Si se cambia, actualizar también esta constante: el resto del código la
 * usa para construir redirecciones, logout, etc.
 */
export const RUTA_LOGIN_ADMIN = "/acceso/consola-rdc";

/** Rutas que cualquiera puede visitar sin estar logueado. */
export const RUTAS_PUBLICAS: readonly string[] = [
  "/",
  RUTA_LOGIN_ADMIN,
  "/portal/login",
  "/portal/recuperar",
];

/** Rutas privadas del back office (requieren rol admin). */
export const PREFIJOS_ADMIN: readonly string[] = [
  "/dashboard",
  "/clientes",
  "/cfdi",
  "/cobranza",
  "/banco",
  "/presupuestos",
  "/recordatorios",
  "/cumplimiento",
  "/encargos",
  "/accesos",
  "/efirmas",
  "/configuracion",
  "/blog-comentarios",
  "/prospectos",
  "/perfil",
];

/**
 * Rutas "trampa" que cualquiera podría intentar al adivinar la URL de
 * acceso al CRM. Las redirigimos al login real para:
 *
 *   1. No revelar que existe un back office aquí.
 *   2. Evitar que un usuario no autenticado caiga en un 404 con
 *      restos del chrome admin filtrándose por el RootLayout.
 *
 * El proxy las atrapa antes de llegar al renderizado.
 */
export const RUTAS_ALIAS_LOGIN_ADMIN: readonly string[] = [
  "/admin",
  "/administrador",
  "/login",
  "/wp-admin",
  "/wp-login",
  "/signin",
];

/** Rutas privadas del portal de clientes (requieren rol cliente). */
export const PREFIJO_PORTAL = "/portal";

/** Donde mandar al admin después de login exitoso. */
export const RUTA_DEFAULT_ADMIN = "/dashboard";

/** Donde mandar al cliente después de login exitoso. */
export const RUTA_DEFAULT_CLIENTE = "/portal/inicio";

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
