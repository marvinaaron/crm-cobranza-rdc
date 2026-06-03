"use client";

import { useMemo, useState } from "react";
import type { BlogPostVista, CategoriaBlog, CategoriaId } from "@/lib/blog/posts";
import BlogCard from "./BlogCard";

/**
 * Grid del índice del blog con filtro por categoría (client).
 *
 * El filtro solo aparece cuando hay categorías con posts, y crece solo
 * conforme se publican artículos de nuevas categorías. Pensado para que
 * el blog se sienta "lleno" y navegable incluso con pocos posts.
 */
export default function BlogIndice({
  posts,
  categorias,
}: {
  posts: BlogPostVista[];
  categorias: CategoriaBlog[];
}) {
  const [filtro, setFiltro] = useState<CategoriaId | "todas">("todas");

  const visibles = useMemo(
    () =>
      filtro === "todas"
        ? posts
        : posts.filter((p) => p.categoria === filtro),
    [filtro, posts]
  );

  return (
    <div>
      {/* Filtros por categoría — solo si hay más de una categoría usada */}
      {categorias.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <FiltroPill
            activo={filtro === "todas"}
            onClick={() => setFiltro("todas")}
            label="Todos"
          />
          {categorias.map((cat) => (
            <FiltroPill
              key={cat.id}
              activo={filtro === cat.id}
              onClick={() => setFiltro(cat.id)}
              label={cat.label}
            />
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <p className="text-center text-slate-500 py-16">
          Pronto publicaremos artículos en esta categoría. 🙌
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visibles.map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FiltroPill({
  activo,
  onClick,
  label,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
        activo
          ? "bg-marca-navy text-white shadow-sm shadow-marca-navy/20"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-marca-navy/30 hover:text-marca-navy"
      }`}
    >
      {label}
    </button>
  );
}
