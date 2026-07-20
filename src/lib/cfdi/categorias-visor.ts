import type { CfdiRegistro, TipoCfdi } from "./types";

/** Filas del desglose por método de pago en el visor. */
export type CategoriaVisorId =
  | "ingresos_pue"
  | "ingresos_ppd"
  | "ingresos_pago"
  | "gastos_pue"
  | "gastos_ppd"
  | "gastos_pago"
  | "nomina_emitida"
  | "nomina_recibida"
  | "otros";

export type GrupoVisorId = "ingresos" | "gastos" | "nomina";

export const CATEGORIAS_VISOR: {
  id: CategoriaVisorId;
  label: string;
  grupo: GrupoVisorId;
}[] = [
  { id: "ingresos_pue", label: "PUE", grupo: "ingresos" },
  { id: "ingresos_ppd", label: "PPD", grupo: "ingresos" },
  { id: "ingresos_pago", label: "Complementos de pago", grupo: "ingresos" },
  { id: "gastos_pue", label: "PUE", grupo: "gastos" },
  { id: "gastos_ppd", label: "PPD", grupo: "gastos" },
  { id: "gastos_pago", label: "Complementos de pago", grupo: "gastos" },
  { id: "nomina_emitida", label: "Emitida", grupo: "nomina" },
  { id: "nomina_recibida", label: "Recibida", grupo: "nomina" },
  { id: "otros", label: "Otros", grupo: "gastos" },
];

const GRUPOS_VISOR: { id: GrupoVisorId; label: string }[] = [
  { id: "ingresos", label: "Ingresos" },
  { id: "gastos", label: "Gastos" },
  { id: "nomina", label: "Nómina" },
];

function metodoPagoNorm(
  reg: Pick<CfdiRegistro, "tipoComprobante" | "metadata">
): "PUE" | "PPD" | "PAGO" | "OTRO" {
  if (reg.tipoComprobante === "P") return "PAGO";
  const raw = (reg.metadata?.metodoPago ?? "").trim();
  const upper = raw.toUpperCase();
  const norm = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (upper === "PUE" || norm.includes("una sola exhib")) return "PUE";
  if (
    upper === "PPD" ||
    norm.includes("parcialidad") ||
    norm.includes("diferido")
  ) {
    return "PPD";
  }
  return "OTRO";
}

/**
 * Clasifica un CFDI para el visor:
 * Ingresos / Gastos → PUE / PPD / Complementos de pago
 * Nómina → emitida / recibida (solo se muestra si hay movimiento)
 */
export function clasificarCategoriaVisor(
  reg: Pick<CfdiRegistro, "tipo" | "tipoComprobante" | "conceptoResumen" | "metadata">
): CategoriaVisorId {
  const metodo = metodoPagoNorm(reg);
  const tipo: TipoCfdi = reg.tipo;

  if (reg.tipoComprobante === "N") {
    return tipo === "emitido" ? "nomina_emitida" : "nomina_recibida";
  }

  if (tipo === "emitido") {
    if (metodo === "PAGO" || reg.tipoComprobante === "P") return "ingresos_pago";
    if (reg.tipoComprobante === "I" || reg.tipoComprobante === "E") {
      if (metodo === "PPD") return "ingresos_ppd";
      if (metodo === "PUE") return "ingresos_pue";
    }
    return "otros";
  }

  // Recibidos → gastos (mismas categorías que ingresos)
  if (metodo === "PAGO" || reg.tipoComprobante === "P") return "gastos_pago";
  if (reg.tipoComprobante === "I" || reg.tipoComprobante === "E") {
    if (metodo === "PPD") return "gastos_ppd";
    if (metodo === "PUE") return "gastos_pue";
  }
  return "otros";
}

export type ResumenCategoriaVisor = {
  id: CategoriaVisorId;
  label: string;
  vigentes: number;
  cancelados: number;
  total: number;
  /** Suma de totales vigentes (MXN). */
  montoVigente: number;
};

export type GrupoCategoriaVisor = {
  id: GrupoVisorId;
  label: string;
  lineas: ResumenCategoriaVisor[];
  /** Solo nómina: suma de montos vigentes del grupo. */
  montoTotal?: number;
};

export function agruparPorCategoria(
  registros: Pick<
    CfdiRegistro,
    "estatus" | "tipo" | "tipoComprobante" | "conceptoResumen" | "metadata" | "total"
  >[]
): GrupoCategoriaVisor[] {
  const mapa = new Map<CategoriaVisorId, ResumenCategoriaVisor>();
  for (const cat of CATEGORIAS_VISOR) {
    if (cat.id === "otros") continue;
    mapa.set(cat.id, {
      id: cat.id,
      label: cat.label,
      vigentes: 0,
      cancelados: 0,
      total: 0,
      montoVigente: 0,
    });
  }

  for (const r of registros) {
    const id = clasificarCategoriaVisor(r);
    if (id === "otros") continue;
    const row = mapa.get(id);
    if (!row) continue;
    if (r.estatus === "cancelado") {
      row.cancelados += 1;
    } else {
      row.vigentes += 1;
      row.montoVigente += Number(r.total) || 0;
    }
    row.total += 1;
  }

  for (const row of mapa.values()) {
    row.montoVigente = Math.round(row.montoVigente * 100) / 100;
  }

  const grupos: GrupoCategoriaVisor[] = [];

  for (const g of GRUPOS_VISOR) {
    const cats = CATEGORIAS_VISOR.filter(
      (c) => c.grupo === g.id && c.id !== "otros"
    );
    let lineas = cats.map((c) => mapa.get(c.id)!);

    if (g.id === "nomina") {
      lineas = lineas.filter((l) => l.total > 0);
      if (lineas.length === 0) continue;
      const montoTotal =
        Math.round(lineas.reduce((s, l) => s + l.montoVigente, 0) * 100) / 100;
      grupos.push({ id: g.id, label: g.label, lineas, montoTotal });
      continue;
    }

    grupos.push({ id: g.id, label: g.label, lineas });
  }

  return grupos;
}
