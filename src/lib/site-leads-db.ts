import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type NuevoLead = {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje?: string;
  fuente?: string;
};

export type SiteLead = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string | null;
  fuente: string;
  created_at: string;
};

export async function guardarSiteLead(
  lead: NuevoLead
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("site_leads").insert({
      nombre: lead.nombre.trim(),
      email: lead.email.trim().toLowerCase(),
      telefono: lead.telefono?.trim() || null,
      mensaje: lead.mensaje?.trim() || null,
      fuente: lead.fuente ?? "empezar",
    });
    if (error) {
      if (error.message.includes("does not exist")) {
        return { ok: false, error: "Servicio temporalmente no disponible." };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo registrar tu solicitud." };
  }
}

export async function listarSiteLeads(limit = 200): Promise<SiteLead[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("site_leads")
    .select("id, nombre, email, telefono, mensaje, fuente, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.message.includes("does not exist")) return [];
    throw new Error(error.message);
  }

  return (data ?? []) as SiteLead[];
}
