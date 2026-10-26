import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenIcon from "@/components/publico/RegimenIcon";
import {
  PlataformasIsrIvaPills,
  PlataformasSeccionesNav,
} from "@/components/publico/PlataformasExpositorPills";
import { fmtMxn } from "@/lib/fiscal/resico";
import {
  PLATAFORMAS_CRITERIOS,
  PLATAFORMAS_GRUPOS,
  PLATAFORMAS_FAQ,
  PLATAFORMAS_PASOS_ISR,
  PLATAFORMAS_VS_PAGOS,
  RETENCIONES_PLATAFORMAS,
} from "@/lib/plataformas-expositor";
import { tonoRegimen } from "@/lib/regimen-tonos";
import {
  REGIMENES_SERVICIO,
  SLUGS_REGIMEN_PF,
  type RegimenServicio,
} from "@/lib/servicios-regimenes";

const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-[#16351A]";
const H2 = "mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900";
const CARD = "rounded-[1.25rem] bg-white overflow-hidden";
const TH =
  "px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white bg-[#16351A] border-b-2 border-[#D2F25A]";
const SECTION = "scroll-mt-32 py-5 sm:py-6";
const LISTA_INSET = "mx-4 sm:mx-5 divide-y divide-slate-100";

export default function PaginaPlataformasExpositor({
  regimen,
}: {
  regimen: RegimenServicio;
}) {
  const tono = tonoRegimen("plataformas-tecnologicas");
  const otros = SLUGS_REGIMEN_PF.filter((s) => s !== "plataformas-tecnologicas").slice(
    0,
    4
  );

  const ejemploIngreso = 40_000;
  const ejemploTasa = 0.025;
  const ejemploIsrRetenido = Math.round(ejemploIngreso * ejemploTasa * 100) / 100;
  const ejemploIva = Math.round(ejemploIngreso * 0.16 * 100) / 100;
  const ejemploIvaRetenido = Math.round(ejemploIva * 0.5 * 100) / 100;
  const ejemploIvaAcreditable = 960;
  const ejemploIvaCargo =
    Math.round((ejemploIva - ejemploIvaAcreditable - ejemploIvaRetenido) * 100) /
    100;

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
                  <dt className="text-sm text-white/70">Pagos definitivos</dt>
                  <dd className="text-2xl font-black tabular-nums">$300 K</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">ISR con RFC</dt>
                  <dd className="text-2xl font-black tabular-nums">2.50%</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-white/70">IVA que retiene la app</dt>
                  <dd className="text-2xl font-black tabular-nums">50%</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <PlataformasSeccionesNav />

      <section id="cuanto-se-paga" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Mecánica mensual</p>
          <h2 className={H2}>¿Cuánto se paga cada mes?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            La plataforma retiene ISR e IVA en cada depósito. Hay dos caminos:
            pagos definitivos (la retención cierra el impuesto) o pagos
            provisionales (la retención es un anticipo y tú declaras). El IVA
            no se mezcla con el ISR.
          </p>

          <div className="mt-5">
            <PlataformasIsrIvaPills
              isr={
                <div>
                  <p className="px-4 sm:px-5 pt-4 pb-3 text-[13px] text-slate-500 leading-snug">
                    En 2026 la retención de ISR con RFC se unificó en 2.50% para
                    ingresos por Uber, DiDi, Rappi, Mercado Libre y similares.
                    Sin RFC, la plataforma retiene 20%. Fuente: LISR arts. 113-A
                    a 113-D y RMF 2026.
                  </p>
                  <div className="px-4 sm:px-5 pb-3">
                    <div className="overflow-hidden rounded-xl ring-1 ring-black/[0.04]">
                      <table className="w-full text-[14px] sm:text-[15px]">
                        <caption className="sr-only">
                          Retenciones de ISR que aplica la plataforma tecnológica.
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col" className={`${TH} text-left rounded-tl-xl`}>
                              Supuesto
                            </th>
                            <th
                              scope="col"
                              className={`${TH} text-right rounded-tr-xl`}
                            >
                              ISR retenido
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {RETENCIONES_PLATAFORMAS.map((fila) => (
                            <tr
                              key={fila.supuesto}
                              className={fila.destacado ? "bg-[#D2F25A]/20" : "bg-white"}
                            >
                              <td className="px-3 sm:px-4 py-2.5">
                                <span className="block font-semibold text-slate-900">
                                  {fila.supuesto}
                                </span>
                                <span className="block text-[13px] text-slate-500">
                                  {fila.detalle}
                                </span>
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 text-right">
                                <span
                                  className={`inline-block rounded-md px-2 py-0.5 text-[13px] font-bold tabular-nums ${
                                    fila.destacado
                                      ? "bg-[#D2F25A] text-[#16351A]"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {fila.tasa}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="px-4 sm:px-5 pb-3 text-[12px] text-slate-500 leading-relaxed">
                    El renglón marcado con {fmtMxn(ejemploIngreso)} cobrados vía
                    app: ISR retenido {fmtMxn(ejemploIsrRetenido)}. Ese monto ya
                    lo enteró la plataforma; en tu declaración se acredita, no
                    se vuelve a pagar.
                  </p>
                  <div className="mx-4 sm:mx-5 mb-1 rounded-2xl bg-[#16351A]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2F7A24]">
                      Cómo se calcula y dónde se lee
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-slate-800">
                      ISR retenido = ingreso cobrado × 2.50% (con RFC) o × 20%
                      (sin RFC)
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      Ese cálculo lo hace la plataforma en cada depósito. Tú lo
                      lees en la constancia de retenciones (el CFDI que emite la
                      app): ingreso bruto, ISR retenido e IVA retenido. En
                      provisionales se acredita el día 17; en definitivos esa
                      retención ya cerró el impuesto.
                    </p>
                  </div>
                  <div className="mx-4 sm:mx-5 border-t border-slate-100 py-4">
                    <p className="text-[13px] font-semibold text-slate-500">
                      Cómo se cierra el mes
                    </p>
                    <ol className="mt-3 space-y-3">
                      {PLATAFORMAS_PASOS_ISR.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#16351A] text-white text-[13px] font-bold flex items-center justify-center">
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
                    <p className="mt-4 rounded-2xl bg-[#D2F25A]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                      Si vas por provisionales: declaración a más tardar el{" "}
                      <span className="text-[#16351A]">día 17</span>. En
                      definitivos, la retención de la app ya cerró el mes.
                    </p>
                  </div>
                </div>
              }
              iva={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    El IVA no se mezcla con el ISR. La app retiene la mitad del
                    IVA en el depósito; tú declaras el flujo completo:
                    trasladado, acreditable y lo que ya enteró la plataforma.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2F7A24]">
                        IVA trasladado
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        El 16% de cada viaje o venta
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Lo recauda la plataforma en el precio. No es ingreso
                        tuyo. Si cobraste {fmtMxn(ejemploIngreso)}, el IVA
                        trasladado es {fmtMxn(ejemploIva)}.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2F7A24]">
                        IVA que retiene la app
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        El 50% — normalmente 8%
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        La plataforma entera la mitad al SAT y te lo documenta
                        en el CFDI de retenciones. Tú lo acreditas; no lo vuelves
                        a pagar.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#16351A]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2F7A24]">
                      Comisiones de la app
                    </p>
                    <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                      Su IVA sí se acredita si hay CFDI
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      Uber, DiDi o Mercado Libre te descuentan comisión. Ese
                      IVA se acredita contra el IVA a cargo, no contra el ISR.
                      Sin factura de la plataforma, el descuento del depósito no
                      cuenta.
                    </p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-800">
                      IVA a cargo = trasladado − acreditable − retenido por la app
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-slate-500">
                        Ejemplo con {fmtMxn(ejemploIngreso)}
                      </p>
                      <dl className="mt-3 space-y-2 text-[14px]">
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">IVA trasladado 16%</dt>
                          <dd className="font-bold tabular-nums text-slate-900">
                            {fmtMxn(ejemploIva)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">Acreditable (comisiones)</dt>
                          <dd className="font-bold tabular-nums text-slate-900">
                            − {fmtMxn(ejemploIvaAcreditable)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">Retenido por la app (50%)</dt>
                          <dd className="font-bold tabular-nums text-slate-900">
                            − {fmtMxn(ejemploIvaRetenido)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-slate-200/80 pt-2">
                          <dt className="font-semibold text-slate-800">IVA a cargo</dt>
                          <dd className="font-black tabular-nums text-slate-900">
                            {fmtMxn(ejemploIvaCargo)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="rounded-2xl bg-amber-50 px-4 py-3.5">
                      <p className="text-[15px] font-bold text-amber-950">
                        El depósito ya viene neto
                      </p>
                      <p className="mt-1.5 text-[14px] text-amber-950/80 leading-relaxed">
                        Lo que te cae en la cuenta no es tu ingreso fiscal. El
                        ISR de este ejemplo ya trajo {fmtMxn(ejemploIsrRetenido)}{" "}
                        retenidos. Declarar sobre el neto es el error más común
                        — y el que dispara requerimientos.
                      </p>
                    </div>
                  </div>

                  <p className="rounded-2xl bg-[#D2F25A]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    El IVA se declara junto con el ISR, a más tardar el{" "}
                    <span className="text-[#16351A]">día 17</span>.
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
          <h2 className={H2}>¿Quién entra a 625 y cómo opera?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Si cobras en Uber, DiDi, inDrive, Rappi, YouTube u otra app de las
            de abajo, este es tu régimen de partida. La pregunta del mes no es
            625 vs otro régimen: es si esas retenciones ya son pago definitivo o
            todavía son provisionales.
          </p>

          <div className="mt-4 rounded-[1.25rem] bg-white px-4 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2F7A24]">
              Plataformas que retienen
            </p>
            <p className="mt-1 text-[15px] font-semibold text-slate-800">
              Entra, identifica la tuya y revisa ISR, IVA y la constancia.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
              {PLATAFORMAS_GRUPOS.map((grupo) => (
                <div key={grupo.label}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {grupo.label}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-3">
                    {grupo.apps.map((app) => (
                      <li key={app.nombre} className="group relative">
                        <img
                          src={app.src}
                          alt={app.nombre}
                          width={44}
                          height={44}
                          className="size-11 rounded-[22%] object-cover shadow-[0_1px_2px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.06]"
                        />
                        <p className="mt-1 max-w-11 text-center text-[10px] font-medium leading-tight text-slate-600 line-clamp-2">
                          {app.nombre}
                        </p>
                        <div
                          aria-hidden
                          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-30 w-56 rounded-2xl bg-[#16351A] px-3.5 py-3 text-left text-white opacity-0 shadow-[0_12px_28px_rgba(15,23,42,0.22)] ring-1 ring-white/10 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 group-last:left-auto group-last:right-0"
                        >
                          <p className="text-[13px] font-bold">{app.nombre}</p>
                          <p className="mt-1 text-[12px] leading-snug text-white/80">
                            {app.hover}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-slate-500 leading-relaxed">
              También cubre apps equivalentes: si el pago te lo hace la
              plataforma y no tu factura propia, las reglas de retención son las
              mismas.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLATAFORMAS_CRITERIOS.map((c) => (
              <div key={c.n} className={`${CARD} px-4 py-3.5`}>
                <p className="text-[11px] font-black tabular-nums text-[#2F7A24]">
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
            LISR arts. 113-A a 113-D · clave SAT 625
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
              {PLATAFORMAS_FAQ.map((f) => (
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
          <div className="mt-4 rounded-[1.25rem] bg-[#16351A] px-5 py-4 text-white">
            <p className="text-[13px] font-semibold text-[#D2F25A]">
              Recomendación profesional
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
              Usa esta guía como orientación inicial. En RDC vemos si calificas
              a pagos definitivos o si hay que ir por provisionales — con tus
              CFDI de apps, el tope de $300 K y las retenciones del mes.
            </p>
          </div>
        </div>
      </section>

      <section id="comparativa" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Comparativa</p>
          <h2 className={H2}>{PLATAFORMAS_VS_PAGOS.titulo}</h2>
          <div className={`mt-5 ${CARD}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <caption className="sr-only">
                  Comparativa entre pagos definitivos y pagos provisionales en
                  el régimen de plataformas tecnológicas SAT 625.
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={`${TH} text-left rounded-tl-[1.25rem]`}
                    >
                      Aspecto
                    </th>
                    {PLATAFORMAS_VS_PAGOS.columnas.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`${TH} text-left ${
                          i === PLATAFORMAS_VS_PAGOS.columnas.length - 1
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
                  {PLATAFORMAS_VS_PAGOS.filas.map((fila) => (
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
                Simula ISR e IVA de un mes de app
              </h2>
              <p className="mt-1.5 text-[15px] text-slate-600 max-w-lg">
                La calculadora te ayuda a ver el efecto de retenciones y
                comisiones sobre un ingreso cobrado. Es informativa; el
                impuesto definitivo lo confirma tu contador.
              </p>
            </div>
            <Link
              href="/herramientas/calculadora-facturacion"
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#16351A] text-white text-[15px] font-semibold hover:bg-[#0E2412] transition"
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
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#16351A] text-white text-[13px] font-bold flex items-center justify-center">
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
            <div className="rounded-[1.25rem] bg-[#16351A] text-white px-4 sm:px-5 py-4">
              <p className="text-[13px] font-semibold text-[#D2F25A]">
                En tu portal
              </p>
              <ul className="mt-3 space-y-2">
                {regimen.portal.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[15px] text-white/85 leading-snug"
                  >
                    <span className="text-[#D2F25A] shrink-0 font-semibold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 sm:py-6">
        <PortalPreview fullBleed compact tono="bosque" />
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
                  <span className="w-1.5 shrink-0 bg-[#D2F25A]" aria-hidden />
                  <div className="min-w-0 px-3.5 py-3">
                    <p className="text-[13px] font-bold text-[#16351A] leading-snug">
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
            <div className="mt-3 flex min-h-0 flex-col rounded-[1.25rem] bg-[#16351A] px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold text-[#D2F25A]">
                {regimen.titulo}
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-white/85 leading-snug">
                <li className="flex gap-2">
                  <span className="text-[#D2F25A] shrink-0">✓</span>
                  Respuesta en 24 h
                </li>
                <li className="flex gap-2">
                  <span className="text-[#D2F25A] shrink-0">✓</span>
                  Portal del cliente incluido
                </li>
                <li className="flex gap-2">
                  <span className="text-[#D2F25A] shrink-0">✓</span>
                  Sin compromiso
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  href="/cotizar"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#16351A] hover:bg-white/90 transition"
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
