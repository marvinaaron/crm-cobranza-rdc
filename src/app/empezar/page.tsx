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
      <article className="relative min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-white via-violet-50/40 to-indigo-50/30 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-violet-200/45 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-fuchsia-100/50 blur-3xl"
        />

        <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 lg:mb-8">
            <header className="min-w-0">
              <nav
                className="text-xs text-slate-400 mb-2"
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
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
                Cotización sin compromiso
              </p>
              <h1 className="mt-0.5 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Empieza con{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  RDC Contadores
                </span>
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-xl">
                Déjanos tus datos a la izquierda. A la derecha, Fiscalino te
                invita a un test opcional. El botón de color envía tu cotización.
                Si ya eres cliente,{" "}
                <Link
                  href="/portal/login"
                  className="font-semibold text-marca-navy hover:underline"
                >
                  entra al portal
                </Link>
                .
              </p>
            </header>

            <ul className="hidden lg:flex shrink-0 gap-4 text-[11px] text-slate-500">
              <li className="flex items-center gap-1.5">
                <span className="text-marca-navy font-bold">✓</span>
                Respuesta &lt; 2 h
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-marca-navy font-bold">✓</span>
                Precio transparente
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-marca-navy font-bold">✓</span>
                Sin contratos forzosos
              </li>
            </ul>
          </div>

          <EmpezarCotizarSection />
        </div>
      </article>
    </PublicShell>
  );
}
