import Link from "next/link";
import FaqAcordeon from "@/components/publico/FaqAcordeon";
import PanelResico from "@/components/publico/PanelResico";
import PublicShell from "@/components/publico/PublicShell";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("resico");

export const metadata = buildHerramientaMetadata(config);

/**
 * Página dedicada de la Calculadora de ISR RESICO. Misma plantilla que
 * la calculadora de RFC (es una HERRAMIENTA INTERACTIVA, no de consulta):
 *
 *   1. Breadcrumb compacto
 *   2. Hero con sellos de confianza
 *   3. Strip "Así de simple" (3 pasos)
 *   4. PANEL del cálculo como héroe + tabla de tasas
 *   5. Banner informativo
 *   6. Detalle técnico colapsable + FAQ
 *   7. CTA de contacto
 */
export default function IsrResicoPage() {
  return (
    <PublicShell>
      <JsonLd data={buildHerramientaJsonLd(config)} />

      <article className="bg-slate-50">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 pt-10 pb-6 sm:pt-14 sm:pb-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-marca-navy/15 via-marca-navy/8 to-sky-200/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-sky-200/40 to-marca-navy/8 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(15 29 46 / 0.5) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav
              className="text-xs text-slate-500 mb-5"
              aria-label="Ruta de navegación"
            >
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-slate-900">
                    Inicio
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/herramientas" className="hover:text-slate-900">
                    Herramientas fiscales
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-slate-700 font-medium">{config.h1}</li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                  aria-hidden="true"
                />
                Herramienta gratuita · RDC Contadores
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                  Calculadora de ISR
                </span>{" "}
                <span className="text-slate-800">RESICO</span>
              </h1>
              <p className="mt-3 text-slate-600 sm:text-lg">
                {config.subtitulo}
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                <Chip
                  color="violet"
                  icono={
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  }
                  label="Tasas oficiales 2026"
                />
                <Chip
                  color="sky"
                  icono={
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  }
                  label="Resultado instantáneo"
                />
                <Chip
                  color="amber"
                  icono={
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  }
                  label="Gratis · Sin registro"
                />
                <Chip
                  color="emerald"
                  icono={
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  }
                  label="Art. 113-E LISR"
                />
              </ul>
            </div>
          </div>
        </section>

        {/* Strip "Así de simple" */}
        <section className="pt-4 sm:pt-5 pb-2 sm:pb-3">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-marca-navy text-center mb-3">
              Así de simple
            </p>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
              {PASOS.map((paso, i) => (
                <li key={paso.numero} className="relative">
                  <div
                    className={`group relative h-full flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-white ring-1 ${paso.ringBase} overflow-hidden`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none select-none absolute -right-2 sm:-right-3 -bottom-5 sm:-bottom-6 text-[88px] sm:text-[110px] leading-none font-black ${paso.numeroColor}`}
                      style={{
                        fontFamily:
                          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {paso.numero}
                    </span>
                    <span
                      className={`relative z-10 shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${paso.iconoFondo} text-white ${paso.iconoSombra}`}
                      aria-hidden="true"
                    >
                      {paso.icono}
                    </span>
                    <div className="relative z-10 min-w-0 flex-1">
                      <p
                        className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${paso.eyebrow} leading-none mb-1`}
                      >
                        Paso {paso.numero}
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {paso.titulo}
                      </p>
                    </div>
                  </div>
                  {i < PASOS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden sm:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 text-slate-400"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* PANEL del cálculo — héroe */}
        <section className="pt-4 sm:pt-6 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-xl shadow-slate-200/50 p-5 sm:p-8 lg:p-10">
              <PanelResico />
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-50/50 ring-1 ring-sky-200 p-5 flex items-start gap-4">
              <span
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-sky-600 text-white shrink-0 shadow-sm shadow-sky-200"
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black text-sky-900">
                  En RESICO el cálculo es directo
                </p>
                <p className="text-xs sm:text-sm text-sky-800 mt-1 leading-relaxed">
                  No hay tablas con cuota fija ni excedentes: solo multiplicas tu
                  ingreso del mes por la tasa que te corresponde (entre 1.00 % y
                  2.50 %). Por eso se llama <strong>simplificado</strong>. Este
                  cálculo corre 100 % en tu navegador y es solo informativo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Detalle técnico colapsable */}
        <section className="pb-2">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <details className="group rounded-2xl bg-white ring-1 ring-slate-200 hover:ring-slate-300 transition-all overflow-hidden">
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-slate-50 transition-colors">
                <span className="text-sm font-bold text-slate-700">
                  Qué es RESICO y cómo funciona el cálculo
                </span>
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 transition-transform group-open:rotate-180 group-open:bg-marca-navy/10 group-open:text-marca-navy"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-4 border-t border-slate-200 space-y-3 text-sm text-slate-600 leading-relaxed">
                {config.intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                <p>
                  ¿Quieres ver todo a detalle?{" "}
                  <Link
                    href="/blog/que-es-resico-y-quien-puede-usarlo"
                    className="font-semibold text-marca-navy underline hover:text-violet-700"
                  >
                    Lee nuestra guía completa de RESICO 2026
                  </Link>
                  .
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* FAQ */}
        {config.faq.length > 0 && (
          <section className="py-12 sm:py-14" aria-labelledby="faq-resico">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="faq-resico"
                className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-6"
              >
                Preguntas frecuentes
              </h2>
              <FaqAcordeon items={config.faq} labelledBy="faq-resico" />
            </div>
          </section>
        )}

        {/* CTA final */}
        <section className="pb-16 sm:pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden bg-[radial-gradient(circle_at_15%_15%,#1e3a5f_0%,#0f1d2e_45%,#0a1424_100%)] text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl ring-1 ring-marca-navy/40">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-sky-400/15 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-marca-navy-soft/40 blur-3xl"
              />

              <div className="relative">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20">
                  ¿Te conviene RESICO?
                </span>
                <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black">
                  Deja que un contador{" "}
                  <span className="text-white">declare por ti</span>
                </h2>
                <p className="mt-3 text-white/80 max-w-xl mx-auto sm:text-base leading-relaxed">
                  En RDC presentamos tus declaraciones mensuales de RESICO,
                  emitimos tus facturas y te avisamos qué pagar y cuándo. Sin
                  filas, sin sustos con el SAT y desde $812 al mes.
                </p>
                <div className="mt-7 flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/contacto"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-marca-navy text-sm font-bold hover:bg-slate-50 transition-all hover:-translate-y-0.5 shadow-lg"
                  >
                    Quiero que me ayuden
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/herramientas"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 ring-1 ring-white/20 text-white text-sm font-bold hover:bg-white/15 backdrop-blur transition-colors"
                  >
                    Ver todas las herramientas
                  </Link>
                </div>
              </div>
            </div>

            <p className="mt-8 px-4 text-xs text-slate-500 text-center max-w-2xl mx-auto leading-relaxed">
              Información de referencia conforme al artículo 113-E de la Ley del
              ISR y la RMF 2026. Para trámites oficiales consulte con su
              contador.
            </p>
          </div>
        </section>
      </article>
    </PublicShell>
  );
}

const PASOS: Array<{
  numero: 1 | 2 | 3;
  titulo: string;
  ringBase: string;
  iconoFondo: string;
  iconoSombra: string;
  numeroColor: string;
  eyebrow: string;
  icono: React.ReactNode;
}> = [
  {
    numero: 1,
    titulo: "Escribe tu ingreso del mes",
    ringBase: "ring-indigo-200",
    iconoFondo: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    iconoSombra: "shadow-md shadow-indigo-300/50",
    numeroColor: "text-indigo-400/70",
    eyebrow: "text-indigo-600",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    numero: 2,
    titulo: "Aplicamos la tasa oficial",
    ringBase: "ring-violet-200",
    iconoFondo: "bg-gradient-to-br from-violet-500 to-violet-700",
    iconoSombra: "shadow-md shadow-violet-300/50",
    numeroColor: "text-violet-400/70",
    eyebrow: "text-violet-600",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
  {
    numero: 3,
    titulo: "Obtén tu ISR al instante",
    ringBase: "ring-emerald-200",
    iconoFondo: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    iconoSombra: "shadow-md shadow-emerald-300/50",
    numeroColor: "text-emerald-400/70",
    eyebrow: "text-emerald-600",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

const COLORES_CHIP: Record<
  "emerald" | "sky" | "amber" | "violet",
  { fondo: string; texto: string; borde: string; iconoFondo: string; iconoColor: string }
> = {
  emerald: {
    fondo: "bg-gradient-to-br from-emerald-50 via-emerald-100/80 to-emerald-50",
    texto: "text-emerald-900",
    borde: "ring-emerald-300/70",
    iconoFondo: "bg-emerald-500",
    iconoColor: "text-white",
  },
  sky: {
    fondo: "bg-gradient-to-br from-sky-50 via-sky-100/80 to-sky-50",
    texto: "text-sky-900",
    borde: "ring-sky-300/70",
    iconoFondo: "bg-sky-500",
    iconoColor: "text-white",
  },
  amber: {
    fondo: "bg-gradient-to-br from-amber-50 via-amber-100/80 to-amber-50",
    texto: "text-amber-900",
    borde: "ring-amber-300/70",
    iconoFondo: "bg-amber-500",
    iconoColor: "text-white",
  },
  violet: {
    fondo: "bg-gradient-to-br from-violet-50 via-violet-100/80 to-violet-50",
    texto: "text-violet-900",
    borde: "ring-violet-300/70",
    iconoFondo: "bg-violet-500",
    iconoColor: "text-white",
  },
};

function Chip({
  color,
  icono,
  label,
}: {
  color: keyof typeof COLORES_CHIP;
  icono: React.ReactNode;
  label: string;
}) {
  const c = COLORES_CHIP[color];
  return (
    <li
      className={`inline-flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full text-[11px] font-bold ring-1 ${c.fondo} ${c.texto} ${c.borde}`}
    >
      <span
        className={`shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full ${c.iconoFondo} ${c.iconoColor}`}
        aria-hidden="true"
      >
        {icono}
      </span>
      {label}
    </li>
  );
}
