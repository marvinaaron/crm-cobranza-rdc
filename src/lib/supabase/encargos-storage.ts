import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";
import { asegurarBucketStorage } from "@/lib/supabase/ensure-bucket";
import type { Encargo, ArchivoEncargo } from "@/lib/encargos";

const EXP_SEGUNDOS = 60 * 60 * 24 * 7; // 7 días

/**
 * Crea el bucket "encargos" (privado) si no existe.
 */
export async function asegurarBucketEncargos(): Promise<void> {
  await asegurarBucketStorage(BUCKETS.encargos);
}

/**
 * Rellena `url` (firmada) en cada adjunto/entrega de los encargos que tengan
 * `path` en Storage. No persiste nada: solo es para la respuesta de lectura.
 */
export async function firmarArchivosDeEncargos(
  encargos: Encargo[]
): Promise<Encargo[]> {
  const paths = new Set<string>();
  for (const e of encargos) {
    for (const a of e.adjuntosCliente ?? []) if (a.path) paths.add(a.path);
    for (const ent of e.entregas ?? [])
      for (const a of ent.archivos ?? []) if (a.path) paths.add(a.path);
  }
  if (paths.size === 0) return encargos;

  const admin = getSupabaseAdmin();
  const lista = [...paths];
  const { data, error } = await admin.storage
    .from(BUCKETS.encargos)
    .createSignedUrls(lista, EXP_SEGUNDOS);
  if (error || !data) return encargos;

  const mapa = new Map<string, string>();
  data.forEach((d, i) => {
    if (d.signedUrl) mapa.set(lista[i], d.signedUrl);
  });

  const firmar = (a: ArchivoEncargo): ArchivoEncargo =>
    a.path && mapa.has(a.path) ? { ...a, url: mapa.get(a.path) } : a;

  return encargos.map((e) => ({
    ...e,
    adjuntosCliente: e.adjuntosCliente?.map(firmar),
    entregas: e.entregas?.map((ent) => ({
      ...ent,
      archivos: ent.archivos?.map(firmar),
    })),
  }));
}

/** Borra de Storage los archivos (paths) de una lista de encargos. */
export async function borrarArchivosDeEncargos(
  encargos: Encargo[]
): Promise<void> {
  const paths: string[] = [];
  for (const e of encargos) {
    for (const a of e.adjuntosCliente ?? []) if (a.path) paths.push(a.path);
    for (const ent of e.entregas ?? [])
      for (const a of ent.archivos ?? []) if (a.path) paths.push(a.path);
  }
  if (paths.length === 0) return;
  const admin = getSupabaseAdmin();
  await admin.storage.from(BUCKETS.encargos).remove(paths);
}
