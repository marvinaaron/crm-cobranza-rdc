import type { Metadata } from "next";
import Link from "next/link";
import CtaCineBand from "@/components/publico/CtaCineBand";
import HerramientasPricingExperience from "@/components/publico/HerramientasPricingExperience";
import HeroHerramientasPro from "@/components/publico/HeroHerramientasPro";
import IconoAppHerramienta from "@/components/publico/IconoAppHerramienta";
import { FilaMetodosPago } from "@/components/publico/PaymentMethodLogos";
import PublicShell from "@/components/publico/PublicShell";
import {
  ETIQUETAS_HERRAMIENTA,
  LIMITE_GRATIS_POR_HERRAMIENTA,
  formatPrecioMxn,
  PRECIO_BUNDLE_MENSUAL,
} from "@/lib/herramientas/pricing";
import {
  HERRAMIENTAS,
  type HerramientaId,
  type HerramientaSeoConfig,
} from "@/lib/seo/herramientas-config";
import { SITE_URL } from "@/lib/seo/site";
import "@/components/publico/herramientas-pro-cine.css";

export const metadata: Metadata = {
  title: "Herramientas Pro+ · Planes y precios",
  description: `Desbloquea todas las herramientas fiscales RDC desde ${formatPrecioMxn(PRECIO_BUNDLE_MENSUAL)}/mes. ${LIMITE_GRATIS_POR_HERRAMIENTA} consultas gratis por calculadora.`,
  alternates: { canonical: `${SITE_URL}/herramientas/pro` },
};

const PASOS = [
  {
    n: "01",
    titulo: "Prueba gratis",
    texto: `${LIMITE_GRATIS_POR_HERRAMIENTA} consultas por calculadora, sin tarjeta.`,
  },
  {
    n: "02",
    titulo: "Elige tu plan",
    texto: "Una herramienta, el bundle mensual, anual o lifetime.",
  },
  {
    n: "03",
    titulo: "Paga seguro",
    texto: "Checkout con Stripe. Confirmación al instante.",
  },
  {
    n: "04",
    titulo: "Entra al portal",
    texto: "Mismo correo: verificas Pro+ y listo.",
  },
] as const;

const IDS_CALC: HerramientaId[] = [
  "rfc",
  "resico",
  "facturacion",
  "vencimiento",
  "recargos-sat",
];

const BUNDLE_SECCIONES: { titulo: string; ids: HerramientaId[] }[] = [
  { titulo: "Calculadoras", ids: IDS_CALC },
  {
    titulo: "Tablas fiscales",
    ids: HERRAMIENTAS.map((h) => h.id).filter((id) => !IDS_CALC.includes(id)),
  },
];

function porId(id: HerramientaId): HerramientaSeoConfig {
  const h = HERRAMIENTAS.find((x) => x.id === id);
  if (!h) throw new Error(`Bundle sin config: ${id}`);
  return h;
}

export default function HerramientasProPage() {
  return (
    <PublicShell>
      <div className="hp-page">
        <HeroHerramientasPro />

        <section className="hp-pasos" aria-label="Cómo funciona">
          <div className="hp-wrap hp-pasos-grid">
            {PASOS.map((p) => (
              <div key={p.n} className="hp-paso">
                <i>{p.n}</i>
                <b>{p.titulo}</b>
                <span>{p.texto}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="hp-pago">
          <div className="hp-wrap">
            <h2>Pago seguro con Stripe</h2>
            <p>
              No guardamos datos de tu tarjeta. Cobro cifrado, confirmación al
              instante y acceso Pro+ en cuanto se valida el pago.
            </p>
            <div className="hp-metodos">
              <FilaMetodosPago incluirTarjetas />
            </div>
          </div>
        </section>

        <section id="planes" className="hp-planes">
          <div className="hp-wrap">
            <HerramientasPricingExperience />
          </div>
        </section>

        <section className="hp-incluye" aria-labelledby="hp-incluye-titulo">
          <div className="hp-wrap">
            <h2 id="hp-incluye-titulo">Qué incluye el bundle</h2>
            {BUNDLE_SECCIONES.map((sec) => (
              <div key={sec.titulo} className="hp-incluye-cat">
                <h3>{sec.titulo}</h3>
                <ul className="hp-incluye-grid">
                  {sec.ids.map((id) => {
                    const h = porId(id);
                    const esCalc = IDS_CALC.includes(id);
                    return (
                      <li key={id}>
                        <Link href={h.path}>
                          {esCalc ? (
                            <IconoAppHerramienta id={id} size={36} />
                          ) : (
                            <span className="hp-incluye-check" aria-hidden>
                              ✓
                            </span>
                          )}
                          <b>{ETIQUETAS_HERRAMIENTA[id]}</b>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <CtaCineBand
          titulo={
            <>
              ¿Lo hacemos
              <br />
              por ti?
            </>
          }
          subtitulo="Si prefieres despacho + portal en lugar de solo las herramientas, cotiza honorarios. Primera llamada gratis."
        />
      </div>
    </PublicShell>
  );
}
