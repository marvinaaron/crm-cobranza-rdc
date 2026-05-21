import type { Metadata } from "next";
import { JsonLd } from "@/lib/seo/json-ld";
import { ORGANIZACION, SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Herramientas fiscales · RDC Contadores",
    template: "%s · RDC Contadores",
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "AccountingService",
  name: ORGANIZACION.name,
  url: ORGANIZACION.url,
  logo: ORGANIZACION.logo,
  email: ORGANIZACION.email,
  description: ORGANIZACION.description,
  areaServed: {
    "@type": "Country",
    name: "México",
  },
  sameAs: [],
};

export default function HerramientasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={organizationLd} />
      {children}
    </>
  );
}
