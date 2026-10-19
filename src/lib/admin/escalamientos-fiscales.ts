import {
  type Cliente,
  type Periodo,
  esIngresoGeneralCliente,
  getPeriodoFiscalVigente,
  periodoLabel,
} from "@/lib/clientes";
import { clienteTieneSaldoPendiente } from "@/lib/correo";
import {
  type FlujoCumplimiento,
  type RegistroCumplimiento,
  getCumplimientoPeriodo,
  getFlujoCumplimiento,
  FLUJO_CUMPLIMIENTO_LABELS,
} from "@/lib/cumplimiento";
import type { CategoriaId } from "@/lib/cumplimiento-categorias";
import {
  type EscalonFiscal,
  type RecordatorioFiscalPlanificado,
  planificarRecordatoriosFiscales,
} from "@/lib/portal/recordatorios-fiscales";

export type EstadoLineaEscalamiento = "pendiente_hoy" | "enviado";

export type LineaEscalamientoFiscal = {
  escalamientoClave: string;
  clave: string;
  clienteId: number;
  razonSocial: string;
  periodo: Periodo;
  ambito: "sat" | CategoriaId | "honorarios" | "admin";
  escalon: EscalonFiscal | null;
  destinatario: "cliente" | "admin";
  estado: EstadoLineaEscalamiento;
  enviadoEn?: string;
  titulo: string;
  detalle: string;
  /** Qué ve el cliente en su portal en este momento. */
  contextoCliente?: string;
  href: string;
  urgente: boolean;
  flujo: FlujoCumplimiento;
  resuelto: boolean;
};

export const ETIQUETAS_ESCALON: Record<EscalonFiscal, string> = {
  d0: "Día límite",
  d1: "D+1",
  d7: "D+7",
  d15: "D+15",
};

const ORDEN_ESCALON: Record<EscalonFiscal, number> = {
  d0: 0,
  d1: 1,
  d7: 2,
  d15: 3,
};

function parseEscalon(clave: string): EscalonFiscal | null {
  if (clave.endsWith("_d0") || clave.endsWith("_d0_admin")) return "d0";
  if (clave.endsWith("_d1") || clave.endsWith("_d1_admin")) return "d1";
  if (clave.endsWith("_d7") || clave.endsWith("_d7_admin")) return "d7";
  if (clave.endsWith("_d15") || clave.endsWith("_d15_admin")) return "d15";
  return null;
}

function parseAmbito(clave: string): LineaEscalamientoFiscal["ambito"] {
  if (clave.startsWith("sat_") || clave === "sat_d0") return "sat";
  if (clave.startsWith("honorarios_")) return "honorarios";
  if (clave.startsWith("federales_")) return "federales";
  if (clave.startsWith("imss_")) return "imss";
  if (clave.startsWith("estatales_")) return "estatales";
  if (clave.endsWith("_admin")) {
    const base = clave.replace(/_admin$/, "");
    return parseAmbito(base);
  }
  return "sat";
}

function etiquetaAmbito(ambito: LineaEscalamientoFiscal["ambito"]): string {
  switch (ambito) {
    case "sat":
      return "SAT sin cerrar";
    case "honorarios":
      return "Honorarios";
    case "federales":
      return "Federales";
    case "imss":
      return "IMSS";
    case "estatales":
      return "Estatales";
    case "admin":
      return "Alerta despacho";
    default:
      return "Fiscal";
  }
}

function tituloDesdeMarca(
  cli: Cliente,
  clave: string,
  periodo: Periodo
): { titulo: string; detalle: string } {
  const esc = parseEscalon(clave);
  const ambito = parseAmbito(clave);
  const escTxt = esc ? ETIQUETAS_ESCALON[esc] : "";
  const periodoTxt = periodoLabel(periodo);
  const esAdmin = clave.endsWith("_admin");

  if (ambito === "honorarios") {
    return {
      titulo: `${cli.razonSocial} · Honorarios ${periodoTxt}`,
      detalle: esAdmin
        ? `Recordatorio automático al despacho (${escTxt}).`
        : `Recordatorio automático al cliente (${escTxt}).`,
    };
  }

  if (ambito === "sat") {
    return {
      titulo: `${cli.razonSocial} · SAT ${periodoTxt}`,
      detalle: esAdmin
        ? `Alerta despacho: cierre sin cerrar (${escTxt}).`
        : `Recordatorio al cliente (${escTxt}).`,
    };
  }

  return {
    titulo: `${cli.razonSocial} · ${etiquetaAmbito(ambito)} ${periodoTxt}`,
    detalle: esAdmin
      ? `Alerta despacho (${escTxt}).`
      : `Recordatorio al cliente (${escTxt}).`,
  };
}

function flujoDe(
  cli: Cliente,
  cumplimiento: RegistroCumplimiento[],
  periodo: Periodo
): FlujoCumplimiento {
  return getFlujoCumplimiento(getCumplimientoPeriodo(cumplimiento, cli.id, periodo));
}

function lineaResuelta(
  ambito: LineaEscalamientoFiscal["ambito"],
  flujo: FlujoCumplimiento,
  cli: Cliente,
  periodo: Periodo
): boolean {
  if (ambito === "honorarios") return !clienteTieneSaldoPendiente(cli, periodo);
  return flujo === "completado";
}

function asuntoClaro(
  linea: Pick<LineaEscalamientoFiscal, "ambito" | "periodo">,
  resuelto = false
): string {
  const mes = periodoLabel(linea.periodo);
  if (resuelto) {
    switch (linea.ambito) {
      case "honorarios":
        return `Honorarios de ${mes} ya cobrados`;
      case "sat":
        return `SAT de ${mes} ya cerrado`;
      case "federales":
        return `Impuestos SAT de ${mes} ya comprobados`;
      case "imss":
        return `IMSS de ${mes} ya comprobado`;
      case "estatales":
        return `Impuestos estatales de ${mes} ya comprobados`;
      default:
        return `El pendiente fiscal de ${mes} ya quedó`;
    }
  }
  switch (linea.ambito) {
    case "honorarios":
      return `Honorarios de ${mes} sin pagar`;
    case "sat":
      return `SAT de ${mes} sin cerrar`;
    case "federales":
      return `Impuestos SAT de ${mes} sin comprobante`;
    case "imss":
      return `IMSS de ${mes} sin comprobante`;
    case "estatales":
      return `Impuestos estatales de ${mes} sin comprobante`;
    case "admin":
      return `Pendiente fiscal de ${mes}`;
    default:
      return `Pendiente fiscal de ${mes}`;
  }
}

function resolverClaro(
  linea: Pick<LineaEscalamientoFiscal, "ambito" | "flujo" | "resuelto">
): string {
  if (linea.resuelto) return "Nada pendiente. Ya quedó.";
  if (linea.ambito === "honorarios") return "Registra o cobra el honorario.";
  switch (linea.flujo) {
    case "completado":
      return "Nada pendiente. Ya quedó.";
    case "pago":
      return "Valida el comprobante de pago en Cumplimiento.";
    case "declaraciones":
      return "Pide el comprobante al cliente o registra el pago.";
    case "preliminar":
    case "aceptacion":
      return "Sube línea de captura y declaraciones.";
    case "iniciando_contabilidad":
      return "Termina el previo y publícalo.";
    default:
      return "Abre Cumplimiento e inicia la contabilidad.";
  }
}

function avisoClaro(linea: LineaEscalamientoFiscal): string {
  const cuando = linea.enviadoEn
    ? new Date(linea.enviadoEn).toLocaleString("es-MX", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  if (linea.estado === "pendiente_hoy") {
    return linea.destinatario === "admin"
      ? "Hoy toca avisarte a ti"
      : "Hoy toca avisar al cliente";
  }
  return linea.destinatario === "admin"
    ? `Se avisó al despacho${cuando ? ` · ${cuando}` : ""}`
    : `Se avisó al cliente${cuando ? ` · ${cuando}` : ""}`;
}

export type TarjetaFiscal = {
  clave: string;
  clienteId: number;
  razonSocial: string;
  href: string;
  quePasa: string;
  resolver: string;
  avisos: string[];
  estado: "por_resolver" | "resuelto";
  urgente: boolean;
  periodo: Periodo;
};

export function tarjetasFiscalesDesdeLineas(
  lineas: LineaEscalamientoFiscal[]
): TarjetaFiscal[] {
  const grupos = new Map<string, LineaEscalamientoFiscal[]>();
  for (const l of lineas) {
    const k = `${l.clienteId}-${l.periodo.anio}-${l.periodo.mes}-${l.ambito}`;
    const arr = grupos.get(k) ?? [];
    arr.push(l);
    grupos.set(k, arr);
  }

  const out: TarjetaFiscal[] = [];
  for (const arr of grupos.values()) {
    const top = arr.slice().sort((a, b) => puntajeLinea(b) - puntajeLinea(a))[0];
    const resuelto = arr.every((l) => l.resuelto);
    const avisos = [...new Set(arr.map(avisoClaro))];
    out.push({
      clave: top.clave,
      clienteId: top.clienteId,
      razonSocial: top.razonSocial,
      href: top.href,
      quePasa: asuntoClaro(top, resuelto),
      resolver: resolverClaro({ ...top, resuelto }),
      avisos,
      estado: resuelto ? "resuelto" : "por_resolver",
      urgente: !resuelto && arr.some((l) => l.urgente),
      periodo: top.periodo,
    });
  }

  return out.sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === "por_resolver" ? -1 : 1;
    if (a.urgente !== b.urgente) return a.urgente ? -1 : 1;
    return a.razonSocial.localeCompare(b.razonSocial, "es");
  });
}

function contextoPortalCliente(
  cli: Cliente,
  cumplimiento: RegistroCumplimiento[],
  periodo: Periodo,
  ambito: LineaEscalamientoFiscal["ambito"]
): string {
  const reg = getCumplimientoPeriodo(cumplimiento, cli.id, periodo);
  const flujo = FLUJO_CUMPLIMIENTO_LABELS[getFlujoCumplimiento(reg)];

  if (ambito === "honorarios") {
    return `En el portal ve honorarios pendientes. Flujo fiscal: ${flujo}.`;
  }
  if (ambito === "sat") {
    return `Banner «SAT sin cerrar» en inicio. Flujo: ${flujo}.`;
  }
  if (ambito === "admin") {
    return `Alerta interna; el cliente está en «${flujo}».`;
  }
  return `Portal en «${flujo}». Recordatorio de ${etiquetaAmbito(ambito).toLowerCase()}.`;
}

function planALinea(
  p: RecordatorioFiscalPlanificado,
  cli: Cliente,
  cumplimiento: RegistroCumplimiento[]
): LineaEscalamientoFiscal {
  const esc = parseEscalon(p.escalamientoClave);
  const ambito = p.escalamientoClave.endsWith("_admin")
    ? ("admin" as const)
    : parseAmbito(p.escalamientoClave);
  const flujo = flujoDe(cli, cumplimiento, p.periodo);

  return {
    escalamientoClave: p.escalamientoClave,
    clave: `${p.destinatario}-${p.escalamientoClave}-${cli.id}`,
    clienteId: cli.id,
    razonSocial: cli.razonSocial,
    periodo: p.periodo,
    ambito,
    escalon: esc,
    destinatario: p.destinatario,
    estado: "pendiente_hoy",
    titulo: p.titulo.replace(/^🚨\s*/, ""),
    detalle: p.detalle,
    contextoCliente: contextoPortalCliente(
      cli,
      cumplimiento,
      p.periodo,
      ambito
    ),
    href:
      p.destinatario === "admin"
        ? p.href.includes("cliente=")
          ? p.href
          : `/cumplimiento?cliente=${cli.id}`
        : `/cumplimiento?cliente=${cli.id}`,
    urgente: p.requireInteraction || esc === "d1" || esc === "d0",
    flujo,
    resuelto: lineaResuelta(ambito, flujo, cli, p.periodo),
  };
}

function recolectarMarcas(
  clientes: Cliente[],
  cumplimiento: RegistroCumplimiento[],
  periodoFiscal: Periodo
): LineaEscalamientoFiscal[] {
  const out: LineaEscalamientoFiscal[] = [];
  const mapa = new Map(clientes.map((c) => [c.id, c]));

  for (const cli of clientes) {
    if (!cli.activo || esIngresoGeneralCliente(cli)) continue;
    const alertas = cli.alertasEscalamientoEn ?? {};
    for (const [clave, enviadoEn] of Object.entries(alertas)) {
      const { titulo, detalle } = tituloDesdeMarca(cli, clave, periodoFiscal);
      const esc = parseEscalon(clave);
      const ambito = parseAmbito(clave);
      const flujo = flujoDe(cli, cumplimiento, periodoFiscal);
      out.push({
        escalamientoClave: clave,
        clave: `cli-${cli.id}-${clave}`,
        clienteId: cli.id,
        razonSocial: cli.razonSocial,
        periodo: periodoFiscal,
        ambito,
        escalon: esc,
        destinatario: clave.endsWith("_admin") ? "admin" : "cliente",
        estado: "enviado",
        enviadoEn,
        titulo,
        detalle,
        contextoCliente: contextoPortalCliente(
          cli,
          cumplimiento,
          periodoFiscal,
          ambito
        ),
        href: `/cumplimiento?cliente=${cli.id}`,
        urgente: esc === "d0" || esc === "d1",
        flujo,
        resuelto: lineaResuelta(ambito, flujo, cli, periodoFiscal),
      });
    }
  }

  for (const reg of cumplimiento) {
    const cli = mapa.get(reg.clienteId);
    if (!cli?.activo) continue;
    const periodo: Periodo = { mes: reg.mes, anio: reg.anio };
    const alertas = reg.alertasEscalamientoEn ?? {};
    for (const [clave, enviadoEn] of Object.entries(alertas)) {
      const { titulo, detalle } = tituloDesdeMarca(cli, clave, periodo);
      const esc = parseEscalon(clave);
      const ambito = parseAmbito(clave);
      const flujo = flujoDe(cli, cumplimiento, periodo);
      out.push({
        escalamientoClave: clave,
        clave: `reg-${reg.clienteId}-${periodo.anio}-${periodo.mes}-${clave}`,
        clienteId: cli.id,
        razonSocial: cli.razonSocial,
        periodo,
        ambito,
        escalon: esc,
        destinatario: clave.endsWith("_admin") ? "admin" : "cliente",
        estado: "enviado",
        enviadoEn,
        titulo,
        detalle,
        contextoCliente: contextoPortalCliente(
          cli,
          cumplimiento,
          periodo,
          ambito
        ),
        href: `/cumplimiento?cliente=${cli.id}`,
        urgente: esc === "d0" || esc === "d1",
        flujo,
        resuelto: lineaResuelta(ambito, flujo, cli, periodo),
      });
    }
  }

  return out;
}

function puntajeLinea(l: LineaEscalamientoFiscal): number {
  let s = 0;
  if (l.estado === "pendiente_hoy") s += 200;
  if (l.destinatario === "admin") s += 50;
  if (l.urgente) s += 30;
  if (l.escalon) s += ORDEN_ESCALON[l.escalon] * 5;
  if (l.enviadoEn) {
    const hace = Date.now() - new Date(l.enviadoEn).getTime();
    s += Math.max(0, 20 - Math.floor(hace / (1000 * 60 * 60 * 24)));
  }
  return s;
}

/**
 * Vista admin de escalamientos: lo que el cron enviaría hoy + historial reciente.
 */
export function listarEscalamientosFiscalesAdmin(opts: {
  clientes: Cliente[];
  cumplimiento: RegistroCumplimiento[];
  hoy?: Date;
  limite?: number;
  diasHistorial?: number;
}): LineaEscalamientoFiscal[] {
  const hoy = opts.hoy ?? new Date();
  const periodoFiscal = getPeriodoFiscalVigente(hoy);
  const limite = opts.limite ?? 40;
  const diasHistorial = opts.diasHistorial ?? 45;
  const mapa = new Map(opts.clientes.map((c) => [c.id, c]));

  const pendientes = planificarRecordatoriosFiscales({
    clientes: opts.clientes,
    cumplimiento: opts.cumplimiento,
    hoy,
  })
    .map((p) => {
      const cli = mapa.get(p.clienteId);
      if (!cli) return null;
      return planALinea(p, cli, opts.cumplimiento);
    })
    .filter((x): x is LineaEscalamientoFiscal => !!x);

  const clavesPendientes = new Set(pendientes.map((p) => p.escalamientoClave));

  const corte = Date.now() - diasHistorial * 24 * 60 * 60 * 1000;
  const enviados = recolectarMarcas(
    opts.clientes,
    opts.cumplimiento,
    periodoFiscal
  ).filter((l) => {
    if (!l.enviadoEn) return false;
    if (new Date(l.enviadoEn).getTime() < corte) return false;
    return !clavesPendientes.has(l.escalamientoClave);
  });

  const merged = [...pendientes, ...enviados];
  return merged
    .sort((a, b) => puntajeLinea(b) - puntajeLinea(a))
    .slice(0, limite);
}

export function contarEscalamientosPendientesHoy(
  lineas: LineaEscalamientoFiscal[]
): { total: number; admin: number; cliente: number } {
  const hoy = lineas.filter((l) => l.estado === "pendiente_hoy");
  return {
    total: hoy.length,
    admin: hoy.filter((l) => l.destinatario === "admin").length,
    cliente: hoy.filter((l) => l.destinatario === "cliente").length,
  };
}
