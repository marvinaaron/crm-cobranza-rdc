import { type Periodo, periodoLabel } from "@/lib/clientes";

export type FacturaPago = {
  id: string;
  clienteId: number;
  mes: number;
  anio: number;
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
  subidoEn: string;
  /** Monto facturado (lo captura el admin al subir el PDF). */
  monto?: number;
};

const STORAGE_KEY = "rdc-facturas-v1";

export function getAnioActualFacturas(): number {
  return new Date().getFullYear();
}

/** Años que el portal del cliente puede consultar (actual y el inmediato anterior). */
export function aniosVisiblesPortal(
  anioActual = getAnioActualFacturas()
): number[] {
  return [anioActual - 1, anioActual];
}

/**
 * Conserva facturas de los últimos 2 años (año actual y previo). Al cambiar de año
 * en automático se descartan las que quedaron fuera de la ventana.
 */
export function filtrarFacturasAniosVisibles(
  lista: FacturaPago[],
  anioActual = getAnioActualFacturas()
): FacturaPago[] {
  const visibles = aniosVisiblesPortal(anioActual);
  return lista.filter((f) => visibles.includes(f.anio));
}

/** @deprecated usa `filtrarFacturasAniosVisibles`. Se mantiene como alias para compatibilidad. */
export const filtrarFacturasAnioActual = filtrarFacturasAniosVisibles;

export function loadFacturas(): FacturaPago[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FacturaPago[];
    if (!Array.isArray(parsed)) return [];
    return filtrarFacturasAniosVisibles(parsed);
  } catch {
    return [];
  }
}

export function saveFacturas(lista: FacturaPago[]): void {
  if (typeof window === "undefined") return;
  const visibles = filtrarFacturasAniosVisibles(lista);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visibles));
}

export function nuevoIdFactura(): string {
  return `fac-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getFacturaPeriodo(
  lista: FacturaPago[],
  clienteId: number,
  periodo: Periodo
): FacturaPago | undefined {
  return lista.find(
    (f) =>
      f.clienteId === clienteId &&
      f.mes === periodo.mes &&
      f.anio === periodo.anio
  );
}

export function formatFechaFactura(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function labelPeriodoFactura(f: FacturaPago): string {
  return periodoLabel({ mes: f.mes, anio: f.anio });
}

/** Suma los montos facturados de un periodo (todos los clientes). */
export function sumarFacturadoPeriodo(
  lista: FacturaPago[],
  periodo: Periodo
): number {
  return lista
    .filter((f) => f.mes === periodo.mes && f.anio === periodo.anio)
    .reduce((s, f) => s + (f.monto ?? 0), 0);
}

/** Suma los montos facturados de un año (todos los clientes y meses). */
export function sumarFacturadoAnual(
  lista: FacturaPago[],
  anio: number
): number {
  return lista
    .filter((f) => f.anio === anio)
    .reduce((s, f) => s + (f.monto ?? 0), 0);
}
