import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import { PanelSalarioMinimo } from "@/components/publico/HerramientasFiscales";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";

const config = getHerramientaConfig("salario");

export const metadata = buildHerramientaMetadata(config);

export default function SalarioMinimoPage() {
  return (
    <HerramientaFiscalPage config={config}>
      <PanelSalarioMinimo />
    </HerramientaFiscalPage>
  );
}
