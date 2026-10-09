import Link from "next/link";
import FaqAcordeon from "@/components/publico/FaqAcordeon";
import PanelCalculadoraFacturacion from "@/components/publico/PanelCalculadoraFacturacion";
import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";
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

      <article className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <nav className="text-xs text-slate-400 mb-6" aria-label="Ruta de navegación">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-slate-600">
                  Inicio
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/herramientas" className="hover:text-slate-600">
                  Herramientas
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-slate-600">Facturación</li>
            </ol>
          </nav>

          <header className="mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Calculadora de Facturación
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Calcula de forma rápida cuánto debes facturar para recibir un neto
              determinado. Conoce el subtotal, IVA y retenciones de tu CFDI.
            </p>
          </header>

          <CalculadoraUsoEnvoltorio herramienta="facturacion">
            <PanelCalculadoraFacturacion />
          </CalculadoraUsoEnvoltorio>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">
              El cálculo parte de tu neto deseado:{" "}
              <span className="font-medium text-slate-700">
                subtotal = neto ÷ (1 + IVA − ret. IVA − ret. ISR)
              </span>
              . Tasas conforme a LISR, LIVA y RMF 2026. Solo informativo.
            </p>
            <Link
              href="/herramientas/isr-resico"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-marca-navy hover:underline"
            >
              También: calculadora de ISR RESICO →
            </Link>
          </div>
        </div>

        {config.faq.length > 0 && (
          <section className="border-t border-slate-100 bg-slate-50/80 py-12" aria-labelledby="faq-facturacion">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              <h2
                id="faq-facturacion"
                className="text-lg font-bold text-slate-900 mb-5"
              >
                Preguntas frecuentes
              </h2>
              <FaqAcordeon items={config.faq} labelledBy="faq-facturacion" />
            </div>
          </section>
        )}

        <section className="py-12 border-t border-slate-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm text-slate-600 mb-4">
              ¿Quieres que emitamos tus facturas y presentemos tus declaraciones?
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/contacto"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-marca-navy text-white text-sm font-semibold hover:bg-marca-navy-soft transition"
              >
                Contactar a RDC
              </Link>
              <Link
                href="/herramientas"
                className="inline-flex items-center px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Más herramientas
              </Link>
            </div>
          </div>
        </section>
      </article>
    </PublicShell>
  );
}
