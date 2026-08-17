import { getSupabaseBrowser } from "@/lib/supabase/browser";

export type DestinoPdfCrmCliente =
  | "cumplimiento"
  | "comprobantes-impuestos"
  | "comprobantes-honorarios"
  | "facturas";

const TIMEOUT_FIRMA_MS = 20_000;
const TIMEOUT_SUBIDA_MS = 45_000;

function esPortal(): boolean {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/portal");
}

function apiPdfCrm(): string {
  return esPortal() ? "/api/portal/pdf-crm" : "/api/admin/pdf-crm";
}

function mensajeAborto(e: unknown, fallback: string): Error {
  if (e instanceof DOMException && e.name === "AbortError") {
    return new Error("La subida tardó demasiado. Reintenta.");
  }
  if (e instanceof Error) return e;
  return new Error(fallback);
}

async function dataUrlAFile(
  dataUrl: string,
  nombreArchivo: string,
  tipoMime: string
): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], nombreArchivo, {
    type: tipoMime || blob.type || "application/pdf",
  });
}

type FirmaSubida = {
  path: string;
  token: string;
  signedUrl: string;
  bucket: string;
};

async function pedirUrlFirmada(
  destino: DestinoPdfCrmCliente,
  file: File
): Promise<FirmaSubida> {
  const res = await fetch(apiPdfCrm(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destino,
      nombreArchivo: file.name,
      contentType: file.type || "application/pdf",
    }),
    signal: AbortSignal.timeout(TIMEOUT_FIRMA_MS),
  });
  let data: Partial<FirmaSubida> & { error?: string } = {};
  try {
    data = await res.json();
  } catch {
    throw new Error("No se pudo preparar la subida del PDF.");
  }
  if (!res.ok || !data.path || !data.token || !data.bucket) {
    throw new Error(data.error ?? "No se pudo preparar la subida del PDF.");
  }
  return {
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl ?? "",
    bucket: data.bucket,
  };
}

/** Sube el File directo a Storage. No pasa el PDF por las APIs de Vercel. */
export async function subirFileAStorage(
  file: File,
  destino: DestinoPdfCrmCliente
): Promise<string> {
  let firma: FirmaSubida;
  try {
    firma = await pedirUrlFirmada(destino, file);
  } catch (e) {
    throw mensajeAborto(e, "No se pudo preparar la subida del PDF.");
  }

  const subida = getSupabaseBrowser()
    .storage.from(firma.bucket)
    .uploadToSignedUrl(firma.path, firma.token, file, {
      contentType: file.type || "application/pdf",
    });

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const { error } = await Promise.race([
      subida,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("La subida tardó demasiado. Reintenta.")),
          TIMEOUT_SUBIDA_MS
        );
      }),
    ]);
    if (error) throw new Error(error.message);
  } catch (e) {
    throw mensajeAborto(e, "No se pudo subir el PDF a la nube.");
  } finally {
    if (timer) clearTimeout(timer);
  }
  return firma.path;
}

export async function subirDataUrlAStorage(opts: {
  dataUrl: string;
  nombreArchivo: string;
  tipoMime: string;
  destino: DestinoPdfCrmCliente;
}): Promise<string> {
  const file = await dataUrlAFile(
    opts.dataUrl,
    opts.nombreArchivo,
    opts.tipoMime
  );
  return subirFileAStorage(file, opts.destino);
}

export function esDataUrlEmpotrado(dataUrl: string | undefined): boolean {
  return !!dataUrl && dataUrl.startsWith("data:");
}
