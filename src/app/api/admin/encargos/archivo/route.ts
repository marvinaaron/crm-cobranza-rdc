import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";
import {
  borrarArchivosDeEncargos,
  asegurarBucketEncargos,
} from "@/lib/supabase/encargos-storage";
import type { Encargo } from "@/lib/encargos";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const MIMES_VALIDOS = new Set([
  "application/pdf",
  "application/xml",
  "text/xml",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
]);

function extDe(file: File): string {
  const m = file.name.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (m) return m[1];
  if (file.type === "application/pdf") return "pdf";
  if (file.type.includes("xml")) return "xml";
  return "bin";
}

/** POST /api/admin/encargos/archivo  multipart { file } → { path } */
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
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Sube un archivo." }, { status: 400 });
  }
  if (file.type && !MIMES_VALIDOS.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no válido (PDF, XML o imagen)." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El archivo no debe pesar más de 4 MB." },
      { status: 400 }
    );
  }

  await asegurarBucketEncargos();
  const admin = getSupabaseAdmin();
  const path = `admin/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extDe(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage
    .from(BUCKETS.encargos)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, path });
}

/**
 * DELETE /api/admin/encargos/archivo  body { encargos: Encargo[] }
 * Borra de Storage los archivos de los encargos indicados (liberar espacio).
 */
export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: { encargos?: Encargo[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  try {
    if (Array.isArray(body.encargos)) {
      await borrarArchivosDeEncargos(body.encargos);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al borrar." },
      { status: 500 }
    );
  }
}
