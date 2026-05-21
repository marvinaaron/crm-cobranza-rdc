import dynamic from "next/dynamic";
import Link from "next/link";
import PublicShell from "./PublicShell";
import HerramientasNav from "./HerramientasNav";
import {
  buildHerramientaJsonLd,
  type HerramientaSeoConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const TickerDivisas = dynamic(() => import("./TickerDivisas"), {
  loading: () => <div className="h-9 border-b border-slate-200/80 bg-white/95" />,
});

type Props = {
  config: HerramientaSeoConfig;
  children: React.ReactNode;
};

/**
 * Plantilla server-side para páginas dedicadas de herramientas fiscales.
 * Incluye texto indexable, FAQ visible y JSON-LD para Google.
 */
export default function HerramientaFiscalPage({ config, children }: Props) {
  return (
    <PublicShell>
      <JsonLd data={buildHerramientaJsonLd(config)} />
      {config.ticker ? <TickerDivisas /> : null}

      <article className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-500 mb-6" aria-label="Ruta de navegación">
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

          <header className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
              Herramientas fiscales · RDC Contadores
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              {config.h1}
            </h1>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">{config.subtitulo}</p>
          </header>

          <div className="prose prose-slate max-w-none mb-8 space-y-3">
            {config.intro.map((p, i) => (
              <p key={i} className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <HerramientasNav activo={config.id} />

          <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-6">
            {children}
          </div>

          {config.faq.length > 0 ? (
            <section className="mt-10" aria-labelledby="faq-herramienta">
              <h2
                id="faq-herramienta"
                className="text-lg font-bold text-slate-900 mb-4"
              >
                Preguntas frecuentes
              </h2>
              <dl className="space-y-4">
                {config.faq.map((f) => (
                  <div
                    key={f.pregunta}
                    className="rounded-xl ring-1 ring-slate-200 bg-white px-5 py-4"
                  >
                    <dt className="font-semibold text-slate-900 text-sm">{f.pregunta}</dt>
                    <dd className="mt-2 text-sm text-slate-600 leading-relaxed">{f.respuesta}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <p className="mt-8 text-xs text-slate-500 text-center">
            Información de referencia. Para casos específicos consulte con su contador.{" "}
            <Link href="/contacto" className="text-indigo-600 font-semibold hover:underline">
              Contactar a RDC Contadores
            </Link>
          </p>
        </div>
      </article>
    </PublicShell>
  );
}
