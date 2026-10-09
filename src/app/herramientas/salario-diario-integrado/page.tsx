import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import CalculadoraSdi from "./CalculadoraSdi";

const config = getHerramientaConfig("sdi");

export const metadata = buildHerramientaMetadata(config);

export default function SalarioDiarioIntegradoPage() {
  return (
    <HerramientaFiscalPage
      config={config}
      ctaTitulo="¿Necesitas calcular SDI para IMSS o liquidaciones?"
      ctaSubtitulo="Nosotros lo calculamos por ti. Nómina, IMSS e INFONAVIT al día. Cotización sin compromiso."
    >
      <CalculadoraSdi />
    </HerramientaFiscalPage>
  );
}
