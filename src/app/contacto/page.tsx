import PublicShell from "@/components/publico/PublicShell";
import ContactoSection from "@/components/publico/ContactoSection";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import {
  buildLocalBusinessSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Contacto — habla con Aaron por WhatsApp",
  description:
    "WhatsApp, correo o llamada. Lunes a viernes 9–17 desde Guadalajara. Respondemos en horas hábiles. Cotización gratis para tu régimen.",
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
