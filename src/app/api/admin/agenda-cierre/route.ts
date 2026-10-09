import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  guardarAgendaCierreRegistros,
  leerAgendaCierreRegistros,
  type MapaAgendaCierre,
} from "@/lib/supabase/agenda-cierre-db";
import type { RegistroTarea } from "@/lib/agenda-cierre";

/**
 * GET /api/admin/agenda-cierre — Progreso del workflow del despacho (nube).
 * PUT /api/admin/agenda-cierre — Sincroniza el mapa de tareas completadas.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const registros = await leerAgendaCierreRegistros();
    return NextResponse.json({ registros });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al leer agenda." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: { registros?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const raw = body.registros;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ error: "registros inválido." }, { status: 400 });
  }

  const registros = raw as MapaAgendaCierre;
  for (const val of Object.values(registros)) {
    if (!val || typeof val !== "object" || !("estado" in val)) {
      return NextResponse.json({ error: "Formato de registro inválido." }, { status: 400 });
    }
    const reg = val as RegistroTarea;
    if (
      !["sin_marcar", "completada", "pendiente", "error"].includes(reg.estado)
    ) {
      return NextResponse.json({ error: "Estado de tarea inválido." }, { status: 400 });
    }
  }

  try {
    await guardarAgendaCierreRegistros(registros);
    return NextResponse.json({ ok: true, guardadoEn: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar agenda." },
      { status: 500 }
    );
  }
}
