import { type Periodo, periodoLabel } from "@/lib/clientes";
import {
  parseFechaLimite,
  diasHastaLimite,
  limiteVencido,
} from "@/lib/cumplimiento-fechas";
import {
  type CategoriaFederales,
  type CategoriaImss,
  type CategoriaEstatales,
  type CategoriaNomina3,
  type ExtemporaneoPorCategoria,
  type LineaCaptura,
  migrarRegistroCategorias,
  asegurarBloques,
  bloquesVacios,
  getTotalImpuestos,
  getFechaLimitePrincipal,
  getFechaLimiteMasProxima,
  registroTieneContenidoCategorias,
  documentosFiscalesCompletos as docsCompletosCategorias,
  documentosCategoriaCompletos,
} from "@/lib/cumplimiento-categorias";

export type {
  CategoriaId,
  LineaCaptura,
  CategoriaFederales,
  CategoriaImss,
  CategoriaEstatales,
  CategoriaNomina3,
  ExtemporaneoPorCategoria,
  BloqueExtemporaneo,
  TipoDocCategoria,
} from "@/lib/cumplimiento-categorias";
export {
  CATEGORIA_META,
  nuevoIdLinea,
  getSubtotalFederales,
  getSubtotalImss,
  getSubtotalEstatales,
  getSubtotalNomina3,
  getTotalImpuestos,
  getSubtotalCategoria,
  getFechaLimiteCategoria,
  getFechaLimitePrincipal,
  getFechaLimiteMasProxima,
  categoriaActivaEnPreview,
  plazoCategoria,
  periodoVencidoSinPago,
  categoriaTieneExtemporaneo,
  bloquesVacios,
  asegurarBloques,
  categoriaConPagoEnRegistro,
  documentosCategoriaCompletos,
} from "@/lib/cumplimiento-categorias";

export type TipoDocumentoCumplimiento =
  | "declaracion"
  | "impuestos"
  | "ema"
  | "eba"
  | "sipare"
  | "imss"
  | "estatales"
  | "nomina3"
  | "nomina"
  | "otros";

/** Documentos de un solo archivo. */
export type TipoDocumentoSingular = Exclude<TipoDocumentoCumplimiento, "nomina">;

export const EMA_NOMBRE_LARGO = "Emisión Mensual Anticipada";
export const EBA_NOMBRE_LARGO = "Emisión Bimestral Anticipada";

export const DOCUMENTO_CUMPLIMIENTO_LABELS: Record<TipoDocumentoCumplimiento, string> = {
  declaracion: "Declaración",
  impuestos: "Impuestos",
  ema: "EMA",
  eba: "EBA",
  sipare: "SIPARE",
  imss: "SIPARE",
  estatales: "Línea de captura",
  nomina3: "Línea de captura",
  nomina: "Nómina",
  otros: "Otros",
};

export { MAX_PDF_EMA_EBA } from "@/lib/cumplimiento-categorias";

/** @deprecated Use DOCUMENTO_CUMPLIMIENTO_LABELS */
export const DOCUMENTO_HACENDA_LABELS = DOCUMENTO_CUMPLIMIENTO_LABELS;

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
  /** Total informativo (suma de categorías). */
  montoImpuesto: number;
  fechaLimite: string;
  /** @deprecated Use imss.activo */
  aplicaImss: boolean;
  previewPublicadoEn?: string;
  previewNotificadoEn?: string;
  clienteConfirmoPreviewEn?: string;
  /** Validación del previo por categoría (ISO por categoría). */
  previewValidacionCategorias?: Partial<
    Record<import("@/lib/cumplimiento-categorias").CategoriaId, string>
  >;
  federales: CategoriaFederales;
  imss: CategoriaImss;
  estatales: CategoriaEstatales;
  /** @deprecated Use estatales */
  nomina3?: CategoriaEstatales;
  extemporaneo?: ExtemporaneoPorCategoria;
  otros: DocumentoHacienda[];
  comprobantePago?: DocumentoHacienda;
  comprobantePagoSubidoEn?: string;
  recordatorioLimiteEnviadoEn?: string;
  notificadoEn?: string;
  actualizadoEn: string;
  /** Campos legacy (migración v1) */
  declaracion?: DocumentoHacienda;
  impuestos?: DocumentoHacienda;
  nomina?: DocumentoHacienda[];
};

export type FlujoCumplimiento =
  | "sin_previo"
  | "pendiente_validacion"
  | "validado_sin_docs"
  | "docs_publicados"
  | "comprobante_recibido";

export const CUMPLIMIENTO_STORAGE_KEY = "rdc-cumplimiento-v2";
const STORAGE_KEY_V1 = "rdc-cumplimiento-v1";
const STORAGE_KEY = CUMPLIMIENTO_STORAGE_KEY;
export const CUMPLIMIENTO_UPDATED_EVENT = "rdc-cumplimiento-updated";
const DIAS_RECORDATORIO = 5;

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

function migrarRegistroLegacy(r: RegistroCumplimiento): RegistroCumplimiento {
  const out = { ...r, aplicaImss: r.aplicaImss ?? false };
  if (
    out.montoImpuesto > 0 &&
    out.fechaLimite.trim() &&
    !out.previewPublicadoEn &&
    (out.declaracion || out.impuestos)
  ) {
    out.previewPublicadoEn = out.actualizadoEn;
    out.clienteConfirmoPreviewEn = out.clienteConfirmoPreviewEn ?? out.actualizadoEn;
  }
  return out;
}

function normalizarRegistro(raw: RegistroCumplimiento): RegistroCumplimiento {
  let r = migrarRegistroCategorias(migrarRegistroLegacy({ ...raw, aplicaImss: raw.aplicaImss ?? false }));
  if (r.declaracion) r.declaracion = normalizarDocumento(r.declaracion);
  if (r.impuestos) r.impuestos = normalizarDocumento(r.impuestos);
  if (r.comprobantePago) r.comprobantePago = normalizarDocumento(r.comprobantePago);
  if (r.nomina?.length) r.nomina = r.nomina.map((d) => normalizarDocumento(d));
  r = asegurarBloques(r);
  if (r.federales.declaracion) r.federales.declaracion = normalizarDocumento(r.federales.declaracion);
  r.imss.ema = r.imss.ema.filter((d) => d?.nombreArchivo && d.dataUrl).map((d) => normalizarDocumento(d));
  r.imss.eba = r.imss.eba.filter((d) => d?.nombreArchivo && d.dataUrl).map((d) => normalizarDocumento(d));
  if (r.imss.sipare) r.imss.sipare = normalizarDocumento(r.imss.sipare);
  r.estatales.nominas = r.estatales.nominas
    .filter((d) => d?.nombreArchivo && d.dataUrl)
    .map((d) => normalizarDocumento(d));
  r.federales.lineasCaptura = r.federales.lineasCaptura.map((l) => ({
    ...l,
    documento: l.documento ? normalizarDocumento(l.documento) : undefined,
  }));
  r.estatales.lineasCaptura = r.estatales.lineasCaptura.map((l) => ({
    ...l,
    documento: l.documento ? normalizarDocumento(l.documento) : undefined,
  }));
  r.otros = r.otros.map((d) => normalizarDocumento(d));
  r.montoImpuesto = getTotalImpuestos(r);
  const fl = getFechaLimitePrincipal(r);
  if (fl) r.fechaLimite = fl;
  r.aplicaImss = r.imss.activo;
  return r;
}

export function loadCumplimiento(): RegistroCumplimiento[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(STORAGE_KEY_V1);
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RegistroCumplimiento[];
    if (!Array.isArray(parsed)) return [];
    const lista = parsed.map(normalizarRegistro).map(sanitizarRegistroPreview);
    if (!localStorage.getItem(STORAGE_KEY) && lista.length > 0) {
      saveCumplimiento(lista);
    }
    return lista;
  } catch {
    return [];
  }
}

export function saveCumplimiento(lista: RegistroCumplimiento[]): void {
  if (typeof window === "undefined") return;
  const limpia = lista
    .map(sanitizarRegistroPreview)
    .filter((r) => registroPersistible(r));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limpia));
}

/** Quita datos de previo huérfanos (monto/fecha sin preview publicado). */
export function sanitizarRegistroPreview(r: RegistroCumplimiento): RegistroCumplimiento {
  if (r.previewPublicadoEn) return r;
  if (r.montoImpuesto <= 0 && !r.fechaLimite.trim()) return r;
  const vacio = bloquesVacios();
  return {
    ...r,
    montoImpuesto: 0,
    fechaLimite: "",
    aplicaImss: false,
    clienteConfirmoPreviewEn: undefined,
    previewNotificadoEn: undefined,
    declaracion: undefined,
    impuestos: undefined,
    federales: vacio.federales,
    imss: vacio.imss,
    estatales: vacio.estatales,
    extemporaneo: {},
    otros: [],
    comprobantePago: undefined,
    comprobantePagoSubidoEn: undefined,
    notificadoEn: undefined,
    recordatorioLimiteEnviadoEn: undefined,
  };
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
  tipo: TipoDocumentoSingular,
  lineaId?: string
): DocumentoHacienda | undefined {
  if (!reg) return undefined;
  const r = asegurarBloques(reg);
  if (tipo === "declaracion") return r.federales.declaracion;
  if (tipo === "sipare" || tipo === "imss") return r.imss.sipare;
  if (tipo === "impuestos") {
    if (lineaId) {
      return r.federales.lineasCaptura.find((l) => l.id === lineaId)?.documento;
    }
    return (
      r.federales.lineasCaptura.find((l) => l.documento)?.documento ??
      reg.impuestos
    );
  }
  if (tipo === "ema") return undefined;
  if (tipo === "eba") return undefined;
  if (tipo === "estatales" || tipo === "nomina3") {
    if (lineaId) {
      return r.estatales.lineasCaptura.find((l) => l.id === lineaId)?.documento;
    }
    return r.estatales.lineasCaptura.find((l) => l.documento)?.documento;
  }
  if (tipo === "otros") return undefined;
  return undefined;
}

export function getArchivosNomina(reg: RegistroCumplimiento | undefined): DocumentoHacienda[] {
  if (!reg) return [];
  return asegurarBloques(reg).estatales.nominas;
}

export function contarArchivosNomina(reg: RegistroCumplimiento | undefined): number {
  return getArchivosNomina(reg).length;
}

export function getDocsImss(
  reg: RegistroCumplimiento | undefined,
  tipo: "ema" | "eba"
): DocumentoHacienda[] {
  if (!reg) return [];
  const r = asegurarBloques(reg);
  return tipo === "ema" ? r.imss.ema : r.imss.eba;
}

export function documentoImssEnSlot(
  reg: RegistroCumplimiento | undefined,
  tipo: "ema" | "eba",
  slot: number
): DocumentoHacienda | undefined {
  return getDocsImss(reg, tipo)[slot];
}

export function tieneResumenImpuestos(reg: RegistroCumplimiento | undefined): boolean {
  if (!reg) return false;
  return getTotalImpuestos(reg) > 0;
}

export function previewPublicado(reg: RegistroCumplimiento | undefined): boolean {
  return !!reg?.previewPublicadoEn && tieneResumenImpuestos(reg);
}

export function clienteConfirmoPreview(reg: RegistroCumplimiento | undefined): boolean {
  return !!reg?.clienteConfirmoPreviewEn;
}

export function adminPuedeSubirPdf(
  reg: RegistroCumplimiento | undefined,
  _tipo?: TipoDocumentoSingular
): boolean {
  return !!reg && clienteConfirmoPreview(reg);
}

export function documentosFiscalesCompletos(
  reg: RegistroCumplimiento | undefined,
  categoriasPermitidas?: import("@/lib/cumplimiento-categorias").CategoriaId[]
): boolean {
  return docsCompletosCategorias(reg, categoriasPermitidas);
}

export function clientePuedeSubirComprobante(
  reg: RegistroCumplimiento | undefined,
  categoriasPermitidas?: import("@/lib/cumplimiento-categorias").CategoriaId[]
): boolean {
  if (!reg) return false;
  return (
    clienteConfirmoPreview(reg) &&
    documentosFiscalesCompletos(reg, categoriasPermitidas)
  );
}

export function impuestosConMetadata(reg: RegistroCumplimiento | undefined): boolean {
  return (
    !!reg?.impuestos &&
    reg.montoImpuesto > 0 &&
    !!reg.fechaLimite.trim()
  );
}

export function cumplimientoListo(reg: RegistroCumplimiento | undefined): boolean {
  return documentosFiscalesCompletos(reg) && tieneResumenImpuestos(reg);
}

export function puedeNotificarCumplimiento(
  reg: RegistroCumplimiento | undefined,
  categoriasPermitidas?: import("@/lib/cumplimiento-categorias").CategoriaId[]
): boolean {
  if (!reg || !tieneResumenImpuestos(reg) || !clienteConfirmoPreview(reg)) return false;
  return documentosFiscalesCompletos(reg, categoriasPermitidas);
}

export function puedeNotificarCategoria(
  reg: RegistroCumplimiento | undefined,
  cat: import("@/lib/cumplimiento-categorias").CategoriaId
): boolean {
  if (!reg || !clienteConfirmoPreview(reg)) return false;
  return documentosCategoriaCompletos(reg, cat);
}

export function puedeNotificarPreview(
  reg: RegistroCumplimiento | undefined
): boolean {
  return previewPublicado(reg) && !clienteConfirmoPreview(reg);
}

export function registroTieneContenido(reg: RegistroCumplimiento | undefined): boolean {
  return registroTieneContenidoCategorias(reg);
}

export function registroPersistible(reg: RegistroCumplimiento): boolean {
  return registroTieneContenido(reg);
}

export function getFlujoCumplimiento(
  reg: RegistroCumplimiento | undefined
): FlujoCumplimiento {
  if (!reg || !previewPublicado(reg)) return "sin_previo";
  if (!clienteConfirmoPreview(reg)) return "pendiente_validacion";
  if (reg.comprobantePago) return "comprobante_recibido";
  if (documentosFiscalesCompletos(reg)) return "docs_publicados";
  return "validado_sin_docs";
}

export const FLUJO_CUMPLIMIENTO_LABELS: Record<FlujoCumplimiento, string> = {
  sin_previo: "Sin previo",
  pendiente_validacion: "Pend. validación cliente",
  validado_sin_docs: "Validado · subir PDFs",
  docs_publicados: "PDFs publicados",
  comprobante_recibido: "Comprobante recibido",
};

export {
  parseFechaLimite,
  diasHastaLimite,
  progresoPlazoImpuestos,
  limiteVencido,
} from "@/lib/cumplimiento-fechas";

export function debeMostrarAlertaLimite(
  reg: RegistroCumplimiento | undefined,
  hoy = new Date()
): boolean {
  if (!reg?.fechaLimite.trim() || !clienteConfirmoPreview(reg)) return false;
  const dias = diasHastaLimite(reg.fechaLimite, hoy);
  if (dias === null) return false;
  return dias >= 0 && dias <= DIAS_RECORDATORIO;
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
  const dt = parseFechaLimite(fecha);
  if (!dt) return fecha;
  return dt.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Fecha sin día de la semana: «23 de mayo de 2026». */
export function formatFechaLimiteImpuestoCorta(fecha: string): string {
  const dt = parseFechaLimite(fecha);
  if (!dt) return fecha;
  return dt.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Solo día de la semana: «sábado». */
export function formatFechaLimiteDiaSemana(fecha: string): string {
  const dt = parseFechaLimite(fecha);
  if (!dt) return "";
  const dia = dt.toLocaleDateString("es-MX", { weekday: "long" });
  return dia ? dia.charAt(0).toUpperCase() + dia.slice(1) : "";
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
  const flujo = getFlujoCumplimiento(reg);
  if (flujo === "sin_previo" || flujo === "pendiente_validacion") return "pendiente";
  if (flujo === "validado_sin_docs") return "parcial";
  if (reg?.notificadoEn && cumplimientoListo(reg)) return "notificado";
  if (flujo === "docs_publicados" || flujo === "comprobante_recibido") return "listo";
  return "parcial";
}

export function esArchivoXml(doc: DocumentoHacienda | null | undefined): boolean {
  if (!doc?.nombreArchivo) return false;
  const n = doc.nombreArchivo.toLowerCase();
  return (doc.tipoMime?.includes("xml") ?? false) || n.endsWith(".xml");
}

/** @deprecated */
export type TipoDocumentoHacienda = TipoDocumentoSingular;

export function tieneDocumento(
  reg: RegistroCumplimiento | undefined,
  tipo: TipoDocumentoSingular
): boolean {
  return !!getDocumentoSingular(reg, tipo);
}

export function documentoAdminCargado(
  reg: RegistroCumplimiento | undefined,
  tipo: TipoDocumentoSingular
): boolean {
  if (!reg) return false;
  const r = asegurarBloques(reg);
  if (tipo === "declaracion") return !!r.federales.declaracion;
  if (tipo === "ema") return r.imss.ema.length > 0;
  if (tipo === "eba") return r.imss.eba.length > 0;
  if (tipo === "sipare" || tipo === "imss") return !!r.imss.sipare;
  if (tipo === "impuestos") {
    return r.federales.lineasCaptura.some((l) => !!l.documento);
  }
  if (tipo === "estatales" || tipo === "nomina3") {
    return r.estatales.lineasCaptura.some((l) => !!l.documento);
  }
  if (tipo === "otros") return r.otros.length > 0;
  return false;
}

export { DIAS_RECORDATORIO };
