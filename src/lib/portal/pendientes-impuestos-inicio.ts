import { type Periodo, periodoLabel } from "@/lib/clientes";
import {
  type FlujoCumplimiento,
  esSinPagoImpuestos,
  type RegistroCumplimiento,
} from "@/lib/cumplimiento";
import {
  fechaLimiteSAT,
  formatearDiaMesCorto,
} from "@/lib/portal/fechas-fiscales";
import type { AccionPortal } from "@/lib/portal/siguiente-paso";

function diasHasta(fecha: Date, hoy: Date): number {
  const a = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const b = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Banner de impuestos cuando el periodo fiscal aún no está cerrado ante el SAT.
 * El copy está pensado para que el cliente **nos contacte**: muchos olvidan
 * fechas aunque ya les hayamos escrito por otro medio.
 */
export function bannerImpuestosPendientesInicio(opts: {
  registro: RegistroCumplimiento | undefined;
  flujo: FlujoCumplimiento;
  periodoFiscal: Periodo;
  rfc?: string | null;
  hoy?: Date;
}): AccionPortal | null {
  const { registro, flujo, periodoFiscal, rfc } = opts;
  const hoy = opts.hoy ?? new Date();

  if (esSinPagoImpuestos(registro)) return null;
  if (flujo === "preliminar" || flujo === "declaraciones") return null;
  if (flujo === "completado" || flujo === "pago") return null;

  const flujosPendientes: FlujoCumplimiento[] = [
    "por_trabajar",
    "iniciando_contabilidad",
    "aceptacion",
  ];
  if (!flujosPendientes.includes(flujo)) return null;

  const limiteSat = fechaLimiteSAT(rfc, periodoFiscal);
  const diasAlSat = diasHasta(limiteSat, hoy);
  const fechaSat = formatearDiaMesCorto(limiteSat);
  const periodoTxt = periodoLabel(periodoFiscal);

  let titulo: string;
  let detalle: string;
  let urgente = false;

  if (diasAlSat < 0) {
    urgente = true;
    titulo = `Impuestos de ${periodoTxt} sin cerrar`;
    detalle =
      "El plazo del SAT ya pasó. Escríbenos si tienes dudas. Tienes que estar al corriente — te ayudamos a regularizarte.";
  } else if (diasAlSat <= 7) {
    urgente = true;
    titulo =
      diasAlSat === 0
        ? `Hoy vence el SAT · ${periodoTxt}`
        : `Te quedan ${diasAlSat} día${diasAlSat === 1 ? "" : "s"} para el SAT`;
    detalle =
      diasAlSat === 0
        ? "Hoy es la fecha límite. Escríbenos si tienes dudas."
        : "Aún estás a tiempo. Escríbenos si necesitas orientación.";
  } else if (diasAlSat <= 15) {
    titulo = `Impuestos de ${periodoTxt} pendientes`;
    detalle =
      "Tu cierre sigue abierto ante el SAT. Escríbenos si quieres saber cómo va.";
  } else {
    titulo = `Impuestos de ${periodoTxt} en proceso`;
    detalle =
      "Tu cierre está en marcha. Aquí verás el avance. Escríbenos si tienes dudas.";
  }

  return {
    clave: "impuestos_pendientes",
    etiqueta: "Impuestos SAT",
    titulo,
    desglose: `SAT · ${fechaSat}`,
    detalle,
    cta: "Escríbenos",
    href: "/portal/cumplimiento",
    contactarContador: true,
    ctaSecundario: "Ver Mi Cuenta",
    hrefSecundario: "/portal/cumplimiento",
    urgente,
  };
}
