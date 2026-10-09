import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import {
  CALENDARIO_CUATRIMESTRE,
  ESPECIALIDADES_PAGINA,
  SLUGS_ESPECIALIDAD,
  type EspecialidadPagina,
  type EspecialidadSlug,
} from "@/lib/servicios-especialidades";

function EspecialidadHeroIcon({ slug, className, size = 36 }: { slug: EspecialidadSlug; className: string; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: size > 100 ? 1.5 : 1.75,
    className,
    "aria-hidden": true as const,
  };

  if (slug === "repse") {
    return (
      <svg {...props}>
        <rect x="3" y="8" width="18" height="12" rx="1.5" />
        <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M9 14h6M9 17h4" />
      </svg>
    );
  }
  if (slug === "icsoe") {
    return (
      <svg {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

export default function PaginaEspecialidadServicio({
  especialidad,
}: {
  especialidad: EspecialidadPagina;
}) {
  const otras = SLUGS_ESPECIALIDAD.filter((s) => s !== especialidad.slug);

  return (
    <>
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${especialidad.heroFrom} ${especialidad.heroTo} text-white`}
      >
        <HeroPatternBg
          heroFrom={especialidad.heroFrom}
          heroTo={especialidad.heroTo}
          icon={<EspecialidadHeroIcon slug={especialidad.slug} size={440} className="w-full h-auto text-current" />}
        />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-3">
            <EspecialidadHeroIcon slug={especialidad.slug} className="text-white shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
                {especialidad.badge}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                {especialidad.titulo}
              </h1>
              <p className="mt-1 text-xs font-semibold text-white/60">
                {especialidad.nombreCompleto} · {especialidad.autoridadCorto}
              </p>
            </div>
          </div>
          <p className="mt-4 text-base text-white/85 max-w-2xl leading-relaxed">
            {especialidad.subtitulo}
          </p>
          {especialidad.precio ? (
            <p className="mt-6 inline-flex rounded-2xl bg-white/10 ring-1 ring-white/20 px-5 py-3 text-sm font-semibold text-white/90">
              {especialidad.precio.nota}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/cotizar"
              className="inline-flex px-5 py-3 rounded-xl bg-white text-slate-900 text-sm font-black hover:bg-white/90 transition"
            >
              Cotizar {especialidad.titulo}
            </Link>
            <Link
              href="/servicios#otras-especialidades"
              className="inline-flex px-5 py-3 rounded-xl border border-white/30 text-sm font-bold hover:bg-white/10 transition"
            >
              Ver las 3 especialidades
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marca-navy">
              En pocas palabras
            </p>
            <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed">
              {especialidad.introSeo}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {especialidad.esCuatrimestral ? (
        <section className={`py-14 sm:py-16 ${especialidad.accentBg}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <RevealOnScroll>
              <p className={`text-[11px] font-bold uppercase tracking-[0.25em] ${especialidad.accentText}`}>
                Calendario cuatrimestral
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                ¿Cuándo debo presentar {especialidad.titulo}?
              </h2>
              <p className="mt-3 text-sm text-slate-600 max-w-2xl">
                Tres ventanas al año. El informe del cuatrimestre anterior se entrega en{" "}
                <strong>mayo</strong>, <strong>septiembre</strong> y <strong>enero</strong>,
                normalmente a más tardar el día 17.
              </p>
            </RevealOnScroll>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CALENDARIO_CUATRIMESTRE.map((c) => (
                <div
                  key={c.cuatrimestre}
                  className={`rounded-2xl bg-white p-5 ring-1 ${especialidad.accentRing} shadow-sm`}
                >
                  <p className={`text-[10px] font-black uppercase tracking-widest ${especialidad.accentText}`}>
                    Cuatrimestre {c.cuatrimestre}
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-900">{c.periodo}</p>
                  <p className="mt-3 text-sm text-slate-600">
                    Presentar en{" "}
                    <span className="font-bold text-slate-900">
                      {c.presentacion}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Fecha límite habitual: día {c.dia}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className={`py-14 sm:py-16 ${especialidad.accentBg}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <RevealOnScroll>
              <p className={`text-[11px] font-bold uppercase tracking-[0.25em] ${especialidad.accentText}`}>
                Y después del REPSE
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                ¿Cuándo vienen ICSOE y SISUB?
              </h2>
              <p className="mt-3 text-sm text-slate-600 max-w-2xl">
                Una vez inscrito, cada cuatrimestre presentas informes ante IMSS e INFONAVIT en{" "}
                <strong>mayo</strong>, <strong>septiembre</strong> y <strong>enero</strong>.
              </p>
            </RevealOnScroll>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CALENDARIO_CUATRIMESTRE.map((c) => (
                <div
                  key={c.cuatrimestre}
                  className={`rounded-2xl bg-white p-5 ring-1 ${especialidad.accentRing}`}
                >
                  <p className="text-sm font-bold text-slate-900">{c.periodo}</p>
                  <p className="mt-2 text-xs text-slate-600">
                    Presentación en {c.presentacion} (día {c.dia})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marca-navy">
              Lo que debes incluir
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              Datos que pide cada declaración
            </h2>
            <p className="mt-3 text-sm text-slate-600 max-w-2xl">
              No es solo “subir un archivo”: cada trabajador y contrato debe traer identificación
              completa. Esto es lo que revisamos antes de presentar.
            </p>
          </RevealOnScroll>
          <div className="mt-8 space-y-3">
            {especialidad.datosDeclaracion.map((dato) => (
              <div
                key={dato.campo}
                className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4 sm:p-5"
              >
                <div className="sm:w-2/5 shrink-0">
                  <p className="text-sm font-black text-slate-900">{dato.campo}</p>
                  {dato.obligatorio ? (
                    <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider text-rose-600">
                      Obligatorio
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{dato.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {especialidad.herramienta ? (
        <section className="py-10 sm:py-12 bg-slate-50 border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div
              className={`rounded-2xl ${especialidad.accentBg} ring-1 ${especialidad.accentRing} p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${especialidad.accentText}`}>
                  Herramienta gratuita RDC
                </p>
                <h3 className="mt-2 text-xl font-black text-slate-900">
                  ¿Necesitas el RFC de tus trabajadores?
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {especialidad.herramienta.texto}
                </p>
              </div>
              <Link
                href={especialidad.herramienta.href}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-marca-navy px-5 py-3 text-sm font-bold text-white hover:bg-marca-navy-soft transition"
              >
                {especialidad.herramienta.label}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marca-navy">
              Explicaciones clave
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              Lo que conviene entender bien
            </h2>
          </RevealOnScroll>
          <div className="mt-8 grid grid-cols-1 gap-4">
            {especialidad.explicaciones.map((exp) => (
              <article
                key={exp.titulo}
                className="rounded-2xl border-l-4 border-marca-navy/40 bg-slate-50 px-5 py-4 sm:px-6 sm:py-5"
              >
                <h3 className="text-base font-black text-slate-900">{exp.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{exp.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marca-navy">
              Peculiaridades
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              Detalles que marcan la diferencia
            </h2>
          </RevealOnScroll>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {especialidad.peculiaridades.map((p) => (
              <div key={p.titulo} className="rounded-2xl bg-white ring-1 ring-slate-200 p-5">
                <h3 className="text-base font-black text-slate-900">{p.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marca-navy">
              Marco legal
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              Fundamento normativo
            </h2>
          </RevealOnScroll>
          <ul className="mt-8 space-y-4">
            {especialidad.marcoLegal.map((ref) => (
              <li
                key={ref.referencia}
                className="rounded-xl border-l-4 border-marca-navy/30 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4"
              >
                <p className="text-sm font-black text-marca-navy">{ref.referencia}</p>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{ref.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marca-navy">
            Para quién es
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
            ¿Te aplica {especialidad.titulo}?
          </h2>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {especialidad.paraQuien.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 rounded-xl bg-white ring-1 ring-slate-200 p-4"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="shrink-0 text-emerald-600"
                  aria-hidden
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marca-navy">
            Qué hacemos
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
            Tu cumplimiento, cuatrimestre a cuatrimestre
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {especialidad.queHacemos.map((item, i) => (
              <div
                key={item.titulo}
                className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5"
              >
                <span className="inline-flex w-8 h-8 rounded-full bg-marca-navy/10 text-marca-navy text-sm font-black items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-base font-black text-slate-900">{item.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.texto}</p>
              </div>
            ))}
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {especialidad.cumplimiento.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200"
              >
                <span className="text-emerald-600">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marca-navy mb-4">
            Otras especialidades
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otras.map((slug) => {
              const e = ESPECIALIDADES_PAGINA[slug];
              return (
                <Link
                  key={slug}
                  href={`/servicios/${slug}`}
                  className="group flex items-center gap-3 rounded-xl bg-white ring-1 ring-slate-200 p-4 hover:ring-marca-navy/30 hover:shadow-sm transition-all"
                >
                  <EspecialidadHeroIcon
                    slug={slug}
                    className={e.accentText}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900 group-hover:text-marca-navy">
                      {e.titulo}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold text-slate-500">
                      {e.autoridadCorto}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-6 text-center">
            <Link href="/servicios#otras-especialidades" className="text-sm font-bold text-marca-navy hover:underline">
              Volver a especialidades →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
