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
    color: "bg-slate-200 text-slate-700",
    portalHint: "Sube CFDIs y estados de cuenta",
  },
  {
    numero: 2,
    titulo: "Iniciando",
    descripcion:
      "Iniciamos la contabilidad: clasificación de ingresos y deducciones, cálculo preliminar de impuestos.",
    color: "bg-blue-100 text-blue-700",
    portalHint: "Contabilidad en proceso",
  },
  {
    numero: 3,
    titulo: "Preliminar",
    descripcion:
      "Publicamos en tu portal un previo de impuestos para que lo revises y valides antes de presentar.",
    color: "bg-amber-100 text-amber-700",
    portalHint: "Revisa el previo de impuestos",
  },
  {
    numero: 4,
    titulo: "Aceptación",
    descripcion:
      "Una vez aceptado el previo, generamos las declaraciones definitivas y los documentos que las soportan.",
    color: "bg-violet-100 text-violet-700",
    portalHint: "Confirma el previo en un clic",
  },
  {
    numero: 5,
    titulo: "Declaraciones",
    descripcion:
      "Publicamos en tu portal los acuses, líneas de captura y todos los PDFs listos para pagar.",
    color: "bg-indigo-100 text-indigo-700",
    portalHint: "Descarga acuses y líneas",
  },
  {
    numero: 6,
    titulo: "Pago",
    descripcion:
      "Subes tu comprobante de pago al portal. Validamos que coincida con la línea de captura emitida.",
    color: "bg-emerald-100 text-emerald-700",
    portalHint: "Sube tu comprobante SAT",
  },
  {
    numero: 7,
    titulo: "Completado",
    descripcion:
      "Cerramos el periodo. Queda todo archivado y accesible en tu portal para futuras consultas.",
    color: "bg-emerald-600 text-white",
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
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/40 p-4 ring-1 ring-slate-200/80 sm:p-5">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600/80">
          Vista en tu portal
        </p>
        <ProcesoPortalMockup paso={paso} />
        <p className="mt-4 text-center text-xs font-semibold text-slate-500">{pasoData.portalHint}</p>
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
      { rootMargin: "-30% 0px -30% 0px", threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] }
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
      <section className="relative overflow-hidden bg-slate-950 py-14 sm:py-16 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-indigo-300">
              Cómo trabajamos
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
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

      <section id="proceso" className="bg-white py-10 sm:py-14" data-parallax-root>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="mb-10 text-center sm:mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
              Flujo de cumplimiento
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              7 pasos que puedes{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                seguir en tu portal
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
              Desplázate por el flujo — cada paso muestra qué ves en el portal.
            </p>
          </RevealOnScroll>

          {/* Mockup sticky en móvil */}
          <div className="sticky top-20 z-20 mb-8 lg:hidden">
            <MockupPanel paso={pasoActivo} />
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start lg:gap-12 xl:gap-16">
            {/* Timeline vertical */}
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
                    className="relative flex gap-5 sm:gap-6"
                    style={{ minHeight: i === 0 || i === PASOS_CUMPLIMIENTO.length - 1 ? "42vh" : "50vh" }}
                  >
                    {/* Columna línea + dot */}
                    <div className="flex w-10 shrink-0 flex-col items-center sm:w-11">
                      {i > 0 ? (
                        <div
                          className={`w-0.5 flex-1 min-h-8 transition-colors duration-[900ms] ease-out ${
                            completado || activo ? "bg-gradient-to-b from-indigo-500 to-violet-500" : "bg-slate-200"
                          }`}
                          aria-hidden
                        />
                      ) : (
                        <div className="flex-1 min-h-4" aria-hidden />
                      )}

                      <button
                        type="button"
                        onClick={() => scrollToStep(p.numero)}
                        aria-current={activo ? "step" : undefined}
                        aria-label={`Paso ${p.numero}: ${p.titulo}`}
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ring-4 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-11 sm:w-11 ${
                          activo
                            ? "scale-110 bg-slate-900 text-white ring-indigo-100 shadow-lg shadow-indigo-500/25"
                            : completado
                              ? "bg-emerald-600 text-white ring-emerald-100"
                              : "bg-white text-slate-500 ring-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        {completado ? <CheckIcon /> : p.numero}
                        {activo ? (
                          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30 motion-reduce:hidden" aria-hidden />
                        ) : null}
                      </button>

                      {!ultimo ? (
                        <div
                          className={`w-0.5 flex-1 min-h-8 transition-colors duration-[900ms] ease-out ${
                            completado ? "bg-gradient-to-b from-emerald-500 to-indigo-500" : "bg-slate-200"
                          }`}
                          aria-hidden
                        />
                      ) : (
                        <div className="flex-1 min-h-4" aria-hidden />
                      )}
                    </div>

                    {/* Contenido del paso */}
                    <div
                      className={`flex flex-1 flex-col justify-center pb-10 pt-2 transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:pb-14 ${
                        activo ? "opacity-100 translate-x-0" : "opacity-45 translate-x-0 sm:opacity-50"
                      }`}
                    >
                      <span
                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors duration-700 ${p.color}`}
                      >
                        Paso {p.numero}
                      </span>
                      <h3
                        className={`mt-3 text-xl font-black tracking-tight transition-colors duration-700 sm:text-2xl ${
                          activo ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        {p.titulo}
                      </h3>
                      <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                        {p.descripcion}
                      </p>
                      {activo ? (
                        <p className="mt-4 text-xs font-semibold text-indigo-600/80">{p.portalHint}</p>
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

          {/* Indicador de progreso */}
          <div className="mt-4 flex items-center justify-center gap-2 lg:mt-8">
            {PASOS_CUMPLIMIENTO.map((p) => (
              <button
                key={p.numero}
                type="button"
                onClick={() => scrollToStep(p.numero)}
                aria-label={`Ir al paso ${p.numero}`}
                className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
                  p.numero === pasoActivo
                    ? "w-8 bg-indigo-600"
                    : p.numero < pasoActivo
                      ? "w-3 bg-emerald-500"
                      : "w-3 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
