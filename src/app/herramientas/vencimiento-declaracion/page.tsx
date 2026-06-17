import Link from "next/link";
import FaqAcordeon from "@/components/publico/FaqAcordeon";
import PanelVencimientoDeclaracion from "@/components/publico/PanelVencimientoDeclaracion";
import PublicShell from "@/components/publico/PublicShell";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("vencimiento");

export const metadata = buildHerramientaMetadata(config);

export default function VencimientoDeclaracionPage() {
  return (
    <PublicShell>
      <JsonLd data={buildHerramientaJsonLd(config)} />

      <article className="bg-slate-50">
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 pt-10 pb-6 sm:pt-14 sm:pb-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/40 via-amber-100/20 to-sky-200/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(15 29 46 / 0.45) 1px, transparent 0)",
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
                <li className="text-slate-700 font-medium">Vencimiento SAT</li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                  aria-hidden
                />
                Herramienta gratuita · RDC Contadores
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  ¿Cuándo vence
                </span>{" "}
                <span className="text-slate-800">tu declaración?</span>
              </h1>
              <p className="mt-3 text-slate-600 sm:text-lg">{config.subtitulo}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {[
                  "RFC + mes + año",
                  "Desglose paso a paso",
                  "100% en tu navegador",
                ].map((label) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 ring-1 ring-amber-200"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="pt-6 sm:pt-8 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <PanelVencimientoDeclaracion variante="pagina" />

            <div className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200 p-5 sm:p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
                Cómo funciona el calendario del SAT
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm text-slate-600 leading-relaxed">
                {config.intro.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                ¿Quieres la explicación completa con ejemplos?{" "}
                <Link
                  href="/blog/cuando-vence-mi-declaracion-segun-rfc"
                  className="font-bold text-amber-700 hover:underline"
                >
                  Lee el artículo del blog
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="pb-14 sm:pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-black text-slate-900 mb-4">
              Preguntas frecuentes
            </h2>
            <FaqAcordeon items={config.faq} />
          </div>
        </section>
      </article>
    </PublicShell>
  );
}
