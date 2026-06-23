"use client";

import Link from "next/link";
import ParallaxLayer from "@/components/publico/motion/ParallaxLayer";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import TiltLayer from "@/components/publico/motion/TiltLayer";

function MiniIphoneSemaforo() {
  return (
    <div className="w-[170px] rounded-[2rem] bg-slate-900 p-1.5 shadow-2xl ring-1 ring-black/30">
      <div className="relative">
        <div
          className="absolute left-1/2 top-1.5 z-20 h-[14px] w-[48px] -translate-x-1/2 rounded-full bg-black ring-1 ring-black/60"
          aria-hidden
        >
          <span className="absolute right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-700/70" />
        </div>
        <div className="overflow-hidden rounded-[1.65rem] bg-white">
          <div className="flex items-center justify-between px-4 pb-1 pt-5">
            <span className="text-[8px] font-bold text-slate-700">9:41</span>
            <svg width="14" height="8" viewBox="0 0 22 14" fill="currentColor" className="text-slate-700">
              <rect x="0" y="9" width="3" height="5" rx="0.5" />
              <rect x="4" y="6" width="3" height="8" rx="0.5" />
              <rect x="8" y="3" width="3" height="11" rx="0.5" />
              <rect x="12" y="0" width="3" height="14" rx="0.5" />
            </svg>
          </div>
          <div className="px-3.5 pb-2 pt-2">
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
          <div className="flex justify-center pb-1.5">
            <span className="h-0.5 w-14 rounded-full bg-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCalculadora() {
  return (
    <div className="w-[120px] rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 shadow-xl shadow-indigo-500/30 ring-1 ring-white/20">
      <div className="rounded-lg bg-slate-900/40 px-2 py-1.5 text-right">
        <p className="font-mono text-[11px] font-bold text-emerald-300">$24,580</p>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((n) => (
          <span
            key={n}
            className="flex h-6 items-center justify-center rounded-md bg-white/15 text-[10px] font-bold text-white"
          >
            {n}
          </span>
        ))}
        <span className="col-span-2 flex h-6 items-center justify-center rounded-md bg-white/25 text-[10px] font-bold text-white">
          0
        </span>
        <span className="flex h-6 items-center justify-center rounded-md bg-emerald-400/90 text-[10px] font-black text-emerald-950">
          =
        </span>
      </div>
    </div>
  );
}

function MiniLaptop() {
  return (
    <div className="w-[150px]">
      <div className="overflow-hidden rounded-t-xl bg-slate-800 p-1 shadow-xl ring-1 ring-slate-700">
        <div className="rounded-lg bg-white p-2">
          <div className="mb-1.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="space-y-1">
            {[85, 62, 94, 48].map((w, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${w}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[7px] font-bold uppercase tracking-wider text-indigo-600">
            Declaración anual
          </p>
        </div>
      </div>
      <div className="mx-auto h-2 w-[92%] rounded-b-md bg-gradient-to-b from-slate-600 to-slate-700" />
    </div>
  );
}

function MiniBolsaDinero() {
  return (
    <div className="flex w-[110px] flex-col items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-3 shadow-xl shadow-amber-500/35 ring-1 ring-white/25">
      <span className="text-2xl" aria-hidden>
        💰
      </span>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-amber-950/70">
        Honorarios
      </p>
      <p className="text-sm font-black text-white">Al corriente</p>
    </div>
  );
}

function FloatingProp({
  children,
  className = "",
  floatClass = "hero-float",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  floatClass?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`absolute ${floatClass} ${className}`} style={style}>
      {children}
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
      <ParallaxLayer speed={0.04} mouseFactor={8} className="pointer-events-none absolute -right-32 -top-32 -z-10">
        <div className="h-[32rem] w-[32rem] rounded-full bg-indigo-300/35 blur-3xl" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.07} mouseFactor={-10} className="pointer-events-none absolute -bottom-40 -left-32 -z-10">
        <div className="h-[26rem] w-[26rem] rounded-full bg-violet-300/30 blur-3xl" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.02} mouseFactor={5} className="pointer-events-none absolute left-1/2 top-1/3 -z-10 -translate-x-1/2">
        <div className="h-64 w-64 rounded-full bg-sky-200/25 blur-3xl" />
      </ParallaxLayer>

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

          {/* Escena de mockups: portal + iPhone + laptop + calculadora + bolsa */}
          <RevealOnScroll delay={120} className="relative hidden min-h-[420px] lg:block">
            <ParallaxLayer speed={0.05} mouseFactor={14} className="relative mx-auto h-full max-w-[480px]">
              <TiltLayer maxTilt={8} className="relative pt-8">
                {/* Calculadora — arriba izquierda */}
                <ParallaxLayer speed={0.08} mouseFactor={18} className="absolute -left-8 top-0 z-20">
                  <FloatingProp
                    floatClass="hero-float-slow"
                    style={{ "--hero-rotate": "-8deg" } as React.CSSProperties}
                    className="relative left-0 top-0"
                  >
                    <MiniCalculadora />
                  </FloatingProp>
                </ParallaxLayer>

                {/* Laptop — arriba derecha */}
                <ParallaxLayer speed={0.06} mouseFactor={-16} className="absolute -right-6 top-2 z-20">
                  <FloatingProp
                    floatClass="hero-float-alt"
                    style={{ "--hero-rotate": "6deg", animationDelay: "0.8s" } as React.CSSProperties}
                    className="relative left-0 top-0"
                  >
                    <MiniLaptop />
                  </FloatingProp>
                </ParallaxLayer>

                {/* Tarjeta principal — portal */}
                <div className="relative z-10 mx-auto max-w-[340px] rotate-1 rounded-3xl bg-white p-6 shadow-2xl shadow-indigo-200/40 ring-1 ring-slate-200">
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
                    {["ISR retenciones", "IVA mensual", "DIOT", "IMSS / Infonavit"].map((etiqueta) => (
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

                {/* iPhone — abajo derecha */}
                <ParallaxLayer speed={0.09} mouseFactor={20} className="absolute -bottom-6 -right-2 z-30">
                  <FloatingProp
                    floatClass="hero-float"
                    style={{ "--hero-rotate": "-5deg", animationDelay: "1.2s" } as React.CSSProperties}
                    className="relative left-0 top-0"
                  >
                    <MiniIphoneSemaforo />
                  </FloatingProp>
                </ParallaxLayer>

                {/* Bolsa de dinero — abajo izquierda */}
                <ParallaxLayer speed={0.07} mouseFactor={-14} className="absolute -bottom-4 -left-4 z-20">
                  <FloatingProp
                    floatClass="hero-float-alt"
                    style={{ "--hero-rotate": "-12deg", animationDelay: "0.4s" } as React.CSSProperties}
                    className="relative left-0 top-0"
                  >
                    <MiniBolsaDinero />
                  </FloatingProp>
                </ParallaxLayer>

                {/* Notificación flotante */}
                <FloatingProp
                  floatClass="hero-float-slow"
                  style={{ "--hero-rotate": "-4deg", animationDelay: "1.6s" } as React.CSSProperties}
                  className="-left-2 top-[38%] z-30 max-w-[170px] rounded-xl bg-white px-3 py-2.5 shadow-xl ring-1 ring-slate-200"
                >
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
                </FloatingProp>

                {/* Badge REPSE */}
                <FloatingProp
                  floatClass="hero-float"
                  style={{ "--hero-rotate": "3deg", animationDelay: "2s" } as React.CSSProperties}
                  className="right-0 top-[42%] z-30 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-500/30"
                >
                  REPSE ✓
                </FloatingProp>
              </TiltLayer>
            </ParallaxLayer>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
