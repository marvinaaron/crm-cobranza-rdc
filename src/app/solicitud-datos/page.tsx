import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import SolicitudDatosForm from "@/components/publico/SolicitudDatosForm";
import { SITE_URL } from "@/lib/seo/site";

export const metadata = {
  title: "Solicitud de datos personales · RDC Contadores",
  description:
    "Ejercer derechos ARCO o pedir la eliminación de tus datos personales tratados por RDC Contadores.",
  alternates: { canonical: `${SITE_URL}/solicitud-datos` },
  robots: { index: false, follow: true },
};

export default function SolicitudDatosPage() {
  return (
    <PublicShell>
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-3">
            Derechos del titular
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Solicitud de datos
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Usa este formulario para pedir acceso, rectificación, cancelación
            (eliminación) u oposición respecto de tus datos. También puedes
            escribir a{" "}
            <a
              href="mailto:contacto@rdcontadores.com"
              className="font-semibold text-marca-navy hover:underline"
            >
              contacto@rdcontadores.com
            </a>
            . Consulta el{" "}
            <Link
              href="/aviso-de-privacidad"
              className="font-semibold text-marca-navy hover:underline"
            >
              aviso de privacidad
            </Link>
            .
          </p>
          <div className="mt-8">
            <SolicitudDatosForm />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
