import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import type { EstadoComentario } from "@/lib/blog/comentarios";
import {
  cambiarEstadoComentario,
  eliminarComentario,
  listarTodosLosComentarios,
  responderComentario,
} from "@/lib/supabase/blog-comentarios-db";

export const dynamic = "force-dynamic";

const ESTADOS: EstadoComentario[] = ["pendiente", "publicado", "oculto"];

/** GET → todos los comentarios (moderación). */
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const comentarios = await listarTodosLosComentarios();
  return NextResponse.json({ comentarios });
}

/** POST { accion, id, ... } → responder / cambiar estado / eliminar. */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const accion = typeof body?.accion === "string" ? body.accion : "";
  const id = typeof body?.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ error: "Falta el id." }, { status: 400 });
  }

  if (accion === "responder") {
    const respuesta =
      typeof body?.respuesta === "string" ? body.respuesta.trim() : "";
    if (!respuesta) {
      return NextResponse.json(
        { error: "Escribe una respuesta." },
        { status: 400 }
      );
    }
    const comentario = await responderComentario(id, respuesta.slice(0, 2000));
    return NextResponse.json({ ok: !!comentario, comentario });
  }

  if (accion === "estado") {
    const estado = body?.estado as EstadoComentario;
    if (!ESTADOS.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }
    const comentario = await cambiarEstadoComentario(id, estado);
    return NextResponse.json({ ok: !!comentario, comentario });
  }

  if (accion === "eliminar") {
    const ok = await eliminarComentario(id);
    return NextResponse.json({ ok });
  }

  return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
}
