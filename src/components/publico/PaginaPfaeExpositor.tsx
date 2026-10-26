import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenIcon from "@/components/publico/RegimenIcon";
import {
  PfaeIsrIvaPills,
  PfaeSeccionesNav,
} from "@/components/publico/PfaeExpositorPills";
import {
  TARIFA_ISR_ANUAL_2026,
  TARIFA_ISR_MENSUAL_2026,
  type RenglonTarifa,
} from "@/lib/fiscal/isr";
import { fmtMxn } from "@/lib/fiscal/resico";
import {
  PFAE_CRITERIOS,
  PFAE_FAQ,
  PFAE_PASOS_ISR,
  PFAE_VS_RESICO,
  isrSobreUtilidad,
} from "@/lib/pfae-expositor";
import { tonoRegimen } from "@/lib/regimen-tonos";
import {
  REGIMENES_SERVICIO,
  SLUGS_REGIMEN_PF,
  type RegimenServicio,
} from "@/lib/servicios-regimenes";

const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-[#0F3A42]";
const H2 = "mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900";
const CARD = "rounded-[1.25rem] bg-white overflow-hidden";
const TH =
  "px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white bg-[#0F3A42] border-b-2 border-[#E3B23C]";
const SECTION = "scroll-mt-32 py-5 sm:py-6";
const LISTA_INSET = "mx-4 sm:mx-5 divide-y divide-slate-100";

function fmtHasta(n: number): string {
  if (!Number.isFinite(n)) return "En adelante";
  return fmtMxn(n);
}

function TablaTarifaPfae({
  encabezado,
  caption,
  renglones,
  ejemploHasta,
}: {
  encabezado: string;
  caption: string;
  renglones: readonly RenglonTarifa[];
  ejemploHasta: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-black/[0.04]">
      <table className="w-full text-[14px] sm:text-[15px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className={`${TH} text-left rounded-tl-xl`}>
              {encabezado}
            </th>
            <th scope="col" className={`${TH} text-right rounded-tr-xl`}>
              Cuota + % excedente
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {renglones.map((r) => {
            const ejemplo = r.limiteSuperior === ejemploHasta;
            return (
              <tr
                key={`${r.limiteInferior}-${r.limiteSuperior}`}
                className={ejemplo ? "bg-[#E3B23C]/15" : "bg-white"}
              >
                <td className="px-3 sm:px-4 py-2.5 tabular-nums text-slate-800">
                  {Number.isFinite(r.limiteSuperior)
                    ? `Hasta ${fmtHasta(r.limiteSuperior)}`
                    : "En adelante"}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[13px] font-bold tabular-nums ${
                      ejemplo
                        ? "bg-[#E3B23C] text-[#0F3A42]"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {fmtMxn(r.cuotaFija)} + {r.porcentajeExcedente.toFixed(2)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function PaginaPfaeExpositor({
  regimen,
}: {
  regimen: RegimenServicio;
}) {
  const tono = tonoRegimen("actividades-empresariales");
  const otros = SLUGS_REGIMEN_PF.filter((s) => s !== "actividades-empresariales").slice(
    0,
    4
  );

  const ejemploIngresos = 80_000;
  const ejemploDeducciones = 32_000;
  const ejemploUtilidad = ejemploIngresos - ejemploDeducciones;
  const ejemploMes = isrSobreUtilidad(
    ejemploUtilidad,
    TARIFA_ISR_MENSUAL_2026.renglones
  );
  const ejemploIva = Math.round(ejemploIngresos * 0.16 * 100) / 100;
  const ejemploIvaAcreditable = Math.round(ejemploDeducciones * 0.16 * 100) / 100;
  const ejemploIvaRetenido = Math.round(((ejemploIva * 2) / 3) * 100) / 100;
  const ejemploIvaCargo =
    Math.round((ejemploIva - ejemploIvaAcreditable - ejemploIvaRetenido) * 100) / 100;

  return (
    <div className="bg-[#f2f2f7]">
      <section
        className={`relative overflow-hidden rounded-b-[1.75rem] ${tono.bgCampo} text-white shadow-[0_10px_28px_rgba(15,23,42,0.12)]`}
      >
        <HeroPatternBg heroFrom={tono.heroFrom} heroTo={tono.heroTo} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
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
              className="inline-flex px-5 py-2.5 rounded-full bg-white text-sm font-black hover:bg-white/90 transition"
              style={{ color: tono.campo }}
            >
              Cotizar este régimen
            </Link>
            <Link
              href="/proceso"
              className="inline-flex px-5 py-2.5 rounded-full border border-white/30 text-sm font-bold hover:bg-white/10 transition"
            >
              Cómo trabajamos
            </Link>
          </div>
        </div>
      </section>

      <PfaeSeccionesNav />

      <section id="cuanto-se-paga" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Mecánica mensual</p>
          <h2 className={H2}>¿Cuánto se paga cada mes?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            El ISR cobra tarifa progresiva sobre la utilidad acumulada del año,
            no sobre lo cobrado. El IVA sigue un flujo independiente: no es una
            tasa sobre tu utilidad ni desaparece por estar en 612.
          </p>

          <div className="mt-5">
            <PfaeIsrIvaPills
              isr={
                <div>
                  <p className="px-4 sm:px-5 pt-4 pb-3 text-[13px] text-slate-500 leading-snug">
                    Utilidad = ingresos acumulables − deducciones autorizadas −
                    PTU. El provisional de cada mes usa la tabla de ese mes
                    porque la base va de enero al periodo que declaras. La anual
                    (art. 152) se usa al cierre.
                  </p>
                  <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-5 pb-3">
                    <TablaTarifaPfae
                      encabezado="Utilidad mensual"
                      caption="Tarifa ISR mensual 2026 para pagos provisionales de enero. Artículo 96 LISR."
                      renglones={TARIFA_ISR_MENSUAL_2026.renglones}
                      ejemploHasta={ejemploMes.renglon.limiteSuperior}
                    />
                    <TablaTarifaPfae
                      encabezado="Utilidad anual"
                      caption="Tarifa ISR anual 2026. Artículo 152 LISR, cierre del ejercicio."
                      renglones={TARIFA_ISR_ANUAL_2026.renglones}
                      ejemploHasta={-1}
                    />
                  </div>
                  <p className="px-4 sm:px-5 pb-3 text-[12px] text-slate-500 leading-relaxed">
                    El renglón marcado es un enero con {fmtMxn(ejemploIngresos)}{" "}
                    de ingresos y {fmtMxn(ejemploDeducciones)} de deducciones:
                    utilidad {fmtMxn(ejemploUtilidad)}, ISR {fmtMxn(ejemploMes.isr)}.
                    Fuente: Anexo 8 RMF 2026.
                  </p>
                  <div className="mx-4 sm:mx-5 border-t border-slate-100 py-4">
                    <p className="text-[13px] font-semibold text-slate-500">
                      Cómo se calcula el mes
                    </p>
                    <ol className="mt-3 space-y-3">
                      {PFAE_PASOS_ISR.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#0F3A42] text-white text-[13px] font-bold flex items-center justify-center">
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
                    <p className="mt-4 rounded-2xl bg-[#E3B23C]/15 px-4 py-3 text-[15px] font-semibold text-slate-800">
                      Calendario: declaración a más tardar el{" "}
                      <span className="text-[#0F3A42]">día 17</span> del mes
                      siguiente.
                    </p>
                  </div>
                </div>
              }
              iva={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    El IVA no se mezcla con el ISR. Cada mes se determina aparte,
                    con tres piezas: lo que trasladaste, lo que puedes acreditar
                    y, si aplica, lo que te retuvo una persona moral.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#E3B23C]">
                        IVA trasladado
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        El que le cobras al cliente
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Es el impuesto que agregas a tu factura (con frecuencia
                        16%). No es ingreso tuyo: lo recaudas para el SAT. Si
                        facturas {fmtMxn(ejemploIngresos)}, el IVA trasladado es{" "}
                        {fmtMxn(ejemploIva)}.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#E3B23C]">
                        IVA acreditable
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        El que pagaste en tus compras
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Es el IVA de gastos estrictamente indispensables, con
                        CFDI vigente. Se resta del trasladado. El mismo gasto
                        que baja tu ISR también puede darte IVA acreditable —
                        son dos efectos distintos del mismo comprobante.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#0F3A42]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#E3B23C]">
                      Retenciones si facturas a una persona moral
                    </p>
                    <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                      El IVA retenido se acredita contra IVA; el ISR retenido,
                      contra tu provisional
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      En servicios profesionales, la PM suele retener dos
                      terceras partes del IVA y 10% de ISR. En venta de
                      mercancías normalmente no hay esa retención de IVA. El
                      CFDI debe traer las retenciones desglosadas.
                    </p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-800">
                      IVA a cargo = trasladado − acreditable − retenido
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-slate-500">
                        Ejemplo con {fmtMxn(ejemploIngresos)} a una PM
                      </p>
                      <dl className="mt-3 space-y-2 text-[14px]">
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">IVA trasladado 16%</dt>
                          <dd className="font-bold tabular-nums text-slate-900">
                            {fmtMxn(ejemploIva)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">
                            Acreditable ({fmtMxn(ejemploDeducciones)})
                          </dt>
                          <dd className="font-bold tabular-nums text-slate-900">
                            − {fmtMxn(ejemploIvaAcreditable)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">Retenido (2/3 por la PM)</dt>
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
                        No mezcles las bases
                      </p>
                      <p className="mt-1.5 text-[14px] text-amber-950/80 leading-relaxed">
                        El IVA acreditable no baja el ISR. El ISR de este
                        ejemplo es {fmtMxn(ejemploMes.isr)} sobre{" "}
                        {fmtMxn(ejemploUtilidad)} de utilidad. En RESICO, los
                        mismos {fmtMxn(ejemploIngresos)} cobrados pagarían tasa
                        fija sobre el bruto, sin restar los{" "}
                        {fmtMxn(ejemploDeducciones)} de gastos.
                      </p>
                    </div>
                  </div>

                  <p className="rounded-2xl bg-[#E3B23C]/15 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    El IVA se declara junto con el ISR, a más tardar el{" "}
                    <span className="text-[#0F3A42]">día 17</span>.
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
          <h2 className={H2}>¿Quién entra a 612 y cómo opera?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Es el esquema tradicional para negocio propio o profesión
            independiente. No es un castigo por salir de RESICO: es donde las
            deducciones sí cuentan.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PFAE_CRITERIOS.map((c) => (
              <div key={c.n} className={`${CARD} px-4 py-3.5`}>
                <p className="text-[11px] font-black tabular-nums text-[#E3B23C]">
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
            LISR arts. 106 a 110 y 115 a 121 · clave SAT 612
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
              {PFAE_FAQ.map((f) => (
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
          <div className="mt-4 rounded-[1.25rem] bg-[#0F3A42] px-5 py-4 text-white">
            <p className="text-[13px] font-semibold text-[#E3B23C]">
              Recomendación profesional
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
              Usa esta guía como orientación inicial. En RDC comparamos 612
              contra RESICO con tus números — ingresos, gastos y retenciones —
              antes de darte de alta.
            </p>
          </div>
        </div>
      </section>

      <section id="comparativa" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Comparativa</p>
          <h2 className={H2}>{PFAE_VS_RESICO.titulo}</h2>
          <div className={`mt-5 ${CARD}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <caption className="sr-only">
                  Comparativa entre actividades empresariales clave SAT 612 y
                  RESICO clave SAT 626: base, tasas, deducciones, tope, IVA y
                  obligaciones.
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={`${TH} text-left rounded-tl-[1.25rem]`}
                    >
                      Aspecto
                    </th>
                    {PFAE_VS_RESICO.columnas.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`${TH} text-left ${
                          i === PFAE_VS_RESICO.columnas.length - 1
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
                  {PFAE_VS_RESICO.filas.map((fila) => (
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
              <p className={EYEBROW}>La tarifa completa</p>
              <h2 className={`${H2} max-w-md`}>
                Consulta tablas mensuales y anuales 2026
              </h2>
              <p className="mt-1.5 text-[15px] text-slate-600 max-w-lg">
                El SAT publica una tarifa por mes porque el provisional es
                acumulado. Aquí ves las mismas tablas que usamos al calcular tu
                ISR.
              </p>
            </div>
            <Link
              href="/herramientas/isr-2026"
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#0F3A42] text-white text-[15px] font-semibold hover:bg-[#0B2A30] transition"
            >
              Abrir tarifas ISR 2026
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
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#0F3A42] text-white text-[13px] font-bold flex items-center justify-center">
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
            <div className="rounded-[1.25rem] bg-[#0F3A42] text-white px-4 sm:px-5 py-4">
              <p className="text-[13px] font-semibold text-[#E3B23C]">
                En tu portal
              </p>
              <ul className="mt-3 space-y-2">
                {regimen.portal.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[15px] text-white/85 leading-snug"
                  >
                    <span className="text-[#E3B23C] shrink-0 font-semibold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 sm:py-6">
        <PortalPreview fullBleed compact tono="petroleo" />
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
                  <span className="w-1.5 shrink-0 bg-[#E3B23C]" aria-hidden />
                  <div className="min-w-0 px-3.5 py-3">
                    <p className="text-[13px] font-bold text-[#0F3A42] leading-snug">
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
            <div className="mt-3 flex min-h-0 flex-col rounded-[1.25rem] bg-[#0F3A42] px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold text-[#E3B23C]">
                Actividades empresariales
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-white/85 leading-snug">
                <li className="flex gap-2">
                  <span className="text-[#E3B23C] shrink-0">✓</span>
                  Respuesta en 24 h
                </li>
                <li className="flex gap-2">
                  <span className="text-[#E3B23C] shrink-0">✓</span>
                  Portal del cliente incluido
                </li>
                <li className="flex gap-2">
                  <span className="text-[#E3B23C] shrink-0">✓</span>
                  Sin compromiso
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  href="/cotizar"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0F3A42] hover:bg-white/90 transition"
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
