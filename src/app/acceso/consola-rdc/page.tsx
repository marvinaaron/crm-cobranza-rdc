import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Consola RDC",
  robots: { index: false, follow: false },
};

export default function ConsolaRdcPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            CRM RDC
          </p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">
            Bienvenido al despacho
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acceso interno del despacho.
          </p>
        </div>

        <Suspense fallback={<p className="text-sm text-slate-400">Cargando…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
