import HerramientaCine from "@/components/publico/HerramientaCine";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";
import CalculadoraSdi from "./CalculadoraSdi";

const config = getHerramientaConfig("sdi");

export const metadata = buildHerramientaMetadata(config);

export default function SalarioDiarioIntegradoPage() {
  return (
    <HerramientaCine
      config={config}
      icono={
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logos/r-white.png" alt="" width={418} height={395} />
      }
      marca={{ linea: "RDC", sub: "SDI" }}
      h1={
        <>
          Salario Diario <em>Integrado</em>
        </>
      }
      lead="Calcula el SDI 2026 para IMSS e INFONAVIT: capturas sueldo, antigüedad y prima vacacional, aplicamos el factor de integración de la LFT (aguinaldo + vacaciones × prima ÷ 365) y ves el salario diario integrado con desglose. 3 consultas gratis."
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/prima-vacacional",
          label: "Prima vacacional",
          detalle: "La prima entra al factor de integración.",
        },
        {
          href: "/herramientas/salario-minimo-2026",
          label: "Salario mínimo 2026",
          detalle: "Referencia diaria general y frontera norte.",
        },
        {
          href: "/herramientas/uma",
          label: "UMA vigente",
          detalle: "Topes y referencias distintas al salario.",
        },
      ]}
      cta={{
        titulo: "¿Necesitas calcular SDI para IMSS o liquidaciones?",
        cuerpo:
          "Nómina, IMSS e INFONAVIT al día. Primera llamada gratis.",
        primario: { href: "/contacto", label: "Hablar con un asesor" },
        secundario: { href: "/herramientas", label: "Todas las herramientas" },
      }}
    >
      <CalculadoraSdi />
    </HerramientaCine>
  );
}
