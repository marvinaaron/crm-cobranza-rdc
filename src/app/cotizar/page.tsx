import PublicShell from "@/components/publico/PublicShell";
import ServiciosCarritoCotizar from "@/components/publico/ServiciosCarritoCotizar";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import { parsePaqueteQuery } from "@/lib/servicios-cotizables";

export const metadata = buildPublicMetadata({
  title: "Cotizar · Arma tu paquete con RDC Contadores",
  description:
    "Agrega a la bolsa lo que necesitas: RESICO con precio público, o pide cotización a tu medida. Sin compromiso.",
  path: "/cotizar",
  keywords: [
    "cotizar contador Guadalajara",
    "precio contabilidad RESICO",
    "paquete contable",
  ],
});

/**
 * Paso 1: bolsa de servicios.
 * Paso 2: /empezar (datos).
 * ?paquete=resico-facturacion preselecciona el paquete popular.
 */
export default async function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<{ paquete?: string }>;
}) {
  const sp = await searchParams;
  const paqueteInicial = parsePaqueteQuery(sp.paquete)?.id;

  return (
    <PublicShell>
      <ServiciosCarritoCotizar paqueteInicialId={paqueteInicial} />
    </PublicShell>
  );
}
