import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicShell from "@/components/publico/PublicShell";
import BlogContenido from "@/components/publico/blog/BlogContenido";
import BlogCard from "@/components/publico/blog/BlogCard";
import {
  POSTS,
  formatearFecha,
  getPost,
  getPostsRelacionados,
} from "@/lib/blog/posts";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildBlogPostJsonLd, buildBlogPostMetadata } from "@/lib/seo/blog";

type Params = { slug: string };

/** Pre-genera una ruta estática por cada post. */
export function generateStaticParams(): Params[] {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return { title: "Artículo no encontrado · RDC Contadores" };
  }
  return buildBlogPostMetadata(post);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const relacionados = getPostsRelacionados(slug);
  const c = post.categoriaInfo.color;

  return (
    <PublicShell>
      <JsonLd data={buildBlogPostJsonLd(post)} />

      <article>
        {/* Cabecera del artículo */}
        <header className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 pt-10 pb-8 sm:pt-14 sm:pb-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-marca-navy/10 to-violet-200/30 blur-3xl"
          />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="text-xs text-slate-500 mb-5" aria-label="Ruta">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-slate-900">
                    Inicio
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/blog" className="hover:text-slate-900">
                    Blog
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-slate-700 font-medium truncate max-w-[12rem]">
                  {post.titulo}
                </li>
              </ol>
            </nav>

            <Link
              href="/blog"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${c.pill} ${c.pillRing} ${c.texto} hover:opacity-80 transition-opacity`}
            >
              <span aria-hidden="true">{post.emoji ?? "📝"}</span>
              {post.categoriaInfo.label}
            </Link>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-slate-900 leading-tight">
              {post.titulo}
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              {post.resumen}
            </p>

            {/* Meta: autor + fecha + lectura */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="font-bold text-slate-700">{post.autor}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.fecha}>{formatearFecha(post.fecha)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.lectura} min de lectura</span>
            </div>
            {post.actualizado && post.actualizado !== post.fecha && (
              <p className="mt-1 text-xs text-slate-400">
                Actualizado el {formatearFecha(post.actualizado)}
              </p>
            )}
          </div>
        </header>

        {/* Cuerpo */}
        <div className="py-10 sm:py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <BlogContenido bloques={post.contenido} />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Firma del autor */}
            <div className="mt-8 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5 flex items-center gap-4">
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-marca-navy text-white font-black text-lg shrink-0"
                aria-hidden="true"
              >
                {post.autor.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-black text-slate-900">{post.autor}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Equipo de RDC Contadores · Despacho contable y fiscal
                </p>
              </div>
              <Link
                href="/contacto"
                className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-marca-navy text-white text-xs font-bold hover:bg-marca-navy-deep transition-colors"
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <section className="pb-16 sm:pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Sigue leyendo
                </h2>
                <Link
                  href="/blog"
                  className="text-sm font-bold text-marca-navy hover:underline"
                >
                  Ver todo el blog
                </Link>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {relacionados.map((rel) => (
                  <li key={rel.slug}>
                    <BlogCard post={rel} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </article>
    </PublicShell>
  );
}
