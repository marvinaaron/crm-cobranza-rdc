import PublicShell from "@/components/publico/PublicShell";
import AvisoPrivacidadAceptacion from "@/components/publico/AvisoPrivacidadAceptacion";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Aceptar aviso de privacidad · RDC Contadores",
  robots: { index: false, follow: false },
};

export default async function AvisoPrivacidadTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <PublicShell>
      <AvisoPrivacidadAceptacion token={token} />
    </PublicShell>
  );
}
