import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import BlogIndice from "@/components/publico/blog/BlogIndice";
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

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 pt-12 pb-10 sm:pt-16 sm:pb-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-marca-navy/12 to-violet-200/30 blur-3xl"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-500 mb-5" aria-label="Ruta">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-slate-900">
                  Inicio
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-slate-700 font-medium">Blog</li>
            </ol>
          </nav>

          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                aria-hidden="true"
              />
              Blog de RDC Contadores
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              Fiscal sin enredos,{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                explicado fácil
              </span>
            </h1>
            <p className="mt-4 text-slate-600 leading-relaxed sm:text-lg">
              Guías prácticas sobre SAT, impuestos, nómina y negocios. Escritas
              por contadores, pensadas para que tú las entiendas.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
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
            <BlogIndice posts={posts} categorias={categorias} />
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
