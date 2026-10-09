import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";

export type EstadoInfraCfdi = {
  tabla: boolean;
  bucket: boolean;
  listo: boolean;
  detalle?: {
    tablaError?: string;
    bucketError?: string;
  };
};

/** Verifica tabla `cliente_cfdi` y bucket `cfdi` antes de ingestar. */
export async function verificarInfraCfdi(): Promise<EstadoInfraCfdi> {
  const admin = getSupabaseAdmin();
  const detalle: EstadoInfraCfdi["detalle"] = {};

  let tabla = false;
  const { error: tablaError } = await admin
    .from("cliente_cfdi")
    .select("id")
    .limit(1);
  if (tablaError) {
    detalle.tablaError = tablaError.message;
  } else {
    tabla = true;
  }

  let bucket = false;
  const { data: buckets, error: bucketError } = await admin.storage.listBuckets();
  if (bucketError) {
    detalle.bucketError = bucketError.message;
  } else {
    bucket = buckets.some((b) => b.name === BUCKETS.cfdi);
    if (!bucket) {
      detalle.bucketError = `Bucket "${BUCKETS.cfdi}" no existe. Ejecuta node scripts/setup-storage.mjs`;
    }
  }

  return {
    tabla,
    bucket,
    listo: tabla && bucket,
    detalle: Object.keys(detalle).length ? detalle : undefined,
  };
}
