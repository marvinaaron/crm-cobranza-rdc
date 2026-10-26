import PublicShell from "@/components/publico/PublicShell";
import ComoTrabajamos from "@/components/publico/ComoTrabajamos";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import { buildBreadcrumbSchema } from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Cómo trabajamos mes con mes",
  description:
    "7 pasos de tu cumplimiento fiscal con comprobantes visibles todo el tiempo. Te mostramos cómo instalar la app en tu celular.",
  path: "/proceso",
  keywords: [
    "proceso contable mensual",
    "cómo trabaja un despacho contable",
    "flujo cumplimiento fiscal",
    "instalar app RDC Contadores",
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
      <EnlacePaginasPortal desde="proceso" className="bg-[#f6f6f6]" />
    </PublicShell>
  );
}
