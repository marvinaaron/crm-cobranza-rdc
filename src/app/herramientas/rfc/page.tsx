import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import PanelRfc from "@/components/publico/PanelRfc";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";

const config = getHerramientaConfig("rfc");

export const metadata = buildHerramientaMetadata(config);

export default function RfcPage() {
  return (
    <HerramientaFiscalPage config={config}>
      <PanelRfc />
    </HerramientaFiscalPage>
  );
}
