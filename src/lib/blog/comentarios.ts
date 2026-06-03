/**
 * Modelo de datos y validación de los comentarios (preguntas y respuestas)
 * del blog. Tipos puros, sin dependencias de servidor, para poder usarlos
 * tanto en API como en componentes cliente.
 *
 * Flujo: el visitante envía una pregunta → queda `pendiente` → el admin la
 * responde y se publica (`publicado`) → aparece en el artículo. El admin
 * puede ocultarla en cualquier momento.
 */

export type EstadoComentario = "pendiente" | "publicado" | "oculto";

export type ComentarioBlog = {
  id: string;
  postSlug: string;
  nombre: string;
  /** Correo opcional, solo para avisar al usuario. Nunca se expone público. */
  correo?: string;
  pregunta: string;
  respuesta?: string;
  estado: EstadoComentario;
  /** ISO de creación. */
  creado: string;
  /** ISO en que se respondió. */
  respondido?: string;
};

/** Versión segura para exponer al público (sin correo). */
export type ComentarioPublico = {
  id: string;
  nombre: string;
  pregunta: string;
  respuesta?: string;
  creado: string;
  respondido?: string;
};

export function aComentarioPublico(c: ComentarioBlog): ComentarioPublico {
  return {
    id: c.id,
    nombre: c.nombre,
    pregunta: c.pregunta,
    respuesta: c.respuesta,
    creado: c.creado,
    respondido: c.respondido,
  };
}

export const LIMITES = {
  nombreMin: 2,
  nombreMax: 60,
  correoMax: 120,
  preguntaMin: 5,
  preguntaMax: 600,
} as const;

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EntradaComentario = {
  postSlug: string;
  nombre: string;
  correo?: string;
  pregunta: string;
};

type Resultado =
  | { ok: true; data: EntradaComentario }
  | { ok: false; error: string };

/** Valida y normaliza la entrada de un comentario público. */
export function validarEntradaComentario(input: unknown): Resultado {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Datos inválidos." };
  }
  const raw = input as Record<string, unknown>;

  const postSlug = typeof raw.postSlug === "string" ? raw.postSlug.trim() : "";
  const nombre = typeof raw.nombre === "string" ? raw.nombre.trim() : "";
  const correoRaw = typeof raw.correo === "string" ? raw.correo.trim() : "";
  const pregunta = typeof raw.pregunta === "string" ? raw.pregunta.trim() : "";

  if (!postSlug) return { ok: false, error: "Falta el artículo." };

  if (nombre.length < LIMITES.nombreMin) {
    return { ok: false, error: "Escribe tu nombre." };
  }
  if (nombre.length > LIMITES.nombreMax) {
    return { ok: false, error: "El nombre es demasiado largo." };
  }

  if (pregunta.length < LIMITES.preguntaMin) {
    return { ok: false, error: "Tu pregunta es muy corta." };
  }
  if (pregunta.length > LIMITES.preguntaMax) {
    return {
      ok: false,
      error: `La pregunta no puede pasar de ${LIMITES.preguntaMax} caracteres.`,
    };
  }

  if (correoRaw) {
    if (correoRaw.length > LIMITES.correoMax || !RE_CORREO.test(correoRaw)) {
      return { ok: false, error: "El correo no parece válido." };
    }
  }

  return {
    ok: true,
    data: {
      postSlug,
      nombre,
      pregunta,
      ...(correoRaw ? { correo: correoRaw } : {}),
    },
  };
}
