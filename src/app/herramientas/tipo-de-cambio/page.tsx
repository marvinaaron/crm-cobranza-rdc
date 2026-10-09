import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import PanelDivisas from "@/components/publico/PanelDivisas";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";

const config = getHerramientaConfig("divisas");

export const metadata = buildHerramientaMetadata(config);

export default function TipoDeCambioPage() {
  return (
    <HerramientaFiscalPage
      config={config}
      ctaTitulo="¿Facturas en dólares o necesitas el tipo de cambio para el SAT?"
      ctaSubtitulo="Facturación, declaraciones y portal de cliente. Cotización sin compromiso."
    >
      <PanelDivisas />
    </HerramientaFiscalPage>
  );
}
