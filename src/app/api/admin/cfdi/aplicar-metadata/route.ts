import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { actualizarEstatusCfdiDesdeMetadata } from "@/lib/cfdi/db";
import { parsearMetadataSatTexto } from "@/lib/cfdi/parse-metadata-sat";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * POST /api/admin/cfdi/aplicar-metadata
 * multipart: clienteId, file (txt/csv de metadata SAT)
 * Marca vigente/cancelado por UUID según el SAT.
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

  const files = formData.getAll("file").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json(
      { error: "Sube al menos un archivo de metadata (.txt / .csv)." },
      { status: 400 }
    );
  }

  try {
    const porUuid = new Map<
      string,
      { uuid: string; estatus: "vigente" | "cancelado"; fechaCancelacion?: string }
    >();

    for (const file of files) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `El archivo ${file.name} supera 8 MB.` },
          { status: 400 }
        );
      }
      const texto = Buffer.from(await file.arrayBuffer()).toString("utf8");
      for (const item of parsearMetadataSatTexto(texto)) {
        porUuid.set(item.uuid, item);
      }
    }

    const items = [...porUuid.values()];
    if (items.length === 0) {
      return NextResponse.json(
        {
          error:
            "No se encontraron UUID/estatus en la metadata. Verifica que sea el archivo del SAT (TXT/CSV).",
        },
        { status: 400 }
      );
    }

    const { actualizados, cancelados } = await actualizarEstatusCfdiDesdeMetadata(
      clienteId,
      items
    );

    return NextResponse.json({
      ok: true,
      leidos: items.length,
      actualizados,
      cancelados,
      sinCoincidencia: items.length - actualizados,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Error al aplicar metadata de cancelados.",
      },
      { status: 500 }
    );
  }
}
