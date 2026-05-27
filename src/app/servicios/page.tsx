import PublicShell from "@/components/publico/PublicShell";
import ServiciosGrid from "@/components/publico/ServiciosGrid";
import Honorarios from "@/components/publico/Honorarios";
import HonorariosShowcase from "@/components/publico/HonorariosShowcase";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import {
  buildServicesSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Servicios y honorarios — RESICO desde $812/mes",
  description:
    "Contabilidad mensual para personas físicas (RESICO desde $812), personas morales con nómina, REPSE/ICSOE/SISUB y declaración anual. Cotización gratis.",
  path: "/servicios",
  keywords: [
    "honorarios contador Guadalajara",
    "precio RESICO mensual",
    "contabilidad persona moral precio",
    "REPSE ICSOE SISUB contador",
  ],
});

export default function ServiciosPage() {
  return (
    <PublicShell>
      <JsonLd
        data={[
          ...buildServicesSchema(),
          buildBreadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Servicios", path: "/servicios" },
          ]),
        ]}
      />
      <ServiciosGrid />
      <Honorarios />
      <HonorariosShowcase />
      <EnlacePaginasPortal desde="servicios" />
    </PublicShell>
  );
}
