import HerramientaTabla from "@/components/publico/HerramientaTabla";
import PanelDivisas from "@/components/publico/PanelDivisas";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("divisas");

export const metadata = buildHerramientaMetadata(config);

export default function TipoDeCambioPage() {
  return (
    <HerramientaTabla
      config={config}
      cabezal={{ oficina: "RDC · Tablas", fuente: "Banxico · BCE" }}
      h1={
        <>
          Tipo de cambio <em>hoy</em>
        </>
      }
      lead={
        <>
          Cotizaciones de referencia para México: divisas vs peso,{" "}
          <strong>USD FIX</strong> de Banxico, UDI y TIIE cuando hay conexión.
          El FIX es la referencia habitual para efectos fiscales. Usa el
          conversor para estimar montos en pesos.
        </>
      }
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/calculadora-facturacion",
          label: "Factura neto → CFDI",
          detalle: "Si cobras en dólares, convierte y arma el CFDI.",
        },
        {
          href: "/herramientas/inpc",
          label: "INPC · INEGI",
          detalle: "Otro índice de referencia para actualizar montos.",
        },
        {
          href: "/herramientas/recargos-sat",
          label: "Calculadora de recargos",
          detalle: "Si el pago en moneda extranjera se atrasó ante el SAT.",
        },
      ]}
      cta={{
        titulo: "¿Facturas en dólares o necesitas el FIX para el SAT?",
        cuerpo:
          "Facturación, declaraciones y portal de cliente. Primera llamada gratis.",
        primario: { href: "/contacto", label: "Hablar con un asesor" },
        secundario: { href: "/herramientas", label: "Todas las herramientas" },
      }}
    >
      <PanelDivisas />
    </HerramientaTabla>
  );
}
