import { type Periodo, periodoLabel } from "@/lib/clientes";

export type FacturaPago = {
  id: string;
  clienteId: number;
  mes: number;
  anio: number;
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
  subidoEn: string;
  storagePath?: string;
  /** Monto facturado (lo captura el admin al subir el PDF). */
  monto?: number;
  /** ISO: el recibo de pago con PDF ya se envió al cliente. */
  correoEnviadoEn?: string;
  /** Último error de envío (si el automático falló). */
  correoError?: string;
};

/** Hubo factura emitida ese mes (aunque el PDF ya se archivó). */
export function facturaRegistrada(f: FacturaPago | null | undefined): boolean {
  return !!f?.nombreArchivo?.trim() && !!f.subidoEn;
}

/** PDF de factura aún descargable en portal/admin. */
export function facturaPdfDisponible(f: FacturaPago | null | undefined): boolean {
  return facturaRegistrada(f) && (!!f!.dataUrl?.trim() || !!f!.storagePath);
}

/** El recibo con PDF ya se mandó (no reenviar en automático). */
export function facturaCorreoEnviado(f: FacturaPago | null | undefined): boolean {
  return !!f?.correoEnviadoEn?.trim();
}

const FOLIO_EN_TITULO = /\b([A-Za-z]{1,8}[-_]\d{2,10})\b/;

function decodificarLiteralPdf(raw: string): string {
  let s = "";
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "\\" && i + 1 < raw.length) {
      const n = raw[i + 1];
      if (n >= "0" && n <= "7") {
        let oct = n;
        let j = i + 2;
        while (j < raw.length && oct.length < 3 && raw[j] >= "0" && raw[j] <= "7") {
          oct += raw[j++];
        }
        s += String.fromCharCode(parseInt(oct, 8));
        i = j - 1;
        continue;
      }
      const map: Record<string, string> = {
        n: "\n",
        r: "\r",
        t: "\t",
        b: "\b",
        f: "\f",
        "(": "(",
        ")": ")",
        "\\": "\\",
      };
      s += map[n] ?? n;
      i += 1;
      continue;
    }
    s += raw[i];
  }
  if (s.charCodeAt(0) === 0xfe && s.charCodeAt(1) === 0xff) {
    let out = "";
    for (let i = 2; i + 1 < s.length; i += 2) {
      out += String.fromCharCode((s.charCodeAt(i) << 8) | s.charCodeAt(i + 1));
    }
    return out;
  }
  return s;
}

function decodificarHexPdf(hex: string): string {
  const clean = hex.replace(/\s/g, "");
  if (clean.length < 2) return "";
  const bytes = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let out = "";
    for (let i = 2; i + 1 < bytes.length; i += 2) {
      out += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
    }
    return out;
  }
  return new TextDecoder("latin1").decode(bytes);
}

function tituloInternoPdf(dataUrl: string): string | null {
  if (!dataUrl.startsWith("data:")) return null;
  const coma = dataUrl.indexOf(",");
  if (coma < 0) return null;
  let binary = "";
  try {
    binary = atob(dataUrl.slice(coma + 1, coma + 1 + 400_000));
  } catch {
    return null;
  }
  const titulos: string[] = [];
  const reLit = /\/Title\s*\(((?:\\.|[^)\\])*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = reLit.exec(binary))) {
    titulos.push(decodificarLiteralPdf(m[1]));
  }
  const reHex = /\/Title\s*<([0-9A-Fa-f \t\r\n]+)>/g;
  while ((m = reHex.exec(binary))) {
    titulos.push(decodificarHexPdf(m[1]));
  }
  for (const t of titulos) {
    const limpio = t.replace(/\0/g, "").trim();
    if (limpio && !/^untitled$/i.test(limpio)) return limpio;
  }
  return null;
}

function folioEnTexto(texto: string): string | null {
  const sinPrefijo = texto.replace(/^(factura|fact\.?|invoice)\s+/i, "").trim();
  const m = sinPrefijo.match(FOLIO_EN_TITULO) ?? texto.match(FOLIO_EN_TITULO);
  if (!m) return null;
  return m[1].replace(/_/g, "-").toUpperCase();
}

/** Folio real de la factura (p. ej. AR-10210) desde el título del PDF o el nombre del archivo. */
export function folioDesdeArchivoFactura(
  nombreArchivo: string,
  dataUrl?: string
): string {
  const tituloPdf = dataUrl ? tituloInternoPdf(dataUrl) : null;
  const nombre = nombreArchivo.replace(/\.pdf$/i, "").trim();
  for (const c of [tituloPdf, nombre]) {
    if (!c) continue;
    const folio = folioEnTexto(c);
    if (folio) return folio;
  }
  const titulo = (tituloPdf ?? nombre).replace(/^(factura|fact\.?)\s+/i, "").trim();
  return titulo || nombre || "sin folio";
}

/** Facturado pero el PDF ya se purgó por retención (12 meses). */
export function facturaPdfArchivada(f: FacturaPago | null | undefined): boolean {
  return facturaRegistrada(f) && !f!.dataUrl?.trim();
}

const STORAGE_KEY = "rdc-facturas-v1";

export function getAnioActualFacturas(): number {
  return new Date().getFullYear();
}

/** Años que el portal del cliente puede consultar (actual y el inmediato anterior). */
export function aniosVisiblesPortal(
  anioActual = getAnioActualFacturas()
): number[] {
  return [anioActual - 1, anioActual];
}

/**
 * @deprecated Ya no se eliminan registros de factura; solo se purga el PDF a los 12 meses.
 * Conserva la lista completa para que el icono de “facturado” siga visible.
 */
export function filtrarFacturasAniosVisibles(
  lista: FacturaPago[],
  _anioActual = getAnioActualFacturas()
): FacturaPago[] {
  return lista;
}

/** @deprecated usa `filtrarFacturasAniosVisibles`. Se mantiene como alias para compatibilidad. */
export const filtrarFacturasAnioActual = filtrarFacturasAniosVisibles;

export function loadFacturas(): FacturaPago[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FacturaPago[];
    if (!Array.isArray(parsed)) return [];
    return filtrarFacturasAniosVisibles(parsed);
  } catch {
    return [];
  }
}

export function saveFacturas(lista: FacturaPago[]): void {
  if (typeof window === "undefined") return;
  const visibles = filtrarFacturasAniosVisibles(lista);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visibles));
}

export function nuevoIdFactura(): string {
  return `fac-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getFacturaPeriodo(
  lista: FacturaPago[],
  clienteId: number,
  periodo: Periodo
): FacturaPago | undefined {
  return lista.find(
    (f) =>
      f.clienteId === clienteId &&
      f.mes === periodo.mes &&
      f.anio === periodo.anio
  );
}

export function formatFechaFactura(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function labelPeriodoFactura(f: FacturaPago): string {
  return periodoLabel({ mes: f.mes, anio: f.anio });
}

/** Suma los montos facturados de un periodo (todos los clientes). */
export function sumarFacturadoPeriodo(
  lista: FacturaPago[],
  periodo: Periodo
): number {
  return lista
    .filter((f) => f.mes === periodo.mes && f.anio === periodo.anio)
    .reduce((s, f) => s + (f.monto ?? 0), 0);
}

/** Suma los montos facturados de un año (todos los clientes y meses). */
export function sumarFacturadoAnual(
  lista: FacturaPago[],
  anio: number
): number {
  return lista
    .filter((f) => f.anio === anio)
    .reduce((s, f) => s + (f.monto ?? 0), 0);
}
