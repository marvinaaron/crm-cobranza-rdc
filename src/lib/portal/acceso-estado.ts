import type { Periodo } from "@/lib/clientes";

export type ActividadPortal = {
  lastSignInAt?: string;
  lastPortalAt?: string;
};

export type EstadoCandadoPortal = "sin_acceso" | "abrio_mes" | "sin_abrir";

function fechaEnPeriodo(iso: string | undefined, periodo: Periodo): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getMonth() === periodo.mes && d.getFullYear() === Number(periodo.anio);
}

/** Verde = abrió este mes; gris = tiene acceso sin abrir; rojo = sin acceso. */
export function estadoCandadoPortal(
  actividad: ActividadPortal | undefined,
  periodo: Periodo
): EstadoCandadoPortal {
  if (!actividad) return "sin_acceso";
  const ultima = actividad.lastPortalAt || actividad.lastSignInAt;
  if (fechaEnPeriodo(ultima, periodo)) return "abrio_mes";
  return "sin_abrir";
}
