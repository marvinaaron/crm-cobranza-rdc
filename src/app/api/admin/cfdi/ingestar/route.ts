import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { ingestarCfdiXml } from "@/lib/cfdi/ingesta";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * POST /api/admin/cfdi/ingestar
 * multipart: clienteId (number), file (XML)
 * Ingesta manual para pruebas y carga del despacho antes de descarga SAT.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const clienteIdRaw = formData.get("clienteId");
  const clienteId =
    typeof clienteIdRaw === "string"
      ? Number.parseInt(clienteIdRaw, 10)
      : Number.NaN;
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId inválido." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Sube un archivo XML." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "El XML supera 5 MB." }, { status: 400 });
  }

  try {
    const estado = await leerCrmEstadoCompleto();
    const cliente = estado.clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resultado = await ingestarCfdiXml({
      clienteId,
      rfcCliente: cliente.rfc,
      xml: buffer,
      nombreArchivo: file.name,
    });

    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      registro: {
        uuid: resultado.registro.uuidSat,
        tipo: resultado.registro.tipo,
        total: resultado.registro.total,
        fecha: resultado.registro.fecha,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al ingestar." },
      { status: 500 }
    );
  }
}
