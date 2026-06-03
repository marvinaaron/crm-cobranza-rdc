import Link from "next/link";
import type { BlogPostVista } from "@/lib/blog/posts";
import { formatearFecha } from "@/lib/blog/posts";

/**
 * Tarjeta de artículo para grids del blog (índice y relacionados).
 *
 * Card blanca con sombra sutil:
 *  - Bloque de color superior (h-32) con el emoji centrado (text-5xl) y un
 *    gradiente claro propio de la categoría → identidad visual sin saturar.
 *  - Cuerpo: chip de categoría, título, resumen y pie con fecha + "Leer".
 *
 * Hover: micro-lift (translateY) + sombra más marcada y borde de la categoría.
 */
export default function BlogCard({ post }: { post: BlogPostVista }) {
  const c = post.categoriaInfo.color;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col h-full rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200 shadow-sm ${c.hoverRing} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70`}
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
          className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${c.pill} ${c.pillRing} ${c.texto}`}
        >
          {post.categoriaInfo.label}
        </span>

        <h3 className="mt-3 font-black text-slate-900 leading-snug group-hover:text-marca-navy transition-colors">
          {post.titulo}
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
          {post.resumen}
        </p>

        {/* Pie */}
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400">
          <time dateTime={post.fecha}>{formatearFecha(post.fecha)}</time>
          <span className="inline-flex items-center gap-1 font-bold text-slate-600 group-hover:text-marca-navy transition-colors">
            <span aria-hidden="true">→</span> Leer
          </span>
        </div>
      </div>
    </Link>
  );
}
