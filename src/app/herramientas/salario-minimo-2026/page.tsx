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
    <HerramientaFiscalPage
      config={config}
      ctaTitulo="¿Tienes empleados o nómina que declarar?"
      ctaSubtitulo="IMSS, INFONAVIT y obligaciones laborales al día. Cotización sin compromiso."
    >
      <PanelSalarioMinimo />
    </HerramientaFiscalPage>
  );
}
