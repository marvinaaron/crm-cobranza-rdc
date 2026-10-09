import {
  type Cliente,
  type Periodo,
  esIngresoGeneralCliente,
  getPeriodoFiscalVigente,
  periodoLabel,
} from "@/lib/clientes";
import {
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
      out.push({
        escalamientoClave: clave,
        clave: `cli-${cli.id}-${clave}`,
        clienteId: cli.id,
        razonSocial: cli.razonSocial,
        periodo: periodoFiscal,
        ambito: parseAmbito(clave),
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
          parseAmbito(clave)
        ),
        href: `/cumplimiento?cliente=${cli.id}`,
        urgente: esc === "d0" || esc === "d1",
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
      out.push({
        escalamientoClave: clave,
        clave: `reg-${reg.clienteId}-${periodo.anio}-${periodo.mes}-${clave}`,
        clienteId: cli.id,
        razonSocial: cli.razonSocial,
        periodo,
        ambito: parseAmbito(clave),
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
          parseAmbito(clave)
        ),
        href: `/cumplimiento?cliente=${cli.id}`,
        urgente: esc === "d0" || esc === "d1",
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
