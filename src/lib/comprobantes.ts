import { type Periodo, periodoAnioStr, periodoLabel } from "@/lib/clientes";

export type EstadoComprobante = "pendiente" | "aceptado";

export type ComprobantePago = {
  id: string;
  clienteId: number;
  /** Periodo principal — primer mes declarado. Se mantiene por compatibilidad. */
  mes: number;
  anio: number;
  /** Meses que el cliente declara estar cubriendo con este pago. Siempre tiene al menos 1. */
  periodos: Periodo[];
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
  subidoEn: string;
  /** El despacho abrió el detalle en Cobranza */
  visto: boolean;
  estado: EstadoComprobante;
};

/** ¿Este comprobante cubre el periodo indicado? */
export function comprobanteCubrePeriodo(c: ComprobantePago, p: Periodo): boolean {
  return c.periodos.some((q) => q.mes === p.mes && q.anio === p.anio);
}

const STORAGE_KEY = "rdc-comprobantes-v1";
export const MAX_COMPROBANTE_BYTES = 3 * 1024 * 1024;

export function periodoComprobanteKey(periodo: Periodo): string {
  return `${periodo.anio}-${periodo.mes}`;
}

export function loadComprobantes(): ComprobantePago[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ComprobantePago[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c) => ({
      ...c,
      estado: c.estado ?? (c.visto ? "aceptado" : "pendiente"),
      // Migración: si no trae `periodos`, lo derivamos de mes/anio.
      periodos:
        Array.isArray(c.periodos) && c.periodos.length > 0
          ? c.periodos
          : [{ mes: c.mes, anio: c.anio }],
    }));
  } catch {
    return [];
  }
}

export function saveComprobantes(lista: ComprobantePago[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function nuevoIdComprobante(): string {
  return `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Devuelve el comprobante MÁS RELEVANTE del cliente para el periodo dado:
 * - Si hay alguno pendiente que cubra el periodo, devuelve el más reciente pendiente.
 * - Si no, devuelve el más reciente aceptado que lo cubra.
 * - Si no hay ninguno, undefined.
 */
export function getComprobantePeriodo(
  lista: ComprobantePago[],
  clienteId: number,
  periodo: Periodo
): ComprobantePago | undefined {
  const delCliente = lista.filter(
    (c) => c.clienteId === clienteId && comprobanteCubrePeriodo(c, periodo)
  );
  if (delCliente.length === 0) return undefined;
  const ordenados = [...delCliente].sort((a, b) =>
    b.subidoEn.localeCompare(a.subidoEn)
  );
  const pendiente = ordenados.find((c) => c.estado === "pendiente");
  return pendiente ?? ordenados[0];
}

/** Todos los comprobantes que el cliente subió (ordenados del más reciente al más viejo). */
export function getComprobantesCliente(
  lista: ComprobantePago[],
  clienteId: number
): ComprobantePago[] {
  return [...lista]
    .filter((c) => c.clienteId === clienteId)
    .sort((a, b) => b.subidoEn.localeCompare(a.subidoEn));
}

export function contarComprobantesNuevos(
  lista: ComprobantePago[],
  periodo: Periodo
): number {
  return lista.filter(
    (c) => !c.visto && comprobanteCubrePeriodo(c, periodo)
  ).length;
}

export function formatFechaComprobante(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function labelPeriodoComprobante(c: ComprobantePago): string {
  return periodoLabel({ mes: c.mes, anio: c.anio });
}

export { periodoAnioStr };
