"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DESPACHO_NOMBRE } from "@/lib/correo";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { RUTA_DEFAULT_CLIENTE } from "@/lib/auth/rutas";
import PasswordInput from "@/components/PasswordInput";

export default function PortalCambiarClavePage() {
  const router = useRouter();
  const { cliente, esClaveTemporal, establecerNuevaClave } = usePortalAuth();

  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  /** Se activa true cuando el usuario llegó desde un magic link (no estaba
   * logueado antes). En ese caso, después de definir contraseña lo mandamos
   * DIRECTO al portal sin pedir login. */
  const [vieneDeInvitacion, setVieneDeInvitacion] = useState(false);

  /** Sesión que viene del magic link: la procesamos manualmente.
   * Supabase la deja en window.location.hash (#access_token=...&type=recovery). */
  const [estado, setEstado] = useState<
    "verificando" | "ok" | "sin-sesion" | "expirado"
  >("verificando");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let mounted = true;

    async function init() {
      const hash =
        typeof window !== "undefined" ? window.location.hash : "";

      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!mounted) return;
          if (error) {
            setEstado("expirado");
            return;
          }
          // Limpia el hash de la URL
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          );
          setVieneDeInvitacion(true);
          setEstado("ok");
          return;
        }
      }

      if (hash && hash.includes("error")) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const err = params.get("error_description") ?? params.get("error");
        if (!mounted) return;
        setError(err ?? "El enlace no es válido o expiró.");
        setEstado("expirado");
        return;
      }

      // Sin hash: ya debe haber sesión iniciada (cliente que está cambiando
      // su contraseña desde dentro del portal).
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setEstado(data.session ? "ok" : "sin-sesion");
    }

    void init();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const err = await establecerNuevaClave(nueva, confirmar);
      if (err) {
        setError(err);
        return;
      }
      // Si vino de la invitación / magic link, ya está autenticado: lo
      // mandamos DIRECTO al portal sin pedir login otra vez.
      router.replace(RUTA_DEFAULT_CLIENTE);
      router.refresh();
    } finally {
      setGuardando(false);
    }
  }

  const titulo = vieneDeInvitacion
    ? "Bienvenido al portal"
    : esClaveTemporal
      ? "Establezca su contraseña"
      : "Actualizar contraseña";

  const descripcion = vieneDeInvitacion
    ? "Solo falta un paso: cree la contraseña con la que entrará al portal a partir de ahora."
    : esClaveTemporal
      ? "Es su primer acceso. Elija una contraseña que solo usted conozca."
      : "Defina la nueva contraseña con la que ingresará al portal.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-2">
          {DESPACHO_NOMBRE}
        </p>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">
          {titulo}
        </h1>
        <p className="text-sm font-bold text-slate-500 mb-2 leading-relaxed">
          {descripcion}
        </p>
        {cliente && (
          <p className="text-[10px] font-mono text-slate-400 mb-6">
            {cliente.razonSocial}
          </p>
        )}

        {estado === "verificando" && (
          <p className="text-sm font-bold text-slate-500 text-center py-6">
            Verificando enlace…
          </p>
        )}

        {(estado === "sin-sesion" || estado === "expirado") && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-5">
              <p className="text-sm font-bold text-rose-700">
                {estado === "expirado"
                  ? "El enlace expiró o ya fue usado."
                  : "No hay sesión activa para cambiar la contraseña."}
              </p>
              <p className="text-xs text-rose-600 mt-2 leading-relaxed">
                Solicite a su contador que le reenvíe la invitación, o use el
                botón &quot;Olvidé mi contraseña&quot; en la pantalla de inicio
                de sesión.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.replace("/portal/recuperar")}
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700"
            >
              Solicitar enlace de recuperación
            </button>
          </div>
        )}

        {estado === "ok" && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                Nueva contraseña
              </label>
              <PasswordInput
                value={nueva}
                onChange={setNueva}
                required
                minLength={6}
                autoComplete="new-password"
                name="new-password"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                Confirmar contraseña
              </label>
              <PasswordInput
                value={confirmar}
                onChange={setConfirmar}
                required
                minLength={6}
                autoComplete="new-password"
                name="confirm-password"
              />
            </div>

            <p className="text-[10px] font-bold text-slate-400">
              {vieneDeInvitacion
                ? "Mínimo 6 caracteres. Al guardar entrará directo a su portal."
                : "Mínimo 6 caracteres."}
            </p>

            {error && (
              <p className="text-[11px] font-bold text-red-600 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
            >
              {guardando
                ? "Guardando…"
                : vieneDeInvitacion
                  ? "Crear contraseña y entrar"
                  : "Guardar y continuar"}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/portal/recuperar"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600"
              >
                Olvidé mi contraseña
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
