import { NextResponse } from "next/server";
import { validarTokenCalendarioContabilidad } from "@/lib/admin/contabilidad-cal-token";
import { construirIcsContabilidadDespacho } from "@/lib/admin/contabilidad-ics";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esAdmin } from "@/lib/supabase/roles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

/**
 * Feed iCalendar suscribible (webcal) de días de contabilidad.
 * UID estable por cliente: mover el día actualiza el evento, no lo duplica.
 */
export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const userId = validarTokenCalendarioContabilidad(decodeURIComponent(token));
  if (!userId) {
    return NextResponse.json({ error: "Enlace de calendario inválido." }, { status: 404 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user || !esAdmin(data.user)) {
    return NextResponse.json({ error: "Calendario no disponible." }, { status: 403 });
  }

  try {
    const { clientes } = await leerCrmEstadoCompleto();
    const ics = construirIcsContabilidadDespacho(clientes);
    return new Response(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="contabilidades-rdc.ics"',
        "Cache-Control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar calendario." },
      { status: 500 }
    );
  }
}
