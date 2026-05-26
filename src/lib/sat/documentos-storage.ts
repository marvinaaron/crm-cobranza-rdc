import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";
import type { DocumentoSATRef, TipoDocumentoSAT } from "@/lib/sat/types";

const MAX_PDF_BYTES = 15 * 1024 * 1024;

export function rutaDocumentoSat(
  clienteId: number,
  tipo: TipoDocumentoSAT,
  nombreOriginal: string
): string {
  const base = nombreOriginal.replace(/[^\w.\-áéíóúñÁÉÍÓÚÑ ]/gi, "_").slice(-80);
  const safe = base.endsWith(".pdf") ? base : `${base}.pdf`;
  return `${clienteId}/${tipo}_${Date.now()}_${safe}`;
}

export async function subirDocumentoSat(params: {
  clienteId: number;
  tipo: TipoDocumentoSAT;
  file: File;
  previo?: DocumentoSATRef | null;
}): Promise<DocumentoSATRef> {
  if (params.file.type !== "application/pdf") {
    throw new Error("Solo se permiten archivos PDF.");
  }
  if (params.file.size > MAX_PDF_BYTES) {
    throw new Error("El PDF no debe superar 15 MB.");
  }

  const admin = getSupabaseAdmin();
  const path = rutaDocumentoSat(params.clienteId, params.tipo, params.file.name);
  const buffer = Buffer.from(await params.file.arrayBuffer());

  const { error } = await admin.storage
    .from(BUCKETS.documentosSat)
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  if (params.previo?.storagePath) {
    await admin.storage
      .from(BUCKETS.documentosSat)
      .remove([params.previo.storagePath])
      .catch(() => {});
  }

  return {
    storagePath: path,
    nombreArchivo: params.file.name,
    subidoEn: new Date().toISOString(),
    tamanoBytes: params.file.size,
  };
}

export async function descargarDocumentoSat(
  storagePath: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage
    .from(BUCKETS.documentosSat)
    .download(storagePath);
  if (error || !data) {
    throw new Error(error?.message ?? "Archivo no encontrado.");
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  return { buffer, contentType: "application/pdf" };
}
