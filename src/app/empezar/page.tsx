import Link from "next/link";
import EmpezarCotizarSection from "@/components/publico/EmpezarCotizarSection";
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
      <article className="relative min-h-screen bg-gradient-to-b from-white via-violet-50/35 to-white overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-40 h-56 w-56 rounded-full bg-indigo-100/50 blur-3xl"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav
            className="text-xs text-slate-400 mb-6"
            aria-label="Ruta de navegación"
          >
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

          <header className="mb-8 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
              Cotización sin compromiso
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Empieza con{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                RDC Contadores
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Marca lo que te suene familiar (opcional) y déjanos tus datos.
              El botón de color envía tu cotización al instante. Si ya eres
              cliente, usa{" "}
              <Link
                href="/portal/login"
                className="font-semibold text-marca-navy hover:underline"
              >
                acceso al portal
              </Link>
              .
            </p>
          </header>

          <EmpezarCotizarSection />

          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
            <li className="flex gap-2 rounded-xl bg-white/80 ring-1 ring-violet-100 px-3 py-2.5">
              <span className="text-marca-navy font-bold">✓</span>
              Portal con cumplimiento, honorarios y documentos SAT
            </li>
            <li className="flex gap-2 rounded-xl bg-white/80 ring-1 ring-violet-100 px-3 py-2.5">
              <span className="text-marca-navy font-bold">✓</span>
              RESICO desde $812/mes — precio transparente
            </li>
            <li className="flex gap-2 rounded-xl bg-white/80 ring-1 ring-violet-100 px-3 py-2.5">
              <span className="text-marca-navy font-bold">✓</span>
              Respuesta en horario hábil, usualmente &lt; 2 h
            </li>
          </ul>
        </div>
      </article>
    </PublicShell>
  );
}
