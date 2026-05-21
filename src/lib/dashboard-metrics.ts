import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  getPeriodoHoy,
  clienteActivoEnPeriodo,
  getCompromisoMes,
  getMontoPagado,
  getSaldoMes,
  estaPagado,
  calcularEstado,
  getTotalPendiente,
  periodoKey,
  esClienteRecurrente,
  esIngresoGeneralCliente,
} from "@/lib/clientes";
import {
  type FacturaPago,
  sumarFacturadoPeriodo,
  sumarFacturadoAnual,
  getFacturaPeriodo,
} from "@/lib/facturas";

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export type MesResumenAnual = {
  mes: number;
  label: string;
  compromiso: number;
  cobrado: number;
  pendiente: number;
  enCurso: boolean;
};

export type KpisDashboard = {
  compromisoMes: number;
  cobradoMes: number;
  porCobrarMes: number;
  pendienteAcumulado: number;
  clientesActivos: number;
  clientesCorrientes: number;
  clientesPendientes: number;
  clientesAtrasados: number;
  tasaCobranzaMes: number;
  tasaCobranzaAnual: number;
  cobradoAnual: number;
  compromisoAnual: number;
  pendienteAnual: number;
  facturadoMes: number;
  facturadoAnual: number;
  /** Cobrado en el mes que aún no se ha facturado. */
  pendienteFacturarMes: number;
  /** Cantidad de meses-cliente pagados sin factura emitida en el mes en curso. */
  pagosSinFacturaMes: number;
};

export type PagoSinFactura = {
  cliente: Cliente;
  periodo: Periodo;
  monto: number;
};

export type MorosoDashboard = {
  cliente: Cliente;
  pendiente: number;
  estado: ReturnType<typeof calcularEstado>;
};

export type AnioCrecimientoClientes = {
  anio: number;
  nuevos: number;
  acumulado: number;
};

export type MesCrecimientoClientes = {
  mes: number;
  label: string;
  nuevos: number;
};

export type SerieCrecimientoAnual = {
  anio: number;
  meses: MesCrecimientoClientes[];
  totalAnio: number;
};

export type CrecimientoMensualComparado = {
  actual: SerieCrecimientoAnual;
  anterior: SerieCrecimientoAnual;
  variacionPct: number;
};

function clientesActivos(clientes: Cliente[]): Cliente[] {
  return clientes.filter((c) => c.activo && !esIngresoGeneralCliente(c));
}

function ultimoMesIncluido(anio: number, hoy: Periodo): number {
  if (anio < hoy.anio) return 11;
  if (anio > hoy.anio) return -1;
  return hoy.mes;
}

export function calcularResumenAnual(
  clientes: Cliente[],
  anio: number,
  referencia = getPeriodoHoy()
): MesResumenAnual[] {
  const ultimoMes = ultimoMesIncluido(anio, referencia);
  if (ultimoMes < 0) return [];

  return MESES_CORTOS.map((label, mes) => {
    const p: Periodo = { mes, anio };
    const enCurso = mes <= ultimoMes;

    if (!enCurso) {
      return { mes, label, compromiso: 0, cobrado: 0, pendiente: 0, enCurso: false };
    }

    let compromiso = 0;
    let cobrado = 0;
    clientes.forEach((c) => {
      if (!c.activo || !clienteActivoEnPeriodo(c, p)) return;
      compromiso += getCompromisoMes(c, p);
      cobrado += getMontoPagado(c, p);
    });

    return {
      mes,
      label,
      compromiso,
      cobrado,
      pendiente: Math.max(0, compromiso - cobrado),
      enCurso: true,
    };
  });
}

export function calcularKpisDashboard(
  clientes: Cliente[],
  periodo: Periodo,
  referencia = getPeriodoHoy(),
  facturas: FacturaPago[] = []
): KpisDashboard {
  const activos = clientesActivos(clientes);
  let compromisoMes = 0;
  let cobradoMes = 0;
  let porCobrarMes = 0;
  let pendienteAcumulado = 0;
  let clientesCorrientes = 0;
  let clientesPendientes = 0;
  let clientesAtrasados = 0;

  activos.forEach((c) => {
    if (!clienteActivoEnPeriodo(c, periodo)) return;
    const compromiso = getCompromisoMes(c, periodo);
    const pagado = getMontoPagado(c, periodo);
    compromisoMes += compromiso;
    cobradoMes += pagado;
    if (!estaPagado(c, periodo)) porCobrarMes += getSaldoMes(c, periodo) || compromiso;
    pendienteAcumulado += getTotalPendiente(c, periodo);

    const estado = calcularEstado(c, periodo);
    if (estado === "AL CORRIENTE") clientesCorrientes += 1;
    else if (estado === "PENDIENTE") clientesPendientes += 1;
    else if (estado === "ATRASADO") clientesAtrasados += 1;
  });

  clientes.forEach((c) => {
    if (!c.activo || !esIngresoGeneralCliente(c) || !clienteActivoEnPeriodo(c, periodo))
      return;
    cobradoMes += getMontoPagado(c, periodo);
  });

  const mesesAnio = calcularResumenAnual(clientes, periodo.anio, referencia).filter((m) => m.enCurso);
  const compromisoAnual = mesesAnio.reduce((a, m) => a + m.compromiso, 0);
  const cobradoAnual = mesesAnio.reduce((a, m) => a + m.cobrado, 0);
  const pendienteAnual = mesesAnio.reduce((a, m) => a + m.pendiente, 0);

  const tasaCobranzaMes =
    compromisoMes > 0 ? Math.round((cobradoMes / compromisoMes) * 100) : 100;
  const tasaCobranzaAnual =
    compromisoAnual > 0 ? Math.round((cobradoAnual / compromisoAnual) * 100) : 100;

  const facturadoMes = sumarFacturadoPeriodo(facturas, periodo);
  const facturadoAnual = sumarFacturadoAnual(facturas, periodo.anio);
  const pendienteFacturarMes = Math.max(0, cobradoMes - facturadoMes);
  const pagosSinFacturaMes = listarPagosSinFactura(clientes, periodo, facturas).length;

  return {
    compromisoMes,
    cobradoMes,
    porCobrarMes,
    pendienteAcumulado,
    clientesActivos: activos.filter((c) => clienteActivoEnPeriodo(c, periodo)).length,
    clientesCorrientes,
    clientesPendientes,
    clientesAtrasados,
    tasaCobranzaMes,
    tasaCobranzaAnual,
    cobradoAnual,
    compromisoAnual,
    pendienteAnual,
    facturadoMes,
    facturadoAnual,
    pendienteFacturarMes,
    pagosSinFacturaMes,
  };
}

/**
 * Clientes que en el periodo dado tienen un pago registrado pero no han recibido factura.
 * El "monto" es lo que se cobró ese mes (referencia para facturar).
 */
export function listarPagosSinFactura(
  clientes: Cliente[],
  periodo: Periodo,
  facturas: FacturaPago[]
): PagoSinFactura[] {
  const resultado: PagoSinFactura[] = [];
  clientes.forEach((c) => {
    if (!c.activo || !clienteActivoEnPeriodo(c, periodo)) return;
    const pagado = getMontoPagado(c, periodo);
    if (pagado <= 0) return;
    const factura = getFacturaPeriodo(facturas, c.id, periodo);
    if (factura) return;
    resultado.push({ cliente: c, periodo, monto: pagado });
  });
  return resultado.sort((a, b) => b.monto - a.monto);
}

export function listarPrincipalesMorosos(
  clientes: Cliente[],
  periodo: Periodo,
  limite = 5
): MorosoDashboard[] {
  return clientesActivos(clientes)
    .map((c) => ({
      cliente: c,
      pendiente: getTotalPendiente(c, periodo),
      estado: calcularEstado(c, periodo),
    }))
    .filter((m) => m.pendiente > 0)
    .sort((a, b) => b.pendiente - a.pendiente)
    .slice(0, limite);
}

export function etiquetaPeriodoDashboard(periodo: Periodo): string {
  return `${MESES_NOM[periodo.mes]} ${periodo.anio}`;
}

export function esPeriodoActual(periodo: Periodo, hoy = getPeriodoHoy()): boolean {
  return periodoKey(periodo) === periodoKey(hoy);
}

/** Nuevos clientes recurrentes por año de inicio y total acumulado. */
export function calcularCrecimientoClientes(
  clientes: Cliente[],
  hastaAnio?: number
): AnioCrecimientoClientes[] {
  const limite = hastaAnio ?? getPeriodoHoy().anio;
  const recurrentes = clientes.filter(esClienteRecurrente);
  if (recurrentes.length === 0) return [];

  const anioMin = Math.min(...recurrentes.map((c) => Number(c.inicioAnio)));
  const resultado: AnioCrecimientoClientes[] = [];
  let acumulado = 0;

  for (let anio = anioMin; anio <= limite; anio++) {
    const nuevos = recurrentes.filter((c) => Number(c.inicioAnio) === anio).length;
    acumulado += nuevos;
    resultado.push({ anio, nuevos, acumulado });
  }

  return resultado;
}

const MESES_CRECIMIENTO = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function serieCrecimientoPorAnio(clientes: Cliente[], anio: number): SerieCrecimientoAnual {
  const recurrentes = clientes.filter(esClienteRecurrente);
  const meses = MESES_CRECIMIENTO.map((label, mes) => ({
    mes,
    label,
    nuevos: recurrentes.filter(
      (c) => Number(c.inicioAnio) === anio && c.inicioMes === mes
    ).length,
  }));
  return {
    anio,
    meses,
    totalAnio: meses.reduce((a, m) => a + m.nuevos, 0),
  };
}

/** Altas mensuales del año en curso vs año anterior (para gráfica comparativa). */
export function calcularCrecimientoMensual(
  clientes: Cliente[],
  anio: number
): CrecimientoMensualComparado {
  const actual = serieCrecimientoPorAnio(clientes, anio);
  const anterior = serieCrecimientoPorAnio(clientes, anio - 1);
  const variacionPct =
    anterior.totalAnio > 0
      ? Math.round(((actual.totalAnio - anterior.totalAnio) / anterior.totalAnio) * 100)
      : actual.totalAnio > 0
        ? 100
        : 0;
  return { actual, anterior, variacionPct };
}
