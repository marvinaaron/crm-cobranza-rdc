import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";

type BucketOpts = {
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
};

const CONFIG: Partial<Record<string, BucketOpts>> = {
  [BUCKETS.encargos]: {
    public: false,
    fileSizeLimit: 15 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "application/xml",
      "text/xml",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/heic",
    ],
  },
  [BUCKETS.respaldos]: {
    public: false,
    fileSizeLimit: 100 * 1024 * 1024,
    allowedMimeTypes: ["application/json"],
  },
};

const listos = new Set<string>();

async function bucketExiste(nombre: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage.listBuckets();
  if (error) throw new Error(error.message);
  return (data ?? []).some((b) => b.name === nombre);
}

/**
 * Garantiza que un bucket de Storage exista antes de subir archivos.
 * Lista buckets primero; solo crea si falta. Lanza error claro si falla.
 */
export async function asegurarBucketStorage(nombre: string): Promise<void> {
  if (listos.has(nombre)) return;

  if (await bucketExiste(nombre)) {
    listos.add(nombre);
    return;
  }

  const opts = CONFIG[nombre];
  if (!opts) {
    throw new Error(`Bucket "${nombre}" sin configuración de creación.`);
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.createBucket(nombre, opts);
  if (error) {
    // Carrera: otro request pudo crearlo entre list y create.
    if (await bucketExiste(nombre)) {
      listos.add(nombre);
      return;
    }
    throw new Error(`No se pudo crear el bucket "${nombre}": ${error.message}`);
  }

  listos.add(nombre);
}
