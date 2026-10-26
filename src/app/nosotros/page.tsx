import PublicShell from "@/components/publico/PublicShell";
import NosotrosCine from "@/components/publico/NosotrosCine";
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
      <NosotrosCine />
    </PublicShell>
  );
}
