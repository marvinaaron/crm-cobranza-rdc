import PublicShell from "@/components/publico/PublicShell";
import HerramientasFiscales from "@/components/publico/HerramientasFiscales";

export const metadata = {
  title: "Herramientas fiscales · RDC Contadores",
  description:
    "Tablas vigentes de ISR, INPC, UMA, salario mínimo, subsidio al empleo y recargos federales. INPC sincronizado con INEGI.",
};

export default function HerramientasPage() {
  return (
    <PublicShell>
      <HerramientasFiscales />
    </PublicShell>
  );
}
