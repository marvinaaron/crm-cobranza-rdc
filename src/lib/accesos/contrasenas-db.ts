import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizarRfc } from "@/lib/cfdi/parser";
import {
  seedContrasenas2026,
  type FilaContrasenas,
} from "@/lib/accesos/contrasenas";

const CLAVE = "accesos_contrasenas";

/** Lee contraseñas de accesos desde Supabase (o seed embebido). */
export async function leerFilasContrasenas(): Promise<FilaContrasenas[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("crm_estado")
    .select("payload")
    .eq("clave", CLAVE)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const payload = data?.payload;
  if (Array.isArray(payload) && payload.length > 0) {
    return payload as FilaContrasenas[];
  }
  return seedContrasenas2026();
}

/** Contraseña de la llave privada (.key) por RFC normalizado. */
export function contrasenaFielPorRfc(
  filas: FilaContrasenas[],
  rfc: string
): string | null {
  const norm = normalizarRfc(rfc);
  if (!norm) return null;
  const fila = filas.find((f) => normalizarRfc(f.rfc ?? "") === norm);
  const pwd = String(fila?.fiel ?? "").trim();
  return pwd || null;
}
