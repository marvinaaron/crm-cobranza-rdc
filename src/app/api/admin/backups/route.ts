import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  crearBackup,
  listarBackups,
  borrarBackup,
  type TipoBackup,
} from "@/lib/supabase/backups";

export const runtime = "nodejs";

/** GET /api/admin/backups — lista de respaldos en la nube. */
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  try {
    const backups = await listarBackups();
    return NextResponse.json({ backups });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudieron listar." },
      { status: 500 }
    );
  }
}

/** POST /api/admin/backups — crea un respaldo del estado actual. body { tipo? } */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  let tipo: TipoBackup = "manual";
  try {
    const body = (await request.json()) as { tipo?: TipoBackup };
    if (body.tipo === "cierre" || body.tipo === "auto") tipo = body.tipo;
  } catch {
    /* sin body → manual */
  }
  try {
    const info = await crearBackup(tipo);
    return NextResponse.json({ ok: true, backup: info });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo crear el respaldo." },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/backups?nombre=... — borra un respaldo. */
export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const nombre = request.nextUrl.searchParams.get("nombre");
  if (!nombre) {
    return NextResponse.json({ error: "Falta el nombre." }, { status: 400 });
  }
  try {
    await borrarBackup(nombre);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo borrar." },
      { status: 500 }
    );
  }
}
