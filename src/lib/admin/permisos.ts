/**
 * Modelo de permisos para los usuarios admin del CRM.
 *
 * - Cada admin tiene un conjunto de módulos a los que puede acceder.
 * - Un admin con `propietario: true` ignora la lista de permisos: tiene
 *   acceso total y no puede ser eliminado por otros admins.
 * - El primer admin creado en el sistema se convierte automáticamente en
 *   propietario.
 *
 * Los permisos viven en `app_metadata` para que el usuario no pueda
 * reescribirlos (solo el service role / admin API puede modificarlos).
 */

import type { User } from "@supabase/supabase-js";

export const MODULOS = [
  "dashboard",
  "clientes",
  "cobranza",
  "cumplimiento",
  "efirmas",
  "configuracion",
] as const;

export type Modulo = (typeof MODULOS)[number];

export const MODULOS_META: Record<Modulo, { label: string; descripcion: string }> = {
  dashboard: {
    label: "Dashboard",
    descripcion: "KPIs, cobranza, facturación e ingresos del periodo.",
  },
  clientes: {
    label: "Mis Clientes",
    descripcion: "Alta, edición y baja del catálogo de clientes.",
  },
  cobranza: {
    label: "Cobranza",
    descripcion: "Cobros, validación de comprobantes y facturación.",
  },
  cumplimiento: {
    label: "Cumplimiento",
    descripcion: "Preliminares, declaraciones y pagos de impuestos.",
  },
  efirmas: {
    label: "E.firmas",
    descripcion: "Certificados FIEL, vigencia y recordatorios a clientes.",
  },
  configuracion: {
    label: "Configuración",
    descripcion: "Respaldos, datos del CRM y administración del equipo.",
  },
};

/** Permisos típicos de un contador colaborador (sin acceso a cobranza / dinero). */
export const PERMISOS_CONTADOR: Modulo[] = ["clientes", "cumplimiento"];

/** Permisos típicos de quien lleva la cartera (sin cumplimiento). */
export const PERMISOS_COBRANZA: Modulo[] = ["clientes", "cobranza"];

export type PerfilAdminMetadata = {
  /** Siempre "admin" si es admin. */
  rol?: "admin" | "cliente";
  /** Dueño del despacho. Si es true, ignora la lista de permisos. */
  propietario?: boolean;
  /** Módulos a los que tiene acceso (solo si no es propietario). */
  permisos?: Modulo[];
};

export type PerfilAdminUserMetadata = {
  nombreCompleto?: string;
  cargo?: string;
  telefono?: string;
  cedulaProfesional?: string;
  ubicacion?: string;
  notas?: string;
  /** Path en el bucket `avatares`. */
  avatarPath?: string;
  /** URL pública del avatar (caché). */
  avatarUrl?: string;
};

function readAppMeta(user: User | null | undefined): PerfilAdminMetadata {
  if (!user) return {};
  const meta = user.app_metadata as Record<string, unknown> | undefined;
  if (!meta) return {};
  const propietario = meta.propietario === true;
  const permisosRaw = Array.isArray(meta.permisos) ? meta.permisos : [];
  const permisos = permisosRaw.filter((m): m is Modulo =>
    (MODULOS as readonly string[]).includes(m as string)
  );
  return {
    rol: meta.rol === "admin" || meta.rol === "cliente" ? meta.rol : undefined,
    propietario,
    permisos,
  };
}

export function esPropietario(user: User | null | undefined): boolean {
  return readAppMeta(user).propietario === true;
}

export function getPermisos(user: User | null | undefined): Modulo[] {
  const meta = readAppMeta(user);
  if (meta.propietario) return [...MODULOS];
  return meta.permisos ?? [];
}

export function tienePermiso(
  user: User | null | undefined,
  modulo: Modulo
): boolean {
  if (!user) return false;
  const meta = readAppMeta(user);
  if (meta.propietario) return true;
  return (meta.permisos ?? []).includes(modulo);
}

/**
 * Detecta si el JWT NO trae los campos nuevos `propietario`/`permisos`.
 * En ese caso lo consideramos "obsoleto" y dejamos al usuario pasar para
 * evitar bloquear a admins que aún no han renovado su sesión después de
 * estos cambios.
 */
export function jwtSinInfoPermisos(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = user.app_metadata as Record<string, unknown> | undefined;
  if (!meta) return true;
  const tienePropietario = typeof meta.propietario === "boolean";
  const tienePermisos = Array.isArray(meta.permisos);
  return !tienePropietario && !tienePermisos;
}

/** Mapea un pathname a su módulo. Devuelve `null` si no es ruta de módulo. */
export function moduloDeRuta(pathname: string): Modulo | null {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/clientes")) return "clientes";
  if (pathname.startsWith("/cobranza")) return "cobranza";
  if (pathname.startsWith("/cumplimiento")) return "cumplimiento";
  if (pathname.startsWith("/efirmas")) return "efirmas";
  if (pathname.startsWith("/configuracion")) return "configuracion";
  return null;
}
