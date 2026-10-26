import PublicShell from "@/components/publico/PublicShell";
import TerminosContenido from "@/components/publico/TerminosContenido";
import { SITE_URL } from "@/lib/seo/site";

export const metadata = {
  title: "Términos y condiciones · RDC Contadores",
  description:
    "Términos y condiciones de uso del sitio y servicios digitales de RDC Contadores.",
  alternates: { canonical: `${SITE_URL}/terminos` },
};

export default function TerminosPage() {
  return (
    <PublicShell>
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <TerminosContenido />
      </section>
    </PublicShell>
  );
}
