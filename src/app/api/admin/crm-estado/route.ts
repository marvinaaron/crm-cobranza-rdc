import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  fusionarPorId,
  guardarCrmEstadoParcial,
  leerCrmEstadoCompleto,
  type CrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";
import { firmarArchivosDeEncargos } from "@/lib/supabase/encargos-storage";
import {
  firmarPdfsCumplimiento,
  firmarComprobantesHonorarios,
  firmarFacturas,
} from "@/lib/supabase/pdfs-crm-storage";

/** Secciones pesadas que aceptan guardado granular por item (merge por id). */
const CLAVES_GRANULARES = ["cumplimiento", "comprobantes", "facturas"] as const;
type ClaveGranular = (typeof CLAVES_GRANULARES)[number];

type CuerpoPut = Partial<CrmEstadoCompleto> & {
  /** Items nuevos/modificados por sección; el servidor los fusiona por `id`. */
  upserts?: Partial<Record<ClaveGranular, { id: string }[]>>;
  /** Ids a eliminar por sección. */
  eliminar?: Partial<Record<ClaveGranular, string[]>>;
};

/**
 * GET /api/admin/crm-estado — Estado completo del CRM (sincronización multi-dispositivo).
 * PUT /api/admin/crm-estado — Guarda el estado completo enviado por el admin.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const estado = await leerCrmEstadoCompleto();
    estado.encargos = await firmarArchivosDeEncargos(estado.encargos);
    estado.cumplimiento = await firmarPdfsCumplimiento(estado.cumplimiento);
    estado.comprobantes = await firmarComprobantesHonorarios(estado.comprobantes);
    estado.facturas = await firmarFacturas(estado.facturas);
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

  let body: CuerpoPut = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const actual = await leerCrmEstadoCompleto();

    // Salvaguarda anti-borrado: un guardado con `clientes` vacío mientras la
    // nube ya tiene clientes es casi siempre un payload corrupto (p. ej. el
    // navegador intentó guardar antes de cargar). Lo rechazamos para no
    // sobreescribir datos reales con vacío.
    if (
      Array.isArray(body.clientes) &&
      body.clientes.length === 0 &&
      actual.clientes.length > 0
    ) {
      return NextResponse.json(
        { error: "Guardado rechazado: estado vacío (posible carga incompleta)." },
        { status: 409 }
      );
    }

    // Solo se re-escriben las secciones tocadas por este guardado.
    const tocadas = new Set<keyof CrmEstadoCompleto>();

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
      encargos: Array.isArray(body.encargos) ? body.encargos : actual.encargos,
      recordatorioLog: Array.isArray(body.recordatorioLog)
        ? body.recordatorioLog
        : actual.recordatorioLog,
      scriptsCorreo: Array.isArray(body.scriptsCorreo)
        ? body.scriptsCorreo
        : actual.scriptsCorreo,
      presupuestos: Array.isArray(body.presupuestos)
        ? body.presupuestos
        : actual.presupuestos,
      catalogoServicios: Array.isArray(body.catalogoServicios)
        ? body.catalogoServicios
        : actual.catalogoServicios,
      preciosRegimen: Array.isArray(body.preciosRegimen)
        ? body.preciosRegimen
        : actual.preciosRegimen,
    };
    for (const k of Object.keys(merged) as (keyof CrmEstadoCompleto)[]) {
      if (Array.isArray(body[k])) tocadas.add(k);
    }

    // Guardado granular: fusiona items por id sin re-subir la sección entera.
    // Evita el límite de 4.5 MB por request cuando cumplimiento/comprobantes/
    // facturas acumulan PDFs embebidos.
    for (const clave of CLAVES_GRANULARES) {
      const upserts = body.upserts?.[clave];
      const eliminar = body.eliminar?.[clave];
      if (!Array.isArray(upserts) && !Array.isArray(eliminar)) continue;
      merged[clave] = fusionarPorId(
        merged[clave] as { id: string }[],
        Array.isArray(upserts) ? upserts : [],
        Array.isArray(eliminar) ? eliminar : []
      ) as never;
      tocadas.add(clave);
    }

    if (tocadas.size === 0) {
      return NextResponse.json({ ok: true, guardadoEn: new Date().toISOString() });
    }
    await guardarCrmEstadoParcial(merged, [...tocadas]);
    return NextResponse.json({ ok: true, guardadoEn: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar." },
      { status: 500 }
    );
  }
}
