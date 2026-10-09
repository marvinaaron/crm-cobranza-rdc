"use client";

import { useEffect, useState } from "react";
import { LIMITES, type ComentarioPublico } from "@/lib/blog/comentarios";

/**
 * Sección de "Preguntas y respuestas" estilo chat al pie de cada artículo.
 *
 * - Carga las preguntas ya respondidas/publicadas del artículo.
 * - Permite enviar una pregunta nueva (queda pendiente de moderación).
 * - Las respuestas las da el despacho desde el CRM; aquí solo se muestran.
 */

const AVATAR_AUTOR = "/equipo/aaron.jpg";

function tiempoRelativo(iso: string): string {
  const fecha = new Date(iso);
  const diffMs = Date.now() - fecha.getTime();
  const dias = Math.floor(diffMs / 86_400_000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  return fecha.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function BlogComentarios({ slug }: { slug: string }) {
  const [comentarios, setComentarios] = useState<ComentarioPublico[]>([]);
  const [cargando, setCargando] = useState(true);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [pregunta, setPregunta] = useState("");
  const [web, setWeb] = useState(""); // honeypot
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    fetch(`/api/blog/comentarios?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (activo && Array.isArray(d?.comentarios)) {
          setComentarios(d.comentarios as ComentarioPublico[]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [slug]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (nombre.trim().length < LIMITES.nombreMin) {
      setError("Escribe tu nombre.");
      return;
    }
    if (pregunta.trim().length < LIMITES.preguntaMin) {
      setError("Tu pregunta es muy corta.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/blog/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug: slug,
          nombre: nombre.trim(),
          correo: correo.trim(),
          pregunta: pregunta.trim(),
          web,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "No pudimos enviar tu pregunta.");
        return;
      }
      setEnviado(true);
      setNombre("");
      setCorreo("");
      setPregunta("");
    } catch {
      setError("Hubo un problema de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="mt-12 pt-10 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl" aria-hidden="true">
          💬
        </span>
        <h2 className="text-xl font-black text-slate-900">
          Preguntas y respuestas
        </h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        ¿Te quedó una duda? Pregúntanos aquí y te respondemos. Las preguntas se
        publican una vez que las contestamos.
      </p>

      {/* Hilo de conversación */}
      <div className="space-y-6">
        {cargando ? (
          <p className="text-sm text-slate-400">Cargando preguntas…</p>
        ) : comentarios.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-500">
              Todavía no hay preguntas. <span className="font-semibold text-slate-700">¡Sé el primero!</span>
            </p>
          </div>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="space-y-3">
              {/* Pregunta del visitante */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                  {iniciales(c.nombre) || "?"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {c.nombre}
                    </span>
                    <span className="text-xs text-slate-400">
                      {tiempoRelativo(c.creado)}
                    </span>
                  </div>
                  <div className="mt-1 inline-block rounded-2xl rounded-tl-sm bg-slate-100 text-slate-700 text-sm leading-relaxed px-4 py-2.5">
                    {c.pregunta}
                  </div>
                </div>
              </div>

              {/* Respuesta del despacho */}
              {c.respuesta && (
                <div className="flex items-start gap-3 pl-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={AVATAR_AUTOR}
                    alt="RDC Contadores"
                    className="shrink-0 w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-indigo-700">
                        RDC Contadores
                      </span>
                      <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5">
                        Equipo
                      </span>
                      {c.respondido && (
                        <span className="text-xs text-slate-400">
                          {tiempoRelativo(c.respondido)}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 inline-block rounded-2xl rounded-tl-sm bg-indigo-50 border border-indigo-100 text-slate-700 text-sm leading-relaxed px-4 py-2.5">
                      {c.respuesta}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Formulario para preguntar */}
      <div className="mt-8 rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        {enviado ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">🙌</p>
            <p className="font-bold text-slate-900">¡Recibimos tu pregunta!</p>
            <p className="text-sm text-slate-500 mt-1">
              La revisaremos y la publicaremos aquí con nuestra respuesta.
            </p>
            <button
              type="button"
              onClick={() => setEnviado(false)}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
            >
              Hacer otra pregunta
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-3">
            <p className="text-sm font-bold text-slate-900">
              Deja tu pregunta
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre *"
                maxLength={LIMITES.nombreMax}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
              />
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Correo (opcional)"
                maxLength={LIMITES.correoMax}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
              />
            </div>
            <textarea
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="Escribe tu pregunta…"
              rows={3}
              maxLength={LIMITES.preguntaMax}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
            />

            {/* Honeypot: invisible para humanos. */}
            <input
              type="text"
              value={web}
              onChange={(e) => setWeb(e.target.value)}
              name="web"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {error && (
              <p className="text-sm font-medium text-rose-600">{error}</p>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Tu correo no se publica. Solo lo usamos para avisarte.
              </p>
              <button
                type="submit"
                disabled={enviando}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold px-5 py-2.5 hover:opacity-90 transition-all disabled:opacity-60"
              >
                {enviando ? "Enviando…" : "Enviar pregunta"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
