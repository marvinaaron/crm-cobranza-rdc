import { type Periodo, periodoAnioStr, periodoLabel } from "@/lib/clientes";

export type EstadoComprobante = "pendiente" | "aceptado";

export type ComprobantePago = {
  id: string;
  clienteId: number;
  mes: number;
  anio: number;
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
  subidoEn: string;
  /** El despacho abrió el detalle en Cobranza */
  visto: boolean;
  estado: EstadoComprobante;
};

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

export function getComprobantePeriodo(
  lista: ComprobantePago[],
  clienteId: number,
  periodo: Periodo
): ComprobantePago | undefined {
  return lista.find(
    (c) =>
      c.clienteId === clienteId &&
      c.mes === periodo.mes &&
      c.anio === periodo.anio
  );
}

export function contarComprobantesNuevos(
  lista: ComprobantePago[],
  periodo: Periodo
): number {
  return lista.filter(
    (c) => c.mes === periodo.mes && c.anio === periodo.anio && !c.visto
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
