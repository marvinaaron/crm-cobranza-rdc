import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import {
  consultarOpinionPublicaSat,
  debeReconsultarOpinion,
} from "@/lib/sat/opinion-publica";
import {
  actualizarClienteEnDb,
  leerCrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";
import type { SatPortalCliente } from "@/lib/sat/types";

/**
 * GET /api/portal/opinion-cumplimiento
 * Consulta la opinión 32-D pública del SAT y guarda el resultado en el cliente.
 * Query: ?force=1 para ignorar caché de 24 h.
 */
export async function GET(request: NextRequest) {
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

  const forzar =
    request.nextUrl.searchParams.get("force") === "1" ||
    request.nextUrl.searchParams.get("force") === "true";

  try {
    const estado = await leerCrmEstadoCompleto();
    const cliente = estado.clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const sat: SatPortalCliente = { ...cliente.satPortal };
    const ultima = sat.opinionPublica?.ultimaConsulta;
    const cacheValido =
      !forzar &&
      sat.opinionPublica?.estado &&
      sat.opinionPublica.estado !== "pendiente" &&
      !debeReconsultarOpinion(ultima, false);

    if (cacheValido && sat.opinionPublica) {
      return NextResponse.json({
        ok: true,
        desdeCache: true,
        rfc: cliente.rfc,
        opinionAutorizadaEnSat: sat.opinionAutorizadaEnSat === true,
        opinion: sat.opinionPublica,
      });
    }

    const resultado = await consultarOpinionPublicaSat(cliente.rfc);
    const ahora = new Date().toISOString();
    sat.opinionPublica = {
      estado: resultado.estado,
      mensaje: resultado.mensaje,
      ultimaConsulta: ahora,
    };

    const actualizado = { ...cliente, satPortal: sat };
    await actualizarClienteEnDb(actualizado);

    return NextResponse.json({
      ok: true,
      desdeCache: false,
      rfc: cliente.rfc,
      opinionAutorizadaEnSat: sat.opinionAutorizadaEnSat === true,
      opinion: sat.opinionPublica,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al consultar." },
      { status: 500 }
    );
  }
}
