import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  CfdiRegistro,
  CfdiResumenPeriodo,
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
