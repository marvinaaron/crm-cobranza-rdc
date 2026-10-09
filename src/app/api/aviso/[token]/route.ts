import { NextResponse } from "next/server";
import {
  aceptarAvisoPrivacidadPorToken,
  leerTitularPorTokenAviso,
} from "@/lib/supabase/crm-estado-db";
import { AVISO_PRIVACIDAD_VERSION } from "@/lib/aviso-privacidad";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/aviso/[token] — Vista pública (cliente o prospecto de presupuesto). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const titular = await leerTitularPorTokenAviso(token);
  if (!titular) {
    return NextResponse.json({ error: "no-encontrado" }, { status: 404 });
  }
  return NextResponse.json({
    razonSocial: titular.razonSocial,
    tipo: titular.tipo,
    aceptado: Boolean(titular.avisoPrivacidad.aceptadoEn),
    enviadoEn: titular.avisoPrivacidad.enviadoEn ?? null,
    aceptadoEn: titular.avisoPrivacidad.aceptadoEn ?? null,
    version: titular.avisoPrivacidad.version ?? AVISO_PRIVACIDAD_VERSION,
  });
}

/**
 * POST /api/aviso/[token]
 * body: { aceptar: true }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  let body: { aceptar?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (body.aceptar !== true) {
    return NextResponse.json(
      { error: "Debes aceptar el aviso de privacidad." },
      { status: 400 }
    );
  }

  try {
    const actualizado = await aceptarAvisoPrivacidadPorToken(token);
    if (!actualizado) {
      return NextResponse.json({ error: "no-encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      tipo: actualizado.tipo,
      aceptadoEn: actualizado.aceptadoEn,
      version: actualizado.version,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al registrar." },
      { status: 500 }
    );
  }
}
