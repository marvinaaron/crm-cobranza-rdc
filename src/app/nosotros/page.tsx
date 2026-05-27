import PublicShell from "@/components/publico/PublicShell";
import NosotrosSection from "@/components/publico/NosotrosSection";
import PortalShowcase from "@/components/publico/PortalShowcase";
import MapaPresencia from "@/components/publico/MapaPresencia";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";
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
      <EnlacePaginasPortal desde="nosotros" />
    </PublicShell>
  );
}
