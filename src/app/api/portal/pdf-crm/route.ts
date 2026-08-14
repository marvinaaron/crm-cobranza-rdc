import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { subirPdfAlBucket } from "@/lib/supabase/pdfs-crm-storage";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  if (!sess.user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
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

  const destinoRaw = String(formData.get("destino") ?? "comprobantes-impuestos");
  const destino =
    destinoRaw === "comprobantes-honorarios"
      ? "comprobantes-honorarios"
      : "comprobantes-impuestos";

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
