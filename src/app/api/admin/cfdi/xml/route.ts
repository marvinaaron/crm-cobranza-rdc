import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { obtenerCfdiPorUuid } from "@/lib/cfdi/db";
import { descargarXmlCfdi } from "@/lib/cfdi/storage";

/** GET — descarga XML de un CFDI (admin, cualquier cliente). */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const clienteIdRaw = req.nextUrl.searchParams.get("clienteId");
  const clienteId = clienteIdRaw ? Number.parseInt(clienteIdRaw, 10) : Number.NaN;
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId inválido." }, { status: 400 });
  }

  const uuid = req.nextUrl.searchParams.get("uuid")?.trim().toUpperCase();
  if (!uuid) {
    return NextResponse.json({ error: "Falta el UUID." }, { status: 400 });
  }

  try {
    const registro = await obtenerCfdiPorUuid(clienteId, uuid);
    if (!registro) {
      return NextResponse.json({ error: "Comprobante no encontrado." }, { status: 404 });
    }

    const { buffer, contentType } = await descargarXmlCfdi(registro.xmlPath);
    const nombre = registro.nombreArchivo ?? `${uuid}.xml`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${nombre}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al descargar XML." },
      { status: 500 }
    );
  }
}
