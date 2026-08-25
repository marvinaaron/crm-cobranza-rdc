import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenGuiaEnriquecida from "@/components/publico/RegimenGuiaEnriquecida";
import RegimenIcon from "@/components/publico/RegimenIcon";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import {
  REGIMENES_SERVICIO,
  SLUGS_REGIMEN_PF,
  SLUGS_REGIMEN_PM,
  type RegimenServicio,
} from "@/lib/servicios-regimenes";

const SECTION = "py-8 sm:py-10";
const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-marca-navy";
const H2 = "mt-1.5 text-xl sm:text-2xl font-black text-slate-900";

export default function PaginaRegimenServicio({ regimen }: { regimen: RegimenServicio }) {
  const slugsRelacionados =
    regimen.tipoPersona === "pf" ? SLUGS_REGIMEN_PF : SLUGS_REGIMEN_PM;
  const otros = slugsRelacionados.filter((s) => s !== regimen.slug).slice(0, 4);
  const tieneHerramientaEnGuia = regimen.guia.herramientasRelacionadas?.some(
    (h) => h.href === regimen.herramienta?.href
  );

  return (
    <>
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${regimen.heroFrom} ${regimen.heroTo} text-white`}
      >
        <HeroPatternBg
          heroFrom={regimen.heroFrom}
          heroTo={regimen.heroTo}
          icon={<RegimenIcon slug={regimen.slug} size={440} className="w-full h-auto text-current" />}
        />
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-3">
            <RegimenIcon slug={regimen.slug} size={36} className="text-white shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
                {regimen.badge}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                {regimen.titulo}
              </h1>
              <p className="mt-1 text-xs font-semibold text-white/60">
                {regimen.nombreCompleto} · SAT {regimen.codigoSat}
              </p>
            </div>
          </div>
          <p className="mt-4 text-base text-white/85 max-w-2xl leading-relaxed">
            {regimen.subtitulo}
          </p>
          {regimen.precio?.monto ? (
            <div className="mt-6 inline-flex flex-col rounded-xl bg-white/10 ring-1 ring-white/20 px-5 py-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                Honorarios desde
              </span>
              <span className="text-3xl sm:text-4xl font-black tabular-nums">
                {regimen.precio.monto}
                <span className="text-base font-semibold text-white/80">/mes</span>
              </span>
              <span className="text-xs text-white/70 mt-1">{regimen.precio.nota}</span>
            </div>
          ) : regimen.precio ? (
            <p className="mt-6 text-sm text-white/80 font-semibold">{regimen.precio.nota}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/cotizar"
              className="inline-flex px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-black hover:bg-white/90 transition"
            >
              Cotizar este régimen
            </Link>
            <Link
              href="/proceso"
              className="inline-flex px-5 py-2.5 rounded-xl border border-white/30 text-sm font-bold hover:bg-white/10 transition"
            >
              Cómo trabajamos
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-9 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <p className={EYEBROW}>En pocas palabras</p>
            <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
              {regimen.introSeo}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <RegimenGuiaEnriquecida guia={regimen.guia} />

      <section className={`${SECTION} bg-slate-50`}>
        <div className={WRAP}>
          <RevealOnScroll>
            <p className={EYEBROW}>Peculiaridades del régimen</p>
            <h2 className={H2}>Lo que debes saber antes de contratar</h2>
          </RevealOnScroll>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regimen.peculiaridades.map((p) => (
              <div key={p.titulo} className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
                <h3 className="text-sm font-black text-slate-900">{p.titulo}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${SECTION} bg-white`}>
        <div className={WRAP}>
          <RevealOnScroll>
            <p className={EYEBROW}>Marco legal</p>
            <h2 className={H2}>Fundamento en la ley fiscal mexicana</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Referencias a la LISR, CFF y reglas vigentes. Para tu caso concreto, consulta con un
              contador — el SAT publica reformas y miscelánea cada año.
            </p>
          </RevealOnScroll>
          <ul className="mt-5 space-y-3">
            {regimen.marcoLegal.map((ref) => (
              <li
                key={ref.referencia}
                className="rounded-lg border-l-4 border-marca-navy/30 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-black text-marca-navy">{ref.referencia}</p>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{ref.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${SECTION} bg-slate-50`}>
        <div className={WRAP}>
          <RevealOnScroll>
            <p className={EYEBROW}>Para quién es</p>
            <h2 className={H2}>¿Te reconoces en alguno de estos perfiles?</h2>
          </RevealOnScroll>
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {regimen.paraQuien.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-lg bg-white ring-1 ring-slate-200 p-3.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="shrink-0 text-emerald-600 mt-0.5"
                  aria-hidden
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm text-slate-700 leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${SECTION} bg-white`}>
        <div className={WRAP}>
          <p className={EYEBROW}>Qué hacemos</p>
          <h2 className={H2}>Tu cumplimiento, mes con mes</h2>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regimen.queHacemos.map((item, i) => (
              <div key={item.titulo} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
                <span className="inline-flex w-7 h-7 rounded-full bg-marca-navy/10 text-marca-navy text-xs font-black items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-sm font-black text-slate-900">{item.titulo}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${SECTION} bg-slate-50`}>
        <div className={`${WRAP} grid grid-cols-1 lg:grid-cols-2 gap-8 items-start`}>
          <div>
            <p className={EYEBROW}>Obligaciones que cubrimos</p>
            <h2 className={H2}>Todo lo que el SAT (y más) exige</h2>
            <ul className="mt-4 space-y-2">
              {regimen.cumplimiento.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-200/80 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">
              En tu portal
            </p>
            <ul className="mt-3 space-y-2">
              {regimen.portal.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-indigo-600 shrink-0 mt-0.5">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-9 bg-white border-y border-slate-100">
        <div className={`${WRAP} text-center mb-1`}>
          <p className={EYEBROW}>Tu portal</p>
          <h2 className={H2}>Tu despacho en el bolsillo</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Estado del mes, acuses y honorarios en un solo lugar.
          </p>
        </div>
        <PortalPreview fullBleed />
      </section>

      {regimen.herramienta && !tieneHerramientaEnGuia ? (
        <section className="py-6 bg-slate-50">
          <div className={`${WRAP} text-center`}>
            <Link
              href={regimen.herramienta.href}
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-700 hover:text-violet-900 transition"
            >
              {regimen.herramienta.label}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      ) : null}

      <section className={`${SECTION} bg-white`}>
        <div className={WRAP}>
          <p className={`${EYEBROW} mb-3`}>
            Otros regímenes {regimen.tipoPersona === "pf" ? "persona física" : "persona moral"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {otros.map((slug) => {
              const r = REGIMENES_SERVICIO[slug];
              return (
                <Link
                  key={slug}
                  href={`/servicios/${slug}`}
                  className="group flex items-center gap-2 rounded-lg ring-1 ring-slate-200 p-3.5 hover:ring-marca-navy/30 hover:shadow-sm transition-all"
                >
                  <RegimenIcon slug={r.slug} className={r.iconColor} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900 leading-none group-hover:text-marca-navy">
                      {r.titulo}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold text-slate-500">
                      SAT {r.codigoSat}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-5 text-center">
            <Link href="/servicios" className="text-sm font-bold text-marca-navy hover:underline">
              Ver todos los regímenes →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
