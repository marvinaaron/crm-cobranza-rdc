import { NextResponse, type NextRequest } from "next/server";
import { requireModulo } from "@/lib/supabase/require-modulo";
import {
  actualizarClienteEnDb,
  leerCrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";
import { subirDocumentoSat } from "@/lib/sat/documentos-storage";
import type { SatPortalCliente, TipoDocumentoSAT } from "@/lib/sat/types";

function parseTipo(raw: FormDataEntryValue | null): TipoDocumentoSAT | null {
  if (raw === "constancia" || raw === "opinion") return raw;
  return null;
}

/**
 * POST multipart: clienteId, tipo (constancia|opinion), archivo PDF.
 * PATCH JSON: clienteId, opinionAutorizadaEnSat (boolean).
 */
export async function POST(request: NextRequest) {
  const guard = await requireModulo("cumplimiento");
  if (guard instanceof NextResponse) return guard;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const clienteId = Number(formData.get("clienteId"));
  const tipo = parseTipo(formData.get("tipo"));
  const file = formData.get("archivo");

  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }
  if (!tipo) {
    return NextResponse.json(
      { error: "tipo debe ser constancia u opinion." },
      { status: 400 }
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Sube un archivo PDF." }, { status: 400 });
  }

  try {
    const estado = await leerCrmEstadoCompleto();
    const idx = estado.clientes.findIndex((c) => c.id === clienteId);
    if (idx < 0) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const cliente = estado.clientes[idx];
    const sat: SatPortalCliente = {
      ...cliente.satPortal,
      documentos: { ...cliente.satPortal?.documentos },
    };
    const previo =
      tipo === "constancia"
        ? sat.documentos?.constancia
        : sat.documentos?.opinionPdf;

    const ref = await subirDocumentoSat({
      clienteId,
      tipo,
      file,
      previo,
    });

    if (!sat.documentos) sat.documentos = {};
    if (tipo === "constancia") {
      sat.documentos.constancia = ref;
    } else {
      sat.documentos.opinionPdf = ref;
    }

    const actualizado = { ...cliente, satPortal: sat };
    await actualizarClienteEnDb(actualizado);

    return NextResponse.json({
      ok: true,
      cliente: actualizado,
      tipo,
      documento: ref,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al subir." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireModulo("cumplimiento");
  if (guard instanceof NextResponse) return guard;

  let body: { clienteId?: number; opinionAutorizadaEnSat?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const clienteId = Number(body.clienteId);
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  try {
    const estado = await leerCrmEstadoCompleto();
    const cliente = estado.clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const sat: SatPortalCliente = {
      ...cliente.satPortal,
      opinionAutorizadaEnSat: body.opinionAutorizadaEnSat === true,
    };
    const actualizado = { ...cliente, satPortal: sat };
    await actualizarClienteEnDb(actualizado);

    return NextResponse.json({ ok: true, cliente: actualizado });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar." },
      { status: 500 }
    );
  }
}
