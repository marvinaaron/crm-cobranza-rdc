import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicShell from "@/components/publico/PublicShell";
import BlogContenido from "@/components/publico/blog/BlogContenido";
import BlogCard from "@/components/publico/blog/BlogCard";
import BlogComentarios from "@/components/publico/blog/BlogComentarios";
import BlogToolCard from "@/components/publico/blog/BlogToolCard";
import BlogReadingProgress from "@/components/publico/blog/BlogReadingProgress";
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
  // Foto real cuando el artículo lo firma el contador titular.
  const fotoAutor = post.autor === "Aaron Rosales" ? "/equipo/aaron.jpg" : null;

  return (
    <PublicShell>
      <JsonLd data={buildBlogPostJsonLd(post)} />
      <BlogReadingProgress />

      <article id="articulo-blog">
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

        {/* Cuerpo + sidebar */}
        <div className="py-10 sm:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:gap-14">
              {/* Columna principal */}
              <div className="min-w-0">
                {/* Portada ilustrativa del artículo */}
                {post.portada && (
                  <figure className="mb-10 -mt-2">
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-sm">
                      <Image
                        src={post.portada}
                        alt={post.portadaAlt ?? post.titulo}
                        fill
                        sizes="(max-width: 1024px) 100vw, 800px"
                        priority
                        className="object-cover"
                      />
                    </div>
                  </figure>
                )}

                <BlogContenido bloques={post.contenido} />

                {/* Gancho de herramienta — inline solo en mobile/tablet
                    (en desktop vive en el sidebar sticky). */}
                {post.herramienta && (
                  <div className="mt-10 lg:hidden">
                    <BlogToolCard herramienta={post.herramienta} />
                  </div>
                )}

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
                  {fotoAutor ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoAutor}
                      alt={post.autor}
                      className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <span
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-marca-navy text-white font-black text-lg shrink-0"
                      aria-hidden="true"
                    >
                      {post.autor.charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {post.autor}
                    </p>
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

                {/* Preguntas y respuestas (chat) */}
                <BlogComentarios slug={post.slug} />
              </div>

              {/* Sidebar sticky (solo desktop) */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-5">
                  {post.herramienta && (
                    <BlogToolCard herramienta={post.herramienta} compacto />
                  )}

                  {relacionados.length > 0 && (
                    <nav
                      className="rounded-2xl bg-white ring-1 ring-slate-200 p-5"
                      aria-label="Sigue leyendo"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-marca-navy mb-3">
                        Sigue leyendo
                      </p>
                      <ul className="space-y-1">
                        {relacionados.slice(0, 4).map((rel) => (
                          <li key={rel.slug}>
                            <Link
                              href={`/blog/${rel.slug}`}
                              className="group flex items-start gap-3 rounded-xl -mx-2 px-2 py-2 hover:bg-slate-50 transition-colors"
                            >
                              <span
                                className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg text-base ${rel.categoriaInfo.color.iconoFondo}`}
                                aria-hidden="true"
                              >
                                {rel.emoji ?? "📝"}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-marca-navy transition-colors">
                                  {rel.titulo}
                                </span>
                                <span
                                  className={`block text-[11px] font-semibold mt-0.5 ${rel.categoriaInfo.color.texto}`}
                                >
                                  {rel.categoriaInfo.label}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/blog"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-marca-navy hover:underline"
                      >
                        Ver todo el blog
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </Link>
                    </nav>
                  )}
                </div>
              </aside>
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
