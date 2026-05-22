import PublicShell from "@/components/publico/PublicShell";
import AvisoPrivacidadContenido from "@/components/publico/AvisoPrivacidadContenido";
import { SITE_URL } from "@/lib/seo/site";

export const metadata = {
  title: "Aviso de privacidad · RDC Contadores",
  description:
    "Aviso de privacidad de RDC Contadores conforme a la LFPDPPP. Transparencia en el tratamiento de sus datos personales y fiscales.",
  alternates: { canonical: `${SITE_URL}/aviso-de-privacidad` },
};

export default function AvisoPrivacidadPage() {
  return (
    <PublicShell>
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <AvisoPrivacidadContenido />
      </section>
    </PublicShell>
  );
}
