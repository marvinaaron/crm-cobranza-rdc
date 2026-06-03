import Link from "next/link";
import type { BlogPostVista } from "@/lib/blog/posts";
import { formatearFecha } from "@/lib/blog/posts";

/**
 * Tarjeta de artículo para grids del blog (índice y relacionados).
 * El color (borde hover, pill, icono) se hereda del tema de la categoría
 * para que el grid se vea vivo y cromáticamente variado conforme crece.
 */
export default function BlogCard({ post }: { post: BlogPostVista }) {
  const c = post.categoriaInfo.color;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative flex flex-col h-full rounded-2xl bg-white ring-1 ring-slate-200 ${c.hoverRing} p-5 sm:p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60`}
    >
      {/* Cabecera: emoji de portada + pill de categoría */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <span
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl ${c.iconoFondo} transition-transform group-hover:scale-110`}
          aria-hidden="true"
        >
          {post.emoji ?? "📝"}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${c.pill} ${c.pillRing} ${c.texto}`}
        >
          {post.categoriaInfo.label}
        </span>
      </div>

      <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-marca-navy transition-colors">
        {post.titulo}
      </h3>
      <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
        {post.resumen}
      </p>

      {/* Pie: fecha + lectura + flecha */}
      <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <time dateTime={post.fecha}>{formatearFecha(post.fecha)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.lectura} min</span>
        </span>
        <span
          className="inline-flex items-center gap-1 font-bold text-slate-600 group-hover:text-marca-navy"
          aria-hidden="true"
        >
          Leer
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
