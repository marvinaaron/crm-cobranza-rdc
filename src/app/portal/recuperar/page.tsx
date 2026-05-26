"use client";

import { useState } from "react";
import Link from "next/link";
import { DESPACHO_NOMBRE } from "@/lib/correo";
import { usePortalAuth } from "@/context/PortalAuthContext";
import PortalAuthShell from "@/components/portal/PortalAuthShell";

export default function PortalRecuperarPage() {
  const { recuperarContrasena } = usePortalAuth();
  const [email, setEmail] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResultado(null);
    setEnviando(true);
    try {
      const res = await recuperarContrasena(email);
      setResultado(res.mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <PortalAuthShell>
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-2">
          {DESPACHO_NOMBRE}
        </p>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">
          Recuperar acceso
        </h1>
        <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
          Ingrese el correo con el que se registró en el portal. Le enviaremos
          un enlace para restablecer su contraseña.
        </p>

        {!resultado ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                Correo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="cliente@correo.com"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-4 rounded-2xl bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 disabled:opacity-50"
            >
              {enviando ? "Enviando…" : "Enviar enlace de recuperación"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              {resultado}
            </p>
            <Link
              href="/portal/login"
              className="block w-full py-4 rounded-2xl bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-800"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        )}

        <Link
          href="/portal/login"
          className="block text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mt-8"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    </PortalAuthShell>
  );
}
