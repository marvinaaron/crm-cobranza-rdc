import PublicShell from "@/components/publico/PublicShell";
import ComoTrabajamos from "@/components/publico/ComoTrabajamos";
import HonorariosShowcase from "@/components/publico/HonorariosShowcase";
import PortalPreview from "@/components/publico/PortalPreview";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";
import CtaConversionHerramienta from "@/components/ui/cta-conversion-herramienta";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import { buildBreadcrumbSchema } from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Cómo trabajamos mes con mes",
  description:
    "Flujo de 7 pasos para cumplimiento fiscal con SAT y 5 pasos de cobranza. Transparencia, portal de cliente y cero sorpresas en RDC Contadores.",
  path: "/proceso",
  keywords: [
    "proceso contable mensual",
    "cómo trabaja un despacho contable",
    "flujo cumplimiento fiscal",
  ],
});

export default function ProcesoPage() {
  return (
    <PublicShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Cómo trabajamos", path: "/proceso" },
        ])}
      />
      <ComoTrabajamos />
      <HonorariosShowcase variant="proceso" />
      <PortalPreview />
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <CtaConversionHerramienta
            titulo="¿Te gusta cómo trabajamos?"
            subtitulo="Empieza hoy: cotización, portal de cliente y asesoría por WhatsApp."
          />
        </div>
      </section>
      <EnlacePaginasPortal desde="proceso" />
    </PublicShell>
  );
}
