import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import { PanelUma } from "@/components/publico/HerramientasFiscales";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";

const config = getHerramientaConfig("uma");

export const metadata = buildHerramientaMetadata(config);

export default function UmaPage() {
  return (
    <HerramientaFiscalPage config={config}>
      <PanelUma />
    </HerramientaFiscalPage>
  );
}
