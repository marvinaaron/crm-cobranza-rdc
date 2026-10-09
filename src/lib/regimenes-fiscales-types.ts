export type TipoPersonaRegimen = "pf" | "pm";

export type RegimenSlug =
  | "sueldos-salarios"
  | "resico"
  | "actividades-empresariales"
  | "arrendamiento"
  | "plataformas-tecnologicas"
  | "rif"
  | "regimen-general"
  | "fines-no-lucrativos";

export type MarcoLegalRef = {
  referencia: string;
  texto: string;
};

export type GuiaAclaracion = {
  titulo: string;
  texto: string;
  /** alerta = concepto que confunde; tip = dato útil */
  tipo?: "alerta" | "tip";
};

export type GuiaCalculoIsr = {
  titulo: string;
  resumen: string;
  formula: string;
  pasos: string[];
  aclaraciones: GuiaAclaracion[];
};

export type GuiaTope = {
  label: string;
  valor: string;
  detalle?: string;
};

export type GuiaComparativa = {
  titulo: string;
  columnas: string[];
  filas: { aspecto: string; valores: string[] }[];
};

export type GuiaArticulo = {
  titulo: string;
  parrafos: string[];
};

export type GuiaHerramienta = {
  href: string;
  label: string;
  texto: string;
};

export type GuiaEnriquecida = {
  calculoIsr: GuiaCalculoIsr;
  topes: GuiaTope[];
  comparativa?: GuiaComparativa;
  articulos?: GuiaArticulo[];
  herramientasRelacionadas?: GuiaHerramienta[];
};

export type RegimenServicio = {
  slug: RegimenSlug;
  codigoSat: string;
  nombreCompleto: string;
  tipoPersona: TipoPersonaRegimen;
  titulo: string;
  subtitulo: string;
  badge: string;
  introSeo: string;
  metaDescription: string;
  keywords: string[];
  heroFrom: string;
  heroTo: string;
  iconBg: string;
  iconColor: string;
  peculiaridades: { titulo: string; texto: string }[];
  marcoLegal: MarcoLegalRef[];
  paraQuien: string[];
  queHacemos: { titulo: string; texto: string }[];
  cumplimiento: string[];
  portal: string[];
  precio?: { monto?: string; nota: string };
  herramienta?: { href: string; label: string };
  guia: GuiaEnriquecida;
};

/** Datos de página sin el bloque guía (se fusiona en servicios-regimenes). */
export type RegimenServicioBase = Omit<RegimenServicio, "guia">;
