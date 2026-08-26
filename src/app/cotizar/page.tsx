import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import ServiciosCarritoCotizar from "@/components/publico/ServiciosCarritoCotizar";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import { parsePaqueteQuery } from "@/lib/servicios-cotizables";

export const metadata = buildPublicMetadata({
  title: "Cotizar · Configura tu solución con RDC Contadores",
  description:
    "Cuéntanos de ti, te recomendamos un paquete y personalizas tu solución contable. Checkout en Empezar o WhatsApp. Sin compromiso.",
  path: "/cotizar",
  keywords: [
    "cotizar contador Guadalajara",
    "precio contabilidad RESICO",
    "configurar solución contable",
  ],
});

/**
 * Paso 1: carrito de servicios.
 * Paso 2: /empezar (checkout de datos) · atajo WhatsApp.
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
      <article className="relative min-h-[calc(100dvh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
          <nav
            className="text-xs text-slate-400"
            aria-label="Ruta de navegación"
          >
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-slate-600">
                  Inicio
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-slate-600">Cotizar</li>
            </ol>
          </nav>
        </div>
        <ServiciosCarritoCotizar paqueteInicialId={paqueteInicial} />
      </article>
    </PublicShell>
  );
}
