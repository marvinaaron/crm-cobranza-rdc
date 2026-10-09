import PublicShell from "@/components/publico/PublicShell";
import NosotrosSection from "@/components/publico/NosotrosSection";
import PortalShowcase from "@/components/publico/PortalShowcase";
import MapaPresencia from "@/components/publico/MapaPresencia";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";
import CtaConversionHerramienta from "@/components/ui/cta-conversion-herramienta";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import {
  buildPersonSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Nosotros — el equipo detrás del portal",
  description:
    "Aaron Rosales fundó RDC Contadores en Guadalajara con un portal propio para sus clientes. Cumplimiento fiscal con cercanía, tecnología y honorarios sin sorpresas.",
  path: "/nosotros",
  keywords: [
    "contador Guadalajara nosotros",
    "Aaron Rosales contador",
    "despacho contable Guadalajara equipo",
  ],
});

export default function NosotrosPage() {
  return (
    <PublicShell>
      <JsonLd
        data={[
          buildPersonSchema(),
          buildBreadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Nosotros", path: "/nosotros" },
          ]),
        ]}
      />
      <PortalShowcase />
      <NosotrosSection />
      <MapaPresencia />
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <CtaConversionHerramienta
            titulo="¿Quieres conocer el portal antes de contratar?"
            subtitulo="Contador en Guadalajara + portal propio. Pruébalo con una cotización sin compromiso."
          />
        </div>
      </section>
      <EnlacePaginasPortal desde="nosotros" />
    </PublicShell>
  );
}
