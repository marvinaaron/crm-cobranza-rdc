import PublicShell from "@/components/publico/PublicShell";
import NosotrosSection from "@/components/publico/NosotrosSection";
import PortalShowcase from "@/components/publico/PortalShowcase";
import MapaPresencia from "@/components/publico/MapaPresencia";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";

export const metadata = {
  title: "Nosotros · RDC Contadores",
  description:
    "Conoce al despacho RDC Contadores: más de una década apoyando a personas físicas y morales con cumplimiento fiscal puntual, portal de cliente propio y presencia en 7 estados de México.",
};

export default function NosotrosPage() {
  return (
    <PublicShell>
      <PortalShowcase />
      <NosotrosSection />
      <MapaPresencia />
      <EnlacePaginasPortal desde="nosotros" />
    </PublicShell>
  );
}
