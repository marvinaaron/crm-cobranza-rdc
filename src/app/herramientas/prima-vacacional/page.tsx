import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import CalculadoraPrimaVacacional from "./CalculadoraPrimaVacacional";

const config = getHerramientaConfig("prima-vacacional");

export const metadata = buildHerramientaMetadata(config);

export default function PrimaVacacionalPage() {
  return (
    <HerramientaFiscalPage
      config={config}
      ctaTitulo="¿Tienes dudas sobre tus prestaciones laborales?"
      ctaSubtitulo="Nómina, vacaciones y cumplimiento laboral al día. Cotización sin compromiso."
    >
      <CalculadoraPrimaVacacional />
    </HerramientaFiscalPage>
  );
}
