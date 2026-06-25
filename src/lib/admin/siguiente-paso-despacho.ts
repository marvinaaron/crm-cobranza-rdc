import {
  type Cliente,
  type Periodo,
  esIngresoGeneralCliente,
  getPeriodoFiscalVigente,
  periodoLabel,
} from "@/lib/clientes";
import type { ComprobantePago } from "@/lib/comprobantes";
import { comprobanteCubrePeriodo } from "@/lib/comprobantes";
import {
  type RegistroCumplimiento,
  FLUJO_CUMPLIMIENTO_LABELS,
  getCumplimientoPeriodo,
  getFlujoCumplimiento,
} from "@/lib/cumplimiento";
import {
  type CategoriaId,
  tieneComprobantePagoCategoria,
  pagoValidadoCategoria,
} from "@/lib/cumplimiento-categorias";
import { type Encargo } from "@/lib/encargos";
import { bannerImpuestosPendientesInicio } from "@/lib/portal/pendientes-impuestos-inicio";
import { planificarRecordatoriosFiscales } from "@/lib/portal/recordatorios-fiscales";

const CATEGORIAS: CategoriaId[] = ["federales", "imss", "estatales"];

/** Acción priorizada para la bandeja operativa del despacho. */
export type AccionDespacho = {
  clave: string;
  clienteId?: number;
  etiqueta: string;
  titulo: string;
  detalle: string;
  cta: string;
  href: string;
  urgente: boolean;
};

function puntaje(a: AccionDespacho & { prioridad: number }): number {
  return a.prioridad + (a.urgente ? 1000 : 0);
}

function pushUnico(
  out: (AccionDespacho & { prioridad: number })[],
  visto: Set<string>,
  accion: AccionDespacho & { prioridad: number }
) {
  if (visto.has(accion.clave)) return;
  visto.add(accion.clave);
  out.push(accion);
}

/**
 * Cola operativa del despacho: comprobantes, cumplimiento, SAT, encargos y e.firma.
 * Ordenada por urgencia y tipo de pendiente.
 */
export function construirSiguientePasoDespacho(opts: {
  clientes: Cliente[];
  cumplimiento: RegistroCumplimiento[];
  comprobantes: ComprobantePago[];
  encargos: Encargo[];
  periodo: Periodo;
  hoy?: Date;
  efirmasProximas?: Array<{ clienteId: number; dias: number }>;
  limite?: number;
}): AccionDespacho[] {
  const hoy = opts.hoy ?? new Date();
  const periodoFiscal = getPeriodoFiscalVigente(hoy);
  const limite = opts.limite ?? 12;
  const out: (AccionDespacho & { prioridad: number })[] = [];
  const visto = new Set<string>();

  const mapaCliente = new Map(opts.clientes.map((c) => [c.id, c]));

  // Comprobantes de honorarios sin revisar (uno por comprobante).
  for (const cmp of opts.comprobantes) {
    if (cmp.extraEsperadoId) continue;
    if (cmp.estado !== "pendiente" || cmp.visto) continue;
    if (!comprobanteCubrePeriodo(cmp, opts.periodo)) continue;
    const cli = mapaCliente.get(cmp.clienteId);
    if (!cli?.activo) continue;
    pushUnico(out, visto, {
      clave: `cmp-${cmp.id}`,
      clienteId: cli.id,
      etiqueta: "Cobranza",
      titulo: `Comprobante por revisar · ${cli.razonSocial}`,
      detalle: `Honorarios de ${periodoLabel(opts.periodo)} — subido y pendiente de validar.`,
      cta: "Revisar comprobante",
      href: `/cobranza?filtro=comprobantes&cliente=${cli.id}`,
      urgente: true,
      prioridad: 100,
    });
  }

  // Alertas fiscales automáticas para admin (cron de hoy).
  const planesHoy = planificarRecordatoriosFiscales({
    clientes: opts.clientes,
    cumplimiento: opts.cumplimiento,
    hoy,
  });
  for (const p of planesHoy) {
    if (p.destinatario !== "admin") continue;
    const cli = mapaCliente.get(p.clienteId);
    if (!cli) continue;
    pushUnico(out, visto, {
      clave: `fiscal-admin-${p.escalamientoClave}`,
      clienteId: cli.id,
      etiqueta: "Fiscal automático",
      titulo: p.titulo.replace(/^🚨\s*/, ""),
      detalle: p.detalle,
      cta: "Ver cumplimiento",
      href: p.href.includes("cliente=")
        ? p.href
        : `/cumplimiento?cliente=${cli.id}`,
      urgente: true,
      prioridad: 98,
    });
  }

  // Comprobantes de impuestos por validar.
  for (const cli of opts.clientes) {
    if (!cli.activo || esIngresoGeneralCliente(cli)) continue;
    const reg = getCumplimientoPeriodo(opts.cumplimiento, cli.id, periodoFiscal);
    if (!reg) continue;
    const porValidar = CATEGORIAS.filter(
      (cat) =>
        tieneComprobantePagoCategoria(reg, cat) &&
        !pagoValidadoCategoria(reg, cat)
    );
    if (porValidar.length === 0) continue;
    pushUnico(out, visto, {
      clave: `validar-${cli.id}`,
      clienteId: cli.id,
      etiqueta: "Cumplimiento",
      titulo: `Impuestos por validar · ${cli.razonSocial}`,
      detalle:
        porValidar.length === 1
          ? `Comprobante de ${porValidar[0]} listo para revisar.`
          : `${porValidar.length} comprobantes de impuestos por validar.`,
      cta: "Validar pago",
      href: `/cumplimiento?cliente=${cli.id}`,
      urgente: true,
      prioridad: 95,
    });
  }

  // Cierres SAT abiertos en flujos tempranos (espejo del banner del cliente).
  for (const cli of opts.clientes) {
    if (!cli.activo || esIngresoGeneralCliente(cli)) continue;
    const reg = getCumplimientoPeriodo(opts.cumplimiento, cli.id, periodoFiscal);
    const flujo = getFlujoCumplimiento(reg);
    const banner = bannerImpuestosPendientesInicio({
      registro: reg,
      flujo,
      periodoFiscal,
      rfc: cli.rfc,
      hoy,
    });
    if (!banner) continue;
    const flujoLabel = FLUJO_CUMPLIMIENTO_LABELS[flujo];
    pushUnico(out, visto, {
      clave: `sat-${cli.id}`,
      clienteId: cli.id,
      etiqueta: "SAT sin cerrar",
      titulo: `${cli.razonSocial} · ${banner.titulo}`,
      detalle: `${flujoLabel}. ${banner.detalle}`,
      cta: "Abrir cumplimiento",
      href: `/cumplimiento?cliente=${cli.id}`,
      urgente: banner.urgente,
      prioridad: banner.urgente ? 92 : 70,
    });
  }

  // E.firmas próximas a vencer.
  for (const ef of opts.efirmasProximas ?? []) {
    const cli = mapaCliente.get(ef.clienteId);
    if (!cli?.activo) continue;
    const urgente = ef.dias <= 14;
    pushUnico(out, visto, {
      clave: `efirma-${cli.id}`,
      clienteId: cli.id,
      etiqueta: "E.firma",
      titulo: `E.firma por vencer · ${cli.razonSocial}`,
      detalle:
        ef.dias === 0
          ? "Vence hoy — renueva o notifica al cliente."
          : `Quedan ${ef.dias} día${ef.dias === 1 ? "" : "s"} de vigencia.`,
      cta: "Ver e.firmas",
      href: `/efirmas#cliente=${cli.id}`,
      urgente,
      prioridad: urgente ? 88 : 55,
    });
  }

  // Encargos abiertos (hasta 4 individuales; si hay más, una fila agregada).
  const abiertos = opts.encargos.filter((e) => e.estado !== "listo");
  const mostrarEncargos = abiertos.slice(0, 4);
  for (const enc of mostrarEncargos) {
    const cli = mapaCliente.get(enc.clienteId);
    if (!cli) continue;
    pushUnico(out, visto, {
      clave: `enc-${enc.id}`,
      clienteId: cli.id,
      etiqueta: "Encargos",
      titulo: `${enc.titulo} · ${cli.razonSocial}`,
      detalle: `Solicitud en estado «${enc.estado.replace("_", " ")}».`,
      cta: "Ver encargo",
      href: `/encargos?cliente=${cli.id}`,
      urgente: false,
      prioridad: 65,
    });
  }
  if (abiertos.length > 4) {
    pushUnico(out, visto, {
      clave: "encargos-mas",
      etiqueta: "Encargos",
      titulo: `${abiertos.length - 4} encargos más pendientes`,
      detalle: "Hay solicitudes personalizadas sin cerrar.",
      cta: "Ir a encargos",
      href: "/encargos",
      urgente: false,
      prioridad: 60,
    });
  }

  return out
    .sort((a, b) => puntaje(b) - puntaje(a))
    .slice(0, limite)
    .map(({ prioridad: _p, ...rest }) => rest);
}
