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

type ItemTexto = {
  str: string;
  x: number;
  y: number;
  eol?: boolean;
};

function textoDePagina(items: ItemTexto[]): string {
  const ordenados = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lineas: string[] = [];
  let yActual: number | null = null;
  let fila: string[] = [];
  const toleranciaY = 4;

  const flush = () => {
    if (fila.length) lineas.push(fila.join(" ").replace(/\s+/g, " ").trim());
    fila = [];
  };

  for (const it of ordenados) {
    if (yActual === null || Math.abs(it.y - yActual) <= toleranciaY) {
      fila.push(it.str);
      yActual = yActual === null ? it.y : yActual;
    } else {
      flush();
      fila.push(it.str);
      yActual = it.y;
    }
    if (it.eol) {
      flush();
      yActual = null;
    }
  }
  flush();
  return lineas.filter(Boolean).join("\n");
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
      const items: ItemTexto[] = [];
      for (const item of content.items) {
        if (!("str" in item) || !item.str) continue;
        const t = "transform" in item ? item.transform : undefined;
        items.push({
          str: String(item.str),
          x: Array.isArray(t) ? Number(t[4]) || 0 : 0,
          y: Array.isArray(t) ? Number(t[5]) || 0 : 0,
          eol: "hasEOL" in item ? Boolean(item.hasEOL) : false,
        });
      }
      partes.push(textoDePagina(items));
    }
    return partes.join("\n");
  } finally {
    await doc.cleanup();
    await loadingTask.destroy();
  }
}
