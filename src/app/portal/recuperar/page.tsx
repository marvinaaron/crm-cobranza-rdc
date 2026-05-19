"use client";

import { useState } from "react";
import Link from "next/link";
import { DESPACHO_NOMBRE } from "@/lib/correo";
import { usePortalAuth } from "@/context/PortalAuthContext";

export default function PortalRecuperarPage() {
  const { recuperarContrasena } = usePortalAuth();
  const [usuario, setUsuario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    mensaje: string;
    claveVisible?: string;
    correoEnviado?: boolean;
  } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultado(null);
    setEnviando(true);
    const res = recuperarContrasena(usuario);
    setEnviando(false);
    if (!res.ok) {
      setError(res.mensaje);
      return;
    }
    setResultado({
      mensaje: res.mensaje,
      claveVisible: res.claveVisible,
      correoEnviado: res.correoEnviado,
    });
  };

  const copiarClave = async () => {
    if (!resultado?.claveVisible) return;
    try {
      await navigator.clipboard.writeText(resultado.claveVisible);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-2">
          {DESPACHO_NOMBRE}
        </p>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">
          Recuperar acceso
        </h1>
        <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
          Ingrese su usuario (RFC). Generaremos una contraseña temporal y, si tiene correo
          registrado, abriremos un borrador para enviársela.
        </p>

        {!resultado ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value.toLowerCase())}
                placeholder="Su RFC o usuario"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {error && (
              <p className="text-[11px] font-bold text-red-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
            >
              {enviando ? "Procesando…" : "Generar contraseña temporal"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-600 leading-relaxed">{resultado.mensaje}</p>
            {resultado.claveVisible && (
              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 text-center">
                <p className="text-[9px] font-black uppercase text-amber-800 mb-2">
                  Contraseña temporal
                </p>
                <p className="text-2xl font-black font-mono text-slate-800 tracking-widest">
                  {resultado.claveVisible}
                </p>
                <button
                  type="button"
                  onClick={copiarClave}
                  className="mt-3 text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800"
                >
                  Copiar
                </button>
              </div>
            )}
            <Link
              href="/portal/login"
              className="block w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-800"
            >
              Ir a iniciar sesión
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
    </div>
  );
}
