import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import { descargarArchivoEfirma } from "@/lib/efirma/db";

function tipoValido(raw: string | null): "cer" | "key" | null {
  if (raw === "cer" || raw === "key") return raw;
  return null;
}

/** GET ?tipo=cer|key — el cliente baja su propio certificado de e.firma. */
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

  const tipo = tipoValido(request.nextUrl.searchParams.get("tipo"));
  if (!tipo) {
    return NextResponse.json({ error: "tipo inválido." }, { status: 400 });
  }

  try {
    const archivo = await descargarArchivoEfirma(clienteId, tipo);
    if (!archivo) {
      return NextResponse.json({ error: "Archivo no disponible." }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(archivo.bytes), {
      status: 200,
      headers: {
        "Content-Type": archivo.contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(archivo.filename)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al descargar." },
      { status: 500 }
    );
  }
}
