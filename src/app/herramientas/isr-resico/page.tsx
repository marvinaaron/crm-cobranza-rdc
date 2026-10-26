import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";
import HerramientaCine from "@/components/publico/HerramientaCine";
import PanelResico from "@/components/publico/PanelResico";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";
import { hrefEmpezarResico } from "@/lib/servicios-cotizables";

const config = getHerramientaConfig("resico");

export const metadata = buildHerramientaMetadata(config);

export default function IsrResicoPage() {
  return (
    <HerramientaCine
      config={config}
      icono={
        <img src="/logos/r-white.png" alt="" width={418} height={395} />
      }
      marca={{ linea: "RDC", sub: "ISR RESICO" }}
      h1={
        <>
          Calculadora de ISR <em>RESICO</em>
        </>
      }
      lead="Con esta calculadora de ISR RESICO 2026 para persona física estimas el impuesto mensual a pagar: capturas tus ingresos facturados del mes, aplicamos las tasas oficiales del artículo 113-E (1.00 % a 2.50 %) y ves el ISR, el tramo y, si una actividad retiene el 1.25 %, cuánto queda a pagar o a favor. Gratis, instantánea y 100 % en tu navegador."
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/servicios/resico",
          label: "Guía RESICO",
          detalle: "Tasas, tope de $3.5 mdp y si te conviene el régimen.",
        },
        {
          href: "/herramientas/calculadora-facturacion",
          label: "Calculadora de facturación",
          detalle: "Subtotal, IVA y retención para armar el CFDI.",
        },
        {
          href: "/preguntas-frecuentes",
          label: "Preguntas del despacho",
          detalle: "Cómo trabajamos, el portal y los honorarios.",
        },
      ]}
      cta={{
        titulo: "Que un contador declare por ti",
        cuerpo:
          "Declaraciones mensuales de RESICO, facturas y avisos de qué pagar. Sin filas y desde $812 al mes.",
        primario: {
          href: hrefEmpezarResico(),
          label: "Empezar RESICO",
        },
        secundario: {
          href: "/herramientas",
          label: "Todas las herramientas",
        },
      }}
    >
      <CalculadoraUsoEnvoltorio herramienta="resico">
        <PanelResico />
      </CalculadoraUsoEnvoltorio>
    </HerramientaCine>
  );
}
