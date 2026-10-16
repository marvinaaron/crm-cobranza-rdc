/**
 * Extrae la línea de captura SAT (pago referenciado DPA) de texto de un PDF.
 * Solo SAT federal: suele ser 20 dígitos, a veces en grupos de 4.
 */

export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function formatearLineaCapturaSat(valor: string): string {
  const d = soloDigitos(valor);
  if (!d) return "";
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function esLineaCapturaSatValida(valor: string): boolean {
  const d = soloDigitos(valor);
  return d.length >= 16 && d.length <= 22;
}

function normalizarTextoPdf(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\u00a0/g, " ")
    .replace(/[|]/g, " ")
    .replace(/[ \t]+/g, " ");
}

function candidatosTrasEtiqueta(texto: string): string[] {
  const t = normalizarTextoPdf(texto);
  const etiquetas =
    /(?:linea\s+de\s+captura|clave\s+de\s+referencia|referencia\s+bancaria|llave\s+de\s+pago)[:\s.-]{0,12}([\d\s-]{16,40})/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = etiquetas.exec(t))) {
    const d = soloDigitos(m[1] ?? "");
    if (esLineaCapturaSatValida(d)) out.push(d);
  }
  return out;
}

function gruposDeCuatro(texto: string): string[] {
  const t = normalizarTextoPdf(texto);
  const re = /\b(\d{4}(?:[\s-]+\d{4}){3,5})\b/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const d = soloDigitos(m[1] ?? "");
    if (d.length === 20 || d.length === 16) out.push(d);
  }
  return out;
}

function bloquesVeinte(texto: string): string[] {
  const orig = normalizarTextoPdf(texto);
  const out: string[] = [];
  const re = /\b(\d{20})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(orig))) {
    out.push(m[1]);
  }
  if (out.length === 0) {
    const veinte = orig.match(/\d{20}/g);
    if (veinte) out.push(...veinte);
  }
  return out;
}

/**
 * Devuelve los dígitos de la línea SAT, o null si no hay un candidato claro.
 */
export function extraerLineaCapturaSatDeTexto(texto: string): string | null {
  if (!texto.trim()) return null;

  const etiquetados = candidatosTrasEtiqueta(texto);
  const deVeinte = etiquetados.filter((d) => d.length === 20);
  if (deVeinte[0]) return deVeinte[0];
  if (etiquetados[0]) return etiquetados[0];

  const grupos = gruposDeCuatro(texto).filter((d) => d.length === 20);
  if (grupos.length === 1) return grupos[0];
  if (grupos[0]) return grupos[0];

  const veintes = bloquesVeinte(texto);
  if (veintes.length === 1) return veintes[0];
  if (veintes[0]) return veintes[0];

  return null;
}
