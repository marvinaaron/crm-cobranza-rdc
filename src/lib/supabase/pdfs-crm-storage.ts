import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";
import { asegurarBucketStorage } from "@/lib/supabase/ensure-bucket";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import {
  aligerarPdfsRegistro,
  mapearPdfsEnRegistro,
} from "@/lib/cumplimiento-categorias";
import type { ComprobantePago } from "@/lib/comprobantes";
import type { FacturaPago } from "@/lib/facturas";

export type DestinoPdfCrm =
  | "cumplimiento"
  | "comprobantes-impuestos"
  | "comprobantes-honorarios"
  | "facturas";

const BUCKET_DESTINO: Record<DestinoPdfCrm, string> = {
  cumplimiento: BUCKETS.pdfsCumplimiento,
  "comprobantes-impuestos": BUCKETS.comprobantesImpuestos,
  "comprobantes-honorarios": BUCKETS.comprobantesHonorarios,
  facturas: BUCKETS.facturas,
};

const EXP_SEGUNDOS = 60 * 60 * 24 * 7;

export function bucketDeDestino(destino: DestinoPdfCrm): string {
  return BUCKET_DESTINO[destino];
}

function nuevoPathPdf(nombreArchivo: string): string {
  const safe = nombreArchivo.replace(/[^\w.\-]/g, "_").slice(-80);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
}

/** URL firmada para que el navegador suba el PDF directo a Storage (sin pasar por Vercel). */
export async function crearUrlSubidaFirmada(params: {
  destino: DestinoPdfCrm;
  nombreArchivo: string;
}): Promise<{ path: string; token: string; signedUrl: string; bucket: string }> {
  const bucket = BUCKET_DESTINO[params.destino];
  await asegurarBucketStorage(bucket);
  const path = nuevoPathPdf(params.nombreArchivo);
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo firmar la subida.");
  }
  return {
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    bucket,
  };
}

export async function subirPdfAlBucket(params: {
  destino: DestinoPdfCrm;
  buffer: Buffer;
  contentType: string;
  nombreArchivo: string;
}): Promise<string> {
  const bucket = BUCKET_DESTINO[params.destino];
  await asegurarBucketStorage(bucket);
  const path = nuevoPathPdf(params.nombreArchivo);
  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from(bucket).upload(path, params.buffer, {
    contentType: params.contentType || "application/pdf",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

async function firmarPaths(
  bucket: string,
  paths: string[]
): Promise<Map<string, string>> {
  const mapa = new Map<string, string>();
  const unicos = [...new Set(paths.filter(Boolean))];
  if (unicos.length === 0) return mapa;
  const admin = getSupabaseAdmin();
  const TAM = 50;
  for (let i = 0; i < unicos.length; i += TAM) {
    const chunk = unicos.slice(i, i + TAM);
    try {
      const { data, error } = await admin.storage
        .from(bucket)
        .createSignedUrls(chunk, EXP_SEGUNDOS);
      if (!error && data?.length) {
        data.forEach((d, idx) => {
          if (d.signedUrl) mapa.set(chunk[idx], d.signedUrl);
        });
        continue;
      }
    } catch {
      /* uno a uno */
    }
    for (const p of chunk) {
      if (mapa.has(p)) continue;
      try {
        const { data } = await admin.storage
          .from(bucket)
          .createSignedUrl(p, EXP_SEGUNDOS);
        if (data?.signedUrl) mapa.set(p, data.signedUrl);
      } catch {
        /* path ausente */
      }
    }
  }
  return mapa;
}

export async function firmarPdfsCumplimiento(
  registros: RegistroCumplimiento[]
): Promise<RegistroCumplimiento[]> {
  const paths: string[] = [];
  for (const r of registros) {
    mapearPdfsEnRegistro(r, (d) => {
      if (d.storagePath) paths.push(d.storagePath);
      return d;
    });
  }
  const mapa = await firmarPaths(BUCKETS.pdfsCumplimiento, [...new Set(paths)]);
  if (mapa.size === 0) return registros;
  return registros.map((r) =>
    mapearPdfsEnRegistro(r, (d) =>
      d.storagePath && mapa.has(d.storagePath)
        ? { ...d, dataUrl: mapa.get(d.storagePath)! }
        : d
    )
  );
}

export async function firmarComprobantesHonorarios(
  lista: ComprobantePago[]
): Promise<ComprobantePago[]> {
  const paths = lista.map((c) => c.storagePath).filter((p): p is string => !!p);
  const mapa = await firmarPaths(BUCKETS.comprobantesHonorarios, [...new Set(paths)]);
  if (mapa.size === 0) return lista;
  return lista.map((c) =>
    c.storagePath && mapa.has(c.storagePath)
      ? { ...c, dataUrl: mapa.get(c.storagePath)! }
      : c
  );
}

export async function firmarComprobantesImpuestos(
  lista: ComprobantePago[]
): Promise<ComprobantePago[]> {
  const paths = lista.map((c) => c.storagePath).filter((p): p is string => !!p);
  const mapa = await firmarPaths(BUCKETS.comprobantesImpuestos, [...new Set(paths)]);
  if (mapa.size === 0) return lista;
  return lista.map((c) =>
    c.storagePath && mapa.has(c.storagePath)
      ? { ...c, dataUrl: mapa.get(c.storagePath)! }
      : c
  );
}

export async function firmarFacturas(lista: FacturaPago[]): Promise<FacturaPago[]> {
  const paths = lista.map((f) => f.storagePath).filter((p): p is string => !!p);
  const mapa = await firmarPaths(BUCKETS.facturas, [...new Set(paths)]);
  if (mapa.size === 0) return lista;
  return lista.map((f) =>
    f.storagePath && mapa.has(f.storagePath)
      ? { ...f, dataUrl: mapa.get(f.storagePath)! }
      : f
  );
}

export function aligerarCumplimientoParaNube(
  lista: RegistroCumplimiento[]
): RegistroCumplimiento[] {
  return lista.map(aligerarPdfsRegistro);
}

export function aligerarAdjuntoParaNube<
  T extends { dataUrl: string; storagePath?: string },
>(item: T): T {
  if (!item.storagePath) return item;
  return { ...item, dataUrl: "" };
}
