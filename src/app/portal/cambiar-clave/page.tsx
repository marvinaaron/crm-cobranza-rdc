"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESPACHO_NOMBRE } from "@/lib/correo";
import { usePortalAuth } from "@/context/PortalAuthContext";

export default function PortalCambiarClavePage() {
  const router = useRouter();
  const { cliente, esClaveTemporal, establecerNuevaClave, logout } = usePortalAuth();

  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    const err = establecerNuevaClave(nueva, confirmar);
    if (err) {
      setError(err);
      setGuardando(false);
      return;
    }
    logout();
    setGuardando(false);
    router.replace("/portal/login?claveActualizada=1");
  };

  const titulo = esClaveTemporal
    ? "Establezca su nueva contraseña"
    : "Cree su contraseña personal";

  const descripcion = esClaveTemporal
    ? "Ingresó con una contraseña temporal. Elija una contraseña nueva que solo usted conozca."
    : "Es su primer acceso al portal. Defina la contraseña con la que ingresará de ahora en adelante.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-2">
          {DESPACHO_NOMBRE}
        </p>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">
          {titulo}
        </h1>
        <p className="text-sm font-bold text-slate-500 mb-2 leading-relaxed">{descripcion}</p>
        {cliente && (
          <p className="text-[10px] font-mono text-slate-400 mb-6">{cliente.razonSocial}</p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Confirmar contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <p className="text-[10px] font-bold text-slate-400">
            Mínimo 6 caracteres. Al guardar se cerrará su sesión y deberá iniciar sesión de nuevo.
          </p>

          {error && (
            <p className="text-[11px] font-bold text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Guardar y continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
