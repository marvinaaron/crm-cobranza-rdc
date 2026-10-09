import { NextResponse } from "next/server";
import { requireModulo } from "@/lib/supabase/require-modulo";
import {
  seedContrasenas2026,
  type FilaContrasenas,
} from "@/lib/accesos/contrasenas";
import {
  leerFilasContrasenas,
} from "@/lib/accesos/contrasenas-db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const CLAVE = "accesos_contrasenas";

async function guardarFilas(filas: FilaContrasenas[]): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("crm_estado").upsert(
    {
      clave: CLAVE,
      payload: filas,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clave" }
  );
  if (error) throw new Error(error.message);
}

/** GET — lista contraseñas de accesos (si no hay en nube, siembra desde Excel 2026). */
export async function GET() {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  try {
    const filas = await leerFilasContrasenas();
    return NextResponse.json({ ok: true, filas });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al leer contraseñas." },
      { status: 500 }
    );
  }
}

/** PUT — reemplaza todas las filas (edición futura / re-import). */
export async function PUT(request: Request) {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  let body: { filas?: FilaContrasenas[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!Array.isArray(body.filas)) {
    return NextResponse.json({ error: "Se requiere filas[]." }, { status: 400 });
  }

  try {
    await guardarFilas(body.filas);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar." },
      { status: 500 }
    );
  }
}

/** POST — fuerza re-import desde el seed del Excel embebido. */
export async function POST() {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  try {
    const filas = seedContrasenas2026();
    await guardarFilas(filas);
    return NextResponse.json({ ok: true, filas, importados: filas.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al importar." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
