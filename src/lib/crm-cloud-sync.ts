import type { Cliente } from "@/lib/clientes";
import { asegurarClienteIngresosDiversos } from "@/lib/clientes";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { ComprobantePago } from "@/lib/comprobantes";
import type { FacturaPago } from "@/lib/facturas";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import type { PagoImpuestoHistorial } from "@/lib/historial-impuestos";
import type { Notificacion } from "@/lib/notificaciones";

export type CrmCloudPayload = {
  clientes: Cliente[];
  comprobantes: ComprobantePago[];
  facturas: FacturaPago[];
  cumplimiento: RegistroCumplimiento[];
  historialImpuestos: PagoImpuestoHistorial[];
  notificaciones: Notificacion[];
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
    };
  }

  return {
    clientes: asegurarClienteIngresosDiversos(data.clientes ?? []),
    comprobantes: data.comprobantes ?? [],
    facturas: data.facturas ?? [],
    cumplimiento: data.cumplimiento ?? [],
    historialImpuestos: data.historialImpuestos ?? [],
    notificaciones: data.notificaciones ?? [],
  };
}

export async function guardarCrmEnNube(payload: CrmCloudPayload): Promise<void> {
  const portal = esRutaPortal();
  if (portal) {
    const { data } = await getSupabaseBrowser().auth.getSession();
    if (!data.session) return;
  }
  const url = portal ? "/api/portal/datos" : "/api/admin/crm-estado";
  const body = portal
    ? {
        cliente: payload.clientes[0],
        comprobantes: payload.comprobantes,
        facturas: payload.facturas,
        cumplimiento: payload.cumplimiento,
        historialImpuestos: payload.historialImpuestos,
        notificaciones: payload.notificaciones,
      }
    : payload;

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
