import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** ¿Este correo tiene Pro activo en herramientas? */
export async function emailTieneProHerramientas(
  email: string
): Promise<boolean> {
  const normalizado = email.trim().toLowerCase();
  if (!normalizado) return false;
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("herramientas_facturacion_uso")
      .select("es_pro")
      .ilike("email_pro", normalizado)
      .eq("es_pro", true)
      .limit(1);
    if (error) {
      if (error.message.includes("does not exist")) return false;
      throw new Error(error.message);
    }
    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Activa Pro para un correo tras pago (upsert por email). */
export async function activarProHerramientasPorEmail(
  email: string,
  opts?: { userId?: string; planId?: string }
): Promise<void> {
  const normalizado = email.trim().toLowerCase();
  if (!normalizado) return;
  const admin = getSupabaseAdmin();
  const visitorId = `pro-${normalizado.replace(/[^a-z0-9@._-]/g, "-")}`;

  const { data: existente } = await admin
    .from("herramientas_facturacion_uso")
    .select("visitor_id, calculos, cuenta_verificada")
    .ilike("email_pro", normalizado)
    .maybeSingle();

  const row = {
    visitor_id: existente?.visitor_id ?? visitorId,
    calculos: existente?.calculos ?? 0,
    cuenta_verificada: true,
    es_pro: true,
    email_pro: normalizado,
    user_id: opts?.userId ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("herramientas_facturacion_uso")
    .upsert(row, { onConflict: "visitor_id" });
  if (error) throw new Error(error.message);
}
