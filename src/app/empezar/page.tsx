import Link from "next/link";
import EmpezarForm from "@/components/publico/EmpezarForm";
import PublicShell from "@/components/publico/PublicShell";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";

export const metadata = buildPublicMetadata({
  title: "Empezar con RDC Contadores · Cotización y portal",
  description:
    "Solicita información en un minuto. Contador en Guadalajara + portal de cliente. Sin compromiso.",
  path: "/empezar",
  keywords: [
    "contratar contador Guadalajara",
    "contador RESICO",
    "despacho contable Guadalajara",
  ],
});

export default function EmpezarPage() {
  return (
    <PublicShell>
      <article className="bg-white min-h-screen">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <nav className="text-xs text-slate-400 mb-6" aria-label="Ruta de navegación">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-slate-600">
                  Inicio
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-slate-600">Empezar</li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Empieza con RDC
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Cuéntanos lo básico y te respondemos con cotización y próximos pasos.
              Si ya eres cliente, usa{" "}
              <Link href="/portal/login" className="font-semibold text-marca-navy hover:underline">
                acceso al portal
              </Link>
              .
            </p>
          </header>

          <EmpezarForm />

          <ul className="mt-8 space-y-3 text-xs text-slate-500">
            <li className="flex gap-2">
              <span className="text-marca-navy font-bold">✓</span>
              Portal con cumplimiento, honorarios y documentos SAT
            </li>
            <li className="flex gap-2">
              <span className="text-marca-navy font-bold">✓</span>
              RESICO desde $812/mes — precio transparente
            </li>
            <li className="flex gap-2">
              <span className="text-marca-navy font-bold">✓</span>
              Respuesta en horario hábil, usualmente &lt; 2 h
            </li>
          </ul>
        </div>
      </article>
    </PublicShell>
  );
}
