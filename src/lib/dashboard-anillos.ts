import {
  type Cliente,
  type Periodo,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
  estaPagado,
} from "@/lib/clientes";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import {
  asegurarBloques,
  categoriaConPagoEnRegistro,
  consolidarFederalesLineasCaptura,
  pagoValidadoCategoria,
} from "@/lib/cumplimiento-categorias";
import { categoriaAplicaCliente } from "@/lib/config-cumplimiento-cliente";
import { getFacturaPeriodo, type FacturaPago } from "@/lib/facturas";

export type TonoAnilloInicio = "navy" | "emerald" | "amber" | "rose";

export type AnilloInicio = {
  id: "pagaron" | "factura" | "trabajo" | "impuestos";
  label: string;
  centro: string;
  pie: string;
  pct: number;
  href: string;
  tono: TonoAnilloInicio;
};

export function tonoAvance(pct: number): TonoAnilloInicio {
  if (pct >= 100) return "emerald";
  if (pct >= 60) return "navy";
  if (pct >= 25) return "amber";
  return "rose";
}

export function pctSafe(parte: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((parte / total) * 100)));
}

function pieDe(listos: number, total: number, vacio: string): string {
  if (total <= 0) return vacio;
  return `${listos} de ${total}`;
}

/** El despacho ya subió declaración SAT + línea. No mira IMSS. */
function satTrabajoListo(reg: RegistroCumplimiento | undefined): boolean {
  if (!reg) return false;
  const r = asegurarBloques(reg);
  if (!r.federales.declaracion) return false;
  const lineas = consolidarFederalesLineasCaptura(r.federales.lineasCaptura);
  return lineas.length > 0 && !!lineas[0].documento;
}

/**
 * Cuatro anillos del Inicio, todos en clientes (el dinero ya está arriba).
 * Honorarios: quién pagó y a quién ya facturaste.
 * SAT: trabajo del despacho e impuestos ya pagados. Sin IMSS.
 */
export function resumirAnillosInicio({
  clientes,
  periodo,
  facturas,
  getRegistro,
}: {
  clientes: Cliente[];
  periodo: Periodo;
  facturas: FacturaPago[];
  getRegistro: (clienteId: number, periodo: Periodo) => RegistroCumplimiento | undefined;
}): AnilloInicio[] {
  const honorarios = clientes.filter(
    (c) =>
      c.activo &&
      clienteActivoEnPeriodo(c, periodo) &&
      !esIngresoGeneralCliente(c)
  );
  const carteraSat = honorarios.filter((c) =>
    categoriaAplicaCliente(c, "federales")
  );

  let pagaron = 0;
  let facturados = 0;
  for (const c of honorarios) {
    if (estaPagado(c, periodo)) pagaron += 1;
    if (getFacturaPeriodo(facturas, c.id, periodo)) facturados += 1;
  }

  let trabajoListo = 0;
  let debenSat = 0;
  let pagaronSat = 0;
  for (const c of carteraSat) {
    const reg = getRegistro(c.id, periodo);
    if (satTrabajoListo(reg)) trabajoListo += 1;
    if (categoriaConPagoEnRegistro(reg, "federales")) {
      debenSat += 1;
      if (pagoValidadoCategoria(reg, "federales")) pagaronSat += 1;
    }
  }

  const pctPagaron = pctSafe(pagaron, honorarios.length);
  const pctFactura = pctSafe(facturados, honorarios.length);
  const pctTrabajo = pctSafe(trabajoListo, carteraSat.length);
  const pctImpuestos = pctSafe(pagaronSat, debenSat);

  return [
    {
      id: "pagaron",
      label: "Pagaron",
      centro: String(pagaron),
      pie: pieDe(pagaron, honorarios.length, "Sin clientes"),
      pct: pctPagaron,
      href: "/cobranza",
      tono: tonoAvance(pctPagaron),
    },
    {
      id: "factura",
      label: "Factura",
      centro: String(facturados),
      pie: pieDe(facturados, honorarios.length, "Sin clientes"),
      pct: pctFactura,
      href: "/cobranza",
      tono: tonoAvance(pctFactura),
    },
    {
      id: "trabajo",
      label: "Trabajo SAT",
      centro: String(trabajoListo),
      pie: pieDe(trabajoListo, carteraSat.length, "Sin clientes SAT"),
      pct: pctTrabajo,
      href: "/cumplimiento",
      tono: tonoAvance(pctTrabajo),
    },
    {
      id: "impuestos",
      label: "Impuestos SAT",
      centro: String(pagaronSat),
      pie: pieDe(pagaronSat, debenSat, "Nadie debe SAT"),
      pct: pctImpuestos,
      href: "/cumplimiento",
      tono: tonoAvance(pctImpuestos),
    },
  ];
}
