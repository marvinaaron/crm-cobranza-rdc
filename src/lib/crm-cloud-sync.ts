import type { Cliente } from "@/lib/clientes";
import {
  ID_INGRESOS_DIVERSOS,
  asegurarClienteIngresosDiversos,
} from "@/lib/clientes";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
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
} from "@/lib/presupuestos";

export type CrmCloudPayload = {
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

export function esRutaPortal(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/portal");
}

export async function cargarCrmDesdeNube(): Promise<CrmCloudPayload> {
  const portal = esRutaPortal();
  const url = portal ? "/api/portal/datos" : "/api/admin/crm-estado";
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "No se pudieron cargar los datos del CRM.");
  }

  if (portal) {
    const cliente = data.cliente as Cliente | null;
    return {
      clientes: cliente ? asegurarClienteIngresosDiversos([cliente]) : [],
      comprobantes: data.comprobantes ?? [],
      facturas: data.facturas ?? [],
      cumplimiento: data.cumplimiento ?? [],
      historialImpuestos: data.historialImpuestos ?? [],
      notificaciones: data.notificaciones ?? [],
      repse: data.repse ?? [],
      encargos: data.encargos ?? [],
      recordatorioLog: [],
      scriptsCorreo: [],
      presupuestos: [],
      catalogoServicios: [],
      preciosRegimen: [],
    };
  }

  return {
    clientes: asegurarClienteIngresosDiversos(data.clientes ?? []),
    comprobantes: data.comprobantes ?? [],
    facturas: data.facturas ?? [],
    cumplimiento: data.cumplimiento ?? [],
    historialImpuestos: data.historialImpuestos ?? [],
    notificaciones: data.notificaciones ?? [],
    repse: data.repse ?? [],
    encargos: data.encargos ?? [],
    recordatorioLog: data.recordatorioLog ?? [],
    scriptsCorreo: data.scriptsCorreo ?? [],
    presupuestos: data.presupuestos ?? [],
    catalogoServicios: data.catalogoServicios ?? [],
    preciosRegimen: data.preciosRegimen ?? [],
  };
}

function clienteIdDeMeta(meta: Record<string, unknown> | undefined): number | null {
  const raw = meta?.clienteId;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "" && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return null;
}

export async function guardarCrmEnNube(payload: CrmCloudPayload): Promise<void> {
  const portal = esRutaPortal();
  let body: unknown;

  if (portal) {
    const { data } = await getSupabaseBrowser().auth.getSession();
    if (!data.session) return;
    const clienteId = clienteIdDeMeta(
      data.session.user.app_metadata as Record<string, unknown>
    );
    if (clienteId == null) return;
    const cliente = payload.clientes.find(
      (c) => c.id === clienteId && c.id !== ID_INGRESOS_DIVERSOS
    );
    body = {
      cliente,
      comprobantes: payload.comprobantes.filter((c) => c.clienteId === clienteId),
      facturas: payload.facturas.filter((f) => f.clienteId === clienteId),
      cumplimiento: payload.cumplimiento.filter((r) => r.clienteId === clienteId),
      historialImpuestos: payload.historialImpuestos.filter(
        (h) => h.clienteId === clienteId
      ),
      notificaciones: payload.notificaciones.filter(
        (n) => n.clienteId === clienteId
      ),
      repse: payload.repse.filter((r) => r.clienteId === clienteId),
      encargos: payload.encargos.filter((e) => e.clienteId === clienteId),
    };
  } else {
    body = payload;
  }

  const url = portal ? "/api/portal/datos" : "/api/admin/crm-estado";

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "No se pudieron guardar los datos.");
  }
}
