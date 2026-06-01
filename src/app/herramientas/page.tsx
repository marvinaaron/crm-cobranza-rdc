import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import { HERRAMIENTAS } from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";
import {
  buildHerramientasItemListSchema,
  buildSiteNavigationSchema,
} from "@/lib/seo/jsonld";
import { ORGANIZACION, SITE_URL } from "@/lib/seo/site";

const TickerDivisas = dynamic(
  () => import("@/components/publico/TickerDivisas"),
  {
    loading: () => <div className="h-9 border-b border-slate-200/80 bg-white/95" />,
  }
);

const HUB_DESCRIPTION =
  "Calculadora de RFC con homoclave, ISR 2026, INPC 2026 con histórico INEGI, UMA vigente, salario mínimo 2026, recargos federales y tipo de cambio USD FIX. Herramientas gratuitas de RDC Contadores.";

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

/**
 * Meta por herramienta: nombre, tagline corto, icono y color.
 *
 * El color define el "tema" visual de cada tarjeta (borde + halo +
 * fondo de icono). Está mapeado a familias intuitivas:
 *
 *   - RFC      → indigo  (identidad fiscal)
 *   - INPC     → emerald (tendencia/economía)
 *   - ISR      → amber   (impuesto federal)
 *   - UMA      → violet  (unidad de referencia)
 *   - Salario  → sky     (laboral)
 *   - Recargos → rose    (alerta / mora)
 *   - Divisas  → slate   (mercados)
 *
 * Cada paleta tiene 3 tokens: borde de tarjeta, fondo de chip de icono
 * y color del icono. Se asigna automáticamente abajo en el render.
 */
const META: Record<
  string,
  {
    nombre: string;
    tagline: string;
    color: {
      borde: string;
      hoverBorde: string;
      fondoIcono: string;
      icono: string;
      eyebrowText: string;
    };
    svg: React.ReactNode;
  }
> = {
  rfc: {
    nombre: "Calculadora de RFC",
    tagline: "Persona física con homoclave",
    color: {
      borde: "ring-indigo-200",
      hoverBorde: "hover:ring-indigo-500",
      fondoIcono: "bg-indigo-100",
      icono: "text-indigo-700",
      eyebrowText: "text-indigo-600",
    },
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="M6 17c.7-1.5 2-2.5 3-2.5s2.3 1 3 2.5" />
        <line x1="14" y1="9" x2="18" y2="9" />
        <line x1="14" y1="13" x2="18" y2="13" />
      </svg>
    ),
  },
  inpc: {
    nombre: "INPC 2026",
    tagline: "Índice de precios INEGI",
    color: {
      borde: "ring-emerald-200",
      hoverBorde: "hover:ring-emerald-500",
      fondoIcono: "bg-emerald-100",
      icono: "text-emerald-700",
      eyebrowText: "text-emerald-600",
    },
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
  },
  isr: {
    nombre: "Tarifas ISR 2026",
    tagline: "Anual, retenciones, RIF",
    color: {
      borde: "ring-amber-200",
      hoverBorde: "hover:ring-amber-500",
      fondoIcono: "bg-amber-100",
      icono: "text-amber-700",
      eyebrowText: "text-amber-600",
    },
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
  uma: {
    nombre: "UMA vigente",
    tagline: "Unidad de medida y actualización",
    color: {
      borde: "ring-violet-200",
      hoverBorde: "hover:ring-violet-500",
      fondoIcono: "bg-violet-100",
      icono: "text-violet-700",
      eyebrowText: "text-violet-600",
    },
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  salario: {
    nombre: "Salario mínimo 2026",
    tagline: "General y frontera norte",
    color: {
      borde: "ring-sky-200",
      hoverBorde: "hover:ring-sky-500",
      fondoIcono: "bg-sky-100",
      icono: "text-sky-700",
      eyebrowText: "text-sky-600",
    },
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <line x1="6" y1="12" x2="6.01" y2="12" />
        <line x1="18" y1="12" x2="18.01" y2="12" />
      </svg>
    ),
  },
  recargos: {
    nombre: "Recargos federales",
    tagline: "Pago extemporáneo SAT",
    color: {
      borde: "ring-rose-200",
      hoverBorde: "hover:ring-rose-500",
      fondoIcono: "bg-rose-100",
      icono: "text-rose-700",
      eyebrowText: "text-rose-600",
    },
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <polyline points="12 9 12 13 14 15" />
        <path d="M5 3 2 6" />
        <path d="m22 6-3-3" />
      </svg>
    ),
  },
  divisas: {
    nombre: "Tipo de cambio",
    tagline: "USD FIX · UDI · TIIE · divisas",
    color: {
      borde: "ring-slate-200",
      hoverBorde: "hover:ring-slate-500",
      fondoIcono: "bg-slate-100",
      icono: "text-slate-700",
      eyebrowText: "text-slate-600",
    },
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
      </svg>
    ),
  },
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
      <JsonLd
        data={[
          hubJsonLd,
          buildHerramientasItemListSchema(),
          ...buildSiteNavigationSchema(),
        ]}
      />
      <TickerDivisas />

      <section className="py-14 sm:py-20 bg-gradient-to-b from-white via-slate-50/60 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header centrado, minimalista. El eyebrow + título +
              subtítulo establecen el tono editorial. */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
              Consulta gratuita
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              Herramientas fiscales
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                siempre actualizadas
              </span>
            </h1>
            <p className="mt-4 text-slate-600 leading-relaxed sm:text-lg">
              Calculadora de RFC, ISR, INPC con datos INEGI, UMA, salario mínimo,
              recargos y tipo de cambio. Cada herramienta vive en su propia página
              para consulta dedicada.
            </p>
          </div>

          {/* Grid de tarjetas: 1 / 2 / 3 columnas. Más respiradas que
              antes, con icono prominente por tema y tagline corto.
              El badge "Nuevo" sigue destacando RFC sin romper la rejilla. */}
          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {HERRAMIENTAS.map((h) => {
              const meta = META[h.id];
              const esNuevo = h.id === "rfc";
              if (!meta) return null;
              return (
                <li key={h.id}>
                  <Link
                    href={h.path}
                    className={`group relative block h-full rounded-2xl bg-white ring-1 ${meta.color.borde} ${meta.color.hoverBorde} p-5 sm:p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60`}
                  >
                    {/* Badge "Nuevo" en la esquina superior derecha,
                        absoluto para no afectar el flujo del icono. */}
                    {esNuevo && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200">
                        Nuevo
                      </span>
                    )}

                    {/* Icono coloreado por tema. */}
                    <div
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${meta.color.fondoIcono} ${meta.color.icono} mb-4 transition-transform group-hover:scale-110`}
                      aria-hidden="true"
                    >
                      {meta.svg}
                    </div>

                    {/* Nombre + tagline corto + arrow al final. */}
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${meta.color.eyebrowText} mb-1`}
                    >
                      {meta.tagline}
                    </p>
                    <p className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {meta.nombre}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                      {h.description.replace(/\.$/, "")}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-slate-900">
                      Abrir
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Tag SEO suelto al pie. Texto pequeño con keywords sin
              saturar visualmente. */}
          <p className="mt-10 text-center text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Herramientas creadas por contadores titulados, gratuitas y sin
            registro. Datos actualizados según fuentes oficiales (SAT, INEGI,
            CONASAMI, Banxico).
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
