import { Suspense } from "react";
import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import BlogIndice from "@/components/publico/blog/BlogIndice";
import BlogHeroChips from "@/components/publico/blog/BlogHeroChips";
import {
  CATEGORIAS,
  formatearFecha,
  getCategoriasConPosts,
  getPostDestacado,
  getPosts,
} from "@/lib/blog/posts";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildBlogIndexJsonLd } from "@/lib/seo/blog";
import { buildSiteNavigationSchema } from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Blog fiscal — guías, SAT e impuestos explicados fácil",
  description:
    "Guías fiscales, trámites del SAT, impuestos y tips para PyMEs explicados sin tecnicismos por el equipo de RDC Contadores.",
  path: "/blog",
  keywords: [
    "blog fiscal",
    "guías SAT",
    "impuestos México",
    "RESICO",
    "RFC",
    "calendario fiscal",
    "contabilidad PyMEs",
  ],
});

export default function BlogPage() {
  const posts = getPosts();
  const destacado = getPostDestacado();
  const categorias = getCategoriasConPosts();

  return (
    <PublicShell>
      <JsonLd data={[...buildBlogIndexJsonLd(), ...buildSiteNavigationSchema()]} />

      {/* HERO navy — mismo peso visual que la home */}
      <section className="relative overflow-hidden bg-marca-navy">
        {/* Glows decorativos violeta/índigo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-0 w-[32rem] h-[32rem] rounded-full bg-violet-600/20 blur-3xl translate-x-1/4"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-20 w-[26rem] h-[26rem] rounded-full bg-indigo-600/15 blur-3xl"
        />
        {/* Patrón de puntos sutil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb ARRIBA del hero, texto white/50 */}
          <nav
            className="pt-6 text-xs text-white/50"
            aria-label="Ruta de navegación"
          >
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white/80 font-medium">Blog</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-center py-20 md:py-32">
            {/* Columna izquierda: copy */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Blog de RDC Contadores
              </span>

              <h1 className="mt-5 text-5xl md:text-7xl font-black tracking-tight leading-[1.02]">
                <span className="text-white">Fiscal sin enredos,</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_24px_rgba(139,92,246,0.35)]">
                  explicado fácil
                </span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-white/70 leading-relaxed max-w-xl">
                Guías sobre SAT, impuestos, nómina y negocios. Escritas por
                contadores, pensadas para que tú las entiendas.
              </p>

              {/* Chips de categoría (clicables, filtran el listado) */}
              <Suspense fallback={<div className="mt-8 h-10" />}>
                <BlogHeroChips />
              </Suspense>
            </div>

            {/* Columna derecha: decorativo (desktop) */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Glow violeta difuso detrás del ícono */}
              <div
                aria-hidden="true"
                className="absolute w-72 h-72 rounded-full bg-violet-500/30 blur-3xl"
              />
              {/* Ícono grande tipo documento/artículo */}
              <div className="relative">
                <svg
                  width="240"
                  height="240"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#blogGrad)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_8px_40px_rgba(139,92,246,0.45)]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="blogGrad" x1="0" y1="0" x2="24" y2="24">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="50%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="14" y2="17" />
                  <line x1="8" y1="9" x2="10" y2="9" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="articulos" className="py-12 sm:py-16 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Post destacado en formato banner ancho */}
          {destacado && (
            <Link
              href={`/blog/${destacado.slug}`}
              className="group relative block rounded-3xl overflow-hidden bg-[radial-gradient(circle_at_15%_15%,#1e3a5f_0%,#0f1d2e_45%,#0a1424_100%)] ring-1 ring-marca-navy/40 p-7 sm:p-10 mb-12 shadow-xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-sky-400/15 blur-3xl"
              />
              <div className="relative max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 ring-1 ring-white/20 text-[10px] font-black uppercase tracking-widest text-white">
                  <span aria-hidden="true">{destacado.emoji ?? "✨"}</span>
                  Destacado · {destacado.categoriaInfo.label}
                </span>
                <h2 className="mt-4 text-2xl sm:text-4xl font-black text-white leading-tight">
                  {destacado.titulo}
                </h2>
                <p className="mt-3 text-white/80 leading-relaxed sm:text-lg">
                  {destacado.resumen}
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm text-white/70">
                  <time dateTime={destacado.fecha}>
                    {formatearFecha(destacado.fecha)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>{destacado.lectura} min de lectura</span>
                  <span
                    className="inline-flex items-center gap-1 font-bold text-white ml-1 group-hover:gap-2 transition-all"
                    aria-hidden="true"
                  >
                    Leer
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">✍️</p>
              <p className="text-lg font-bold text-slate-700">
                Estamos preparando los primeros artículos.
              </p>
              <p className="text-slate-500 mt-1">
                Muy pronto encontrarás aquí guías fiscales útiles.
              </p>
            </div>
          ) : (
            <Suspense fallback={<div className="min-h-[20rem]" />}>
              <BlogIndice posts={posts} categorias={categorias} />
            </Suspense>
          )}
        </div>
      </section>

      {/* Categorías como cierre editorial (ayuda a SEO y a navegar) */}
      {categorias.length > 0 && (
        <section className="pb-16 sm:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy mb-4">
                Temas que cubrimos
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIAS.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-start gap-3 rounded-xl bg-white ring-1 ring-slate-200 p-4"
                  >
                    <span
                      className={`shrink-0 mt-1 w-2.5 h-2.5 rounded-full ${cat.color.punto}`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className={`text-sm font-black ${cat.color.texto}`}>
                        {cat.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {cat.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </PublicShell>
  );
}
