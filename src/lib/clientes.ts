import type { ConfigCumplimientoCliente } from "@/lib/config-cumplimiento-cliente";

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
};
export type HistorialHonorario = { mes: number; monto: number };

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
  /** Cliente contenedor para ingresos sin contrato mensual recurrente. */
  esIngresoGeneral?: boolean;
  /** Categorías de impuestos que aplican en cumplimiento. */
  configCumplimiento?: ConfigCumplimientoCliente;
};

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

export function getCompromisoMes(client: Cliente, periodo: Periodo): number {
  if (esIngresoGeneralCliente(client)) return 0;
  return getHonorarioVigente(client, periodo.mes);
}

export function getNotaPago(client: Cliente, periodo: Periodo): string | undefined {
  const anio = periodoAnioStr(periodo);
  return client.pagosRealizados.find(
    (p) => p.mes === periodo.mes && p.anio === anio
  )?.nota;
}

export function getMontoPagado(client: Cliente, periodo: Periodo): number {
  const anio = periodoAnioStr(periodo);
  const pago = client.pagosRealizados.find(
    (p) => p.mes === periodo.mes && p.anio === anio
  );
  return pago?.monto ?? 0;
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
