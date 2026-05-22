import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Cliente } from "@/lib/clientes";
import { asegurarClienteIngresosDiversos } from "@/lib/clientes";
import type { ComprobantePago } from "@/lib/comprobantes";
import type { FacturaPago } from "@/lib/facturas";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import type { PagoImpuestoHistorial } from "@/lib/historial-impuestos";
import type { Notificacion } from "@/lib/notificaciones";

export const CRM_CLAVES = [
  "clientes",
  "comprobantes",
  "facturas",
  "cumplimiento",
  "historial_impuestos",
  "notificaciones",
] as const;

export type CrmClave = (typeof CRM_CLAVES)[number];

export type CrmEstadoCompleto = {
  clientes: Cliente[];
  comprobantes: ComprobantePago[];
  facturas: FacturaPago[];
  cumplimiento: RegistroCumplimiento[];
  historialImpuestos: PagoImpuestoHistorial[];
  notificaciones: Notificacion[];
};

const VACIO: CrmEstadoCompleto = {
  clientes: [],
  comprobantes: [],
  facturas: [],
  cumplimiento: [],
  historialImpuestos: [],
  notificaciones: [],
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
    }
  }

  if (!out.clientes.length) {
    out.clientes = asegurarClienteIngresosDiversos([]);
  }

  return out;
}

export async function guardarCrmEstadoCompleto(estado: CrmEstadoCompleto): Promise<void> {
  await guardarClave("clientes", estado.clientes);
  await guardarClave("comprobantes", estado.comprobantes);
  await guardarClave("facturas", estado.facturas);
  await guardarClave("cumplimiento", estado.cumplimiento);
  await guardarClave("historial_impuestos", estado.historialImpuestos);
  await guardarClave("notificaciones", estado.notificaciones);
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
}): Promise<CrmEstadoCompleto> {
  const estado = await leerCrmEstadoCompleto();
  const { clienteId } = params;

  if (params.cliente) {
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
  if (params.notificaciones) {
    estado.notificaciones = [
      ...estado.notificaciones.filter(
        (n) => n.destinatario === "admin" || n.clienteId !== clienteId
      ),
      ...params.notificaciones,
    ];
  }

  await guardarCrmEstadoCompleto(estado);
  return estado;
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
      (n) =>
        (n.destinatario === "cliente" && n.clienteId === clienteId) ||
        n.destinatario === "admin"
    ),
  };
}
