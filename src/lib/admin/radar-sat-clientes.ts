import {
  type Cliente,
  type EstadoCliente,
  type Periodo,
  calcularEstado,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
  getPeriodoFiscalVigente,
  getTotalPendiente,
  periodoLabel,
} from "@/lib/clientes";
import {
  type FlujoCumplimiento,
  type RegistroCumplimiento,
  esSinPagoImpuestos,
  getCumplimientoPeriodo,
} from "@/lib/cumplimiento";
import {
  FLUJO_DESCRIPCION,
  getWorkflowMesCliente,
} from "@/lib/cobranza-workflow";
import {
  fechaLimiteSAT,
  formatearDiaMesCorto,
} from "@/lib/portal/fechas-fiscales";

export type BandaRadarSat = "urgente" | "ventana" | "cerrado";

export type FilaRadarSat = {
  clienteId: number;
  razonSocial: string;
  rfc: string;
  periodo: Periodo;
  periodoLabel: string;
  flujo: FlujoCumplimiento;
  flujoLabel: string;
  paso: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  fechaSat: Date;
  fechaSatCorta: string;
  /** Primer día del mes en que vence el SAT (inicio de la ventana de corte). */
  fechaInicio: Date;
  fechaInicioCorta: string;
  diasAlSat: number;
  progreso: number;
  titulo: string;
  detalle: string;
  urgente: boolean;
  banda: BandaRadarSat;
  saldoHonorarios: number;
  estadoCobranza: EstadoCliente;
  href: string;
};

function diasHasta(fecha: Date, hoy: Date): number {
  const a = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const b = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function progresoVentana(inicio: Date, fin: Date, hoy: Date): number {
  const i = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime();
  const f = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate()).getTime();
  const h = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  const total = f - i;
  if (total <= 0) return h >= f ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round(((h - i) / total) * 100)));
}

function copySat(opts: {
  flujo: FlujoCumplimiento;
  flujoLabel: string;
  flujoDescripcion: string;
  cerrado: boolean;
  diasAlSat: number;
  periodoTxt: string;
  fechaSatCorta: string;
}): { titulo: string; detalle: string; urgente: boolean; banda: BandaRadarSat } {
  const { flujoLabel, flujoDescripcion, cerrado, diasAlSat, periodoTxt, fechaSatCorta } =
    opts;

  if (cerrado) {
    return {
      titulo: `Cerrado · ${periodoTxt}`,
      detalle: `${flujoLabel}. Corte SAT fue ${fechaSatCorta}.`,
      urgente: false,
      banda: "cerrado",
    };
  }

  if (diasAlSat < 0) {
    return {
      titulo: `El plazo del SAT ya pasó · ${periodoTxt}`,
      detalle: `${flujoLabel}. ${flujoDescripcion} Regulariza este expediente.`,
      urgente: true,
      banda: "urgente",
    };
  }

  if (diasAlSat === 0) {
    return {
      titulo: `Hoy vence el SAT · ${periodoTxt}`,
      detalle: `${flujoLabel}. Hoy es la fecha límite.`,
      urgente: true,
      banda: "urgente",
    };
  }

  if (diasAlSat <= 7) {
    return {
      titulo: `Te quedan ${diasAlSat} día${diasAlSat === 1 ? "" : "s"} para el SAT`,
      detalle: `${flujoLabel}. Aún hay ventana · corte ${fechaSatCorta}.`,
      urgente: true,
      banda: "urgente",
    };
  }

  if (diasAlSat <= 15) {
    return {
      titulo: `Impuestos de ${periodoTxt} pendientes`,
      detalle: `${flujoLabel}. Corte SAT ${fechaSatCorta} · ${diasAlSat} días.`,
      urgente: false,
      banda: "ventana",
    };
  }

  return {
    titulo: `Impuestos de ${periodoTxt} en proceso`,
    detalle: `${flujoLabel}. Ventana abierta hasta ${fechaSatCorta}.`,
    urgente: false,
    banda: "ventana",
  };
}

function puntaje(fila: FilaRadarSat): number {
  if (fila.banda === "cerrado") return 1_000 + fila.diasAlSat;
  if (fila.banda === "urgente") return fila.diasAlSat;
  return 100 + fila.diasAlSat;
}

/**
 * Una fila por cliente activo: mismo recado que el banner
 * «Te quedan N días para el SAT», con RFC, paso, ventana inicio→corte
 * y saldo de honorarios.
 */
export function construirRadarSatClientes(opts: {
  clientes: Cliente[];
  cumplimiento: RegistroCumplimiento[];
  /** Periodo del CRM (honorarios / saldo). El corte SAT usa el fiscal vigente. */
  periodoHonorarios: Periodo;
  hoy?: Date;
}): FilaRadarSat[] {
  const hoy = opts.hoy ?? new Date();
  const periodoFiscal = getPeriodoFiscalVigente(hoy);
  const periodoTxt = periodoLabel(periodoFiscal);
  const out: FilaRadarSat[] = [];

  for (const cli of opts.clientes) {
    if (!cli.activo || esIngresoGeneralCliente(cli)) continue;
    if (!clienteActivoEnPeriodo(cli, periodoFiscal)) continue;

    const reg = getCumplimientoPeriodo(opts.cumplimiento, cli.id, periodoFiscal);
    const wf = getWorkflowMesCliente(cli, periodoFiscal, reg);
    const fechaSat = fechaLimiteSAT(cli.rfc, periodoFiscal);
    const fechaInicio = new Date(fechaSat.getFullYear(), fechaSat.getMonth(), 1);
    const diasAlSat = diasHasta(fechaSat, hoy);
    const fechaSatCorta = formatearDiaMesCorto(fechaSat);
    const fechaInicioCorta = formatearDiaMesCorto(fechaInicio);
    const cerrado =
      wf.flujo === "completado" || esSinPagoImpuestos(reg);

    const copy = copySat({
      flujo: wf.flujo,
      flujoLabel: wf.label,
      flujoDescripcion: FLUJO_DESCRIPCION[wf.flujo],
      cerrado,
      diasAlSat,
      periodoTxt,
      fechaSatCorta,
    });

    out.push({
      clienteId: cli.id,
      razonSocial: cli.razonSocial,
      rfc: (cli.rfc || "—").toUpperCase(),
      periodo: periodoFiscal,
      periodoLabel: periodoTxt,
      flujo: wf.flujo,
      flujoLabel: wf.label,
      paso: wf.paso,
      fechaSat,
      fechaSatCorta,
      fechaInicio,
      fechaInicioCorta,
      diasAlSat,
      progreso: cerrado ? 100 : progresoVentana(fechaInicio, fechaSat, hoy),
      titulo: `${cli.razonSocial} · ${copy.titulo}`,
      detalle: copy.detalle,
      urgente: copy.urgente,
      banda: copy.banda,
      saldoHonorarios: getTotalPendiente(cli, opts.periodoHonorarios),
      estadoCobranza: calcularEstado(cli, opts.periodoHonorarios),
      href: `/cumplimiento?cliente=${cli.id}`,
    });
  }

  return out.sort((a, b) => puntaje(a) - puntaje(b));
}

export function resumirRadarSat(filas: FilaRadarSat[]): {
  urgentes: number;
  ventana: number;
  cerrados: number;
  total: number;
} {
  let urgentes = 0;
  let ventana = 0;
  let cerrados = 0;
  for (const f of filas) {
    if (f.banda === "urgente") urgentes += 1;
    else if (f.banda === "cerrado") cerrados += 1;
    else ventana += 1;
  }
  return { urgentes, ventana, cerrados, total: filas.length };
}
