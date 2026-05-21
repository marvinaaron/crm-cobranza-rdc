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
      <link rel="preconnect" href="https://api.frankfurter.app" crossOrigin="" />
      <link rel="preconnect" href="https://www.banxico.org.mx" crossOrigin="" />
      <link rel="preconnect" href="https://api.coingecko.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://www.inegi.org.mx" />
      <JsonLd data={organizationLd} />
      {children}
    </>
  );
}
