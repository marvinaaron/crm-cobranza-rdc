/**
 * Página 404 personalizada. Se renderiza con el shell "bare" del
 * RootLayout (no expone chrome admin ni del portal) para cualquier
 * URL desconocida.
 */

import Link from "next/link";
import Fiscalino from "@/components/Fiscalino";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <Fiscalino mood="desperate" size={128} className="mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600">
            Página no encontrada
          </p>
          <h1 className="mt-4 text-6xl font-black text-slate-900 tabular-nums">
            404
          </h1>
        </div>

        <p className="text-base text-slate-500 leading-relaxed">
          La URL que buscas no existe o ha cambiado. Verifica la
          dirección o regresa al inicio.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
          >
            Ir al inicio
          </Link>
          <Link
            href="/portal/login"
            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Portal de clientes
          </Link>
        </div>
      </div>
    </main>
  );
}
