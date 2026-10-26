import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenIcon from "@/components/publico/RegimenIcon";
import {
  ResicoIsrIvaPills,
  ResicoSeccionesNav,
} from "@/components/publico/ResicoExpositorPills";
import { tonoRegimen } from "@/lib/regimen-tonos";
import {
  REGIMENES_SERVICIO,
  SLUGS_REGIMEN_PF,
  type RegimenServicio,
} from "@/lib/servicios-regimenes";
import {
  LIMITE_MENSUAL_RESICO,
  TARIFA_RESICO,
  TARIFA_RESICO_ANUAL,
  fmtMxn,
  fmtTasa,
} from "@/lib/fiscal/resico";
import {
  RESICO_CRITERIOS,
  RESICO_FAQ,
  RESICO_PASOS_ISR,
  RESICO_VS_612,
} from "@/lib/resico-expositor";

const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-marca-navy";
const H2 = "mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900";
const CARD = "rounded-[1.25rem] bg-white overflow-hidden";
const TH =
  "px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white bg-marca-navy border-b-2 border-marca-naranja";
const SECTION = "scroll-mt-32 py-5 sm:py-6";
const LISTA_INSET = "mx-4 sm:mx-5 divide-y divide-slate-100";

type FilaTarifa = {
  tasa: number;
  hasta: string;
  tasaTxt: string;
  esTope: boolean;
};

function filasTarifaMensual(): FilaTarifa[] {
  return TARIFA_RESICO.map((t) => {
    const tope = t.limiteSuperior ?? LIMITE_MENSUAL_RESICO;
    return {
      tasa: t.tasa,
      hasta: fmtMxn(tope),
      tasaTxt: fmtTasa(t.tasa),
      esTope: t.limiteSuperior == null,
    };
  });
}

function filasTarifaAnual(): FilaTarifa[] {
  return TARIFA_RESICO_ANUAL.map((t) => ({
    tasa: t.tasa,
    hasta: fmtMxn(t.hasta),
    tasaTxt: fmtTasa(t.tasa),
    esTope: t.hasta === 3_500_000,
  }));
}

function TablaTarifa({
  encabezado,
  caption,
  filas,
  tasaEjemplo,
}: {
  encabezado: string;
  caption: string;
  filas: FilaTarifa[];
  tasaEjemplo: number;
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
              Tasa aplicable
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((fila) => {
            const ejemplo = fila.tasa === tasaEjemplo;
            return (
              <tr
                key={fila.tasa}
                className={ejemplo ? "bg-marca-naranja/15" : "bg-white"}
              >
                <td className="px-3 sm:px-4 py-2.5 tabular-nums text-slate-800">
                  Hasta {fila.hasta}
                  {fila.esTope ? (
                    <span className="block text-[11px] font-normal text-slate-400">
                      Tope $3.5 MDP
                    </span>
                  ) : null}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[13px] font-bold tabular-nums ${
                      ejemplo
                        ? "bg-marca-naranja text-marca-navy"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {fila.tasaTxt}
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

export default function PaginaResicoExpositor({
  regimen,
}: {
  regimen: RegimenServicio;
}) {
  const tono = tonoRegimen("resico");
  const otros = SLUGS_REGIMEN_PF.filter((s) => s !== "resico").slice(0, 4);
  const ejemploIngreso = 50_000;
  const ejemploTasa = 0.011;
  const ejemploIsr = Math.round(ejemploIngreso * ejemploTasa * 100) / 100;
  const ejemploIva = Math.round(ejemploIngreso * 0.16 * 100) / 100;
  const ejemploIvaAcreditable = 2_400;
  const ejemploIvaRetenido = Math.round(((ejemploIva * 2) / 3) * 100) / 100;
  const ejemploIvaCargo =
    Math.round((ejemploIva - ejemploIvaAcreditable - ejemploIvaRetenido) * 100) /
    100;
  const tarifaMes = filasTarifaMensual();
  const tarifaAnio = filasTarifaAnual();

  return (
    <div className="bg-[#f2f2f7]">
      <section className="relative overflow-hidden rounded-b-[1.75rem] bg-marca-navy text-white shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
        <HeroPatternBg heroFrom={tono.heroFrom} heroTo={tono.heroTo} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3">
                <RegimenIcon slug="resico" size={36} className={`${tono.textChispa} shrink-0`} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-marca-naranja">
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
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/cotizar"
                  className="inline-flex px-5 py-2.5 rounded-full bg-white text-marca-navy text-sm font-black hover:bg-white/90 transition"
                >
                  Cotizar RESICO
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-naranja">
                Lo que hay que recordar
              </p>
              <dl className="mt-4 space-y-4">
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">Tope anual</dt>
                  <dd className="text-2xl font-black tabular-nums">$3.5 MDP</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <dt className="text-sm text-white/70">ISR sobre cobrado</dt>
                  <dd className="text-2xl font-black tabular-nums">1% – 2.5%</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-white/70">Declaración mensual</dt>
                  <dd className="text-2xl font-black tabular-nums">día 17</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <ResicoSeccionesNav />

      <section id="cuanto-se-paga" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Mecánica mensual</p>
          <h2 className={H2}>¿Cuánto se paga cada mes?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            El ISR cobra una tasa fija sobre el ingreso bruto cobrado. El IVA
            sigue un flujo independiente: no es una tasa sobre tu utilidad ni
            desaparece por estar en RESICO.
          </p>

          <div className="mt-5">
            <ResicoIsrIvaPills
              isr={
                <div>
                  <p className="px-4 sm:px-5 pt-4 pb-3 text-[13px] text-slate-500 leading-snug">
                    Ingresos cobrados amparados por CFDI, sin IVA. La declaración
                    del mes usa la tabla mensual; la anual es la misma tarifa × 12.
                    Los gastos no bajan esta base.
                  </p>
                  <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-5 pb-3">
                    <TablaTarifa
                      encabezado="Ingresos mensuales"
                      caption="Tarifa mensual de ISR RESICO. Artículo 113-F LISR."
                      filas={tarifaMes}
                      tasaEjemplo={ejemploTasa}
                    />
                    <TablaTarifa
                      encabezado="Ingresos anuales"
                      caption="Tabla anual SAT de ISR RESICO, equivalente a la tarifa mensual × 12."
                      filas={tarifaAnio}
                      tasaEjemplo={ejemploTasa}
                    />
                  </div>
                  <p className="px-4 sm:px-5 pb-3 text-[12px] text-slate-500 leading-relaxed">
                    El renglón marcado es {fmtMxn(ejemploIngreso)} al mes (hasta{" "}
                    {fmtMxn(600_000)} al año): tasa {fmtTasa(ejemploTasa)}, ISR{" "}
                    {fmtMxn(ejemploIsr)} de ese mes. Fuente: LISR art. 113-F.
                  </p>
                  <div className="mx-4 sm:mx-5 border-t border-slate-100 py-4">
                    <p className="text-[13px] font-semibold text-slate-500">
                      Cómo se calcula el mes
                    </p>
                    <ol className="mt-3 space-y-3">
                      {RESICO_PASOS_ISR.map((paso, i) => (
                        <li key={paso.name} className="flex gap-3 text-[15px] text-slate-700">
                          <span className="shrink-0 w-7 h-7 rounded-full bg-marca-navy text-white text-[13px] font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 leading-snug">
                            <span className="font-semibold text-slate-900">{paso.name}. </span>
                            {paso.text}
                          </span>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-4 rounded-2xl bg-marca-naranja/15 px-4 py-3 text-[15px] font-semibold text-slate-800">
                      Calendario: declaración a más tardar el{" "}
                      <span className="text-marca-navy">día 17</span> del mes
                      siguiente.
                    </p>
                  </div>
                </div>
              }
              iva={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    El IVA no desaparece en RESICO y no se calcula sobre tu
                    utilidad. Cada mes se determina aparte del ISR, con tres
                    piezas: lo que trasladaste, lo que puedes acreditar y, si
                    aplica, lo que te retuvo una persona moral.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-marca-naranja">
                        IVA trasladado
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        El que le cobras al cliente
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Es el impuesto que agregas a tu factura (con frecuencia
                        16%). No es ingreso tuyo: lo recaudas para el SAT. Si
                        facturas {fmtMxn(ejemploIngreso)}, el IVA trasladado es{" "}
                        {fmtMxn(ejemploIva)}.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-marca-naranja">
                        IVA acreditable
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        El que pagaste en tus compras
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Es el IVA de gastos y compras estrictamente
                        indispensables, con CFDI vigente que cumpla requisitos.
                        Se resta del trasladado. Sin factura no hay
                        acreditamiento, aunque hayas pagado en efectivo.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-marca-navy/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-marca-naranja">
                      IVA retenido por personas morales
                    </p>
                    <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                      Se acredita contra el IVA a cargo, no contra el ISR
                    </p>
                    <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                      Si le facturas a una persona moral (empresa o despacho),
                      suele retener dos terceras partes del IVA de servicios
                      profesionales. Ese monto ya lo entera ella al SAT. Tú lo
                      acreditas en tu declaración mensual contra el IVA a
                      cargo — nunca contra el ISR de RESICO, que no admite
                      deducciones. El CFDI debe traer el IVA retenido
                      desglosado.
                    </p>
                    <p className="mt-2 text-[15px] font-semibold text-slate-800">
                      IVA a cargo = trasladado − acreditable − retenido
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-slate-500">
                        Ejemplo con {fmtMxn(ejemploIngreso)} a una PM
                      </p>
                      <dl className="mt-3 space-y-2 text-[14px]">
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">IVA trasladado 16%</dt>
                          <dd className="font-bold tabular-nums text-slate-900">
                            {fmtMxn(ejemploIva)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-600">Acreditable (tus gastos)</dt>
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
                        No te dejes engañar
                      </p>
                      <p className="mt-1.5 text-[14px] text-amber-950/80 leading-relaxed">
                        Que en ISR de RESICO no haya deducciones no significa
                        que el IVA se pague completo. El acreditable de tus
                        compras y el retenido por personas morales sí bajan el
                        IVA a cargo. El ISR de ese mismo {fmtMxn(ejemploIngreso)}{" "}
                        sigue siendo {fmtMxn(ejemploIsr)}, sin restar gastos.
                      </p>
                    </div>
                  </div>

                  <p className="rounded-2xl bg-marca-naranja/15 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    El IVA se declara junto con el ISR, a más tardar el{" "}
                    <span className="text-marca-navy">día 17</span>. Cobrado y
                    facturado se llevan en paralelo: el ISR va cuando te pagan;
                    el IVA, por lo facturado del mes.
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      <section id="limites" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Criterios de elegibilidad</p>
          <h2 className={H2}>¿Quién puede entrar y cuáles son los límites?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Diseñado para pequeños contribuyentes, con tope estricto y control
            digital. Si no encajas aquí, el régimen general suele ser la vía
            correcta — no un castigo.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RESICO_CRITERIOS.map((c) => (
              <div key={c.n} className={`${CARD} px-4 py-3.5`}>
                <p className="text-[11px] font-black tabular-nums text-marca-naranja">
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
            Criterios de permanencia · CFF y LISR art. 113-E
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
            {RESICO_FAQ.map((f) => (
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
          <div className="mt-4 rounded-[1.25rem] bg-marca-navy px-5 py-4 text-white">
            <p className="text-[13px] font-semibold text-marca-naranja">
              Recomendación profesional
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
              Usa esta guía como orientación inicial y confirma la elección según
              tu actividad y nivel de gastos. En RDC comparamos RESICO contra el
              régimen 612 antes de darte de alta.
            </p>
          </div>
        </div>
      </section>

      <section id="comparativa" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Comparativa</p>
          <h2 className={H2}>{RESICO_VS_612.titulo}</h2>
          <div className={`mt-5 ${CARD}`}>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[15px]">
              <caption className="sr-only">
                Comparativa entre RESICO clave SAT 626 y actividades empresariales
                clave SAT 612: base, tasas, deducciones, tope, IVA y obligaciones.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className={`${TH} text-left rounded-tl-[1.25rem]`}>
                    Aspecto
                  </th>
                  {RESICO_VS_612.columnas.map((col, i) => (
                    <th
                      key={col}
                      scope="col"
                      className={`${TH} text-left ${
                        i === RESICO_VS_612.columnas.length - 1
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
                {RESICO_VS_612.filas.map((fila) => (
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
          <div className={`${CARD} px-5 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
            <div>
              <p className={EYEBROW}>Pruébalo con tus números</p>
              <h2 className={`${H2} max-w-md`}>
                Simula el ISR del mes antes de cerrar cobros
              </h2>
              <p className="mt-1.5 text-[15px] text-slate-600 max-w-lg">
                La calculadora aplica esta misma tarifa sobre el ingreso cobrado.
                Es informativa; el impuesto definitivo lo confirma tu contador.
              </p>
            </div>
            <Link
              href="/herramientas/isr-resico"
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-marca-navy text-white text-[15px] font-semibold hover:bg-marca-navy-soft transition"
            >
              Abrir calculadora ISR
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
                  <span className="shrink-0 w-7 h-7 rounded-full bg-marca-navy text-white text-[13px] font-bold flex items-center justify-center">
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
            <div className="rounded-[1.25rem] bg-marca-navy text-white px-4 sm:px-5 py-4">
              <p className="text-[13px] font-semibold text-marca-naranja">
                En tu portal
              </p>
              <ul className="mt-3 space-y-2">
                {regimen.portal.map((item) => (
                  <li key={item} className="text-[15px] text-white/85 leading-snug">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 sm:py-6">
        <PortalPreview fullBleed compact tono="resico" />
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
                  <span className="w-1.5 shrink-0 bg-marca-naranja" aria-hidden />
                  <div className="min-w-0 px-3.5 py-3">
                    <p className="text-[13px] font-bold text-marca-navy leading-snug">
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
            <div className="mt-3 flex min-h-0 flex-col rounded-[1.25rem] bg-marca-navy px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold text-marca-naranja">
                {regimen.titulo}
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-white/85 leading-snug">
                <li className="flex gap-2">
                  <span className="text-marca-naranja shrink-0">✓</span>
                  Respuesta en 24 h
                </li>
                <li className="flex gap-2">
                  <span className="text-marca-naranja shrink-0">✓</span>
                  Portal del cliente incluido
                </li>
                <li className="flex gap-2">
                  <span className="text-marca-naranja shrink-0">✓</span>
                  Sin compromiso
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  href="/cotizar"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-white text-sm font-bold text-marca-navy hover:bg-white/90 transition"
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
