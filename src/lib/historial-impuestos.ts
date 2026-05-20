import { type Periodo, periodoLabel } from "@/lib/clientes";
import type { CategoriaId } from "@/lib/cumplimiento-categorias";
import { CATEGORIA_META } from "@/lib/cumplimiento-categorias";

export type PagoImpuestoHistorial = {
  id: string;
  clienteId: number;
  categoria: CategoriaId;
  mes: number;
  anio: number;
  monto: number;
  fechaLimite: string;
  pagadoEn: string;
  periodoLabel: string;
};

const STORAGE_KEY = "rdc-historial-impuestos-v1";

export function nuevoIdHistorial(): string {
  return `hist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadHistorialImpuestos(): PagoImpuestoHistorial[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PagoImpuestoHistorial[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistorialImpuestos(lista: PagoImpuestoHistorial[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getHistorialCliente(
  lista: PagoImpuestoHistorial[],
  clienteId: number,
  categoria?: CategoriaId
): PagoImpuestoHistorial[] {
  return lista
    .filter((h) => h.clienteId === clienteId && (!categoria || h.categoria === categoria))
    .sort((a, b) => {
      const ka = a.anio * 12 + a.mes;
      const kb = b.anio * 12 + b.mes;
      return kb - ka;
    });
}

export function crearEntradaHistorial(
  clienteId: number,
  categoria: CategoriaId,
  periodo: Periodo,
  monto: number,
  fechaLimite: string,
  pagadoEn = new Date().toISOString()
): PagoImpuestoHistorial {
  return {
    id: nuevoIdHistorial(),
    clienteId,
    categoria,
    mes: periodo.mes,
    anio: periodo.anio,
    monto,
    fechaLimite,
    pagadoEn,
    periodoLabel: periodoLabel(periodo),
  };
}

export function labelCategoriaHistorial(cat: CategoriaId): string {
  return CATEGORIA_META[cat].label;
}
