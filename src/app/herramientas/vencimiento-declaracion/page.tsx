import Link from "next/link";
import PanelVencimientoDeclaracion from "@/components/publico/PanelVencimientoDeclaracion";
import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";
import PublicShell from "@/components/publico/PublicShell";
import VencimientoSeoBloques from "@/components/publico/VencimientoSeoBloques";
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
                <li className="text-slate-700 font-medium">Vencimiento Impuestos</li>
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
              <p className="mt-3 text-slate-600 sm:text-lg">
                Captura tu RFC, el mes y el año. Te damos la fecha.
              </p>
            </div>
          </div>
        </section>

        <section className="pt-6 sm:pt-8 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <CalculadoraUsoEnvoltorio herramienta="vencimiento">
              <PanelVencimientoDeclaracion variante="pagina" />
            </CalculadoraUsoEnvoltorio>

            <VencimientoSeoBloques />
          </div>
        </section>
      </article>
    </PublicShell>
  );
}
