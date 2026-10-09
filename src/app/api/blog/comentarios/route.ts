import { NextResponse, type NextRequest } from "next/server";
import { getPosts } from "@/lib/blog/posts";
import {
  aComentarioPublico,
  validarEntradaComentario,
} from "@/lib/blog/comentarios";
import {
  crearComentario,
  listarComentariosPublicados,
} from "@/lib/supabase/blog-comentarios-db";
import { enviarPushATodosLosAdmins } from "@/lib/push/server";

export const dynamic = "force-dynamic";

/** GET ?slug=... → comentarios publicados de un artículo (público). */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ comentarios: [] });
  }
  try {
    const lista = await listarComentariosPublicados(slug);
    return NextResponse.json({ comentarios: lista.map(aComentarioPublico) });
  } catch {
    // Nunca rompemos el render del artículo por un fallo de comentarios.
    return NextResponse.json({ comentarios: [] });
  }
}

/** POST → crea una pregunta (queda pendiente de moderación). */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  // Honeypot anti-spam: si el campo oculto viene lleno, lo descartamos
  // en silencio (un bot lo rellena; un humano no lo ve).
  if (
    body &&
    typeof body === "object" &&
    typeof (body as Record<string, unknown>).web === "string" &&
    (body as Record<string, unknown>).web !== ""
  ) {
    return NextResponse.json({ ok: true });
  }

  const v = validarEntradaComentario(body);
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 });
  }

  const existe = getPosts().some((p) => p.slug === v.data.postSlug);
  if (!existe) {
    return NextResponse.json(
      { error: "Artículo no encontrado." },
      { status: 404 }
    );
  }

  try {
    const creado = await crearComentario(v.data);
    void enviarPushATodosLosAdmins({
      title: "💬 Nueva pregunta en el blog",
      body: `${creado.nombre}: ${creado.pregunta.slice(0, 90)}`,
      url: "/blog-comentarios",
      tag: "blog-comentario",
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No pudimos guardar tu pregunta. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
