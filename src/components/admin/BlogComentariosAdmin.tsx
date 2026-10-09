"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComentarioBlog, EstadoComentario } from "@/lib/blog/comentarios";

/**
 * Panel de moderación de las preguntas del blog.
 *  - Lista todas las preguntas (pendientes / publicadas / ocultas).
 *  - Permite responder y publicar, ocultar/publicar y eliminar.
 */

type Filtro = "todos" | EstadoComentario;

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "pendiente", label: "Pendientes" },
  { id: "publicado", label: "Publicados" },
  { id: "oculto", label: "Ocultos" },
];

const ESTADO_BADGE: Record<EstadoComentario, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  publicado: "bg-emerald-100 text-emerald-700",
  oculto: "bg-slate-200 text-slate-600",
};

function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BlogComentariosAdmin() {
  const [comentarios, setComentarios] = useState<ComentarioBlog[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("pendiente");
  const [borradores, setBorradores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/blog-comentarios");
      const data = await res.json();
      if (Array.isArray(data?.comentarios)) {
        setComentarios(data.comentarios as ComentarioBlog[]);
      }
    } catch {
      setError("No pudimos cargar los comentarios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  const conteos = useMemo(() => {
    const c = { todos: comentarios.length, pendiente: 0, publicado: 0, oculto: 0 };
    for (const x of comentarios) c[x.estado] += 1;
    return c;
  }, [comentarios]);

  const visibles = useMemo(
    () =>
      filtro === "todos"
        ? comentarios
        : comentarios.filter((c) => c.estado === filtro),
    [comentarios, filtro]
  );

  async function accion(payload: Record<string, unknown>) {
    setError(null);
    setOcupado(String(payload.id));
    try {
      const res = await fetch("/api/admin/blog-comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        setError(data?.error ?? "No se pudo completar la acción.");
        return;
      }
      await cargar();
    } catch {
      setError("Error de conexión.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Comentarios del blog
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Responde las preguntas de los lectores. Al responder, la pregunta se
          publica automáticamente en el artículo.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filtro === f.id
                ? "bg-violet-600 text-white"
                : "bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-white/10 hover:bg-slate-50"
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">
              {f.id === "todos" ? conteos.todos : conteos[f.id]}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 text-sm font-medium text-rose-600">{error}</p>
      )}

      {cargando ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : visibles.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-slate-200 dark:ring-white/10 p-8 text-center">
          <p className="text-sm text-slate-500">No hay comentarios aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibles.map((c) => {
            const draft = borradores[c.id] ?? c.respuesta ?? "";
            const busy = ocupado === c.id;
            return (
              <article
                key={c.id}
                className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-slate-200 dark:ring-white/10 p-5"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {c.nombre}
                    </span>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ESTADO_BADGE[c.estado]}`}
                    >
                      {c.estado}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {fechaCorta(c.creado)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-xs text-slate-400">
                  <a
                    href={`/blog/${c.postSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    /blog/{c.postSlug}
                  </a>
                  {c.correo && (
                    <a
                      href={`mailto:${c.correo}`}
                      className="text-slate-500 hover:underline"
                    >
                      {c.correo}
                    </a>
                  )}
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-white/5 rounded-xl px-3.5 py-2.5">
                  {c.pregunta}
                </p>

                <textarea
                  value={draft}
                  onChange={(e) =>
                    setBorradores((b) => ({ ...b, [c.id]: e.target.value }))
                  }
                  placeholder="Escribe una respuesta breve…"
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || !draft.trim()}
                    onClick={() =>
                      accion({ accion: "responder", id: c.id, respuesta: draft })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold px-4 py-2 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {busy ? "Guardando…" : "Responder y publicar"}
                  </button>

                  {c.estado === "publicado" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        accion({ accion: "estado", id: c.id, estado: "oculto" })
                      }
                      className="rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-sm font-semibold px-3.5 py-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Ocultar
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        accion({
                          accion: "estado",
                          id: c.id,
                          estado: "publicado",
                        })
                      }
                      className="rounded-lg bg-emerald-100 text-emerald-700 text-sm font-semibold px-3.5 py-2 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                    >
                      Publicar
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Eliminar esta pregunta? No se puede deshacer."
                        )
                      ) {
                        void accion({ accion: "eliminar", id: c.id });
                      }
                    }}
                    className="ml-auto rounded-lg text-rose-600 text-sm font-semibold px-3 py-2 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
