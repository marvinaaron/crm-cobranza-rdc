import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { type EstatusLead, validarMotivoRechazo } from "@/lib/lead-estatus";
import {
  appendEventoLead,
  nuevoEventoLead,
  normalizarBitacora,
  type EventoLead,
  type EventoLeadTipo,
} from "@/lib/lead-bitacora";

export type NuevoLead = {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje?: string;
  fuente?: string;
  ingresosMensuales?: number | null;
  ingresosMas300?: boolean;
  cfdiMensuales?: number | null;
  cfdiMas50?: boolean;
};

export type SiteLead = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string | null;
  fuente: string;
  created_at: string;
  ingresos_mensuales: number | null;
  ingresos_mas_300: boolean;
  cfdi_mensuales: number | null;
  cfdi_mas_50: boolean;
  estatus: EstatusLead;
  estatus_en: string;
  motivo_rechazo: string | null;
  siguiente_paso_en: string | null;
  siguiente_paso_nota: string | null;
  bitacora: EventoLead[];
  cliente_id: number | null;
};

const LEAD_COLUMNS =
  "id, nombre, email, telefono, mensaje, fuente, created_at, ingresos_mensuales, ingresos_mas_300, cfdi_mensuales, cfdi_mas_50, estatus, estatus_en, motivo_rechazo, siguiente_paso_en, siguiente_paso_nota, bitacora, cliente_id";

function completarLead(
  row: Partial<SiteLead> &
    Pick<SiteLead, "id" | "nombre" | "email" | "fuente" | "created_at">
): SiteLead {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono ?? null,
    mensaje: row.mensaje ?? null,
    fuente: row.fuente,
    created_at: row.created_at,
    ingresos_mensuales: row.ingresos_mensuales ?? null,
    ingresos_mas_300: Boolean(row.ingresos_mas_300),
    cfdi_mensuales: row.cfdi_mensuales ?? null,
    cfdi_mas_50: Boolean(row.cfdi_mas_50),
    estatus: row.estatus ?? "nuevo",
    estatus_en: row.estatus_en ?? row.created_at,
    motivo_rechazo: row.motivo_rechazo ?? null,
    siguiente_paso_en: row.siguiente_paso_en ?? null,
    siguiente_paso_nota: row.siguiente_paso_nota ?? null,
    bitacora: normalizarBitacora(row.bitacora),
    cliente_id: row.cliente_id ?? null,
  };
}

export async function guardarSiteLead(
  lead: NuevoLead
): Promise<{ ok: true; lead?: SiteLead } | { ok: false; error: string }> {
  try {
    const admin = getSupabaseAdmin();
    const fila = {
      nombre: lead.nombre.trim(),
      email: lead.email.trim().toLowerCase(),
      telefono: lead.telefono?.trim() || null,
      mensaje: lead.mensaje?.trim() || null,
      fuente: lead.fuente ?? "empezar",
      ingresos_mensuales: lead.ingresosMensuales ?? null,
      ingresos_mas_300: Boolean(lead.ingresosMas300),
      cfdi_mensuales: lead.cfdiMensuales ?? null,
      cfdi_mas_50: Boolean(lead.cfdiMas50),
      estatus: "nuevo",
    };
    const { data, error } = await admin
      .from("site_leads")
      .insert(fila)
      .select(LEAD_COLUMNS)
      .maybeSingle();
    if (error) {
      if (error.message.includes("does not exist")) {
        return { ok: false, error: "Servicio temporalmente no disponible." };
      }
      const { data: basico, error: fallback } = await admin
        .from("site_leads")
        .insert({
          nombre: fila.nombre,
          email: fila.email,
          telefono: fila.telefono,
          mensaje: fila.mensaje,
          fuente: fila.fuente,
        })
        .select("id, nombre, email, telefono, mensaje, fuente, created_at")
        .maybeSingle();
      if (fallback) return { ok: false, error: fallback.message };
      return {
        ok: true,
        lead: basico ? completarLead(basico as SiteLead) : undefined,
      };
    }
    return {
      ok: true,
      lead: data ? completarLead(data as SiteLead) : undefined,
    };
  } catch {
    return { ok: false, error: "No se pudo registrar tu solicitud." };
  }
}

export async function listarSiteLeads(limit = 200): Promise<SiteLead[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("site_leads")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    const { data: viejos, error: fallback } = await admin
      .from("site_leads")
      .select(
        "id, nombre, email, telefono, mensaje, fuente, created_at, ingresos_mensuales, ingresos_mas_300, cfdi_mensuales, cfdi_mas_50, estatus, estatus_en, motivo_rechazo"
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (fallback) {
      if (fallback.message.includes("does not exist")) return [];
      throw new Error(fallback.message);
    }
    return (viejos ?? []).map((row) => completarLead(row as SiteLead));
  }

  return (data ?? []).map((row) => completarLead(row as SiteLead));
}

export async function obtenerSiteLead(id: string): Promise<SiteLead | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("site_leads")
    .select(LEAD_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return completarLead(data as SiteLead);
}

export type PatchLead = {
  id: string;
  estatus?: EstatusLead;
  motivoRechazo?: string | null;
  siguientePasoEn?: string | null;
  siguientePasoNota?: string | null;
  evento?: { tipo: EventoLeadTipo; detalle?: string };
  clienteId?: number | null;
};

export async function actualizarLead(
  args: PatchLead
): Promise<{ ok: true; lead: SiteLead } | { ok: false; error: string }> {
  const actual = await obtenerSiteLead(args.id);
  if (!actual) return { ok: false, error: "No encontramos ese prospecto." };

  const patch: Record<string, unknown> = {};
  let bitacora = actual.bitacora;

  if (args.estatus && args.estatus !== actual.estatus) {
    if (args.estatus === "rechazado") {
      const v = validarMotivoRechazo(args.motivoRechazo ?? actual.motivo_rechazo);
      if (!v.ok) return { ok: false, error: v.error };
      patch.motivo_rechazo = v.motivo;
    }
    patch.estatus = args.estatus;
    patch.estatus_en = new Date().toISOString();
    bitacora = appendEventoLead(
      bitacora,
      nuevoEventoLead("estatus", args.estatus)
    );
  }

  if (args.siguientePasoEn !== undefined) {
    patch.siguiente_paso_en = args.siguientePasoEn;
    if (args.siguientePasoNota !== undefined) {
      patch.siguiente_paso_nota = args.siguientePasoNota?.trim() || null;
    }
    if (args.siguientePasoEn) {
      bitacora = appendEventoLead(
        bitacora,
        nuevoEventoLead(
          "paso",
          args.siguientePasoNota?.trim() || "Recordatorio agendado"
        )
      );
    }
  } else if (args.siguientePasoNota !== undefined) {
    patch.siguiente_paso_nota = args.siguientePasoNota?.trim() || null;
  }

  if (args.evento) {
    bitacora = appendEventoLead(
      bitacora,
      nuevoEventoLead(args.evento.tipo, args.evento.detalle)
    );
    if (
      args.evento.tipo === "whatsapp" &&
      actual.estatus === "nuevo" &&
      !args.estatus
    ) {
      patch.estatus = "contactado";
      patch.estatus_en = new Date().toISOString();
    }
  }

  if (args.clienteId !== undefined) {
    patch.cliente_id = args.clienteId;
    if (args.clienteId != null) {
      patch.estatus = "aceptado";
      patch.estatus_en = new Date().toISOString();
      bitacora = appendEventoLead(
        bitacora,
        nuevoEventoLead("alta", `Cliente #${args.clienteId}`)
      );
    }
  }

  patch.bitacora = bitacora;

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("site_leads")
      .update(patch)
      .eq("id", args.id)
      .select(LEAD_COLUMNS)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "No encontramos ese prospecto." };
    return { ok: true, lead: completarLead(data as SiteLead) };
  } catch {
    return { ok: false, error: "No se pudo actualizar el prospecto." };
  }
}

/** @deprecated usar actualizarLead */
export async function actualizarEstatusLead(args: {
  id: string;
  estatus: EstatusLead;
  motivoRechazo?: string | null;
}) {
  return actualizarLead(args);
}
