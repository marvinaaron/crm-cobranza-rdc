import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";
import HerramientaCine from "@/components/publico/HerramientaCine";
import PanelVencimientoDeclaracion from "@/components/publico/PanelVencimientoDeclaracion";
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
    <HerramientaCine
      config={config}
      icono={
        <img src="/logos/r-white.png" alt="" width={418} height={395} />
      }
      marca={{ linea: "RDC", sub: "Vencimiento SAT" }}
      h1={
        <>
          ¿Cuándo vence tu <em>declaración</em>?
        </>
      }
      lead="Con esta calculadora de vencimiento de declaración SAT estimas tu fecha límite mensual: capturas tu RFC, el mes y el año, partimos del día 17, sumamos los días hábiles del 6º dígito y, si cae en fin de semana, recorremos al siguiente hábil. Gratis, instantánea y 100 % en tu navegador: no guardamos tu RFC."
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/blog/cuando-vence-mi-declaracion-segun-rfc",
          label: "Guía del 6º dígito",
          detalle: "La regla completa, un ejemplo y qué pasa en festivos.",
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
        titulo: "Que no se te pase la fecha",
        cuerpo:
          "Declaraciones a tiempo, recordatorios y tu calendario en el portal. Primera llamada gratis.",
        primario: {
          href: "/empezar",
          label: "Que lo declare el despacho",
        },
        secundario: {
          href: "/herramientas",
          label: "Todas las herramientas",
        },
      }}
    >
      <CalculadoraUsoEnvoltorio herramienta="vencimiento">
        <PanelVencimientoDeclaracion variante="pagina" />
      </CalculadoraUsoEnvoltorio>
    </HerramientaCine>
  );
}
