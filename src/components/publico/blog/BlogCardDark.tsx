import Link from "next/link";
import type { BlogPostVista } from "@/lib/blog/posts";
import { formatearFecha } from "@/lib/blog/posts";

/**
 * Tarjeta de artículo (tema oscuro) para el grid del índice del blog.
 *
 * Estructura:
 *  - Bloque de color superior (h-32) con el emoji centrado (text-5xl)
 *    y un gradiente único por categoría.
 *  - Cuerpo: chip de categoría, título, resumen y pie con fecha + "Leer".
 *
 * Hover: borde índigo, sombra violeta difusa y micro-lift (translateY).
 */
export default function BlogCardDark({ post }: { post: BlogPostVista }) {
  const c = post.categoriaInfo.color;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col h-full rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-700/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-600/60 hover:shadow-xl hover:shadow-violet-900/30"
    >
      {/* Bloque de color con emoji */}
      <div
        className={`flex items-center justify-center h-32 bg-gradient-to-br ${c.bloque}`}
        aria-hidden="true"
      >
        <span className="text-5xl transition-transform duration-200 group-hover:scale-110">
          {post.emoji ?? "📝"}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-col flex-1 p-5">
        <span
          className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full text-xs font-semibold ${c.chipDark}`}
        >
          {post.categoriaInfo.label}
        </span>

        <h3 className="mt-3 font-semibold text-white leading-snug group-hover:text-indigo-200 transition-colors">
          {post.titulo}
        </h3>
        <p className="mt-2 text-sm text-white/60 leading-relaxed line-clamp-3">
          {post.resumen}
        </p>

        {/* Pie */}
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-white/40">
          <time dateTime={post.fecha}>{formatearFecha(post.fecha)}</time>
          <span className="inline-flex items-center gap-1 font-semibold text-white/70 group-hover:text-indigo-300 transition-colors">
            <span aria-hidden="true">→</span> Leer
          </span>
        </div>
      </div>
    </Link>
  );
}
