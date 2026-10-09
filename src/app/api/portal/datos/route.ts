import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  datosFiltradosParaCliente,
  fusionarDatosClientePortal,
  type CrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";
import { firmarArchivosDeEncargos } from "@/lib/supabase/encargos-storage";
import {
  firmarPdfsCumplimiento,
  firmarComprobantesHonorarios,
  firmarFacturas,
} from "@/lib/supabase/pdfs-crm-storage";

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
    const encargosFirmados = await firmarArchivosDeEncargos(datos.encargos);
    const cumplimiento = await firmarPdfsCumplimiento(datos.cumplimiento);
    const comprobantes = await firmarComprobantesHonorarios(datos.comprobantes);
    const facturas = await firmarFacturas(datos.facturas);
    return NextResponse.json({
      clienteId,
      cliente,
      comprobantes,
      facturas,
      cumplimiento,
      historialImpuestos: datos.historialImpuestos,
      notificaciones: datos.notificaciones.filter(
        (n) => n.destinatario === "cliente" && n.clienteId === clienteId
      ),
      repse: datos.repse,
      encargos: encargosFirmados,
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
      repse: Array.isArray(body.repse) ? body.repse : undefined,
      encargos: Array.isArray(body.encargos) ? body.encargos : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar." },
      { status: 500 }
    );
  }
}
