import {
  calcularEstado,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
  estaPagado,
  formatFechaIso,
  getCompromisoMes,
  getMontoPagado,
  getSaldoMes,
  getTotalAtrasado,
  getTotalDeudaPendiente,
  type Cliente,
  type EstadoCliente,
  type Periodo,
} from "@/lib/clientes";
import { getFechaLimiteDate } from "@/lib/correo";
import { pctSafe } from "@/lib/dashboard-anillos";
import { getFacturaPeriodo, type FacturaPago } from "@/lib/facturas";

export type SemaforoCobro =
  | "vencido"
  | "vence_hoy"
  | "vigente"
  | "al_corriente";

export const SEMAFORO_ORDEN: Record<SemaforoCobro, number> = {
  vencido: 0,
  vence_hoy: 1,
  vigente: 2,
  al_corriente: 3,
};

export const SEMAFORO_LABEL: Record<SemaforoCobro, string> = {
  vencido: "Vencido",
  vence_hoy: "Vence hoy",
  vigente: "Vigente",
  al_corriente: "Al corriente",
};

export const SEMAFORO_CLASE: Record<SemaforoCobro, string> = {
  vencido: "bg-slate-100 text-slate-800",
  vence_hoy: "bg-slate-100 text-slate-700",
  vigente: "bg-slate-50 text-slate-600",
  al_corriente: "bg-slate-50 text-slate-500",
};

function inicioDia(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function clasificarSemaforoCobro(
  cliente: Cliente,
  periodo: Periodo,
  hoy = new Date()
): SemaforoCobro {
  const pendiente = getTotalDeudaPendiente(cliente, periodo);
  if (pendiente <= 0) return "al_corriente";

  if (getTotalAtrasado(cliente, periodo) > 0) return "vencido";

  const saldoMes = getSaldoMes(cliente, periodo);
  if (saldoMes <= 0) return "vigente";

  const limite = getFechaLimiteDate(cliente, periodo);
  const hoyT = inicioDia(hoy);
  const limT = inicioDia(limite);
  if (hoyT > limT) return "vencido";
  if (hoyT === limT) return "vence_hoy";
  return "vigente";
}

export function labelFechaCobro(cliente: Cliente, periodo: Periodo): string {
  const limite = getFechaLimiteDate(cliente, periodo);
  const iso = `${limite.getFullYear()}-${String(limite.getMonth() + 1).padStart(2, "0")}-${String(limite.getDate()).padStart(2, "0")}`;
  return formatFechaIso(iso);
}

export type FilaCobroManual = {
  cliente: Cliente;
  monto: number;
  /** Honorarios del periodo abierto (aunque el cliente también deba atrás). */
  saldoMes: number;
  /** Honorarios de meses anteriores + extras. */
  atrasado: number;
  semaforo: SemaforoCobro;
  fechaLabel: string;
  estado: EstadoCliente;
};

export function listarFilasCobroManual(
  clientes: Cliente[],
  periodo: Periodo,
  hoy = new Date()
): FilaCobroManual[] {
  const filas: FilaCobroManual[] = [];
  for (const cliente of clientes) {
    if (!cliente.activo) continue;
    if (esIngresoGeneralCliente(cliente)) continue;
    if (!clienteActivoEnPeriodo(cliente, periodo)) continue;
    const monto = getTotalDeudaPendiente(cliente, periodo);
    if (monto <= 0) continue;
    const saldoMes = getSaldoMes(cliente, periodo);
    filas.push({
      cliente,
      monto,
      saldoMes,
      atrasado: Math.max(0, monto - saldoMes),
      semaforo: clasificarSemaforoCobro(cliente, periodo, hoy),
      fechaLabel: labelFechaCobro(cliente, periodo),
      estado: calcularEstado(cliente, periodo),
    });
  }
  filas.sort((a, b) => {
    const s = SEMAFORO_ORDEN[a.semaforo] - SEMAFORO_ORDEN[b.semaforo];
    if (s !== 0) return s;
    return a.cliente.razonSocial.localeCompare(b.cliente.razonSocial, "es");
  });
  return filas;
}

export type KpisCobroManual = {
  porCobrar: number;
  vigente: number;
  vencido: number;
  pctVencido: number;
  venceHoy: number;
};

export function kpisCobroManual(filas: FilaCobroManual[]): KpisCobroManual {
  let porCobrar = 0;
  let vigente = 0;
  let vencido = 0;
  let venceHoy = 0;
  for (const f of filas) {
    porCobrar += f.monto;
    vigente += f.saldoMes;
    vencido += f.atrasado;
    if (f.semaforo === "vence_hoy") venceHoy += f.saldoMes;
  }
  const pctVencido = porCobrar > 0 ? Math.round((vencido / porCobrar) * 100) : 0;
  return { porCobrar, vigente, vencido, pctVencido, venceHoy };
}

export type AnillosCobroManual = {
  cartera: number;
  pagaron: number;
  facturados: number;
  alDia: number;
  cobrado: number;
  compromiso: number;
  tasa: number;
};

/** Mismos velocímetros que Cobranza: cartera del periodo, no solo deudores. */
export function resumirAnillosCobroManual(
  clientes: Cliente[],
  periodo: Periodo,
  facturas: FacturaPago[]
): AnillosCobroManual {
  let cartera = 0;
  let pagaron = 0;
  let facturados = 0;
  let atrasados = 0;
  let cobrado = 0;
  let compromiso = 0;
  for (const c of clientes) {
    if (!c.activo) continue;
    if (esIngresoGeneralCliente(c)) continue;
    if (!clienteActivoEnPeriodo(c, periodo)) continue;
    cartera += 1;
    compromiso += getCompromisoMes(c, periodo);
    cobrado += getMontoPagado(c, periodo);
    if (estaPagado(c, periodo)) pagaron += 1;
    if (getFacturaPeriodo(facturas, c.id, periodo)) facturados += 1;
    if (calcularEstado(c, periodo) === "ATRASADO") atrasados += 1;
  }
  return {
    cartera,
    pagaron,
    facturados,
    alDia: Math.max(0, cartera - atrasados),
    cobrado,
    compromiso,
    tasa: pctSafe(cobrado, compromiso),
  };
}
