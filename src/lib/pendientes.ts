export type EstadoPendiente = "por_hacer" | "trabajando" | "hecho";

export const ESTADOS_PENDIENTE: EstadoPendiente[] = [
  "por_hacer",
  "trabajando",
  "hecho",
];

export const ESTADO_PENDIENTE_META: Record<
  EstadoPendiente,
  { label: string; badge: string }
> = {
  por_hacer: {
    label: "Por hacer",
    badge: "bg-amber-100 text-amber-800",
  },
  trabajando: {
    label: "Trabajando",
    badge: "bg-violet-100 text-violet-800",
  },
  hecho: {
    label: "Hecho",
    badge: "bg-emerald-100 text-emerald-800",
  },
};

export type Pendiente = {
  id: string;
  titulo: string;
  /** null = tarea del despacho, no de un cliente. */
  clienteId: number | null;
  estado: EstadoPendiente;
  /** YYYY-MM-DD */
  inicio: string;
  /** YYYY-MM-DD */
  fin: string;
  /** Fecha en la que *tú* quieres cerrarlo (raya blanca). YYYY-MM-DD */
  deadlineInterno?: string;
  /** Si se jaló desde un encargo del cliente. */
  encargoId?: string;
  creadoEn: string;
  actualizadoEn: string;
};

export function nuevoIdPendiente(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizarPendiente(raw: unknown): Pendiente | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || !r.id) return null;
  if (typeof r.titulo !== "string") return null;
  const estado = ESTADOS_PENDIENTE.includes(r.estado as EstadoPendiente)
    ? (r.estado as EstadoPendiente)
    : "por_hacer";
  const clienteId =
    typeof r.clienteId === "number" && Number.isFinite(r.clienteId)
      ? r.clienteId
      : null;
  const inicio = typeof r.inicio === "string" ? r.inicio : isoHoy();
  const fin = typeof r.fin === "string" ? r.fin : inicio;
  return {
    id: r.id,
    titulo: r.titulo.trim() || "Pendiente",
    clienteId,
    estado,
    inicio,
    fin: fin < inicio ? inicio : fin,
    deadlineInterno:
      typeof r.deadlineInterno === "string" && r.deadlineInterno
        ? r.deadlineInterno
        : undefined,
    encargoId:
      typeof r.encargoId === "string" && r.encargoId ? r.encargoId : undefined,
    creadoEn: typeof r.creadoEn === "string" ? r.creadoEn : new Date().toISOString(),
    actualizadoEn:
      typeof r.actualizadoEn === "string"
        ? r.actualizadoEn
        : new Date().toISOString(),
  };
}

export function isoHoy(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoFecha(iso: string): Date | null {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatFechaCorta(iso: string): string {
  const d = parseIsoFecha(iso);
  if (!d) return iso;
  return d
    .toLocaleDateString("es-MX", { day: "numeric", month: "short" })
    .replace(".", "");
}

/** Avance 0–100 de hoy entre inicio y fin. */
export function progresoTimeline(
  inicio: string,
  fin: string,
  hoy = new Date()
): number {
  const a = parseIsoFecha(inicio);
  const b = parseIsoFecha(fin);
  if (!a || !b) return 0;
  const t0 = a.getTime();
  const t1 = b.getTime();
  const h = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  if (t1 <= t0) return h >= t1 ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round(((h - t0) / (t1 - t0)) * 100)));
}

export function fechaMasDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, (d ?? 1) + dias);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function pendienteDeEncargo(
  pendientes: Pendiente[],
  encargoId: string
): Pendiente | undefined {
  return pendientes.find((p) => p.encargoId === encargoId);
}

export function tituloPendienteDesdeEncargo(enc: {
  titulo: string;
  tipo: string;
  cantidadFacturas?: number;
}): string {
  const extra =
    enc.tipo === "factura" && enc.cantidadFacturas
      ? ` ×${enc.cantidadFacturas}`
      : "";
  const titulo = enc.titulo.trim();
  return titulo ? `${titulo}${extra}` : `Encargo${extra}`;
}

export function fechasPendienteDesdeEncargo(
  enc: { fechaCompromiso?: string },
  hoy = isoHoy()
): { inicio: string; fin: string; deadlineInterno?: string } {
  const fin =
    enc.fechaCompromiso && enc.fechaCompromiso >= hoy
      ? enc.fechaCompromiso
      : fechaMasDias(hoy, 3);
  return {
    inicio: hoy,
    fin,
    deadlineInterno: enc.fechaCompromiso || undefined,
  };
}

/** Fecha con la que se juzga si el to-do ya se pasó: tu deadline, o el fin. */
export function fechaCompromisoPendiente(p: Pendiente): string {
  return p.deadlineInterno || p.fin;
}

/** Abierto y ya pasó su fecha. Los hechos no cuentan: desaparecen del cronograma. */
export function pendienteAtrasado(p: Pendiente, hoy = isoHoy()): boolean {
  if (p.estado === "hecho") return false;
  return fechaCompromisoPendiente(p) < hoy;
}

export function pendienteSolapaMes(
  p: Pendiente,
  mes: number,
  anio: number
): boolean {
  const a = parseIsoFecha(p.inicio);
  const b = parseIsoFecha(p.fin);
  if (!a || !b) return false;
  const from = new Date(anio, mes, 1);
  const to = new Date(anio, mes + 1, 0);
  return a.getTime() <= to.getTime() && b.getTime() >= from.getTime();
}
