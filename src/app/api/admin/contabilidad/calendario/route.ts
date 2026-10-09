import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import {
  construirIcsContabilidadDespacho,
} from "@/lib/admin/contabilidad-ics";
import { clientesConDiaContabilidad } from "@/lib/admin/dia-contabilidad";
import { generarTokenCalendarioContabilidad } from "@/lib/admin/contabilidad-cal-token";
import {
  NOMBRE_CAL_CONTABILIDAD,
  urlsCalendarioContabilidad,
} from "@/lib/admin/contabilidad-cal-urls";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/contabilidad/calendario
 *   ?meta=1  → JSON con ligas de suscripción
 *   (default) → snapshot .ics autenticado
 */
export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { user } = guard;
  const meta = new URL(request.url).searchParams.get("meta") === "1";

  try {
    const { clientes } = await leerCrmEstadoCompleto();
    const conDia = clientesConDiaContabilidad(clientes);

    if (meta) {
      const token = generarTokenCalendarioContabilidad(user.id);
      const ligas = urlsCalendarioContabilidad(token);
      return NextResponse.json({
        nombreCal: NOMBRE_CAL_CONTABILIDAD,
        total: conDia.length,
        ...ligas,
        recomendacion:
          "Suscríbete una sola vez: al mover el día de un cliente, el evento se actualiza en el iPhone (mismo UID, no se duplica).",
      });
    }

    const ics = construirIcsContabilidadDespacho(clientes);
    return new Response(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="contabilidades-rdc.ics"',
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
