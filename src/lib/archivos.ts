export const MAX_PDF_BYTES = 5 * 1024 * 1024;
export const MAX_ARCHIVO_BYTES = MAX_PDF_BYTES;

export function validarArchivoPdf(file: File): string | null {
  const esPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!esPdf) return "Solo se aceptan archivos PDF.";
  if (file.size > MAX_PDF_BYTES) return "El PDF no debe superar 5 MB.";
  return null;
}

export function validarArchivoNomina(file: File): string | null {
  const nombre = file.name.toLowerCase();
  const esPdf =
    file.type === "application/pdf" || nombre.endsWith(".pdf");
  const esXml =
    file.type === "application/xml" ||
    file.type === "text/xml" ||
    nombre.endsWith(".xml");
  if (!esPdf && !esXml) return "Solo se aceptan archivos PDF o XML.";
  if (file.size > MAX_ARCHIVO_BYTES) return "Cada archivo no debe superar 5 MB.";
  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** MIME de comprobante. Acepta fotos de iPhone (HEIC) y type vacío. */
export const ACCEPT_COMPROBANTE =
  "image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif";

/** Tope del archivo original (una foto de iPhone suele pesar más de 3 MB). */
export const MAX_COMPROBANTE_ORIGEN_BYTES = 20 * 1024 * 1024;

export function esImagenComprobante(file: File, mime = file.type): boolean {
  const tipo = (mime || file.type || "").toLowerCase();
  const nombre = file.name.toLowerCase();
  return (
    tipo.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif|heic|heif)$/.test(nombre)
  );
}

export function mimeComprobantePermitido(
  file: File
): { ok: true; mime: string } | { ok: false; error: string } {
  const nombre = file.name.toLowerCase();
  const porExt =
    nombre.endsWith(".pdf")
      ? "application/pdf"
      : nombre.endsWith(".jpg") || nombre.endsWith(".jpeg")
        ? "image/jpeg"
        : nombre.endsWith(".png")
          ? "image/png"
          : nombre.endsWith(".webp")
            ? "image/webp"
            : nombre.endsWith(".heic") || nombre.endsWith(".heif")
              ? "image/heic"
              : null;
  const mime = (file.type || porExt || "").toLowerCase();
  const permitidos = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/gif",
    "application/pdf",
  ];
  if (permitidos.includes(mime)) {
    return { ok: true, mime };
  }
  if (porExt && permitidos.includes(porExt)) {
    return { ok: true, mime: porExt };
  }
  if (mime.startsWith("image/")) {
    return { ok: true, mime };
  }
  return { ok: false, error: "Usa una foto, una captura o un PDF." };
}

/**
 * Comprime y normaliza un comprobante para el portal.
 * Las fotos grandes de iPhone se recodifican a JPEG; no se rechazan por pesar 8 MB.
 */
export async function prepararArchivoComprobante(
  file: File
): Promise<
  | { ok: true; nombreArchivo: string; tipoMime: string; dataUrl: string }
  | { ok: false; error: string }
> {
  if (file.size > MAX_COMPROBANTE_ORIGEN_BYTES) {
    return {
      ok: false,
      error: "El archivo es demasiado grande. Prueba con una captura o un PDF.",
    };
  }
  const mimeCheck = mimeComprobantePermitido(file);
  if (!mimeCheck.ok) return mimeCheck;

  const esPdf =
    mimeCheck.mime === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  let dataUrl: string;
  let tipoMime = mimeCheck.mime;
  let nombreArchivo = file.name;

  if (!esPdf && esImagenComprobante(file, mimeCheck.mime)) {
    try {
      dataUrl = await leerArchivoComprimido(file, 1600, 0.72);
      if (dataUrl.startsWith("data:image/jpeg")) {
        tipoMime = "image/jpeg";
        nombreArchivo = file.name.replace(/\.[^.]+$/, "") + ".jpg";
      }
    } catch {
      dataUrl = await readFileAsDataUrl(file);
    }
  } else {
    dataUrl = await readFileAsDataUrl(file);
  }

  const coma = dataUrl.indexOf(",");
  const b64 = coma >= 0 ? dataUrl.slice(coma + 1) : dataUrl;
  const bytesAprox = Math.ceil((b64.length * 3) / 4);
  if (bytesAprox > 3 * 1024 * 1024) {
    return {
      ok: false,
      error: "No se pudo aligerar la imagen. Prueba con una captura de pantalla.",
    };
  }
  return { ok: true, nombreArchivo, tipoMime, dataUrl };
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Lee un archivo como Data URL, comprimiendo las imágenes (redimensiona a un
 * lado máximo y recodifica a JPEG) para que no inflen el estado sincronizado.
 * Los archivos que no son imagen (PDF, XML) se leen tal cual.
 */
export async function leerArchivoComprimido(
  file: File,
  maxLado = 1600,
  calidad = 0.72
): Promise<string> {
  const esImagen = esImagenComprobante(file);
  if (typeof document === "undefined" || !esImagen) {
    return readFileAsDataUrl(file);
  }
  const original = await readFileAsDataUrl(file);
  try {
    const img = await cargarImagen(original);
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * escala));
    const h = Math.max(1, Math.round(img.height * escala));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, w, h);
    const comprimido = canvas.toDataURL("image/jpeg", calidad);
    return comprimido.length > 0 && comprimido.length < original.length
      ? comprimido
      : original;
  } catch {
    return original;
  }
}

/**
 * Igual que `leerArchivoComprimido` pero devuelve un `File` listo para subir.
 * Las imágenes se redimensionan/recodifican a JPEG; otros tipos se devuelven
 * sin cambios.
 */
export async function comprimirImagenAFile(
  file: File,
  maxLado = 1600,
  calidad = 0.72
): Promise<File> {
  if (typeof document === "undefined" || !esImagenComprobante(file)) {
    return file;
  }
  try {
    const dataUrl = await readFileAsDataUrl(file);
    const img = await cargarImagen(dataUrl);
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * escala));
    const h = Math.max(1, Math.round(img.height * escala));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", calidad)
    );
    if (!blob || blob.size >= file.size) return file;
    const nombre = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nombre, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** ¿El archivo se puede mostrar como foto (no PDF)? */
export function esVistaImagen(opts: {
  tipoMime?: string | null;
  nombreArchivo?: string | null;
  dataUrl?: string | null;
}): boolean {
  const mime = (opts.tipoMime || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  const nombre = (opts.nombreArchivo || "").toLowerCase();
  if (/\.(jpe?g|png|webp|gif|heic|heif)$/.test(nombre)) return true;
  const url = (opts.dataUrl || "").toLowerCase();
  return url.startsWith("data:image/");
}
