import HerramientaCine from "@/components/publico/HerramientaCine";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";
import CalculadoraSat from "./CalculadoraSat";
import MockAcuseSat from "./MockAcuseSat";

const config = getHerramientaConfig("recargos-sat");

export const metadata = buildHerramientaMetadata(config);

export default function RecargosSatPage() {
  return (
    <HerramientaCine
      config={config}
      icono={
        <img src="/logos/r-white.png" alt="" width={418} height={395} />
      }
      marca={{ linea: "RDC", sub: "Recargos SAT" }}
      h1={
        <>
          Calculadora de recargos y <em>actualización</em>
        </>
      }
      lead="Con esta calculadora de recargos y actualización SAT 2026 estimas lo que cobra el SAT si pagas tarde: capturas el impuesto omitido, el mes en que debió pagarse y el mes de pago, aplicamos el INPC (art. 17-A) y la mora del art. 21 (2.07 % en 2026). Gratis e instantánea; es un estimado, sin multas."
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/blog/eliminar-multas-recargos-sat-anos-anteriores",
          label: "Reducir recargos de años anteriores",
          detalle: "Cuándo el SAT puede condonar recargos y multas.",
        },
        {
          href: "/herramientas/vencimiento-declaracion",
          label: "¿Cuándo vence mi declaración?",
          detalle: "La fecha límite según el 6º dígito de tu RFC.",
        },
        {
          href: "/preguntas-frecuentes",
          label: "Preguntas del despacho",
          detalle: "Cómo trabajamos, el portal y los honorarios.",
        },
      ]}
      cta={{
        titulo: "¿El recargo se ve alto?",
        cuerpo:
          "Revisamos si tus adeudos de 2024 y años anteriores califican para reducir recargos y multas. Primera llamada gratis.",
        primario: {
          href: "/contacto",
          label: "Hablar con un asesor",
        },
        secundario: {
          href: "/herramientas",
          label: "Todas las herramientas",
        },
      }}
      despues={<MockAcuseSat />}
    >
      <CalculadoraSat />
    </HerramientaCine>
  );
}
