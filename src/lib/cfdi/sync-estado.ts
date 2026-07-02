import { getSupabaseAdmin } from "@/lib/supabase/admin";

const CLAVE = "cfdi_sync_estado";

export type EstadoSyncCliente = "ok" | "error" | "omitido";

export type RegistroSyncCliente = {
  clienteId: number;
  ultimaSyncAt: string | null;
  periodoInicio: string | null;
  periodoFin: string | null;
  estado: EstadoSyncCliente;
  mensaje: string;
  ingresados: number;
  errores: number;
};

type PayloadSync = {
  porCliente: Record<string, RegistroSyncCliente>;
  ultimaCorridaAt: string | null;
};

function payloadVacio(): PayloadSync {
  return { porCliente: {}, ultimaCorridaAt: null };
}

async function leerPayload(): Promise<PayloadSync> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("crm_estado")
    .select("payload")
    .eq("clave", CLAVE)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const raw = data?.payload as PayloadSync | undefined;
  if (!raw || typeof raw !== "object") return payloadVacio();
  return {
    porCliente: raw.porCliente ?? {},
    ultimaCorridaAt: raw.ultimaCorridaAt ?? null,
  };
}

async function guardarPayload(payload: PayloadSync): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("crm_estado").upsert(
    {
      clave: CLAVE,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clave" }
  );
  if (error) throw new Error(error.message);
}

export async function obtenerRegistroSyncCliente(
  clienteId: number
): Promise<RegistroSyncCliente | null> {
  const payload = await leerPayload();
  return payload.porCliente[String(clienteId)] ?? null;
}

export async function guardarRegistroSyncCliente(
  registro: RegistroSyncCliente
): Promise<void> {
  const payload = await leerPayload();
  payload.porCliente[String(registro.clienteId)] = registro;
  await guardarPayload(payload);
}

export async function marcarUltimaCorridaSync(): Promise<void> {
  const payload = await leerPayload();
  payload.ultimaCorridaAt = new Date().toISOString();
  await guardarPayload(payload);
}

export async function listarRegistrosSync(): Promise<RegistroSyncCliente[]> {
  const payload = await leerPayload();
  return Object.values(payload.porCliente).sort(
    (a, b) => a.clienteId - b.clienteId
  );
}
