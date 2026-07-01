import Link from "next/link";
import FaqAcordeon from "@/components/publico/FaqAcordeon";
import PanelCalculadoraFacturacion from "@/components/publico/PanelCalculadoraFacturacion";
import PublicShell from "@/components/publico/PublicShell";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("facturacion");

export const metadata = buildHerramientaMetadata(config);

export default function CalculadoraFacturacionPage() {
  return (
    <PublicShell>
      <JsonLd data={buildHerramientaJsonLd(config)} />

      <article className="bg-slate-50">
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 pt-10 pb-6 sm:pt-14 sm:pb-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/15 via-violet-500/8 to-sky-200/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-sky-200/40 to-indigo-500/8 blur-3xl"
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
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-700">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                  aria-hidden="true"
                />
                Herramienta · RDC Contadores
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                  Calculadora de
                </span>{" "}
                <span className="text-slate-800">Facturación</span>
              </h1>
              <p className="mt-3 text-slate-600 sm:text-lg">{config.subtitulo}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                <Chip color="indigo" label="Neto → CFDI" />
                <Chip color="violet" label="RESICO y PFAE" />
                <Chip color="emerald" label="3 consultas gratis" />
                <Chip color="sky" label="Retenciones ISR e IVA" />
              </ul>
            </div>
          </div>
        </section>

        <section className="pt-4 sm:pt-5 pb-2 sm:pb-3">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-700 text-center mb-3">
              Así de simple
            </p>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
              {PASOS.map((paso, i) => (
                <li key={paso.numero} className="relative">
                  <div
                    className={`group relative h-full flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-white ring-1 ${paso.ringBase}`}
                  >
                    <span
                      className={`relative z-10 shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${paso.iconoFondo} text-white`}
                    >
                      {paso.numero}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${paso.eyebrow}`}>
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
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="pt-4 sm:pt-6 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-xl shadow-slate-200/50 p-5 sm:p-8 lg:p-10">
              <PanelCalculadoraFacturacion />
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50/50 ring-1 ring-indigo-200 p-5 flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600 text-white shrink-0 text-lg font-black">
                ƒ
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black text-indigo-900">
                  Cálculo inverso con tasas oficiales
                </p>
                <p className="text-xs sm:text-sm text-indigo-800 mt-1 leading-relaxed">
                  La fórmula parte de tu neto deseado y resuelve el subtotal:
                  <strong> subtotal = neto ÷ (1 + IVA − ret. IVA − ret. ISR)</strong>.
                  Ideal para freelancers y profesionistas que facturan a empresas.
                </p>
              </div>
            </div>

            <Link
              href="/herramientas/isr-resico"
              className="mt-4 group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-50/50 ring-1 ring-violet-200 p-5 hover:ring-violet-400 transition-all hover:-translate-y-0.5"
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-violet-600 text-white shrink-0 text-lg font-black">
                %
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-violet-900">
                  ¿Cuánto ISR pagas en RESICO?
                </p>
                <p className="text-xs sm:text-sm text-violet-800 mt-0.5 leading-relaxed">
                  Estima tu impuesto del mes con las tasas oficiales (1.00 % a 2.50 %).
                </p>
              </div>
              <span className="text-violet-600 font-black text-sm shrink-0 group-hover:translate-x-0.5 transition-transform">
                Abrir →
              </span>
            </Link>
          </div>
        </section>

        <section className="pb-2">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <details className="group rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden">
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-slate-50">
                <span className="text-sm font-bold text-slate-700">
                  Cómo interpretar el desglose
                </span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-5 pb-5 pt-4 border-t border-slate-200 space-y-3 text-sm text-slate-600 leading-relaxed">
                {config.intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </details>
          </div>
        </section>

        {config.faq.length > 0 && (
          <section className="py-12 sm:py-14" aria-labelledby="faq-facturacion">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="faq-facturacion"
                className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-6"
              >
                Preguntas frecuentes
              </h2>
              <FaqAcordeon items={config.faq} labelledBy="faq-facturacion" />
            </div>
          </section>
        )}

        <section className="pb-16 sm:pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-black">
                ¿Necesitas que facturemos por ti?
              </h2>
              <p className="mt-3 text-white/80 max-w-xl mx-auto sm:text-base leading-relaxed">
                En RDC emitimos tus CFDI, presentamos declaraciones y te avisamos
                qué pagar y cuándo.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-900 text-sm font-bold hover:bg-slate-50 transition"
                >
                  Quiero que me ayuden →
                </Link>
                <Link
                  href="/herramientas"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 ring-1 ring-white/20 text-white text-sm font-bold hover:bg-white/15"
                >
                  Ver todas las herramientas
                </Link>
              </div>
            </div>

            <p className="mt-8 px-4 text-xs text-slate-500 text-center max-w-2xl mx-auto leading-relaxed">
              Información de referencia conforme a LISR, LIVA, RLIVA y RMF 2026.
              Para trámites oficiales consulte con su contador.
            </p>
          </div>
        </section>
      </article>
    </PublicShell>
  );
}

const PASOS = [
  {
    numero: 1,
    titulo: "Elige emisor, receptor y operación",
    ringBase: "ring-indigo-200",
    iconoFondo: "bg-indigo-600",
    eyebrow: "text-indigo-600",
  },
  {
    numero: 2,
    titulo: "Captura el neto que quieres recibir",
    ringBase: "ring-violet-200",
    iconoFondo: "bg-violet-600",
    eyebrow: "text-violet-600",
  },
  {
    numero: 3,
    titulo: "Obtén subtotal, IVA y retenciones",
    ringBase: "ring-emerald-200",
    iconoFondo: "bg-emerald-600",
    eyebrow: "text-emerald-600",
  },
] as const;

const CHIP_COLORS = {
  indigo: "bg-indigo-50 text-indigo-900 ring-indigo-200",
  violet: "bg-violet-50 text-violet-900 ring-violet-200",
  emerald: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  sky: "bg-sky-50 text-sky-900 ring-sky-200",
} as const;

function Chip({
  color,
  label,
}: {
  color: keyof typeof CHIP_COLORS;
  label: string;
}) {
  return (
    <li
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ring-1 ${CHIP_COLORS[color]}`}
    >
      {label}
    </li>
  );
}
