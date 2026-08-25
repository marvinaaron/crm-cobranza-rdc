import PublicShell from "@/components/publico/PublicShell";
import HonorariosShowcase from "@/components/publico/HonorariosShowcase";
import ServiciosGrid from "@/components/publico/ServiciosGrid";
import RegimenesServicioGrid from "@/components/publico/RegimenesServicioGrid";
import Honorarios from "@/components/publico/Honorarios";
import ServiciosCarritoCotizar from "@/components/publico/ServiciosCarritoCotizar";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";
import CtaConversionHerramienta from "@/components/ui/cta-conversion-herramienta";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import {
  buildServicesSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Servicios y honorarios — RESICO desde $812/mes",
  description:
    "Contabilidad mensual para personas físicas (RESICO desde $812), personas morales con nómina, REPSE/ICSOE/SISUB y declaración anual. Cotización gratis.",
  path: "/servicios",
  keywords: [
    "honorarios contador Guadalajara",
    "precio RESICO mensual",
    "contabilidad persona moral precio",
    "REPSE ICSOE SISUB contador",
  ],
});

export default function ServiciosPage() {
  return (
    <PublicShell>
      <JsonLd
        data={[
          ...buildServicesSchema(),
          buildBreadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Servicios", path: "/servicios" },
          ]),
        ]}
      />
      {/* 1 · Por régimen y especialidad → 2 · Servicios → 3 · Honorarios portal */}
      <RegimenesServicioGrid />
      <ServiciosGrid />
      <HonorariosShowcase />
      <Honorarios />
      <ServiciosCarritoCotizar />
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <CtaConversionHerramienta
            titulo="¿Listo para cotizar tu régimen?"
            subtitulo="RESICO, persona moral o nómina. Portal de cliente incluido. Sin compromiso."
          />
        </div>
      </section>
      <EnlacePaginasPortal desde="servicios" />
    </PublicShell>
  );
}
