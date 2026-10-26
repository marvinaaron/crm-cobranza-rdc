import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";
import HerramientaCine from "@/components/publico/HerramientaCine";
import PanelCalculadoraFacturacion from "@/components/publico/PanelCalculadoraFacturacion";
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
    <HerramientaCine
      config={config}
      icono={
        <img src="/logos/r-white.png" alt="" width={418} height={395} />
      }
      marca={{ linea: "RDC", sub: "Facturación CFDI" }}
      h1={
        <>
          Calculadora de facturación <em>neto → CFDI</em>
        </>
      }
      lead="Con esta calculadora de facturación 2026 estimas el CFDI para recibir un neto: eliges emisor, receptor y tipo de operación, capturas lo que quieres en tu cuenta y resolvemos subtotal, IVA y retenciones (RESICO 1.25 %, PFAE, arrendamiento, AGAPES). Gratis, instantánea y con tasas de LISR, LIVA y RMF 2026."
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/isr-resico",
          label: "Calculadora ISR RESICO",
          detalle: "ISR del mes con las tasas oficiales 2026.",
        },
        {
          href: "/herramientas/rfc",
          label: "Calculadora de RFC",
          detalle: "Si aún no tienes tu clave, estímalo aquí.",
        },
        {
          href: "/preguntas-frecuentes",
          label: "Preguntas del despacho",
          detalle: "Cómo trabajamos, el portal y los honorarios.",
        },
      ]}
      cta={{
        titulo: "Que facturemos por ti",
        cuerpo:
          "CFDI, retenciones y declaraciones a tiempo. Primera llamada gratis.",
        primario: {
          href: "/contacto",
          label: "Hablar con un asesor",
        },
        secundario: {
          href: "/herramientas",
          label: "Todas las herramientas",
        },
      }}
    >
      <CalculadoraUsoEnvoltorio herramienta="facturacion">
        <PanelCalculadoraFacturacion />
      </CalculadoraUsoEnvoltorio>
    </HerramientaCine>
  );
}
