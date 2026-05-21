import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import { PanelIsr } from "@/components/publico/HerramientasFiscales";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";

const config = getHerramientaConfig("isr");

export const metadata = buildHerramientaMetadata(config);

export default function Isr2026Page() {
  return (
    <HerramientaFiscalPage config={config}>
      <PanelIsr />
    </HerramientaFiscalPage>
  );
}
