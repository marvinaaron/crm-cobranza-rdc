import HerramientaTabla from "@/components/publico/HerramientaTabla";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";
import CalculadoraPrimaVacacional from "./CalculadoraPrimaVacacional";

const config = getHerramientaConfig("prima-vacacional");

export const metadata = buildHerramientaMetadata(config);

export default function PrimaVacacionalPage() {
  return (
    <HerramientaTabla
      config={config}
      cabezal={{ oficina: "RDC · Tablas", fuente: "Art. 80 LFT · 2026" }}
      h1={
        <>
          Prima <em>vacacional</em>
        </>
      }
      lead={
        <>
          Prestación mínima del <strong>25%</strong> del salario de los días de
          vacaciones (art. 80 LFT). Ingresa salario mensual, días y porcentaje
          (25%, 50% o el de tu empresa). Incluye tabla de días por antigüedad
          2026.
        </>
      }
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/salario-diario-integrado",
          label: "Salario Diario Integrado",
          detalle: "La prima forma parte del factor de integración.",
        },
        {
          href: "/herramientas/salario-minimo-2026",
          label: "Salario mínimo 2026",
          detalle: "Referencia diaria general y frontera norte.",
        },
        {
          href: "/herramientas/uma",
          label: "UMA vigente",
          detalle: "La exención de ISR de la prima se mide en UMAs.",
        },
      ]}
      cta={{
        titulo: "¿Tienes dudas sobre tus prestaciones laborales?",
        cuerpo:
          "Nómina, vacaciones y cumplimiento laboral al día. Primera llamada gratis.",
        primario: { href: "/contacto", label: "Hablar con un asesor" },
        secundario: { href: "/herramientas", label: "Todas las herramientas" },
      }}
    >
      <CalculadoraPrimaVacacional />
    </HerramientaTabla>
  );
}
