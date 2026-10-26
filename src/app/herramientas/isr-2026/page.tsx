import HerramientaTabla from "@/components/publico/HerramientaTabla";
import PanelTarifasIsr from "@/components/publico/PanelTarifasIsr";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("isr");

export const metadata = buildHerramientaMetadata(config);

export default function Isr2026Page() {
  return (
    <HerramientaTabla
      config={config}
      cabezal={{ oficina: "RDC · Tablas", fuente: "Anexo 8 · RMF 2026" }}
      h1={
        <>
          Tarifas ISR <em>2026</em>
        </>
      }
      lead="Consulta las tarifas del Anexo 8 de la RMF 2026: anual, retenciones, pagos provisionales de PF y RIF bimestral, con el subsidio al empleo. Límites, cuota fija y porcentaje sobre el excedente; es referencia, no un cálculo de tu declaración."
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/isr-resico",
          label: "Calcula ISR RESICO",
          detalle: "Si estás en el régimen simplificado, la tarifa es otra.",
        },
        {
          href: "/herramientas/recargos-sat",
          label: "Recargos y actualización",
          detalle: "Si pagas fuera de plazo, el ISR se actualiza y recarga.",
        },
        {
          href: "/herramientas/inpc",
          label: "INPC · INEGI",
          detalle: "El índice que usa el SAT para actualizar.",
        },
      ]}
      cta={{
        titulo: "¿Quieres que calculemos tu ISR cada mes?",
        cuerpo:
          "Tarifas, provisionales y retenciones sin adivinar. Primera llamada gratis.",
        primario: { href: "/contacto", label: "Hablar con un asesor" },
        secundario: { href: "/herramientas", label: "Todas las herramientas" },
      }}
    >
      <PanelTarifasIsr />
    </HerramientaTabla>
  );
}
