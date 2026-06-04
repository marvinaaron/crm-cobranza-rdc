/**
 * Cálculo de badges numéricos por sección (estado, no notificaciones).
 *
 * A diferencia de la campana (que cuenta notificaciones no leídas), estos
 * contadores reflejan PENDIENTES REALES por sección, para pintar un círculo
 * rojo con número en las tabs del menú:
 *
 *  - Portal del cliente:
 *      · Honorarios   → meses con adeudo.
 *      · Cumplimiento → acciones fiscales pendientes del cliente.
 *  - Consola admin (agregado de todos los clientes):
 *      · Cobranza     → comprobantes de honorarios por revisar.
 *      · Cumplimiento → clientes con comprobante de impuestos por validar.
 */

import {
  type Cliente,
  type Periodo,
  contarMesesImpagos,
  getPeriodoHoy,
  getPeriodoFiscalVigente,
} from "@/lib/clientes";
import {
  type RegistroCumplimiento,
  getCumplimientoPeriodo,
  getFlujoCumplimiento,
} from "@/lib/cumplimiento";
import {
  type CategoriaId,
  categoriasVencidasSinPago,
  tieneComprobantePagoCategoria,
  pagoValidadoCategoria,
} from "@/lib/cumplimiento-categorias";

const CATEGORIAS: CategoriaId[] = ["federales", "imss", "estatales"];

/** Detalle de un badge: cuántos pendientes, por qué y a dónde lleva. */
export type BadgeSeccion = {
  /** Número que se pinta en el círculo. */
  count: number;
  /** Explicación corta de por qué hay pendientes (para el popover). */
  motivo: string;
  /** Texto del botón del popover. */
  cta: string;
};

/** Badges para el menú del portal de un cliente. */
export function badgesPortalCliente(
  cliente: Cliente,
  cumplimiento: RegistroCumplimiento[],
  hoy: Date = new Date()
): Record<string, BadgeSeccion> {
  const periodoHoy: Periodo = getPeriodoHoy();
  const periodoFiscal: Periodo = getPeriodoFiscalVigente(hoy);

  const out: Record<string, BadgeSeccion> = {};

  const honorarios = contarMesesImpagos(cliente, periodoHoy);
  if (honorarios > 0) {
    out["/portal/honorarios"] = {
      count: honorarios,
      motivo:
        honorarios >= 2
          ? `Tienes ${honorarios} meses de honorarios por pagar.`
          : "Tienes el honorario del mes por pagar.",
      cta: "Ir a Honorarios",
    };
  }

  const reg = getCumplimientoPeriodo(cumplimiento, cliente.id, periodoFiscal);
  const flujo = getFlujoCumplimiento(reg);
  const vencidas = categoriasVencidasSinPago(reg).length;

  // Las vencidas (urgentes) mandan; si no, una sola acción según el paso.
  if (vencidas > 0) {
    out["/portal/cumplimiento"] = {
      count: vencidas,
      motivo:
        vencidas >= 2
          ? `Tienes ${vencidas} pagos de impuestos vencidos por regularizar.`
          : "Tienes un pago de impuestos vencido por regularizar.",
      cta: "Ir a Cumplimiento",
    };
  } else if (flujo === "preliminar") {
    out["/portal/cumplimiento"] = {
      count: 1,
      motivo: "Tu preliminar de impuestos está listo para revisar y aprobar.",
      cta: "Revisar preliminar",
    };
  } else if (flujo === "declaraciones") {
    out["/portal/cumplimiento"] = {
      count: 1,
      motivo:
        "Tus declaraciones ya están listas: falta subir tu comprobante de pago.",
      cta: "Subir comprobante",
    };
  }

  return out;
}

/** Badges para el sidebar admin (agregado de todos los clientes). */
export function badgesAdmin(
  clientes: Cliente[],
  cumplimiento: RegistroCumplimiento[],
  comprobantesNuevos: number,
  hoy: Date = new Date()
): Record<string, BadgeSeccion> {
  const periodoFiscal: Periodo = getPeriodoFiscalVigente(hoy);

  const out: Record<string, BadgeSeccion> = {};

  if (comprobantesNuevos > 0) {
    out["/cobranza"] = {
      count: comprobantesNuevos,
      motivo:
        comprobantesNuevos === 1
          ? "Hay 1 comprobante de honorarios por revisar."
          : `Hay ${comprobantesNuevos} comprobantes de honorarios por revisar.`,
      cta: "Ir a Cobranza",
    };
  }

  let cumplimientoPorValidar = 0;
  for (const cli of clientes) {
    if (!cli.activo) continue;
    const reg = getCumplimientoPeriodo(cumplimiento, cli.id, periodoFiscal);
    if (!reg) continue;
    const hayPorValidar = CATEGORIAS.some(
      (cat) =>
        tieneComprobantePagoCategoria(reg, cat) &&
        !pagoValidadoCategoria(reg, cat)
    );
    if (hayPorValidar) cumplimientoPorValidar += 1;
  }
  if (cumplimientoPorValidar > 0) {
    out["/cumplimiento"] = {
      count: cumplimientoPorValidar,
      motivo:
        cumplimientoPorValidar === 1
          ? "1 cliente tiene comprobante de impuestos por validar."
          : `${cumplimientoPorValidar} clientes tienen comprobante de impuestos por validar.`,
      cta: "Ir a Cumplimiento",
    };
  }

  return out;
}
