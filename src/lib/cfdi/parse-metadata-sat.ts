import type { EstatusCfdi } from "./types";

export type EstatusDesdeMetadata = {
  uuid: string;
  estatus: EstatusCfdi;
  fechaCancelacion?: string;
};

/**
 * Parsea archivos de metadata SAT (TXT/CSV de Descarga Masiva o portal).
 * Estatus: "1" / vigente = vigente; "0" / cancelado = cancelado.
 */
export function parsearMetadataSatTexto(contenido: string): EstatusDesdeMetadata[] {
  const texto = contenido.replace(/^\uFEFF/, "").trim();
  if (!texto) return [];

  const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lineas.length === 0) return [];

  const sep = detectarSeparador(lineas[0]);
  const primera = partirLinea(lineas[0], sep);
  const tieneHeader = primera.some((c) => /uuid|estatus|rfc/i.test(c));

  let idxUuid = -1;
  let idxEstatus = -1;
  let idxFechaCancel = -1;
  let dataStart = 0;

  if (tieneHeader) {
    const headers = primera.map((h) =>
      h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
    );
    idxUuid = headers.findIndex((h) => h === "uuid" || h === "foliouuid" || h === "uuidcfdi");
    idxEstatus = headers.findIndex(
      (h) => h === "estatus" || h === "estado" || h === "estatuscfdi"
    );
    idxFechaCancel = headers.findIndex(
      (h) =>
        h === "fechacancelacion" ||
        h === "fechadecancelacion" ||
        h === "fechacancela"
    );
    dataStart = 1;
  } else {
    // Formato típico SAT sin encabezado (Uuid~...~Estatus~FechaCancelacion~...)
    // Uuid suele ser col 0; Estatus col 10; FechaCancelacion col 11
    idxUuid = 0;
    idxEstatus = Math.min(10, primera.length - 1);
    idxFechaCancel = primera.length > 11 ? 11 : -1;
  }

  if (idxUuid < 0) {
    // Heurística: primera columna con forma de UUID
    idxUuid = 0;
  }
  if (idxEstatus < 0) {
    idxEstatus = Math.min(10, Math.max(primera.length - 2, 1));
  }

  const porUuid = new Map<string, EstatusDesdeMetadata>();

  for (let i = dataStart; i < lineas.length; i++) {
    const cols = partirLinea(lineas[i], sep);
    if (cols.length === 0) continue;
    const uuidRaw = (cols[idxUuid] ?? "").trim();
    const uuid = extraerUuid(uuidRaw);
    if (!uuid) continue;
    const estatusRaw = (cols[idxEstatus] ?? "").trim();
    const fechaCancelacion =
      idxFechaCancel >= 0 ? (cols[idxFechaCancel] ?? "").trim() || undefined : undefined;
    porUuid.set(uuid, {
      uuid,
      estatus: interpretarEstatusMetadata(estatusRaw),
      fechaCancelacion,
    });
  }

  return [...porUuid.values()];
}

function detectarSeparador(linea: string): string {
  const candidatos = ["~", "|", "\t", ",", ";"];
  let mejor = "~";
  let max = 0;
  for (const s of candidatos) {
    const n = linea.split(s).length;
    if (n > max) {
      max = n;
      mejor = s;
    }
  }
  return mejor;
}

function partirLinea(linea: string, sep: string): string[] {
  return linea.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
}

function extraerUuid(raw: string): string | null {
  const m = raw
    .toUpperCase()
    .match(
      /[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/
    );
  return m ? m[0] : null;
}

function interpretarEstatusMetadata(raw: string): EstatusCfdi {
  const v = raw.trim().toLowerCase();
  if (
    v === "0" ||
    v === "cancelado" ||
    v === "cancelled" ||
    v === "cancelada" ||
    v.includes("cancel")
  ) {
    return "cancelado";
  }
  return "vigente";
}

export function esArchivoMetadataSat(nombre: string): boolean {
  const n = nombre.toLowerCase();
  if (n.endsWith(".xml")) return false;
  if (n.endsWith(".txt") || n.endsWith(".csv") || n.endsWith(".tsv")) return true;
  return /metadata|meta[_-]?datos|estatus|cancelad/.test(n);
}

export function esArchivoXmlCfdi(nombre: string): boolean {
  return nombre.toLowerCase().endsWith(".xml");
}
