import { listarCfdiCliente } from "./db";
import {
  registroALineaConsulta,
  resumenDesdeLineas,
  type LineaConsultaCfdi,
  type ResumenConsultaCfdi,
} from "./consulta";
import type { TipoCfdi } from "./types";

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
  tipo: TipoCfdi;
  busqueda?: string;
}): Promise<PayloadConsultaCfdi> {
  const { items } = await listarCfdiCliente({
    clienteId: params.clienteId,
    mes: params.mes,
    anio: params.anio,
    tipo: params.tipo,
    busqueda: params.busqueda,
  });

  const lineas = items.map((r) => registroALineaConsulta(r, params.tipo));
  const filtrado = resumenDesdeLineas(lineas);

  let resumenPeriodo = filtrado;
  if (params.busqueda?.trim()) {
    const { items: todos } = await listarCfdiCliente({
      clienteId: params.clienteId,
      mes: params.mes,
      anio: params.anio,
      tipo: params.tipo,
    });
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
