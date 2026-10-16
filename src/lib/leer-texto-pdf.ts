/**
 * Lee el texto de un PDF SAT en el navegador (pdf.js).
 */
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

let workerListo = false;

function asegurarWorker() {
  if (workerListo || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  workerListo = true;
}

export async function leerTextoPdf(file: File | ArrayBuffer): Promise<string> {
  asegurarWorker();
  const bytes =
    file instanceof File ? new Uint8Array(await file.arrayBuffer()) : new Uint8Array(file);
  // pdf.js transfiere el buffer al worker; copiamos para no vaciar el File.
  const data = bytes.slice();
  const loadingTask = getDocument({
    data,
    useSystemFonts: true,
  });
  const doc = await loadingTask.promise;
  try {
    const partes: string[] = [];
    const maxPaginas = Math.min(doc.numPages, 4);
    for (let i = 1; i <= maxPaginas; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const lineas = content.items
        .map((item) => ("str" in item ? String(item.str) : ""))
        .filter(Boolean);
      partes.push(lineas.join(" "));
    }
    return partes.join("\n");
  } finally {
    await doc.cleanup();
    await loadingTask.destroy();
  }
}
