import type { Periodo } from "@/lib/clientes";
import type { CategoriaId } from "@/lib/cumplimiento-categorias";

export type DestinatarioNotificacion = "admin" | "cliente";

export type TipoNotificacion =
  | "admin_contabilidad_iniciada"
  | "admin_previo_publicado"
  | "cliente_previo_validado"
  | "cliente_duda_previo"
  | "admin_documentos_listos"
  | "cliente_subio_comprobante"
  | "admin_pago_validado"
  | "admin_extemporaneo_publicado"
  | "admin_sin_pago"
  | "vencimiento_sin_pago"
  | "recordatorio_fiscal"
  | "cobranza_cliente_subio_comprobante"
  | "cobranza_pago_validado"
  | "cobranza_factura_disponible"
  | "cobranza_comprobante_rechazado"
  | "cierre_mes_completado"
  | "efirma_vence_pronto"
  | "admin_efirma_vence_pronto"
  | "admin_cumpleanos_cliente"
  | "encargo_solicitud_cliente"
  | "encargo_editado_cliente"
  | "encargo_estado_cliente"
  | "encargo_listo_cliente";

export type Notificacion = {
  id: string;
  tipo: TipoNotificacion;
  destinatario: DestinatarioNotificacion;
  clienteId: number;
  periodo: Periodo;
  categoria?: CategoriaId;
  /** Clave de escalamiento fiscal (dedupe por hito: sat_d1, federales_d7, …). */
  escalamientoClave?: string;
  /** Vincula la notificación a un encargo concreto (dedupe). */
  encargoId?: string;
  titulo: string;
  detalle?: string;
  /** Ruta a la que debe llevar el click (ej. "/cumplimiento" o "/portal/cumplimiento"). */
  href?: string;
  createdAt: string;
  leidaEn?: string;
};

export const NOTIFICACIONES_STORAGE_KEY = "rdc-notificaciones-v1";
export const NOTIFICACIONES_UPDATED_EVENT = "rdc-notificaciones-updated";

/** Máximo de avisos guardados por cliente en el portal. */
export const MAX_NOTIFICACIONES_CLIENTE = 10;
const MAX_NOTIFICACIONES_GLOBAL = 250;

export function normalizarNotificaciones(lista: Notificacion[]): Notificacion[] {
  const sorted = [...lista].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const admin: Notificacion[] = [];
  const porCliente = new Map<number, Notificacion[]>();

  for (const n of sorted) {
    if (n.destinatario === "admin") {
      admin.push(n);
      continue;
    }
    const actuales = porCliente.get(n.clienteId) ?? [];
    if (actuales.length < MAX_NOTIFICACIONES_CLIENTE) {
      actuales.push(n);
      porCliente.set(n.clienteId, actuales);
    }
  }

  const clientes = [...porCliente.values()].flat();
  return [...admin, ...clientes]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_NOTIFICACIONES_GLOBAL);
}

export function nuevoIdNotificacion(): string {
  return `not-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Identidad de un evento (sin título): sirve para no encolar 2 pushes del mismo paso. */
/**
 * Pasos internos del flujo de cumplimiento. Van a la campana de la ficha
 * (fila del cliente en Cumplimiento), no a la matriz ni al badge global.
 */
export const TIPOS_ADMIN_SOLO_FICHA: ReadonlySet<TipoNotificacion> = new Set([
  "admin_contabilidad_iniciada",
  "admin_previo_publicado",
  "cliente_previo_validado",
  "cliente_duda_previo",
  "admin_documentos_listos",
  "admin_extemporaneo_publicado",
  "admin_sin_pago",
]);

export function notificacionEnMatrizAdmin(tipo: TipoNotificacion): boolean {
  return !TIPOS_ADMIN_SOLO_FICHA.has(tipo);
}

/**
 * Push nativa: el cliente no se entera de cada paso de trabajo; el admin
 * tampoco. Quedan dos avisos de flujo al cliente (inicio + impuestos listos)
 * y, al despacho, inicio + cuando el cliente sube un comprobante.
 */
export function debeEnviarPush(
  destinatario: DestinatarioNotificacion,
  tipo: TipoNotificacion
): boolean {
  if (destinatario === "admin") {
    return (
      tipo === "admin_contabilidad_iniciada" ||
      tipo === "cliente_subio_comprobante" ||
      tipo === "cobranza_cliente_subio_comprobante" ||
      tipo === "encargo_solicitud_cliente" ||
      tipo === "encargo_editado_cliente" ||
      tipo === "admin_efirma_vence_pronto" ||
      tipo === "admin_cumpleanos_cliente"
    );
  }
  if (
    tipo === "admin_previo_publicado" ||
    tipo === "admin_sin_pago" ||
    tipo === "cierre_mes_completado" ||
    tipo === "admin_pago_validado"
  ) {
    return false;
  }
  return true;
}

export function claveIdentidadNotificacion(n: {
  tipo: TipoNotificacion;
  destinatario: DestinatarioNotificacion;
  clienteId: number;
  periodo: Periodo;
  categoria?: CategoriaId;
  escalamientoClave?: string;
  encargoId?: string;
}): string {
  return [
    n.destinatario,
    n.tipo,
    n.clienteId,
    n.periodo.anio,
    n.periodo.mes,
    n.categoria ?? "",
    n.escalamientoClave ?? "",
    n.encargoId ?? "",
  ].join("|");
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
  const recientes = normalizarNotificaciones(lista);
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

export const EVENTO_DETALLE_NOTIFICACION = "rdc:abrir-detalle-notificacion";

export function emitirDetalleNotificacion(n: Notificacion): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENTO_DETALLE_NOTIFICACION, { detail: n })
  );
}

const TIPOS_ADMIN_CUMPLIMIENTO: ReadonlySet<TipoNotificacion> = new Set([
  "cliente_subio_comprobante",
  "cliente_previo_validado",
  "cliente_duda_previo",
  "admin_documentos_listos",
  "admin_previo_publicado",
  "admin_contabilidad_iniciada",
  "admin_extemporaneo_publicado",
  "admin_sin_pago",
  "admin_pago_validado",
  "vencimiento_sin_pago",
  "recordatorio_fiscal",
  "cierre_mes_completado",
]);

export const TIPOS_ALERTA_CUMPLIMIENTO: ReadonlySet<TipoNotificacion> = new Set([
  "cliente_subio_comprobante",
  "cliente_previo_validado",
  "cliente_duda_previo",
  "vencimiento_sin_pago",
  "recordatorio_fiscal",
]);

export const TIPOS_ALERTA_COBRANZA: ReadonlySet<TipoNotificacion> = new Set([
  "cobranza_cliente_subio_comprobante",
]);

export function idsClientesConAlerta(
  lista: Notificacion[],
  tipos: ReadonlySet<TipoNotificacion>
): Set<number> {
  const ids = new Set<number>();
  for (const n of lista) {
    if (n.destinatario !== "admin" || n.leidaEn) continue;
    if (!tipos.has(n.tipo)) continue;
    ids.add(n.clienteId);
  }
  return ids;
}

function qsCumplimientoAdmin(clienteId: number, periodo: Periodo): string {
  return `/cumplimiento?cliente=${clienteId}&mes=${periodo.mes + 1}&anio=${periodo.anio}`;
}

/** A dónde debe ir el click, aunque la notificación se haya guardado sin cliente. */
export function hrefDestinoNotificacion(n: {
  tipo: TipoNotificacion;
  destinatario: DestinatarioNotificacion;
  clienteId: number;
  periodo: Periodo;
  href?: string;
  encargoId?: string;
}): string {
  if (n.destinatario === "cliente") {
    if (n.href) return n.href;
    switch (n.tipo) {
      case "cobranza_pago_validado":
      case "cobranza_factura_disponible":
      case "cobranza_comprobante_rechazado":
        return "/portal/honorarios";
      case "encargo_estado_cliente":
      case "encargo_listo_cliente":
        return "/portal/encargos";
      case "efirma_vence_pronto":
        return "/portal/perfil";
      default:
        return "/portal/cumplimiento";
    }
  }

  switch (n.tipo) {
    case "cobranza_cliente_subio_comprobante":
      return `/cobranza?cliente=${n.clienteId}&filtro=comprobantes&revisar=1`;
    case "cobranza_pago_validado":
    case "cobranza_factura_disponible":
      return `/cobranza?cliente=${n.clienteId}`;
    case "encargo_solicitud_cliente":
    case "encargo_editado_cliente": {
      const base = `/encargos?cliente=${n.clienteId}`;
      return n.encargoId ? `${base}&encargo=${n.encargoId}` : base;
    }
    case "admin_efirma_vence_pronto":
      return "/accesos";
    case "admin_cumpleanos_cliente":
      return `/clientes#cliente=${n.clienteId}`;
    default:
      if (TIPOS_ADMIN_CUMPLIMIENTO.has(n.tipo) || !n.href || n.href === "/cumplimiento") {
        return qsCumplimientoAdmin(n.clienteId, n.periodo);
      }
      return n.href;
  }
}

export function etiquetaCtaNotificacion(n: {
  tipo: TipoNotificacion;
  destinatario: DestinatarioNotificacion;
  clienteId: number;
  periodo: Periodo;
  href?: string;
  encargoId?: string;
}): string {
  const href = hrefDestinoNotificacion(n);
  if (href.startsWith("/portal/cumplimiento")) return "Ir a Declaraciones";
  if (href.startsWith("/portal/honorarios")) return "Ir a Honorarios";
  if (href.startsWith("/portal/encargos")) return "Ir a Solicitudes";
  if (href.startsWith("/portal/perfil")) return "Ir a Mi perfil";
  if (href.startsWith("/cumplimiento")) return "Ir a Cumplimiento";
  if (href.startsWith("/cobranza")) return "Ir a Cobranza";
  if (href.startsWith("/encargos")) return "Ir a Encargos";
  if (href.startsWith("/accesos")) return "Ir a Accesos";
  if (href.startsWith("/clientes")) return "Ir a Clientes";
  return "Ver";
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
