import { NextResponse } from "next/server";
import { validarTokenCalendarioCumple } from "@/lib/admin/cumple-cal-token";
import { construirIcsCumpleDespacho } from "@/lib/admin/cumpleanos-ics";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esAdmin } from "@/lib/supabase/roles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

/**
 * Feed iCalendar suscribible (webcal) para cumpleaños de clientes activos.
 * El token identifica al admin; no requiere cookies (iPhone/Google Calendar).
 */
export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const userId = validarTokenCalendarioCumple(decodeURIComponent(token));
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
    const ics = construirIcsCumpleDespacho(clientes);
    return new Response(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="cumple-despacho-rdc.ics"',
        "Cache-Control": "public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar calendario." },
      { status: 500 }
    );
  }
}
