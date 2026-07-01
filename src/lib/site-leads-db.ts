import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type NuevoLead = {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje?: string;
  fuente?: string;
};

export async function guardarSiteLead(lead: NuevoLead): Promise<{ ok: true } | { ok: false; error: string }> {
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
