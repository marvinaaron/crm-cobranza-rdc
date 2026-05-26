import type { ConfigCumplimientoCliente } from "@/lib/config-cumplimiento-cliente";
import type { ConfigRepseCliente } from "@/lib/repse";
import type { SatPortalCliente } from "@/lib/sat/types";

export const MESES_NOM = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export type Periodo = { mes: number; anio: number };

export function getPeriodoHoy(): Periodo {
  const now = new Date();
  return { mes: now.getMonth(), anio: now.getFullYear() };
}

/** Periodo de consulta en cumplimiento: no puede ser posterior al fiscal vigente. */
export function resolverPeriodoCumplimiento(
  periodoSeleccionado: Periodo,
  periodoFiscalVigente: Periodo
): Periodo {
  return periodoKey(periodoSeleccionado) <= periodoKey(periodoFiscalVigente)
    ? periodoSeleccionado
    : periodoFiscalVigente;
}

/** Periodo fiscal en curso: siempre el mes calendario vencido (en mayo → abril). */
export function getPeriodoFiscalVigente(fecha = new Date()): Periodo {
  const mesCalendario = fecha.getMonth();
  const anio = fecha.getFullYear();
  if (mesCalendario === 0) {
    return { mes: 11, anio: anio - 1 };
  }
  return { mes: mesCalendario - 1, anio };
}

export function periodoLabel(periodo: Periodo): string {
  return `${MESES_NOM[periodo.mes]} ${periodo.anio}`;
}

export function periodoAnioStr(periodo: Periodo): string {
  return String(periodo.anio);
}

export function esMismoPeriodo(a: Periodo, b: Periodo): boolean {
  return a.mes === b.mes && a.anio === b.anio;
}

export function esPeriodoFuturo(periodo: Periodo, referencia = getPeriodoHoy()): boolean {
  if (periodo.anio > referencia.anio) return true;
  if (periodo.anio < referencia.anio) return false;
  return periodo.mes > referencia.mes;
}

export function esPeriodoPasado(periodo: Periodo, referencia = getPeriodoHoy()): boolean {
  if (periodo.anio < referencia.anio) return true;
  if (periodo.anio > referencia.anio) return false;
  return periodo.mes < referencia.mes;
}

function clienteInicioKey(client: Cliente): number {
  return Number(client.inicioAnio) * 12 + client.inicioMes;
}

export function periodoKey(periodo: Periodo): number {
  return periodo.anio * 12 + periodo.mes;
}

export function clienteActivoEnPeriodo(client: Cliente, periodo: Periodo): boolean {
  return periodoKey(periodo) >= clienteInicioKey(client);
}

export type PagoRealizado = {
  mes: number;
  anio: string;
  monto: number;
  /** Descripción del ingreso (ingresos diversos, pagos extraordinarios). */
  nota?: string;
  /** Si el pago vino de la validación de un comprobante, guardamos su id para poder revertirlo. */
  comprobanteId?: string;
  /** Tipo de pago. Sin valor = "honorarios" (retrocompatibilidad). */
  tipo?: "honorarios" | "adicional";
  /** Concepto del servicio adicional (solo cuando tipo = "adicional"). */
  concepto?: string;
  /** Id único requerido cuando hay varios pagos en el mismo mes (caso "adicional"). */
  id?: string;
};
export type HistorialHonorario = { mes: number; monto: number };

/** Descuento puntual aplicado a un mes/año específico para un cliente. */
export type Descuento = {
  id: string;
  mes: number;
  anio: string;
  /** monto: descuento fijo en pesos. porcentaje: % sobre honorario vigente. */
  tipo: "monto" | "porcentaje";
  valor: number;
  motivo: string;
  aplicadoEn: string;
};

/** Catálogo de conceptos rápidos para "servicios adicionales" cobrados a un cliente. */
export const CONCEPTOS_SERVICIO_ADICIONAL = [
  "Declaración anual",
  "Constancia de situación fiscal",
  "Opinión de cumplimiento",
  "Asesoría fiscal",
  "Trámite SAT",
  "Trámite IMSS",
  "Constitución / Acta",
  "Cambio de domicilio fiscal",
  "Aumento de capital",
  "Auditoría / Dictamen",
  "Otro",
] as const;

export type ConceptoServicioAdicional = (typeof CONCEPTOS_SERVICIO_ADICIONAL)[number];

export function nuevoIdPagoAdicional(): string {
  return `pa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nuevoIdDescuento(): string {
  return `desc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type Cliente = {
  id: number;
  razonSocial: string;
  rfc: string;
  email: string;
  honorarios: number;
  historialHonorarios: HistorialHonorario[];
  fechaPago: string;
  estado: string;
  activo: boolean;
  inicioMes: number;
  inicioAnio: string;
  pagosRealizados: PagoRealizado[];
  esPersonaMoral: boolean;
  /** Clave SAT del régimen fiscal del cliente (ej. "626" para RESICO PF). */
  regimenFiscalClave?: string;
  /** Opinión 32-D, CSF y documentos SAT para el portal. */
  satPortal?: SatPortalCliente;
  /** Cliente contenedor para ingresos sin contrato mensual recurrente. */
  esIngresoGeneral?: boolean;
  /** Categorías de impuestos que aplican en cumplimiento. */
  configCumplimiento?: ConfigCumplimientoCliente;
  /** Si el cliente está sujeto a REPSE (ICSOE/SISUB cuatrimestral). */
  configRepse?: ConfigRepseCliente;
  /** Descuentos puntuales aplicados a meses específicos. */
  descuentos?: Descuento[];
  /**
   * Años en los que ya se le envió la felicitación de cumpleaños.
   * Evita envíos duplicados durante el mismo año.
   */
  cumpleNotificadoAnios?: number[];
};

/** Nombres cortos de mes para mostrar fechas tipo "05 ENE 96". */
const MES_CORTO = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

/**
 * Extrae la fecha de nacimiento del RFC de una Persona Física.
 * RFC PF: 4 letras + YYMMDD + 3 chars. Devuelve null si:
 *  - es PM (no hay fecha de nacimiento real)
 *  - el RFC está incompleto o malformado
 *  - los 6 dígitos no forman una fecha válida (e.g. 35/02/XX)
 *
 * Para el siglo se aplica una heurística: si YY ≤ año-actual %100, asumimos
 * el siglo 2000; si no, el 1900. Funciona bien para gente entre 0 y 99 años.
 */
export function fechaNacimientoDeRFC(
  rfc: string | undefined | null,
  esPersonaMoral: boolean | undefined
): { mes: number; dia: number; anio: number } | null {
  if (esPersonaMoral === true) return null;
  if (!rfc) return null;
  const limpio = String(rfc).replace(/\s+/g, "").toUpperCase();
  const m = limpio.match(/^[A-ZÑ&]{4}(\d{2})(\d{2})(\d{2})/);
  if (!m) return null;
  const yy = Number(m[1]);
  const mes = Number(m[2]) - 1;
  const dia = Number(m[3]);
  if (mes < 0 || mes > 11 || dia < 1 || dia > 31) return null;
  const cortoActual = new Date().getFullYear() % 100;
  const anio = yy <= cortoActual ? 2000 + yy : 1900 + yy;
  const probada = new Date(anio, mes, dia);
  if (
    probada.getFullYear() !== anio ||
    probada.getMonth() !== mes ||
    probada.getDate() !== dia
  ) {
    return null;
  }
  return { mes, dia, anio };
}

/** Formatea una fecha de nacimiento como "05 ENE 96". */
export function formatearFechaNacimientoCorta(
  fecha: { mes: number; dia: number; anio: number }
): string {
  const dd = String(fecha.dia).padStart(2, "0");
  const mmm = MES_CORTO[fecha.mes] ?? "—";
  const yy = String(fecha.anio).slice(-2);
  return `${dd} ${mmm} ${yy}`;
}

/** Estado del cumpleaños relativo a "hoy" (usa zona horaria del navegador). */
export type EstadoCumpleanos =
  | "sin_fecha"
  | "otro_mes"
  | "mes_actual"
  | "hoy"
  | "ya_notificado";

export function estadoCumpleanos(
  c: Pick<Cliente, "rfc" | "esPersonaMoral" | "cumpleNotificadoAnios">,
  hoy: Date = new Date()
): EstadoCumpleanos {
  const fecha = fechaNacimientoDeRFC(c.rfc, c.esPersonaMoral);
  if (!fecha) return "sin_fecha";
  const mesActual = hoy.getMonth();
  const diaActual = hoy.getDate();
  const anioActual = hoy.getFullYear();
  if ((c.cumpleNotificadoAnios ?? []).includes(anioActual)) {
    return "ya_notificado";
  }
  if (fecha.mes !== mesActual) return "otro_mes";
  if (fecha.dia === diaActual) return "hoy";
  return "mes_actual";
}

export const ID_INGRESOS_DIVERSOS = 900001;

export const CLIENTE_INGRESOS_DIVERSOS: Cliente = {
  id: ID_INGRESOS_DIVERSOS,
  razonSocial: "Ingresos diversos",
  rfc: "ING-GENERAL",
  email: "",
  honorarios: 0,
  historialHonorarios: [],
  fechaPago: "01",
  estado: "AL CORRIENTE",
  activo: true,
  inicioMes: 0,
  inicioAnio: "2020",
  pagosRealizados: [],
  esPersonaMoral: true,
  esIngresoGeneral: true,
};

export function esIngresoGeneralCliente(client: Cliente): boolean {
  return client.esIngresoGeneral === true || client.id === ID_INGRESOS_DIVERSOS;
}

export function esClienteRecurrente(client: Cliente): boolean {
  return client.activo && !esIngresoGeneralCliente(client);
}

/**
 * Estado inicial del CRM: sin clientes de demo.
 * Sólo se conserva el cliente especial "Ingresos diversos" (lo agrega
 * `asegurarClienteIngresosDiversos` cuando la lista llega vacía).
 */
export const CLIENTES_INICIALES: Cliente[] = [];

export function getHonorarioVigente(client: Cliente, mesIndex: number): number {
  const historial = client.historialHonorarios?.length
    ? client.historialHonorarios
    : [{ mes: client.inicioMes, monto: client.honorarios }];
  const vigente = [...historial]
    .filter((h) => h.mes <= mesIndex)
    .sort((a, b) => b.mes - a.mes)[0];
  return vigente?.monto ?? client.honorarios;
}

export function aplicarCambioHonorarios(
  client: Cliente,
  nuevoMonto: number,
  mesDesde: number
): Cliente {
  let historial = client.historialHonorarios?.length
    ? [...client.historialHonorarios]
    : [{ mes: client.inicioMes, monto: client.honorarios }];
  if (nuevoMonto === getHonorarioVigente(client, mesDesde)) {
    return { ...client, honorarios: nuevoMonto, historialHonorarios: historial };
  }
  const idx = historial.findIndex((h) => h.mes === mesDesde);
  if (idx >= 0) historial[idx] = { mes: mesDesde, monto: nuevoMonto };
  else historial = [...historial, { mes: mesDesde, monto: nuevoMonto }].sort((a, b) => a.mes - b.mes);
  return { ...client, honorarios: nuevoMonto, historialHonorarios: historial };
}

/** Compromiso bruto del mes según el honorario vigente (sin descuentos). */
export function getCompromisoBrutoMes(client: Cliente, periodo: Periodo): number {
  if (esIngresoGeneralCliente(client)) return 0;
  return getHonorarioVigente(client, periodo.mes);
}

/** Descuento aplicado al mes/año (si existe). */
export function getDescuentoMes(
  client: Cliente,
  periodo: Periodo
): Descuento | undefined {
  if (!client.descuentos?.length) return undefined;
  const anio = periodoAnioStr(periodo);
  return client.descuentos.find(
    (d) => d.mes === periodo.mes && d.anio === anio
  );
}

/** Monto del descuento aplicado al mes (en pesos), calculado sobre el honorario vigente. */
export function getMontoDescuento(client: Cliente, periodo: Periodo): number {
  const d = getDescuentoMes(client, periodo);
  if (!d) return 0;
  if (d.tipo === "monto") return Math.max(0, d.valor);
  const bruto = getCompromisoBrutoMes(client, periodo);
  return Math.max(0, Math.round((bruto * d.valor) / 100));
}

/** Compromiso real (bruto - descuento). */
export function getCompromisoMes(client: Cliente, periodo: Periodo): number {
  const bruto = getCompromisoBrutoMes(client, periodo);
  return Math.max(0, bruto - getMontoDescuento(client, periodo));
}

/** Devuelve los pagos del mes/año (solo de honorarios; los adicionales viven aparte). */
function pagosHonorariosMes(
  client: Cliente,
  periodo: Periodo
): PagoRealizado[] {
  const anio = periodoAnioStr(periodo);
  return client.pagosRealizados.filter(
    (p) =>
      p.mes === periodo.mes &&
      p.anio === anio &&
      (p.tipo === "honorarios" || !p.tipo)
  );
}

export function getNotaPago(client: Cliente, periodo: Periodo): string | undefined {
  return pagosHonorariosMes(client, periodo)[0]?.nota;
}

export function getMontoPagado(client: Cliente, periodo: Periodo): number {
  return pagosHonorariosMes(client, periodo).reduce(
    (acc, p) => acc + p.monto,
    0
  );
}

/** Suma de servicios adicionales registrados a un cliente en un mes. */
export function getMontoAdicionalMes(client: Cliente, periodo: Periodo): number {
  const anio = periodoAnioStr(periodo);
  return client.pagosRealizados
    .filter((p) => p.mes === periodo.mes && p.anio === anio && p.tipo === "adicional")
    .reduce((acc, p) => acc + p.monto, 0);
}

/** Lista detallada de servicios adicionales del año (para el panel del cliente). */
export function getServiciosAdicionalesAnio(
  client: Cliente,
  anio: number | string
): PagoRealizado[] {
  const a = String(anio);
  return client.pagosRealizados
    .filter((p) => p.tipo === "adicional" && p.anio === a)
    .sort((x, y) => y.mes - x.mes);
}

/** Suma total de adicionales del año (para KPI). */
export function getTotalAdicionalesAnio(
  client: Cliente,
  anio: number | string
): number {
  return getServiciosAdicionalesAnio(client, anio).reduce(
    (acc, p) => acc + p.monto,
    0
  );
}

/** Suma total de pagos de honorarios del cliente (todos los años). */
export function getTotalHonorariosCliente(client: Cliente): number {
  return client.pagosRealizados
    .filter((p) => p.tipo === "honorarios" || !p.tipo)
    .reduce((acc, p) => acc + p.monto, 0);
}

/** Suma total de servicios adicionales del cliente (todos los años). */
export function getTotalAdicionalesCliente(client: Cliente): number {
  return client.pagosRealizados
    .filter((p) => p.tipo === "adicional")
    .reduce((acc, p) => acc + p.monto, 0);
}

/** Suma de servicios adicionales cobrados en un periodo (todos los clientes). */
export function sumarAdicionalesPeriodo(
  clientes: Cliente[],
  periodo: Periodo
): number {
  return clientes.reduce(
    (acc, c) => acc + getMontoAdicionalMes(c, periodo),
    0
  );
}

/** Suma de descuentos aplicados a un periodo (clientes activos en ese mes). */
export function sumarDescuentosPeriodo(
  clientes: Cliente[],
  periodo: Periodo
): number {
  return clientes.reduce((acc, c) => {
    if (!c.activo || esIngresoGeneralCliente(c)) return acc;
    if (!clienteActivoEnPeriodo(c, periodo)) return acc;
    return acc + getMontoDescuento(c, periodo);
  }, 0);
}

/** Suma total de descuentos del año (para KPI). */
export function getTotalDescuentosAnio(
  client: Cliente,
  anio: number | string
): number {
  if (!client.descuentos?.length) return 0;
  const a = String(anio);
  return client.descuentos
    .filter((d) => d.anio === a)
    .reduce(
      (acc, d) => acc + getMontoDescuento(client, { mes: d.mes, anio: Number(d.anio) }),
      0
    );
}

export function getSaldoMes(client: Cliente, periodo: Periodo): number {
  return Math.max(0, getCompromisoMes(client, periodo) - getMontoPagado(client, periodo));
}

/** Mes cubierto al 100% (o sin compromiso activo). */
export function estaPagado(client: Cliente, periodo: Periodo): boolean {
  if (!clienteActivoEnPeriodo(client, periodo)) return true;
  return getSaldoMes(client, periodo) === 0;
}

export function tienePagoParcial(client: Cliente, periodo: Periodo): boolean {
  const pagado = getMontoPagado(client, periodo);
  return pagado > 0 && getSaldoMes(client, periodo) > 0;
}

export type MesCobrable = {
  periodo: Periodo;
  label: string;
  compromiso: number;
  pagado: number;
  saldo: number;
  pagadoCompleto: boolean;
  parcial: boolean;
};

export function listarMesesCobrables(client: Cliente, hasta: Periodo): MesCobrable[] {
  const meses: MesCobrable[] = [];
  let y = Number(client.inicioAnio);
  let m = client.inicioMes;
  const hastaKey = periodoKey(hasta);

  while (y * 12 + m <= hastaKey) {
    const p: Periodo = { mes: m, anio: y };
    const compromiso = getCompromisoMes(client, p);
    const pagado = getMontoPagado(client, p);
    const saldo = Math.max(0, compromiso - pagado);
    meses.push({
      periodo: p,
      label: periodoLabel(p),
      compromiso,
      pagado,
      saldo,
      pagadoCompleto: saldo === 0 && pagado > 0,
      parcial: pagado > 0 && saldo > 0,
    });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return meses;
}

/** Meses con saldo pendiente hasta el periodo indicado (para historial en correos y portal). */
export function listarMesesImpagos(client: Cliente, hasta: Periodo): MesCobrable[] {
  return listarMesesCobrables(client, hasta).filter((m) => m.saldo > 0);
}

export type EstadoCliente = "INACTIVO" | "AL CORRIENTE" | "PENDIENTE" | "ATRASADO";

/**
 * AL CORRIENTE: todos los meses hasta el periodo están pagados.
 * PENDIENTE: solo el mes del periodo consultado está pendiente.
 * ATRASADO: 2+ meses pendientes, o 1 mes pendiente anterior al periodo.
 */
export function calcularEstado(
  client: Cliente,
  referencia: Periodo = getPeriodoHoy()
): EstadoCliente {
  if (!client.activo) return "INACTIVO";
  if (esIngresoGeneralCliente(client)) return "AL CORRIENTE";
  if (!clienteActivoEnPeriodo(client, referencia)) return "AL CORRIENTE";

  const mesesImpagos: Periodo[] = [];
  let y = Number(client.inicioAnio);
  let m = client.inicioMes;
  const refKey = periodoKey(referencia);

  while (y * 12 + m <= refKey) {
    const p: Periodo = { mes: m, anio: y };
    if (!estaPagado(client, p)) mesesImpagos.push(p);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }

  if (mesesImpagos.length === 0) return "AL CORRIENTE";
  if (mesesImpagos.length >= 2) return "ATRASADO";

  const unicoImpago = mesesImpagos[0];
  if (periodoKey(unicoImpago) === refKey) return "PENDIENTE";
  return "ATRASADO";
}

export function getTotalPendiente(client: Cliente, hasta: Periodo): number {
  if (!clienteActivoEnPeriodo(client, hasta)) return 0;

  let total = 0;
  let y = Number(client.inicioAnio);
  let m = client.inicioMes;
  const hastaKey = periodoKey(hasta);

  while (y * 12 + m <= hastaKey) {
    const p: Periodo = { mes: m, anio: y };
    total += getSaldoMes(client, p);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return total;
}

export function getMontoMes(client: Cliente, periodo: Periodo): number {
  const pagado = getMontoPagado(client, periodo);
  if (pagado > 0) return pagado;
  return getCompromisoMes(client, periodo);
}

export function generarAniosDisponibles(): number[] {
  const actual = getPeriodoHoy().anio;
  const anios: number[] = [];
  for (let a = actual - 2; a <= actual + 1; a++) anios.push(a);
  return anios;
}

export function asegurarClienteIngresosDiversos(clientes: Cliente[]): Cliente[] {
  const vistos = new Set<number>();
  const reales: Cliente[] = [];
  for (const c of clientes) {
    if (!c || typeof c.id !== "number") continue;
    if (esIngresoGeneralCliente(c)) continue;
    if (vistos.has(c.id)) continue;
    vistos.add(c.id);
    reales.push(c);
  }
  return [CLIENTE_INGRESOS_DIVERSOS, ...reales];
}
