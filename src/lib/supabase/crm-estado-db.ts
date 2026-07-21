import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Cliente } from "@/lib/clientes";
import {
  ID_INGRESOS_DIVERSOS,
  asegurarClienteIngresosDiversos,
} from "@/lib/clientes";
import { enviarPushATodosLosAdmins } from "@/lib/push/server";
import { buildAdminPushExtras } from "@/lib/push/payload";
import type { ComprobantePago } from "@/lib/comprobantes";
import type { FacturaPago } from "@/lib/facturas";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import type { PagoImpuestoHistorial } from "@/lib/historial-impuestos";
import type { Notificacion } from "@/lib/notificaciones";
import type { RegistroRepse } from "@/lib/repse";
import type { Encargo } from "@/lib/encargos";
import type { MarcaRecordatorio, ScriptCorreo } from "@/lib/recordatorios";
import type {
  Presupuesto,
  ServicioCatalogo,
  PrecioRegimen,
  MotivoObjecion,
} from "@/lib/presupuestos";

export const CRM_CLAVES = [
  "clientes",
  "comprobantes",
  "facturas",
  "cumplimiento",
  "historial_impuestos",
  "notificaciones",
  "repse",
  "encargos",
  "recordatorio_log",
  "scripts_correo",
  "presupuestos",
  "catalogo_servicios",
  "precios_regimen",
] as const;

export type CrmClave = (typeof CRM_CLAVES)[number];

export type CrmEstadoCompleto = {
  clientes: Cliente[];
  comprobantes: ComprobantePago[];
  facturas: FacturaPago[];
  cumplimiento: RegistroCumplimiento[];
  historialImpuestos: PagoImpuestoHistorial[];
  notificaciones: Notificacion[];
  repse: RegistroRepse[];
  encargos: Encargo[];
  recordatorioLog: MarcaRecordatorio[];
  scriptsCorreo: ScriptCorreo[];
  presupuestos: Presupuesto[];
  catalogoServicios: ServicioCatalogo[];
  preciosRegimen: PrecioRegimen[];
};

const VACIO: CrmEstadoCompleto = {
  clientes: [],
  comprobantes: [],
  facturas: [],
  cumplimiento: [],
  historialImpuestos: [],
  notificaciones: [],
  repse: [],
  encargos: [],
  recordatorioLog: [],
  scriptsCorreo: [],
  presupuestos: [],
  catalogoServicios: [],
  preciosRegimen: [],
};

type Row = { clave: string; payload: unknown };

async function leerClave<T>(clave: CrmClave, fallback: T): Promise<T> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("crm_estado")
    .select("payload")
    .eq("clave", clave)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.payload) return fallback;
  return data.payload as T;
}

async function guardarClave(clave: CrmClave, payload: unknown): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("crm_estado").upsert(
    {
      clave,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clave" }
  );
  if (error) throw new Error(error.message);
}

export async function leerCrmEstadoCompleto(): Promise<CrmEstadoCompleto> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("crm_estado").select("clave, payload");
  if (error) throw new Error(error.message);

  const out: CrmEstadoCompleto = { ...VACIO, clientes: [] };
  const rows = (data ?? []) as Row[];

  for (const row of rows) {
    const k = row.clave as CrmClave;
    if (!CRM_CLAVES.includes(k)) continue;
    const val = row.payload;
    if (!Array.isArray(val)) continue;
    switch (k) {
      case "clientes":
        out.clientes = asegurarClienteIngresosDiversos(val as Cliente[]);
        break;
      case "comprobantes":
        out.comprobantes = val as ComprobantePago[];
        break;
      case "facturas":
        out.facturas = val as FacturaPago[];
        break;
      case "cumplimiento":
        out.cumplimiento = val as RegistroCumplimiento[];
        break;
      case "historial_impuestos":
        out.historialImpuestos = val as PagoImpuestoHistorial[];
        break;
      case "notificaciones":
        out.notificaciones = val as Notificacion[];
        break;
      case "repse":
        out.repse = val as RegistroRepse[];
        break;
      case "encargos":
        out.encargos = val as Encargo[];
        break;
      case "recordatorio_log":
        out.recordatorioLog = val as MarcaRecordatorio[];
        break;
      case "scripts_correo":
        out.scriptsCorreo = val as ScriptCorreo[];
        break;
      case "presupuestos":
        out.presupuestos = val as Presupuesto[];
        break;
      case "catalogo_servicios":
        out.catalogoServicios = val as ServicioCatalogo[];
        break;
      case "precios_regimen":
        out.preciosRegimen = val as PrecioRegimen[];
        break;
    }
  }

  if (!out.clientes.length) {
    out.clientes = asegurarClienteIngresosDiversos([]);
  }

  const idsValidos = new Set(out.clientes.map((c) => c.id));
  out.comprobantes = out.comprobantes.filter((c) => idsValidos.has(c.clienteId));
  out.facturas = out.facturas.filter((f) => idsValidos.has(f.clienteId));
  out.cumplimiento = out.cumplimiento.filter((r) => idsValidos.has(r.clienteId));
  out.historialImpuestos = out.historialImpuestos.filter((h) =>
    idsValidos.has(h.clienteId)
  );
  out.notificaciones = out.notificaciones.filter(
    (n) => n.destinatario === "admin" || idsValidos.has(n.clienteId)
  );
  out.repse = out.repse.filter((r) => idsValidos.has(r.clienteId));
  out.encargos = out.encargos.filter((e) => idsValidos.has(e.clienteId));
  out.recordatorioLog = out.recordatorioLog.filter((m) =>
    idsValidos.has(m.clienteId)
  );

  return out;
}

/**
 * Quita las URLs firmadas temporales de los adjuntos antes de persistir, para
 * no guardar enlaces que expiran. Se vuelven a generar al leer.
 */
function limpiarUrlsEncargos(encargos: Encargo[]): Encargo[] {
  const limpiar = <T extends { url?: string }>(a: T): T => {
    if (!a.url) return a;
    const { url: _omit, ...resto } = a;
    void _omit;
    return resto as T;
  };
  return encargos.map((e) => ({
    ...e,
    adjuntosCliente: e.adjuntosCliente?.map(limpiar),
    entregas: e.entregas?.map((ent) => ({
      ...ent,
      archivos: ent.archivos?.map(limpiar),
    })),
  }));
}

/**
 * Fusiona items por `id` dentro de una sección: reemplaza los existentes,
 * agrega los nuevos y quita los eliminados. Permite guardados granulares
 * (solo el registro que cambió) sin re-subir la sección completa.
 */
export function fusionarPorId<T extends { id: string }>(
  actuales: T[],
  upserts: T[],
  eliminarIds: string[]
): T[] {
  const porId = new Map(actuales.map((x) => [x.id, x]));
  for (const item of upserts) {
    if (item && typeof item.id === "string" && item.id) porId.set(item.id, item);
  }
  for (const id of eliminarIds) porId.delete(id);
  return [...porId.values()];
}

export async function guardarCrmEstadoCompleto(estado: CrmEstadoCompleto): Promise<void> {
  // Se escriben todas las claves en paralelo (antes era secuencial: 13
  // round-trips encadenados). Reduce notablemente la latencia del guardado.
  await Promise.all([
    guardarClave("clientes", estado.clientes),
    guardarClave("comprobantes", estado.comprobantes),
    guardarClave("facturas", estado.facturas),
    guardarClave("cumplimiento", estado.cumplimiento),
    guardarClave("historial_impuestos", estado.historialImpuestos),
    guardarClave("notificaciones", estado.notificaciones),
    guardarClave("repse", estado.repse),
    guardarClave("encargos", limpiarUrlsEncargos(estado.encargos)),
    guardarClave("recordatorio_log", estado.recordatorioLog),
    guardarClave("scripts_correo", estado.scriptsCorreo),
    guardarClave("presupuestos", estado.presupuestos),
    guardarClave("catalogo_servicios", estado.catalogoServicios),
    guardarClave("precios_regimen", estado.preciosRegimen),
  ]);
}

/** Campo de `CrmEstadoCompleto` → clave en la tabla `crm_estado`. */
const CLAVE_POR_CAMPO: Record<keyof CrmEstadoCompleto, CrmClave> = {
  clientes: "clientes",
  comprobantes: "comprobantes",
  facturas: "facturas",
  cumplimiento: "cumplimiento",
  historialImpuestos: "historial_impuestos",
  notificaciones: "notificaciones",
  repse: "repse",
  encargos: "encargos",
  recordatorioLog: "recordatorio_log",
  scriptsCorreo: "scripts_correo",
  presupuestos: "presupuestos",
  catalogoServicios: "catalogo_servicios",
  preciosRegimen: "precios_regimen",
};

/**
 * Guarda SOLO las secciones indicadas (en paralelo). Evita re-escribir las 13
 * claves cuando el guardado incremental solo tocó una o dos.
 */
export async function guardarCrmEstadoParcial(
  estado: CrmEstadoCompleto,
  campos: (keyof CrmEstadoCompleto)[]
): Promise<void> {
  const unicos = [...new Set(campos)];
  await Promise.all(
    unicos.map((campo) => {
      const valor =
        campo === "encargos" ? limpiarUrlsEncargos(estado.encargos) : estado[campo];
      return guardarClave(CLAVE_POR_CAMPO[campo], valor);
    })
  );
}

// ---------- Presupuestos: link público de aceptación ----------

/** Lee un presupuesto por su token público (o null si no existe). */
export async function leerPresupuestoPorToken(
  token: string
): Promise<Presupuesto | null> {
  if (!token) return null;
  const presupuestos = await leerClave<Presupuesto[]>("presupuestos", []);
  return presupuestos.find((p) => p.token === token) ?? null;
}

/** Marca como "visto" la primera vez que el prospecto abre el link. */
export async function marcarPresupuestoVisto(token: string): Promise<void> {
  if (!token) return;
  const presupuestos = await leerClave<Presupuesto[]>("presupuestos", []);
  const idx = presupuestos.findIndex((p) => p.token === token);
  if (idx < 0 || presupuestos[idx].vistoEn) return;
  const next = [...presupuestos];
  next[idx] = { ...next[idx], vistoEn: new Date().toISOString() };
  await guardarClave("presupuestos", next);
}

/**
 * Registra la respuesta del prospecto desde el link público: aceptar o
 * rechazar (con motivo de objeción). Notifica al admin por push.
 */
export async function responderPresupuestoPublico(params: {
  token: string;
  accion: "aceptar" | "rechazar";
  motivo?: MotivoObjecion;
  comentario?: string;
}): Promise<Presupuesto | null> {
  const { token, accion, motivo, comentario } = params;
  if (!token) return null;

  const presupuestos = await leerClave<Presupuesto[]>("presupuestos", []);
  const idx = presupuestos.findIndex((p) => p.token === token);
  if (idx < 0) return null;

  const actual = presupuestos[idx];
  // Si ya fue aceptado, no permitimos sobreescribirlo (evita anular un sí).
  if (actual.estado === "aceptado") return actual;

  const ahora = new Date().toISOString();
  const actualizado: Presupuesto =
    accion === "aceptar"
      ? { ...actual, estado: "aceptado", aceptadoEn: ahora, actualizadoEn: ahora }
      : {
          ...actual,
          estado: "rechazado",
          rechazadoEn: ahora,
          objecionMotivo: motivo,
          objecionComentario: comentario?.slice(0, 1000),
          actualizadoEn: ahora,
        };

  const next = [...presupuestos];
  next[idx] = actualizado;
  await guardarClave("presupuestos", next);

  const cliente = actual.cliente.razonSocial || "Un prospecto";
  void enviarPushATodosLosAdmins({
    title:
      accion === "aceptar"
        ? "🎉 ¡Presupuesto aceptado!"
        : "Presupuesto rechazado",
    body:
      accion === "aceptar"
        ? `${cliente} aceptó el presupuesto ${actual.folio}.`
        : `${cliente} rechazó el presupuesto ${actual.folio}.`,
    url: "/presupuestos",
    tag: `presupuesto-${actual.id}`,
    renotify: true,
  }).catch(() => {});

  return actualizado;
}

function reemplazarPorClienteId<T extends { clienteId: number }>(
  global: T[],
  clienteId: number,
  nuevos: T[]
): T[] {
  return [...global.filter((x) => x.clienteId !== clienteId), ...nuevos];
}

/** Fusiona cambios de un cliente en el estado global (portal). */
export async function fusionarDatosClientePortal(params: {
  clienteId: number;
  cliente?: Cliente;
  comprobantes?: ComprobantePago[];
  facturas?: FacturaPago[];
  cumplimiento?: RegistroCumplimiento[];
  historialImpuestos?: PagoImpuestoHistorial[];
  notificaciones?: Notificacion[];
  repse?: RegistroRepse[];
  encargos?: Encargo[];
}): Promise<CrmEstadoCompleto> {
  const estado = await leerCrmEstadoCompleto();
  const { clienteId } = params;

  if (
    params.cliente &&
    params.cliente.id === clienteId &&
    params.cliente.id !== ID_INGRESOS_DIVERSOS
  ) {
    const sin = estado.clientes.filter((c) => c.id !== clienteId);
    estado.clientes = asegurarClienteIngresosDiversos([...sin, params.cliente]);
  }
  if (params.comprobantes) {
    estado.comprobantes = reemplazarPorClienteId(
      estado.comprobantes,
      clienteId,
      params.comprobantes
    );
  }
  if (params.facturas) {
    estado.facturas = reemplazarPorClienteId(estado.facturas, clienteId, params.facturas);
  }
  if (params.cumplimiento) {
    estado.cumplimiento = reemplazarPorClienteId(
      estado.cumplimiento,
      clienteId,
      params.cumplimiento
    );
  }
  if (params.historialImpuestos) {
    estado.historialImpuestos = reemplazarPorClienteId(
      estado.historialImpuestos,
      clienteId,
      params.historialImpuestos
    );
  }
  if (params.repse) {
    estado.repse = reemplazarPorClienteId(estado.repse, clienteId, params.repse);
  }
  if (params.encargos) {
    estado.encargos = reemplazarPorClienteId(
      estado.encargos,
      clienteId,
      params.encargos
    );
  }
  let nuevasParaAdmin: typeof estado.notificaciones = [];
  if (params.notificaciones) {
    const base = estado.notificaciones.filter(
      (n) => n.destinatario === "admin" || n.clienteId !== clienteId
    );
    const idsExistentes = new Set(base.map((n) => n.id));
    const nuevas = params.notificaciones.filter((n) => !idsExistentes.has(n.id));
    nuevasParaAdmin = nuevas.filter((n) => n.destinatario === "admin");
    estado.notificaciones = [...base, ...nuevas];
  }

  await guardarCrmEstadoCompleto(estado);

  for (const n of nuevasParaAdmin) {
    const extras = buildAdminPushExtras({
      tipo: n.tipo,
      clienteId: n.clienteId,
      href: n.href,
    });
    void enviarPushATodosLosAdmins({
      title: n.titulo,
      body: n.detalle ?? "Hay actividad nueva del cliente.",
      url: extras.url,
      tag: `admin-${n.tipo}-${n.clienteId}`,
      renotify: true,
      requireInteraction: extras.requireInteraction,
      actions: extras.actions,
      data: {
        tipo: n.tipo,
        clienteId: n.clienteId,
        notificacionId: n.id,
        actionUrls: extras.actionUrls,
      },
    }).catch(() => {});
  }

  return estado;
}

/** Actualiza un solo cliente en `crm_estado` sin tocar el resto del estado. */
export async function actualizarClienteEnDb(cliente: Cliente): Promise<void> {
  const estado = await leerCrmEstadoCompleto();
  const idx = estado.clientes.findIndex((c) => c.id === cliente.id);
  if (idx < 0) throw new Error("Cliente no encontrado.");
  const next = [...estado.clientes];
  next[idx] = cliente;
  await guardarClave("clientes", asegurarClienteIngresosDiversos(next));
}

export async function datosFiltradosParaCliente(
  clienteId: number
): Promise<CrmEstadoCompleto> {
  const estado = await leerCrmEstadoCompleto();
  const cliente =
    estado.clientes.find((c) => c.id === clienteId) ?? null;

  return {
    clientes: cliente ? [cliente] : [],
    comprobantes: estado.comprobantes.filter((c) => c.clienteId === clienteId),
    facturas: estado.facturas.filter((f) => f.clienteId === clienteId),
    cumplimiento: estado.cumplimiento.filter((r) => r.clienteId === clienteId),
    historialImpuestos: estado.historialImpuestos.filter(
      (h) => h.clienteId === clienteId
    ),
    notificaciones: estado.notificaciones.filter(
      (n) => n.destinatario === "cliente" && n.clienteId === clienteId
    ),
    repse: estado.repse.filter((r) => r.clienteId === clienteId),
    encargos: estado.encargos.filter((e) => e.clienteId === clienteId),
    recordatorioLog: [],
    scriptsCorreo: [],
    presupuestos: [],
    catalogoServicios: [],
    preciosRegimen: [],
  };
}
