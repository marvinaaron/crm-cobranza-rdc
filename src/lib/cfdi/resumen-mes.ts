import { MESES_NOM } from "@/lib/clientes";
import { montoConsulta } from "./consulta";
import type { CfdiRegistro } from "./types";

export type ResumenMesCfdi = {
  ingresosMes: number;
  gastosMes: number;
  diferenciaMes: number;
  cfdiIngresos: number;
  cfdiGastos: number;
  facturasEmitidas: number;
  facturasRecibidas: number;
};

export type PuntoTendenciaMes = {
  mes: number;
  label: string;
  ingresos: number;
  egresos: number;
};

type ItemResumen = Pick<
  CfdiRegistro,
  "tipo" | "tipoComprobante" | "estatus" | "mes" | "anio" | "total"
>;

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Ingresos y egresos del periodo según perfil (asalariado vs actividad). */
export function calcularResumenMesCfdi(
  items: ItemResumen[],
  asalariado: boolean
): ResumenMesCfdi {
  const vigentes = items.filter((r) => r.estatus === "vigente");
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
    const emitidos = vigentes.filter((r) => r.tipo === "emitido");
    const recibidos = vigentes.filter((r) => r.tipo === "recibido");
    cfdiIngresos = emitidos.length;
    cfdiGastos = recibidos.length;
    ingresos = emitidos.reduce((s, r) => s + montoConsulta(r), 0);
    gastos = recibidos.reduce((s, r) => s + montoConsulta(r), 0);
  }

  return {
    ingresosMes: redondear(ingresos),
    gastosMes: redondear(gastos),
    diferenciaMes: redondear(ingresos - gastos),
    cfdiIngresos,
    cfdiGastos,
    facturasEmitidas,
    facturasRecibidas,
  };
}

/** Serie mensual del año para la gráfica de ingresos vs egresos. */
export function tendenciaIngresosEgresosAnio(
  items: ItemResumen[],
  anio: number,
  asalariado: boolean
): PuntoTendenciaMes[] {
  return MESES_NOM.map((nombre, mes) => {
    const delMes = items.filter((r) => r.anio === anio && r.mes === mes);
    const resumen = calcularResumenMesCfdi(delMes, asalariado);
    return {
      mes,
      label: nombre.slice(0, 3),
      ingresos: resumen.ingresosMes,
      egresos: resumen.gastosMes,
    };
  });
}
