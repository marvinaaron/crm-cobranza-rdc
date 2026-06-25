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
  todosComprobantesPagoCargados as todosComprobantesPagoCargadosCat,
  todosPagosValidados as todosPagosValidadosCat,
  algunDocumentoFiscalSubido as algunDocSubidoCat,
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
  categoriasVencidasSinPago,
  categoriaTieneExtemporaneo,
  bloquesVacios,
  asegurarBloques,
  categoriaConPagoEnRegistro,
  documentosCategoriaCompletos,
  getComprobantePagoCategoria,
  tieneComprobantePagoCategoria,
  todosComprobantesPagoCargados,
  pagoValidadoCategoria,
  todosPagosValidados,
  categoriaTieneAlgunDocumento,
  algunDocumentoFiscalSubido,
  algunComprobantePagoCargado,
  algunPagoValidado,
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

/** PDF aún disponible para ver/descargar en el portal. */
export function documentoPdfDisponible(
  doc: DocumentoHacienda | null | undefined
): boolean {
  return !!doc?.nombreArchivo && !!doc.dataUrl;
}

/** Se subió pero el archivo ya se purgó (retención 3 meses). */
export function documentoPdfArchivado(
  doc: DocumentoHacienda | null | undefined
): boolean {
  return !!doc?.nombreArchivo && !doc.dataUrl;
}

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
  /** Fecha ISO cuando el admin marcó "Iniciando contabilidad" (antes de publicar el previo). */
  contabilidadIniciadaEn?: string;
  /** Cuando es true, el cliente no causa impuestos este periodo (declaración en ceros). */
  sinPagoImpuestos?: boolean;
  /** Fecha ISO en que se marcó "sin pago". */
  sinPagoMarcadoEn?: string;
  /** Motivo opcional reportado por el admin. */
  sinPagoMotivo?: "sin_operaciones" | "saldo_favor" | "otro";
  /**
   * Saldo a favor capturado por el admin (varios conceptos federales posibles).
   */
  saldoFavor?: {
    activo: boolean;
    lineas?: { etiqueta: string; monto: number }[];
    /** @deprecated Usar `lineas`. Conservado para registros antiguos. */
    isr?: number;
    /** @deprecated Usar `lineas`. Conservado para registros antiguos. */
    iva?: number;
    capturadoEn?: string;
  };
  /** Por categoría: fecha ISO en que se notificó al cliente que el plazo venció sin comprobante. */
  vencimientoNotificadoEn?: Partial<
    Record<import("@/lib/cumplimiento-categorias").CategoriaId, string>
  >;
  /** Escalones de recordatorio fiscal ya enviados (sat_d1, federales_d7, …). */
  alertasEscalamientoEn?: Record<string, string>;
  /**
   * Fecha ISO en que se notificó al cliente que el mes cerró al 100%
   * (workflow en paso 7). Marca este registro para que la push de
   * cierre se mande UNA sola vez por periodo, aunque el cliente lea o
   * borre la notificación.
   */
  cierreMesNotificadoEn?: string;
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
  /** @deprecated Use comprobantePagoCategorias. Comprobante único legacy. */
  comprobantePago?: DocumentoHacienda;
  /** @deprecated Subida del comprobante legacy. */
  comprobantePagoSubidoEn?: string;
  /** Comprobante de pago del cliente por categoría. */
  comprobantePagoCategorias?: Partial<
    Record<import("@/lib/cumplimiento-categorias").CategoriaId, DocumentoHacienda>
  >;
  /** Fecha ISO de cada comprobante por categoría. */
  comprobantePagoCategoriasSubidoEn?: Partial<
    Record<import("@/lib/cumplimiento-categorias").CategoriaId, string>
  >;
  /** Fecha ISO en que el admin validó el pago de cada categoría. */
  pagoValidadoCategorias?: Partial<
    Record<import("@/lib/cumplimiento-categorias").CategoriaId, string>
  >;
  recordatorioLimiteEnviadoEn?: string;
  notificadoEn?: string;
  actualizadoEn: string;
  /** Campos legacy (migración v1) */
  declaracion?: DocumentoHacienda;
  impuestos?: DocumentoHacienda;
  nomina?: DocumentoHacienda[];
};

export type FlujoCumplimiento =
  | "por_trabajar"
  | "iniciando_contabilidad"
  | "preliminar"
  | "aceptacion"
  | "declaraciones"
  | "pago"
  | "completado";

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
  if (r.comprobantePagoCategorias) {
    const mapa: Partial<Record<import("@/lib/cumplimiento-categorias").CategoriaId, DocumentoHacienda>> = {};
    for (const cat of ["federales", "imss", "estatales"] as const) {
      const doc = r.comprobantePagoCategorias[cat];
      if (doc?.nombreArchivo && doc.dataUrl) mapa[cat] = normalizarDocumento(doc);
    }
    r.comprobantePagoCategorias = mapa;
  }
  if (r.pagoValidadoCategorias) {
    const mapa: Partial<Record<import("@/lib/cumplimiento-categorias").CategoriaId, string>> = {};
    for (const cat of ["federales", "imss", "estatales"] as const) {
      const v = r.pagoValidadoCategorias[cat];
      if (typeof v === "string" && v.trim()) mapa[cat] = v;
    }
    r.pagoValidadoCategorias = mapa;
  }
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

/** Indica si el admin marcó explícitamente que ya inició la contabilidad del cliente. */
export function contabilidadIniciada(reg: RegistroCumplimiento | undefined): boolean {
  return !!reg?.contabilidadIniciadaEn;
}

/** Indica si el periodo está marcado como "sin pago de impuestos" (declaración en ceros). */
export function esSinPagoImpuestos(reg: RegistroCumplimiento | undefined): boolean {
  return !!reg?.sinPagoImpuestos;
}

export type LineaSaldoFavor = {
  etiqueta: string;
  monto: number;
};

export type SaldoFavorPeriodo = {
  lineas: LineaSaldoFavor[];
  total: number;
  capturadoEn?: string;
};

/** Une formato nuevo (`lineas`) y legado (`isr` / `iva`). */
export function normalizarSaldoFavorLineas(
  saldo?: RegistroCumplimiento["saldoFavor"]
): LineaSaldoFavor[] {
  if (!saldo) return [];
  if (saldo.lineas?.length) {
    return saldo.lineas.map((l) => ({
      etiqueta: l.etiqueta.trim() || "ISR",
      monto: Math.max(0, Math.round((l.monto ?? 0) * 100) / 100),
    }));
  }
  const legacy: LineaSaldoFavor[] = [];
  if (saldo.isr != null && saldo.isr > 0) {
    legacy.push({
      etiqueta: "ISR",
      monto: Math.max(0, Math.round(saldo.isr * 100) / 100),
    });
  }
  if (saldo.iva != null && saldo.iva > 0) {
    legacy.push({
      etiqueta: "IVA",
      monto: Math.max(0, Math.round(saldo.iva * 100) / 100),
    });
  }
  if (
    legacy.length === 0 &&
    saldo.activo &&
    (saldo.isr != null || saldo.iva != null)
  ) {
    if (saldo.isr != null) {
      legacy.push({
        etiqueta: "ISR",
        monto: Math.max(0, Math.round((saldo.isr ?? 0) * 100) / 100),
      });
    }
    if (saldo.iva != null) {
      legacy.push({
        etiqueta: "IVA",
        monto: Math.max(0, Math.round((saldo.iva ?? 0) * 100) / 100),
      });
    }
  }
  return legacy;
}

/**
 * Lee el saldo a favor del periodo si el admin lo capturó (sin pago o
 * declaración con impuestos mixtos). Devuelve null si no aplica.
 */
export function getSaldoFavorPeriodo(
  reg: RegistroCumplimiento | undefined
): SaldoFavorPeriodo | null {
  if (!reg?.saldoFavor?.activo) return null;
  const lineas = normalizarSaldoFavorLineas(reg.saldoFavor);
  const total = lineas.reduce((s, l) => s + l.monto, 0);
  return {
    lineas,
    total: Math.round(total * 100) / 100,
    capturadoEn: reg.saldoFavor.capturadoEn,
  };
}

export function adminPuedeSubirPdf(
  reg: RegistroCumplimiento | undefined,
  tipo?: TipoDocumentoSingular
): boolean {
  if (!reg) return false;
  // La declaración es informativa: en sin pago, con saldo a favor capturado o
  // tras validación del previo el admin puede subirla sin esperar líneas de captura.
  if (tipo === "declaracion") {
    if (esSinPagoImpuestos(reg)) return true;
    if (reg.saldoFavor?.activo) return true;
    return clienteConfirmoPreview(reg);
  }
  // En modo "sin pago" solo declaración y "otros"; el resto requiere previo validado.
  if (esSinPagoImpuestos(reg)) {
    return tipo === "otros";
  }
  return clienteConfirmoPreview(reg);
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
  if (!reg) return "por_trabajar";

  if (esSinPagoImpuestos(reg)) {
    if (algunDocSubidoCat(reg)) return "completado";
    if (contabilidadIniciada(reg)) return "iniciando_contabilidad";
    return "por_trabajar";
  }

  if (!previewPublicado(reg)) {
    return contabilidadIniciada(reg) ? "iniciando_contabilidad" : "por_trabajar";
  }
  if (!clienteConfirmoPreview(reg)) return "preliminar";
  if (
    todosPagosValidadosCat(reg) &&
    (reg.comprobantePago || todosComprobantesPagoCargadosCat(reg))
  ) {
    return "completado";
  }
  if (reg.comprobantePago || todosComprobantesPagoCargadosCat(reg)) {
    return "pago";
  }
  if (documentosFiscalesCompletos(reg)) return "declaraciones";
  return "aceptacion";
}

/**
 * Etiquetas unificadas del flujo de cumplimiento. Fuente única usada en el
 * portal del cliente, el admin (lista y detalle) y cobranza para que el
 * nombre de cada estado sea idéntico en toda la app.
 */
export const FLUJO_CUMPLIMIENTO_LABELS: Record<FlujoCumplimiento, string> = {
  por_trabajar: "Sin iniciar",
  iniciando_contabilidad: "En preparación",
  preliminar: "Revisión de impuestos",
  aceptacion: "Confirmado",
  declaraciones: "Declarando",
  pago: "Confirmando pago",
  completado: "Completado",
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

/** Formato ultra compacto: «21 MAY 26». */
export function formatFechaLimiteImpuestoCompacta(fecha: string): string {
  const dt = parseFechaLimite(fecha);
  if (!dt) return fecha;
  const dia = dt.getDate();
  const mes = dt
    .toLocaleDateString("es-MX", { month: "short" })
    .replace(/\./g, "")
    .toUpperCase()
    .slice(0, 3);
  const anio = dt.getFullYear().toString().slice(-2);
  return `${dia} ${mes} ${anio}`;
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
  if (
    flujo === "por_trabajar" ||
    flujo === "iniciando_contabilidad" ||
    flujo === "preliminar"
  )
    return "pendiente";
  if (flujo === "aceptacion") return "parcial";
  if (reg?.notificadoEn && cumplimientoListo(reg)) return "notificado";
  if (
    flujo === "declaraciones" ||
    flujo === "pago" ||
    flujo === "completado"
  )
    return "listo";
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
