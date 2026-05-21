import type { Periodo } from "@/lib/clientes";
import type { CategoriaId } from "@/lib/cumplimiento-categorias";

export type DestinatarioNotificacion = "admin" | "cliente";

export type TipoNotificacion =
  | "admin_contabilidad_iniciada"
  | "admin_previo_publicado"
  | "cliente_previo_validado"
  | "admin_documentos_listos"
  | "cliente_subio_comprobante"
  | "admin_pago_validado"
  | "admin_extemporaneo_publicado"
  | "admin_sin_pago"
  | "vencimiento_sin_pago"
  | "cobranza_cliente_subio_comprobante"
  | "cobranza_pago_validado"
  | "cobranza_factura_disponible"
  | "cobranza_comprobante_rechazado";

export type Notificacion = {
  id: string;
  tipo: TipoNotificacion;
  destinatario: DestinatarioNotificacion;
  clienteId: number;
  periodo: Periodo;
  categoria?: CategoriaId;
  titulo: string;
  detalle?: string;
  /** Ruta a la que debe llevar el click (ej. "/cumplimiento" o "/portal/cumplimiento"). */
  href?: string;
  createdAt: string;
  leidaEn?: string;
};

export const NOTIFICACIONES_STORAGE_KEY = "rdc-notificaciones-v1";
export const NOTIFICACIONES_UPDATED_EVENT = "rdc-notificaciones-updated";

const MAX_NOTIFICACIONES = 250;

export function nuevoIdNotificacion(): string {
  return `not-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadNotificaciones(): Notificacion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICACIONES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Notificacion[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveNotificaciones(lista: Notificacion[]): void {
  if (typeof window === "undefined") return;
  const recientes = [...lista]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_NOTIFICACIONES);
  localStorage.setItem(NOTIFICACIONES_STORAGE_KEY, JSON.stringify(recientes));
}

export function notificacionesParaDestinatario(
  lista: Notificacion[],
  destinatario: DestinatarioNotificacion,
  clienteId?: number
): Notificacion[] {
  return lista
    .filter((n) => n.destinatario === destinatario)
    .filter((n) => (clienteId == null ? true : n.clienteId === clienteId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function contarNoLeidas(
  lista: Notificacion[],
  destinatario: DestinatarioNotificacion,
  clienteId?: number
): number {
  return notificacionesParaDestinatario(lista, destinatario, clienteId).filter(
    (n) => !n.leidaEn
  ).length;
}

export function formatRelativoNotif(iso: string, ahora = Date.now()): string {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const diff = Math.max(0, ahora - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace instantes";
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `hace ${dias} d`;
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}
