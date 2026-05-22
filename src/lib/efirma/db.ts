import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { RegistroEfirma, UmbralRecordatorio } from "./types";

type RowEfirma = {
  id: string;
  cliente_id: number;
  titular: string;
  rfc_certificado: string | null;
  vigencia_inicio: string;
  vigencia_fin: string;
  cer_path: string;
  key_path: string | null;
  notificado_30: boolean;
  notificado_15: boolean;
  notificado_7: boolean;
  notificado_3: boolean;
  ultimo_correo_at: string | null;
  created_at: string;
  updated_at: string;
};

export function rowToRegistro(row: RowEfirma): RegistroEfirma {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    titular: row.titular,
    rfcCertificado: row.rfc_certificado,
    vigenciaInicio: row.vigencia_inicio,
    vigenciaFin: row.vigencia_fin,
    cerPath: row.cer_path,
    tieneKey: !!row.key_path,
    notificado30: row.notificado_30,
    notificado15: row.notificado_15,
    notificado7: row.notificado_7,
    notificado3: row.notificado_3,
    ultimoCorreoAt: row.ultimo_correo_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listarEfirmas(): Promise<RegistroEfirma[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cliente_efirma")
    .select("*")
    .order("vigencia_fin", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as RowEfirma[]).map(rowToRegistro);
}

export async function obtenerEfirmaPorCliente(
  clienteId: number
): Promise<RegistroEfirma | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cliente_efirma")
    .select("*")
    .eq("cliente_id", clienteId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToRegistro(data as RowEfirma);
}

export function yaNotificado(reg: RegistroEfirma, umbral: UmbralRecordatorio): boolean {
  switch (umbral) {
    case 30:
      return reg.notificado30;
    case 15:
      return reg.notificado15;
    case 7:
      return reg.notificado7;
    case 3:
      return reg.notificado3;
  }
}

export async function marcarNotificado(
  id: string,
  umbral: UmbralRecordatorio
): Promise<void> {
  const admin = getSupabaseAdmin();
  const campo =
    umbral === 30
      ? "notificado_30"
      : umbral === 15
        ? "notificado_15"
        : umbral === 7
          ? "notificado_7"
          : "notificado_3";
  const { error } = await admin
    .from("cliente_efirma")
    .update({
      [campo]: true,
      ultimo_correo_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
