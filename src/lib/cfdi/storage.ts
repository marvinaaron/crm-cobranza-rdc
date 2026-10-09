import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";

const MAX_XML_BYTES = 5 * 1024 * 1024;

export function rutaXmlCfdi(
  clienteId: number,
  uuid: string,
  nombreOriginal?: string
): string {
  const base = (nombreOriginal ?? `${uuid}.xml`)
    .replace(/[^\w.\-áéíóúñÁÉÍÓÚÑ]/gi, "_")
    .slice(-80);
  const safe = base.toLowerCase().endsWith(".xml") ? base : `${base}.xml`;
  return `${clienteId}/${uuid}/${safe}`;
}

export async function subirXmlCfdi(params: {
  clienteId: number;
  uuid: string;
  buffer: Buffer;
  nombreArchivo?: string;
}): Promise<{ path: string; tamanoBytes: number }> {
  if (params.buffer.byteLength > MAX_XML_BYTES) {
    throw new Error("El XML no debe superar 5 MB.");
  }
  const admin = getSupabaseAdmin();
  const path = rutaXmlCfdi(params.clienteId, params.uuid, params.nombreArchivo);
  const { error } = await admin.storage.from(BUCKETS.cfdi).upload(path, params.buffer, {
    contentType: "application/xml",
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return { path, tamanoBytes: params.buffer.byteLength };
}

export async function descargarXmlCfdi(
  storagePath: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage.from(BUCKETS.cfdi).download(storagePath);
  if (error || !data) {
    throw new Error(error?.message ?? "XML no encontrado.");
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  return { buffer, contentType: "application/xml" };
}

export async function eliminarXmlCfdi(storagePath: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from(BUCKETS.cfdi).remove([storagePath]);
  if (error) throw new Error(error.message);
}
