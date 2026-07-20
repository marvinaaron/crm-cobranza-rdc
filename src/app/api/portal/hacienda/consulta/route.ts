import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import {
  armarPayloadConsultaCfdi,
  labelPeriodoConsulta,
} from "@/lib/cfdi/consulta-response";
import type { TipoCfdi } from "@/lib/cfdi/types";
import { parseAlcanceDesdeSearchParams } from "@/lib/cfdi/alcance-periodo";

/** GET — consulta numérica de CFDI (clientes o proveedores). Sin descarga. */
export async function GET(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const clienteId = clienteIdDesdeUsuarioPortal(user);
  if (clienteId == null) {
    return NextResponse.json({ error: "Sin cliente asociado." }, { status: 403 });
  }

  const vistaRaw = req.nextUrl.searchParams.get("vista");
  const vista: TipoCfdi =
    vistaRaw === "proveedores" ? "recibido" : "emitido";

  const parsed = parseAlcanceDesdeSearchParams(req.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const busqueda = req.nextUrl.searchParams.get("q") ?? undefined;
  const { desde, hasta } = parsed.alcance;

  try {
    const payload = await armarPayloadConsultaCfdi({
      clienteId,
      mes: desde.mes,
      anio: desde.anio,
      mesHasta: hasta.mes,
      anioHasta: hasta.anio,
      tipo: vista,
      busqueda,
    });

    return NextResponse.json({
      ok: true,
      vista: vistaRaw === "proveedores" ? "proveedores" : "clientes",
      periodo: {
        mes: desde.mes,
        anio: desde.anio,
        mesHasta: hasta.mes,
        anioHasta: hasta.anio,
        label: labelPeriodoConsulta({
          mes: desde.mes,
          anio: desde.anio,
          mesHasta: hasta.mes,
          anioHasta: hasta.anio,
        }),
      },
      ...payload,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en consulta." },
      { status: 500 }
    );
  }
}
