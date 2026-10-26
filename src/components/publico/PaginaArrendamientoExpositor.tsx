import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenIcon from "@/components/publico/RegimenIcon";
import {
  ArrendamientoIsrIvaPills,
  ArrendamientoSeccionesNav,
} from "@/components/publico/ArrendamientoExpositorPills";
import ArrendamientoIvaComparativo from "@/components/publico/ArrendamientoIvaComparativo";
import { TARIFA_ISR_MENSUAL_2026 } from "@/lib/fiscal/isr";
import { fmtMxn } from "@/lib/fiscal/resico";
import {
  ARRENDAMIENTO_CRITERIOS,
  ARRENDAMIENTO_FAQ,
  ARRENDAMIENTO_PASOS_ISR,
  ARRENDAMIENTO_VS_DEDUCCION,
} from "@/lib/arrendamiento-expositor";
import { isrSobreUtilidad } from "@/lib/pfae-expositor";
import { tonoRegimen } from "@/lib/regimen-tonos";
import {
  REGIMENES_SERVICIO,
  SLUGS_REGIMEN_PF,
  type RegimenServicio,
} from "@/lib/servicios-regimenes";

const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-[#3C1A16]";
const H2 = "mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900";
const CARD = "rounded-[1.25rem] bg-white overflow-hidden";
const TH =
  "px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white bg-[#3C1A16] border-b-2 border-[#E8895A]";
const SECTION = "scroll-mt-32 py-5 sm:py-6";
const LISTA_INSET = "mx-4 sm:mx-5 divide-y divide-slate-100";

export default function PaginaArrendamientoExpositor({
  regimen,
}: {
  regimen: RegimenServicio;
}) {
  const tono = tonoRegimen("arrendamiento");
  const otros = SLUGS_REGIMEN_PF.filter((s) => s !== "arrendamiento").slice(0, 4);

  const ejemploRenta = 40_000;
  const ejemploPredial = 800;
  const ejemploDed35 = Math.round(ejemploRenta * 0.35 * 100) / 100;
  const ejemploBase35 =
    Math.round((ejemploRenta - ejemploDed35 - ejemploPredial) * 100) / 100;
  const ejemploIsr35 = isrSobreUtilidad(
    ejemploBase35,
    TARIFA_ISR_MENSUAL_2026.renglones
  ).isr;
  const ejemploRetPm = Math.round(ejemploRenta * 0.1 * 100) / 100;
  const ejemploIsrCargo =
    Math.round(Math.max(0, ejemploIsr35 - ejemploRetPm) * 100) / 100;
  const ejemploIva = Math.round(ejemploRenta * 0.16 * 100) / 100;
  const ejemploIvaRetenido = Math.round(ejemploRenta * 0.106667 * 100) / 100;
  const ejemploIvaAcreditable = 960;
  const ejemploIvaCargo =
    Math.round(
      (ejemploIva - ejemploIvaAcreditable - ejemploIvaRetenido) * 100
    ) / 100;

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
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${tono.textChispa}`}>
                Peculiaridades
              </p>
              <dl className="mt-4 space-y-4">
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">Deducción opcional</dt>
                  <dd className="text-2xl font-black tabular-nums">35%</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">IVA vivienda</dt>
                  <dd className="text-2xl font-black tabular-nums">Exento</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-white/70">Retención si te paga una PM</dt>
                  <dd className="text-2xl font-black tabular-nums">10%</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <ArrendamientoSeccionesNav />

      <section id="cuanto-se-paga" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Mecánica mensual</p>
          <h2 className={H2}>¿Cuánto se paga cada mes?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            El ISR va sobre la renta cobrada menos lo que la ley te deja restar.
            Hay dos caminos: el 35% más predial, o los comprobantes reales. El
            IVA no se mezcla: vivienda exenta, comercial al 16%.
          </p>

          <div className="mt-5">
            <ArrendamientoIsrIvaPills
              isr={
                <div>
                  <p className="px-4 sm:px-5 pt-4 pb-3 text-[13px] text-slate-500 leading-snug">
                    El 35% del artículo 115 no es la tasa de ISR: es una
                    deducción. Restas ese porcentaje y el predial; sobre lo que
                    queda aplicas la tarifa del artículo 96. Si tu inquilino es
                    persona moral, el 10% que ya te retuvo se acredita.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 sm:px-5 pb-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B04A28]">
                        Opción 35%
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Base = renta − 35% − predial
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        No acumulas mantenimiento, seguros ni depreciación de
                        ese inmueble. El predial sí se resta.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B04A28]">
                        Opción comprobantes
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Gastos del inmueble con CFDI
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Predial, mantenimiento, seguros, intereses del crédito y
                        depreciación de la construcción. Sin factura, no baja la
                        base.
                      </p>
                    </div>
                  </div>
                  <p className="px-4 sm:px-5 pb-3 text-[12px] text-slate-500 leading-relaxed">
                    Un enero con {fmtMxn(ejemploRenta)} de renta y{" "}
                    {fmtMxn(ejemploPredial)} de predial, por la vía del 35%:
                    base {fmtMxn(ejemploBase35)}, ISR determinado{" "}
                    {fmtMxn(ejemploIsr35)}. Si una persona moral ya retuvo{" "}
                    {fmtMxn(ejemploRetPm)}, el ISR a cargo de ese mes queda en{" "}
                    {fmtMxn(ejemploIsrCargo)}.
                  </p>
                  <div className="mx-4 sm:mx-5 mb-1 rounded-2xl bg-[#3C1A16]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B04A28]">
                      Cómo se calcula
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-slate-800">
                      ISR = tarifa art. 96 sobre (renta cobrada − deducciones)
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      La retención del 10% no es un gasto: es un anticipo. Se
                      resta del ISR a cargo. Sin inquilino persona moral, enteras
                      el determinado completo.
                    </p>
                  </div>
                  <div className="mx-4 sm:mx-5 border-t border-slate-100 py-4">
                    <p className="text-[13px] font-semibold text-slate-500">
                      Cómo se cierra el mes
                    </p>
                    <ol className="mt-3 space-y-3">
                      {ARRENDAMIENTO_PASOS_ISR.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#3C1A16] text-white text-[13px] font-bold flex items-center justify-center">
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
                    <p className="mt-4 rounded-2xl bg-[#E8895A]/20 px-4 py-3 text-[15px] font-semibold text-slate-800">
                      ISR e IVA, a más tardar el{" "}
                      <span className="text-[#3C1A16]">día 17</span>. La
                      retención del inquilino no sustituye la declaración.
                    </p>
                  </div>
                </div>
              }
              iva={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    El IVA no se mezcla con el ISR ni con el 35%. Lo decide el
                    uso del inmueble.
                  </p>

                  <ArrendamientoIvaComparativo />

                  <div className="rounded-2xl bg-[#3C1A16]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B04A28]">
                      Gastos del inmueble
                    </p>
                    <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                      Su IVA sí se acredita si hay CFDI
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      Mantenimiento, administración o seguros con IVA se
                      acreditan contra el IVA a cargo del comercial. En vivienda
                      exenta no hay IVA a cargo contra el cual acreditar.
                    </p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-800">
                      IVA a cargo = trasladado − acreditable − retenido por el
                      inquilino
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-slate-500">
                        Local comercial · {fmtMxn(ejemploRenta)}
                      </p>
                      <dl className="mt-3 space-y-2 text-[14px]">
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">IVA trasladado 16%</dt>
                          <dd className="font-bold tabular-nums text-slate-900">
                            {fmtMxn(ejemploIva)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">Acreditable</dt>
                          <dd className="font-bold tabular-nums text-slate-900">
                            − {fmtMxn(ejemploIvaAcreditable)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">Retenido por la PM</dt>
                          <dd className="font-bold tabular-nums text-slate-900">
                            − {fmtMxn(ejemploIvaRetenido)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-slate-200/80 pt-2">
                          <dt className="font-semibold text-slate-800">
                            IVA a cargo
                          </dt>
                          <dd className="font-black tabular-nums text-slate-900">
                            {fmtMxn(ejemploIvaCargo)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="rounded-2xl bg-amber-50 px-4 py-3.5">
                      <p className="text-[15px] font-bold text-amber-950">
                        No factures vivienda y local en el mismo CFDI
                      </p>
                      <p className="mt-1.5 text-[14px] text-amber-950/80 leading-relaxed">
                        Un inmueble exento y uno gravado son dos tratamientos.
                        Mezclarlos en una sola factura es el atajo que el SAT
                        cruza contra tu declaración de IVA.
                      </p>
                    </div>
                  </div>

                  <p className="rounded-2xl bg-[#E8895A]/20 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    El IVA se declara junto con el ISR, a más tardar el{" "}
                    <span className="text-[#3C1A16]">día 17</span>.
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
          <h2 className={H2}>¿Quién entra a 606 y cómo opera?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Si cobras renta por un inmueble, este es tu régimen de partida. La
            pregunta del mes no es 606 vs otro régimen: es si restas el 35% o
            vas por comprobantes, y si esa renta lleva IVA.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ARRENDAMIENTO_CRITERIOS.map((c) => (
              <div key={c.n} className={`${CARD} px-4 py-3.5`}>
                <p className="text-[11px] font-black tabular-nums text-[#B04A28]">
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
            LISR arts. 114 a 118 · clave SAT 606
          </p>
        </div>
      </section>

      <section id="preguntas" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Antes de elegirlo</p>
          <h2 className={H2}>Preguntas frecuentes</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Respuestas directas para decidir con el contador, no para memorizar
            el reglamento.
          </p>
          <dl className={`mt-4 ${CARD}`}>
            <div className={LISTA_INSET}>
              {ARRENDAMIENTO_FAQ.map((f) => (
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
          <div className="mt-4 rounded-[1.25rem] bg-[#3C1A16] px-5 py-4 text-white">
            <p className="text-[13px] font-semibold text-[#E8895A]">
              Recomendación profesional
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
              Usa esta guía como orientación inicial. En RDC comparamos el 35%
              contra tus comprobantes reales — y, si calificas, contra RESICO —
              con las rentas, el predial y el tipo de inmueble.
            </p>
          </div>
        </div>
      </section>

      <section id="comparativa" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Comparativa</p>
          <h2 className={H2}>{ARRENDAMIENTO_VS_DEDUCCION.titulo}</h2>
          <div className={`mt-5 ${CARD}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <caption className="sr-only">
                  Comparativa entre la deducción opcional del 35% más predial y
                  las deducciones con comprobantes en el régimen de
                  arrendamiento SAT 606.
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={`${TH} text-left rounded-tl-[1.25rem]`}
                    >
                      Aspecto
                    </th>
                    {ARRENDAMIENTO_VS_DEDUCCION.columnas.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`${TH} text-left ${
                          i === ARRENDAMIENTO_VS_DEDUCCION.columnas.length - 1
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
                  {ARRENDAMIENTO_VS_DEDUCCION.filas.map((fila) => (
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

      <section id="simulador" className={SECTION}>
        <div className={WRAP}>
          <div
            className={`${CARD} px-5 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
          >
            <div>
              <p className={EYEBROW}>Pruébalo con tus números</p>
              <h2 className={`${H2} max-w-md`}>
                Simula la factura de una renta
              </h2>
              <p className="mt-1.5 text-[15px] text-slate-600 max-w-lg">
                La calculadora arma el CFDI de casa habitación, amueblada o
                local comercial, con IVA y retenciones si el inquilino es
                persona moral. Es informativa; el impuesto lo confirma tu
                contador.
              </p>
            </div>
            <Link
              href="/herramientas/calculadora-facturacion"
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#3C1A16] text-white text-[15px] font-semibold hover:bg-[#271210] transition"
            >
              Abrir calculadora
            </Link>
          </div>
        </div>
      </section>

      <section id="cumplimiento" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Qué hacemos en RDC</p>
          <h2 className={H2}>Tu cumplimiento, mes con mes</h2>
          <div className={`mt-4 ${CARD}`}>
            <ul className={LISTA_INSET}>
              {regimen.queHacemos.map((item, i) => (
                <li key={item.titulo} className="py-3.5 flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#3C1A16] text-white text-[13px] font-bold flex items-center justify-center">
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
                  <li key={item} className="flex gap-2 text-[15px] text-slate-700">
                    <span className="text-emerald-600 shrink-0 font-semibold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.25rem] bg-[#3C1A16] text-white px-4 sm:px-5 py-4">
              <p className="text-[13px] font-semibold text-[#E8895A]">
                En tu portal
              </p>
              <ul className="mt-3 space-y-2">
                {regimen.portal.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[15px] text-white/85 leading-snug"
                  >
                    <span className="text-[#E8895A] shrink-0 font-semibold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 sm:py-6">
        <PortalPreview fullBleed compact tono="barro" />
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
                  <span className="w-1.5 shrink-0 bg-[#E8895A]" aria-hidden />
                  <div className="min-w-0 px-3.5 py-3">
                    <p className="text-[13px] font-bold text-[#3C1A16] leading-snug">
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
            <div className="mt-3 flex min-h-0 flex-col rounded-[1.25rem] bg-[#3C1A16] px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold text-[#E8895A]">
                {regimen.titulo}
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-white/85 leading-snug">
                <li className="flex gap-2">
                  <span className="text-[#E8895A] shrink-0">✓</span>
                  Respuesta en 24 h
                </li>
                <li className="flex gap-2">
                  <span className="text-[#E8895A] shrink-0">✓</span>
                  Portal del cliente incluido
                </li>
                <li className="flex gap-2">
                  <span className="text-[#E8895A] shrink-0">✓</span>
                  Sin compromiso
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  href="/cotizar"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#3C1A16] hover:bg-white/90 transition"
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
            <p className={`${EYEBROW} mb-2`}>Otros regímenes persona física</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-black/[0.04]">
              {otros.map((slug, i) => {
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
