import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Iniciar sesión · CRM RDC",
};

export default function LoginPage() {
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
            Acceso para administradores.
          </p>
        </div>

        <Suspense fallback={<p className="text-sm text-slate-400">Cargando…</p>}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-slate-400">
          ¿Eres cliente? Entra desde{" "}
          <a
            href="/portal/login"
            className="font-semibold text-slate-600 underline"
          >
            el portal del cliente
          </a>
          .
        </p>
      </div>
    </div>
  );
}
