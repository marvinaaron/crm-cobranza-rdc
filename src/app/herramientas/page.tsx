import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import HerramientasFiscales from "@/components/publico/HerramientasFiscales";
import HerramientasNav from "@/components/publico/HerramientasNav";
import { HERRAMIENTAS } from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";
import { ORGANIZACION, SITE_URL } from "@/lib/seo/site";

const TickerDivisas = dynamic(
  () => import("@/components/publico/TickerDivisas"),
  {
    loading: () => <div className="h-9 border-b border-slate-200/80 bg-white/95" />,
  }
);

const HUB_DESCRIPTION =
  "Consulta gratis ISR 2026, INPC 2026 con histórico INEGI, UMA vigente, salario mínimo 2026, recargos federales y tipo de cambio USD FIX. Herramientas de RDC Contadores.";

export const metadata: Metadata = {
  title: "Herramientas fiscales · ISR, INPC, UMA, salario mínimo y tipo de cambio",
  description: HUB_DESCRIPTION,
  keywords: [
    "herramientas fiscales",
    "ISR 2026",
    "INPC 2026",
    "UMA 2026",
    "salario mínimo 2026",
    "tipo de cambio México",
    "tablas SAT",
  ],
  alternates: { canonical: `${SITE_URL}/herramientas` },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: `${SITE_URL}/herramientas`,
    title: "Herramientas fiscales · RDC Contadores",
    description:
      "ISR, INPC, UMA, salario mínimo, recargos y divisas. Datos de referencia para contadores y contribuyentes en México.",
    siteName: ORGANIZACION.name,
  },
};

const ETIQUETAS: Record<string, string> = {
  inpc: "INPC 2026",
  isr: "Tarifas ISR 2026",
  uma: "UMA vigente",
  salario: "Salario mínimo 2026",
  recargos: "Recargos federales",
  divisas: "Tipo de cambio",
};

const hubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Herramientas fiscales",
  description: HUB_DESCRIPTION,
  url: `${SITE_URL}/herramientas`,
  hasPart: HERRAMIENTAS.map((h) => ({
    "@type": "WebPage",
    name: h.h1,
    url: `${SITE_URL}${h.path}`,
  })),
};

export default function HerramientasPage() {
  return (
    <PublicShell>
      <JsonLd data={hubJsonLd} />
      <TickerDivisas />

      <section className="py-10 sm:py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Consulta gratuita
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Herramientas fiscales para México
          </h1>
          <p className="mt-3 text-slate-600 max-w-3xl leading-relaxed">
            Tablas y cotizaciones de referencia: Impuesto Sobre la Renta (ISR), Índice Nacional de
            Precios al Consumidor (INPC), Unidad de Medida y Actualización (UMA), salario mínimo,
            recargos federales y tipo de cambio. Cada herramienta tiene su propia página para
            consulta detallada.
          </p>

          <div className="mt-6">
            <HerramientasNav activo="hub" />
          </div>

          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HERRAMIENTAS.map((h) => (
              <li key={h.id}>
                <Link
                  href={h.path}
                  className="block rounded-xl ring-1 ring-slate-200 bg-slate-50 px-4 py-3 hover:ring-indigo-300 hover:bg-indigo-50/50 transition-all"
                >
                  <p className="font-bold text-slate-900 text-sm">{ETIQUETAS[h.id]}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{h.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HerramientasFiscales />
    </PublicShell>
  );
}
