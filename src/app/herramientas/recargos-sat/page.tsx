import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import CalculadoraSat from "./CalculadoraSat";

const config = getHerramientaConfig("recargos-sat");

export const metadata = buildHerramientaMetadata(config);

export default function RecargosSatPage() {
  return (
    <HerramientaFiscalPage
      config={config}
      sinIntro
      ctaTitulo="¿El recargo se ve alto?"
      ctaSubtitulo="Revisamos si tus adeudos de 2024 y años anteriores califican para reducir recargos y multas. Diagnóstico sin compromiso."
    >
      <CalculadoraSat />
    </HerramientaFiscalPage>
  );
}
