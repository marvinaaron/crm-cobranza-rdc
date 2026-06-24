"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import ParallaxLayer from "@/components/publico/motion/ParallaxLayer";
import ProcesoPortalMockup from "@/components/publico/ProcesoPortalMockup";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const PASOS_CUMPLIMIENTO = [
  {
    numero: 1,
    titulo: "Por trabajar",
    descripcion:
      "Recibimos tus documentos, CFDIs e información del mes. Confirmamos qué obligaciones aplican (SAT, IMSS, estatales).",
    porQue:
      "Sin la información completa del mes no podemos calcular impuestos con precisión ni presentar a tiempo. Este paso evita errores costosos y retrabajo.",
    detalles: [
      "Revisamos que tus CFDIs de ingresos y gastos estén completos",
      "Confirmamos obligaciones: SAT, IMSS, estatal o REPSE según tu caso",
      "Todo queda registrado en el portal — sabes exactamente qué falta",
    ],
    accent: "from-slate-400 to-slate-500",
    glow: "shadow-slate-500/30",
    badge: "bg-white/10 text-slate-200 ring-white/15",
    portalHint: "Sube CFDIs y estados de cuenta",
  },
  {
    numero: 2,
    titulo: "Iniciando",
    descripcion:
      "Iniciamos la contabilidad: clasificación de ingresos y deducciones, cálculo preliminar de impuestos.",
    porQue:
      "La clasificación contable correcta define cuánto pagarás de ISR e IVA. Aquí convertimos tus movimientos en números fiscales confiables.",
    detalles: [
      "Clasificamos ingresos y deducciones según tu régimen",
      "Conciliamos movimientos contra tus CFDIs y estados de cuenta",
      "Detectamos inconsistencias antes de mostrarte el previo",
    ],
    accent: "from-blue-400 to-cyan-400",
    glow: "shadow-blue-500/40",
    badge: "bg-blue-500/15 text-blue-200 ring-blue-400/25",
    portalHint: "Contabilidad en proceso",
  },
  {
    numero: 3,
    titulo: "Preliminar",
    descripcion:
      "Publicamos en tu portal un previo de impuestos para que lo revises y valides antes de presentar.",
    porQue:
      "Tú debes conocer y aprobar los montos antes de que declaremos. Así evitas sorpresas y tienes control sobre lo que se presenta al SAT.",
    detalles: [
      "Ves el cálculo de ISR, IVA y demás impuestos del mes",
      "Puedes preguntar o pedir ajustes antes de la declaración definitiva",
      "Nada se presenta al SAT sin que hayas visto el previo",
    ],
    accent: "from-amber-400 to-orange-400",
    glow: "shadow-amber-500/40",
    badge: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
    portalHint: "Revisa el previo de impuestos",
  },
  {
    numero: 4,
    titulo: "Aceptación",
    descripcion:
      "Una vez aceptado el previo, generamos las declaraciones definitivas y los documentos que las soportan.",
    porQue:
      "Tu confirmación es el aval formal para presentar. A partir de aquí generamos las declaraciones definitivas con los montos que ya validaste.",
    detalles: [
      "Aceptas el previo con un clic en el portal",
      "Generamos declaraciones definitivas y su documentación soporte",
      "Queda registro de tu aprobación para auditoría interna",
    ],
    accent: "from-violet-400 to-purple-400",
    glow: "shadow-violet-500/40",
    badge: "bg-violet-500/15 text-violet-200 ring-violet-400/25",
    portalHint: "Confirma el previo en un clic",
  },
  {
    numero: 5,
    titulo: "Declaraciones",
    descripcion:
      "Publicamos en tu portal los acuses, líneas de captura y todos los PDFs listos para pagar.",
    porQue:
      "Necesitas evidencia oficial y los medios para pagar. Centralizamos acuses, líneas de captura y PDFs para que no busques en correos ni WhatsApp.",
    detalles: [
      "Acuses de presentación SAT disponibles al instante",
      "Líneas de captura listas para pagar ISR, IVA e impuestos locales",
      "Todo organizado por periodo en tu portal",
    ],
    accent: "from-indigo-400 to-blue-400",
    glow: "shadow-indigo-500/40",
    badge: "bg-indigo-500/15 text-indigo-200 ring-indigo-400/25",
    portalHint: "Descarga acuses y líneas",
  },
  {
    numero: 6,
    titulo: "Pago",
    descripcion:
      "Subes tu comprobante de pago al portal. Validamos que coincida con la línea de captura emitida.",
    porQue:
      "El SAT exige comprobar el pago y nosotros necesitamos validar que el monto y la referencia coincidan. Así cerramos el ciclo fiscal del mes.",
    detalles: [
      "Subes tu comprobante de pago (transferencia o ventanilla)",
      "Verificamos monto, fecha y línea de captura",
      "Te avisamos si algo no cuadra antes de dar por cerrado el mes",
    ],
    accent: "from-emerald-400 to-teal-400",
    glow: "shadow-emerald-500/40",
    badge: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
    portalHint: "Sube tu comprobante SAT",
  },
  {
    numero: 7,
    titulo: "Completado",
    descripcion:
      "Cerramos el periodo. Queda todo archivado y accesible en tu portal para futuras consultas.",
    porQue:
      "Un mes cerrado bien documentado te protege ante revisiones, créditos o auditorías. Tu historial queda ordenado y disponible cuando lo necesites.",
    detalles: [
      "Periodo marcado como completado en tu portal",
      "Acuses, pagos y comprobantes archivados por mes",
      "Consulta cualquier mes anterior sin pedirnos archivos",
    ],
    accent: "from-emerald-400 to-green-300",
    glow: "shadow-emerald-400/50",
    badge: "bg-emerald-500/20 text-emerald-100 ring-emerald-400/30",
    portalHint: "Historial listo para consultar",
  },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MockupPanel({ paso }: { paso: number }) {
  const pasoData = PASOS_CUMPLIMIENTO[paso - 1];

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-8 rounded-3xl bg-gradient-to-br from-indigo-400/20 via-violet-400/10 to-emerald-400/15 blur-2xl"
        aria-hidden
      />
      <div className="relative rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 ring-1 ring-white/10 backdrop-blur-sm sm:p-5">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-300/80">
          Vista en tu portal
        </p>
        <ProcesoPortalMockup paso={paso} />
        <p className="mt-4 text-center text-xs font-semibold text-slate-400">{pasoData.portalHint}</p>
      </div>
    </div>
  );
}

export default function ComoTrabajamos() {
  const [pasoActivo, setPasoActivo] = useState(1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        const idx = els.indexOf(visible[0].target as HTMLDivElement);
        if (idx >= 0) setPasoActivo(idx + 1);
      },
      { rootMargin: "-12% 0px -12% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollToStep = useCallback(
    (num: number) => {
      stepRefs.current[num - 1]?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "center",
      });
    },
    [reduced]
  );

  return (
    <>
      <section className="relative overflow-hidden bg-[#050508] py-16 sm:py-20 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-indigo-300">
              Cómo trabajamos
            </p>
            <h1 className="mt-4 text-[2.5rem] font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Un proceso claro,{" "}
              <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                mes con mes
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              En RDC seguimos un flujo estandarizado para que sepas en qué etapa está tu
              contabilidad en cualquier momento. Sin sorpresas, sin retrasos.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section
        id="proceso"
        className="relative overflow-hidden bg-[#050508] py-16 sm:py-24 text-white snap-y snap-proximity"
        data-parallax-root
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.22),transparent)]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(16,185,129,0.12),transparent)]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <RevealOnScroll className="mb-14 sm:mb-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-indigo-400">
              Flujo de cumplimiento
            </p>
            <h2 className="mt-4 max-w-4xl text-[2.75rem] font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
              7 pasos que puedes{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
                seguir en tu portal
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-base text-slate-400 sm:text-lg">
              Desplázate por el flujo — cada paso muestra qué ves en el portal.
            </p>
          </RevealOnScroll>

          {/* Mockup sticky en móvil */}
          <div className="sticky top-20 z-20 mb-10 lg:hidden">
            <MockupPanel paso={pasoActivo} />
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-start lg:gap-14 xl:gap-20">
            {/* Timeline vertical — rail grueso */}
            <div className="relative">
              {PASOS_CUMPLIMIENTO.map((p, i) => {
                const activo = p.numero === pasoActivo;
                const completado = p.numero < pasoActivo;
                const ultimo = i === PASOS_CUMPLIMIENTO.length - 1;

                return (
                  <div
                    key={p.numero}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    className="relative flex snap-center snap-always gap-6 sm:gap-8 lg:gap-10"
                    style={{ minHeight: "88vh" }}
                  >
                    {/* Columna rail grueso + nodo */}
                    <div className="flex w-[4.5rem] shrink-0 flex-col items-center sm:w-20">
                      {i > 0 ? (
                        <div
                          className={`relative w-5 flex-1 min-h-10 overflow-hidden rounded-full sm:w-6 ${
                            completado || activo
                              ? "bg-gradient-to-b from-indigo-500 via-violet-500 to-emerald-500 shadow-[inset_0_0_12px_rgba(255,255,255,0.15)]"
                              : "bg-white/[0.06] ring-1 ring-inset ring-white/10"
                          }`}
                          aria-hidden
                        />
                      ) : (
                        <div className="min-h-6 flex-1" aria-hidden />
                      )}

                      <button
                        type="button"
                        onClick={() => scrollToStep(p.numero)}
                        aria-current={activo ? "step" : undefined}
                        aria-label={`Paso ${p.numero}: ${p.titulo}`}
                        className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black ring-1 transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-16 sm:w-16 sm:rounded-[1.25rem] sm:text-xl ${
                          activo
                            ? `scale-110 bg-gradient-to-br ${p.accent} text-white shadow-2xl ${p.glow} ring-white/30`
                            : completado
                              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-emerald-400/40"
                              : "bg-white/[0.06] text-slate-500 ring-white/10 hover:bg-white/10 hover:text-slate-300"
                        }`}
                      >
                        {completado ? <CheckIcon /> : p.numero}
                        {activo ? (
                          <span
                            className={`absolute -inset-1 -z-10 rounded-[1.35rem] bg-gradient-to-br ${p.accent} opacity-40 blur-md motion-reduce:hidden`}
                            aria-hidden
                          />
                        ) : null}
                      </button>

                      {!ultimo ? (
                        <div
                          className={`w-5 flex-1 min-h-10 overflow-hidden rounded-full sm:w-6 ${
                            completado
                              ? "bg-gradient-to-b from-emerald-500 via-indigo-500 to-violet-500 shadow-[inset_0_0_12px_rgba(255,255,255,0.12)]"
                              : "bg-white/[0.06] ring-1 ring-inset ring-white/10"
                          }`}
                          aria-hidden
                        />
                      ) : (
                        <div className="min-h-6 flex-1" aria-hidden />
                      )}
                    </div>

                    {/* Contenido del paso — títulos gigantes */}
                    <div
                      className={`flex flex-1 flex-col justify-center pb-16 pt-6 transition-all duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:pb-20 ${
                        activo ? "opacity-100" : "opacity-[0.22] sm:opacity-[0.26]"
                      }`}
                    >
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ring-1 transition-colors duration-700 ${p.badge}`}
                      >
                        Paso {p.numero}
                      </span>
                      <h3
                        className={`mt-4 font-black tracking-[-0.04em] transition-all duration-[1400ms] ${
                          activo
                            ? `bg-gradient-to-br ${p.accent} bg-clip-text text-transparent text-4xl leading-[0.95] sm:text-5xl lg:text-6xl xl:text-7xl`
                            : "text-2xl leading-tight text-slate-500 sm:text-3xl lg:text-4xl"
                        }`}
                      >
                        {p.titulo}
                      </h3>
                      <p
                        className={`mt-5 max-w-xl leading-relaxed transition-all duration-[1400ms] ${
                          activo
                            ? "text-base text-slate-300 sm:text-lg"
                            : "text-sm text-slate-600 sm:text-base"
                        }`}
                      >
                        {p.descripcion}
                      </p>

                      {activo ? (
                        <div className="mt-8 max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-sm transition-all duration-[1600ms] sm:p-6">
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">
                            ¿Por qué este paso?
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
                            {p.porQue}
                          </p>
                          <ul className="mt-5 space-y-3">
                            {p.detalles.map((d) => (
                              <li key={d} className="flex items-start gap-3 text-sm text-slate-400">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" />
                                {d}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-5 border-t border-white/10 pt-4 text-xs font-semibold text-indigo-300/90">
                            En tu portal: {p.portalHint}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mockup sticky desktop */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <ParallaxLayer speed={0.035} mouseFactor={8}>
                  <MockupPanel paso={pasoActivo} />
                </ParallaxLayer>
              </div>
            </div>
          </div>

          {/* Indicador de progreso grueso */}
          <div className="mt-8 flex items-center justify-center gap-2.5 lg:mt-14">
            {PASOS_CUMPLIMIENTO.map((p) => (
              <button
                key={p.numero}
                type="button"
                onClick={() => scrollToStep(p.numero)}
                aria-label={`Ir al paso ${p.numero}`}
                className={`rounded-full transition-all duration-[1200ms] ease-out ${
                  p.numero === pasoActivo
                    ? "h-3 w-10 bg-gradient-to-r from-indigo-400 to-violet-400 shadow-lg shadow-indigo-500/40"
                    : p.numero < pasoActivo
                      ? "h-3 w-3 bg-emerald-400 shadow-md shadow-emerald-500/30"
                      : "h-3 w-3 bg-white/15 hover:bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
