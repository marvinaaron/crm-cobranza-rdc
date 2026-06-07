/**
 * Presupuestos (cotizaciones) — modelo de datos.
 *
 * Un presupuesto es la propuesta económica que se le comparte a un prospecto
 * o cliente. Vive en la nube junto al resto del CRM (clave `presupuestos`).
 *
 * Todo el cobro de RDC es **mensual**: los conceptos representan servicios con
 * un honorario mensual, y el total del presupuesto es el honorario mensual que
 * pagará el cliente al aceptarlo.
 *
 * El modelo incluye desde ya algunos campos pensados para la fase 2 (link
 * público de aceptación con manejo de objeciones) para no migrar datos después:
 * `token`, `vistoEn`, `objecionMotivo`, `objecionComentario`.
 *
 * Herramienta del propietario: maneja precios/dinero.
 */

export type EstadoPresupuesto =
  | "borrador"
  | "enviado"
  | "aceptado"
  | "rechazado";

export const ESTADO_PRESUPUESTO_META: Record<
  EstadoPresupuesto,
  { label: string; dot: string; chip: string }
> = {
  borrador: {
    label: "Borrador",
    dot: "bg-slate-400",
    chip: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  },
  enviado: {
    label: "Enviado",
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  aceptado: {
    label: "Aceptado",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  rechazado: {
    label: "Rechazado",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
};

/** Un renglón del presupuesto: servicio + descripción + honorario mensual. */
export type ConceptoPresupuesto = {
  id: string;
  servicio: string;
  descripcion: string;
  /** Honorario mensual (subtotal, sin IVA). */
  precio: number;
};

/** Servicio reutilizable del catálogo editable. */
export type ServicioCatalogo = {
  id: string;
  servicio: string;
  descripcion: string;
  /** Honorario mensual sugerido (sin IVA). */
  precioSugerido: number;
  /** Si está activo aparece en el selector al armar un presupuesto. */
  activo: boolean;
};

export type DatosClientePresupuesto = {
  /** Si el presupuesto se armó desde un cliente existente del CRM. */
  clienteId?: number;
  razonSocial: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  /** Giro / sector, ej. "Hoteles". */
  giro?: string;
};

export type MotivoObjecion =
  | "caro"
  | "pensarlo"
  | "tengo_contador"
  | "no_entiendo"
  | "mucho";

export type Presupuesto = {
  id: string;
  /** Folio consecutivo legible, ej. "001-0000139". */
  folio: string;
  /** ISO de la fecha del presupuesto. */
  fecha: string;
  /** Días de vigencia para calcular el vencimiento. */
  vigenciaDias: number;
  cliente: DatosClientePresupuesto;
  conceptos: ConceptoPresupuesto[];
  /** Tasa de IVA aplicada (ej. 0.16). */
  ivaTasa: number;
  notas?: string;
  estado: EstadoPresupuesto;
  creadoEn: string;
  actualizadoEn?: string;
  enviadoEn?: string;
  aceptadoEn?: string;
  rechazadoEn?: string;
  /** Si ya se convirtió en cliente del CRM. */
  convertidoClienteId?: number;
  // ---- Fase 2: link público de aceptación ----
  token?: string;
  vistoEn?: string;
  objecionMotivo?: MotivoObjecion;
  objecionComentario?: string;
};

export const IVA_TASA_DEFAULT = 0.16;
export const VIGENCIA_DIAS_DEFAULT = 7;

/**
 * Primer folio si todavía no existe ningún presupuesto en el sistema.
 * (El último hecho en Canva fue 001-0000138.)
 */
export const FOLIO_INICIAL = 139;
const FOLIO_PREFIJO = "001";

// ---------- IDs ----------
function rid(p: string): string {
  return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
export const nuevoIdPresupuesto = () => rid("pre");
export const nuevoIdConcepto = () => rid("cpt");
export const nuevoIdServicio = () => rid("srv");
export const nuevoTokenPublico = () =>
  `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

// ---------- Folio ----------
export function formatFolio(numero: number): string {
  return `${FOLIO_PREFIJO}-${String(numero).padStart(7, "0")}`;
}

export function parseFolio(folio: string): number {
  const m = folio.match(/(\d+)\s*$/);
  return m ? Number(m[1]) : 0;
}

/** Calcula el siguiente folio consecutivo según los presupuestos existentes. */
export function siguienteFolio(presupuestos: Presupuesto[]): string {
  const maxNum = presupuestos.reduce(
    (max, p) => Math.max(max, parseFolio(p.folio)),
    FOLIO_INICIAL - 1
  );
  return formatFolio(Math.max(maxNum + 1, FOLIO_INICIAL));
}

// ---------- Totales ----------
export type TotalesPresupuesto = {
  subtotal: number;
  iva: number;
  total: number;
};

export function calcularTotales(
  conceptos: ConceptoPresupuesto[],
  ivaTasa: number = IVA_TASA_DEFAULT
): TotalesPresupuesto {
  const subtotal = conceptos.reduce((s, c) => s + (Number(c.precio) || 0), 0);
  const iva = Math.round(subtotal * ivaTasa);
  return { subtotal, iva, total: subtotal + iva };
}

export function montoMensualPresupuesto(p: Presupuesto): number {
  return calcularTotales(p.conceptos, p.ivaTasa).total;
}

export function fechaVencimiento(p: Presupuesto): Date {
  const base = new Date(p.fecha);
  base.setDate(base.getDate() + (p.vigenciaDias || VIGENCIA_DIAS_DEFAULT));
  return base;
}

export function fmtMoneda(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

export function fmtFechaLarga(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ---------- Datos fijos del despacho para el documento ----------
export const DATOS_PRESUPUESTO = {
  despacho: "ROSALES & DE LA CRUZ",
  despachoLinea2: "CONTADORES",
  contactoNombre: "Aarón Rosales López",
  contactoCargo: "C.P. Aarón Rosales",
  contactoEmail: "cp.aaronr@rdcontadores.com",
  contactoTel: "(33) 2203 2992",
  instagram: "@rdccontadores",
  clabe: "0121 8001 5696 966985",
  banco: "BBVA",
  condiciones:
    "Estos servicios comienzan desde el momento de la aceptación y firma de este presupuesto. La fecha de pago de los honorarios mensuales se realizará el mismo día de cada mes.",
  obligatoriedad:
    "Todos los servicios incluidos en este presupuesto forman parte de los requerimientos obligatorios que la autoridad (SAT) le solicita. Cada obligación es diferente, para lo cual estamos listos para brindarte la ayuda que requieres.",
  cierre:
    "Nuestro objetivo será asegurar la integridad y exactitud de tus registros financieros, garantizar el cumplimiento normativo y fiscal de tu negocio, y contribuir a su éxito. Estamos complacidos de poder ser parte de tu empresa.",
} as const;

// ---------- Catálogo por defecto (editable desde la sección) ----------
export const CATALOGO_DEFAULT: ServicioCatalogo[] = [
  {
    id: "cat_contabilidad",
    servicio: "Contabilidad Electrónica",
    descripcion:
      "Registro contable en CONTPAQi Contabiliza, conciliaciones bancarias, control de ingresos, gastos y utilidades. Incluye la licencia de la plataforma sin costo adicional para ti.",
    precioSugerido: 1600,
    activo: true,
  },
  {
    id: "cat_impuestos",
    servicio: "Declaración de Impuestos",
    descripcion:
      "Cálculo y presentación de ISR, IVA, retenciones, Impuesto Sobre Nómina (ISN), DIOT y declaraciones anuales ante el SAT.",
    precioSugerido: 1500,
    activo: true,
  },
  {
    id: "cat_retenciones",
    servicio: "Retención de Salarios (ISR)",
    descripcion:
      "Cálculo y entero de las retenciones de ISR por sueldos y salarios conforme a la nómina del periodo.",
    precioSugerido: 800,
    activo: true,
  },
  {
    id: "cat_nomina",
    servicio: "Control de Nómina",
    descripcion:
      "Listas de raya, timbrado de recibos, movimientos ante el IMSS, SIPARE, manejo de SUA y declaración informativa (PRT).",
    precioSugerido: 1500,
    activo: true,
  },
  {
    id: "cat_creacion",
    servicio: "Creación de Empresas",
    descripcion:
      "Alta ante la Secretaría de Economía y Hacienda, aceptación de razón social y estructura legal inicial.",
    precioSugerido: 1500,
    activo: true,
  },
  {
    id: "cat_imss",
    servicio: "Alta IMSS",
    descripcion:
      "Generación del Registro Patronal ante el IMSS y configuración inicial para el manejo de trabajadores.",
    precioSugerido: 1000,
    activo: true,
  },
  {
    id: "cat_asesorias",
    servicio: "Asesorías",
    descripcion:
      "Capacitación, aclaración de procesos, consultas y acompañamiento fiscal continuo cuando lo necesites.",
    precioSugerido: 0,
    activo: true,
  },
  {
    id: "cat_portal",
    servicio: "Portal del Cliente RDC",
    descripcion:
      "Acceso a tu portal personal 24/7: avance de tu declaración en tiempo real, calendario fiscal, situación ante el SAT, documentos y pagos en línea. Incluido sin costo adicional.",
    precioSugerido: 0,
    activo: true,
  },
];

/** Catálogo efectivo: si el usuario aún no lo personalizó, usa el default. */
export function catalogoEfectivo(
  catalogo: ServicioCatalogo[] | undefined | null
): ServicioCatalogo[] {
  return catalogo && catalogo.length ? catalogo : CATALOGO_DEFAULT;
}

export const OBJECION_META: Record<
  MotivoObjecion,
  { label: string; emoji: string }
> = {
  caro: { label: "Es muy caro", emoji: "💰" },
  pensarlo: { label: "Lo tengo que pensar", emoji: "🤔" },
  tengo_contador: { label: "Ya tengo contador", emoji: "👥" },
  no_entiendo: { label: "No entiendo qué incluye", emoji: "❓" },
  mucho: { label: "Es más de lo que necesito", emoji: "📉" },
};
