/**
 * Encargos — solicitudes personalizadas del cliente (facturas, documentos,
 * trámites) fuera del flujo mensual de cumplimiento.
 *
 * El admin las registra desde WhatsApp/redes; el cliente puede pedirlas
 * desde el portal. Ambos ven el estatus en tiempo real.
 */

export type TipoEncargo = "factura" | "documento" | "tramite" | "otro";

export type EstadoEncargo =
  | "recibido"
  | "en_proceso"
  | "esperando_cliente"
  | "listo";

export type ArchivoEncargo = {
  nombreArchivo: string;
  tipoMime: string;
  /** Ruta del archivo en Supabase Storage (bucket "encargos"). */
  path?: string;
  /** URL firmada temporal para abrir/descargar; se llena al leer del servidor. */
  url?: string;
  /** Legacy: contenido embebido en base64 (en desuso, se migró a Storage). */
  dataUrl?: string;
  subidoEn: string;
  /** Nota propia del archivo (qué es / a qué factura corresponde). */
  nota?: string;
  /** Para tipo "factura": a qué factura pertenece (1-based). */
  grupo?: number;
};

/** URL utilizable para abrir/descargar un adjunto (firmada o legacy embebida). */
export function urlArchivoEncargo(a: ArchivoEncargo): string | undefined {
  return a.url ?? a.dataUrl;
}

/**
 * Una factura entregada por el admin como respuesta. El `folio` (texto) es lo
 * que queda en el histórico; los `archivos` (PDF/XML) son opcionales y se
 * pueden liberar al cierre de mes para no saturar la memoria.
 */
export type EntregaEncargo = {
  id: string;
  folio: string;
  archivos?: ArchivoEncargo[];
};

export type Encargo = {
  id: string;
  clienteId: number;
  titulo: string;
  tipo: TipoEncargo;
  nota?: string;
  estado: EstadoEncargo;
  /** ISO date YYYY-MM-DD */
  fechaCompromiso?: string;
  /** Solo para tipo "factura": cuántas facturas pidió el cliente. */
  cantidadFacturas?: number;
  /** Archivos que el cliente sube al pedir (CSF, fotos de lo que facturar, etc.). */
  adjuntosCliente?: ArchivoEncargo[];
  /** Texto que el cliente escribe sobre qué debe llevar cada factura (sin archivo). */
  notasCliente?: { grupo?: number; texto: string }[];
  /** Facturas/documentos que el admin entregó como respuesta (folio + PDF/XML opcional). */
  entregas?: EntregaEncargo[];
  /** Los archivos cargados fueron liberados al cierre de mes (solo queda el texto). */
  archivosLiberados?: boolean;
  creadoPor: "admin" | "cliente";
  creadoEn: string;
  actualizadoEn: string;
  /** Última vez que se editó el contenido de la solicitud (título, notas, archivos). */
  editadoEn?: string;
  listoEn?: string;
};

export const MAX_FACTURAS_POR_ENCARGO = 10;
export const MAX_ADJUNTO_BYTES = 8 * 1024 * 1024;

/** Valida un archivo adjunto del cliente (PDF o imagen, máx 8 MB). */
export function validarAdjuntoEncargo(file: File): string | null {
  const esPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const esImagen = file.type.startsWith("image/");
  if (!esPdf && !esImagen) return "Solo se aceptan archivos PDF o imágenes.";
  if (file.size > MAX_ADJUNTO_BYTES) return "Cada archivo no debe superar 8 MB.";
  return null;
}

export const TIPOS_ENCARGO: TipoEncargo[] = [
  "factura",
  "documento",
  "tramite",
  "otro",
];

export const ESTADOS_ENCARGO: EstadoEncargo[] = [
  "recibido",
  "en_proceso",
  "esperando_cliente",
  "listo",
];

export const TIPO_ENCARGO_META: Record<
  TipoEncargo,
  { label: string; chip: string }
> = {
  factura: { label: "Factura", chip: "bg-violet-100 text-violet-700" },
  documento: { label: "Documento", chip: "bg-blue-100 text-blue-700" },
  tramite: { label: "Trámite", chip: "bg-emerald-100 text-emerald-700" },
  otro: { label: "Otro", chip: "bg-slate-100 text-slate-600" },
};

export const ESTADO_ENCARGO_META: Record<
  EstadoEncargo,
  {
    label: string;
    /** Chip de estado (semáforo: gris → amarillo → verde). */
    chip: string;
    /** Color de relleno de la barra de progreso. */
    barra: string;
    /** Punto/dot de color del semáforo. */
    dot: string;
    detalleCliente: string;
    paso: number;
  }
> = {
  recibido: {
    label: "Recibido",
    chip: "bg-slate-100 text-slate-600",
    barra: "bg-slate-400",
    dot: "bg-slate-400",
    detalleCliente: "Lo recibimos. Pronto empezamos a trabajarlo.",
    paso: 1,
  },
  en_proceso: {
    label: "En proceso",
    chip: "bg-amber-100 text-amber-800",
    barra: "bg-amber-400",
    dot: "bg-amber-400",
    detalleCliente: "Estamos trabajando en ello.",
    paso: 2,
  },
  esperando_cliente: {
    label: "Esperando de ti",
    chip: "bg-amber-100 text-amber-800",
    barra: "bg-amber-400",
    dot: "bg-amber-400",
    detalleCliente: "Necesitamos algo tuyo para continuar.",
    paso: 2,
  },
  listo: {
    label: "Listo",
    chip: "bg-emerald-100 text-emerald-800",
    barra: "bg-emerald-500",
    dot: "bg-emerald-500",
    detalleCliente: "Ya quedó listo. Te lo enviamos por correo.",
    paso: 3,
  },
};

export const PASOS_ENCARGO_TOTAL = 3;

export function nuevoIdEncargo(): string {
  return `enc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function nuevoIdEntrega(): string {
  return `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Agrupa los adjuntos del cliente por factura (grupo). Clave 0 = sin grupo. */
export function adjuntosPorGrupo(
  adjuntos?: ArchivoEncargo[]
): Map<number, ArchivoEncargo[]> {
  const map = new Map<number, ArchivoEncargo[]>();
  for (const a of adjuntos ?? []) {
    const k = a.grupo ?? 0;
    const arr = map.get(k) ?? [];
    arr.push(a);
    map.set(k, arr);
  }
  return map;
}

/**
 * Combina notas (texto) y adjuntos (archivos) del cliente agrupados por factura.
 * Devuelve la lista ordenada por número de factura (clave 0 = sin grupo).
 */
export function solicitudClientePorGrupo(enc: {
  adjuntosCliente?: ArchivoEncargo[];
  notasCliente?: { grupo?: number; texto: string }[];
}): { grupo: number; notas: string[]; archivos: ArchivoEncargo[] }[] {
  const map = new Map<number, { notas: string[]; archivos: ArchivoEncargo[] }>();
  const get = (k: number) => {
    const ex = map.get(k);
    if (ex) return ex;
    const nuevo = { notas: [] as string[], archivos: [] as ArchivoEncargo[] };
    map.set(k, nuevo);
    return nuevo;
  };
  for (const n of enc.notasCliente ?? []) {
    if (n.texto.trim()) get(n.grupo ?? 0).notas.push(n.texto.trim());
  }
  for (const a of enc.adjuntosCliente ?? []) {
    get(a.grupo ?? 0).archivos.push(a);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([grupo, v]) => ({ grupo, ...v }));
}

export function progresoEncargo(estado: EstadoEncargo): {
  paso: number;
  total: number;
  pct: number;
} {
  const paso = ESTADO_ENCARGO_META[estado].paso;
  const total = PASOS_ENCARGO_TOTAL;
  return { paso, total, pct: Math.round((paso / total) * 100) };
}

export function encargoAbierto(e: Encargo): boolean {
  return e.estado !== "listo";
}

/** Periodo (mes/año) al que pertenece un encargo, según su fecha de creación. */
export function periodoDeEncargo(e: Encargo): { mes: number; anio: number } {
  const d = new Date(e.creadoEn);
  return { mes: d.getMonth() + 1, anio: d.getFullYear() };
}

/** Clave 'YYYY-MM' para agrupar encargos por mes. */
export function claveMesEncargo(e: Encargo): string {
  const { mes, anio } = periodoDeEncargo(e);
  return `${anio}-${String(mes).padStart(2, "0")}`;
}

const MESES_NOMBRE = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/** Etiqueta legible 'Junio 2026' a partir de la clave 'YYYY-MM'. */
export function labelMesEncargo(clave: string): string {
  const [anio, mes] = clave.split("-").map(Number);
  if (!anio || !mes) return clave;
  return `${MESES_NOMBRE[mes - 1]} ${anio}`;
}

export function formatFechaEncargo(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativoEncargo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias < 7) return `Hace ${dias} d`;
  return formatFechaEncargo(iso);
}
