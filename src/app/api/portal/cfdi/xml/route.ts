import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import { obtenerCfdiPorUuid } from "@/lib/cfdi/db";
import { descargarXmlCfdi } from "@/lib/cfdi/storage";

/** GET — descarga el XML de un CFDI del cliente autenticado. */
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
