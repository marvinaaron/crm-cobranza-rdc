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
    <HerramientaFiscalPage config={config}>
      <PanelDivisas />
    </HerramientaFiscalPage>
  );
}
