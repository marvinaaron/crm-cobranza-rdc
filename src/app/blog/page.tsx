import { Suspense } from "react";
import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import BlogIndice from "@/components/publico/blog/BlogIndice";
import BlogHeroChips from "@/components/publico/blog/BlogHeroChips";
import {
  CATEGORIAS,
  formatearFecha,
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
  // El destacado vive en su propia card arriba; no se repite en el grid.
  const postsGrid = destacado
    ? posts.filter((p) => p.slug !== destacado.slug)
    : posts;

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

      <section
        id="articulos"
        className="bg-gradient-to-b from-marca-navy to-slate-950 py-12 sm:py-16 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Card DESTACADA — fila propia, ancho completo */}
          {destacado && (
            <Link
              href={`/blog/${destacado.slug}`}
              className="group grid grid-cols-1 md:grid-cols-[3fr_2fr] rounded-xl overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-800/50 mb-12 transition-all duration-200 hover:border-indigo-600/70 hover:shadow-2xl hover:shadow-violet-900/30"
            >
              {/* Izquierda (60%): contenido */}
              <div className="p-7 sm:p-10 flex flex-col">
                <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 border border-violet-500/40 text-violet-300">
                  Destacado · {destacado.categoriaInfo.label}
                </span>
                <h2 className="mt-4 text-2xl md:text-3xl font-bold text-white leading-tight">
                  {destacado.titulo}
                </h2>
                <p className="mt-3 text-white/70 leading-relaxed">
                  {destacado.resumen}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-white/40">
                  <time dateTime={destacado.fecha}>
                    {formatearFecha(destacado.fecha)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>{destacado.lectura} min de lectura</span>
                </div>
                <span className="mt-6 inline-flex w-fit items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-violet-900/40 group-hover:gap-3 transition-all">
                  Leer artículo
                  <svg
                    width="15"
                    height="15"
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

              {/* Derecha (40%): bloque sólido con emoji enorme — oculto en mobile */}
              <div
                className="hidden md:flex items-center justify-center bg-indigo-900/50"
                aria-hidden="true"
              >
                <span className="text-8xl transition-transform duration-300 group-hover:scale-110">
                  {destacado.emoji ?? "✨"}
                </span>
              </div>
            </Link>
          )}

          {postsGrid.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">✍️</p>
              <p className="text-lg font-bold text-white">
                Estamos preparando los primeros artículos.
              </p>
              <p className="text-white/60 mt-1">
                Muy pronto encontrarás aquí guías fiscales útiles.
              </p>
            </div>
          ) : (
            <Suspense fallback={<div className="min-h-[20rem]" />}>
              <BlogIndice posts={postsGrid} categorias={CATEGORIAS} />
            </Suspense>
          )}
        </div>
      </section>

      {/* Categorías como cierre editorial (ayuda a SEO y a navegar) */}
      {CATEGORIAS.length > 0 && (
        <section className="bg-slate-950 pb-16 sm:pb-20 pt-2">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-300 mb-4">
                Temas que cubrimos
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIAS.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-4"
                  >
                    <span
                      className={`shrink-0 mt-1 w-2.5 h-2.5 rounded-full ${cat.color.punto}`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">
                        {cat.label}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
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
