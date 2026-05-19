"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DESPACHO_NOMBRE } from "@/lib/correo";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { useClientes } from "@/context/ClientesContext";
import {
  usuarioPortalSugerido,
  getCredencialPortal,
  asegurarCredencialPortal,
} from "@/lib/portal-auth";
import { esIngresoGeneralCliente } from "@/lib/clientes";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, ready, session } = usePortalAuth();
  const { listaClientes } = useClientes();

  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [exitoClave, setExitoClave] = useState(false);

  useEffect(() => {
    if (searchParams.get("claveActualizada") === "1") {
      setExitoClave(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!ready || session) return;
    const hintId = searchParams.get("cliente");
    if (!hintId) return;
    const id = Number(hintId);
    const cliente = listaClientes.find((c) => c.id === id && !esIngresoGeneralCliente(c));
    if (cliente) {
      asegurarCredencialPortal(cliente);
      setUsuario(getCredencialPortal(cliente.id)?.usuario ?? usuarioPortalSugerido(cliente));
    }
  }, [ready, session, searchParams, listaClientes]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExitoClave(false);
    setEnviando(true);
    const resultado = login(usuario, clave);
    setEnviando(false);
    if (!resultado.ok) {
      setError("Usuario o contraseña incorrectos. Verifique sus datos con el despacho.");
      return;
    }
    if (resultado.requiereCambioClave) {
      router.replace("/portal/cambiar-clave");
    } else {
      router.replace("/portal/honorarios");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-white/20 p-10">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-2">
          {DESPACHO_NOMBRE}
        </p>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">
          Portal de cliente
        </h1>
        <p className="text-sm font-bold text-slate-500 mb-6">
          Ingrese con su usuario y contraseña para consultar honorarios y cumplimiento fiscal.
        </p>

        {exitoClave && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 mb-6">
            <p className="text-[11px] font-bold text-emerald-700 text-center">
              Contraseña actualizada. Inicie sesión con su nueva contraseña.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Usuario
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value.toLowerCase())}
              placeholder="Su RFC o usuario asignado"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <div className="text-right">
              <Link
                href="/portal/recuperar"
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800"
              >
                Olvidé mi contraseña
              </Link>
            </div>
          </div>

          {error && (
            <p className="text-[11px] font-bold text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 mt-2"
          >
            {enviando ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-[10px] font-medium text-slate-400 text-center mt-8 leading-relaxed">
          Primera vez: use la clave que le proporcionó el despacho; luego creará la suya.
        </p>
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-sm font-bold text-slate-400">Cargando…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
