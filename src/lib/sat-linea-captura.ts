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
    /importe[\s\S]{0,60}?(?:total\s+)?a\s+pagar[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /importe\s+total[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /total\s+a\s+pagar[:\s]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /importe[:\s]*\$\s*([\d,]+(?:\.\d{2})?)/i,
  ];
  for (const re of patrones) {
    const m = texto.match(re);
    const entero = m?.[1] ? pesosEnterosDeTexto(m[1]) : null;
    if (entero) return entero;
  }
  return null;
}

function compactar(cuerpo: string, importe = ""): string {
  const c = normalizarLineaCapturaSat(cuerpo).slice(0, 20);
  const imp = pesosEnterosDeTexto(importe) ?? soloDigitos(importe).replace(/^0+(?=\d)/, "");
  return `${c}${imp}`;
}

/** Código de barras: 20 alfanuméricos + importe (a veces con $). */
function extraerDesdeCodigoBarras(texto: string): string | null {
  const conEspacio = texto.match(
    /\b([0-9A-Za-z]{20})[ \t]*\$?[ \t]*(\d{1,10})(?:\.\d{2})?\b(?!\s*\/)/
  );
  if (conEspacio?.[1] && conEspacio[2]) {
    const compacto = compactar(conEspacio[1], conEspacio[2]);
    if (esLineaCapturaSatValida(compacto) && compacto.length > 20) return compacto;
  }
  const pegado = texto.match(/\b([0-9A-Za-z]{20})(\d{1,10})\b/);
  if (pegado?.[1] && pegado[2]) {
    const compacto = compactar(pegado[1], pegado[2]);
    if (esLineaCapturaSatValida(compacto) && compacto.length > 20) return compacto;
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
  const re = new RegExp(`${flexible}([\\s\\S]{0,120})`, "i");
  const m = texto.match(re);
  const after = m?.[1] ?? "";
  if (!after) return null;

  const mismoRenglon = after.match(
    /^[ \t]*\$?[ \t]*(\d{1,3}(?:,\d{3})+|\d{1,10})(?:\.\d{2})?(?!\d)(?![ \t]*\/)/
  );
  if (mismoRenglon?.[1]) {
    const entero = pesosEnterosDeTexto(mismoRenglon[1]);
    if (entero) return entero;
  }

  const conPeso = after.match(/\$\s*(\d{1,3}(?:,\d{3})+|\d{1,10})(?:\.\d{2})?/);
  if (conPeso?.[1]) {
    const entero = pesosEnterosDeTexto(conPeso[1]);
    if (entero) return entero;
  }

  const etiquetado = extraerImportePesos(after);
  if (etiquetado) return etiquetado;

  return null;
}

export function extraerLineaCapturaSatDeTexto(texto: string): string | null {
  const desdeBarras = extraerDesdeCodigoBarras(texto);
  if (desdeBarras && desdeBarras.length > 20) return desdeBarras;

  const candidatos = candidatosCuerpo(texto);
  const cuerpo =
    candidatos[0] ??
    (desdeBarras ? normalizarLineaCapturaSat(desdeBarras).slice(0, 20) : "");
  if (!cuerpo) return null;

  const importe =
    extraerImportePesos(texto) ?? importeTrasCuerpo(texto, cuerpo) ?? "";
  const compacto = `${cuerpo}${importe}`;
  return esLineaCapturaSatValida(compacto) ? compacto : cuerpo;
}
