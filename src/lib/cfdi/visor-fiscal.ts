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
import {
  alcanceLabel,
  esAlcanceUnMes,
  mesesActivosEnAnio,
} from "@/lib/cfdi/alcance-periodo";
import { regimenPorClave } from "@/lib/regimenes-fiscales";

export type VisorFiscalPayload = {
  ok: true;
  cliente: { id: number; razonSocial: string; rfc: string };
  periodo: {
    mes: number;
    anio: number;
    mesHasta: number;
    anioHasta: number;
    label: string;
    unMes: boolean;
  };
  regimen: { clave: string; nombre: string };
  perfil: "asalariado" | "actividad";
  categorias: ResumenCategoriaVisor[];
  deducciones: ResumenDeduccionesAsalariado | null;
  resumenMes: ResumenMesCfdi | null;
  tendenciaAnual: PuntoTendenciaMes[];
  /** Meses del alcance dentro del año de la gráfica. */
  mesesActivos: number[];
  catalogoDeducciones: CategoriaDeduccion[] | null;
};

export async function construirVisorFiscal(params: {
  clienteId: number;
  mes: number;
  anio: number;
  mesHasta?: number;
  anioHasta?: number;
}): Promise<VisorFiscalPayload> {
  const estado = await leerCrmEstadoCompleto();
  const cliente = estado.clientes.find((c) => c.id === params.clienteId);
  if (!cliente) {
    throw new Error("Cliente no encontrado.");
  }

  const mesHasta = params.mesHasta ?? params.mes;
  const anioHasta = params.anioHasta ?? params.anio;
  const alcance = {
    desde: { mes: params.mes, anio: params.anio },
    hasta: { mes: mesHasta, anio: anioHasta },
  };
  const unMes = esAlcanceUnMes(alcance);

  const regimen = regimenPorClave(cliente.regimenFiscalClave);
  const asalariado = esRegimenAsalariado(cliente.regimenFiscalClave);

  const { items: periodoItems } = await listarCfdiCliente({
    clienteId: params.clienteId,
    mes: params.mes,
    anio: params.anio,
    mesHasta,
    anioHasta,
  });

  const categorias = agruparPorCategoria(periodoItems);

  // Gráfica: año del extremo "hasta"; deducciones personales: mismo año.
  const anioGrafica = anioHasta;
  const anioItems = await listarCfdiAnioCliente(params.clienteId, anioGrafica);

  const deducciones = asalariado
    ? calcularDeduccionesAsalariado(anioItems)
    : null;
  const resumenMes = calcularResumenMesCfdi(periodoItems, asalariado);
  const tendenciaAnual = tendenciaIngresosEgresosAnio(
    anioItems,
    anioGrafica,
    asalariado
  );
  const mesesActivos = mesesActivosEnAnio(alcance, anioGrafica);

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
      mesHasta,
      anioHasta,
      label: alcanceLabel({ preset: "rango", ...alcance }),
      unMes,
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
    mesesActivos,
    catalogoDeducciones: asalariado ? CATALOGO_DEDUCCIONES : null,
  };
}
