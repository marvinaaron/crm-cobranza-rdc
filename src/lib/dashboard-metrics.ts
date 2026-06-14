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
  getTotalAtrasado,
  getMesesAtraso,
  periodoKey,
  esClienteRecurrente,
  esIngresoGeneralCliente,
  sumarAdicionalesPeriodo,
  sumarExtraPorCobrar,
  sumarDescuentosPeriodo,
  getMontoDescuento,
  getMontoAdicionalMes,
  sumarIngresoBancarioPeriodo,
  periodoBancarioDePago,
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
  /** Saldo de meses ANTERIORES al periodo (deuda vencida, no incluye el mes en curso). */
  atrasadoMonto: number;
  /**
   * Por cobrar del mes que ya pasó su `fechaPago` (clientes que debieron
   * pagar y no han pagado). Incluye solo saldo del mes en curso.
   */
  vencidoMesMonto: number;
  /**
   * Por cobrar del mes cuyo `fechaPago` aún no ha llegado (pago futuro
   * esperado dentro del mes).
   */
  porVencerMesMonto: number;
  clientesVencidosMes: number;
  clientesPorVencerMes: number;
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
  /**
   * Dinero que ENTRÓ al banco en el mes calendario (por `fechaPago`), sin
   * importar a qué periodo de honorarios se aplicó. Es la vista de caja: un
   * pago de mayo recibido en junio cuenta en junio.
   */
  ingresoBancarioMes: number;
  /** Ingreso bancario acumulado del año en curso. */
  ingresoBancarioAnual: number;
  /**
   * Ingreso bancario del mes que aún no se ha facturado. Sigue el flujo de
   * efectivo: se basa en el dinero recibido este mes sin factura emitida.
   */
  pendienteFacturarMes: number;
  /** Cantidad de clientes con ingreso bancario del mes sin factura emitida. */
  pagosSinFacturaMes: number;
  /** Servicios adicionales cobrados en el periodo (no honorarios). */
  adicionalesMes: number;
  /** Saldo pendiente de extras esperados (cartera, sin mes). */
  extraPorCobrar: number;
  /** Descuentos aplicados al compromiso del periodo. */
  descuentosMes: number;
};

/** Aging: saldo agrupado por antigüedad de la deuda. */
export type AgingCartera = {
  enCurso: number; // mes actual
  d1_30: number;   // 1 mes vencido
  d31_60: number;  // 2 meses vencidos
  d61_plus: number; // 3+ meses vencidos
  total: number;
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
      if (!c.activo) return;
      // Lo ESPERADO (y los honorarios cobrados) solo cuentan cuando el
      // cliente está activo ese mes; no inventamos esperado en meses
      // previos al inicio de la relación.
      if (clienteActivoEnPeriodo(c, p)) {
        compromiso += getCompromisoMes(c, p);
        cobrado += getMontoPagado(c, p);
      }
      // Los ingresos adicionales (servicios extra y meses atrasados que se
      // cobran a tarifa distinta) son dinero EFECTIVAMENTE cobrado: suman al
      // cobrado aunque sean de meses anteriores al inicio, SIN tocar lo
      // esperado. Así la línea de cobrado puede rebasar a la de esperado.
      cobrado += getMontoAdicionalMes(c, p);
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
  let atrasadoMonto = 0;
  let vencidoMesMonto = 0;
  let porVencerMesMonto = 0;
  let clientesVencidosMes = 0;
  let clientesPorVencerMes = 0;
  let clientesCorrientes = 0;
  let clientesPendientes = 0;
  let clientesAtrasados = 0;

  // Día del calendario al que comparamos `fechaPago` para clasificar
  // "vencido vs por vencer" del mes en curso. Solo aplica cuando el
  // periodo es el mes actual; en periodos pasados todo cuenta como
  // vencido y en futuros todo cuenta como por vencer.
  const hoy = new Date();
  const esMesActual =
    periodo.mes === hoy.getMonth() && periodo.anio === hoy.getFullYear();
  const esMesFuturo =
    periodo.anio > hoy.getFullYear() ||
    (periodo.anio === hoy.getFullYear() && periodo.mes > hoy.getMonth());
  const diaHoy = hoy.getDate();

  activos.forEach((c) => {
    if (!clienteActivoEnPeriodo(c, periodo)) return;
    const compromiso = getCompromisoMes(c, periodo);
    const pagado = getMontoPagado(c, periodo);
    const saldo = getSaldoMes(c, periodo);
    compromisoMes += compromiso;
    cobradoMes += pagado;
    if (!estaPagado(c, periodo)) porCobrarMes += saldo || compromiso;
    pendienteAcumulado += getTotalPendiente(c, periodo);
    atrasadoMonto += getTotalAtrasado(c, periodo);

    if (saldo > 0) {
      const diaPago = Number(c.fechaPago) || 1;
      const yaVencio = esMesActual
        ? diaHoy > diaPago
        : esMesFuturo
          ? false
          : true; // periodo pasado → todo vencido
      if (yaVencio) {
        vencidoMesMonto += saldo;
        clientesVencidosMes += 1;
      } else {
        porVencerMesMonto += saldo;
        clientesPorVencerMes += 1;
      }
    }

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

  // Los ingresos adicionales (servicios extra a clientes y meses atrasados)
  // se cuentan como cobrado del mes —pueden hacer que el cobrado rebase lo
  // esperado— sin alterar el compromiso/esperado del periodo.
  cobradoMes += sumarAdicionalesPeriodo(clientes, periodo);

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

  // Ingreso bancario (caja): dinero que ENTRÓ este mes calendario por
  // `fechaPago`, sin importar el periodo de honorarios al que se aplicó.
  const ingresoBancarioMes = sumarIngresoBancarioPeriodo(clientes, periodo);
  const ultimoMesBanco = ultimoMesIncluido(periodo.anio, referencia);
  let ingresoBancarioAnual = 0;
  for (let m = 0; m <= ultimoMesBanco; m++) {
    ingresoBancarioAnual += sumarIngresoBancarioPeriodo(clientes, {
      mes: m,
      anio: periodo.anio,
    });
  }

  // Facturación según flujo de efectivo: "falta facturar" = dinero recibido
  // este mes (por fechaPago) sin factura emitida para el periodo del pago.
  const pagosSinFacturaBancario = listarPagosSinFacturaBancario(
    clientes,
    periodo,
    facturas
  );
  const pendienteFacturarMes = pagosSinFacturaBancario.reduce(
    (s, p) => s + p.monto,
    0
  );
  const pagosSinFacturaMes = pagosSinFacturaBancario.length;
  const adicionalesMes = sumarAdicionalesPeriodo(clientes, periodo);
  const extraPorCobrar = sumarExtraPorCobrar(clientes);
  const descuentosMes = sumarDescuentosPeriodo(clientes, periodo);

  return {
    compromisoMes,
    cobradoMes,
    porCobrarMes,
    pendienteAcumulado,
    atrasadoMonto,
    vencidoMesMonto,
    porVencerMesMonto,
    clientesVencidosMes,
    clientesPorVencerMes,
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
    ingresoBancarioMes,
    ingresoBancarioAnual,
    pendienteFacturarMes,
    pagosSinFacturaMes,
    adicionalesMes,
    extraPorCobrar,
    descuentosMes,
  };
}

/**
 * Calcula el aging de cartera: segmenta el saldo total pendiente por
 * antigüedad. Útil para identificar deuda más vieja (la más difícil de
 * cobrar) y priorizar gestión.
 *
 * - enCurso: saldo del mes en curso (aún dentro de ventana normal)
 * - d1_30: saldo de 1 mes vencido
 * - d31_60: saldo de 2 meses vencidos
 * - d61_plus: saldo de 3+ meses vencidos
 */
export function calcularAgingCartera(
  clientes: Cliente[],
  periodo: Periodo
): AgingCartera {
  const agg: AgingCartera = {
    enCurso: 0,
    d1_30: 0,
    d31_60: 0,
    d61_plus: 0,
    total: 0,
  };
  const refKey = periodoKey(periodo);
  clientesActivos(clientes).forEach((c) => {
    if (!clienteActivoEnPeriodo(c, periodo)) return;
    let y = Number(c.inicioAnio);
    let m = c.inicioMes;
    while (y * 12 + m <= refKey) {
      const p: Periodo = { mes: m, anio: y };
      const saldo = getSaldoMes(c, p);
      if (saldo > 0) {
        const distancia = refKey - (y * 12 + m);
        if (distancia === 0) agg.enCurso += saldo;
        else if (distancia === 1) agg.d1_30 += saldo;
        else if (distancia === 2) agg.d31_60 += saldo;
        else agg.d61_plus += saldo;
      }
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
    }
  });
  agg.total = agg.enCurso + agg.d1_30 + agg.d31_60 + agg.d61_plus;
  return agg;
}

export type DeudorTop = {
  cliente: Cliente;
  atrasado: number;
  mesesAtraso: number;
};

/** Top N clientes por monto atrasado (deuda vencida estricta). */
export function listarTopDeudores(
  clientes: Cliente[],
  periodo: Periodo,
  limite = 5
): DeudorTop[] {
  return clientesActivos(clientes)
    .map((c) => ({
      cliente: c,
      atrasado: getTotalAtrasado(c, periodo),
      mesesAtraso: getMesesAtraso(c, periodo),
    }))
    .filter((d) => d.atrasado > 0)
    .sort((a, b) => b.atrasado - a.atrasado)
    .slice(0, limite);
}

/** Construye datos crudos para exportar resumen de cobranza a Excel. */
export function construirResumenExcel(
  clientes: Cliente[],
  periodo: Periodo,
  kpis: KpisDashboard
): {
  resumen: (string | number)[][];
  detalle: Record<string, string | number>[];
} {
  const resumen: (string | number)[][] = [
    ["Resumen de cobranza", etiquetaPeriodoDashboard(periodo)],
    [],
    ["Concepto", "Monto"],
    ["Compromiso honorarios (mes)", kpis.compromisoMes],
    ["Cobrado honorarios (mes)", kpis.cobradoMes],
    ["Por cobrar honorarios (mes)", kpis.porCobrarMes],
    ["Servicios adicionales (mes)", kpis.adicionalesMes],
    ["Extra por cobrar (cartera)", kpis.extraPorCobrar],
    ["Descuentos aplicados (mes)", kpis.descuentosMes],
    ["Facturado (mes)", kpis.facturadoMes],
    ["Tasa de cobranza (%)", kpis.tasaCobranzaMes],
    [],
    ["Cobrado anual", kpis.cobradoAnual],
    ["Compromiso anual", kpis.compromisoAnual],
    ["Pendiente anual", kpis.pendienteAnual],
    ["Facturado anual", kpis.facturadoAnual],
  ];

  const detalle: Record<string, string | number>[] = [];
  clientes
    .filter((c) => c.activo && !esIngresoGeneralCliente(c))
    .forEach((c) => {
      if (!clienteActivoEnPeriodo(c, periodo)) return;
      detalle.push({
        Cliente: c.razonSocial,
        RFC: c.rfc,
        "Honorarios cobrados": getMontoPagado(c, periodo),
        "Servicios adicionales": getMontoAdicionalMes(c, periodo),
        "Descuento mes": getMontoDescuento(c, periodo),
      });
    });

  return { resumen, detalle };
}

/* -------------------------------------------------------------------------- */
/* ANÁLISIS DE INGRESOS POR AÑO (Excel multi-anual)                            */
/* -------------------------------------------------------------------------- */

type Aoa = (string | number)[][];

/** Años con actividad registrada (pagos), incluyendo el año en curso. */
function aniosConActividad(clientes: Cliente[]): number[] {
  const set = new Set<number>();
  clientes.forEach((c) =>
    c.pagosRealizados.forEach((p) => {
      const a = Number(p.anio);
      if (a >= 2000 && a <= 2100) set.add(a);
    })
  );
  set.add(getPeriodoHoy().anio);
  return [...set].sort((a, b) => a - b);
}

/** Desglose de lo cobrado por un cliente en un año (honorarios/adicionales/extras). */
function cobradoClienteAnio(
  cliente: Cliente,
  anio: number
): { honorarios: number; adicionales: number; extras: number; total: number } {
  const a = String(anio);
  let honorarios = 0;
  let adicionales = 0;
  let extras = 0;
  cliente.pagosRealizados.forEach((p) => {
    if (p.anio !== a) return;
    if (p.tipo === "adicional") {
      if (p.extraEsperadoId) extras += p.monto;
      else adicionales += p.monto;
    } else {
      // Sin tipo o "honorarios" = honorario (retrocompatibilidad).
      honorarios += p.monto;
    }
  });
  return {
    honorarios,
    adicionales,
    extras,
    total: honorarios + adicionales + extras,
  };
}

/**
 * Construye un libro de Excel con análisis profundo de ingresos por año:
 *  1) Resumen por año (cobrado, esperado, tasa, composición, crecimiento)
 *  2) Mensual × año (matriz de cobrado para ver estacionalidad)
 *  3) Composición del ingreso por año (honorarios/adicionales/extras)
 *  4) Cliente × año (cuánto pagó cada cliente por año, ranking)
 */
export function construirAnalisisAnualExcel(clientes: Cliente[]): {
  resumenAnual: Aoa;
  mensualPorAnio: Aoa;
  composicion: Aoa;
  clientePorAnio: Aoa;
} {
  const recurrentes = clientes.filter(
    (c) => !esIngresoGeneralCliente(c)
  );
  const anios = aniosConActividad(recurrentes);

  // Resumen anual por año (reusa calcularResumenAnual para esperado/cobrado,
  // consistente con la gráfica del dashboard).
  const resumenAnual: Aoa = [
    ["Análisis de ingresos por año"],
    [],
    [
      "Año",
      "Clientes que pagaron",
      "Esperado",
      "Cobrado",
      "Tasa cobranza (%)",
      "Honorarios",
      "Servicios adicionales",
      "Extras",
      "Crecimiento vs año anterior (%)",
    ],
  ];

  let cobradoAnioPrevio = 0;
  anios.forEach((anio, idx) => {
    const meses = calcularResumenAnual(recurrentes, anio);
    const esperado = meses.reduce((a, m) => a + m.compromiso, 0);
    const cobrado = meses.reduce((a, m) => a + m.cobrado, 0);

    let honorarios = 0;
    let adicionales = 0;
    let extras = 0;
    let clientesQuePagaron = 0;
    recurrentes.forEach((c) => {
      const d = cobradoClienteAnio(c, anio);
      honorarios += d.honorarios;
      adicionales += d.adicionales;
      extras += d.extras;
      if (d.total > 0) clientesQuePagaron += 1;
    });

    const tasa = esperado > 0 ? Math.round((cobrado / esperado) * 100) : 0;
    const crecimiento =
      idx > 0 && cobradoAnioPrevio > 0
        ? Math.round(((cobrado - cobradoAnioPrevio) / cobradoAnioPrevio) * 100)
        : "";

    resumenAnual.push([
      anio,
      clientesQuePagaron,
      Math.round(esperado),
      Math.round(cobrado),
      tasa,
      Math.round(honorarios),
      Math.round(adicionales),
      Math.round(extras),
      crecimiento,
    ]);
    cobradoAnioPrevio = cobrado;
  });

  // Mensual × año: filas = meses, columnas = años (cobrado).
  const mensualPorAnio: Aoa = [
    ["Cobrado mensual por año"],
    [],
    ["Mes", ...anios.map((a) => String(a))],
  ];
  const cobradoPorAnioMes: Record<number, number[]> = {};
  anios.forEach((anio) => {
    const meses = calcularResumenAnual(recurrentes, anio);
    cobradoPorAnioMes[anio] = MESES_NOM.map(
      (_n, mes) => meses[mes]?.cobrado ?? 0
    );
  });
  MESES_NOM.forEach((nombre, mes) => {
    mensualPorAnio.push([
      nombre,
      ...anios.map((a) => Math.round(cobradoPorAnioMes[a][mes] ?? 0)),
    ]);
  });
  mensualPorAnio.push([
    "TOTAL",
    ...anios.map((a) =>
      Math.round((cobradoPorAnioMes[a] ?? []).reduce((x, y) => x + y, 0))
    ),
  ]);

  // Composición del ingreso por año: filas = concepto, columnas = años.
  const compPorAnio = anios.map((anio) => {
    let honorarios = 0;
    let adicionales = 0;
    let extras = 0;
    recurrentes.forEach((c) => {
      const d = cobradoClienteAnio(c, anio);
      honorarios += d.honorarios;
      adicionales += d.adicionales;
      extras += d.extras;
    });
    return { anio, honorarios, adicionales, extras };
  });
  const composicion: Aoa = [
    ["Composición del ingreso por año"],
    [],
    ["Concepto", ...anios.map((a) => String(a))],
    ["Honorarios", ...compPorAnio.map((c) => Math.round(c.honorarios))],
    [
      "Servicios adicionales",
      ...compPorAnio.map((c) => Math.round(c.adicionales)),
    ],
    ["Extras", ...compPorAnio.map((c) => Math.round(c.extras))],
    [
      "TOTAL",
      ...compPorAnio.map((c) =>
        Math.round(c.honorarios + c.adicionales + c.extras)
      ),
    ],
  ];

  // Cliente × año: cuánto pagó cada cliente por año, ordenado por total desc.
  const filasCliente = recurrentes
    .map((c) => {
      const porAnio = anios.map((a) => cobradoClienteAnio(c, a).total);
      const total = porAnio.reduce((x, y) => x + y, 0);
      return { cliente: c, porAnio, total };
    })
    .filter((f) => f.total > 0)
    .sort((a, b) => b.total - a.total);

  const clientePorAnio: Aoa = [
    ["Ingreso por cliente y año"],
    [],
    ["Cliente", "RFC", ...anios.map((a) => String(a)), "Total"],
  ];
  filasCliente.forEach((f) => {
    clientePorAnio.push([
      f.cliente.razonSocial,
      f.cliente.rfc,
      ...f.porAnio.map((v) => Math.round(v)),
      Math.round(f.total),
    ]);
  });
  clientePorAnio.push([
    "TOTAL",
    "",
    ...anios.map((_a, i) =>
      Math.round(filasCliente.reduce((acc, f) => acc + f.porAnio[i], 0))
    ),
    Math.round(filasCliente.reduce((acc, f) => acc + f.total, 0)),
  ]);

  return { resumenAnual, mensualPorAnio, composicion, clientePorAnio };
}

/* -------------------------------------------------------------------------- */
/* ESTADO FINANCIERO (datos estructurados para el PDF con formato)             */
/* -------------------------------------------------------------------------- */

export type ResumenAnioFinanciero = {
  anio: number;
  esperado: number;
  cobrado: number;
  tasa: number;
  honorarios: number;
  adicionales: number;
  extras: number;
  clientesQuePagaron: number;
  crecimiento: number | null;
};

export type EstadoFinancieroData = {
  anioActual: number;
  anios: number[];
  porAnio: ResumenAnioFinanciero[];
  /** Serie mensual del año actual (cobrado/esperado por mes). */
  mesesActual: MesResumenAnual[];
  /** Serie mensual del año anterior (para comparativa). */
  mesesAnterior: MesResumenAnual[];
  totalActual: ResumenAnioFinanciero | null;
  totalAnterior: ResumenAnioFinanciero | null;
  /** Top clientes por lo cobrado en el año actual. */
  topClientes: {
    nombre: string;
    rfc: string;
    anioActual: number;
    total: number;
  }[];
  generadoEn: string;
};

export function construirEstadoFinanciero(
  clientes: Cliente[],
  referencia = getPeriodoHoy()
): EstadoFinancieroData {
  const recurrentes = clientes.filter((c) => !esIngresoGeneralCliente(c));
  const anios = aniosConActividad(recurrentes);
  const anioActual = referencia.anio;

  const porAnio: ResumenAnioFinanciero[] = [];
  let cobradoPrevio = 0;
  anios.forEach((anio, idx) => {
    const meses = calcularResumenAnual(recurrentes, anio, referencia);
    const esperado = meses.reduce((a, m) => a + m.compromiso, 0);
    const cobrado = meses.reduce((a, m) => a + m.cobrado, 0);
    let honorarios = 0;
    let adicionales = 0;
    let extras = 0;
    let clientesQuePagaron = 0;
    recurrentes.forEach((c) => {
      const d = cobradoClienteAnio(c, anio);
      honorarios += d.honorarios;
      adicionales += d.adicionales;
      extras += d.extras;
      if (d.total > 0) clientesQuePagaron += 1;
    });
    porAnio.push({
      anio,
      esperado,
      cobrado,
      tasa: esperado > 0 ? Math.round((cobrado / esperado) * 100) : 0,
      honorarios,
      adicionales,
      extras,
      clientesQuePagaron,
      crecimiento:
        idx > 0 && cobradoPrevio > 0
          ? Math.round(((cobrado - cobradoPrevio) / cobradoPrevio) * 100)
          : null,
    });
    cobradoPrevio = cobrado;
  });

  const mesesActual = calcularResumenAnual(recurrentes, anioActual, referencia);
  const mesesAnterior = calcularResumenAnual(recurrentes, anioActual - 1, {
    mes: 11,
    anio: anioActual - 1,
  });

  const topClientes = recurrentes
    .map((c) => ({
      nombre: c.razonSocial,
      rfc: c.rfc,
      anioActual: cobradoClienteAnio(c, anioActual).total,
      total: anios.reduce((acc, a) => acc + cobradoClienteAnio(c, a).total, 0),
    }))
    .filter((f) => f.anioActual > 0 || f.total > 0)
    .sort((a, b) => b.anioActual - a.anioActual || b.total - a.total)
    .slice(0, 12);

  return {
    anioActual,
    anios,
    porAnio,
    mesesActual,
    mesesAnterior,
    totalActual: porAnio.find((p) => p.anio === anioActual) ?? null,
    totalAnterior: porAnio.find((p) => p.anio === anioActual - 1) ?? null,
    topClientes,
    generadoEn: new Date().toISOString(),
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

/**
 * Pagos cuyo dinero ENTRÓ al banco en el mes calendario indicado (por
 * `fechaPago`) y que aún no tienen factura emitida. La existencia de factura se
 * valida contra el periodo de honorarios al que se aplicó cada pago.
 *
 * Sigue el flujo de efectivo: un pago de mayo recibido en junio aparece en la
 * facturación de junio (no en mayo), que es donde el dinero realmente entró.
 */
export function listarPagosSinFacturaBancario(
  clientes: Cliente[],
  periodo: Periodo,
  facturas: FacturaPago[]
): PagoSinFactura[] {
  const resultado: PagoSinFactura[] = [];
  clientes.forEach((c) => {
    if (!c.activo) return;
    let monto = 0;
    c.pagosRealizados.forEach((p) => {
      const pb = periodoBancarioDePago(p);
      if (pb.mes !== periodo.mes || pb.anio !== periodo.anio) return;
      // ¿Hay factura para el periodo de honorarios al que se aplicó el pago?
      const aplicacion: Periodo = { mes: p.mes, anio: Number(p.anio) };
      if (getFacturaPeriodo(facturas, c.id, aplicacion)) return;
      monto += p.monto;
    });
    if (monto > 0) resultado.push({ cliente: c, periodo, monto });
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
