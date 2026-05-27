import PublicShell from "@/components/publico/PublicShell";
import ServiciosGrid from "@/components/publico/ServiciosGrid";
import Honorarios from "@/components/publico/Honorarios";
import HonorariosShowcase from "@/components/publico/HonorariosShowcase";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";

export const metadata = {
  title: "Servicios · RDC Contadores",
  description:
    "Contabilidad, cumplimiento fiscal, nóminas, declaración anual y asesoría para personas físicas y morales. Pago en línea y factura digital desde tu portal RDC.",
};

export default function ServiciosPage() {
  return (
    <PublicShell>
      <ServiciosGrid />
      <Honorarios />
      <HonorariosShowcase />
      <EnlacePaginasPortal desde="servicios" />
    </PublicShell>
  );
}
