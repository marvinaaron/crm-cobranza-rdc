import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/supabase/roles";
import {
  guardarFotoPerfilCliente,
  hidratarFotosDesdeAuth,
  quitarFotoPerfilCliente,
  validarArchivoFoto,
} from "@/lib/supabase/cliente-foto";

/**
 * GET    /api/admin/clientes/foto?hidratar=1
 * POST   /api/admin/clientes/foto  multipart { clienteId, file }
 * DELETE /api/admin/clientes/foto?clienteId=
 *
 * La misma foto queda en el CRM y en el portal del cliente.
 */

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esAdmin(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  if (request.nextUrl.searchParams.get("hidratar") !== "1") {
    return NextResponse.json({ error: "Parámetro inválido." }, { status: 400 });
  }
  try {
    const fotos = await hidratarFotosDesdeAuth();
    return NextResponse.json({ ok: true, fotos });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudieron leer las fotos.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
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
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const clienteId = Number(formData.get("clienteId"));
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "Cliente inválido." }, { status: 400 });
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
    return NextResponse.json({
      ok: true,
      fotoPerfilUrl: out.fotoPerfilUrl,
      fotoPerfilPath: out.fotoPerfilPath,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo guardar la foto.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esAdmin(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const clienteId = Number(request.nextUrl.searchParams.get("clienteId"));
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "Cliente inválido." }, { status: 400 });
  }

  try {
    await quitarFotoPerfilCliente(clienteId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo quitar la foto.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
