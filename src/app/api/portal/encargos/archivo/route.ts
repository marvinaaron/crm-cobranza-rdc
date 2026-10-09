import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esCliente } from "@/lib/supabase/roles";
import { BUCKETS } from "@/lib/supabase/buckets";
import { asegurarBucketEncargos } from "@/lib/supabase/encargos-storage";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB por archivo (las imágenes llegan ya comprimidas)
const MIMES_VALIDOS = new Set([
  "application/pdf",
  "application/xml",
  "text/xml",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
]);

function clienteIdDeSesion(appMeta: Record<string, unknown>): number | null {
  const raw = appMeta.clienteId;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "" && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return null;
}

function extDe(file: File): string {
  const m = file.name.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (m) return m[1];
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "application/pdf") return "pdf";
  return "bin";
}

/** POST /api/portal/encargos/archivo  multipart { file } → { path } */
export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esCliente(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const clienteId = clienteIdDeSesion(
    (user.app_metadata ?? {}) as Record<string, unknown>
  );
  if (clienteId == null) {
    return NextResponse.json({ error: "Cuenta sin cliente." }, { status: 404 });
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
  const path = `${clienteId}/${Date.now()}-${Math.random()
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
 * DELETE /api/portal/encargos/archivo  body { paths: string[] }
 * Borra archivos del propio cliente (solo rutas bajo su carpeta).
 */
export async function DELETE(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esCliente(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const clienteId = clienteIdDeSesion(
    (user.app_metadata ?? {}) as Record<string, unknown>
  );
  if (clienteId == null) {
    return NextResponse.json({ error: "Cuenta sin cliente." }, { status: 404 });
  }

  let body: { paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const prefijo = `${clienteId}/`;
  const paths = (body.paths ?? []).filter(
    (p) => typeof p === "string" && p.startsWith(prefijo)
  );
  if (paths.length === 0) return NextResponse.json({ ok: true });

  const admin = getSupabaseAdmin();
  await admin.storage.from(BUCKETS.encargos).remove(paths);
  return NextResponse.json({ ok: true });
}
