import Link from "next/link";
import HeroPatternBg from "@/components/publico/HeroPatternBg";
import PortalPreview from "@/components/publico/PortalPreview";
import RegimenIcon from "@/components/publico/RegimenIcon";
import {
  RifPermanecerMigrarPills,
  RifSeccionesNav,
} from "@/components/publico/RifExpositorPills";
import { fmtMxn } from "@/lib/fiscal/resico";
import {
  RIF_CRITERIOS,
  RIF_FAQ,
  RIF_PASOS_BIMESTRE,
  RIF_REDUCCION,
  RIF_VS_RESICO,
} from "@/lib/rif-expositor";
import { tonoRegimen } from "@/lib/regimen-tonos";
import {
  REGIMENES_SERVICIO,
  SLUGS_REGIMEN_PF,
  type RegimenServicio,
} from "@/lib/servicios-regimenes";

const WRAP = "max-w-5xl mx-auto px-4 sm:px-6";
const EYEBROW =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-[#2A221C]";
const H2 = "mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900";
const CARD = "rounded-[1.25rem] bg-white overflow-hidden";
const TH =
  "px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white bg-[#2A221C] border-b-2 border-[#E8A060]";
const SECTION = "scroll-mt-32 py-5 sm:py-6";
const LISTA_INSET = "mx-4 sm:mx-5 divide-y divide-slate-100";

const EJEMPLO_ANIO = 8;
const EJEMPLO_ISR_TABLA = 10_000;
const EJEMPLO_REDUCCION = RIF_REDUCCION.find((r) => r.anio === EJEMPLO_ANIO)!;
const EJEMPLO_A_CARGO =
  (EJEMPLO_ISR_TABLA * EJEMPLO_REDUCCION.aCargo) / 100;

function InsigniaRifExtincion({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex size-[7rem] rotate-[-12deg] items-center justify-center ${className}`}
      aria-label="Régimen en extinción: se apaga cuando los últimos contribuyentes cumplen 10 años, cerca de 2031"
    >
      <span
        className="absolute inset-0 rounded-full border-[2.5px] border-[#E8A060] bg-[#1C1712]/85 shadow-[0_10px_24px_rgba(0,0,0,0.35)] backdrop-blur-[2px]"
        aria-hidden
      />
      <span
        className="absolute inset-[7px] rounded-full border border-dashed border-[#E8A060]/75"
        aria-hidden
      />
      <span className="relative px-2 text-center leading-tight">
        <span className="block text-[8px] font-black uppercase tracking-[0.22em] text-[#E8A060]">
          En extinción
        </span>
        <span className="mt-0.5 block text-[15px] font-black tabular-nums text-white">
          Año 10
        </span>
        <span className="mt-0.5 block text-[10px] font-semibold text-white/75">
          se apaga ≈ 2031
        </span>
      </span>
    </div>
  );
}

export default function PaginaRifExpositor({
  regimen,
}: {
  regimen: RegimenServicio;
}) {
  const tono = tonoRegimen("rif");
  const otros = SLUGS_REGIMEN_PF.filter((s) => s !== "rif").slice(0, 4);

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
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E8A060] px-3.5 py-1.5 text-[13px] font-black text-[#2A221C]">
                <span aria-hidden className="text-[12px] leading-none">
                  ✕
                </span>
                Ya no se puede dar de alta como RIF
              </p>
              <p className="mt-3 text-base text-white/85 max-w-xl leading-relaxed">
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

            <div className="relative mt-20 lg:mt-2">
              <InsigniaRifExtincion className="absolute -top-[4.5rem] right-0 z-10 sm:-right-3" />
              <aside className="rounded-2xl bg-white/10 ring-1 ring-white/15 p-5 sm:p-6 backdrop-blur-[2px]">
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${tono.textChispa}`}
                >
                  Peculiaridades
                </p>
                <dl className="mt-4 space-y-4">
                  <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                    <dt className="text-sm text-white/70">¿Alta nueva hoy?</dt>
                    <dd className="text-2xl font-black tabular-nums">No</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                    <dt className="text-sm text-white/70">Declaración</dt>
                    <dd className="text-2xl font-black tabular-nums">Bimestral</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-sm text-white/70">Se apaga al año 10</dt>
                    <dd className="text-2xl font-black tabular-nums">≈ 2031</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <RifSeccionesNav />

      <section id="cuanto-se-paga" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Mecánica del régimen</p>
          <h2 className={H2}>¿Cómo se paga el ISR en 621?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            El RIF no se declara cada mes. Mientras transitas, el ISR sale de
            la tabla del régimen y se reduce según tu año de alta. La pregunta
            del año no es 621 vs 612: es si te quedas el bimestre, o si ya
            te conviene salir a RESICO.
          </p>

          <div className="mt-5">
            <RifPermanecerMigrarPills
              permanecer={
                <div>
                  <p className="px-4 sm:px-5 pt-4 pb-3 text-[13px] text-slate-500 leading-snug">
                    Cada bimestre sumas lo cobrado, aplicas la tabla RIF y
                    descuentas el porcentaje de tu año de incorporación. Eso
                    ya no es el 100% de descuento del año 1.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 sm:px-5 pb-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A06030]">
                        Periodicidad
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Seis bimestres al año
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Día 17 de marzo, mayo, julio, septiembre, noviembre y
                        enero. No es el calendario mensual de RESICO.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A06030]">
                        Tope
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        $2,000,000 al año
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        No es el tope de RESICO. Si lo rebasas, sales del 621
                        aunque te queden años de transición.
                      </p>
                    </div>
                  </div>
                  <div className="px-4 sm:px-5 pb-3 overflow-x-auto">
                    <table className="w-full min-w-[480px] text-[14px]">
                      <caption className="sr-only">
                        Reducción de ISR en RIF según el año de incorporación.
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col" className={`${TH} text-left rounded-tl-xl`}>
                            Año en RIF
                          </th>
                          <th scope="col" className={`${TH} text-right`}>
                            Reducción
                          </th>
                          <th
                            scope="col"
                            className={`${TH} text-right rounded-tr-xl`}
                          >
                            A cargo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {RIF_REDUCCION.map((fila) => {
                          const marca = fila.anio === EJEMPLO_ANIO;
                          return (
                            <tr
                              key={fila.anio}
                              className={marca ? "bg-[#F6E6D4]" : "bg-white"}
                            >
                              <td className="px-4 sm:px-5 py-2 font-semibold text-slate-800">
                                Año {fila.anio}
                              </td>
                              <td className="px-4 sm:px-5 py-2 text-right tabular-nums text-slate-600">
                                {fila.reduccion}%
                              </td>
                              <td className="px-4 sm:px-5 py-2 text-right tabular-nums font-semibold text-slate-900">
                                {marca ? (
                                  <span className="inline-flex rounded-full bg-[#2A221C] px-2 py-0.5 text-[12px] font-bold text-[#E8A060]">
                                    {fila.aCargo}%
                                  </span>
                                ) : (
                                  `${fila.aCargo}%`
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="px-4 sm:px-5 pb-3 text-[12px] text-slate-500 leading-relaxed">
                    El renglón marcado es el año {EJEMPLO_ANIO}: si el ISR de la
                    tabla del bimestre fuera {fmtMxn(EJEMPLO_ISR_TABLA)},
                    enteras {fmtMxn(EJEMPLO_A_CARGO)}. La reducción ya no es
                    sobre el ingreso: es sobre el ISR determinado.
                  </p>
                  <div className="mx-4 sm:mx-5 mb-1 rounded-2xl bg-[#2A221C]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A06030]">
                      Cómo se cierra el bimestre
                    </p>
                    <ol className="mt-3 space-y-3">
                      {RIF_PASOS_BIMESTRE.map((paso, i) => (
                        <li
                          key={paso.name}
                          className="flex gap-3 text-[15px] text-slate-700"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-[#2A221C] text-white text-[13px] font-bold flex items-center justify-center">
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
                    <p className="rounded-2xl bg-[#E8A060]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                      El RIF no se presenta el día 17 de cada mes. Es{" "}
                      <span className="text-[#2A221C]">bimestral</span>.
                    </p>
                  </div>
                </div>
              }
              migrar={
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    RESICO sustituyó al RIF como régimen simplificado vigente.
                    El cambio es un aviso en el RFC, no un cierre de negocio.
                    El último bimestre en 621 se declara; el mes siguiente ya
                    es mensual en 626.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A06030]">
                        Conviene salir si
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Ya vas en años altos
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Cuando la reducción es 30% o menos, las tasas de
                        RESICO (1% a 2.5% sobre cobrado) suelen ganar. También
                        si te acercas al tope de $2 MDP.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A06030]">
                        Qué cambia
                      </p>
                      <p className="mt-1 text-[16px] font-bold tracking-tight text-slate-900">
                        Mensual, sin esa reducción
                      </p>
                      <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
                        Doce declaraciones al año. El IVA ya no lleva el
                        descuento del RIF. El tope sube a $3.5 MDP si
                        calificas.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#2A221C]/5 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A06030]">
                      Cómo se hace el cambio
                    </p>
                    <ol className="mt-3 space-y-3 text-[15px] text-slate-700">
                      <li className="flex gap-3">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-[#2A221C] text-white text-[13px] font-bold flex items-center justify-center">
                          1
                        </span>
                        <span className="pt-0.5 leading-snug">
                          <span className="font-semibold text-slate-900">
                            Revisa si calificas a RESICO.{" "}
                          </span>
                          Tope de $3.5 MDP, no ser socio de persona moral y
                          los demás requisitos del art. 113-E.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-[#2A221C] text-white text-[13px] font-bold flex items-center justify-center">
                          2
                        </span>
                        <span className="pt-0.5 leading-snug">
                          <span className="font-semibold text-slate-900">
                            Cierra el último bimestre en 621.{" "}
                          </span>
                          Ese periodo se declara con las reglas del RIF. No
                          se mezcla con el primer mes en RESICO.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-[#2A221C] text-white text-[13px] font-bold flex items-center justify-center">
                          3
                        </span>
                        <span className="pt-0.5 leading-snug">
                          <span className="font-semibold text-slate-900">
                            Aviso de actualización en el RFC.{" "}
                          </span>
                          Baja 621, alta 626. El SAT lo refleja en la
                          constancia; tus CFDI siguientes ya van con la
                          clave nueva.
                        </span>
                      </li>
                    </ol>
                  </div>
                  <p className="rounded-2xl bg-[#E8A060]/25 px-4 py-3 text-[15px] font-semibold text-slate-800">
                    Si hoy arrancas actividad,{" "}
                    <span className="text-[#2A221C]">no hay RIF</span>. Tu
                    vía simplificada es RESICO.
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
          <h2 className={H2}>¿Quién sigue en 621 y qué le toca?</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            No es un régimen para elegir. Es un corredor de salida para quien
            ya estaba. La pregunta del año es cuántos años de reducción te
            quedan, y si RESICO ya gana esos números.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RIF_CRITERIOS.map((c) => (
              <div key={c.n} className={`${CARD} px-4 py-3.5`}>
                <p className="text-[11px] font-black tabular-nums text-[#A06030]">
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
            LIF 2022 · LISR arts. 111 (transitorio) y 113-E · clave SAT 621
          </p>
        </div>
      </section>

      <section id="preguntas" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Antes de quedarte</p>
          <h2 className={H2}>Preguntas frecuentes</h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Respuestas directas para decidir con el contador, no para
            memorizar el transitorio.
          </p>
          <dl className={`mt-4 ${CARD}`}>
            <div className={LISTA_INSET}>
              {RIF_FAQ.map((f) => (
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
          <div className="mt-4 rounded-[1.25rem] bg-[#2A221C] px-5 py-4 text-white">
            <p className="text-[13px] font-semibold text-[#E8A060]">
              Recomendación profesional
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
              Usa esta guía como orientación inicial. En RDC contamos tu año
              de incorporación, el ISR del último bimestre y el equivalente en
              RESICO antes de mover el RFC.
            </p>
          </div>
        </div>
      </section>

      <section id="comparativa" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Comparativa</p>
          <h2 className={H2}>{RIF_VS_RESICO.titulo}</h2>
          <div className={`mt-5 ${CARD}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <caption className="sr-only">
                  Comparativa entre permanecer en RIF 621 y migrar a RESICO
                  626.
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={`${TH} text-left rounded-tl-[1.25rem]`}
                    >
                      Aspecto
                    </th>
                    {RIF_VS_RESICO.columnas.map((col, i) => (
                      <th
                        key={col}
                        scope="col"
                        className={`${TH} text-left ${
                          i === RIF_VS_RESICO.columnas.length - 1
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
                  {RIF_VS_RESICO.filas.map((fila) => (
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
              <p className={EYEBROW}>El régimen que sigue vigente</p>
              <h2 className={`${H2} max-w-md`}>
                Revisa RESICO con tus números
              </h2>
              <p className="mt-1.5 text-[15px] text-slate-600 max-w-lg">
                La guía 626 y la calculadora usan la tarifa del artículo
                113-F. Es el comparativo que usamos antes de pedirte el
                cambio de RFC.
              </p>
            </div>
            <Link
              href="/servicios/resico"
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#2A221C] text-white text-[15px] font-semibold hover:bg-[#1C1712] transition"
            >
              Ver guía RESICO
            </Link>
          </div>
        </div>
      </section>

      <section id="cumplimiento" className={SECTION}>
        <div className={WRAP}>
          <p className={EYEBROW}>Qué hacemos en RDC</p>
          <h2 className={H2}>Tu transición, sin sorpresas</h2>
          <div className={`mt-4 ${CARD}`}>
            <ul className={LISTA_INSET}>
              {regimen.queHacemos.map((item, i) => (
                <li key={item.titulo} className="py-3.5 flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#2A221C] text-white text-[13px] font-bold flex items-center justify-center">
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
            <div className="rounded-[1.25rem] bg-[#2A221C] text-white px-4 sm:px-5 py-4">
              <p className="text-[13px] font-semibold text-[#E8A060]">
                En tu portal
              </p>
              <ul className="mt-3 space-y-2">
                {regimen.portal.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[15px] text-white/85 leading-snug"
                  >
                    <span className="text-[#E8A060] shrink-0 font-semibold">
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
        <PortalPreview fullBleed compact tono="cafe" />
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
                  <span className="w-1.5 shrink-0 bg-[#E8A060]" aria-hidden />
                  <div className="min-w-0 px-3.5 py-3">
                    <p className="text-[13px] font-bold text-[#2A221C] leading-snug">
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
            <div className="mt-3 flex min-h-0 flex-col rounded-[1.25rem] bg-[#2A221C] px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold text-[#E8A060]">
                {regimen.titulo}
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-white/85 leading-snug">
                <li className="flex gap-2">
                  <span className="text-[#E8A060] shrink-0">✓</span>
                  Respuesta en 24 h
                </li>
                <li className="flex gap-2">
                  <span className="text-[#E8A060] shrink-0">✓</span>
                  Portal del cliente incluido
                </li>
                <li className="flex gap-2">
                  <span className="text-[#E8A060] shrink-0">✓</span>
                  Sin compromiso
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  href="/cotizar"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#2A221C] hover:bg-white/90 transition"
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
