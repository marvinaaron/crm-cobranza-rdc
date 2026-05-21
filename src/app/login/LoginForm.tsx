"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { getRol } from "@/lib/supabase/roles";
import { RUTA_DEFAULT_ADMIN } from "@/lib/auth/rutas";
import PasswordInput from "@/components/PasswordInput";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "";

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value
      .trim()
      .toLowerCase();

    try {
      const supabase = getSupabaseBrowser();
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError || !data.user) {
        setError(signInError?.message ?? "No se pudo iniciar sesión.");
        return;
      }

      if (getRol(data.user) !== "admin") {
        await supabase.auth.signOut();
        setError(
          "Esta cuenta no tiene permisos de administrador. Usa el portal del cliente."
        );
        return;
      }

      const destino =
        next && next.startsWith("/") ? next : RUTA_DEFAULT_ADMIN;
      router.replace(destino);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-slate-700">Correo</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-900"
          placeholder="tucorreo@rdcontadores.com"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-slate-700">Contraseña</span>
        <PasswordInput
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
          className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 text-base outline-none focus:border-slate-900"
        />
      </label>

      {error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
