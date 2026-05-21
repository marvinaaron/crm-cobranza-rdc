import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import { PanelRecargos } from "@/components/publico/HerramientasFiscales";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";

const config = getHerramientaConfig("recargos");

export const metadata = buildHerramientaMetadata(config);

export default function RecargosFederalesPage() {
  return (
    <HerramientaFiscalPage config={config}>
      <PanelRecargos />
    </HerramientaFiscalPage>
  );
}
