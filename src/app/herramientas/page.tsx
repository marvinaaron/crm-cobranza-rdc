import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import CtaCineBand from "@/components/publico/CtaCineBand";
import HubHerramientasIntro from "@/components/publico/HubHerramientasIntro";
import IconoAppHerramienta from "@/components/publico/IconoAppHerramienta";
import PublicShell from "@/components/publico/PublicShell";
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
];

const TABLAS: Array<{
  id: HerramientaId;
  nombre: string;
  tagline: string;
  glifo: ReactNode;
}> = [
  {
    id: "inpc",
    nombre: "INPC 2026",
    tagline: "Inflación · INEGI",
    glifo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m7 15 4-5 3 3 5-7" />
      </svg>
    ),
  },
  {
    id: "isr",
    nombre: "Tarifas ISR 2026",
    tagline: "Anual, retenciones, RIF",
    glifo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "inpc-sua",
    nombre: "SUA · Actualiza",
    tagline: "INPC y recargos IMSS",
    glifo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h6M7 16h4" />
      </svg>
    ),
  },
  {
    id: "uma",
    nombre: "UMA vigente",
    tagline: "Unidad de medida",
    glifo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    ),
  },
  {
    id: "salario",
    nombre: "Salario mínimo 2026",
    tagline: "General y frontera norte",
    glifo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
  {
    id: "recargos",
    nombre: "Tasas de recargos",
    tagline: "Mora 2026 · SUA",
    glifo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2" />
        <path d="M5 3 2 6M22 6l-3-3" />
      </svg>
    ),
  },
  {
    id: "divisas",
    nombre: "Tipo de cambio",
    tagline: "USD FIX · UDI · TIIE",
    glifo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M2 12h20" />
        <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: "sdi",
    nombre: "Salario Diario Integrado",
    tagline: "Factor de integración",
    glifo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 10h6M9 14h6M9 18h3" />
      </svg>
    ),
  },
  {
    id: "prima-vacacional",
    nombre: "Prima vacacional",
    tagline: "Cálculo LFT 2026",
    glifo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4M16 2v4" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
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
                        {item.glifo}
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
