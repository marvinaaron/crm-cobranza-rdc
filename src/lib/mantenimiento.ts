import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import type { FacturaPago } from "@/lib/facturas";

/** PDFs de cumplimiento visibles en el portal; después se archivan (solo metadata). */
export const RETENCION_PDF_CUMPLIMIENTO_MESES = 3;

/** Facturas de honorarios (Cobranza) que tú subes al cliente. */
export const RETENCION_FACTURAS_HONORARIOS_MESES = 12;

/**
 * Mantenimiento de espacio: "aligerar" registros de cumplimiento antiguos
 * quitando el contenido pesado de los archivos (los `dataUrl` embebidos en
 * base64) pero conservando toda la metadata (nombres, montos, fechas, estatus).
 *
 * Los clientes pueden consultar declaraciones históricas en el portal del SAT.
 * El cron semanal aplica esta ventana automáticamente; el respaldo previo
 * conserva los archivos completos por si hay que restaurarlos.
 */

/** Reemplaza recursivamente cualquier campo `dataUrl` (string) por "". */
function vaciarDataUrls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => vaciarDataUrls(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = k === "dataUrl" && typeof v === "string" ? "" : vaciarDataUrls(v);
    }
    return out as T;
  }
  return value;
}

/** Índice de mes absoluto (mes 0-based, igual que Date.getMonth()). */
function indiceMes(anio: number, mes: number): number {
  return anio * 12 + mes;
}

export type ResultadoAligerar = {
  cumplimiento: RegistroCumplimiento[];
  /** Cuántos registros quedaron más livianos. */
  aligerados: number;
};

/**
 * Quita los archivos embebidos de los registros de cumplimiento cuyo periodo
 * sea anterior a la ventana de `mesesConservar` meses.
 */
export function aligerarCumplimientoAntiguo(
  registros: RegistroCumplimiento[],
  mesesConservar: number,
  ahora: Date = new Date()
): ResultadoAligerar {
  const corte = indiceMes(ahora.getFullYear(), ahora.getMonth()) - mesesConservar;
  let aligerados = 0;

  const cumplimiento = registros.map((r) => {
    const idx = indiceMes(r.anio, r.mes);
    if (idx > corte) return r; // dentro de la ventana → conservar archivos
    const antes = JSON.stringify(r);
    const limpio = vaciarDataUrls(r);
    const despues = JSON.stringify(limpio);
    if (despues.length < antes.length) aligerados += 1;
    return limpio;
  });

  return { cumplimiento, aligerados };
}

export type ResultadoAligerarFacturas = {
  facturas: FacturaPago[];
  aligeradas: number;
};

/** Quita el PDF de facturas de honorarios fuera de la ventana; conserva metadata. */
export function aligerarFacturasAntiguo(
  lista: FacturaPago[],
  mesesConservar: number,
  ahora: Date = new Date()
): ResultadoAligerarFacturas {
  const corte = indiceMes(ahora.getFullYear(), ahora.getMonth()) - mesesConservar;
  let aligeradas = 0;

  const facturas = lista.map((f) => {
    if (!f.dataUrl?.trim()) return f;
    const idx = indiceMes(f.anio, f.mes);
    if (idx > corte) return f;
    aligeradas += 1;
    return { ...f, dataUrl: "" };
  });

  return { facturas, aligeradas };
}
