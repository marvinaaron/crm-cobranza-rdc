import {
  type Cliente,
  type Periodo,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
  getPeriodoFiscalVigente,
  getPeriodoHoy,
  periodoLabel,
} from "@/lib/clientes";
import { clienteTieneSaldoPendiente, getFechaLimiteDate } from "@/lib/correo";
import {
  type FlujoCumplimiento,
  type RegistroCumplimiento,
  esSinPagoImpuestos,
  getFlujoCumplimiento,
  getCumplimientoPeriodo,
} from "@/lib/cumplimiento";
import {
  CATEGORIA_META,
  type CategoriaId,
  categoriaConPagoEnRegistro,
  categoriaTieneExtemporaneo,
  getFechaLimiteCategoria,
  getFechaLimiteEfectivaCategoria,
  tieneComprobantePagoCategoria,
} from "@/lib/cumplimiento-categorias";
import { diasHastaLimite } from "@/lib/cumplimiento-fechas";
import type { DestinatarioNotificacion, Notificacion, TipoNotificacion } from "@/lib/notificaciones";
import { nuevoIdNotificacion } from "@/lib/notificaciones";
import { fechaLimiteSAT } from "@/lib/portal/fechas-fiscales";

/** Días relativos al vencimiento SAT (0 = día del límite). */
export const ESCALONES_SAT_SIN_CIERRE = [0, 1, 7, 15] as const;
/** Días después del límite sin comprobante / honorarios. */
export const ESCALONES_POST_VENCIMIENTO = [1, 7, 15] as const;

export type EscalonFiscal = "d0" | "d1" | "d7" | "d15";

export type RecordatorioFiscalPlanificado = {
  escalamientoClave: string;
  tipo: TipoNotificacion;
  destinatario: DestinatarioNotificacion;
  clienteId: number;
  periodo: Periodo;
  categoria?: CategoriaId;
  titulo: string;
  detalle: string;
  href: string;
  marcarEnRegistro?: boolean;
  marcarEnCliente?: boolean;
  requireInteraction: boolean;
};

function soloFecha(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diasHasta(fecha: Date, hoy: Date): number {
  const a = soloFecha(hoy);
  const b = soloFecha(fecha);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function primerEscalonPendiente(
  diasRelativo: number,
  escalones: readonly number[],
  ya: (esc: EscalonFiscal) => boolean
): number | null {
  for (const e of escalones) {
    if (e === 0) {
      if (diasRelativo === 0 && !ya("d0")) return 0;
      continue;
    }
    const esc = escalonLabel(e);
    if (diasRelativo <= -e && !ya(esc)) return e;
  }
  return null;
}

function escalonLabel(dias: number): EscalonFiscal {
  if (dias === 0) return "d0";
  if (dias === 1) return "d1";
  if (dias === 7) return "d7";
  return "d15";
}

function periodoKey(p: Periodo): string {
  return `${p.anio}-${p.mes}`;
}

/** ¿Ya se envió este escalón? Incluye migración desde `vencimientoNotificadoEn`. */
export function yaEnvioEscalamiento(
  reg: RegistroCumplimiento | undefined,
  cliente: Cliente | undefined,
  clave: string,
  categoriaLegacy?: CategoriaId
): boolean {
  if (reg?.alertasEscalamientoEn?.[clave]) return true;
  if (cliente?.alertasEscalamientoEn?.[clave]) return true;
  if (
    categoriaLegacy &&
    clave.endsWith("_d1") &&
    reg?.vencimientoNotificadoEn?.[categoriaLegacy]
  ) {
    return true;
  }
  return false;
}

function aplicaSatSinCierre(flujo: FlujoCumplimiento): boolean {
  return (
    flujo === "por_trabajar" ||
    flujo === "iniciando_contabilidad" ||
    flujo === "aceptacion"
  );
}

function copySatSinCierre(
  escalon: EscalonFiscal,
  periodoTxt: string
): { titulo: string; detalle: string } {
  switch (escalon) {
    case "d0":
      return {
        titulo: `Hoy vence el SAT · ${periodoTxt}`,
        detalle: "Hoy es la fecha límite. Escríbenos si tienes dudas.",
      };
    case "d1":
      return {
        titulo: `Impuestos de ${periodoTxt} sin cerrar`,
        detalle:
          "El plazo del SAT ya pasó. Escríbenos si tienes dudas. Tienes que estar al corriente — te ayudamos a regularizarte.",
      };
    case "d7":
      return {
        titulo: `Sigues con impuestos de ${periodoTxt} sin cerrar`,
        detalle: "Escríbenos — te ayudamos a regularizarte.",
      };
    case "d15":
      return {
        titulo: `Impuestos de ${periodoTxt} siguen pendientes`,
        detalle: "Es momento de escribirnos.",
      };
  }
}

function copySinComprobante(
  escalon: EscalonFiscal,
  cat: CategoriaId,
  periodoTxt: string,
  extemporaneo = false
): { titulo: string; detalle: string } {
  const label = CATEGORIA_META[cat].label;
  if (extemporaneo) {
    switch (escalon) {
      case "d0":
        return {
          titulo: `Hoy vence tu pago extemporáneo · ${label} · ${periodoTxt}`,
          detalle:
            "Es la nueva fecha límite (con recargos). Realiza el pago y sube tu comprobante.",
        };
      case "d1":
        return {
          titulo: `Se pasó la nueva fecha de ${label} · ${periodoTxt}`,
          detalle:
            "La línea extemporánea ya venció. Sube tu comprobante o escríbenos.",
        };
      case "d7":
        return {
          titulo: `Aún falta tu comprobante extemporáneo · ${label}`,
          detalle: "Sube tu comprobante o escríbenos.",
        };
      case "d15":
        return {
          titulo: `${label} extemporáneo de ${periodoTxt}: comprobante pendiente`,
          detalle: "Escríbenos.",
        };
      default:
        return {
          titulo: `Comprobante extemporáneo pendiente · ${label}`,
          detalle: "Escríbenos.",
        };
    }
  }
  switch (escalon) {
    case "d1":
      return {
        titulo: `Se pasó el plazo de ${label} · ${periodoTxt}`,
        detalle: "Sube tu comprobante o escríbenos.",
      };
    case "d7":
      return {
        titulo: `Aún falta tu comprobante de ${label} · ${periodoTxt}`,
        detalle: "Sube tu comprobante o escríbenos.",
      };
    case "d15":
      return {
        titulo: `${label} de ${periodoTxt}: comprobante pendiente`,
        detalle: "Escríbenos.",
      };
    default:
      return {
        titulo: `Comprobante pendiente · ${label}`,
        detalle: "Escríbenos.",
      };
  }
}

function copyHonorarios(
  escalon: EscalonFiscal,
  periodoTxt: string
): { titulo: string; detalle: string } {
  if (escalon === "d7") {
    return {
      titulo: `Honorarios de ${periodoTxt} siguen pendientes`,
      detalle: "Tienes saldo pendiente. Puedes cubrirlo en el portal.",
    };
  }
  return {
    titulo: `Honorarios de ${periodoTxt} pendientes`,
    detalle: "Tienes saldo pendiente. Puedes cubrirlo en el portal.",
  };
}

function planSatSinCierre(opts: {
  cliente: Cliente;
  reg: RegistroCumplimiento | undefined;
  flujo: FlujoCumplimiento;
  periodoFiscal: Periodo;
  hoy: Date;
}): RecordatorioFiscalPlanificado[] {
  const { cliente, reg, flujo, periodoFiscal, hoy } = opts;
  if (esSinPagoImpuestos(reg)) return [];
  if (!aplicaSatSinCierre(flujo)) return [];

  const limiteSat = fechaLimiteSAT(cliente.rfc, periodoFiscal);
  const diasAlSat = diasHasta(limiteSat, hoy);
  const ya = (esc: EscalonFiscal) =>
    yaEnvioEscalamiento(reg, cliente, reg ? `sat_${esc}` : `sat_${periodoKey(periodoFiscal)}_${esc}`);

  const escalonDias = primerEscalonPendiente(
    diasAlSat,
    ESCALONES_SAT_SIN_CIERRE,
    ya
  );
  if (escalonDias == null) return [];

  const esc = escalonLabel(escalonDias);
  const clave = reg
    ? `sat_${esc}`
    : `sat_${periodoKey(periodoFiscal)}_${esc}`;

  if (yaEnvioEscalamiento(reg, cliente, clave)) return [];

  const periodoTxt = periodoLabel(periodoFiscal);
  const { titulo, detalle } = copySatSinCierre(esc, periodoTxt);
  const out: RecordatorioFiscalPlanificado[] = [
    {
      escalamientoClave: clave,
      tipo: "recordatorio_fiscal",
      destinatario: "cliente",
      clienteId: cliente.id,
      periodo: periodoFiscal,
      titulo,
      detalle,
      href: "/portal/cumplimiento",
      marcarEnRegistro: !!reg,
      marcarEnCliente: !reg,
      requireInteraction: esc !== "d0",
    },
  ];

  if (esc === "d1" || esc === "d7") {
    out.push({
      escalamientoClave: `${clave}_admin`,
      tipo: "recordatorio_fiscal",
      destinatario: "admin",
      clienteId: cliente.id,
      periodo: periodoFiscal,
      titulo: `🚨 SAT sin cerrar · ${cliente.razonSocial} · ${periodoTxt}`,
      detalle: "Escríbele para destrabar el cierre.",
      href: `/cumplimiento?cliente=${cliente.id}`,
      requireInteraction: true,
    });
  }

  return out;
}

function planSinComprobante(opts: {
  cliente: Cliente;
  reg: RegistroCumplimiento;
  periodoFiscal: Periodo;
  hoy: Date;
}): RecordatorioFiscalPlanificado[] {
  const { cliente, reg, periodoFiscal, hoy } = opts;
  const periodoTxt = periodoLabel(periodoFiscal);
  const out: RecordatorioFiscalPlanificado[] = [];

  const cats = ["federales", "imss", "estatales"] as CategoriaId[];
  for (const cat of cats) {
    if (!categoriaConPagoEnRegistro(reg, cat)) continue;
    if (tieneComprobantePagoCategoria(reg, cat)) continue;
    if (reg.comprobantePago) continue;

    const tieneExt = categoriaTieneExtemporaneo(reg, cat);
    // Con línea extemporánea los recordatorios se reinician con la nueva fecha.
    const fl = tieneExt
      ? getFechaLimiteEfectivaCategoria(reg, cat)
      : getFechaLimiteCategoria(reg, cat);
    if (!fl) continue;
    const dias = diasHastaLimite(fl, hoy);
    if (dias === null) continue;

    const prefijo = tieneExt ? `${cat}_ext` : cat;
    const escalones = tieneExt
      ? ([0, 1, 7, 15] as const)
      : ESCALONES_POST_VENCIMIENTO;

    const ya = (esc: EscalonFiscal) =>
      yaEnvioEscalamiento(reg, cliente, `${prefijo}_${esc}`, cat);
    const escalonDias = primerEscalonPendiente(dias, escalones, ya);
    if (escalonDias == null) continue;

    const esc = escalonLabel(escalonDias);
    const clave = `${prefijo}_${esc}`;
    if (yaEnvioEscalamiento(reg, cliente, clave, cat)) continue;

    const { titulo, detalle } = copySinComprobante(
      esc,
      cat,
      periodoTxt,
      tieneExt
    );
    out.push({
      escalamientoClave: clave,
      tipo:
        esc === "d0" || esc === "d1"
          ? "vencimiento_sin_pago"
          : "recordatorio_fiscal",
      destinatario: "cliente",
      clienteId: cliente.id,
      periodo: periodoFiscal,
      categoria: cat,
      titulo,
      detalle,
      href: tieneExt
        ? "/portal/cumplimiento#pago-extemporaneo"
        : "/portal/cumplimiento",
      marcarEnRegistro: true,
      requireInteraction: esc !== "d0",
    });

    if (esc === "d0" || esc === "d1") {
      out.push({
        escalamientoClave: `${clave}_admin`,
        tipo: "vencimiento_sin_pago",
        destinatario: "admin",
        clienteId: cliente.id,
        periodo: periodoFiscal,
        categoria: cat,
        titulo: tieneExt
          ? `🚨 Extemporáneo ${esc === "d0" ? "vence hoy" : "vencido"} · ${cliente.razonSocial} · ${CATEGORIA_META[cat].label} ${periodoTxt}`
          : `🚨 Vencido sin pago · ${cliente.razonSocial} · ${CATEGORIA_META[cat].label} ${periodoTxt}`,
        detalle: tieneExt
          ? "El cliente aún no sube comprobante de la línea extemporánea."
          : "Genera línea extemporánea o escríbele para destrabar.",
        href: "/cumplimiento",
        requireInteraction: true,
      });
    }
  }

  return out;
}

function planHonorarios(opts: {
  cliente: Cliente;
  periodoCobranza: Periodo;
  hoy: Date;
}): RecordatorioFiscalPlanificado[] {
  const { cliente, periodoCobranza, hoy } = opts;
  if (!clienteActivoEnPeriodo(cliente, periodoCobranza)) return [];
  if (!clienteTieneSaldoPendiente(cliente, periodoCobranza)) return [];

  const limite = soloFecha(getFechaLimiteDate(cliente, periodoCobranza));
  const diasDesdeVencimiento = Math.round(
    (soloFecha(hoy).getTime() - limite.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diasDesdeVencimiento < 1) return [];

  const diasRel = -diasDesdeVencimiento;
  const ya = (esc: EscalonFiscal) =>
    yaEnvioEscalamiento(
      undefined,
      cliente,
      `honorarios_${periodoKey(periodoCobranza)}_${esc}`
    );
  const escalonDias = primerEscalonPendiente(
    diasRel,
    [1, 7],
    ya
  );
  if (escalonDias == null) return [];

  const esc = escalonLabel(escalonDias);
  const clave = `honorarios_${periodoKey(periodoCobranza)}_${esc}`;
  if (yaEnvioEscalamiento(undefined, cliente, clave)) return [];

  const periodoTxt = periodoLabel(periodoCobranza);
  const { titulo, detalle } = copyHonorarios(esc, periodoTxt);

  return [
    {
      escalamientoClave: clave,
      tipo: "recordatorio_fiscal",
      destinatario: "cliente",
      clienteId: cliente.id,
      periodo: periodoCobranza,
      titulo,
      detalle,
      href: "/portal/honorarios#pago",
      marcarEnCliente: true,
      requireInteraction: true,
    },
  ];
}

/**
 * Calcula recordatorios fiscales/cobranza que corresponden **hoy** (CDMX).
 * No muta estado; el cron y el fallback del CRM aplican el resultado.
 */
export function planificarRecordatoriosFiscales(opts: {
  clientes: Cliente[];
  cumplimiento: RegistroCumplimiento[];
  hoy?: Date;
}): RecordatorioFiscalPlanificado[] {
  const hoy = opts.hoy ?? new Date();
  const periodoFiscal = getPeriodoFiscalVigente(hoy);
  const periodoCobranza = getPeriodoHoy();
  const out: RecordatorioFiscalPlanificado[] = [];

  for (const cliente of opts.clientes) {
    if (!cliente.activo || esIngresoGeneralCliente(cliente)) continue;

    const reg = getCumplimientoPeriodo(
      opts.cumplimiento,
      cliente.id,
      periodoFiscal
    );
    const flujo = getFlujoCumplimiento(reg);

    out.push(
      ...planSatSinCierre({ cliente, reg, flujo, periodoFiscal, hoy })
    );

    if (reg && reg.clienteConfirmoPreviewEn) {
      out.push(
        ...planSinComprobante({ cliente, reg, periodoFiscal, hoy })
      );
    }

    out.push(...planHonorarios({ cliente, periodoCobranza, hoy }));
  }

  return out;
}

export function planificadoANotificacion(
  p: RecordatorioFiscalPlanificado,
  ahora = new Date().toISOString()
): Notificacion {
  return {
    id: nuevoIdNotificacion(),
    tipo: p.tipo,
    destinatario: p.destinatario,
    clienteId: p.clienteId,
    periodo: p.periodo,
    categoria: p.categoria,
    escalamientoClave: p.escalamientoClave,
    titulo: p.titulo,
    detalle: p.detalle,
    href: p.href,
    createdAt: ahora,
  };
}

export type MarcasEscalamiento = {
  cumplimiento: RegistroCumplimiento[];
  clientes: Cliente[];
};

/** Aplica marcas de escalamiento tras enviar recordatorios. */
export function aplicarMarcasEscalamiento(
  estado: MarcasEscalamiento,
  planes: RecordatorioFiscalPlanificado[],
  ahora = new Date().toISOString()
): MarcasEscalamiento {
  let { cumplimiento, clientes } = estado;

  for (const p of planes) {
    if (p.destinatario !== "cliente") continue;
    if (!p.marcarEnRegistro && !p.marcarEnCliente) continue;

    if (p.marcarEnRegistro) {
      cumplimiento = cumplimiento.map((r) => {
        if (
          r.clienteId !== p.clienteId ||
          r.mes !== p.periodo.mes ||
          r.anio !== p.periodo.anio
        ) {
          return r;
        }
        const alertas = { ...(r.alertasEscalamientoEn ?? {}), [p.escalamientoClave]: ahora };
        const legacy =
          p.categoria && p.escalamientoClave.endsWith("_d1")
            ? {
                ...(r.vencimientoNotificadoEn ?? {}),
                [p.categoria]: ahora,
              }
            : r.vencimientoNotificadoEn;
        return {
          ...r,
          alertasEscalamientoEn: alertas,
          vencimientoNotificadoEn: legacy,
          actualizadoEn: ahora,
        };
      });
    }

    if (p.marcarEnCliente) {
      clientes = clientes.map((c) =>
        c.id === p.clienteId
          ? {
              ...c,
              alertasEscalamientoEn: {
                ...(c.alertasEscalamientoEn ?? {}),
                [p.escalamientoClave]: ahora,
              },
            }
          : c
      );
    }
  }

  return { cumplimiento, clientes };
}
