import PublicShell from "@/components/publico/PublicShell";
import ServiciosGrid from "@/components/publico/ServiciosGrid";
import Honorarios from "@/components/publico/Honorarios";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";

export const metadata = {
  title: "Servicios · RDC Contadores",
  description:
    "Contabilidad, cumplimiento fiscal, nóminas, declaración anual y asesoría para personas físicas y morales en RDC Contadores.",
};

export default function ServiciosPage() {
  return (
    <PublicShell>
      <ServiciosGrid />
      <Honorarios />
      <EnlacePaginasPortal desde="servicios" />
    </PublicShell>
  );
}
