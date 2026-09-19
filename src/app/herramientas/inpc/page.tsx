import { cache } from "react";
import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import InpcBanner from "@/components/publico/InpcBanner";
import InpcSeoBloques from "@/components/publico/InpcSeoBloques";
import InpcTextoIndexable from "@/components/publico/InpcTextoIndexable";
import { PanelInpc } from "@/components/publico/HerramientasFiscales";
import { obtenerSerieInpc } from "@/lib/fiscal/inegi";
import {
  buildHerramientaMetadata,
  configInpcConSerie,
} from "@/lib/seo/herramientas-config";

/** Relee INEGI/Banxico cada 6 h: el “último valor” cambia sin un commit. */
export const revalidate = 21600;

const cargarInpc = cache(obtenerSerieInpc);

export async function generateMetadata() {
  const datos = await cargarInpc();
  return buildHerramientaMetadata(configInpcConSerie(datos.serie));
}

export default async function InpcPage() {
  const datos = await cargarInpc();
  const config = configInpcConSerie(datos.serie);

  return (
    <HerramientaFiscalPage
      config={config}
      ctaTitulo="¿Necesitas el INPC para medir inflación o actualizar un contrato?"
      ctaSubtitulo="Te ayudamos con declaraciones, nómina y cumplimiento. Cotización sin compromiso."
      extra={<InpcSeoBloques serie={datos.serie} />}
      extraAntes={<InpcTextoIndexable serie={datos.serie} />}
      sinCaja
      banner={<InpcBanner serie={datos.serie} h1={config.h1} />}
      hero={{
        src: "/herramientas/inpc-hero-holograma.jpg",
        alt: "Aaron Rosales frente a un holograma del INPC 2026, con la gráfica y los valores de inflación.",
      }}
    >
      <PanelInpc inicial={datos} />
    </HerramientaFiscalPage>
  );
}
