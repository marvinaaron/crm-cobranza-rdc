import type { CfdiRegistro, TipoCfdi } from "./types";

/** Categorías del visor fiscal (estilo contabilidad / SAT). */
export type CategoriaVisorId =
  | "ventas"
  | "descuentos_ventas"
  | "compras_gastos"
  | "descuentos_compras"
  | "nomina_emitida"
  | "nomina_recibida"
  | "retencion_emitida"
  | "retencion_recibida"
  | "otros";

export const CATEGORIAS_VISOR: {
  id: CategoriaVisorId;
  label: string;
}[] = [
  { id: "ventas", label: "Ventas" },
  { id: "descuentos_ventas", label: "Descuentos o devoluciones sobre ventas" },
  { id: "compras_gastos", label: "Compras, gastos e inversiones" },
  { id: "descuentos_compras", label: "Descuentos o devoluciones sobre compras" },
  { id: "nomina_emitida", label: "Nóminas emitidas" },
  { id: "nomina_recibida", label: "Nóminas recibidas" },
  { id: "retencion_emitida", label: "Retención emitida" },
  { id: "retencion_recibida", label: "Retención recibida" },
  { id: "otros", label: "Otros" },
];

function texto(reg: Pick<CfdiRegistro, "conceptoResumen" | "metadata">): string {
  return (reg.conceptoResumen ?? "").toLowerCase();
}

export function clasificarCategoriaVisor(
  reg: Pick<
    CfdiRegistro,
    "tipo" | "tipoComprobante" | "conceptoResumen" | "metadata"
  >
): CategoriaVisorId {
  const t = texto(reg);
  const tc = reg.tipoComprobante;

  if (tc === "N") {
    return reg.tipo === "emitido" ? "nomina_emitida" : "nomina_recibida";
  }
  if (tc === "P") {
    return reg.tipo === "emitido" ? "retencion_emitida" : "retencion_recibida";
  }
  if (tc === "E") {
    return reg.tipo === "emitido" ? "descuentos_ventas" : "descuentos_compras";
  }

  if (/banco|spei|transferencia|dep[oó]sito|abono/.test(t)) {
    return reg.tipo === "emitido" ? "ventas" : "compras_gastos";
  }
  if (/retenci[oó]n|honorarios/.test(t) && tc === "I") {
    return reg.tipo === "emitido" ? "retencion_emitida" : "retencion_recibida";
  }
  if (/n[oó]mina|sueldo|salario/.test(t)) {
    return reg.tipo === "emitido" ? "nomina_emitida" : "nomina_recibida";
  }

  if (reg.tipo === "emitido" && tc === "I") return "ventas";
  if (reg.tipo === "recibido" && tc === "I") return "compras_gastos";

  return "otros";
}

export type ResumenCategoriaVisor = {
  id: CategoriaVisorId;
  label: string;
  vigentes: number;
  cancelados: number;
  total: number;
};

export function agruparPorCategoria(
  registros: Pick<CfdiRegistro, "estatus" | "tipo" | "tipoComprobante" | "conceptoResumen" | "metadata" | "total">[]
): ResumenCategoriaVisor[] {
  const mapa = new Map<CategoriaVisorId, ResumenCategoriaVisor>();
  for (const cat of CATEGORIAS_VISOR) {
    mapa.set(cat.id, { id: cat.id, label: cat.label, vigentes: 0, cancelados: 0, total: 0 });
  }

  for (const r of registros) {
    const id = clasificarCategoriaVisor(r);
    const row = mapa.get(id)!;
    if (r.estatus === "cancelado") {
      row.cancelados += 1;
    } else {
      row.vigentes += 1;
    }
    row.total += 1;
  }

  return CATEGORIAS_VISOR.map((c) => mapa.get(c.id)!).filter((c) => c.total > 0);
}
