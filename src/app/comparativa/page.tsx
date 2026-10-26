import PublicShell from "@/components/publico/PublicShell";
import ComparativaSection from "@/components/publico/ComparativaSection";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import { buildBreadcrumbSchema } from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Despachos tradicionales vs el portal RDC",
  description:
    "Despacho tradicional vs el portal de RDC: WhatsApp suelto contra acuses 24/7, honorarios públicos y calendario en tu celular. Lo que pierdes si no te cambias.",
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
