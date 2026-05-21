import PublicShell from "@/components/publico/PublicShell";
import NosotrosSection from "@/components/publico/NosotrosSection";
import Link from "next/link";

export const metadata = {
  title: "Nosotros · RDC Contadores",
  description:
    "Conoce al despacho RDC Contadores: más de una década apoyando a personas físicas y morales con cumplimiento fiscal puntual.",
};

export default function NosotrosPage() {
  return (
    <PublicShell>
      <NosotrosSection />

      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Conoce cómo trabajamos
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Un flujo de 7 pasos para cumplimiento y 5 para cobranza, sin sorpresas.
          </p>
          <Link
            href="/proceso"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Ver el proceso
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
