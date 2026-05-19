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
