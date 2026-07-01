import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { eliminarXmlCfdi } from "./storage";
import { clasificarCategoriaVisor } from "./categorias-visor";
import type {
  CfdiRegistro,
  CfdiResumenPeriodo,
  EstatusCfdi,
  FiltroCfdiListado,
  TipoCfdi,
} from "./types";

type RowCfdi = {
  id: string;
  cliente_id: number;
  uuid_sat: string;
  tipo: TipoCfdi;
  tipo_comprobante: string;
  rfc_emisor: string;
  nombre_emisor: string | null;
  rfc_receptor: string;
  nombre_receptor: string | null;
  fecha: string;
  mes: number;
  anio: number;
  subtotal: number;
  total: number;
  moneda: string;
  concepto_resumen: string | null;
  estatus: EstatusCfdi;
  categoria_visor: string | null;
  xml_path: string;
  nombre_archivo: string | null;
  tamano_bytes: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

function rowToRegistro(row: RowCfdi): CfdiRegistro {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    uuidSat: row.uuid_sat,
    tipo: row.tipo,
    tipoComprobante: row.tipo_comprobante as CfdiRegistro["tipoComprobante"],
    rfcEmisor: row.rfc_emisor,
    nombreEmisor: row.nombre_emisor,
    rfcReceptor: row.rfc_receptor,
    nombreReceptor: row.nombre_receptor,
    fecha: row.fecha,
    mes: row.mes,
    anio: row.anio,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    moneda: row.moneda,
    conceptoResumen: row.concepto_resumen,
    estatus: row.estatus ?? "vigente",
    categoriaVisor: row.categoria_visor,
    xmlPath: row.xml_path,
    nombreArchivo: row.nombre_archivo,
    tamanoBytes: row.tamano_bytes,
    metadata: (row.metadata ?? {}) as CfdiRegistro["metadata"],
    createdAt: row.created_at,
  };
}

export type InsertCfdiInput = {
  clienteId: number;
  uuidSat: string;
  tipo: TipoCfdi;
  tipoComprobante: string;
  rfcEmisor: string;
  nombreEmisor: string | null;
  rfcReceptor: string;
  nombreReceptor: string | null;
  fecha: string;
  mes: number;
  anio: number;
  subtotal: number;
  total: number;
  moneda: string;
  conceptoResumen: string | null;
  estatus: EstatusCfdi;
  categoriaVisor: string;
  xmlPath: string;
  nombreArchivo: string | null;
  tamanoBytes: number;
  metadata: Record<string, unknown>;
};

export async function insertarOActualizarCfdi(
  input: InsertCfdiInput
): Promise<CfdiRegistro> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const payload = {
    cliente_id: input.clienteId,
    uuid_sat: input.uuidSat,
    tipo: input.tipo,
    tipo_comprobante: input.tipoComprobante,
    rfc_emisor: input.rfcEmisor,
    nombre_emisor: input.nombreEmisor,
    rfc_receptor: input.rfcReceptor,
    nombre_receptor: input.nombreReceptor,
    fecha: input.fecha,
    mes: input.mes,
    anio: input.anio,
    subtotal: input.subtotal,
    total: input.total,
    moneda: input.moneda,
    concepto_resumen: input.conceptoResumen,
    estatus: input.estatus,
    categoria_visor: input.categoriaVisor,
    xml_path: input.xmlPath,
    nombre_archivo: input.nombreArchivo,
    tamano_bytes: input.tamanoBytes,
    metadata: input.metadata,
    updated_at: now,
  };

  const { data, error } = await admin
    .from("cliente_cfdi")
    .upsert(payload, { onConflict: "cliente_id,uuid_sat" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToRegistro(data as RowCfdi);
}

export async function obtenerCfdiPorUuid(
  clienteId: number,
  uuidSat: string
): Promise<CfdiRegistro | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cliente_cfdi")
    .select("*")
    .eq("cliente_id", clienteId)
    .eq("uuid_sat", uuidSat.toUpperCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToRegistro(data as RowCfdi);
}

function coincideBusqueda(row: RowCfdi, q: string): boolean {
  const campos = [
    row.rfc_emisor,
    row.rfc_receptor,
    row.nombre_emisor,
    row.nombre_receptor,
    row.concepto_resumen,
    row.uuid_sat,
  ];
  return campos.some((c) => c?.toUpperCase().includes(q));
}

export async function listarCfdiCliente(
  filtro: FiltroCfdiListado
): Promise<{ items: CfdiRegistro[]; resumen: CfdiResumenPeriodo }> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cliente_cfdi")
    .select("*")
    .eq("cliente_id", filtro.clienteId)
    .eq("mes", filtro.mes)
    .eq("anio", filtro.anio)
    .order("fecha", { ascending: false });
  if (error) throw new Error(error.message);

  const allRows = (data ?? []) as RowCfdi[];

  const resumen: CfdiResumenPeriodo = {
    cantidadEmitidos: 0,
    cantidadRecibidos: 0,
    totalEmitidos: 0,
    totalRecibidos: 0,
  };

  for (const row of allRows) {
    if (row.tipo === "emitido") {
      resumen.cantidadEmitidos += 1;
      resumen.totalEmitidos += Number(row.total);
    } else {
      resumen.cantidadRecibidos += 1;
      resumen.totalRecibidos += Number(row.total);
    }
  }

  resumen.totalEmitidos = Math.round(resumen.totalEmitidos * 100) / 100;
  resumen.totalRecibidos = Math.round(resumen.totalRecibidos * 100) / 100;

  let rows = allRows;
  if (filtro.tipo && filtro.tipo !== "todos") {
    rows = rows.filter((r) => r.tipo === filtro.tipo);
  }
  const q = filtro.busqueda?.trim().toUpperCase();
  if (q) {
    rows = rows.filter((r) => coincideBusqueda(r, q));
  }

  return {
    items: rows.map(rowToRegistro),
    resumen,
  };
}

/** Últimos CFDI ingestados (admin / pruebas). */
export async function listarCfdiRecientesCliente(
  clienteId: number,
  limite = 10
): Promise<CfdiRegistro[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cliente_cfdi")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  return ((data ?? []) as RowCfdi[]).map(rowToRegistro);
}

export async function listarCfdiAnioCliente(
  clienteId: number,
  anio: number
): Promise<CfdiRegistro[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cliente_cfdi")
    .select("*")
    .eq("cliente_id", clienteId)
    .eq("anio", anio)
    .order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RowCfdi[]).map(rowToRegistro);
}

/** CFDI de un periodo; opcionalmente filtrados por tipo (emitido/recibido). */
export async function listarCfdiPeriodoCliente(
  clienteId: number,
  mes: number,
  anio: number,
  tipo?: TipoCfdi
): Promise<CfdiRegistro[]> {
  const admin = getSupabaseAdmin();
  let q = admin
    .from("cliente_cfdi")
    .select("*")
    .eq("cliente_id", clienteId)
    .eq("mes", mes)
    .eq("anio", anio);
  if (tipo) q = q.eq("tipo", tipo);
  const { data, error } = await q.order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RowCfdi[]).map(rowToRegistro);
}

async function eliminarRegistroCfdi(reg: CfdiRegistro): Promise<void> {
  const admin = getSupabaseAdmin();
  try {
    await eliminarXmlCfdi(reg.xmlPath);
  } catch {
    // Si el XML ya no está en storage, igual borramos metadata.
  }
  const { error } = await admin.from("cliente_cfdi").delete().eq("id", reg.id);
  if (error) throw new Error(error.message);
}

export async function eliminarCfdiPorUuid(
  clienteId: number,
  uuidSat: string
): Promise<boolean> {
  const reg = await obtenerCfdiPorUuid(clienteId, uuidSat);
  if (!reg) return false;
  await eliminarRegistroCfdi(reg);
  return true;
}

export async function eliminarCfdiPeriodoCliente(params: {
  clienteId: number;
  mes: number;
  anio: number;
  tipo?: TipoCfdi;
}): Promise<number> {
  const registros = await listarCfdiPeriodoCliente(
    params.clienteId,
    params.mes,
    params.anio,
    params.tipo
  );
  for (const reg of registros) {
    await eliminarRegistroCfdi(reg);
  }
  return registros.length;
}
