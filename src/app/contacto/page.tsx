import PublicShell from "@/components/publico/PublicShell";
import ContactoCine from "@/components/publico/ContactoCine";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import {
  buildLocalBusinessSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Contacto — Agendar, WhatsApp o contratar RESICO",
  description:
    "Tres formas de llegar al despacho: asesoría 1:1 de unos 40 minutos, platicar por WhatsApp, o empezar el alta RESICO. Primera llamada sin costo. Guadalajara, lun–vie 9–17.",
  path: "/contacto",
  keywords: [
    "contacto contador Guadalajara",
    "WhatsApp despacho contable",
    "agendar asesoría contable",
    "contratar RESICO",
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
      <ContactoCine />
    </PublicShell>
  );
}
