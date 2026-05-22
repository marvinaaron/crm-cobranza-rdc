import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  guardarCrmEstadoCompleto,
  leerCrmEstadoCompleto,
  type CrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";

/**
 * GET /api/admin/crm-estado — Estado completo del CRM (sincronización multi-dispositivo).
 * PUT /api/admin/crm-estado — Guarda el estado completo enviado por el admin.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const estado = await leerCrmEstadoCompleto();
    return NextResponse.json(estado);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al leer datos." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: Partial<CrmEstadoCompleto> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const actual = await leerCrmEstadoCompleto();
    const merged: CrmEstadoCompleto = {
      clientes: Array.isArray(body.clientes) ? body.clientes : actual.clientes,
      comprobantes: Array.isArray(body.comprobantes)
        ? body.comprobantes
        : actual.comprobantes,
      facturas: Array.isArray(body.facturas) ? body.facturas : actual.facturas,
      cumplimiento: Array.isArray(body.cumplimiento)
        ? body.cumplimiento
        : actual.cumplimiento,
      historialImpuestos: Array.isArray(body.historialImpuestos)
        ? body.historialImpuestos
        : actual.historialImpuestos,
      notificaciones: Array.isArray(body.notificaciones)
        ? body.notificaciones
        : actual.notificaciones,
      repse: Array.isArray(body.repse) ? body.repse : actual.repse,
    };
    await guardarCrmEstadoCompleto(merged);
    return NextResponse.json({ ok: true, guardadoEn: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar." },
      { status: 500 }
    );
  }
}
