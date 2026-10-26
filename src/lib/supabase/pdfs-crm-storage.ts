import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";
import { asegurarBucketStorage } from "@/lib/supabase/ensure-bucket";
import type { DocumentoHacienda, RegistroCumplimiento } from "@/lib/cumplimiento";
import {
  aligerarPdfsRegistro,
  mapearPdfsEnRegistro,
  mapearPdfsEnRegistroAsync,
} from "@/lib/cumplimiento-categorias";
import type { ComprobantePago } from "@/lib/comprobantes";
import type { FacturaPago } from "@/lib/facturas";
import {
  guardarCrmEstadoParcial,
  type CrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";

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

export async function descargarPdfDelBucket(
  destino: DestinoPdfCrm,
  path: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const bucket = BUCKET_DESTINO[destino];
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo leer el PDF de la factura.");
  }
  return {
    buffer: Buffer.from(await data.arrayBuffer()),
    contentType: data.type || "application/pdf",
  };
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
  const unicos = [...new Set(paths)];
  // Admin: pdfs-cumplimiento. Portal (histórico): comprobantes-impuestos.
  const mapaCum = await firmarPaths(BUCKETS.pdfsCumplimiento, unicos);
  const faltantes = unicos.filter((p) => !mapaCum.has(p));
  const mapaImp =
    faltantes.length > 0
      ? await firmarPaths(BUCKETS.comprobantesImpuestos, faltantes)
      : new Map<string, string>();
  const mapa = new Map<string, string>([...mapaCum, ...mapaImp]);
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

function esDataUrlEmpotrado(dataUrl: string | undefined): boolean {
  return !!dataUrl && dataUrl.startsWith("data:");
}

function bufferDesdeDataUrl(
  dataUrl: string
): { buffer: Buffer; contentType: string } | null {
  const m = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/i.exec(dataUrl.trim());
  if (!m) return null;
  const contentType = (m[1] || "application/octet-stream").trim();
  const esB64 = (m[2] || "").toLowerCase().includes("base64");
  const cuerpo = (m[3] ?? "").replace(/\s/g, "");
  try {
    const buffer = Buffer.from(cuerpo, esB64 ? "base64" : "utf8");
    if (buffer.length < 16) return null;
    return { buffer, contentType };
  } catch {
    return null;
  }
}

async function extraerDataUrlEnBucket<
  T extends {
    dataUrl: string;
    nombreArchivo: string;
    tipoMime: string;
    storagePath?: string;
  },
>(item: T, destino: DestinoPdfCrm): Promise<T> {
  if (item.storagePath || !esDataUrlEmpotrado(item.dataUrl)) return item;
  const parsed = bufferDesdeDataUrl(item.dataUrl);
  if (!parsed) return item;
  const path = await subirPdfAlBucket({
    destino,
    buffer: parsed.buffer,
    contentType: item.tipoMime || parsed.contentType,
    nombreArchivo: item.nombreArchivo || "archivo.pdf",
  });
  return { ...item, storagePath: path, dataUrl: "" };
}

function tienePdfsEmpotrados(estado: CrmEstadoCompleto): boolean {
  if (estado.facturas.some((f) => esDataUrlEmpotrado(f.dataUrl))) return true;
  if (estado.comprobantes.some((c) => esDataUrlEmpotrado(c.dataUrl))) return true;
  for (const r of estado.cumplimiento) {
    let hay = false;
    mapearPdfsEnRegistro(r, (d) => {
      if (esDataUrlEmpotrado(d.dataUrl)) hay = true;
      return d;
    });
    if (hay) return true;
  }
  return false;
}

let migracionEnVuelo: Promise<CrmEstadoCompleto> | null = null;

/**
 * Sube a Storage los PDFs que todavía viven como base64 en `crm_estado` y
 * deja solo `storagePath`. Se llama al leer el CRM; si no hay embebidos, no
 * toca la base.
 */
export async function asegurarPdfsEnStorage(
  estado: CrmEstadoCompleto
): Promise<CrmEstadoCompleto> {
  if (!tienePdfsEmpotrados(estado)) return estado;
  if (migracionEnVuelo) return migracionEnVuelo;

  migracionEnVuelo = (async () => {
    const facturas = await Promise.all(
      estado.facturas.map((f) => extraerDataUrlEnBucket(f, "facturas"))
    );
    const comprobantes = await Promise.all(
      estado.comprobantes.map((c) =>
        extraerDataUrlEnBucket(c, "comprobantes-honorarios")
      )
    );
    const cumplimiento = await Promise.all(
      estado.cumplimiento.map((r) =>
        mapearPdfsEnRegistroAsync(r, (d: DocumentoHacienda) =>
          extraerDataUrlEnBucket(d, "cumplimiento")
        )
      )
    );

    const next: CrmEstadoCompleto = {
      ...estado,
      facturas,
      comprobantes,
      cumplimiento,
    };
    const tocadas: (keyof CrmEstadoCompleto)[] = [];
    if (
      facturas.some(
        (f, i) =>
          f.storagePath !== estado.facturas[i]?.storagePath ||
          f.dataUrl !== estado.facturas[i]?.dataUrl
      )
    ) {
      tocadas.push("facturas");
    }
    if (
      comprobantes.some(
        (c, i) =>
          c.storagePath !== estado.comprobantes[i]?.storagePath ||
          c.dataUrl !== estado.comprobantes[i]?.dataUrl
      )
    ) {
      tocadas.push("comprobantes");
    }
    if (
      JSON.stringify(aligerarCumplimientoParaNube(cumplimiento)) !==
      JSON.stringify(aligerarCumplimientoParaNube(estado.cumplimiento))
    ) {
      tocadas.push("cumplimiento");
    }
    if (tocadas.length > 0) {
      await guardarCrmEstadoParcial(next, tocadas);
    }
    return next;
  })().finally(() => {
    migracionEnVuelo = null;
  });

  return migracionEnVuelo;
}
