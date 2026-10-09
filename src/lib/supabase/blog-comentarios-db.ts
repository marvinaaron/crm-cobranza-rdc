import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  ComentarioBlog,
  EntradaComentario,
  EstadoComentario,
} from "@/lib/blog/comentarios";

/**
 * Persistencia de los comentarios del blog sobre la tabla key-value
 * `crm_estado` (misma usada por el resto del CRM). Todo el arreglo de
 * comentarios vive bajo la clave `blog_comentarios`. Pensado para volumen
 * bajo/medio de un blog; si algún día crece mucho, se migra a tabla propia.
 */

const CLAVE = "blog_comentarios";

async function leerTodos(): Promise<ComentarioBlog[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("crm_estado")
    .select("payload")
    .eq("clave", CLAVE)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const val = data?.payload;
  return Array.isArray(val) ? (val as ComentarioBlog[]) : [];
}

async function guardarTodos(lista: ComentarioBlog[]): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("crm_estado").upsert(
    {
      clave: CLAVE,
      payload: lista,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clave" }
  );
  if (error) throw new Error(error.message);
}

/** Comentarios publicados de un artículo, en orden cronológico (chat). */
export async function listarComentariosPublicados(
  slug: string
): Promise<ComentarioBlog[]> {
  const todos = await leerTodos();
  return todos
    .filter((c) => c.postSlug === slug && c.estado === "publicado")
    .sort((a, b) => (a.creado < b.creado ? -1 : 1));
}

/** Todos los comentarios (para el panel admin), más recientes primero. */
export async function listarTodosLosComentarios(): Promise<ComentarioBlog[]> {
  const todos = await leerTodos();
  return todos.sort((a, b) => (a.creado < b.creado ? 1 : -1));
}

/** Crea un comentario nuevo en estado `pendiente`. */
export async function crearComentario(
  input: EntradaComentario
): Promise<ComentarioBlog> {
  const nuevo: ComentarioBlog = {
    id: crypto.randomUUID(),
    postSlug: input.postSlug,
    nombre: input.nombre,
    ...(input.correo ? { correo: input.correo } : {}),
    pregunta: input.pregunta,
    estado: "pendiente",
    creado: new Date().toISOString(),
  };
  const todos = await leerTodos();
  todos.push(nuevo);
  await guardarTodos(todos);
  return nuevo;
}

/** Responde un comentario y lo publica. */
export async function responderComentario(
  id: string,
  respuesta: string
): Promise<ComentarioBlog | null> {
  const todos = await leerTodos();
  const idx = todos.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  todos[idx] = {
    ...todos[idx],
    respuesta,
    estado: "publicado",
    respondido: new Date().toISOString(),
  };
  await guardarTodos(todos);
  return todos[idx];
}

/** Cambia solo el estado (publicar/ocultar/volver a pendiente). */
export async function cambiarEstadoComentario(
  id: string,
  estado: EstadoComentario
): Promise<ComentarioBlog | null> {
  const todos = await leerTodos();
  const idx = todos.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  todos[idx] = { ...todos[idx], estado };
  await guardarTodos(todos);
  return todos[idx];
}

/** Elimina un comentario por id. */
export async function eliminarComentario(id: string): Promise<boolean> {
  const todos = await leerTodos();
  const next = todos.filter((c) => c.id !== id);
  if (next.length === todos.length) return false;
  await guardarTodos(next);
  return true;
}
