import { etiquetaFormaPago, etiquetaMetodoPago } from "./catalogos-sat";
import type { CfdiRegistro, TipoCfdi } from "./types";

export type EstatusCfdi = "vigente" | "cancelado";

export type LineaConsultaCfdi = {
  id: string;
  uuid: string;
  fecha: string;
  serieFolio: string;
  rfc: string;
  razonSocial: string;
  total: number;
  totalFormateado: number;
  metodoPago: string;
  formaPago: string;
  estatus: EstatusCfdi;
  esNotaCredito: boolean;
  tipoComprobante: string;
};

export function serieFolioDe(reg: CfdiRegistro): string {
  const s = reg.metadata.serie?.trim();
  const f = reg.metadata.folio?.trim();
  if (s && f) return `${s}-${f}`;
  if (f) return f;
  if (s) return s;
  return "—";
}

/** Monto visible: notas de crédito (tipo E) en negativo. */
export function montoConsulta(reg: Pick<CfdiRegistro, "total" | "tipoComprobante">): number {
  if (reg.tipoComprobante === "E") {
    return -Math.abs(reg.total);
  }
  return reg.total;
}

export function registroALineaConsulta(
  reg: CfdiRegistro,
  vista: TipoCfdi
): LineaConsultaCfdi {
  const contraparte =
    vista === "emitido"
      ? { rfc: reg.rfcReceptor, nombre: reg.nombreReceptor }
      : { rfc: reg.rfcEmisor, nombre: reg.nombreEmisor };

  const total = montoConsulta(reg);

  return {
    id: reg.id,
    uuid: reg.uuidSat,
    fecha: reg.fecha,
    serieFolio: serieFolioDe(reg),
    rfc: contraparte.rfc,
    razonSocial: contraparte.nombre?.trim() || contraparte.rfc,
    total,
    totalFormateado: total,
    metodoPago: etiquetaMetodoPago(reg.metadata.metodoPago),
    formaPago: etiquetaFormaPago(reg.metadata.formaPago),
    estatus: reg.estatus ?? "vigente",
    esNotaCredito: reg.tipoComprobante === "E",
    tipoComprobante: reg.tipoComprobante,
  };
}
