import Image from "next/image";
import Link from "next/link";
import type { BlogPostVista, CategoriaId } from "@/lib/blog/posts";
import { formatearFecha } from "@/lib/blog/posts";
import RdcBlogWordmark from "./RdcBlogWordmark";

/**
 * Tarjeta de artículo para grids del blog (índice y relacionados).
 *
 * Portada estilo "banner" 50/50:
 *  - Izquierda: panel navy de marca (RDCBlog) con la categoría y el título
 *    en grande (estilo editorial tipo ContaBlog, pero con texto nítido y
 *    nuestra paleta). El título vive aquí como heading semántico (h3).
 *  - Derecha: la ilustración del artículo (o, si no hay, un bloque con el
 *    emoji y el gradiente claro de la categoría).
 *  - Cuerpo: resumen + pie con fecha y "Leer".
 *
 * Hover: micro-lift (translateY) + sombra más marcada y borde de la categoría.
 */

/** Acento claro por categoría para el panel navy (legible sobre fondo oscuro). */
const ACENTO: Record<CategoriaId, { texto: string; barra: string }> = {
  guias: { texto: "text-indigo-300", barra: "bg-indigo-400" },
  sat: { texto: "text-emerald-300", barra: "bg-emerald-400" },
  impuestos: { texto: "text-amber-300", barra: "bg-amber-400" },
  nomina: { texto: "text-sky-300", barra: "bg-sky-400" },
  pymes: { texto: "text-violet-300", barra: "bg-violet-400" },
};

export default function BlogCard({ post }: { post: BlogPostVista }) {
  const c = post.categoriaInfo.color;
  const acento = ACENTO[post.categoria] ?? ACENTO.guias;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col h-full rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200 shadow-sm ${c.hoverRing} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70`}
    >
      {/* Portada banner: 50% panel de texto navy + 50% ilustración */}
      <div className="grid grid-cols-2 h-44">
        {/* Izquierda: panel navy con marca, categoría y título */}
        <div className="relative flex flex-col justify-between p-4 overflow-hidden bg-[radial-gradient(circle_at_20%_15%,#1e3a5f_0%,#0f1d2e_50%,#0a1424_100%)]">
          {/* Patrón de puntos sutil (mismo estilo de marca) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.6) 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Marca */}
          <RdcBlogWordmark
            logoEm={1.4}
            blogClassName={acento.texto}
            className="relative text-[10px] font-black tracking-[0.18em] text-white"
          />

          {/* Categoría + título */}
          <div className="relative">
            <span
              className={`block text-[8px] font-black uppercase tracking-[0.18em] ${acento.texto} mb-1`}
            >
              {post.categoriaInfo.label}
            </span>
            <h3 className="text-white font-black leading-[1.14] text-sm sm:text-[15px] line-clamp-4">
              {post.titulo}
            </h3>
          </div>

          {/* Barra de acento */}
          <div
            className={`relative h-1 w-10 rounded-full ${acento.barra}`}
            aria-hidden="true"
          />
        </div>

        {/* Derecha: ilustración (o emoji si no hay portada) */}
        {post.portada ? (
          <div className="relative overflow-hidden">
            <Image
              src={post.portada}
              alt={post.portadaAlt ?? post.titulo}
              fill
              sizes="(max-width: 768px) 50vw, 17vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          </div>
        ) : (
          <div
            className={`flex items-center justify-center bg-gradient-to-br ${c.bloque}`}
            aria-hidden="true"
          >
            <span className="text-5xl transition-transform duration-200 group-hover:scale-110">
              {post.emoji ?? "📝"}
            </span>
          </div>
        )}
      </div>

      {/* Cuerpo (el título ahora vive en el banner, no se repite aquí) */}
      <div className="flex flex-col flex-1 p-5">
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
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
