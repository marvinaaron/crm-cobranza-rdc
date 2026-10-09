import PublicShell from "@/components/publico/PublicShell";
import ContactoSection from "@/components/publico/ContactoSection";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import {
  buildLocalBusinessSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Contacto — Fiscalino te conecta con el equipo",
  description:
    "WhatsApp, correo o llamada. Fiscalino, nuestra IA, te conecta con el despacho. Primera plática sin costo. Lunes a viernes 9–17 desde Guadalajara.",
  path: "/contacto",
  keywords: [
    "contacto contador Guadalajara",
    "WhatsApp despacho contable",
    "agendar cita contador",
  ],
});

export default function ContactoPage() {
  return (
    <PublicShell>
      <JsonLd
        data={[
          buildLocalBusinessSchema(),
          buildBreadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Contacto", path: "/contacto" },
          ]),
        ]}
      />
      <ContactoSection />
    </PublicShell>
  );
}
