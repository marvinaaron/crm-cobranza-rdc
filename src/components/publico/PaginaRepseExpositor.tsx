import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenIcon from "@/components/publico/RegimenIcon";
import {
  RepseMecanicaPills,
  RepseSeccionesNav,
} from "@/components/publico/RepseExpositorPills";
import {
  REPSE_CRITERIOS,
  REPSE_FAQ,
  REPSE_FISCAL_TILES,
  REPSE_INFORME_TILES,
  REPSE_PADRON_TILES,
  REPSE_PASOS_FISCAL,
  REPSE_PASOS_INFORMES,
  REPSE_PASOS_PADRON,
  REPSE_VS_INFORMES,
} from "@/lib/repse-expositor";
import { tonoEspecialidad } from "@/lib/especialidad-tonos";
import {
  CALENDARIO_CUATRIMESTRE,
  ESPECIALIDADES_PAGINA,
  type EspecialidadPagina,
} from "@/lib/servicios-especialidades";
import { REGIMENES_SERVICIO } from "@/lib/servicios-regimenes";

const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-[#1C140C]";
const H2 = "mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900";
const CARD = "rounded-[1.25rem] bg-white overflow-hidden";
const TH =
  "px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white bg-[#1C140C] border-b-2 border-[#E8C36A]";
const SECTION = "scroll-mt-32 py-5 sm:py-6";
const LISTA_INSET = "mx-4 sm:mx-5 divide-y divide-slate-100";

function EspecialidadStripIcon({
  slug,
  className,
  size = 16,
}: {
  slug: "repse" | "icsoe" | "sisub";
  className?: string;
  size?: number;
}) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.75,
    className,
    "aria-hidden": true as const,
  };
  if (slug === "icsoe") {
    return (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  if (slug === "sisub") {
    return (
      <svg {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <rect x="3" y="8" width="18" height="12" rx="1.5" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M9 14h6M9 17h4" />
    </svg>
  );
}

export default function PaginaRepseExpositor({
  especialidad,
}: {
  especialidad: EspecialidadPagina;
}) {
  const tono = tonoEspecialidad("repse");

  return (
    <div className="bg-[#f2f2f7]">
      <section
        className={`relative overflow-hidden rounded-b-[1.75rem] ${tono.bgCampo} text-white shadow-[0_10px_28px_rgba(15,23,42,0.12)]`}
      >
        <HeroPatternBg heroFrom={tono.heroFrom} heroTo={tono.heroTo} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3">
                <EspecialidadStripIcon
                  slug="repse"
                  size={36}
                  className={`${tono.textChispa} shrink-0`}
                />
                <div>
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.3em] ${tono.textChispa}`}
                  >
                    {especialidad.badge}
                  </p>
                  <h1 className="mt-2 text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.08]">
                    {especialidad.titulo}
                  </h1>
                  <p className="mt-1 text-xs font-semibold text-white/60">
                    {especialidad.nombreCompleto} · {especialidad.autoridadCorto}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-base text-white/85 max-w-xl leading-relaxed">
                {especialidad.subtitulo}
              </p>
              {especialidad.precio ? (
                <p className="mt-5 text-sm text-white/80 font-semibold">
                  {especialidad.precio.nota}
                </p>
              ) : null}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/cotizar"
                  className="inline-flex px-5 py-2.5 rounded-full bg-white text-sm font-black hover:bg-white/90 transition"
                  style={{ color: tono.campo }}
                >
                  Cotizar este padrón
                </Link>
                <a
                  href="#cuanto-se-paga"
                  className="inline-flex px-5 py-2.5 rounded-full border border-white/30 text-sm font-bold hover:bg-white/10 transition"
                >
                  Ver cómo funciona
                </a>
              </div>
            </div>

            <aside className="rounded-2xl bg-white/10 ring-1 ring-white/15 p-5 sm:p-6 backdrop-blur-[2px]">
              <p
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${tono.textChispa}`}
              >
                Peculiaridades
              </p>
              <dl className="mt-4 space-y-4">
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">Autoridad</dt>
                  <dd className="text-2xl font-black tabular-nums">STPS</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">Vigencia</dt>
                  <dd className="text-2xl font-black tabular-nums">3 años</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-white/70">Declaraciones</dt>
                  <dd className="text-2xl font-black tabular-nums">3/año</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <RepseSeccionesNav />

      <section id="cuanto-se-paga" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Mecánica del padrón</p>
          <h2 className={H2}>
            ¿Cómo funcionan las declaraciones, el padrón y el efecto fiscal?
          </h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            El REPSE no es una clave SAT. Es el padrón de la STPS para prestar
            un servicio especializado en el sitio del cliente. ICSOE y SISUB
            vienen después, tres veces al año. Sin el padrón, el cliente no
            deduce ni acredita IVA. La pregunta del año no es REPSE vs 601:
            es no mezclar esas tres cosas.
          </p>

          <div className="mt-5">
            <RepseMecanicaPills
              declaraciones={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    Una vez en el padrón, cada cuatrimestre declaras. ICSOE
                    al IMSS, SISUB al INFONAVIT. Mismo periodo, dos acuses,
                    ningún pago extra. El cliente grande suele pedir ambos
                    antes de liberar la factura.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {REPSE_INFORME_TILES.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9A7020]">
                          {t.corto} · {t.fundamento}
                        </p>
                        <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                          {t.titulo}
                        </p>
                        <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                          {t.texto}
                        </p>
                        <Link
                          href={`/servicios/${t.id}`}
                          className="mt-2 inline-flex text-[13px] font-bold text-[#9A7020] hover:underline"
                        >
                          Ver guía {t.corto} →
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {CALENDARIO_CUATRIMESTRE.map((c) => (
                      <div
                        key={c.cuatrimestre}
                        className="rounded-2xl bg-[#F6E9C8] px-4 py-3.5"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9A7020]">
                          Cuatrimestre {c.cuatrimestre}
                        </p>
                        <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                          {c.periodo}
                        </p>
                        <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                          Presentar en {c.presentacion}, día {c.dia}.
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-[#1C140C]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9A7020]">
                      Cómo se cierran las declaraciones
                    </p>
                    <ol className="mt-3 space-y-3">
                      {REPSE_PASOS_INFORMES.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#1C140C] text-white text-[13px] font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 leading-snug">
                            <span className="font-semibold text-slate-900">
                              {paso.name}.{" "}
                            </span>
                            {paso.text}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <p className="rounded-2xl bg-[#E8C36A]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    Primero el padrón. Las declaraciones{" "}
                    <span className="text-[#1C140C]">vienen después</span>.
                  </p>
                </div>
              }
              padron={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    Te inscribes si pones a tu gente en instalaciones ajenas
                    para un servicio que no es el giro del cliente. Se
                    renueva cada tres años, no cada año. El núcleo de él está
                    prohibido: el padrón no lo blanquea.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {REPSE_PADRON_TILES.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9A7020]">
                          {t.corto} · {t.fundamento}
                        </p>
                        <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                          {t.titulo}
                        </p>
                        <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                          {t.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-[#1C140C]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9A7020]">
                      Cómo se entra al padrón
                    </p>
                    <ol className="mt-3 space-y-3">
                      {REPSE_PASOS_PADRON.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#1C140C] text-white text-[13px] font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 leading-snug">
                            <span className="font-semibold text-slate-900">
                              {paso.name}.{" "}
                            </span>
                            {paso.text}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <p className="rounded-2xl bg-[#E8C36A]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    El REPSE se renueva cada{" "}
                    <span className="text-[#1C140C]">tres años</span>, no cada
                    año.
                  </p>
                </div>
              }
              fiscal={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    El contratante no se inscribe: verifica. Sin constancia
                    vigente en el padrón de la STPS, esa factura no le sirve
                    de ISR ni de IVA, y puede quedar solidario de la nómina.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {REPSE_FISCAL_TILES.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9A7020]">
                          {t.corto} · {t.fundamento}
                        </p>
                        <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                          {t.titulo}
                        </p>
                        <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                          {t.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-[#1C140C]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9A7020]">
                      Cómo se defiende el contratante
                    </p>
                    <ol className="mt-3 space-y-3">
                      {REPSE_PASOS_FISCAL.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#1C140C] text-white text-[13px] font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 leading-snug">
                            <span className="font-semibold text-slate-900">
                              {paso.name}.{" "}
                            </span>
                            {paso.text}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <p className="rounded-2xl bg-[#E8C36A]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    Sin padrón vigente, la factura{" "}
                    <span className="text-[#1C140C]">no deduce ni acredita IVA</span>
                    .
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      <section id="limites" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Criterios del padrón</p>
          <h2 className={H2}>¿A quién le toca el REPSE?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Si pones personal en el sitio de otro, o si pagas a quien lo
            hace, esto te toca. La pregunta del año no es REPSE vs 601: es no
            mezclar el padrón, las declaraciones y el efecto fiscal de la
            factura.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REPSE_CRITERIOS.map((c) => (
              <div key={c.n} className={`${CARD} px-4 py-3.5`}>
                <p className="text-[11px] font-black tabular-nums text-[#9A7020]">
                  {c.n} · {c.kicker}
                </p>
                <h3 className="mt-0.5 text-[16px] font-bold tracking-tight text-slate-900">
                  {c.titulo}
                </h3>
                <p className="mt-1 text-[14px] text-slate-600 leading-relaxed">
                  {c.texto}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-slate-400">
            LFT arts. 13, 14 y 15 · LISR art. 27 · LIVA art. 5 · STPS
          </p>
        </div>
      </section>

      <section id="preguntas" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Antes de inscribirte</p>
          <h2 className={H2}>Preguntas frecuentes</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Respuestas directas para decidir con el contador, no para
            memorizar la reforma de 2021.
          </p>
          <dl className={`mt-4 ${CARD}`}>
            <div className={LISTA_INSET}>
              {REPSE_FAQ.map((f) => (
                <div key={f.pregunta} className="py-3.5">
                  <dt>
                    <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
                      {f.pregunta}
                    </h3>
                  </dt>
                  <dd className="mt-1.5 text-[15px] text-slate-600 leading-relaxed">
                    {f.respuesta}
                  </dd>
                </div>
              ))}
            </div>
          </dl>
          <div className="mt-4 rounded-[1.25rem] bg-[#1C140C] px-5 py-4 text-white">
            <p className="text-[13px] font-semibold text-[#E8C36A]">
              Recomendación profesional
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
              Usa esta guía como orientación inicial. En RDC separamos el
              padrón de las declaraciones, armamos el expediente ante la STPS y
              cerramos ICSOE y SISUB el mismo cuatrimestre.
            </p>
          </div>
        </div>
      </section>

      <section id="comparativa" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Comparativa</p>
          <h2 className={H2}>{REPSE_VS_INFORMES.titulo}</h2>
          <div className={`mt-5 ${CARD}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <caption className="sr-only">
                  Comparativa entre el padrón REPSE ante la STPS y los
                  declaraciones cuatrimestrales ICSOE y SISUB.
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={`${TH} text-left rounded-tl-[1.25rem]`}
                    >
                      Aspecto
                    </th>
                    {REPSE_VS_INFORMES.columnas.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`${TH} text-left ${
                          i === REPSE_VS_INFORMES.columnas.length - 1
                            ? "rounded-tr-[1.25rem]"
                            : ""
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {REPSE_VS_INFORMES.filas.map((fila) => (
                    <tr key={fila.aspecto}>
                      <td className="px-4 sm:px-5 py-3 font-semibold text-slate-800 align-top">
                        {fila.aspecto}
                      </td>
                      {fila.valores.map((v, j) => (
                        <td
                          key={`${fila.aspecto}-${j}`}
                          className="px-4 sm:px-5 py-3 text-slate-600 align-top leading-snug"
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="cumplimiento" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Qué hacemos en RDC</p>
          <h2 className={H2}>Tu padrón, sin sorpresas</h2>
          <div className={`mt-4 ${CARD}`}>
            <ul className={LISTA_INSET}>
              {especialidad.queHacemos.map((item, i) => (
                <li key={item.titulo} className="py-3.5 flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#1C140C] text-white text-[13px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
                      {item.titulo}
                    </h3>
                    <p className="mt-0.5 text-[15px] text-slate-600 leading-relaxed">
                      {item.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${CARD} px-4 sm:px-5 py-4`}>
              <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
                Lo que piden STPS, IMSS e INFONAVIT
              </h3>
              <ul className="mt-3 space-y-2">
                {especialidad.cumplimiento.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[15px] text-slate-700"
                  >
                    <span className="text-emerald-600 shrink-0 font-semibold">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.25rem] bg-[#1C140C] text-white px-4 sm:px-5 py-4">
              <p className="text-[13px] font-semibold text-[#E8C36A]">
                En tu portal
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  "Estado del padrón y fecha de renovación",
                  "Acuses de ICSOE y SISUB por cuatrimestre",
                  "Calendario mayo / septiembre / enero",
                  "Contratos y plantilla ligados al registro",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[15px] text-white/85 leading-snug"
                  >
                    <span className="text-[#E8C36A] shrink-0 font-semibold">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 sm:py-6">
        <PortalPreview fullBleed compact tono="sello" />
      </section>

      <section className={`${SECTION} pb-5 sm:pb-6`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <p className={EYEBROW}>Marco legal</p>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Fundamento en la ley
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {especialidad.marcoLegal.map((ref) => (
                <li
                  key={ref.referencia}
                  className="flex overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.04]"
                >
                  <span className="w-1.5 shrink-0 bg-[#E8C36A]" aria-hidden />
                  <div className="min-w-0 px-3.5 py-3">
                    <p className="text-[13px] font-bold text-[#1C140C] leading-snug">
                      {ref.referencia}
                    </p>
                    <p className="mt-0.5 text-[13px] text-slate-600 leading-snug">
                      {ref.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid h-full grid-rows-[auto_auto_1fr]">
            <p className={EYEBROW}>Siguiente paso</p>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              ¿Listo para cotizar?
            </h2>
            <div className="mt-3 flex min-h-0 flex-col rounded-[1.25rem] bg-[#1C140C] px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold text-[#E8C36A]">
                {especialidad.titulo}
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-white/85 leading-snug">
                <li className="flex gap-2">
                  <span className="text-[#E8C36A] shrink-0">✓</span>
                  Respuesta en 24 h
                </li>
                <li className="flex gap-2">
                  <span className="text-[#E8C36A] shrink-0">✓</span>
                  Portal del cliente incluido
                </li>
                <li className="flex gap-2">
                  <span className="text-[#E8C36A] shrink-0">✓</span>
                  Sin compromiso
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  href="/cotizar"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1C140C] hover:bg-white/90 transition"
                >
                  Cotizar ahora
                </Link>
                <Link
                  href="/contacto"
                  className="inline-flex h-9 items-center justify-center rounded-full border border-white/25 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Hablar por WhatsApp
                </Link>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <p className={`${EYEBROW} mb-2`}>Otras obligaciones</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-black/[0.04]">
              {(["icsoe", "sisub"] as const).map((slug, i) => {
                const e = ESPECIALIDADES_PAGINA[slug];
                return (
                  <Link
                    key={slug}
                    href={`/servicios/${slug}`}
                    className="relative flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition"
                  >
                    {i === 1 ? (
                      <span
                        className="pointer-events-none absolute left-0 top-1/2 h-8 w-px -translate-y-1/2 bg-slate-200 lg:hidden"
                        aria-hidden
                      />
                    ) : null}
                    {i > 0 ? (
                      <span
                        className="pointer-events-none absolute left-0 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-slate-200 lg:block"
                        aria-hidden
                      />
                    ) : null}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F6E9C8]">
                      <EspecialidadStripIcon
                        slug={slug}
                        className="text-[#8A6414]"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-slate-900 leading-tight truncate">
                        {e.titulo}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {e.autoridadCorto}
                      </span>
                    </span>
                  </Link>
                );
              })}
              {(["regimen-general", "actividades-empresariales"] as const).map(
                (slug, i) => {
                  const r = REGIMENES_SERVICIO[slug];
                  return (
                    <Link
                      key={slug}
                      href={`/servicios/${slug}`}
                      className="relative flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition"
                    >
                      <span
                        className="pointer-events-none absolute left-0 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-slate-200 lg:block"
                        aria-hidden
                      />
                      {i === 0 ? (
                        <span
                          className="pointer-events-none absolute left-6 right-6 top-0 h-px bg-slate-200 lg:hidden"
                          aria-hidden
                        />
                      ) : (
                        <>
                          <span
                            className="pointer-events-none absolute left-0 top-1/2 h-8 w-px -translate-y-1/2 bg-slate-200 lg:hidden"
                            aria-hidden
                          />
                          <span
                            className="pointer-events-none absolute left-6 right-6 top-0 h-px bg-slate-200 lg:hidden"
                            aria-hidden
                          />
                        </>
                      )}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${r.iconBg}`}
                      >
                        <RegimenIcon slug={r.slug} className={r.iconColor} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold text-slate-900 leading-tight truncate">
                          {r.titulo}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          SAT {r.codigoSat}
                        </span>
                      </span>
                    </Link>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
