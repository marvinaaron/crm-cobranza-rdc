/**
 * Día del mes en que el despacho trabaja la contabilidad de un cliente.
 * Vive en el CRM (`diaContabilidad`) y alimenta el círculo de cumplimiento,
 * el calendario fiscal del dashboard y el feed iCal (UID estable).
 */

import type { Cliente } from "@/lib/clientes";
import { esIngresoGeneralCliente } from "@/lib/clientes";

export const ICONO_CARPETA_DEFAULT = "📁";

export function iconoCarpetaCliente(
  cliente: Pick<Cliente, "iconoCarpeta">
): string {
  const t = cliente.iconoCarpeta?.trim();
  return t || ICONO_CARPETA_DEFAULT;
}

export function normalizarDiaContabilidad(dia: unknown): number | undefined {
  const n = typeof dia === "number" ? dia : Number(dia);
  if (!Number.isInteger(n) || n < 1 || n > 31) return undefined;
  return n;
}

/** Ajusta 31 → 28/29/30 según el mes. */
export function diaContabilidadEnMes(
  dia: number,
  anio: number,
  mes: number
): number {
  const ultimo = new Date(anio, mes + 1, 0).getDate();
  return Math.min(Math.max(1, dia), ultimo);
}

export function fechaContabilidadEnMes(
  dia: number,
  anio: number,
  mes: number
): Date {
  return new Date(anio, mes, diaContabilidadEnMes(dia, anio, mes));
}

export type EstadoDiaContabilidad = "pendiente" | "hoy" | "vencido";

export function progresoDiaContabilidad(
  dia: number,
  ahora = new Date()
): {
  porcentaje: number;
  estado: EstadoDiaContabilidad;
  diaAjustado: number;
} {
  const diaAjustado = diaContabilidadEnMes(
    dia,
    ahora.getFullYear(),
    ahora.getMonth()
  );
  const hoy = ahora.getDate();
  if (hoy < diaAjustado) {
    return {
      porcentaje: Math.max(6, Math.round((hoy / diaAjustado) * 100)),
      estado: "pendiente",
      diaAjustado,
    };
  }
  if (hoy === diaAjustado) {
    return { porcentaje: 100, estado: "hoy", diaAjustado };
  }
  return { porcentaje: 100, estado: "vencido", diaAjustado };
}

export function clientesConDiaContabilidad(clientes: Cliente[]): Cliente[] {
  return clientes.filter((c) => {
    if (!c.activo || esIngresoGeneralCliente(c)) return false;
    return normalizarDiaContabilidad(c.diaContabilidad) != null;
  });
}

/** Primer nombre + primer apellido (o una sola palabra). */
export function nombreCortoCliente(razonSocial: string): string {
  const partes = razonSocial.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return razonSocial.trim();
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[1]}`;
}
