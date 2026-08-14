import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  type DestinoPdfCrm,
  subirPdfAlBucket,
} from "@/lib/supabase/pdfs-crm-storage";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024;
const DESTINOS: DestinoPdfCrm[] = [
  "cumplimiento",
  "comprobantes-impuestos",
  "comprobantes-honorarios",
  "facturas",
];

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }
  const file = formData.get("file");
  const destinoRaw = String(formData.get("destino") ?? "cumplimiento");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Sube un archivo." }, { status: 400 });
  }
  if (!DESTINOS.includes(destinoRaw as DestinoPdfCrm)) {
    return NextResponse.json({ error: "Destino inválido." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El PDF no debe superar 15 MB." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = await subirPdfAlBucket({
      destino: destinoRaw as DestinoPdfCrm,
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
