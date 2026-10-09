import PublicShell from "@/components/publico/PublicShell";
import PreguntasFrecuentesContenido from "@/components/publico/PreguntasFrecuentesContenido";
import { FAQ_PUBLICAS } from "@/lib/faq-publicas";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import { buildBreadcrumbSchema } from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Preguntas frecuentes — antes de cambiarte de contador",
  description:
    "Honorarios, cómo cambiar de contador, portal de cliente, RESICO, nómina IMSS y más. Respuestas claras del despacho RDC.",
  path: "/preguntas-frecuentes",
  keywords: [
    "preguntas contador",
    "cómo cambiar de contador",
    "RESICO preguntas",
    "honorarios contador",
  ],
});

export default function PreguntasFrecuentesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_PUBLICAS.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.respuesta,
      },
    })),
  };

  return (
    <PublicShell>
      <JsonLd
        data={[
          faqSchema,
          buildBreadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Preguntas frecuentes", path: "/preguntas-frecuentes" },
          ]),
        ]}
      />
      <PreguntasFrecuentesContenido />
    </PublicShell>
  );
}
