import { NextResponse, type NextRequest } from "next/server";
import { requireModulo } from "@/lib/supabase/require-modulo";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { descargarDocumentoSat } from "@/lib/sat/documentos-storage";
import type { TipoDocumentoSAT } from "@/lib/sat/types";

/** GET ?clienteId=&tipo=constancia|opinion — descarga para admin. */
export async function GET(request: NextRequest) {
  const guard = await requireModulo("cumplimiento");
  if (guard instanceof NextResponse) return guard;

  const clienteId = Number(request.nextUrl.searchParams.get("clienteId"));
  const tipo = request.nextUrl.searchParams.get("tipo") as TipoDocumentoSAT | null;

  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }
  if (tipo !== "constancia" && tipo !== "opinion") {
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
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al descargar." },
      { status: 500 }
    );
  }
}
