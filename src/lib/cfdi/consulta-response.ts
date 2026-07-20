import { listarCfdiCliente } from "./db";
import {
  registroALineaConsulta,
  resumenDesdeLineas,
  type LineaConsultaCfdi,
  type ResumenConsultaCfdi,
} from "./consulta";
import type { TipoCfdi } from "./types";
import { alcanceLabel } from "./alcance-periodo";

export type PayloadConsultaCfdi = {
  lineas: LineaConsultaCfdi[];
  cantidad: number;
  totalMes: number;
  resumenPeriodo: ResumenConsultaCfdi;
};

/** Listado filtrado + totales del periodo completo (sin búsqueda). */
export async function armarPayloadConsultaCfdi(params: {
  clienteId: number;
  mes: number;
  anio: number;
  mesHasta?: number;
  anioHasta?: number;
  tipo: TipoCfdi;
  busqueda?: string;
}): Promise<PayloadConsultaCfdi> {
  const filtroBase = {
    clienteId: params.clienteId,
    mes: params.mes,
    anio: params.anio,
    mesHasta: params.mesHasta,
    anioHasta: params.anioHasta,
    tipo: params.tipo,
  };

  const { items } = await listarCfdiCliente({
    ...filtroBase,
    busqueda: params.busqueda,
  });

  const lineas = items.map((r) => registroALineaConsulta(r, params.tipo));
  const filtrado = resumenDesdeLineas(lineas);

  let resumenPeriodo = filtrado;
  if (params.busqueda?.trim()) {
    const { items: todos } = await listarCfdiCliente(filtroBase);
    resumenPeriodo = resumenDesdeLineas(
      todos.map((r) => registroALineaConsulta(r, params.tipo))
    );
  }

  return {
    lineas,
    cantidad: filtrado.cantidad,
    totalMes: filtrado.totalMes,
    resumenPeriodo,
  };
}

export function labelPeriodoConsulta(params: {
  mes: number;
  anio: number;
  mesHasta?: number;
  anioHasta?: number;
}): string {
  return alcanceLabel({
    preset: "rango",
    desde: { mes: params.mes, anio: params.anio },
    hasta: {
      mes: params.mesHasta ?? params.mes,
      anio: params.anioHasta ?? params.anio,
    },
  });
}
