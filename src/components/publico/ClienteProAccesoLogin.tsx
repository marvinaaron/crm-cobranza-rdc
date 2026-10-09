"use client";

import { useState } from "react";
import Link from "next/link";
import { FilaMetodosPago } from "@/components/publico/PaymentMethodLogos";
import PasswordInput from "@/components/PasswordInput";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Props = {
  onExito?: () => void;
  onCerrar?: () => void;
};

export default function ClienteProAccesoLogin({ onExito, onCerrar }: Props) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [googleCargando, setGoogleCargando] = useState(false);

  const destino = "/herramientas";

  async function verificarPro() {
    const res = await fetch("/api/herramientas/pro/estado");
    const data = (await res.json()) as { esPro?: boolean };
    if (data.esPro) {
      onExito?.();
      onCerrar?.();
      window.location.reload();
    } else {
      setError(
        "Sesión iniciada, pero esta cuenta no tiene Cliente Pro activo. Revisa los planes en la página Pro+."
      );
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: clave,
      });
      if (authError) {
        setError("Correo o contraseña incorrectos.");
        return;
      }
      await verificarPro();
    } catch {
      setError("No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  }

  async function continuarConGoogle() {
    setError(null);
    setGoogleCargando(true);
    try {
      const supabase = getSupabaseBrowser();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destino)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) {
        setError("Google no disponible. Usa correo y contraseña del portal.");
      }
    } catch {
      setError("No se pudo conectar con Google.");
    } finally {
      setGoogleCargando(false);
    }
  }

  return (
    <div className="h-full flex flex-col space-y-3">
      <p className="text-sm font-bold text-slate-900">Inicia sesión</p>

      <button
        type="button"
        onClick={() => void continuarConGoogle()}
        disabled={googleCargando || enviando}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white ring-1 ring-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {googleCargando ? "Redirigiendo…" : "Google"}
      </button>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          o correo
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-2.5 flex-1">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          placeholder="cliente@correo.com"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <PasswordInput
          value={clave}
          onChange={setClave}
          required
          autoComplete="current-password"
        />
        {error ? (
          <p className="text-[11px] text-red-600">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={enviando || googleCargando}
          className="w-full py-2 rounded-lg bg-violet-700 text-white text-sm font-bold hover:bg-violet-800 disabled:opacity-50 transition"
        >
          {enviando ? "Verificando…" : "Iniciar sesión"}
        </button>
      </form>

      <div className="pt-3 border-t border-slate-100 text-center">
        <Link
          href="/herramientas/pro"
          onClick={onCerrar}
          className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-violet-700 hover:text-violet-900 transition"
        >
          Ver página Pro+ · planes y detalles
          <span aria-hidden>→</span>
        </Link>
        <FilaMetodosPago className="mt-3" incluirTarjetas={false} />
      </div>
    </div>
  );
}
