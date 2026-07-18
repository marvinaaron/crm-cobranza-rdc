import type { DocumentoHacienda, RegistroCumplimiento } from "@/lib/cumplimiento";
import {
  diasHastaLimite,
  progresoPlazoImpuestos,
  limiteVencido,
} from "@/lib/cumplimiento-fechas";

export type CategoriaId = "federales" | "imss" | "estatales";

export type LineaCaptura = {
  id: string;
  etiqueta: string;
  monto: number;
  fechaLimite: string;
  documento?: DocumentoHacienda;
};

export type CategoriaFederales = {
  declaracion?: DocumentoHacienda;
  lineasCaptura: LineaCaptura[];
};

export const MAX_PDF_EMA_EBA = 2;

export type CategoriaImss = {
  activo: boolean;
  monto: number;
  fechaLimite: string;
  /** Emisión Mensual Anticipada (hasta 2 PDF por periodo). */
  ema: DocumentoHacienda[];
  /** Emisión Bimestral Anticipada (hasta 2 PDF por periodo). */
  eba: DocumentoHacienda[];
  sipare?: DocumentoHacienda;
  /** @deprecated Nóminas ahora en estatales.nominas */
  nominas?: DocumentoHacienda[];
};

export type CategoriaEstatales = {
  activo: boolean;
  monto: number;
  fechaLimite: string;
  /** PDF y XML de nómina del periodo. */
  nominas: DocumentoHacienda[];
  lineasCaptura: LineaCaptura[];
};

/** @deprecated Use CategoriaEstatales */
export type CategoriaNomina3 = CategoriaEstatales;

export type BloqueExtemporaneo = {
  lineas: LineaCaptura[];
  publicadoEn: string;
};

export type ExtemporaneoPorCategoria = Partial<Record<CategoriaId, BloqueExtemporaneo>>;

export type TipoDocCategoria =
  | "declaracion"
  | "ema"
  | "eba"
  | "sipare"
  | "otros";

export const CATEGORIA_META: Record<
  CategoriaId,
  { label: string; descripcion: string; border: string; bg: string; accent: string; bar: string }
> = {
  federales: {
    label: "SAT",
    descripcion: "Declaración e impuestos federales (SAT). Puede haber varias líneas de captura.",
    border: "border-blue-100",
    bg: "bg-blue-50/70",
    accent: "text-blue-700",
    bar: "bg-blue-600",
  },
  imss: {
    label: "IMSS",
    descripcion: "SIPARE (línea de captura) y documentos complementarios EMA y EBA.",
    border: "border-emerald-100",
    bg: "bg-emerald-50/70",
    accent: "text-emerald-700",
    bar: "bg-emerald-600",
  },
  estatales: {
    label: "Impuestos estatales",
    descripcion: "Nómina (PDF/XML) y línea de captura de impuestos estatales.",
    border: "border-violet-100",
    bg: "bg-violet-50/70",
    accent: "text-violet-700",
    bar: "bg-violet-600",
  },
};

/** Conceptos federales disponibles al armar el previo de impuestos. */
export const CONCEPTOS_FEDERALES = [
  "ISR",
  "IVA",
  "Retenciones Salarios",
  "ISR Retenido",
  "IVA Retenido",
] as const;

export type ConceptoFederal = (typeof CONCEPTOS_FEDERALES)[number];

export function nuevoIdLinea(): string {
  return `lin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function bloquesVacios(): {
  federales: CategoriaFederales;
  imss: CategoriaImss;
  estatales: CategoriaEstatales;
} {
  return {
    federales: { lineasCaptura: [] },
    imss: { activo: false, monto: 0, fechaLimite: "", ema: [], eba: [] },
    estatales: { activo: false, monto: 0, fechaLimite: "", nominas: [], lineasCaptura: [] },
  };
}

function esDocHacienda(x: unknown): x is DocumentoHacienda {
  return (
    !!x &&
    typeof x === "object" &&
    typeof (x as DocumentoHacienda).dataUrl === "string" &&
    (x as DocumentoHacienda).dataUrl.length > 0 &&
    typeof (x as DocumentoHacienda).nombreArchivo === "string" &&
    (x as DocumentoHacienda).nombreArchivo.length > 0
  );
}

function migrarDocAArray(
  val: DocumentoHacienda | DocumentoHacienda[] | undefined
): DocumentoHacienda[] {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [val];
  return arr.filter(esDocHacienda);
}

function leerEstatales(reg: RegistroCumplimiento & { nomina3?: CategoriaEstatales }): CategoriaEstatales {
  return reg.estatales ?? reg.nomina3 ?? bloquesVacios().estatales;
}

export function asegurarBloques(reg: RegistroCumplimiento): RegistroCumplimiento {
  const b = bloquesVacios();
  const imssRaw = (reg as { imss?: unknown }).imss;
  const legacyImssDoc = esDocHacienda(imssRaw) ? imssRaw : undefined;
  const imssBlock =
    reg.imss && typeof reg.imss === "object" && "activo" in reg.imss
      ? reg.imss
      : b.imss;
  const estatalesBlock = leerEstatales(reg as RegistroCumplimiento & { nomina3?: CategoriaEstatales });

  return {
    ...reg,
    federales: {
      declaracion: reg.federales?.declaracion ?? reg.declaracion,
      lineasCaptura: reg.federales?.lineasCaptura ?? [],
    },
    imss: {
      activo: imssBlock.activo ?? reg.aplicaImss ?? false,
      monto: imssBlock.monto ?? 0,
      fechaLimite: imssBlock.fechaLimite ?? "",
      ema: migrarDocAArray(imssBlock.ema as DocumentoHacienda | DocumentoHacienda[]).slice(
        0,
        MAX_PDF_EMA_EBA
      ),
      eba: migrarDocAArray(imssBlock.eba as DocumentoHacienda | DocumentoHacienda[]).slice(
        0,
        MAX_PDF_EMA_EBA
      ),
      sipare: imssBlock.sipare ?? legacyImssDoc,
    },
    estatales: {
      ...estatalesBlock,
      nominas: [
        ...migrarDocAArray(estatalesBlock.nominas as DocumentoHacienda[] | undefined),
        ...migrarDocAArray(imssBlock.nominas),
        ...(reg.nomina ?? []),
      ],
      lineasCaptura: estatalesBlock.lineasCaptura ?? [],
    },
    extemporaneo: reg.extemporaneo ?? {},
    otros: reg.otros ?? [],
  };
}

/** Migra registro v1 (campos planos) a estructura por categorías. */
export function migrarRegistroCategorias(raw: RegistroCumplimiento): RegistroCumplimiento {
  let r = asegurarBloques({ ...raw });

  if (r.declaracion && !r.federales.declaracion) {
    r.federales.declaracion = r.declaracion;
  }

  if (r.impuestos && !r.federales.lineasCaptura.some((l) => l.documento?.id === r.impuestos?.id)) {
    r.federales.lineasCaptura.push({
      id: nuevoIdLinea(),
      etiqueta: "Impuestos federales",
      monto: r.montoImpuesto || 0,
      fechaLimite: r.fechaLimite ?? "",
      documento: r.impuestos,
    });
  } else if (
    r.montoImpuesto > 0 &&
    r.fechaLimite &&
    !r.federales.lineasCaptura.length &&
    r.previewPublicadoEn
  ) {
    r.federales.lineasCaptura = [
      {
        id: nuevoIdLinea(),
        etiqueta: "Impuestos federales",
        monto: r.montoImpuesto,
        fechaLimite: r.fechaLimite,
      },
    ];
  }

  if (r.aplicaImss) {
    r.imss.activo = true;
  }

  r.montoImpuesto = getTotalImpuestos(r);
  const fLim = getFechaLimitePrincipal(r);
  if (fLim) r.fechaLimite = fLim;
  r.aplicaImss = r.imss.activo;

  return r;
}

export function getSubtotalFederales(reg: RegistroCumplimiento): number {
  const r = asegurarBloques(reg);
  return r.federales.lineasCaptura.reduce((s, l) => s + (l.monto || 0), 0);
}

export function getSubtotalImss(reg: RegistroCumplimiento): number {
  const r = asegurarBloques(reg);
  return r.imss.activo ? r.imss.monto : 0;
}

export function getSubtotalEstatales(reg: RegistroCumplimiento): number {
  const r = asegurarBloques(reg);
  if (!r.estatales.activo) return 0;
  const lineas = r.estatales.lineasCaptura.reduce((s, l) => s + (l.monto || 0), 0);
  return r.estatales.monto + lineas;
}

/** @deprecated Use getSubtotalEstatales */
export const getSubtotalNomina3 = getSubtotalEstatales;

export function getTotalImpuestos(reg: RegistroCumplimiento | undefined): number {
  if (!reg) return 0;
  return getSubtotalFederales(reg) + getSubtotalImss(reg) + getSubtotalEstatales(reg);
}

export function getFechaLimiteCategoria(
  reg: RegistroCumplimiento,
  cat: CategoriaId
): string {
  const r = asegurarBloques(reg);
  if (cat === "federales") {
    const fechas = r.federales.lineasCaptura
      .map((l) => l.fechaLimite)
      .filter(Boolean)
      .sort();
    return fechas[fechas.length - 1] ?? "";
  }
  if (cat === "imss") return r.imss.activo ? r.imss.fechaLimite : "";
  if (cat === "estatales") {
    if (!r.estatales.activo) return "";
    const fechas = [
      r.estatales.fechaLimite,
      ...r.estatales.lineasCaptura.map((l) => l.fechaLimite),
    ].filter(Boolean);
    return fechas.sort().pop() ?? "";
  }
  return "";
}

export function getFechaLimitePrincipal(reg: RegistroCumplimiento): string {
  const fechas = (["federales", "imss", "estatales"] as CategoriaId[])
    .map((c) => getFechaLimiteCategoria(reg, c))
    .filter(Boolean)
    .sort();
  return fechas[fechas.length - 1] ?? reg.fechaLimite ?? "";
}

/** Fecha límite más próxima a vencer (la menor entre las categorías indicadas). */
export function getFechaLimiteMasProxima(
  reg: RegistroCumplimiento,
  categorias?: CategoriaId[]
): string {
  const cats = categorias ?? (["federales", "imss", "estatales"] as CategoriaId[]);
  const fechas = cats
    .map((c) => getFechaLimiteCategoria(reg, c))
    .filter(Boolean)
    .sort();
  return fechas[0] ?? reg.fechaLimite ?? "";
}

export function categoriaActivaEnPreview(reg: RegistroCumplimiento, cat: CategoriaId): boolean {
  const r = asegurarBloques(reg);
  if (cat === "federales") return r.federales.lineasCaptura.length > 0;
  if (cat === "imss") return r.imss.activo;
  if (cat === "estatales") return r.estatales.activo;
  return false;
}

export function getSubtotalCategoria(reg: RegistroCumplimiento, cat: CategoriaId): number {
  if (cat === "federales") return getSubtotalFederales(reg);
  if (cat === "imss") return getSubtotalImss(reg);
  return getSubtotalEstatales(reg);
}

export function plazoCategoria(
  reg: RegistroCumplimiento,
  cat: CategoriaId,
  desdeIso?: string
) {
  const ext = reg.extemporaneo?.[cat]?.lineas[0];
  const fecha =
    ext?.fechaLimite || getFechaLimiteCategoria(reg, cat);
  if (!fecha) return null;
  const desde =
    desdeIso ??
    reg.extemporaneo?.[cat]?.publicadoEn ??
    reg.clienteConfirmoPreviewEn ??
    reg.previewPublicadoEn;
  return {
    fecha,
    dias: diasHastaLimite(fecha),
    vencido: limiteVencido(fecha),
    progreso: progresoPlazoImpuestos(fecha, desde),
  };
}

export function getComprobantePagoCategoria(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId
): DocumentoHacienda | undefined {
  if (!reg) return undefined;
  const doc = reg.comprobantePagoCategorias?.[cat];
  if (doc?.nombreArchivo && doc.dataUrl) return doc;
  return undefined;
}

export function tieneComprobantePagoCategoria(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId
): boolean {
  return !!getComprobantePagoCategoria(reg, cat);
}

export function pagoValidadoCategoria(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId
): boolean {
  return !!reg?.pagoValidadoCategorias?.[cat];
}

export function todosPagosValidados(
  reg: RegistroCumplimiento | undefined,
  categoriasPermitidas?: CategoriaId[]
): boolean {
  if (!reg) return false;
  const cats = categoriasPermitidas ?? (["federales", "imss", "estatales"] as CategoriaId[]);
  const conPago = cats.filter((cat) => categoriaConPagoEnRegistro(reg, cat));
  if (!conPago.length) return false;
  return conPago.every((cat) => pagoValidadoCategoria(reg, cat));
}

export function todosComprobantesPagoCargados(
  reg: RegistroCumplimiento | undefined,
  categoriasPermitidas?: CategoriaId[]
): boolean {
  if (!reg) return false;
  const cats = categoriasPermitidas ?? (["federales", "imss", "estatales"] as CategoriaId[]);
  const conPago = cats.filter((cat) => categoriaConPagoEnRegistro(reg, cat));
  if (!conPago.length) return false;
  return conPago.every(
    (cat) => tieneComprobantePagoCategoria(reg, cat) || !!reg.comprobantePago
  );
}

export function periodoVencidoSinPago(reg: RegistroCumplimiento | undefined): boolean {
  if (!reg?.previewPublicadoEn) return false;
  if (reg.comprobantePago) return false;
  const cats = ["federales", "imss", "estatales"] as CategoriaId[];
  const conPago = cats.filter((cat) => categoriaConPagoEnRegistro(reg, cat));
  if (!conPago.length) {
    const fl = getFechaLimitePrincipal(reg);
    return !!fl && limiteVencido(fl);
  }
  return conPago.some((cat) => {
    if (tieneComprobantePagoCategoria(reg, cat)) return false;
    const fl = getFechaLimiteCategoria(reg, cat);
    return !!fl && limiteVencido(fl);
  });
}

/**
 * Devuelve las categorías cuya fecha límite ya venció sin que el cliente haya
 * subido su comprobante de pago. Solo considera categorías con pago en el preview.
 */
export function categoriasVencidasSinPago(
  reg: RegistroCumplimiento | undefined
): CategoriaId[] {
  if (!reg?.previewPublicadoEn) return [];
  if (reg.comprobantePago) return [];
  const cats = ["federales", "imss", "estatales"] as CategoriaId[];
  return cats.filter((cat) => {
    if (!categoriaConPagoEnRegistro(reg, cat)) return false;
    if (tieneComprobantePagoCategoria(reg, cat)) return false;
    const fl = getFechaLimiteCategoria(reg, cat);
    return !!fl && limiteVencido(fl);
  });
}

export function categoriaTieneExtemporaneo(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId
): boolean {
  if (!reg?.extemporaneo?.[cat]?.lineas.length) return false;
  return true;
}

export function categoriaConPagoEnRegistro(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId
): boolean {
  if (!reg) return false;
  const r = asegurarBloques(reg);
  return categoriaActivaEnPreview(r, cat) && getSubtotalCategoria(r, cat) > 0;
}

export function categoriaTieneAlgunDocumento(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId
): boolean {
  if (!reg) return false;
  const r = asegurarBloques(reg);
  if (cat === "federales") {
    if (r.federales.declaracion) return true;
    return r.federales.lineasCaptura.some((l) => !!l.documento);
  }
  if (cat === "imss") {
    return !!r.imss.sipare || r.imss.ema.length > 0 || r.imss.eba.length > 0;
  }
  if (r.estatales.nominas.length > 0) return true;
  return r.estatales.lineasCaptura.some((l) => !!l.documento);
}

export function algunDocumentoFiscalSubido(
  reg: RegistroCumplimiento | undefined,
  categoriasPermitidas?: CategoriaId[]
): boolean {
  if (!reg) return false;
  const cats = categoriasPermitidas ?? (["federales", "imss", "estatales"] as CategoriaId[]);
  return cats.some((cat) => categoriaTieneAlgunDocumento(reg, cat));
}

export function algunComprobantePagoCargado(
  reg: RegistroCumplimiento | undefined,
  categoriasPermitidas?: CategoriaId[]
): boolean {
  if (!reg) return !!reg;
  const cats = categoriasPermitidas ?? (["federales", "imss", "estatales"] as CategoriaId[]);
  return (
    !!reg.comprobantePago ||
    cats.some((cat) => tieneComprobantePagoCategoria(reg, cat))
  );
}

export function algunPagoValidado(
  reg: RegistroCumplimiento | undefined,
  categoriasPermitidas?: CategoriaId[]
): boolean {
  if (!reg) return false;
  const cats = categoriasPermitidas ?? (["federales", "imss", "estatales"] as CategoriaId[]);
  return cats.some((cat) => pagoValidadoCategoria(reg, cat));
}

export function documentosCategoriaCompletos(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId
): boolean {
  if (!reg || !categoriaConPagoEnRegistro(reg, cat)) return false;
  const r = asegurarBloques(reg);

  if (cat === "federales") {
    if (!r.federales.declaracion) return false;
    if (r.federales.lineasCaptura.length === 0) return false;
    return r.federales.lineasCaptura.every((l) => !!l.documento);
  }

  if (cat === "imss") {
    return !!r.imss.sipare && r.imss.ema.length >= 1 && r.imss.eba.length >= 1;
  }

  if (r.estatales.lineasCaptura.length === 0) return false;
  return r.estatales.lineasCaptura.every((l) => !!l.documento);
}

export function documentosFiscalesCompletos(
  reg: RegistroCumplimiento | undefined,
  categoriasPermitidas?: CategoriaId[]
): boolean {
  if (!reg) return false;
  const cats = categoriasPermitidas ?? (["federales", "imss", "estatales"] as CategoriaId[]);
  const catsConPago = cats.filter((cat) => categoriaConPagoEnRegistro(reg, cat));
  return catsConPago.every((cat) => documentosCategoriaCompletos(reg, cat));
}

export function registroTieneContenidoCategorias(reg: RegistroCumplimiento | undefined): boolean {
  if (!reg) return false;
  const r = asegurarBloques(reg);
  const tieneExt = Object.values(reg.extemporaneo ?? {}).some(
    (b) => b && b.lineas.length > 0
  );
  return (
    !!reg.previewPublicadoEn ||
    !!r.federales.declaracion ||
    r.federales.lineasCaptura.length > 0 ||
    r.imss.activo ||
    r.imss.ema.length > 0 ||
    r.imss.eba.length > 0 ||
    !!r.imss.sipare ||
    r.estatales.nominas.length > 0 ||
    r.estatales.activo ||
    r.estatales.lineasCaptura.length > 0 ||
    r.otros.length > 0 ||
    !!reg.comprobantePago ||
    tieneExt
  );
}
