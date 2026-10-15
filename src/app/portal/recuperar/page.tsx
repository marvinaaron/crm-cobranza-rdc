"use client";

import { useState } from "react";
import Link from "next/link";
import { DESPACHO_NOMBRE } from "@/lib/correo";
import { usePortalAuth } from "@/context/PortalAuthContext";
import PortalAuthShell from "@/components/portal/PortalAuthShell";
import { portalAuthCard, portalBtnPrimary } from "@/components/portal/portal-ui";

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
      <div className={portalAuthCard}>
        <p className="text-[13px] font-semibold text-slate-500 mb-1">
          {DESPACHO_NOMBRE}
        </p>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 mb-1">
          Recuperar acceso
        </h1>
        <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">
          Ingresa el correo con el que te registraste en el portal. Te enviaremos
          un enlace para restablecer tu contraseña.
        </p>

        {!resultado ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold text-slate-500 block mb-1.5">
                Correo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="cliente@correo.com"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-[15px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--portal-navy)]/20"
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className={`w-full ${portalBtnPrimary}`}
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
              className={`block w-full ${portalBtnPrimary} text-center`}
            >
              Volver al inicio de sesión
            </Link>
          </div>
        )}

        <Link
          href="/portal/login"
          className="block text-center text-[13px] font-semibold text-slate-400 hover:text-[var(--portal-navy)] mt-8"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    </PortalAuthShell>
  );
}
