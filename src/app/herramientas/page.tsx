import type { CSSProperties } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import CtaCineBand from "@/components/publico/CtaCineBand";
import HubHerramientasIntro from "@/components/publico/HubHerramientasIntro";
import IconoAppHerramienta from "@/components/publico/IconoAppHerramienta";
import PublicShell from "@/components/publico/PublicShell";
import { GLIFOS_TABLA } from "@/components/publico/glifos-tablas";
import { tonoHerramienta } from "@/lib/herramienta-tonos";
import {
  HERRAMIENTAS,
  type HerramientaId,
  type HerramientaSeoConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";
import {
  buildHerramientasItemListSchema,
  buildSiteNavigationSchema,
} from "@/lib/seo/jsonld";
import { ORGANIZACION, SITE_URL } from "@/lib/seo/site";
import "@/components/publico/herramientas-hub.css";

const TickerDivisas = dynamic(
  () => import("@/components/publico/TickerDivisas"),
  {
    loading: () => <div className="h-9 border-b border-slate-200/80 bg-white/95" />,
  }
);

const HUB_DESCRIPTION =
  "Calculadora de RFC con homoclave, facturación neto a CFDI, ISR 2026, INPC 2026 con histórico INEGI, UMA vigente, salario mínimo 2026, recargos federales y tipo de cambio USD FIX. Calculadoras con 3 consultas gratis; tablas de consulta abierta. RDC Contadores.";

export const metadata: Metadata = {
  title: "Herramientas fiscales · Calculadora RFC, ISR, INPC, UMA y más",
  description: HUB_DESCRIPTION,
  keywords: [
    "herramientas fiscales",
    "calculadora RFC",
    "RFC con homoclave",
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

/** Orden y copy corto del hub (las rutas/SEO viven en HERRAMIENTAS). */
const CALCULADORAS: Array<{
  id: HerramientaId;
  nombre: string;
  tagline: string;
}> = [
  { id: "rfc", nombre: "Calculadora de RFC", tagline: "Homoclave persona física" },
  { id: "resico", nombre: "ISR RESICO", tagline: "Estima el ISR del mes" },
  {
    id: "facturacion",
    nombre: "Facturación CFDI",
    tagline: "Neto deseado → CFDI con retenciones",
  },
  {
    id: "vencimiento",
    nombre: "Vencimiento",
    tagline: "Tu fecha límite según el RFC",
  },
  {
    id: "recargos-sat",
    nombre: "Recargos SAT",
    tagline: "Adeudo con actualización e INPC",
  },
  {
    id: "sdi",
    nombre: "Salario Diario Integrado",
    tagline: "Factor de integración LFT",
  },
];

const TABLAS: Array<{
  id: HerramientaId;
  nombre: string;
  tagline: string;
}> = [
  { id: "inpc", nombre: "INPC 2026", tagline: "Inflación · INEGI" },
  { id: "isr", nombre: "Tarifas ISR 2026", tagline: "Anual, retenciones, RIF" },
  { id: "inpc-sua", nombre: "SUA · Actualiza", tagline: "INPC y recargos IMSS" },
  { id: "uma", nombre: "UMA vigente", tagline: "Unidad de medida" },
  {
    id: "salario",
    nombre: "Salario mínimo 2026",
    tagline: "General y frontera norte",
  },
  { id: "recargos", nombre: "Tasas de recargos", tagline: "Mora 2026 · SUA" },
  { id: "divisas", nombre: "Tipo de cambio", tagline: "USD FIX · UDI · TIIE" },
  {
    id: "prima-vacacional",
    nombre: "Prima vacacional",
    tagline: "Cálculo LFT 2026",
  },
];

function porId(id: HerramientaId): HerramientaSeoConfig {
  const h = HERRAMIENTAS.find((x) => x.id === id);
  if (!h) throw new Error(`Herramienta hub sin config: ${id}`);
  return h;
}

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

function Flecha() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function HerramientasPage() {
  return (
    <PublicShell>
      <JsonLd
        data={[
          hubJsonLd,
          buildHerramientasItemListSchema(),
          ...buildSiteNavigationSchema(),
        ]}
      />
      <TickerDivisas />

      <div className="hh-page">
        <div className="hh-wrap">
          <HubHerramientasIntro />

          <section id="calculadoras" className="hh-seccion" aria-labelledby="hh-calc-titulo">
            <div className="hh-seccion-cab">
              <h2 id="hh-calc-titulo">Calculadoras</h2>
              <p>
                Cada una con su icono de app. Entras, calculas y copias el
                resultado en el navegador.
              </p>
            </div>
            <ul className="hh-calc-grid">
              {CALCULADORAS.map((item) => {
                const cfg = porId(item.id);
                const t = tonoHerramienta(item.id);
                return (
                  <li key={item.id}>
                    <Link
                      href={cfg.path}
                      className="hh-calc"
                      style={{ "--hh-chispa": t.chispa } as CSSProperties}
                    >
                      <div className="hh-calc-top">
                        <IconoAppHerramienta id={item.id} size={64} />
                      </div>
                      <div className="hh-calc-copy">
                        <b>{item.nombre}</b>
                        <span>{item.tagline}</span>
                      </div>
                      <span className="hh-calc-foot">
                        Abrir
                        <Flecha />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section id="tablas" className="hh-seccion" aria-labelledby="hh-tabla-titulo">
            <div className="hh-seccion-cab">
              <h2 id="hh-tabla-titulo">Tablas fiscales</h2>
              <p>
                Consultas y tarifas de referencia. Datos alineados a SAT,
                INEGI, CONASAMI y Banxico.
              </p>
            </div>
            <ul className="hh-tabla-grid">
              {TABLAS.map((item) => {
                const cfg = porId(item.id);
                const t = tonoHerramienta(item.id);
                return (
                  <li key={item.id}>
                    <Link
                      href={cfg.path}
                      className="hh-tabla"
                      style={{ "--hh-chispa": t.chispa } as CSSProperties}
                    >
                      <span className="hh-tabla-glifo" aria-hidden>
                        {GLIFOS_TABLA[item.id]}
                      </span>
                      <span className="hh-tabla-copy">
                        <b>{item.nombre}</b>
                        <span>{item.tagline}</span>
                      </span>
                      <span className="hh-tabla-flecha" aria-hidden>
                        <Flecha />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="hh-nota">
            Calculadoras: 3 consultas gratis por herramienta, sin registro.
            Tablas de consulta abierta. Información de referencia; para trámites
            oficiales usa las fuentes oficiales o habla con tu contador.
          </p>
        </div>

        <CtaCineBand
          titulo={
            <>
              ¿Lo hacemos
              <br />
              por ti?
            </>
          }
          subtitulo="Cotiza tu paquete o escríbenos por WhatsApp. Contador en Guadalajara + portal. Primera llamada gratis."
        />
      </div>
    </PublicShell>
  );
}
