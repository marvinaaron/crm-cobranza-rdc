import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";
import HerramientaCine from "@/components/publico/HerramientaCine";
import PanelRfc from "@/components/publico/PanelRfc";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("rfc");

export const metadata = buildHerramientaMetadata(config);

export default function RfcPage() {
  return (
    <HerramientaCine
      config={config}
      icono={
        <img src="/logos/r-white.png" alt="" width={418} height={395} />
      }
      marca={{ linea: "RDC", sub: "Homoclave RFC" }}
      h1={
        <>
          Calculadora de RFC <em>homoclave</em>
        </>
      }
      lead="Con esta calculadora de RFC con homoclave para persona física estimas tu clave SAT: capturas nombre, apellidos y fecha de nacimiento, aplicamos el algoritmo público (4 letras, 6 dígitos AAMMDD y 3 de homoclave) y ves el RFC listo para copiar. Gratis, instantánea y 100 % en tu navegador: no enviamos tus datos."
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/isr-resico",
          label: "Calculadora ISR RESICO",
          detalle: "ISR del mes con las tasas oficiales 2026.",
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
        titulo: "Te armamos el RFC oficial",
        cuerpo:
          "Constancia de situación fiscal, alta ante el SAT y el régimen que te conviene. Primera llamada gratis.",
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
      <CalculadoraUsoEnvoltorio herramienta="rfc">
        <PanelRfc />
      </CalculadoraUsoEnvoltorio>
    </HerramientaCine>
  );
}
