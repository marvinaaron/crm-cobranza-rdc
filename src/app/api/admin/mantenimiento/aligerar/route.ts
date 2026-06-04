import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  leerCrmEstadoCompleto,
  guardarCrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";
import { crearBackup } from "@/lib/supabase/backups";
import { aligerarCumplimientoAntiguo } from "@/lib/mantenimiento";

export const runtime = "nodejs";

/**
 * POST /api/admin/mantenimiento/aligerar  body { mesesConservar? }
 * Respalda el estado actual y quita los archivos embebidos de cumplimiento de
 * más de `mesesConservar` meses (default 12). Conserva toda la metadata.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let mesesConservar = 12;
  try {
    const body = (await request.json()) as { mesesConservar?: number };
    if (
      typeof body.mesesConservar === "number" &&
      Number.isFinite(body.mesesConservar) &&
      body.mesesConservar >= 1
    ) {
      mesesConservar = Math.floor(body.mesesConservar);
    }
  } catch {
    /* sin body → 12 meses */
  }

  try {
    // Respaldo de seguridad antes de tocar nada.
    await crearBackup("auto");

    const estado = await leerCrmEstadoCompleto();
    const bytesAntes = Buffer.byteLength(
      JSON.stringify(estado.cumplimiento),
      "utf8"
    );
    const { cumplimiento, aligerados } = aligerarCumplimientoAntiguo(
      estado.cumplimiento,
      mesesConservar
    );
    estado.cumplimiento = cumplimiento;
    const bytesDespues = Buffer.byteLength(
      JSON.stringify(cumplimiento),
      "utf8"
    );

    await guardarCrmEstadoCompleto(estado);

    return NextResponse.json({
      ok: true,
      aligerados,
      bytesAntes,
      bytesDespues,
      liberados: Math.max(0, bytesAntes - bytesDespues),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo optimizar." },
      { status: 500 }
    );
  }
}
