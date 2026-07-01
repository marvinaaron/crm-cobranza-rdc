import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { construirIcsCumpleDespacho, listarClientesCumpleCalendario } from "@/lib/admin/cumpleanos-ics";
import { generarTokenCalendarioCumple } from "@/lib/admin/cumple-cal-token";
import { NOMBRE_CAL_CUMPLE, urlsCalendarioCumple } from "@/lib/admin/cumple-cal-urls";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/cumpleanos/calendario
 *   ?meta=1  → JSON con ligas de suscripción (Apple, Google, Outlook, .ics)
 *   (default) → descarga .ics autenticada (snapshot; puede duplicar si se baja varias veces)
 */
export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { user } = guard;
  const meta = new URL(request.url).searchParams.get("meta") === "1";

  try {
    const { clientes } = await leerCrmEstadoCompleto();
    const cumples = listarClientesCumpleCalendario(clientes);

    if (meta) {
      const token = generarTokenCalendarioCumple(user.id);
      const ligas = urlsCalendarioCumple(token);
      return NextResponse.json({
        nombreCal: NOMBRE_CAL_CUMPLE,
        total: cumples.length,
        ...ligas,
        recomendacion:
          "Suscríbete una sola vez: los clientes nuevos aparecen solos y no se duplican los existentes.",
      });
    }

    const ics = construirIcsCumpleDespacho(clientes);
    return new Response(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="cumple-despacho-rdc.ics"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar calendario." },
      { status: 500 }
    );
  }
}
