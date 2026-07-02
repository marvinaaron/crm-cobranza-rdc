"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

type EstadoPro = {
  loggedIn: boolean;
  esPro: boolean;
  email: string | null;
  esClientePortal?: boolean;
};

export default function HerramientasProBar() {
  const pathname = usePathname() ?? "";
  const [estado, setEstado] = useState<EstadoPro | null>(null);

  const enHerramientas =
    pathname === "/herramientas" ||
    pathname.startsWith("/herramientas/");

  useEffect(() => {
    if (!enHerramientas) return;
    let cancel = false;
    fetch("/api/herramientas/pro/estado")
      .then((r) => r.json())
      .then((data: EstadoPro) => {
        if (!cancel) setEstado(data);
      })
      .catch(() => {
        if (!cancel) setEstado({ loggedIn: false, esPro: false, email: null });
      });
    return () => {
      cancel = true;
    };
  }, [enHerramientas, pathname]);

  if (!enHerramientas) return null;

  const next = encodeURIComponent(pathname || "/herramientas");
  const loginHref = `/portal/login?next=${next}`;

  return (
    <div className="sticky top-16 z-[140] border-b border-violet-100 bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest shrink-0">
            <Sparkles size={11} aria-hidden />
            Pro+
          </span>
          <p className="text-[11px] sm:text-xs text-white/80 truncate">
            {estado?.esPro
              ? estado.esClientePortal
                ? "Pro incluido con tu cuenta de cliente RDC"
                : "Tienes acceso ilimitado a todas las herramientas"
              : "3 consultas gratis por herramienta · Desbloquea el suite completo"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {estado?.esPro ? (
            <span className="text-[10px] font-bold text-emerald-300 px-2 py-1 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/30">
              ✓ Pro activo
            </span>
          ) : (
            <Link
              href="/herramientas/pro"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white text-violet-950 text-[10px] font-black uppercase tracking-wider hover:bg-violet-50 transition"
            >
              Ver planes
            </Link>
          )}
          {estado?.loggedIn ? (
            <Link
              href="/portal/inicio"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/10 text-white text-[10px] font-bold hover:bg-white/15 transition truncate max-w-[140px]"
              title={estado.email ?? undefined}
            >
              Mi cuenta
            </Link>
          ) : (
            <Link
              href={loginHref}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/25 text-white text-[10px] font-bold hover:bg-white/10 transition"
            >
              ¿Ya eres cliente? Entrar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
