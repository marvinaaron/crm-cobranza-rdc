import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  type DestinoPdfCrm,
  crearUrlSubidaFirmada,
  subirPdfAlBucket,
} from "@/lib/supabase/pdfs-crm-storage";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

function destinoPortal(raw: string): DestinoPdfCrm {
  if (raw === "comprobantes-honorarios") return "comprobantes-honorarios";
  if (raw === "cumplimiento") return "cumplimiento";
  if (raw === "facturas") return "facturas";
  // Comprobantes de pago de impuestos (y destinos desconocidos del portal).
  return "comprobantes-impuestos";
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  if (!sess.user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let body: { destino?: string; nombreArchivo?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }
    try {
      const firma = await crearUrlSubidaFirmada({
        destino: destinoPortal(String(body.destino ?? "")),
        nombreArchivo: String(body.nombreArchivo ?? "documento.pdf"),
      });
      return NextResponse.json({ ok: true, ...firma });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "No se pudo firmar la subida." },
        { status: 500 }
      );
    }
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Sube un archivo." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El archivo no debe superar 8 MB." },
      { status: 400 }
    );
  }

  const destino = destinoPortal(String(formData.get("destino") ?? ""));

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = await subirPdfAlBucket({
      destino,
      buffer,
      contentType: file.type || "application/pdf",
      nombreArchivo: file.name,
    });
    return NextResponse.json({ ok: true, path });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo subir el PDF." },
      { status: 500 }
    );
  }
}
