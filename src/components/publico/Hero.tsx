"use client";

import Link from "next/link";
import ParallaxLayer from "@/components/publico/motion/ParallaxLayer";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import TiltLayer from "@/components/publico/motion/TiltLayer";

function MiniIphoneSemaforo() {
  return (
    <div className="w-[180px] rounded-[2rem] bg-slate-900 p-1.5 shadow-2xl ring-1 ring-black/30">
      <div className="relative">
        <div
          className="absolute left-1/2 top-1.5 z-20 h-[15px] w-[52px] -translate-x-1/2 rounded-full bg-black ring-1 ring-black/60"
          aria-hidden
        >
          <span className="absolute right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-700/70" />
        </div>
        <div className="overflow-hidden rounded-[1.65rem] bg-white">
          <div className="flex items-center justify-between px-4 pb-1 pt-5">
            <span className="text-[8px] font-bold text-slate-700">9:41</span>
            <div className="flex items-center gap-0.5">
              <svg width="14" height="8" viewBox="0 0 22 14" fill="currentColor" className="text-slate-700">
                <rect x="0" y="9" width="3" height="5" rx="0.5" />
                <rect x="4" y="6" width="3" height="8" rx="0.5" />
                <rect x="8" y="3" width="3" height="11" rx="0.5" />
                <rect x="12" y="0" width="3" height="14" rx="0.5" />
              </svg>
            </div>
          </div>
          <div className="px-3.5 pb-2.5 pt-2">
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Mi situación</p>
            <p className="text-sm font-black leading-none text-slate-900">SAT</p>
          </div>
          <div className="mx-3 mb-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-white p-3 ring-1 ring-emerald-200">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <div>
                <p className="text-[8px] font-bold uppercase leading-none tracking-widest text-emerald-700">
                  Opinión 32-D
                </p>
                <p className="mt-0.5 text-[12px] font-black leading-tight text-emerald-800">Positiva</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 px-3 pb-3">
            {["Constancia fiscal", "Opinión cumplimiento"].map((etiqueta) => (
              <div key={etiqueta} className="flex items-center gap-1.5 rounded-lg bg-slate-50 p-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-md bg-indigo-100 text-marca-navy">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <span className="truncate text-[8px] font-bold text-slate-700">{etiqueta}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center pb-1.5">
            <span className="h-0.5 w-14 rounded-full bg-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

const AVATARES = [
  { ini: "JM", color: "bg-indigo-500" },
  { ini: "AR", color: "bg-emerald-500" },
  { ini: "LC", color: "bg-amber-500" },
  { ini: "DR", color: "bg-rose-500" },
];

export default function Hero() {
  return (
    <section
      data-parallax-root
      className="relative min-h-[88vh] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white"
    >
      {/* Fondos con parallax */}
      <ParallaxLayer speed={0.04} mouseFactor={8} className="pointer-events-none absolute -right-32 -top-32 -z-10">
        <div className="h-[32rem] w-[32rem] rounded-full bg-indigo-300/35 blur-3xl" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.07} mouseFactor={-10} className="pointer-events-none absolute -bottom-40 -left-32 -z-10">
        <div className="h-[26rem] w-[26rem] rounded-full bg-violet-300/30 blur-3xl" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.02} mouseFactor={5} className="pointer-events-none absolute left-1/2 top-1/3 -z-10 -translate-x-1/2">
        <div className="h-64 w-64 rounded-full bg-sky-200/25 blur-3xl" />
      </ParallaxLayer>

      {/* Grid sutil */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
        }}
      />

      <div className="mx-auto flex min-h-[88vh] max-w-6xl items-center px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-sm ring-1 ring-slate-200">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Cumplimiento fiscal mensual y anual
              </span>
            </RevealOnScroll>

            <RevealOnScroll delay={80}>
              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Tu contabilidad
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(124,58,237,0.2)]">
                  en buenas manos
                </span>
                .
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={140}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Acompañamos a personas físicas y morales en sus obligaciones ante el SAT, IMSS,
                Infonavit, ISN y REPSE. Cumplimiento puntual, asesoría clara y un{" "}
                <span className="font-bold text-slate-900">portal exclusivo</span> para que veas tu
                información en todo momento.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contacto"
                  className="group inline-flex items-center gap-2 rounded-xl bg-marca-navy px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-marca-navy-deep hover:shadow-marca-navy/30"
                >
                  Solicitar cotización gratis
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/proceso"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 ring-1 ring-slate-200 transition-colors hover:ring-slate-900"
                >
                  Ver cómo trabajamos
                </Link>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={260}>
              <div className="mt-7 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {AVATARES.map((a) => (
                    <span
                      key={a.ini}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-black text-white ring-2 ring-white ${a.color}`}
                    >
                      {a.ini}
                    </span>
                  ))}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white ring-2 ring-white">
                    +20
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Clientes activos confían en RDC</p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={320}>
              <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
                <div>
                  <p className="text-2xl font-black text-slate-900">+10</p>
                  <p>años de experiencia</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p>declaraciones a tiempo</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-black text-slate-900">24/7</p>
                  <p>portal de clientes</p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Mockups con tilt + parallax */}
          <RevealOnScroll delay={120} className="relative hidden lg:block">
            <ParallaxLayer speed={0.05} mouseFactor={14}>
              <TiltLayer maxTilt={9} className="relative">
                <div className="relative rotate-1 rounded-3xl bg-white p-6 shadow-2xl shadow-indigo-200/40 ring-1 ring-slate-200">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Cumplimiento mensual
                      </p>
                      <p className="text-sm font-bold text-slate-900">Resumen del periodo</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Al día
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      "ISR retenciones",
                      "IVA mensual",
                      "DIOT",
                      "IMSS / Infonavit",
                    ].map((etiqueta) => (
                      <div key={etiqueta} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          <span className="text-sm font-semibold text-slate-800">{etiqueta}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">Presentado</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-[10px] font-medium text-slate-500">Actualizado hace 5 min</p>
                    <span className="text-[10px] font-bold text-marca-navy">rdcontadores.com</span>
                  </div>
                </div>

                <div className="absolute -bottom-10 -right-4 -rotate-6">
                  <MiniIphoneSemaforo />
                </div>

                <div className="absolute -left-5 -top-5 max-w-[170px] -rotate-6 rounded-xl bg-white px-3 py-2.5 shadow-xl ring-1 ring-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[10px] font-black leading-tight text-slate-900">Declaración enviada</p>
                      <p className="text-[9px] text-slate-500">hace 5 min</p>
                    </div>
                  </div>
                </div>
              </TiltLayer>
            </ParallaxLayer>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
