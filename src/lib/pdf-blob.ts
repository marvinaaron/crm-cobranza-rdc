/** Convierte data URL a blob URL para ver/descargar PDF (los data: en pestaña nueva suelen fallar). */

export function dataUrlABlobUrl(dataUrl: string): string {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch?.[1] ?? "application/pdf";
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export function abrirPdfEnNuevaPestana(dataUrl: string): void {
  const url = dataUrlABlobUrl(dataUrl);
  const ventana = window.open(url, "_blank", "noopener,noreferrer");
  if (!ventana) {
    URL.revokeObjectURL(url);
    return;
  }
  ventana.addEventListener("beforeunload", () => URL.revokeObjectURL(url));
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function descargarPdf(dataUrl: string, nombreArchivo: string): void {
  descargarArchivo(dataUrl, nombreArchivo);
}

export function descargarArchivo(dataUrl: string, nombreArchivo: string): void {
  const url = dataUrlABlobUrl(dataUrl);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
