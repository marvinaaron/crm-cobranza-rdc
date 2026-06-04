import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { crearBackup, restaurarBackup } from "@/lib/supabase/backups";

export const runtime = "nodejs";

/**
 * POST /api/admin/backups/restaurar  body { nombre }
 * Crea un respaldo de seguridad del estado actual (tipo "auto") y luego
 * restaura el respaldo indicado, dejando el CRM como estaba en ese punto.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let nombre = "";
  try {
    const body = (await request.json()) as { nombre?: string };
    nombre = body.nombre ?? "";
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!nombre) {
    return NextResponse.json({ error: "Falta el nombre." }, { status: 400 });
  }

  try {
    // Red de seguridad: respalda el estado actual antes de sobrescribirlo.
    await crearBackup("auto");
    await restaurarBackup(nombre);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo restaurar." },
      { status: 500 }
    );
  }
}
