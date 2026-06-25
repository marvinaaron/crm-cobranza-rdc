/** Acción pendiente destacada en el inicio del portal. */
export type AccionPortal = {
  clave: string;
  /** Píldora superior: Honorarios, Impuestos SAT, etc. */
  etiqueta?: string;
  titulo: string;
  monto?: number;
  desglose?: string;
  detalle: string;
  cta: string;
  href: string;
  /** Enlace secundario (p. ej. ver estado en el portal). */
  ctaSecundario?: string;
  hrefSecundario?: string;
  /** Si es true, el CTA principal abre WhatsApp al contador. */
  contactarContador?: boolean;
  urgente: boolean;
};

const PRIORIDAD_CLAVES = [
  "declaraciones",
  "preliminar",
  "impuestos_pendientes",
  "honorarios",
] as const;

function puntajePendiente(a: AccionPortal): number {
  let s = 0;
  if (a.urgente) s += 100;
  const idx = PRIORIDAD_CLAVES.indexOf(
    a.clave as (typeof PRIORIDAD_CLAVES)[number]
  );
  if (idx >= 0) s += (PRIORIDAD_CLAVES.length - idx) * 10;
  return s;
}

/** Orden para el carrusel: urgentes primero, luego cumplimiento fiscal. */
export function ordenarPendientesInicio(
  acciones: AccionPortal[]
): AccionPortal[] {
  return [...acciones].sort((a, b) => puntajePendiente(b) - puntajePendiente(a));
}

/**
 * @deprecated Usar ordenarPendientesInicio + carrusel completo.
 */
export function elegirSiguientePaso(
  acciones: AccionPortal[]
): AccionPortal | null {
  const ordenadas = ordenarPendientesInicio(acciones);
  return ordenadas[0] ?? null;
}
