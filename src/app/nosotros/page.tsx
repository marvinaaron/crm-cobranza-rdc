import PublicShell from "@/components/publico/PublicShell";
import NosotrosSection from "@/components/publico/NosotrosSection";
import PortalShowcase from "@/components/publico/PortalShowcase";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";

export const metadata = {
  title: "Nosotros · RDC Contadores",
  description:
    "Conoce al despacho RDC Contadores: más de una década apoyando a personas físicas y morales con cumplimiento fiscal puntual y portal de cliente propio.",
};

export default function NosotrosPage() {
  return (
    <PublicShell>
      <PortalShowcase />
      <NosotrosSection />
      <EnlacePaginasPortal desde="nosotros" />
    </PublicShell>
  );
}
