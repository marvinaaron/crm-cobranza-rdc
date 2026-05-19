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
};

const STORAGE_KEY = "rdc-facturas-v1";

export function getAnioActualFacturas(): number {
  return new Date().getFullYear();
}

/** Solo conserva facturas del año calendario actual (al cambiar de año se descartan las anteriores). */
export function filtrarFacturasAnioActual(
  lista: FacturaPago[],
  anioActual = getAnioActualFacturas()
): FacturaPago[] {
  return lista.filter((f) => f.anio === anioActual);
}

export function loadFacturas(): FacturaPago[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FacturaPago[];
    if (!Array.isArray(parsed)) return [];
    return filtrarFacturasAnioActual(parsed);
  } catch {
    return [];
  }
}

export function saveFacturas(lista: FacturaPago[]): void {
  if (typeof window === "undefined") return;
  const soloAnioActual = filtrarFacturasAnioActual(lista);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(soloAnioActual));
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
