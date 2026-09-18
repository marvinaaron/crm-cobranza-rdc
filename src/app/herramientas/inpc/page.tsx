import { cache } from "react";
import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import InpcSeoBloques from "@/components/publico/InpcSeoBloques";
import { PanelInpc } from "@/components/publico/HerramientasFiscales";
import { obtenerSerieInpc } from "@/lib/fiscal/inegi";
import {
  buildHerramientaMetadata,
  configInpcConSerie,
} from "@/lib/seo/herramientas-config";

/** Relee INEGI/Banxico cada 6 h: el “último valor” cambia sin un commit. */
export const revalidate = 60 * 60 * 6;

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
      ctaTitulo="¿Necesitas actualizar precios o revisar inflación fiscal?"
      ctaSubtitulo="Te ayudamos con declaraciones, nómina y cumplimiento. Cotización sin compromiso."
      extra={<InpcSeoBloques serie={datos.serie} />}
    >
      <PanelInpc inicial={datos} />
    </HerramientaFiscalPage>
  );
}
