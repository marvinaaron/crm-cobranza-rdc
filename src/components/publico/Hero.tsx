"use client";

import Link from "next/link";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

const AVATARES = [
  { ini: "JM", color: "bg-indigo-500" },
  { ini: "AR", color: "bg-emerald-500" },
  { ini: "LC", color: "bg-amber-500" },
  { ini: "DR", color: "bg-rose-500" },
];

function PortalPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xl shadow-indigo-200/30 ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Portal de cliente
          </p>
          <p className="text-sm font-bold text-slate-900">Tu situación ante el SAT</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
          Al día
        </span>
      </div>
      <div className="space-y-2">
        {[
          { label: "Opinión 32-D", estado: "Positiva" },
          { label: "IVA mensual", estado: "Presentado" },
          { label: "ISR RESICO", estado: "Presentado" },
          { label: "Honorarios", estado: "Pagado" },
        ].map((fila) => (
          <div
            key={fila.label}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-slate-800">{fila.label}</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700">{fila.estado}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
        rdcontadores.com/portal · disponible 24/7
      </p>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100 py-10 sm:py-14 lg:py-16">
      <div
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 -z-10 h-64 w-64 rounded-full bg-violet-300/25 blur-3xl"
        aria-hidden
      />
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
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <RevealOnScroll>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm ring-1 ring-slate-200">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Despacho contable · Guadalajara
              </span>
            </RevealOnScroll>

            <RevealOnScroll delay={40}>
              <h1 className="mt-3 text-3xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.5rem]">
                Contador real +{" "}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                  portal propio
                </span>{" "}
                para tu negocio.
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={80}>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
                Declaraciones, cumplimiento y asesoría por WhatsApp. Ves tu{" "}
                <span className="font-bold text-slate-900">información fiscal</span> en un
                portal exclusivo, cuando quieras.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={120}>
              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/empezar"
                  className="group inline-flex h-11 items-center justify-center gap-2 px-5 rounded-xl bg-marca-navy text-white text-sm font-bold shadow-md transition-all hover:-translate-y-0.5 hover:bg-marca-navy-deep"
                >
                  Empezar ahora
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href={CONTACTO_PUBLICO.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center px-5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900 ring-1 ring-slate-200 transition-colors hover:ring-slate-900"
                >
                  WhatsApp directo
                </a>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={160}>
              <div className="mt-5 flex items-center gap-3">
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
                      <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">
                    Clientes activos confían en RDC
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <div className="mt-5 flex items-center gap-5 text-[11px] text-slate-500">
                <div>
                  <p className="text-xl font-black text-slate-900">+10</p>
                  <p>años</p>
                </div>
                <div className="h-8 w-px bg-slate-200" aria-hidden />
                <div>
                  <p className="text-xl font-black text-slate-900">100%</p>
                  <p>a tiempo</p>
                </div>
                <div className="h-8 w-px bg-slate-200" aria-hidden />
                <div>
                  <p className="text-xl font-black text-slate-900">24/7</p>
                  <p>portal</p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={100} className="lg:pl-4">
            <PortalPreview />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
