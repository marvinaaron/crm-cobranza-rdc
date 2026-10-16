/** SAT DPA: 20 caracteres (0-9 y A-F) + dígitos del importe. */

export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Cuerpo (20) + importe, sin espacios, en mayúsculas. */
export function normalizarLineaCapturaSat(valor: string): string {
  return valor.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
}

export function formatearLineaCapturaSat(valor: string): string {
  const n = normalizarLineaCapturaSat(valor);
  if (!n) return "";
  const cuerpo = n.slice(0, 20);
  const importe = n.slice(20);
  const grupos = cuerpo.replace(/(.{4})(?=.)/g, "$1 ").trim();
  return importe ? `${grupos} ${importe}` : grupos;
}

export function esLineaCapturaSatValida(valor: string): boolean {
  const n = normalizarLineaCapturaSat(valor);
  if (n.length < 20 || n.length > 32) return false;
  if (!/^[0-9A-F]{20}/.test(n)) return false;
  const resto = n.slice(20);
  return resto === "" || /^\d+$/.test(resto);
}

function extraerImportePesos(texto: string): string | null {
  const m = texto.match(
    /importe(?:\s+total)?\s+a\s+pagar[:\s$]*([\d,]+(?:\.\d{2})?)/i
  );
  if (!m?.[1]) return null;
  const entero = m[1].replace(/,/g, "").split(".")[0] ?? "";
  if (!entero || entero.length > 10) return null;
  return entero;
}

function candidatosCuerpo(texto: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (crudo: string) => {
    const n = normalizarLineaCapturaSat(crudo);
    const cuerpo = n.slice(0, 20);
    if (cuerpo.length === 20 && !seen.has(cuerpo)) {
      seen.add(cuerpo);
      out.push(cuerpo);
    }
  };

  for (const m of texto.matchAll(
    /(?:l[ií]nea\s+de\s+captura|clave\s+de\s+referencia)[:\s]*([0-9A-F][0-9A-F\s-]{14,48})/gi
  )) {
    add(m[1] ?? "");
  }

  for (const m of texto.matchAll(/\b([0-9A-F]{4}(?:[\s-]+[0-9A-F]{4}){4})\b/gi)) {
    add(m[1] ?? "");
  }

  for (const m of texto.matchAll(/\b([0-9A-F]{20})\b/gi)) {
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
  const candidatos = candidatosCuerpo(texto);
  if (!candidatos.length) return null;
  const cuerpo = candidatos[0] ?? "";
  const importe = importeTrasCuerpo(texto, cuerpo) ?? extraerImportePesos(texto) ?? "";
  const compacto = `${cuerpo}${importe}`;
  return esLineaCapturaSatValida(compacto) ? compacto : cuerpo;
}
