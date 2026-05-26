import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { descargarDocumentoSat } from "@/lib/sat/documentos-storage";
import type { TipoDocumentoSAT } from "@/lib/sat/types";

function tipoValido(raw: string | null): TipoDocumentoSAT | null {
  if (raw === "constancia" || raw === "opinion") return raw;
  return null;
}

/** GET ?tipo=constancia|opinion — descarga PDF del cliente autenticado. */
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
    const estado = await leerCrmEstadoCompleto();
    const cliente = estado.clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const ref =
      tipo === "constancia"
        ? cliente.satPortal?.documentos?.constancia
        : cliente.satPortal?.documentos?.opinionPdf;
    if (!ref?.storagePath) {
      return NextResponse.json({ error: "Documento no disponible." }, { status: 404 });
    }

    const { buffer } = await descargarDocumentoSat(ref.storagePath);
    const nombre = ref.nombreArchivo || `${tipo}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(nombre)}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al descargar." },
      { status: 500 }
    );
  }
}
