import {
  type Cliente,
  type Periodo,
  clienteActivoEnPeriodo,
} from "@/lib/clientes";
import {
  type RegistroCumplimiento,
  esSinPagoImpuestos,
  formatMontoImpuesto,
  getSaldoFavorPeriodo,
  getSubtotalFederales,
  pagoValidadoCategoria,
  previewPublicado,
} from "@/lib/cumplimiento";

/** Umbral para marcar desfase vs. el mes anterior con importe. */
export const UMBRAL_DESFASE_FEDERAL = 0.35;

export const MESES_ABREV_FEDERAL = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

export type CeldaFederalAnual = {
  monto: number;
  pagado: boolean;
  sinPago: boolean;
  publicado: boolean;
  aFavor: boolean;
  inactivo: boolean;
  /** Variación vs. último mes con importe distinto de 0. */
  delta: number | null;
};

export type FilaFederalAnual = {
  cliente: Cliente;
  celdas: CeldaFederalAnual[];
  anual: number;
};

export function formatMontoFederalCorto(n: number): string {
  const abs = Math.abs(n);
  const signo = n < 0 ? "−" : "";
  if (abs <= 0) return "$0";
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${signo}$${m.toLocaleString("es-MX", {
      minimumFractionDigits: m >= 10 ? 0 : 1,
      maximumFractionDigits: 1,
    })}M`;
  }
  return `${signo}${formatMontoImpuesto(abs).replace("-$", "$")}`;
}

export function formatPctDesfaseFederal(delta: number): string {
  const n = Math.round(Math.abs(delta) * 100);
  return `${delta > 0 ? "+" : "−"}${n}%`;
}

export function construirMatrizFederalAnual(
  clientes: Cliente[],
  anio: number,
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined
): FilaFederalAnual[] {
  return clientes.map((cli) => {
    const raw: Omit<CeldaFederalAnual, "delta">[] = [];
    for (let m = 0; m < 12; m++) {
      const p: Periodo = { mes: m, anio };
      if (!clienteActivoEnPeriodo(cli, p)) {
        raw.push({
          monto: 0,
          pagado: false,
          sinPago: false,
          publicado: false,
          aFavor: false,
          inactivo: true,
        });
        continue;
      }
      const reg = getCumplimientoPeriodo(cli.id, p);
      const sinPago = esSinPagoImpuestos(reg);
      const publicado = previewPublicado(reg);
      const cargo = reg ? getSubtotalFederales(reg) : 0;
      const saldo = getSaldoFavorPeriodo(reg)?.total ?? 0;
      const monto = cargo > 0 || saldo > 0 ? cargo - saldo : 0;
      raw.push({
        monto,
        pagado: cargo > 0 && pagoValidadoCategoria(reg, "federales"),
        sinPago,
        publicado,
        aFavor: monto < 0,
        inactivo: false,
      });
    }

    const celdas: CeldaFederalAnual[] = raw.map((c, i) => {
      let prev: number | null = null;
      for (let j = i - 1; j >= 0; j--) {
        if (raw[j].inactivo) continue;
        if (raw[j].monto !== 0) {
          prev = raw[j].monto;
          break;
        }
      }
      let delta: number | null = null;
      if (prev != null && prev !== 0 && c.monto !== 0) {
        const d = (c.monto - prev) / Math.abs(prev);
        if (Math.abs(d) >= UMBRAL_DESFASE_FEDERAL) delta = d;
      }
      return { ...c, delta };
    });

    const anual = celdas.reduce((s, c) => s + (c.inactivo ? 0 : c.monto), 0);
    return { cliente: cli, celdas, anual };
  });
}

export function totalesMesFederal(matriz: FilaFederalAnual[]): number[] {
  return Array.from({ length: 12 }, (_, m) =>
    matriz.reduce((s, r) => s + (r.celdas[m].inactivo ? 0 : r.celdas[m].monto), 0)
  );
}
