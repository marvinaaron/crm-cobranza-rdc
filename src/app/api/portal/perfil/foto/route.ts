import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { esCliente } from "@/lib/supabase/roles";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import {
  guardarFotoPerfilCliente,
  quitarFotoPerfilCliente,
  validarArchivoFoto,
} from "@/lib/supabase/cliente-foto";

/**
 * POST   /api/portal/perfil/foto  multipart/form-data { file }
 * DELETE /api/portal/perfil/foto
 *
 * La foto vive en el cliente del CRM y se refleja en el portal y en Mis clientes.
 */

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esCliente(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const clienteId = clienteIdDesdeUsuarioPortal(user);
  if (clienteId == null) {
    return NextResponse.json({ error: "Cuenta sin cliente." }, { status: 400 });
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
  const invalid = validarArchivoFoto(file);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const out = await guardarFotoPerfilCliente({
      clienteId,
      buffer,
      contentType: file.type || "image/jpeg",
    });
    return NextResponse.json({ ok: true, avatarUrl: out.fotoPerfilUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo guardar la foto.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esCliente(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const clienteId = clienteIdDesdeUsuarioPortal(user);
  if (clienteId == null) {
    return NextResponse.json({ error: "Cuenta sin cliente." }, { status: 400 });
  }

  try {
    await quitarFotoPerfilCliente(clienteId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo quitar la foto.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
