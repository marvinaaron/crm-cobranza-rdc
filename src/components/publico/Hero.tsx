"use client";

import Link from "next/link";
import ParallaxLayer from "@/components/publico/motion/ParallaxLayer";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";

/** iPhone compacto con proporción estándar de mockup (~1:2). */
function MiniIphoneSemaforo() {
  return (
    <div className="h-[156px] w-[76px] rounded-[1.15rem] bg-gradient-to-b from-slate-800 to-slate-950 p-[4px] shadow-[0_14px_32px_-8px_rgba(0,0,0,0.4)] ring-1 ring-black/40">
      <div className="relative h-full">
        <div
          className="absolute left-1/2 top-[5px] z-20 h-[9px] w-[28px] -translate-x-1/2 rounded-full bg-black"
          aria-hidden
        />
        <div className="flex h-full flex-col overflow-hidden rounded-[0.95rem] bg-white">
          <div className="flex shrink-0 items-center justify-between px-2.5 pb-0.5 pt-3.5">
            <span className="text-[6px] font-bold text-slate-700">9:41</span>
            <svg width="10" height="5" viewBox="0 0 22 14" fill="currentColor" className="text-slate-700">
              <rect x="12" y="0" width="3" height="14" rx="0.5" />
            </svg>
          </div>
          <div className="shrink-0 px-2.5 pb-0.5">
            <p className="text-[5px] font-bold uppercase tracking-widest text-slate-400">Mi situación</p>
            <p className="text-[10px] font-black leading-none text-slate-900">SAT</p>
          </div>
          <div className="mx-1.5 mb-1.5 flex-1 rounded-md bg-gradient-to-br from-emerald-50 to-white p-1.5 ring-1 ring-emerald-200">
            <div className="flex items-start gap-1">
              <span className="relative mt-0.5 flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <div>
                <p className="text-[5px] font-bold uppercase leading-none tracking-wider text-emerald-700">
                  Opinión 32-D
                </p>
                <p className="text-[9px] font-black text-emerald-800">Positiva</p>
              </div>
            </div>
            <div className="mt-1.5 space-y-0.5">
              {["IVA", "ISR"].map((t) => (
                <div key={t} className="flex items-center justify-between rounded bg-white/80 px-1 py-px">
                  <span className="text-[5px] font-bold text-slate-600">{t}</span>
                  <span className="text-[5px] font-black text-emerald-600">✓</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 justify-center pb-1">
            <span className="h-0.5 w-8 rounded-full bg-slate-900/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Calculadora 3D con sombras (sin caras laterales sueltas). */
function MiniCalculadora3D() {
  return (
    <div className="hero-float-slow" style={{ perspective: "700px" }}>
      <div
        className="relative w-[108px] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-800 p-2.5 ring-1 ring-white/15"
        style={{
          transform: "rotateY(-12deg) rotateX(8deg)",
          boxShadow:
            "0 16px 32px -6px rgba(79,70,229,0.55), 0 6px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3), 4px 6px 0 rgba(55,48,163,0.45)",
        }}
      >
        <div className="rounded-lg bg-slate-950/50 px-2 py-1.5 text-right shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)]">
          <p className="font-mono text-[10px] font-bold text-emerald-300">$24,580</p>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-[3px]">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((n) => (
            <span
              key={n}
              className="flex h-[18px] items-center justify-center rounded-[5px] bg-gradient-to-b from-white/25 to-white/10 text-[9px] font-bold text-white shadow-[0_2px_0_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]"
            >
              {n}
            </span>
          ))}
          <span className="col-span-2 flex h-[18px] items-center justify-center rounded-[5px] bg-gradient-to-b from-white/30 to-white/15 text-[9px] font-bold text-white shadow-[0_2px_0_rgba(0,0,0,0.25)]">
            0
          </span>
          <span className="flex h-[18px] items-center justify-center rounded-[5px] bg-gradient-to-b from-emerald-300 to-emerald-500 text-[9px] font-black text-emerald-950 shadow-[0_2px_0_rgba(0,0,0,0.2)]">
            =
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniLaptop() {
  return (
    <div className="w-[130px] hero-float-alt" style={{ animationDelay: "0.6s" }}>
      <div className="overflow-hidden rounded-t-lg bg-slate-800 p-0.5 shadow-xl ring-1 ring-slate-700">
        <div className="rounded-md bg-white p-1.5">
          <div className="mb-1 flex items-center gap-0.5">
            <span className="h-1 w-1 rounded-full bg-rose-400" />
            <span className="h-1 w-1 rounded-full bg-amber-400" />
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
          </div>
          <div className="space-y-0.5">
            {[85, 62, 94].map((w, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${w}%` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-[6px] font-bold uppercase tracking-wider text-indigo-600">
            Declaración anual
          </p>
        </div>
      </div>
      <div className="mx-auto h-1.5 w-[90%] rounded-b-sm bg-gradient-to-b from-slate-600 to-slate-700" />
    </div>
  );
}

function MiniBolsaDinero() {
  return (
    <div className="hero-float flex w-[96px] flex-col items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 shadow-lg shadow-amber-500/30 ring-1 ring-white/25">
      <span className="text-xl" aria-hidden>
        💰
      </span>
      <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-950/70">
        Honorarios
      </p>
      <p className="text-xs font-black text-white">Al corriente</p>
    </div>
  );
}

function TaxBadge({
  label,
  status,
  variant = "indigo",
}: {
  label: string;
  status: string;
  variant?: "indigo" | "violet" | "emerald";
}) {
  const styles = {
    indigo: "from-indigo-600 to-indigo-700 shadow-indigo-500/25",
    violet: "from-violet-600 to-violet-700 shadow-violet-500/25",
    emerald: "from-emerald-600 to-teal-600 shadow-emerald-500/25",
  };
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${styles[variant]} px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-white shadow-md`}
    >
      <span>{label}</span>
      <span className="rounded-full bg-white/20 px-1 py-px text-[7px]">{status}</span>
    </div>
  );
}

const AVATARES = [
  { ini: "JM", color: "bg-indigo-500" },
  { ini: "AR", color: "bg-emerald-500" },
  { ini: "LC", color: "bg-amber-500" },
  { ini: "DR", color: "bg-rose-500" },
];

/**
 * Layout perimetral (propuesta implementada):
 *
 *        [Calculadora 3D]     [Laptop]
 *   [ISR ✓]                         [IVA ✓]
 *              [Portal central]
 *   [Notif.]                        [REPSE ✓]
 *        [Honorarios]          [iPhone]
 */
export default function Hero() {
  return (
    <section
      data-parallax-root
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white py-8 sm:py-10 lg:py-11"
    >
      <ParallaxLayer speed={0.04} mouseFactor={6} className="pointer-events-none absolute -right-24 -top-24 -z-10">
        <div className="h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.06} mouseFactor={-8} className="pointer-events-none absolute -bottom-24 -left-24 -z-10">
        <div className="h-64 w-64 rounded-full bg-violet-300/25 blur-3xl" />
      </ParallaxLayer>

      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 30%, black, transparent)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Copy — compacto */}
          <div>
            <RevealOnScroll>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm ring-1 ring-slate-200">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Cumplimiento fiscal mensual y anual
              </span>
            </RevealOnScroll>

            <RevealOnScroll delay={60}>
              <h1 className="mt-3 text-3xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.65rem]">
                Tu contabilidad{" "}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                  en buenas manos
                </span>
                .
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={100}>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-600">
                Obligaciones ante SAT, IMSS, Infonavit, ISN y REPSE. Cumplimiento puntual y un{" "}
                <span className="font-bold text-slate-900">portal exclusivo</span> para ver tu
                información en todo momento.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={140}>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href="/contacto"
                  className="group inline-flex items-center gap-2 rounded-xl bg-marca-navy px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-marca-navy-deep"
                >
                  Solicitar cotización gratis
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/proceso"
                  className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 ring-1 ring-slate-200 transition-colors hover:ring-slate-900"
                >
                  Ver cómo trabajamos
                </Link>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={180}>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {AVATARES.map((a) => (
                    <span
                      key={a.ini}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-black text-white ring-2 ring-white ${a.color}`}
                    >
                      {a.ini}
                    </span>
                  ))}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white ring-2 ring-white">
                    +20
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">Clientes activos confían en RDC</p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={220}>
              <div className="mt-5 flex items-center gap-5 text-[11px] text-slate-500">
                <div>
                  <p className="text-xl font-black text-slate-900">+10</p>
                  <p>años</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-xl font-black text-slate-900">100%</p>
                  <p>a tiempo</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-xl font-black text-slate-900">24/7</p>
                  <p>portal</p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Escena perimetral — elementos en los bordes, portal al centro */}
          <RevealOnScroll delay={80} className="relative hidden h-[320px] lg:block">
            {/* Portal — centro, sin tilt global para no amontonar */}
            <div className="absolute left-1/2 top-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-2xl bg-white p-4 shadow-xl shadow-indigo-200/30 ring-1 ring-slate-200">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Cumplimiento mensual
                    </p>
                    <p className="text-xs font-bold text-slate-900">Resumen del periodo</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold uppercase text-emerald-700">
                    Al día
                  </span>
                </div>
                <div className="space-y-2">
                  {["ISR retenciones", "IVA mensual", "DIOT", "IMSS / Infonavit"].map((etiqueta) => (
                    <div key={etiqueta} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-800">{etiqueta}</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700">Presentado</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 border-t border-slate-100 pt-2 text-[8px] text-slate-400">
                  rdcontadores.com · hace 5 min
                </p>
              </div>
            </div>

            {/* Esquina superior izquierda — calculadora 3D */}
            <ParallaxLayer speed={0.06} mouseFactor={12} className="absolute left-0 top-0 z-20">
              <MiniCalculadora3D />
            </ParallaxLayer>

            {/* Esquina superior derecha — laptop */}
            <ParallaxLayer speed={0.05} mouseFactor={-10} className="absolute right-0 top-1 z-20">
              <MiniLaptop />
            </ParallaxLayer>

            {/* Borde izquierdo — ISR */}
            <ParallaxLayer speed={0.04} mouseFactor={8} className="absolute left-[-4px] top-[38%] z-20">
              <div className="hero-float-slow" style={{ animationDelay: "0.3s" }}>
                <TaxBadge label="ISR" status="✓" variant="indigo" />
              </div>
            </ParallaxLayer>

            {/* Borde derecho superior — IVA */}
            <ParallaxLayer speed={0.05} mouseFactor={-12} className="absolute right-2 top-[22%] z-20">
              <div className="hero-float" style={{ animationDelay: "0.9s" }}>
                <TaxBadge label="IVA" status="✓" variant="violet" />
              </div>
            </ParallaxLayer>

            {/* Borde derecho medio — REPSE */}
            <ParallaxLayer speed={0.04} mouseFactor={-8} className="absolute right-0 top-[52%] z-20">
              <div className="hero-float-alt" style={{ animationDelay: "1.4s" }}>
                <TaxBadge label="REPSE" status="✓" variant="emerald" />
              </div>
            </ParallaxLayer>

            {/* Borde inferior izquierdo — honorarios */}
            <ParallaxLayer speed={0.07} mouseFactor={10} className="absolute bottom-0 left-0 z-20">
              <MiniBolsaDinero />
            </ParallaxLayer>

            {/* Borde inferior derecho — iPhone rectangular */}
            <ParallaxLayer speed={0.08} mouseFactor={14} className="absolute bottom-0 right-0 z-20">
              <div className="hero-float" style={{ animationDelay: "1.1s", "--hero-rotate": "-4deg" } as React.CSSProperties}>
                <MiniIphoneSemaforo />
              </div>
            </ParallaxLayer>

            {/* Borde izquierdo inferior — notificación (fuera del portal) */}
            <div
              className="hero-float-slow absolute left-0 top-[62%] z-20 max-w-[130px] rounded-lg bg-white px-2.5 py-2 shadow-lg ring-1 ring-slate-200"
              style={{ animationDelay: "1.7s" }}
            >
              <div className="flex items-center gap-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <p className="text-[9px] font-black text-slate-900">Declaración enviada</p>
                  <p className="text-[8px] text-slate-500">hace 5 min</p>
                </div>
              </div>
            </div>

            {/* Borde superior centro — DIOT badge pequeño */}
            <div
              className="hero-float-alt absolute left-[42%] top-[-2px] z-20"
              style={{ animationDelay: "2s" }}
            >
              <TaxBadge label="DIOT" status="OK" variant="indigo" />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
