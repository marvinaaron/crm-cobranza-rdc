import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";
import {
  leerCrmEstadoCompleto,
  guardarCrmEstadoCompleto,
  type CrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";
import {
  respaldoDesdeEstado,
  estadoDesdeRespaldo,
} from "@/lib/data-reset";
import { asegurarBucketStorage } from "@/lib/supabase/ensure-bucket";

/**
 * Respaldos completos del CRM guardados como JSON en Supabase Storage (bucket
 * privado "respaldos"). Cada respaldo es un snapshot íntegro del estado, por lo
 * que restaurar uno deja el CRM exactamente como estaba al generarlo.
 *
 * El respaldo se genera LEYENDO el estado en el servidor (no se envía desde el
 * navegador), así no choca con el límite de tamaño de las peticiones.
 */

const MAX_BACKUPS = 60;
const FIRMA_SEGUNDOS = 60 * 60; // 1 h para descargar

export type TipoBackup = "manual" | "cierre" | "auto";

export type BackupInfo = {
  nombre: string;
  tipo: TipoBackup;
  generadoEn: string;
  bytes: number;
  url?: string;
};

async function asegurarBucket(): Promise<void> {
  await asegurarBucketStorage(BUCKETS.respaldos);
}

function tipoDeNombre(nombre: string): TipoBackup {
  const t = nombre.split("__")[0];
  return t === "cierre" || t === "auto" ? t : "manual";
}

function fechaDeNombre(nombre: string): string {
  // Formato: tipo__YYYY-MM-DDTHH-MM-SS-mmmZ.json
  const sin = nombre.replace(/\.json$/, "");
  const iso = sin.split("__")[1] ?? "";
  // Reinvertir [:.]→- solo en la parte de hora.
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}T${m[2]}:${m[3]}:${m[4]}`;
  return iso;
}

type FileObj = {
  name: string;
  created_at?: string;
  metadata?: { size?: number } | null;
};

/** Crea un respaldo del estado actual y lo guarda en Storage. */
export async function crearBackup(tipo: TipoBackup = "manual"): Promise<BackupInfo> {
  await asegurarBucket();
  const estado = await leerCrmEstadoCompleto();
  const respaldo = respaldoDesdeEstado(estado);
  const json = JSON.stringify(respaldo);
  const iso = new Date().toISOString().replace(/[:.]/g, "-");
  const nombre = `${tipo}__${iso}.json`;

  const admin = getSupabaseAdmin();
  const { error } = await admin.storage
    .from(BUCKETS.respaldos)
    .upload(nombre, Buffer.from(json, "utf8"), {
      contentType: "application/json",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  await aplicarRetencion();

  return {
    nombre,
    tipo,
    generadoEn: new Date().toISOString(),
    bytes: Buffer.byteLength(json, "utf8"),
  };
}

/** Lista los respaldos disponibles, con URL firmada para descargar. */
export async function listarBackups(): Promise<BackupInfo[]> {
  await asegurarBucket();
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage
    .from(BUCKETS.respaldos)
    .list("", { limit: 200, sortBy: { column: "name", order: "desc" } });
  if (error || !data) return [];

  const archivos = (data as FileObj[]).filter((f) => f.name.endsWith(".json"));
  if (archivos.length === 0) return [];

  const nombres = archivos.map((f) => f.name);
  const { data: firmadas } = await admin.storage
    .from(BUCKETS.respaldos)
    .createSignedUrls(nombres, FIRMA_SEGUNDOS);
  const urlPorNombre = new Map<string, string>();
  (firmadas ?? []).forEach((s) => {
    if (s.signedUrl && s.path) urlPorNombre.set(s.path, s.signedUrl);
  });

  return archivos
    .map((f) => ({
      nombre: f.name,
      tipo: tipoDeNombre(f.name),
      generadoEn: f.created_at ?? fechaDeNombre(f.name),
      bytes: f.metadata?.size ?? 0,
      url: urlPorNombre.get(f.name),
    }))
    .sort((a, b) => b.generadoEn.localeCompare(a.generadoEn));
}

/** Restaura el estado del CRM desde un respaldo guardado. */
export async function restaurarBackup(nombre: string): Promise<void> {
  if (!nombre || !nombre.endsWith(".json")) {
    throw new Error("Nombre de respaldo inválido.");
  }
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage
    .from(BUCKETS.respaldos)
    .download(nombre);
  if (error || !data) {
    throw new Error(error?.message ?? "No se encontró el respaldo.");
  }
  const texto = await data.text();
  const json = JSON.parse(texto);
  const estado = estadoDesdeRespaldo(json) as CrmEstadoCompleto;
  await guardarCrmEstadoCompleto(estado);
}

/** Borra un respaldo. */
export async function borrarBackup(nombre: string): Promise<void> {
  if (!nombre || !nombre.endsWith(".json")) {
    throw new Error("Nombre de respaldo inválido.");
  }
  const admin = getSupabaseAdmin();
  const { error } = await admin.storage
    .from(BUCKETS.respaldos)
    .remove([nombre]);
  if (error) throw new Error(error.message);
}

/** Conserva solo los MAX_BACKUPS más recientes. */
async function aplicarRetencion(): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data } = await admin.storage
    .from(BUCKETS.respaldos)
    .list("", { limit: 500 });
  if (!data) return;
  const jsons = (data as FileObj[])
    .filter((f) => f.name.endsWith(".json"))
    .sort((a, b) =>
      (b.created_at ?? b.name).localeCompare(a.created_at ?? a.name)
    );
  const sobrantes = jsons.slice(MAX_BACKUPS).map((f) => f.name);
  if (sobrantes.length) {
    await admin.storage.from(BUCKETS.respaldos).remove(sobrantes);
  }
}
