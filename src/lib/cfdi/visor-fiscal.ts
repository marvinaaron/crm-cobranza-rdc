import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { listarCfdiAnioCliente, listarCfdiCliente } from "@/lib/cfdi/db";
import { agruparPorCategoria } from "@/lib/cfdi/categorias-visor";
import {
  calcularDeduccionesAsalariado,
  CATALOGO_DEDUCCIONES,
  esRegimenAsalariado,
  type CategoriaDeduccion,
} from "@/lib/cfdi/deducciones-personales";
import {
  calcularResumenMesCfdi,
  tendenciaIngresosEgresosAnio,
  type PuntoTendenciaMes,
  type ResumenMesCfdi,
} from "@/lib/cfdi/resumen-mes";
import type { ResumenCategoriaVisor } from "@/lib/cfdi/categorias-visor";
import type { ResumenDeduccionesAsalariado } from "@/lib/cfdi/deducciones-personales";
import { periodoLabel } from "@/lib/clientes";
import { regimenPorClave } from "@/lib/regimenes-fiscales";

export type VisorFiscalPayload = {
  ok: true;
  cliente: { id: number; razonSocial: string; rfc: string };
  periodo: { mes: number; anio: number; label: string };
  regimen: { clave: string; nombre: string };
  perfil: "asalariado" | "actividad";
  categorias: ResumenCategoriaVisor[];
  deducciones: ResumenDeduccionesAsalariado | null;
  resumenMes: ResumenMesCfdi | null;
  tendenciaAnual: PuntoTendenciaMes[];
  catalogoDeducciones: CategoriaDeduccion[] | null;
};

export async function construirVisorFiscal(params: {
  clienteId: number;
  mes: number;
  anio: number;
}): Promise<VisorFiscalPayload> {
  const estado = await leerCrmEstadoCompleto();
  const cliente = estado.clientes.find((c) => c.id === params.clienteId);
  if (!cliente) {
    throw new Error("Cliente no encontrado.");
  }

  const regimen = regimenPorClave(cliente.regimenFiscalClave);
  const asalariado = esRegimenAsalariado(cliente.regimenFiscalClave);

  const { items: mesItems } = await listarCfdiCliente({
    clienteId: params.clienteId,
    mes: params.mes,
    anio: params.anio,
  });

  const categorias = agruparPorCategoria(mesItems);
  const anioItems = await listarCfdiAnioCliente(params.clienteId, params.anio);

  const deducciones = asalariado
    ? calcularDeduccionesAsalariado(anioItems)
    : null;
  const resumenMes = calcularResumenMesCfdi(mesItems, asalariado);
  const tendenciaAnual = tendenciaIngresosEgresosAnio(
    anioItems,
    params.anio,
    asalariado
  );

  return {
    ok: true,
    cliente: {
      id: cliente.id,
      razonSocial: cliente.razonSocial,
      rfc: cliente.rfc,
    },
    periodo: {
      mes: params.mes,
      anio: params.anio,
      label: periodoLabel({ mes: params.mes, anio: params.anio }),
    },
    regimen: {
      clave: regimen?.clave ?? cliente.regimenFiscalClave ?? "—",
      nombre: regimen?.label ?? "Régimen fiscal",
    },
    perfil: asalariado ? "asalariado" : "actividad",
    categorias,
    deducciones,
    resumenMes,
    tendenciaAnual,
    catalogoDeducciones: asalariado ? CATALOGO_DEDUCCIONES : null,
  };
}
