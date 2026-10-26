import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenIcon from "@/components/publico/RegimenIcon";
import {
  FnlMecanicaPills,
  FinesNoLucrativosSeccionesNav,
} from "@/components/publico/FinesNoLucrativosExpositorPills";
import {
  FNL_CRITERIOS,
  FNL_DONATARIA_TILES,
  FNL_FAQ,
  FNL_PASOS_DONATARIA,
  FNL_PASOS_IVA,
  FNL_PASOS_TITULO,
  FNL_TITULO_TILES,
  FNL_VS_DONATARIA,
} from "@/lib/fines-no-lucrativos-expositor";
import { tonoRegimen } from "@/lib/regimen-tonos";
import {
  REGIMENES_SERVICIO,
  type RegimenServicio,
} from "@/lib/servicios-regimenes";

const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-[#0D2744]";
const H2 = "mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900";
const CARD = "rounded-[1.25rem] bg-white overflow-hidden";
const TH =
  "px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white bg-[#0D2744] border-b-2 border-[#4ECDC4]";
const SECTION = "scroll-mt-32 py-5 sm:py-6";
const LISTA_INSET = "mx-4 sm:mx-5 divide-y divide-slate-100";

const OTROS = [
  "regimen-general",
  "sueldos-salarios",
  "resico",
  "actividades-empresariales",
] as const;

export default function PaginaFinesNoLucrativosExpositor({
  regimen,
}: {
  regimen: RegimenServicio;
}) {
  const tono = tonoRegimen("fines-no-lucrativos");

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
                <RegimenIcon
                  slug={regimen.slug}
                  size={36}
                  className={`${tono.textChispa} shrink-0`}
                />
                <div>
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.3em] ${tono.textChispa}`}
                  >
                    {regimen.badge}
                  </p>
                  <h1 className="mt-2 text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.08]">
                    {regimen.titulo}
                  </h1>
                  <p className="mt-1 text-xs font-semibold text-white/60">
                    {regimen.nombreCompleto} · SAT {regimen.codigoSat}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-base text-white/85 max-w-xl leading-relaxed">
                {regimen.subtitulo}
              </p>
              {regimen.precio ? (
                <p className="mt-5 text-sm text-white/80 font-semibold">
                  {regimen.precio.nota}
                </p>
              ) : null}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/cotizar"
                  className="inline-flex px-5 py-2.5 rounded-full bg-white text-sm font-black hover:bg-white/90 transition"
                  style={{ color: tono.campo }}
                >
                  Cotizar este régimen
                </Link>
                <a
                  href="#cuanto-se-paga"
                  className="inline-flex px-5 py-2.5 rounded-full border border-white/30 text-sm font-bold hover:bg-white/10 transition"
                >
                  Ver cómo se paga
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
                  <dt className="text-sm text-white/70">ISR</dt>
                  <dd className="text-2xl font-black tabular-nums">Objeto</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">Donataria</dt>
                  <dd className="text-2xl font-black tabular-nums">Extra</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-white/70">Anual</dt>
                  <dd className="text-2xl font-black tabular-nums">Febrero</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <FinesNoLucrativosSeccionesNav />

      <section id="cuanto-se-paga" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Mecánica del régimen</p>
          <h2 className={H2}>¿Cómo funcionan el ISR, la donataria y el IVA?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            El ISR del objeto social no se causa. La donataria es otra
            autorización, para que el donante deduzca. El IVA no se apaga: un
            donativo no lo causa, un servicio gravado sí. La pregunta del año
            no es 603 vs 601: es no mezclar esas tres cosas.
          </p>

          <div className="mt-5">
            <FnlMecanicaPills
              titulo={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    Cuotas, donativos y actividades estatutarias no pagan ISR
                    si se aplican a los fines. Lo mercantil ajeno al objeto sí,
                    al 30%. El remanente no se reparte a asociados. Febrero,
                    no marzo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FNL_TITULO_TILES.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A7A78]">
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
                  <div className="rounded-2xl bg-[#0D2744]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A7A78]">
                      Cómo se cierra el Título III
                    </p>
                    <ol className="mt-3 space-y-3">
                      {FNL_PASOS_TITULO.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#0D2744] text-white text-[13px] font-bold flex items-center justify-center">
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
                  <p className="rounded-2xl bg-[#4ECDC4]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    El ISR de 603 se apaga en el{" "}
                    <span className="text-[#0D2744]">objeto social</span>, no
                    en lo que le es ajeno.
                  </p>
                </div>
              }
              donataria={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    Ser A.C. no te hace donataria. Esa autorización es extra:
                    el donante deduce, tú emites CFDI de donativo y publicas
                    en qué se usó. Puedes vivir en 603 toda la vida sin ella.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FNL_DONATARIA_TILES.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A7A78]">
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
                  <div className="rounded-2xl bg-[#D8F4F3] px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A7A78]">
                      Deducción del donante
                    </p>
                    <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                      7% en persona física · 7% en persona moral
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      La PF lo lleva al artículo 151. La PM, al 7% de la
                      utilidad fiscal del ejercicio anterior (art. 27). Sin
                      tu autorización vigente, esos topes no se abren.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#0D2744]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A7A78]">
                      Cómo se sostiene la donataria
                    </p>
                    <ol className="mt-3 space-y-3">
                      {FNL_PASOS_DONATARIA.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#0D2744] text-white text-[13px] font-bold flex items-center justify-center">
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
                  <p className="rounded-2xl bg-[#4ECDC4]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    Asociación civil{" "}
                    <span className="text-[#0D2744]">no es donataria</span>.
                  </p>
                </div>
              }
              iva={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    El IVA no copia al ISR. Un donativo no es contraprestación,
                    así que no lo causa. Si cobras un precio, puede haber IVA
                    aunque seas 603. La DIOT viaja con esa declaración.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A7A78]">
                        Donativo
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        No hay contraprestación
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Quien dona no te está comprando. Ese acto no causa
                        IVA. El CFDI de donativo no lleva traslado.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A7A78]">
                        Servicio o venta
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Puede ir al 16% o exento
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Nace cuando cobras (art. 1-B). Enseñanza y asistencia
                        pueden ir exentos por el artículo 15 de la LIVA, no
                        por ser 603. Exento no es tasa 0%.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#D8F4F3] px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A7A78]">
                      DIOT · con el IVA, no con la anual
                    </p>
                    <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                      Operaciones con terceros
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      Si hay IVA, hay DIOT el día 17. No viaja con la
                      declaración de febrero. Si pagas nómina u honorarios,
                      retienes: el sueldo no lleva IVA.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#0D2744]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A7A78]">
                      Cómo se cierra el IVA
                    </p>
                    <ol className="mt-3 space-y-3">
                      {FNL_PASOS_IVA.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#0D2744] text-white text-[13px] font-bold flex items-center justify-center">
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
                  <p className="rounded-2xl bg-[#4ECDC4]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    Hay ISR del objeto apagado y{" "}
                    <span className="text-[#0D2744]">todavía puede haber IVA</span>
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
          <p className={EYEBROW}>Criterios del régimen</p>
          <h2 className={H2}>¿Quién entra a 603 y qué le toca?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Si no hay lucro, este es el régimen de partida. La pregunta del
            año no es 603 vs 601: es no mezclar la exención del objeto, la
            autorización de donataria y el IVA de lo que sí cobras.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FNL_CRITERIOS.map((c) => (
              <div key={c.n} className={`${CARD} px-4 py-3.5`}>
                <p className="text-[11px] font-black tabular-nums text-[#1A7A78]">
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
            LISR arts. 79, 80, 82 y 86 · LIVA arts. 1-B y 15 · clave SAT 603
          </p>
        </div>
      </section>

      <section id="preguntas" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Antes de elegirlo</p>
          <h2 className={H2}>Preguntas frecuentes</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Respuestas directas para decidir con el contador, no para
            memorizar el Título III.
          </p>
          <dl className={`mt-4 ${CARD}`}>
            <div className={LISTA_INSET}>
              {FNL_FAQ.map((f) => (
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
          <div className="mt-4 rounded-[1.25rem] bg-[#0D2744] px-5 py-4 text-white">
            <p className="text-[13px] font-semibold text-[#4ECDC4]">
              Recomendación profesional
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
              Usa esta guía como orientación inicial. En RDC separamos el
              objeto social de lo no relacionado, armamos donataria e
              informe de transparencia cuando aplica, y no mezclamos el IVA
              con la anual de febrero.
            </p>
          </div>
        </div>
      </section>

      <section id="comparativa" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Comparativa</p>
          <h2 className={H2}>{FNL_VS_DONATARIA.titulo}</h2>
          <div className={`mt-5 ${CARD}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <caption className="sr-only">
                  Comparativa entre el Título III de la LISR y la autorización
                  de donataria del artículo 82, en el régimen 603.
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={`${TH} text-left rounded-tl-[1.25rem]`}
                    >
                      Aspecto
                    </th>
                    {FNL_VS_DONATARIA.columnas.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`${TH} text-left ${
                          i === FNL_VS_DONATARIA.columnas.length - 1
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
                  {FNL_VS_DONATARIA.filas.map((fila) => (
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
          <h2 className={H2}>Tu organización, sin sorpresas</h2>
          <div className={`mt-4 ${CARD}`}>
            <ul className={LISTA_INSET}>
              {regimen.queHacemos.map((item, i) => (
                <li key={item.titulo} className="py-3.5 flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#0D2744] text-white text-[13px] font-bold flex items-center justify-center">
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
                Lo que el SAT exige
              </h3>
              <ul className="mt-3 space-y-2">
                {regimen.cumplimiento.map((item) => (
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
            <div className="rounded-[1.25rem] bg-[#0D2744] text-white px-4 sm:px-5 py-4">
              <p className="text-[13px] font-semibold text-[#4ECDC4]">
                En tu portal
              </p>
              <ul className="mt-3 space-y-2">
                {regimen.portal.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[15px] text-white/85 leading-snug"
                  >
                    <span className="text-[#4ECDC4] shrink-0 font-semibold">
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
        <PortalPreview fullBleed compact tono="teal" />
      </section>

      <section className={`${SECTION} pb-5 sm:pb-6`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <p className={EYEBROW}>Marco legal</p>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Fundamento en la ley
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {regimen.marcoLegal.map((ref) => (
                <li
                  key={ref.referencia}
                  className="flex overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.04]"
                >
                  <span className="w-1.5 shrink-0 bg-[#4ECDC4]" aria-hidden />
                  <div className="min-w-0 px-3.5 py-3">
                    <p className="text-[13px] font-bold text-[#0D2744] leading-snug">
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
            <div className="mt-3 flex min-h-0 flex-col rounded-[1.25rem] bg-[#0D2744] px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold text-[#4ECDC4]">
                {regimen.titulo}
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-white/85 leading-snug">
                <li className="flex gap-2">
                  <span className="text-[#4ECDC4] shrink-0">✓</span>
                  Respuesta en 24 h
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4ECDC4] shrink-0">✓</span>
                  Portal del cliente incluido
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4ECDC4] shrink-0">✓</span>
                  Sin compromiso
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  href="/cotizar"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0D2744] hover:bg-white/90 transition"
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
            <p className={`${EYEBROW} mb-2`}>Otros regímenes</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-black/[0.04]">
              {OTROS.map((slug, i) => {
                const r = REGIMENES_SERVICIO[slug];
                return (
                  <Link
                    key={slug}
                    href={`/servicios/${slug}`}
                    className="relative flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition"
                  >
                    {i % 2 === 1 ? (
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
                    {i >= 2 ? (
                      <span
                        className="pointer-events-none absolute left-6 right-6 top-0 h-px bg-slate-200 lg:hidden"
                        aria-hidden
                      />
                    ) : null}
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
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
