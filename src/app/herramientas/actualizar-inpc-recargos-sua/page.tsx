import { cache } from "react";
import ActualizarInpcRecargosSua from "@/components/publico/ActualizarInpcRecargosSua";
import HerramientaFiscalPage from "@/components/publico/HerramientaFiscalPage";
import { obtenerSerieInpc } from "@/lib/fiscal/inegi";
import {
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";

export const revalidate = 21600;

const cargarInpc = cache(obtenerSerieInpc);
const config = getHerramientaConfig("inpc-sua");

export async function generateMetadata() {
  return buildHerramientaMetadata(config);
}

export default async function ActualizarInpcRecargosSuaPage() {
  const datos = await cargarInpc();

  return (
    <HerramientaFiscalPage
      config={config}
      sinCaja
      ctaTitulo="¿El SUA te está arrojando diferencias o se te pasó el SIPARE?"
      ctaSubtitulo="Actualizamos INPC y recargos, y te sacamos la línea con la fecha de pago que elijas."
    >
      <ActualizarInpcRecargosSua
        serieInicial={datos.serie}
        origen="herramienta"
      />
    </HerramientaFiscalPage>
  );
}
