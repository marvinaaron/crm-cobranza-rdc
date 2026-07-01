import type { CfdiMetadataExtra, CfdiParseado, EstatusCfdi, TipoComprobanteCfdi, TipoCfdi } from "./types";

const TIPOS_COMPROBANTE = new Set(["I", "E", "T", "N", "P"]);

function limpiarXml(xml: string): string {
  return xml.replace(/^\uFEFF/, "").trim();
}

/** Extrae un atributo de la primera etiqueta que coincida (con o sin prefijo). */
function attrEtiqueta(etiqueta: string, nombreAttr: string, xml: string): string | null {
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${etiqueta}\\b[^>]*?\\s${nombreAttr}=["']([^"']*)["']`,
    "i"
  );
  const m = xml.match(re);
  return m?.[1]?.trim() || null;
}

/** Atributo en cualquier etiqueta (p. ej. UUID en TimbreFiscalDigital). */
function attrGlobal(nombreAttr: string, xml: string): string | null {
  const re = new RegExp(`\\s${nombreAttr}=["']([^"']*)["']`, "i");
  const m = xml.match(re);
  return m?.[1]?.trim() || null;
}

function numeroAttr(valor: string | null, fallback = 0): number {
  if (!valor) return fallback;
  const n = Number.parseFloat(valor.replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function periodoDesdeFecha(fechaIso: string): { mes: number; anio: number } {
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) {
    const soloFecha = fechaIso.slice(0, 10);
    const [y, m] = soloFecha.split("-").map(Number);
    if (y && m) return { mes: m - 1, anio: y };
    const hoy = new Date();
    return { mes: hoy.getMonth(), anio: hoy.getFullYear() };
  }
  return { mes: d.getMonth(), anio: d.getFullYear() };
}

function tipoComprobanteDe(valor: string | null): TipoComprobanteCfdi {
  const v = (valor ?? "I").toUpperCase();
  return TIPOS_COMPROBANTE.has(v) ? (v as TipoComprobanteCfdi) : "I";
}

function conceptoResumen(xml: string): string | null {
  const desc =
    attrEtiqueta("Concepto", "Descripcion", xml) ??
    attrGlobal("Descripcion", xml);
  if (!desc) return null;
  return desc.length > 120 ? `${desc.slice(0, 117)}…` : desc;
}

function impuestoMonto(xml: string, impuesto: "002" | "001", retencion: boolean): number | undefined {
  const patron = retencion ? "Retencion" : "Traslado";
  const bloques = xml.match(
    new RegExp(`<(?:[\\w.-]+:)?${patron}\\b[^>]*>[\\s\\S]*?<\\/(?:[\\w.-]+:)?${patron}>`, "gi")
  );
  if (!bloques) return undefined;
  let suma = 0;
  let encontrado = false;
  for (const bloque of bloques) {
    const imp = attrEtiqueta(patron, "Impuesto", bloque) ?? attrGlobal("Impuesto", bloque);
    if (imp !== impuesto) continue;
    const importe = numeroAttr(
      attrEtiqueta(patron, "Importe", bloque) ?? attrGlobal("Importe", bloque),
      0
    );
    suma += importe;
    encontrado = true;
  }
  return encontrado ? Math.round(suma * 100) / 100 : undefined;
}

/**
 * Parsea CFDI 3.3 / 4.0 (XML) y extrae metadata para indexar.
 * No valida firma digital; eso lo hace el SAT al descargar.
 */
export function parsearCfdiXml(xmlRaw: string): CfdiParseado {
  const xml = limpiarXml(xmlRaw);
  if (!xml.includes("Comprobante") && !xml.toLowerCase().includes("cfdi")) {
    throw new Error("El archivo no parece un CFDI válido.");
  }

  const uuid =
    attrEtiqueta("TimbreFiscalDigital", "UUID", xml) ??
    attrGlobal("UUID", xml);
  if (!uuid) {
    throw new Error("No se encontró el UUID del timbre fiscal.");
  }

  const fecha =
    attrEtiqueta("Comprobante", "Fecha", xml) ?? attrGlobal("Fecha", xml);
  if (!fecha) {
    throw new Error("No se encontró la fecha del comprobante.");
  }

  const rfcEmisor =
    attrEtiqueta("Emisor", "Rfc", xml) ?? attrEtiqueta("Emisor", "RFC", xml);
  const rfcReceptor =
    attrEtiqueta("Receptor", "Rfc", xml) ?? attrEtiqueta("Receptor", "RFC", xml);
  if (!rfcEmisor || !rfcReceptor) {
    throw new Error("Faltan RFC de emisor o receptor.");
  }

  const { mes, anio } = periodoDesdeFecha(fecha);
  const metadata: CfdiMetadataExtra = {
    serie: attrEtiqueta("Comprobante", "Serie", xml) ?? undefined,
    folio: attrEtiqueta("Comprobante", "Folio", xml) ?? undefined,
    formaPago: attrEtiqueta("Comprobante", "FormaPago", xml) ?? undefined,
    metodoPago: attrEtiqueta("Comprobante", "MetodoPago", xml) ?? undefined,
    ivaTrasladado: impuestoMonto(xml, "002", false),
    ivaRetenido: impuestoMonto(xml, "002", true),
    isrRetenido: impuestoMonto(xml, "001", true),
  };

  const estatusRaw =
    attrEtiqueta("Comprobante", "Estatus", xml) ??
    attrGlobal("Estatus", xml);
  const estatus: EstatusCfdi =
    estatusRaw?.toLowerCase() === "cancelado" || estatusRaw === "0"
      ? "cancelado"
      : "vigente";

  return {
    uuid: uuid.toUpperCase(),
    tipoComprobante: tipoComprobanteDe(
      attrEtiqueta("Comprobante", "TipoDeComprobante", xml) ??
        attrGlobal("TipoDeComprobante", xml)
    ),
    rfcEmisor: rfcEmisor.toUpperCase(),
    nombreEmisor:
      attrEtiqueta("Emisor", "Nombre", xml) ?? attrGlobal("Nombre", xml),
    rfcReceptor: rfcReceptor.toUpperCase(),
    nombreReceptor: attrEtiqueta("Receptor", "Nombre", xml),
    fecha: new Date(fecha).toISOString(),
    mes,
    anio,
    subtotal: numeroAttr(
      attrEtiqueta("Comprobante", "SubTotal", xml) ?? attrGlobal("SubTotal", xml)
    ),
    total: numeroAttr(
      attrEtiqueta("Comprobante", "Total", xml) ?? attrGlobal("Total", xml)
    ),
    moneda:
      attrEtiqueta("Comprobante", "Moneda", xml)?.toUpperCase() ?? "MXN",
    conceptoResumen: conceptoResumen(xml),
    estatus,
    metadata,
  };
}

export function clasificarTipoCfdi(
  rfcCliente: string,
  rfcEmisor: string,
  rfcReceptor: string
): TipoCfdi {
  const cliente = rfcCliente.trim().toUpperCase();
  const emisor = rfcEmisor.trim().toUpperCase();
  const receptor = rfcReceptor.trim().toUpperCase();
  if (emisor === cliente) return "emitido";
  if (receptor === cliente) return "recibido";
  return "recibido";
}

export const ETIQUETA_TIPO_COMPROBANTE: Record<TipoComprobanteCfdi, string> = {
  I: "Ingreso",
  E: "Egreso",
  T: "Traslado",
  N: "Nómina",
  P: "Pago",
};
