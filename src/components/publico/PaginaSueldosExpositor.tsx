import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenIcon from "@/components/publico/RegimenIcon";
import SueldosDeduccionesPersonales from "@/components/publico/SueldosDeduccionesPersonales";
import {
  SueldosNominaAnualPills,
  SueldosSeccionesNav,
} from "@/components/publico/SueldosExpositorPills";
import { TARIFA_ISR_MENSUAL_2026 } from "@/lib/fiscal/isr";
import { UMA_VIGENTE } from "@/lib/fiscal/uma";
import { fmtMxn } from "@/lib/fiscal/resico";
import { isrSobreUtilidad } from "@/lib/pfae-expositor";
import {
  SUELDOS_COLEGIATURAS_TOPES,
  SUELDOS_CRITERIOS,
  SUELDOS_FAQ,
  SUELDOS_PASOS_ANUAL,
  SUELDOS_VS_ANUAL,
} from "@/lib/sueldos-expositor";
import { tonoRegimen } from "@/lib/regimen-tonos";
import {
  REGIMENES_SERVICIO,
  SLUGS_REGIMEN_PF,
  type RegimenServicio,
} from "@/lib/servicios-regimenes";

const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-[#1C2533]";
const H2 = "mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900";
const CARD = "rounded-[1.25rem] bg-white overflow-hidden";
const TH =
  "px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white bg-[#1C2533] border-b-2 border-[#9EC9E0]";
const SECTION = "scroll-mt-32 py-5 sm:py-6";
const LISTA_INSET = "mx-4 sm:mx-5 divide-y divide-slate-100";

export default function PaginaSueldosExpositor({
  regimen,
}: {
  regimen: RegimenServicio;
}) {
  const tono = tonoRegimen("sueldos-salarios");
  const otros = SLUGS_REGIMEN_PF.filter((s) => s !== "sueldos-salarios").slice(
    0,
    4
  );

  const ejemploSueldo = 40_000;
  const ejemploIsrMes = isrSobreUtilidad(
    ejemploSueldo,
    TARIFA_ISR_MENSUAL_2026.renglones
  ).isr;
  const ejemploAnual = ejemploSueldo * 12;

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
                  <dt className="text-sm text-white/70">Retención del patrón</dt>
                  <dd className="text-2xl font-black tabular-nums">Mensual</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">IVA en el sueldo</dt>
                  <dd className="text-2xl font-black tabular-nums">No</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-white/70">Anual si ganas</dt>
                  <dd className="text-2xl font-black tabular-nums">&gt; $400 mil</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <SueldosSeccionesNav />

      <section id="cuanto-se-paga" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Mecánica del régimen</p>
          <h2 className={H2}>¿Cómo se paga el ISR en 605?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            El sueldo no se declara el día 17. El patrón retiene cada mes; tú
            cierras el año en abril, y solo si la ley te obliga o quieres
            recuperar saldo a favor. El IVA no entra: el salario no lo causa.
          </p>

          <div className="mt-5">
            <SueldosNominaAnualPills
              nomina={
                <div>
                  <p className="px-4 sm:px-5 pt-4 pb-3 text-[13px] text-slate-500 leading-snug">
                    Cada periodo el patrón suma percepciones gravadas, aplica la
                    tarifa del artículo 96 y retiene. Eso ya se enteró al SAT.
                    No lo vuelves a pagar el día 17.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 sm:px-5 pb-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A6A88]">
                        Lo que retiene
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Tarifa art. 96 sobre lo gravado
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Sueldo, comisiones gravadas y otras percepciones. El
                        aguinaldo y la PTU tienen una porción exenta.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A6A88]">
                        El documento
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        CFDI de nómina
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Ahí ves gravado, exento y retenido. Es el insumo de tu
                        anual; no es una factura de IVA.
                      </p>
                    </div>
                  </div>
                  <p className="px-4 sm:px-5 pb-3 text-[12px] text-slate-500 leading-relaxed">
                    Un mes con {fmtMxn(ejemploSueldo)} de sueldo gravado: ISR
                    retenido aprox. {fmtMxn(ejemploIsrMes)} según la tarifa
                    mensual. Si el año cierra en {fmtMxn(ejemploAnual)}, ya
                    rebasaste los $400,000 y la anual es tuya.
                  </p>
                  <div className="mx-4 sm:mx-5 mb-1 rounded-2xl bg-[#1C2533]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A6A88]">
                      Cómo se calcula
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-slate-800">
                      ISR retenido = tarifa art. 96 sobre percepciones gravadas
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      La retención no es un gasto tuyo ni una deducción
                      personal: es un anticipo. En abril se acredita contra el
                      ISR del año.
                    </p>
                  </div>
                  <div className="mx-4 sm:mx-5 border-t border-slate-100 py-4">
                    <p className="rounded-2xl bg-[#9EC9E0]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                      Tú no presentas ISR de sueldos el{" "}
                      <span className="text-[#1C2533]">día 17</span>. Eso lo
                      hace el patrón.
                    </p>
                  </div>
                </div>
              }
              anual={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    La declaración anual de persona física se presenta en
                    abril. El patrón no la sustituye cuando la ley te obliga, o
                    cuando quieres aplicar deducciones personales.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A6A88]">
                        Obligatoria si
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Dos patrones o más de $400 mil
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        También si tuviste rentas u otros ingresos, o si el
                        patrón no hizo el cálculo anual (entrada o salida a
                        medio año).
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A6A88]">
                        Voluntaria si
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Quieres saldo a favor
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Gastos médicos, hipotecarios o colegiaturas con CFDI
                        pueden devolver ISR que el patrón ya retuvo.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#1C2533]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A6A88]">
                      Cómo se cierra el año
                    </p>
                    <ol className="mt-3 space-y-3">
                      {SUELDOS_PASOS_ANUAL.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#1C2533] text-white text-[13px] font-bold flex items-center justify-center">
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

                  <p className="rounded-2xl bg-[#9EC9E0]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    La anual de sueldos se presenta en{" "}
                    <span className="text-[#1C2533]">abril</span>, no el día 17.
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
          <h2 className={H2}>¿Quién entra a 605 y qué le toca?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Si te pagan por subordinación o asimilado, este es tu régimen de
            partida. La pregunta del año no es 605 vs 612: es si el patrón ya
            cerró, o si tú tienes que declarar en abril.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUELDOS_CRITERIOS.map((c) => (
              <div key={c.n} className={`${CARD} px-4 py-3.5`}>
                <p className="text-[11px] font-black tabular-nums text-[#3A6A88]">
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
            LISR arts. 94 a 99 y 151 · clave SAT 605
          </p>
        </div>
      </section>

      <section id="deducciones" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Art. 151 LISR</p>
          <h2 className={H2}>Deducciones personales</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Bajan la base en abril, no en la nómina. El patrón no las aplica.
            Toca un recuadro para ver de qué se trata y cómo se calcula el
            tope de cada una.
          </p>
          <div className="mt-4">
            <SueldosDeduccionesPersonales
              anioUma={UMA_VIGENTE.anio}
              cincoUmaFmt={fmtMxn(UMA_VIGENTE.anual * 5)}
              umaAnualFmt={fmtMxn(UMA_VIGENTE.anual)}
              colegiaturas={SUELDOS_COLEGIATURAS_TOPES.map((n) => ({
                nivel: n.nivel,
                topeFmt: fmtMxn(n.tope),
              }))}
            />
          </div>
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
              {SUELDOS_FAQ.map((f) => (
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
          <div className="mt-4 rounded-[1.25rem] bg-[#1C2533] px-5 py-4 text-white">
            <p className="text-[13px] font-semibold text-[#9EC9E0]">
              Recomendación profesional
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
              Usa esta guía como orientación inicial. En RDC revisamos tus CFDI
              de nómina, las retenciones de cada patrón y las deducciones
              personales que sí puedes aplicar antes de presentar.
            </p>
          </div>
        </div>
      </section>

      <section id="comparativa" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Comparativa</p>
          <h2 className={H2}>{SUELDOS_VS_ANUAL.titulo}</h2>
          <div className={`mt-5 ${CARD}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <caption className="sr-only">
                  Comparativa entre la retención mensual del patrón y la
                  declaración anual del trabajador en el régimen 605.
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={`${TH} text-left rounded-tl-[1.25rem]`}
                    >
                      Aspecto
                    </th>
                    {SUELDOS_VS_ANUAL.columnas.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`${TH} text-left ${
                          i === SUELDOS_VS_ANUAL.columnas.length - 1
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
                  {SUELDOS_VS_ANUAL.filas.map((fila) => (
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
                Consulta la tarifa que usa tu patrón
              </h2>
              <p className="mt-1.5 text-[15px] text-slate-600 max-w-lg">
                Las tablas del artículo 96 son las mismas con las que te
                retienen cada mes. Es informativa; el impuesto anual lo
                confirma tu contador.
              </p>
            </div>
            <Link
              href="/herramientas/isr-2026"
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#1C2533] text-white text-[15px] font-semibold hover:bg-[#121820] transition"
            >
              Ver tarifas ISR
            </Link>
          </div>
        </div>
      </section>

      <section id="cumplimiento" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Qué hacemos en RDC</p>
          <h2 className={H2}>Tu declaración, sin sorpresas</h2>
          <div className={`mt-4 ${CARD}`}>
            <ul className={LISTA_INSET}>
              {regimen.queHacemos.map((item, i) => (
                <li key={item.titulo} className="py-3.5 flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#1C2533] text-white text-[13px] font-bold flex items-center justify-center">
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
            <div className="rounded-[1.25rem] bg-[#1C2533] text-white px-4 sm:px-5 py-4">
              <p className="text-[13px] font-semibold text-[#9EC9E0]">
                En tu portal
              </p>
              <ul className="mt-3 space-y-2">
                {regimen.portal.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[15px] text-white/85 leading-snug"
                  >
                    <span className="text-[#9EC9E0] shrink-0 font-semibold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 sm:py-6">
        <PortalPreview fullBleed compact tono="pizarra" />
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
                  <span className="w-1.5 shrink-0 bg-[#9EC9E0]" aria-hidden />
                  <div className="min-w-0 px-3.5 py-3">
                    <p className="text-[13px] font-bold text-[#1C2533] leading-snug">
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
            <div className="mt-3 flex min-h-0 flex-col rounded-[1.25rem] bg-[#1C2533] px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold text-[#9EC9E0]">
                {regimen.titulo}
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-white/85 leading-snug">
                <li className="flex gap-2">
                  <span className="text-[#9EC9E0] shrink-0">✓</span>
                  Respuesta en 24 h
                </li>
                <li className="flex gap-2">
                  <span className="text-[#9EC9E0] shrink-0">✓</span>
                  Portal del cliente incluido
                </li>
                <li className="flex gap-2">
                  <span className="text-[#9EC9E0] shrink-0">✓</span>
                  Sin compromiso
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  href="/cotizar"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1C2533] hover:bg-white/90 transition"
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
