import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esAdmin } from "@/lib/supabase/roles";
import { BUCKETS } from "@/lib/supabase/buckets";
import type { PerfilAdminUserMetadata } from "@/lib/admin/permisos";

/**
 * POST   /api/admin/perfil/foto  multipart/form-data { file }
 * DELETE /api/admin/perfil/foto  → quita el avatar actual
 *
 * Sube la foto al bucket `avatares` (público) y guarda el path en
 * `user_metadata.avatarPath` + la URL pública en `user_metadata.avatarUrl`.
 */

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MIMES_VALIDOS = new Set(["image/png", "image/jpeg", "image/webp"]);

function leerUserMeta(user: { user_metadata?: unknown }): PerfilAdminUserMetadata {
  const m = user.user_metadata as Record<string, unknown> | undefined;
  if (!m) return {};
  return m as PerfilAdminUserMetadata;
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esAdmin(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Formato inválido (esperado multipart/form-data)." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Sube un archivo." }, { status: 400 });
  }
  if (!MIMES_VALIDOS.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no válido. Usa PNG, JPG o WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen no debe pesar más de 5 MB." },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from(BUCKETS.avatares)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { data: pub } = admin.storage.from(BUCKETS.avatares).getPublicUrl(path);

  // Borra el anterior si existía
  const previo = leerUserMeta(user);
  if (previo.avatarPath && previo.avatarPath !== path) {
    await admin.storage.from(BUCKETS.avatares).remove([previo.avatarPath]);
  }

  const nuevoMeta: PerfilAdminUserMetadata = {
    ...previo,
    avatarPath: path,
    avatarUrl: pub.publicUrl,
  };
  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: nuevoMeta,
  });
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, avatarUrl: pub.publicUrl });
}

export async function DELETE() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esAdmin(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const previo = leerUserMeta(user);
  if (previo.avatarPath) {
    await admin.storage.from(BUCKETS.avatares).remove([previo.avatarPath]);
  }

  const nuevoMeta: PerfilAdminUserMetadata = {
    ...previo,
    avatarPath: undefined,
    avatarUrl: undefined,
  };
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: nuevoMeta,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
