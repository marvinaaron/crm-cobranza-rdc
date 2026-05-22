import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  datosFiltradosParaCliente,
  fusionarDatosClientePortal,
  type CrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";

function clienteIdDeSesion(appMeta: Record<string, unknown>): number | null {
  const raw = appMeta.clienteId;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "" && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return null;
}

/**
 * GET /api/portal/datos — Datos del CRM filtrados para el cliente autenticado.
 * PUT /api/portal/datos — Fusiona cambios del cliente en el estado global.
 */
export async function GET() {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (appMeta.rol !== "cliente") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const clienteId = clienteIdDeSesion(appMeta);
  if (clienteId == null) {
    return NextResponse.json(
      { error: "Cuenta sin cliente vinculado." },
      { status: 404 }
    );
  }

  try {
    const datos = await datosFiltradosParaCliente(clienteId);
    const cliente = datos.clientes[0] ?? null;
    return NextResponse.json({
      clienteId,
      cliente,
      comprobantes: datos.comprobantes,
      facturas: datos.facturas,
      cumplimiento: datos.cumplimiento,
      historialImpuestos: datos.historialImpuestos,
      notificaciones: datos.notificaciones.filter(
        (n) => n.destinatario === "cliente" && n.clienteId === clienteId
      ),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al cargar datos." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (appMeta.rol !== "cliente") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const clienteId = clienteIdDeSesion(appMeta);
  if (clienteId == null) {
    return NextResponse.json(
      { error: "Cuenta sin cliente vinculado." },
      { status: 404 }
    );
  }

  let body: Partial<CrmEstadoCompleto & { cliente: CrmEstadoCompleto["clientes"][0] }> =
    {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    await fusionarDatosClientePortal({
      clienteId,
      cliente: body.cliente,
      comprobantes: Array.isArray(body.comprobantes) ? body.comprobantes : undefined,
      facturas: Array.isArray(body.facturas) ? body.facturas : undefined,
      cumplimiento: Array.isArray(body.cumplimiento) ? body.cumplimiento : undefined,
      historialImpuestos: Array.isArray(body.historialImpuestos)
        ? body.historialImpuestos
        : undefined,
      notificaciones: Array.isArray(body.notificaciones)
        ? body.notificaciones
        : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar." },
      { status: 500 }
    );
  }
}
