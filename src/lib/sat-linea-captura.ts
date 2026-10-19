/**
 * SAT DPA: 20 caracteres alfanuméricos (0-9 y A-Z, no solo hex)
 * en grupos de 4, más los dígitos del importe juntos (a veces 3 cifras).
 */

export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Cuerpo (20) + importe, sin espacios, en mayúsculas. */
export function normalizarLineaCapturaSat(valor: string): string {
  return valor.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}

function esCuerpoSat(cuerpo: string): boolean {
  if (!/^[0-9A-Z]{20}$/.test(cuerpo)) return false;
  return (cuerpo.match(/\d/g) ?? []).length >= 8;
}

/** Pesos enteros (sin centavos ni ceros a la izquierda). */
function pesosEnterosDeTexto(raw: string): string | null {
  const entero = raw.replace(/[$,\s]/g, "").split(".")[0] ?? "";
  if (!/^\d+$/.test(entero) || entero.length > 10) return null;
  return entero.replace(/^0+(?=\d)/, "");
}

/**
 * 20 caracteres en grupos de 4 (como el acuse SAT),
 * y los dígitos del importe juntos al final: `0426 10TC 8900 4889 1299 272`.
 */
export function formatearLineaCapturaSat(valor: string): string {
  const n = normalizarLineaCapturaSat(valor);
  if (!n) return "";
  const cuerpo = n.slice(0, 20);
  const importe = n.slice(20).replace(/\D/g, "");
  const grupos = (cuerpo.match(/.{1,4}/g) ?? []).join(" ");
  return importe ? `${grupos} ${importe}` : grupos;
}

export function esLineaCapturaSatValida(valor: string): boolean {
  const n = normalizarLineaCapturaSat(valor);
  if (n.length < 20 || n.length > 32) return false;
  const cuerpo = n.slice(0, 20);
  if (!esCuerpoSat(cuerpo)) return false;
  const resto = n.slice(20);
  return resto === "" || /^\d+$/.test(resto);
}

function extraerImportePesos(texto: string): string | null {
  const patrones = [
    /importe\s+total\s+a\s+pagar[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /importe\s+a\s+pagar[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /total\s+a\s+pagar[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /importe[\s\S]{0,40}?(?:total\s+)?a\s+pagar[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
  ];
  for (const re of patrones) {
    const m = texto.match(re);
    const entero = m?.[1] ? pesosEnterosDeTexto(m[1]) : null;
    if (entero) return entero;
  }
  return null;
}

/**
 * El acuse SAT repite el cuerpo (20) junto al código de barras. El primer
 * grupo suele ser el periodo (`0426`) y, si lo tomamos como importe, queda
 * `426` pegado al final. Eso no es el total a pagar.
 */
function esImporteEcoDelCuerpo(cuerpo: string, importe: string): boolean {
  const imp = pesosEnterosDeTexto(importe);
  if (!imp || imp.length < 3) return false;
  const cabeza = cuerpo.slice(0, 4);
  const cabezaSinCero = cabeza.replace(/^0+/, "");
  return cabeza === imp || cabezaSinCero === imp || cuerpo.startsWith(imp);
}

function compactar(cuerpo: string, importe = ""): string {
  const c = normalizarLineaCapturaSat(cuerpo).slice(0, 20);
  const imp = pesosEnterosDeTexto(importe) ?? soloDigitos(importe).replace(/^0+(?=\d)/, "");
  return `${c}${imp}`;
}

/** Código de barras: 20 alfanuméricos + importe (a veces con $). */
function extraerDesdeCodigoBarras(
  texto: string
): { cuerpo: string; importe: string } | null {
  const candidatos: Array<{ cuerpo: string; importe: string }> = [];
  const conEspacio = texto.matchAll(
    /\b([0-9A-Za-z]{20})[ \t]*\$?[ \t]*(\d{1,10})(?:\.\d{2})?\b(?!\s*\/)/g
  );
  for (const m of conEspacio) {
    if (!m[1] || !m[2]) continue;
    const cuerpo = normalizarLineaCapturaSat(m[1]).slice(0, 20);
    const importe = pesosEnterosDeTexto(m[2]);
    if (esCuerpoSat(cuerpo) && importe && !esImporteEcoDelCuerpo(cuerpo, importe)) {
      candidatos.push({ cuerpo, importe });
    }
  }
  const pegado = texto.matchAll(/\b([0-9A-Za-z]{20})(\d{1,10})\b/g);
  for (const m of pegado) {
    if (!m[1] || !m[2]) continue;
    const cuerpo = normalizarLineaCapturaSat(m[1]).slice(0, 20);
    const importe = pesosEnterosDeTexto(m[2]);
    if (esCuerpoSat(cuerpo) && importe && !esImporteEcoDelCuerpo(cuerpo, importe)) {
      candidatos.push({ cuerpo, importe });
    }
  }
  return candidatos[0] ?? null;
}

function cuerpoTrasEtiqueta(texto: string): string | null {
  const re = /(?:l[ií]nea\s+de\s+captura|clave\s+de\s+referencia)\s*:?\s*/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const after = texto.slice(m.index + m[0].length, m.index + m[0].length + 160);
    let cuerpo = "";
    for (const raw of after.split(/\s+/)) {
      if (/importe|vigente|pagar|total|hasta|fecha/i.test(raw)) break;
      if (/^\$/.test(raw)) break;
      const tok = raw.toUpperCase();
      if (/^[0-9A-Z]{20}$/.test(tok) && cuerpo.length === 0) {
        return esCuerpoSat(tok) ? tok : null;
      }
      if (/^[0-9A-Z]{4}$/.test(tok)) {
        cuerpo += tok;
        if (cuerpo.length >= 20) {
          return esCuerpoSat(cuerpo.slice(0, 20)) ? cuerpo.slice(0, 20) : null;
        }
        continue;
      }
      if ((cuerpo.length > 0 || /^[0-9]$/.test(tok)) && /^[0-9A-Z]{1,3}$/.test(tok)) {
        cuerpo += tok;
        if (cuerpo.length >= 20) {
          return esCuerpoSat(cuerpo.slice(0, 20)) ? cuerpo.slice(0, 20) : null;
        }
        continue;
      }
      if (cuerpo.length > 0) break;
    }
    if (esCuerpoSat(cuerpo)) return cuerpo;
  }
  return null;
}

function candidatosCuerpo(texto: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (crudo: string) => {
    const cuerpo = normalizarLineaCapturaSat(crudo).slice(0, 20);
    if (esCuerpoSat(cuerpo) && !seen.has(cuerpo)) {
      seen.add(cuerpo);
      out.push(cuerpo);
    }
  };

  const etiquetado = cuerpoTrasEtiqueta(texto);
  if (etiquetado) add(etiquetado);

  for (const m of texto.matchAll(
    /(?:l[ií]nea\s+de\s+captura|clave\s+de\s+referencia)[:\s]*([0-9A-Z][0-9A-Z\s-]{14,48})/gi
  )) {
    add(m[1] ?? "");
  }

  for (const m of texto.matchAll(/\b([0-9A-Z]{4}(?:[\s-]+[0-9A-Z]{4}){4})\b/gi)) {
    add(m[1] ?? "");
  }

  for (const m of texto.matchAll(/\b([0-9A-Z]{20})\b/gi)) {
    add(m[1] ?? "");
  }

  return out;
}

function importeTrasCuerpo(texto: string, cuerpo: string): string | null {
  const flexible = cuerpo.split("").join("[\\s-]*");
  const re = new RegExp(`${flexible}([\\s\\S]{0,160})`, "i");
  const m = texto.match(re);
  const after = m?.[1] ?? "";
  if (!after) return null;

  const etiquetado = extraerImportePesos(after);
  if (etiquetado && !esImporteEcoDelCuerpo(cuerpo, etiquetado)) return etiquetado;

  const conPeso = after.match(/\$\s*(\d{1,3}(?:,\d{3})+|\d{1,10})(?:\.\d{2})?/);
  if (conPeso?.[1]) {
    const entero = pesosEnterosDeTexto(conPeso[1]);
    if (entero && !esImporteEcoDelCuerpo(cuerpo, entero)) return entero;
  }

  const mismoRenglon = after.match(
    /^[ \t]*\$?[ \t]*(\d{1,3}(?:,\d{3})+|\d{1,10})(?:\.\d{2})?(?!\d)(?![ \t]*\/)/
  );
  if (mismoRenglon?.[1]) {
    const entero = pesosEnterosDeTexto(mismoRenglon[1]);
    if (entero && !esImporteEcoDelCuerpo(cuerpo, entero)) return entero;
  }

  return null;
}

function elegirImporte(
  cuerpo: string,
  texto: string,
  importeSugerido?: number
): string {
  const label = extraerImportePesos(texto);
  if (label && !esImporteEcoDelCuerpo(cuerpo, label)) return label;

  const cerca = importeTrasCuerpo(texto, cuerpo);
  if (cerca) return cerca;

  const barras = extraerDesdeCodigoBarras(texto);
  if (
    barras &&
    barras.cuerpo === cuerpo &&
    !esImporteEcoDelCuerpo(cuerpo, barras.importe)
  ) {
    return barras.importe;
  }

  if (importeSugerido != null && importeSugerido > 0) {
    const sugerido = String(Math.round(importeSugerido));
    if (!esImporteEcoDelCuerpo(cuerpo, sugerido)) return sugerido;
  }
  return "";
}

/**
 * Cuerpo de 20 (hoja 2, “Línea de captura”) + dígitos del importe a pagar,
 * sin espacios. Eso es la línea que el cliente pega en el banco.
 */
export function extraerLineaCapturaSatDeTexto(
  texto: string,
  opciones?: { importeSugerido?: number }
): string | null {
  const candidatos = candidatosCuerpo(texto);
  const barras = extraerDesdeCodigoBarras(texto);
  const cuerpo = candidatos[0] ?? barras?.cuerpo ?? "";
  if (!cuerpo) return null;

  const importe = elegirImporte(cuerpo, texto, opciones?.importeSugerido);
  const compacto = compactar(cuerpo, importe);
  return esLineaCapturaSatValida(compacto) ? compacto : cuerpo;
}

/** Prefiere la hoja 2 del acuse SAT, donde viene la línea de captura. */
export function extraerLineaCapturaSatDePaginas(
  paginas: string[],
  opciones?: { importeSugerido?: number }
): string | null {
  if (paginas.length === 0) return null;
  const orden =
    paginas.length >= 2
      ? [paginas[1], ...paginas.filter((_, i) => i !== 1)]
      : paginas;

  let soloCuerpo: string | null = null;
  for (const pagina of orden) {
    const got = extraerLineaCapturaSatDeTexto(pagina, opciones);
    if (!got) continue;
    if (got.length > 20) return got;
    if (!soloCuerpo) soloCuerpo = got;
  }
  return extraerLineaCapturaSatDeTexto(paginas.join("\n"), opciones) ?? soloCuerpo;
}
