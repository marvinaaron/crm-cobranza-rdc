import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenIcon from "@/components/publico/RegimenIcon";
import {
  PmMecanicaPills,
  RegimenGeneralSeccionesNav,
} from "@/components/publico/RegimenGeneralExpositorPills";
import { fmtMxn } from "@/lib/fiscal/resico";
import {
  PM_CRITERIOS,
  PM_FAQ,
  PM_PASOS_ISR,
  PM_PASOS_IVA,
  PM_PASOS_RETENCIONES,
  PM_RETENCIONES,
  PM_VS_IVA,
} from "@/lib/regimen-general-expositor";
import { tonoRegimen } from "@/lib/regimen-tonos";
import {
  REGIMENES_SERVICIO,
  type RegimenServicio,
} from "@/lib/servicios-regimenes";

const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-[#161B45]";
const H2 = "mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900";
const CARD = "rounded-[1.25rem] bg-white overflow-hidden";
const TH =
  "px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white bg-[#161B45] border-b-2 border-[#9AA8FF]";
const SECTION = "scroll-mt-32 py-5 sm:py-6";
const LISTA_INSET = "mx-4 sm:mx-5 divide-y divide-slate-100";

const EJEMPLO_INGRESOS = 1_000_000;
const EJEMPLO_COEF = 0.2;
const EJEMPLO_UTILIDAD = EJEMPLO_INGRESOS * EJEMPLO_COEF;
const EJEMPLO_ISR = EJEMPLO_UTILIDAD * 0.3;
const EJEMPLO_ENTERADO = 40_000;
const EJEMPLO_A_CARGO = EJEMPLO_ISR - EJEMPLO_ENTERADO;

const OTROS = [
  "fines-no-lucrativos",
  "sueldos-salarios",
  "resico",
  "actividades-empresariales",
] as const;

export default function PaginaRegimenGeneralExpositor({
  regimen,
}: {
  regimen: RegimenServicio;
}) {
  const tono = tonoRegimen("regimen-general");

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
                  <dd className="text-2xl font-black tabular-nums">
                    Facturado
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">IVA</dt>
                  <dd className="text-2xl font-black tabular-nums">Cobrado</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-white/70">Anual</dt>
                  <dd className="text-2xl font-black tabular-nums">Marzo</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <RegimenGeneralSeccionesNav />

      <section id="cuanto-se-paga" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Mecánica del régimen</p>
          <h2 className={H2}>¿Cómo se pagan ISR, IVA y retenciones?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            El ISR de la persona moral nace con lo facturado, aunque no hayas
            cobrado. El IVA no funciona así: nace cuando cobras, y la DIOT
            viaja con él. Si pagas a terceros, retienes. La pregunta del año
            no es 601 vs 612: es no mezclar esas tres bases.
          </p>

          <div className="mt-5">
            <PmMecanicaPills
              isr={
                <div>
                  <p className="px-4 sm:px-5 pt-4 pb-3 text-[13px] text-slate-500 leading-snug">
                    Facturaste y el cliente no pagó: ese ingreso ya entra al
                    ISR. El 30% no es sobre el total facturado; es sobre la
                    utilidad. Cada mes usas el coeficiente; en marzo, la
                    utilidad real.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 sm:px-5 pb-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                        Cada mes
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Coeficiente sobre lo facturado
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Ingresos nominales acumulados × coeficiente del año
                        pasado × 30%, menos lo ya enterado. Día 17.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                        En marzo
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        30% sobre la utilidad real
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Se acreditan los provisionales. Ahí se actualizan
                        CUFIN y CUCA. Abril es de persona física.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 sm:px-5 pb-3">
                    <div className="rounded-2xl bg-[#E8EBFF] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                        CUFIN · Art. 77
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Utilidades que ya pagaron ISR
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Al repartir dividendos a una persona física se retiene
                        el 10% extra. Si no hay saldo en CUFIN, la sociedad
                        puede deber ISR de más.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#E8EBFF] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                        CUCA · Art. 78
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Aportaciones de los socios
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Se actualiza con inflación. Una reducción de capital
                        que no rebase la CUCA no es dividendo: es devolución
                        de aportaciones.
                      </p>
                    </div>
                  </div>
                  <div className="px-4 sm:px-5 pb-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                        Ejemplo · coeficiente 20%
                      </p>
                      <p className="mt-1.5 text-[15px] text-slate-700 leading-relaxed">
                        Si lo facturado de enero al mes fuera{" "}
                        <span className="font-semibold text-slate-900">
                          {fmtMxn(EJEMPLO_INGRESOS)}
                        </span>{" "}
                        y el coeficiente 20%, la utilidad estimada es{" "}
                        <span className="font-semibold text-slate-900">
                          {fmtMxn(EJEMPLO_UTILIDAD)}
                        </span>
                        . El 30% da {fmtMxn(EJEMPLO_ISR)}. Si ya enteraste{" "}
                        {fmtMxn(EJEMPLO_ENTERADO)}, el mes queda en{" "}
                        {fmtMxn(EJEMPLO_A_CARGO)}. Da igual si de ese millón
                        ya cobraste o no.
                      </p>
                    </div>
                  </div>
                  <div className="mx-4 sm:mx-5 mb-1 rounded-2xl bg-[#161B45]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                      Cómo se cierra el ISR
                    </p>
                    <ol className="mt-3 space-y-3">
                      {PM_PASOS_ISR.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#161B45] text-white text-[13px] font-bold flex items-center justify-center">
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
                  <div className="mx-4 sm:mx-5 border-t border-slate-100 py-4">
                    <p className="rounded-2xl bg-[#9AA8FF]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                      El ISR de 601 se calcula sobre lo{" "}
                      <span className="text-[#161B45]">facturado</span>, no
                      sobre lo cobrado.
                    </p>
                  </div>
                </div>
              }
              iva={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    El IVA no copia al ISR. Si facturaste y no cobraste, ese
                    IVA todavía no se causa. Si cobraste, sí, aunque el CFDI
                    sea de un mes anterior.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                        Trasladado
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        16% de lo que ya te pagaron
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Art. 1-B LIVA: se considera cobrado cuando recibes el
                        pago. No cuando timbras el CFDI.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                        Acreditable
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        El IVA que tú ya pagaste
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Proveedores con CFDI y pago. Sin los dos, no se
                        acredita contra el trasladado.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#E8EBFF] px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                      DIOT · con el IVA, no con el ISR
                    </p>
                    <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                      Operaciones con terceros
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      La Declaración Informativa de Operaciones con Terceros
                      le dice al SAT con quién compraste o te prestaron
                      servicio. Sirve para cruzar el IVA acreditable. Se
                      presenta el mismo día 17 que el IVA, con otra base que
                      el ISR.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#161B45]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                      Cómo se cierra el IVA
                    </p>
                    <ol className="mt-3 space-y-3">
                      {PM_PASOS_IVA.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#161B45] text-white text-[13px] font-bold flex items-center justify-center">
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
                  <p className="rounded-2xl bg-[#9AA8FF]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    Facturaste y no cobraste: hay ISR y{" "}
                    <span className="text-[#161B45]">todavía no hay IVA</span>
                    .
                  </p>
                </div>
              }
              retenciones={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    La persona moral no solo paga sus impuestos: retiene los
                    de quien le presta el servicio, le renta o trabaja en la
                    nómina. Tres familias, un mismo día 17.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PM_RETENCIONES.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                          {r.corto} · {r.fundamento}
                        </p>
                        <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                          {r.titulo}
                        </p>
                        <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                          {r.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-[#161B45]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A48B0]">
                      Cómo se enteran
                    </p>
                    <ol className="mt-3 space-y-3">
                      {PM_PASOS_RETENCIONES.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#161B45] text-white text-[13px] font-bold flex items-center justify-center">
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
                  <p className="rounded-2xl bg-[#9AA8FF]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    El sueldo no lleva IVA. La retención de honorarios y la
                    de nómina{" "}
                    <span className="text-[#161B45]">no se mezclan</span>.
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
          <h2 className={H2}>¿Quién entra a 601 y qué le toca?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Si la sociedad es lucrativa, este es el régimen de partida. La
            pregunta del año no es 601 vs 612: es no mezclar ISR de lo
            facturado, IVA de lo cobrado y retenciones de lo que tú pagas.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PM_CRITERIOS.map((c) => (
              <div key={c.n} className={`${CARD} px-4 py-3.5`}>
                <p className="text-[11px] font-black tabular-nums text-[#3A48B0]">
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
            LISR arts. 9, 14, 17, 77 y 78 · LIVA art. 1-B · clave SAT 601
          </p>
        </div>
      </section>

      <section id="preguntas" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Antes de elegirlo</p>
          <h2 className={H2}>Preguntas frecuentes</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Respuestas directas para decidir con el contador, no para
            memorizar el Título II.
          </p>
          <dl className={`mt-4 ${CARD}`}>
            <div className={LISTA_INSET}>
              {PM_FAQ.map((f) => (
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
          <div className="mt-4 rounded-[1.25rem] bg-[#161B45] px-5 py-4 text-white">
            <p className="text-[13px] font-semibold text-[#9AA8FF]">
              Recomendación profesional
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
              Usa esta guía como orientación inicial. En RDC separamos lo
              facturado de lo cobrado, armamos ISR, IVA, DIOT y retenciones,
              y cerramos CUFIN y CUCA en marzo.
            </p>
          </div>
        </div>
      </section>

      <section id="comparativa" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Comparativa</p>
          <h2 className={H2}>{PM_VS_IVA.titulo}</h2>
          <div className={`mt-5 ${CARD}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <caption className="sr-only">
                  Comparativa entre el ISR sobre lo facturado y el IVA sobre
                  lo cobrado en el régimen 601, incluida la DIOT.
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={`${TH} text-left rounded-tl-[1.25rem]`}
                    >
                      Aspecto
                    </th>
                    {PM_VS_IVA.columnas.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`${TH} text-left ${
                          i === PM_VS_IVA.columnas.length - 1
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
                  {PM_VS_IVA.filas.map((fila) => (
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
          <h2 className={H2}>Tu empresa, sin sorpresas</h2>
          <div className={`mt-4 ${CARD}`}>
            <ul className={LISTA_INSET}>
              {regimen.queHacemos.map((item, i) => (
                <li key={item.titulo} className="py-3.5 flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#161B45] text-white text-[13px] font-bold flex items-center justify-center">
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
            <div className="rounded-[1.25rem] bg-[#161B45] text-white px-4 sm:px-5 py-4">
              <p className="text-[13px] font-semibold text-[#9AA8FF]">
                En tu portal
              </p>
              <ul className="mt-3 space-y-2">
                {regimen.portal.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[15px] text-white/85 leading-snug"
                  >
                    <span className="text-[#9AA8FF] shrink-0 font-semibold">
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
        <PortalPreview fullBleed compact tono="indigo" />
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
                  <span className="w-1.5 shrink-0 bg-[#9AA8FF]" aria-hidden />
                  <div className="min-w-0 px-3.5 py-3">
                    <p className="text-[13px] font-bold text-[#161B45] leading-snug">
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
            <div className="mt-3 flex min-h-0 flex-col rounded-[1.25rem] bg-[#161B45] px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold text-[#9AA8FF]">
                {regimen.titulo}
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-white/85 leading-snug">
                <li className="flex gap-2">
                  <span className="text-[#9AA8FF] shrink-0">✓</span>
                  Respuesta en 24 h
                </li>
                <li className="flex gap-2">
                  <span className="text-[#9AA8FF] shrink-0">✓</span>
                  Portal del cliente incluido
                </li>
                <li className="flex gap-2">
                  <span className="text-[#9AA8FF] shrink-0">✓</span>
                  Sin compromiso
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  href="/cotizar"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#161B45] hover:bg-white/90 transition"
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
