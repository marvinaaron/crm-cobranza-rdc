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

/** Badges para el menú del portal de un cliente. */
export function badgesPortalCliente(
  cliente: Cliente,
  cumplimiento: RegistroCumplimiento[],
  hoy: Date = new Date()
): Record<string, number> {
  const periodoHoy: Periodo = getPeriodoHoy();
  const periodoFiscal: Periodo = getPeriodoFiscalVigente(hoy);

  const honorarios = contarMesesImpagos(cliente, periodoHoy);

  const reg = getCumplimientoPeriodo(cumplimiento, cliente.id, periodoFiscal);
  const flujo = getFlujoCumplimiento(reg);
  const vencidas = categoriasVencidasSinPago(reg).length;

  // Evita doble conteo: las vencidas (urgentes) mandan; si no, una sola
  // acción pendiente según el paso del flujo.
  let cumplimientoPendiente = 0;
  if (vencidas > 0) {
    cumplimientoPendiente = vencidas;
  } else if (flujo === "preliminar" || flujo === "declaraciones") {
    cumplimientoPendiente = 1;
  }

  return {
    "/portal/honorarios": honorarios,
    "/portal/cumplimiento": cumplimientoPendiente,
  };
}

/** Badges para el sidebar admin (agregado de todos los clientes). */
export function badgesAdmin(
  clientes: Cliente[],
  cumplimiento: RegistroCumplimiento[],
  comprobantesNuevos: number,
  hoy: Date = new Date()
): Record<string, number> {
  const periodoFiscal: Periodo = getPeriodoFiscalVigente(hoy);

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

  return {
    "/cobranza": comprobantesNuevos,
    "/cumplimiento": cumplimientoPorValidar,
  };
}
