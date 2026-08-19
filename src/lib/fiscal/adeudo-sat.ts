import type { RegistroInpc } from "./inpc";

/** Mora 2026: 1.38% LIF × 1.50 (art. 21 CFF) = 2.07%. Años 2018-2025: 1.47%. */
export const TASA_MORA_2026 = 0.0207;
export const TASA_MORA_2018_2025 = 0.0147;
export const TOPE_MESES_RECARGO = 60;

/** Mes calendario (sin día): así lo calculan CCii, ContadorMx y El Contribuyente. */
export type PeriodoMes = {
  anio: number;
  mes: number;
};

export type InpcUsado = {
  valor: number;
  anio: number;
  mes: number;
  aproximado: boolean;
};

export type MesRecargo = {
  anio: number;
  mes: number;
  tasaMensual: number;
  acumulado: number;
};

export type DesgloseTasaRecargo = {
  anio: number;
  meses: number;
  tasaMensual: number;
};

export type ResultadoAdeudoSat = {
  impuestoHistorico: number;
  inpcVencimiento: InpcUsado;
  inpcPago: InpcUsado;
  factorActualizacion: number;
  actualizacion: number;
  impuestoActualizado: number;
  mesesRecargo: number;
  mesesRecargoCapped: boolean;
  detalleMeses: MesRecargo[];
  desgloseTasas: DesgloseTasaRecargo[];
  tasaAcumulada: number;
  recargos: number;
  total: number;
  mismoMes: boolean;
};

export function redondear(n: number, decimales: number): number {
  const f = 10 ** decimales;
  return Math.round((n + Number.EPSILON) * f) / f;
}

export function mesAnterior(anio: number, mes: number): PeriodoMes {
  return mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
}

export function mesSiguiente(anio: number, mes: number): PeriodoMes {
  return mes === 12 ? { anio: anio + 1, mes: 1 } : { anio, mes: mes + 1 };
}

export function compararPeriodos(a: PeriodoMes, b: PeriodoMes): number {
  return a.anio * 12 + a.mes - (b.anio * 12 + b.mes);
}

export function tasaMoraPorAnio(anio: number): number {
  return anio >= 2026 ? TASA_MORA_2026 : TASA_MORA_2018_2025;
}

/**
 * Recargos mes a mes: del mes siguiente al vencimiento hasta el mes de pago
 * (ambos inclusive). Pagar el día 1 o el 30 del mismo mes da el mismo resultado.
 */
export function listarMesesRecargo(
  vencimiento: PeriodoMes,
  pago: PeriodoMes
): MesRecargo[] {
  if (compararPeriodos(pago, vencimiento) <= 0) return [];

  const inicio = mesSiguiente(vencimiento.anio, vencimiento.mes);
  const detalle: MesRecargo[] = [];
  let anio = inicio.anio;
  let mes = inicio.mes;
  let acumulado = 0;

  while (anio < pago.anio || (anio === pago.anio && mes <= pago.mes)) {
    if (detalle.length >= TOPE_MESES_RECARGO) break;
    const tasaMensual = tasaMoraPorAnio(anio);
    acumulado = redondear(acumulado + tasaMensual, 6);
    detalle.push({ anio, mes, tasaMensual, acumulado });
    const next = mesSiguiente(anio, mes);
    anio = next.anio;
    mes = next.mes;
  }

  return detalle;
}

export function buscarInpc(serie: RegistroInpc[], anio: number, mes: number): InpcUsado | null {
  const exacto = serie.find((r) => r.anio === anio && r.mes === mes);
  if (exacto) {
    return { valor: exacto.valor, anio, mes, aproximado: false };
  }
  const anteriores = serie.filter(
    (r) => r.anio < anio || (r.anio === anio && r.mes <= mes)
  );
  const ultimo = anteriores[anteriores.length - 1];
  if (!ultimo) return null;
  return {
    valor: ultimo.valor,
    anio: ultimo.anio,
    mes: ultimo.mes,
    aproximado: true,
  };
}

export function calcularAdeudoSat(params: {
  impuestoHistorico: number;
  vencimiento: PeriodoMes;
  pago: PeriodoMes;
  serieInpc: RegistroInpc[];
}): ResultadoAdeudoSat | { error: string } {
  const historico = redondear(params.impuestoHistorico, 2);
  if (!(historico > 0)) {
    return { error: "Ingresa un monto de impuesto omitido mayor a cero." };
  }

  const { vencimiento, pago } = params;
  const mismoMes = compararPeriodos(pago, vencimiento) <= 0;

  const refVenc = mesAnterior(vencimiento.anio, vencimiento.mes);
  const refPago = mesAnterior(pago.anio, pago.mes);
  const inpcVencimiento = buscarInpc(params.serieInpc, refVenc.anio, refVenc.mes);
  const inpcPago = buscarInpc(params.serieInpc, refPago.anio, refPago.mes);

  if (!inpcVencimiento) {
    return {
      error: `No hay INPC para ${etiquetaMesAnio(refVenc.anio, refVenc.mes)} (mes anterior al vencimiento).`,
    };
  }
  if (!inpcPago) {
    return {
      error: `No hay INPC para ${etiquetaMesAnio(refPago.anio, refPago.mes)} (mes anterior al pago).`,
    };
  }

  let factor = inpcPago.valor / inpcVencimiento.valor;
  factor = redondear(factor, 4);
  if (factor < 1) factor = 1;

  const impuestoActualizado = redondear(historico * factor, 2);
  const actualizacion = redondear(impuestoActualizado - historico, 2);

  const detalleMeses = mismoMes ? [] : listarMesesRecargo(vencimiento, pago);
  const mesesSinTope = Math.max(0, compararPeriodos(pago, vencimiento));
  const capped = mesesSinTope > TOPE_MESES_RECARGO;

  const tasaAcumulada = detalleMeses.length
    ? detalleMeses[detalleMeses.length - 1].acumulado
    : 0;
  const recargos = redondear(impuestoActualizado * tasaAcumulada, 2);
  const total = redondear(impuestoActualizado + recargos, 2);

  const porAnio = new Map<number, DesgloseTasaRecargo>();
  for (const m of detalleMeses) {
    const prev = porAnio.get(m.anio);
    if (prev) prev.meses += 1;
    else porAnio.set(m.anio, { anio: m.anio, meses: 1, tasaMensual: m.tasaMensual });
  }

  return {
    impuestoHistorico: historico,
    inpcVencimiento,
    inpcPago,
    factorActualizacion: factor,
    actualizacion,
    impuestoActualizado,
    mesesRecargo: detalleMeses.length,
    mesesRecargoCapped: capped,
    detalleMeses,
    desgloseTasas: [...porAnio.values()],
    tasaAcumulada,
    recargos,
    total,
    mismoMes,
  };
}

const NOMBRES_MES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function nombreMes(mes: number): string {
  return NOMBRES_MES[mes - 1] ?? String(mes);
}

export function etiquetaMesAnio(anio: number, mes: number): string {
  const n = nombreMes(mes);
  return `${n.charAt(0).toUpperCase()}${n.slice(1)} ${anio}`;
}
