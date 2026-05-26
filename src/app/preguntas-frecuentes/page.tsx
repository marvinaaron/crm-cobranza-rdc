import PublicShell from "@/components/publico/PublicShell";
import PreguntasFrecuentesContenido from "@/components/publico/PreguntasFrecuentesContenido";
import { FAQ_PUBLICAS } from "@/lib/faq-publicas";

export const metadata = {
  title: "Preguntas frecuentes · RDC Contadores",
  description:
    "Resolvemos las dudas más comunes sobre nuestros servicios contables: honorarios, cambio de contador, portal de cliente, RESICO, nómina, IMSS y más.",
  alternates: {
    canonical: "/preguntas-frecuentes",
  },
};

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
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PreguntasFrecuentesContenido />
    </PublicShell>
  );
}
