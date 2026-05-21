import PublicShell from "@/components/publico/PublicShell";
import ComoTrabajamos from "@/components/publico/ComoTrabajamos";
import PortalPreview from "@/components/publico/PortalPreview";

export const metadata = {
  title: "Cómo trabajamos · RDC Contadores",
  description:
    "Conoce nuestro flujo de trabajo de 7 pasos para cumplimiento fiscal y 5 pasos de cobranza. Transparencia y orden mes con mes.",
};

export default function ProcesoPage() {
  return (
    <PublicShell>
      <ComoTrabajamos />
      <PortalPreview />
    </PublicShell>
  );
}
