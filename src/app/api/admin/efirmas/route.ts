import { NextResponse, type NextRequest } from "next/server";
import { requireModulo } from "@/lib/supabase/require-modulo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";
import { parsearCertificadoCer } from "@/lib/efirma/parser";
import { listarEfirmas, rowToRegistro } from "@/lib/efirma/db";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;

function extensionNombre(nombre: string): string {
  const i = nombre.lastIndexOf(".");
  return i >= 0 ? nombre.slice(i).toLowerCase() : "";
}

/** GET — lista todos los registros de e.firma */
export async function GET() {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  try {
    const lista = await listarEfirmas();
    return NextResponse.json({ ok: true, registros: lista });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al listar." },
      { status: 500 }
    );
  }
}

/** POST — sube .cer (+ .key opcional) y registra vigencia */
export async function POST(request: NextRequest) {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const clienteId = Number(formData.get("clienteId"));
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const cerFile = formData.get("cer");
  if (!(cerFile instanceof File)) {
    return NextResponse.json({ error: "Sube el archivo .cer" }, { status: 400 });
  }
  const extCer = extensionNombre(cerFile.name);
  if (extCer !== ".cer") {
    return NextResponse.json({ error: "El certificado debe ser .cer" }, { status: 400 });
  }
  if (cerFile.size > MAX_BYTES) {
    return NextResponse.json({ error: "El .cer no debe superar 2 MB." }, { status: 400 });
  }

  const keyFile = formData.get("key");
  if (keyFile != null && keyFile !== "" && !(keyFile instanceof File)) {
    return NextResponse.json({ error: "Archivo .key inválido." }, { status: 400 });
  }
  if (keyFile instanceof File) {
    const extKey = extensionNombre(keyFile.name);
    if (extKey !== ".key" && extKey !== ".pem") {
      return NextResponse.json({ error: "La llave debe ser .key" }, { status: 400 });
    }
    if (keyFile.size > MAX_BYTES) {
      return NextResponse.json({ error: "El .key no debe superar 2 MB." }, { status: 400 });
    }
  }

  let parsed;
  try {
    const cerBuf = Buffer.from(await cerFile.arrayBuffer());
    parsed = parsearCertificadoCer(cerBuf);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Certificado inválido." },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  const ts = Date.now();
  const cerPath = `${clienteId}/${ts}.cer`;
  const cerBuffer = Buffer.from(await cerFile.arrayBuffer());

  const { error: upCer } = await admin.storage
    .from(BUCKETS.efirmas)
    .upload(cerPath, cerBuffer, {
      contentType: "application/x-x509-ca-cert",
      upsert: true,
    });
  if (upCer) {
    return NextResponse.json({ error: upCer.message }, { status: 500 });
  }

  let keyPath: string | null = null;
  if (keyFile instanceof File) {
    keyPath = `${clienteId}/${ts}.key`;
    const keyBuffer = Buffer.from(await keyFile.arrayBuffer());
    const { error: upKey } = await admin.storage
      .from(BUCKETS.efirmas)
      .upload(keyPath, keyBuffer, {
        contentType: "application/octet-stream",
        upsert: true,
      });
    if (upKey) {
      await admin.storage.from(BUCKETS.efirmas).remove([cerPath]);
      return NextResponse.json({ error: upKey.message }, { status: 500 });
    }
  }

  const { data: previo } = await admin
    .from("cliente_efirma")
    .select("cer_path, key_path")
    .eq("cliente_id", clienteId)
    .maybeSingle();

  const payload = {
    cliente_id: clienteId,
    titular: parsed.titular,
    rfc_certificado: parsed.rfcCertificado,
    vigencia_inicio: parsed.vigenciaInicio.toISOString(),
    vigencia_fin: parsed.vigenciaFin.toISOString(),
    cer_path: cerPath,
    key_path: keyPath,
    notificado_30: false,
    notificado_15: false,
    notificado_7: false,
    notificado_3: false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from("cliente_efirma")
    .upsert(payload, { onConflict: "cliente_id" })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (previo) {
    const borrar = [previo.cer_path, previo.key_path].filter(Boolean) as string[];
    if (borrar.length) await admin.storage.from(BUCKETS.efirmas).remove(borrar);
  }

  return NextResponse.json({
    ok: true,
    registro: rowToRegistro(data),
  });
}

/** PATCH — sube solo .key cuando ya existe certificado */
export async function PATCH(request: NextRequest) {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const clienteId = Number(formData.get("clienteId"));
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const keyFile = formData.get("key");
  if (!(keyFile instanceof File)) {
    return NextResponse.json({ error: "Sube el archivo .key" }, { status: 400 });
  }
  const extKey = extensionNombre(keyFile.name);
  if (extKey !== ".key" && extKey !== ".pem") {
    return NextResponse.json({ error: "La llave debe ser .key" }, { status: 400 });
  }
  if (keyFile.size > MAX_BYTES) {
    return NextResponse.json({ error: "El .key no debe superar 2 MB." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: previo, error: readErr } = await admin
    .from("cliente_efirma")
    .select("*")
    .eq("cliente_id", clienteId)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }
  if (!previo) {
    return NextResponse.json(
      { error: "Primero sube el certificado .cer de este cliente." },
      { status: 400 }
    );
  }

  const ts = Date.now();
  const keyPath = `${clienteId}/${ts}.key`;
  const keyBuffer = Buffer.from(await keyFile.arrayBuffer());
  const { error: upKey } = await admin.storage
    .from(BUCKETS.efirmas)
    .upload(keyPath, keyBuffer, {
      contentType: "application/octet-stream",
      upsert: true,
    });
  if (upKey) {
    return NextResponse.json({ error: upKey.message }, { status: 500 });
  }

  const { data, error } = await admin
    .from("cliente_efirma")
    .update({
      key_path: keyPath,
      updated_at: new Date().toISOString(),
    })
    .eq("cliente_id", clienteId)
    .select("*")
    .single();

  if (error) {
    await admin.storage.from(BUCKETS.efirmas).remove([keyPath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (previo.key_path) {
    await admin.storage.from(BUCKETS.efirmas).remove([previo.key_path as string]);
  }

  return NextResponse.json({
    ok: true,
    registro: rowToRegistro(data),
  });
}

/** DELETE — elimina e.firma de un cliente ?clienteId= */
export async function DELETE(request: NextRequest) {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  const clienteId = Number(request.nextUrl.searchParams.get("clienteId"));
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: row } = await admin
    .from("cliente_efirma")
    .select("cer_path, key_path")
    .eq("cliente_id", clienteId)
    .maybeSingle();

  if (row) {
    const paths = [row.cer_path, row.key_path].filter(Boolean) as string[];
    if (paths.length) await admin.storage.from(BUCKETS.efirmas).remove(paths);
    await admin.from("cliente_efirma").delete().eq("cliente_id", clienteId);
  }

  return NextResponse.json({ ok: true });
}
