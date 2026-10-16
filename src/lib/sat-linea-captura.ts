/**
 * SAT DPA: 20 caracteres alfanuméricos (0-9 y A-Z, no solo hex)
 * en grupos de 4, más los dígitos del importe juntos.
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

/**
 * 20 caracteres en grupos de 4 (como el acuse SAT),
 * y los dígitos del importe juntos al final: `0426 10TC 8900 4889 1299 1143`.
 */
export function formatearLineaCapturaSat(valor: string): string {
  const n = normalizarLineaCapturaSat(valor);
  if (!n) return "";
  const cuerpo = n.slice(0, 20);
  const importe = n.slice(20);
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
  const m = texto.match(
    /importe[\s\S]{0,40}?a\s+pagar[:\s$]*([\d,]+(?:\.\d{2})?)/i
  );
  if (!m?.[1]) return null;
  const entero = m[1].replace(/,/g, "").split(".")[0] ?? "";
  if (!entero || entero.length > 10) return null;
  return entero;
}

function compactar(cuerpo: string, importe = ""): string {
  const c = normalizarLineaCapturaSat(cuerpo).slice(0, 20);
  const imp = soloDigitos(importe);
  return `${c}${imp}`;
}

/** Código de barras: 20 alfanuméricos + espacio + dígitos del importe. */
function extraerDesdeCodigoBarras(texto: string): string | null {
  const conEspacio = texto.match(/\b([0-9A-Za-z]{20})\s+(\d{1,10})\b/);
  if (conEspacio?.[1] && conEspacio[2]) {
    const compacto = compactar(conEspacio[1], conEspacio[2]);
    if (esLineaCapturaSatValida(compacto)) return compacto;
  }
  const pegado = texto.match(/\b([0-9A-Za-z]{20})(\d{1,10})\b/);
  if (pegado?.[1] && pegado[2]) {
    const compacto = compactar(pegado[1], pegado[2]);
    if (esLineaCapturaSatValida(compacto)) return compacto;
  }
  return null;
}

function cuerpoTrasEtiqueta(texto: string): string | null {
  const re = /(?:l[ií]nea\s+de\s+captura|clave\s+de\s+referencia)\s*:?\s*/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const after = texto.slice(m.index + m[0].length, m.index + m[0].length + 160);
    let cuerpo = "";
    for (const raw of after.split(/\s+/)) {
      if (/importe|vigente|pagar|total|hasta|fecha/i.test(raw)) break;
      const tok = raw.toUpperCase();
      if (/^[0-9A-Z]{20}$/.test(tok) && cuerpo.length === 0) {
        return esCuerpoSat(tok) ? tok : null;
      }
      if (/^[0-9A-Z]{4}$/.test(tok)) {
        cuerpo += tok;
        if (cuerpo.length >= 20) return esCuerpoSat(cuerpo.slice(0, 20)) ? cuerpo.slice(0, 20) : null;
        continue;
      }
      if ((cuerpo.length > 0 || /^[0-9]$/.test(tok)) && /^[0-9A-Z]{1,3}$/.test(tok)) {
        cuerpo += tok;
        if (cuerpo.length >= 20) return esCuerpoSat(cuerpo.slice(0, 20)) ? cuerpo.slice(0, 20) : null;
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
  const re = new RegExp(`${flexible}[\\s-]+(\\d{1,10})\\b`, "i");
  const m = texto.match(re);
  return m?.[1] ?? null;
}

export function extraerLineaCapturaSatDeTexto(texto: string): string | null {
  const desdeBarras = extraerDesdeCodigoBarras(texto);
  if (desdeBarras) return desdeBarras;

  const candidatos = candidatosCuerpo(texto);
  if (!candidatos.length) return null;
  const cuerpo = candidatos[0] ?? "";
  const importe =
    extraerImportePesos(texto) ?? importeTrasCuerpo(texto, cuerpo) ?? "";
  const compacto = `${cuerpo}${importe}`;
  return esLineaCapturaSatValida(compacto) ? compacto : cuerpo;
}
