import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { RegistroTarea } from "@/lib/agenda-cierre";

export type MapaAgendaCierre = Record<string, RegistroTarea>;

const CLAVE = "agenda_cierre";

/** Lee el mapa de progreso del workflow del despacho desde Supabase. */
export async function leerAgendaCierreRegistros(): Promise<MapaAgendaCierre> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("crm_estado")
    .select("payload")
    .eq("clave", CLAVE)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.payload || typeof data.payload !== "object" || Array.isArray(data.payload)) {
    return {};
  }
  return data.payload as MapaAgendaCierre;
}

/** Guarda el mapa completo de progreso del workflow del despacho. */
export async function guardarAgendaCierreRegistros(
  registros: MapaAgendaCierre
): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("crm_estado").upsert(
    {
      clave: CLAVE,
      payload: registros,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clave" }
  );
  if (error) throw new Error(error.message);
}
