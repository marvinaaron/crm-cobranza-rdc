import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import ServiciosCarritoCotizar from "@/components/publico/ServiciosCarritoCotizar";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";

export const metadata = buildPublicMetadata({
  title: "Cotizar · Arma tu paquete con RDC Contadores",
  description:
    "Elige tipo de empresa, régimen, servicios e ingresos. Luego cotiza en Empezar o escríbenos por WhatsApp. Sin compromiso.",
  path: "/cotizar",
  keywords: [
    "cotizar contador Guadalajara",
    "precio contabilidad RESICO",
    "armar cotización contador",
  ],
});

/**
 * Paso 1 del funnel: armar paquete.
 * Paso 2: /empezar (datos) · atajo: WhatsApp desde el carrito.
 */
export default function CotizarPage() {
  return (
    <PublicShell>
      <article className="relative min-h-[calc(100dvh-4rem)] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
          <nav
            className="text-xs text-slate-400 mb-3"
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
          <p className="text-[11px] text-slate-500 mb-1">
            Paso 1 de 2 · Arma tu paquete → luego tus datos en Empezar
          </p>
        </div>
        <ServiciosCarritoCotizar />
      </article>
    </PublicShell>
  );
}
