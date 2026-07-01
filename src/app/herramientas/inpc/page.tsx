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
    <HerramientaFiscalPage
      config={config}
      ctaTitulo="¿Necesitas actualizar precios o revisar inflación fiscal?"
      ctaSubtitulo="Te ayudamos con declaraciones, nómina y cumplimiento. Cotización sin compromiso."
    >
      <PanelInpc />
    </HerramientaFiscalPage>
  );
}
