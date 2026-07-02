"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PublicShell from "@/components/publico/PublicShell";

export default function HerramientasProExitoClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setEstado("error");
      return;
    }
    fetch(
      `/api/stripe/verificar-herramientas?session_id=${encodeURIComponent(sessionId)}`
    )
      .then((r) => r.json())
      .then((data: { ok?: boolean; email?: string }) => {
        if (data.ok) {
          setEstado("ok");
          setEmail(data.email ?? null);
        } else {
          setEstado("error");
        }
      })
      .catch(() => setEstado("error"));
  }, [sessionId]);

  return (
    <PublicShell>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center rounded-3xl bg-white ring-1 ring-slate-200 p-8 shadow-xl">
          {estado === "cargando" && (
            <>
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
              <p className="mt-4 text-sm font-bold text-slate-600">
                Confirmando tu pago…
              </p>
            </>
          )}

          {estado === "ok" && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl">
                ✓
              </div>
              <h1 className="mt-4 text-2xl font-black text-slate-900">
                ¡Bienvenido a Pro+!
              </h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Tu pago fue confirmado
                {email ? ` para ${email}` : ""}. Ya tienes acceso ilimitado a todas
                las herramientas.
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Inicia sesión en el portal con el mismo correo para verificar tu
                acceso en cualquier dispositivo.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href={`/portal/login?next=${encodeURIComponent("/herramientas")}`}
                  className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-black"
                >
                  Entrar al portal
                </Link>
                <Link
                  href="/herramientas"
                  className="w-full py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
                >
                  Ir a herramientas
                </Link>
              </div>
            </>
          )}

          {estado === "error" && (
            <>
              <p className="text-2xl">⚠️</p>
              <h1 className="mt-2 text-xl font-black text-slate-900">
                No pudimos confirmar el pago
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Si ya pagaste, escríbenos con tu comprobante y lo activamos manualmente.
              </p>
              <Link
                href="/contacto"
                className="mt-4 inline-block text-sm font-bold text-violet-700 underline"
              >
                Contactar soporte
              </Link>
            </>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
