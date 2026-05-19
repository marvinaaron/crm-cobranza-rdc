import { type Periodo, periodoLabel } from "@/lib/clientes";

export type TipoDocumentoCumplimiento =
  | "declaracion"
  | "impuestos"
  | "imss"
  | "nomina";

/** Documentos de un solo archivo (declaración, impuestos, IMSS). */
export type TipoDocumentoSingular = Exclude<TipoDocumentoCumplimiento, "nomina">;

export const DOCUMENTO_CUMPLIMIENTO_LABELS: Record<TipoDocumentoCumplimiento, string> = {
  declaracion: "Declaración",
  impuestos: "Impuestos",
  imss: "IMSS",
  nomina: "Nómina",
};

/** @deprecated Use DOCUMENTO_CUMPLIMIENTO_LABELS */
export const DOCUMENTO_HACIENDA_LABELS = DOCUMENTO_CUMPLIMIENTO_LABELS;

export type DocumentoHacienda = {
  id: string;
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
  subidoEn: string;
};

export type RegistroCumplimiento = {
  id: string;
  clienteId: number;
  mes: number;
  anio: number;
  montoImpuesto: number;
  fechaLimite: string;
  declaracion?: DocumentoHacienda;
  impuestos?: DocumentoHacienda;
  imss?: DocumentoHacienda;
  nomina?: DocumentoHacienda[];
  notificadoEn?: string;
  actualizadoEn: string;
};

const STORAGE_KEY = "rdc-cumplimiento-v1";

export function esDocumentoInformativo(tipo: TipoDocumentoCumplimiento): boolean {
  return tipo === "declaracion" || tipo === "imss";
}

export function requiereMetadataImpuestos(tipo: TipoDocumentoCumplimiento): boolean {
  return tipo === "impuestos";
}

export function nuevoIdCumplimiento(): string {
  return `cum-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function nuevoIdDocumento(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizarDocumento(
  doc: DocumentoHacienda & { id?: string }
): DocumentoHacienda {
  return {
    id: doc.id ?? nuevoIdDocumento(),
    nombreArchivo: doc.nombreArchivo,
    tipoMime: doc.tipoMime,
    dataUrl: doc.dataUrl,
    subidoEn: doc.subidoEn,
  };
}

function normalizarRegistro(raw: RegistroCumplimiento): RegistroCumplimiento {
  const r = { ...raw };
  if (r.declaracion) r.declaracion = normalizarDocumento(r.declaracion);
  if (r.impuestos) r.impuestos = normalizarDocumento(r.impuestos);
  if (r.imss) r.imss = normalizarDocumento(r.imss);
  if (r.nomina?.length) {
    r.nomina = r.nomina.map((d) => normalizarDocumento(d));
  }
  return r;
}

export function loadCumplimiento(): RegistroCumplimiento[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RegistroCumplimiento[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizarRegistro);
  } catch {
    return [];
  }
}

export function saveCumplimiento(lista: RegistroCumplimiento[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getCumplimientoPeriodo(
  lista: RegistroCumplimiento[],
  clienteId: number,
  periodo: Periodo
): RegistroCumplimiento | undefined {
  return lista.find(
    (r) =>
      r.clienteId === clienteId &&
      r.mes === periodo.mes &&
      r.anio === periodo.anio
  );
}

export function getDocumentoSingular(
  reg: RegistroCumplimiento | undefined,
  tipo: TipoDocumentoSingular
): DocumentoHacienda | undefined {
  if (!reg) return undefined;
  return reg[tipo];
}

export function contarArchivosNomina(reg: RegistroCumplimiento | undefined): number {
  return reg?.nomina?.length ?? 0;
}

export function impuestosConMetadata(reg: RegistroCumplimiento | undefined): boolean {
  return (
    !!reg?.impuestos &&
    reg.montoImpuesto > 0 &&
    !!reg.fechaLimite.trim()
  );
}

export function cumplimientoListo(reg: RegistroCumplimiento | undefined): boolean {
  return impuestosConMetadata(reg);
}

export function puedeNotificarCumplimiento(
  reg: RegistroCumplimiento | undefined
): boolean {
  return cumplimientoListo(reg);
}

export function registroTieneContenido(reg: RegistroCumplimiento | undefined): boolean {
  if (!reg) return false;
  return (
    !!reg.declaracion ||
    !!reg.impuestos ||
    !!reg.imss ||
    (reg.nomina?.length ?? 0) > 0
  );
}

export function formatFechaCumplimiento(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFechaLimiteImpuesto(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  if (!y || !m || !d) return fecha;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatMontoImpuesto(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

export function labelPeriodoCumplimiento(r: RegistroCumplimiento): string {
  return periodoLabel({ mes: r.mes, anio: r.anio });
}

export function estadoCumplimientoCliente(
  reg: RegistroCumplimiento | undefined
): "pendiente" | "parcial" | "listo" | "notificado" {
  if (!reg?.impuestos) return "pendiente";
  if (reg.notificadoEn && cumplimientoListo(reg)) return "notificado";
  if (cumplimientoListo(reg)) return "listo";
  return "parcial";
}

export function esArchivoXml(doc: DocumentoHacienda): boolean {
  const n = doc.nombreArchivo.toLowerCase();
  return (
    doc.tipoMime.includes("xml") ||
    n.endsWith(".xml")
  );
}

/** @deprecated */
export type TipoDocumentoHacienda = TipoDocumentoSingular;

export function tieneDocumento(
  reg: RegistroCumplimiento | undefined,
  tipo: TipoDocumentoSingular
): boolean {
  return !!getDocumentoSingular(reg, tipo);
}
