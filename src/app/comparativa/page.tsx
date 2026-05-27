import PublicShell from "@/components/publico/PublicShell";
import ComparativaSection from "@/components/publico/ComparativaSection";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import { buildBreadcrumbSchema } from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Despacho tradicional vs RDC — qué cambia el día que te cambias",
  description:
    "Comparativa honesta: portal vs WhatsApp suelto, acuses 24/7 vs pedirlos, honorarios públicos vs sorpresas. Lo que cambia cuando te vienes con RDC.",
  path: "/comparativa",
  keywords: [
    "cambiar de contador",
    "comparativa despacho contable",
    "por qué cambiar de despacho contable",
    "qué buscar en un contador",
  ],
});

export default function ComparativaPage() {
  return (
    <PublicShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Comparativa", path: "/comparativa" },
        ])}
      />
      <ComparativaSection />
    </PublicShell>
  );
}
