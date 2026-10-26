import EmpezarConversacion from "@/components/publico/EmpezarConversacion";
import PublicShell from "@/components/publico/PublicShell";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import {
  parsePerfilDesdeSearchParams,
  parseServiciosQuery,
} from "@/lib/servicios-cotizables";

export const metadata = buildPublicMetadata({
  title: "Empezar · Contratar con Fiscalino · RDC Contadores",
  description:
    "Fiscalino te hace unas preguntas y confirmas el servicio. RESICO a $812 IVA incluido si caben hasta 5 facturas al mes.",
  path: "/empezar",
  keywords: [
    "contratar contador Guadalajara",
    "contador RESICO",
    "despacho contable Guadalajara",
  ],
});

type Props = {
  searchParams?: Promise<{
    servicios?: string;
    mensaje?: string;
    tipo?: string;
    ingresos?: string;
    cfdi?: string;
    regimen?: string;
    regimenes?: string;
  }>;
};

export default async function EmpezarPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const ids = parseServiciosQuery(sp.servicios);
  const perfil = parsePerfilDesdeSearchParams(sp);

  return (
    <PublicShell flujo>
      <EmpezarConversacion serviciosIds={ids} perfil={perfil} />
    </PublicShell>
  );
}
