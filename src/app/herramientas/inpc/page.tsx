import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import { PanelInpc } from "@/components/publico/HerramientasFiscales";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";

const config = getHerramientaConfig("inpc");

export const metadata = buildHerramientaMetadata(config);

export default function InpcPage() {
  return (
    <HerramientaFiscalPage config={config}>
      <PanelInpc />
    </HerramientaFiscalPage>
  );
}
