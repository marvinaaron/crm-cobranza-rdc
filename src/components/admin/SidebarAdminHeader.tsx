"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/publico/Logo";
import { useAdminPerfil } from "@/components/admin/AdminPerfilContext";
import { useSidebarColapso } from "@/components/admin/SidebarColapsoContext";

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

/**
 * Encabezado del sidebar admin: isotipo blanco sobre cuadro violeta→índigo
 * (siempre igual en claro y oscuro; el resto del sidebar sí adapta al tema).
 * En móvil incluye la X de cierre a la derecha del logo (misma fila).
 */
export default function SidebarAdminHeader({
  onCerrar,
}: {
  onCerrar?: () => void;
}) {
  const pathname = usePathname();
  const { perfil } = useAdminPerfil();
  const { efectivoExpandido } = useSidebarColapso();

  const nombre =
    perfil?.perfil.nombreCompleto?.trim() ||
    perfil?.email?.split("@")[0] ||
    "Administrador";
  const subtitulo = perfil?.perfil.cargo?.trim() || perfil?.email || "";
  const inicial = (nombre.charAt(0) || "?").toUpperCase();
  const activo = pathname === "/perfil";

  const labelOpacity = `transition-opacity duration-200 ${
    efectivoExpandido ? "opacity-100" : "opacity-0 pointer-events-none"
  }`;

  return (
    <div className="border-b border-slate-100 dark:border-white/10">
      <div className="px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] flex items-center gap-2 overflow-hidden">
        <Link
          href="/dashboard"
          className="flex-1 min-w-0 flex items-center group overflow-hidden"
          aria-label="RDC CRM · Ir al dashboard"
        >
          <span className="w-12 h-10 shrink-0 flex items-center justify-center">
            <span
              className="
                inline-flex items-center justify-center w-10 h-10 rounded-xl
                bg-gradient-to-br from-violet-600 to-indigo-700
                shadow-md ring-1 ring-violet-500/40
                group-hover:from-violet-500 group-hover:to-indigo-600
                transition-colors
              "
            >
              <Logo mark="r" variante="white" alto={22} />
            </span>
          </span>
          <span
            className={`leading-tight min-w-0 whitespace-nowrap pl-1 ${labelOpacity}`}
          >
            <span className="block text-[15px] font-black text-slate-900 dark:text-white">
              RDC
            </span>
            <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300 -mt-0.5">
              Consola admin
            </span>
          </span>
        </Link>
        {onCerrar ? (
          <button
            type="button"
            onClick={onCerrar}
            className={`lg:hidden shrink-0 p-2 -mr-1 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/10 ${labelOpacity}`}
            aria-label="Cerrar menú"
            tabIndex={efectivoExpandido ? 0 : -1}
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>
      <Link
        href="/perfil"
        className={`mx-3 mb-3 flex items-center rounded-2xl ring-1 overflow-hidden transition-colors ${
          activo
            ? "bg-violet-50 ring-violet-100 dark:bg-violet-500/15 dark:ring-violet-400/30"
            : "bg-slate-50/70 ring-slate-100 hover:bg-slate-100/70 dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10"
        }`}
        title={!efectivoExpandido ? `${nombre} · Mi perfil` : undefined}
      >
        <span className="w-12 h-12 shrink-0 flex items-center justify-center">
          {perfil?.perfil.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={perfil.perfil.avatarUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center text-sm font-black ring-2 ring-white shadow">
              {inicial}
            </div>
          )}
        </span>
        <div
          className={`min-w-0 whitespace-nowrap pr-3 ${labelOpacity}`}
        >
          <p className="text-[12px] font-black text-slate-800 dark:text-slate-100 truncate leading-tight">
            {nombre}
          </p>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 truncate leading-tight">
            {subtitulo}
          </p>
        </div>
      </Link>
    </div>
  );
}
