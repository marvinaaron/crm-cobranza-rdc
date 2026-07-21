import { MESES_NOM } from "@/lib/clientes";
import { montoConsulta } from "./consulta";
import type { CfdiRegistro } from "./types";

export type ResumenMesCfdi = {
  ingresosMes: number;
  gastosMes: number;
  diferenciaMes: number;
  cfdiIngresos: number;
  cfdiGastos: number;
  /** CFDI cancelados en el periodo (emitidos + recibidos). */
  cfdiCancelados: number;
  facturasEmitidas: number;
  facturasRecibidas: number;
  /**
   * Comparativa vs el mes calendario anterior (solo cuando el alcance es un mes).
   * `null` si no aplica o no hay base de comparación.
   */
  vsMesAnterior: VsMesAnteriorCfdi | null;
};

export type VsMesAnteriorCfdi = {
  label: string;
  mes: number;
  anio: number;
  ingresos: number;
  gastos: number;
  diferencia: number;
  /** Variación % del resultado (ingresos−gastos). null si el anterior era 0. */
  deltaResultadoPct: number | null;
  /** Variación % de ingresos. */
  deltaIngresosPct: number | null;
  /** Variación % de gastos. */
  deltaGastosPct: number | null;
};

export type PuntoTendenciaMes = {
  mes: number;
  label: string;
  ingresos: number;
  egresos: number;
  /** Nómina vigente del mes (emitida + recibida), como rubro aparte. */
  nomina: number;
};

type ItemResumen = Pick<
  CfdiRegistro,
  "tipo" | "tipoComprobante" | "estatus" | "mes" | "anio" | "total"
>;

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}

function pctCambio(actual: number, anterior: number): number | null {
  if (anterior === 0) return actual === 0 ? 0 : null;
  return Math.round(((actual - anterior) / Math.abs(anterior)) * 1000) / 10;
}

export function periodoMesAnterior(mes: number, anio: number): {
  mes: number;
  anio: number;
} {
  if (mes === 0) return { mes: 11, anio: anio - 1 };
  return { mes: mes - 1, anio };
}

/** Ingresos y egresos del periodo según perfil (asalariado vs actividad). */
export function calcularResumenMesCfdi(
  items: ItemResumen[],
  asalariado: boolean,
  opts?: {
    vsAnterior?: {
      items: ItemResumen[];
      mes: number;
      anio: number;
    } | null;
  }
): ResumenMesCfdi {
  const vigentes = items.filter((r) => r.estatus === "vigente");
  const cfdiCancelados = items.filter((r) => r.estatus === "cancelado").length;
  const facturasEmitidas = items.filter((r) => r.tipo === "emitido").length;
  const facturasRecibidas = items.filter((r) => r.tipo === "recibido").length;

  let ingresos = 0;
  let gastos = 0;
  let cfdiIngresos = 0;
  let cfdiGastos = 0;

  if (asalariado) {
    const nomina = vigentes.filter(
      (r) => r.tipo === "recibido" && r.tipoComprobante === "N"
    );
    const otrosGastos = vigentes.filter(
      (r) => r.tipo === "recibido" && r.tipoComprobante !== "N"
    );
    cfdiIngresos = nomina.length;
    cfdiGastos = otrosGastos.length;
    ingresos = nomina.reduce((s, r) => s + montoConsulta(r), 0);
    gastos = otrosGastos.reduce((s, r) => s + montoConsulta(r), 0);
  } else {
    const ingresosActividad = vigentes.filter(
      (r) =>
        (r.tipo === "emitido" && r.tipoComprobante !== "N") ||
        (r.tipo === "recibido" && r.tipoComprobante === "N")
    );
    const gastosActividad = vigentes.filter(
      (r) =>
        (r.tipo === "recibido" && r.tipoComprobante !== "N") ||
        (r.tipo === "emitido" && r.tipoComprobante === "N")
    );
    cfdiIngresos = ingresosActividad.length;
    cfdiGastos = gastosActividad.length;
    ingresos = ingresosActividad.reduce((s, r) => s + montoConsulta(r), 0);
    gastos = gastosActividad.reduce((s, r) => s + montoConsulta(r), 0);
  }

  const diferenciaMes = redondear(ingresos - gastos);
  let vsMesAnterior: VsMesAnteriorCfdi | null = null;
  if (opts?.vsAnterior) {
    const ant = calcularResumenMesCfdi(opts.vsAnterior.items, asalariado);
    const nombre = MESES_NOM[opts.vsAnterior.mes] ?? "Mes";
    vsMesAnterior = {
      label: `${nombre.slice(0, 3)} ${opts.vsAnterior.anio}`,
      mes: opts.vsAnterior.mes,
      anio: opts.vsAnterior.anio,
      ingresos: ant.ingresosMes,
      gastos: ant.gastosMes,
      diferencia: ant.diferenciaMes,
      deltaResultadoPct: pctCambio(diferenciaMes, ant.diferenciaMes),
      deltaIngresosPct: pctCambio(redondear(ingresos), ant.ingresosMes),
      deltaGastosPct: pctCambio(redondear(gastos), ant.gastosMes),
    };
  }

  return {
    ingresosMes: redondear(ingresos),
    gastosMes: redondear(gastos),
    diferenciaMes,
    cfdiIngresos,
    cfdiGastos,
    cfdiCancelados,
    facturasEmitidas,
    facturasRecibidas,
    vsMesAnterior,
  };
}

/**
 * Serie mensual del año para la gráfica de ingresos vs egresos.
 * La nómina (emitida + recibida) va como serie aparte para no mezclarla
 * con las líneas de ingresos y gastos del negocio.
 */
export function tendenciaIngresosEgresosAnio(
  items: ItemResumen[],
  anio: number,
  asalariado: boolean
): PuntoTendenciaMes[] {
  return MESES_NOM.map((nombre, mes) => {
    const delMes = items.filter((r) => r.anio === anio && r.mes === mes);
    const sinNomina = delMes.filter((r) => r.tipoComprobante !== "N");
    const resumen = calcularResumenMesCfdi(sinNomina, asalariado);
    const nomina = delMes
      .filter((r) => r.estatus === "vigente" && r.tipoComprobante === "N")
      .reduce((s, r) => s + montoConsulta(r), 0);
    return {
      mes,
      label: nombre.slice(0, 3),
      ingresos: resumen.ingresosMes,
      egresos: resumen.gastosMes,
      nomina: redondear(nomina),
    };
  });
}
