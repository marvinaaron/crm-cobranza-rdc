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
  "meses_anteriores",
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

/** Identidad estable del aviso (sin el conteo de días) para poder ocultarlo. */
export function firmaAvisoInicio(accion: AccionPortal): string {
  return [accion.clave, accion.desglose ?? "", accion.urgente ? "1" : "0"].join(
    "|"
  );
}

export function claveAvisosInicioOcultos(clienteId: number): string {
  return `rdc.inicio.avisosOcultos.${clienteId}`;
}

export function leerAvisosInicioOcultos(clienteId: number): string[] {
  try {
    const raw = localStorage.getItem(claveAvisosInicioOcultos(clienteId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function guardarAvisoInicioOculto(clienteId: number, firma: string): string[] {
  const next = Array.from(new Set([...leerAvisosInicioOcultos(clienteId), firma]));
  try {
    localStorage.setItem(claveAvisosInicioOcultos(clienteId), JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
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
