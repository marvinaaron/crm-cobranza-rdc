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
  if (typeof document === "undefined" || !file.type.startsWith("image/")) {
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
  if (typeof document === "undefined" || !file.type.startsWith("image/")) {
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
