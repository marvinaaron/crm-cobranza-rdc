"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/publico/Logo";
import { useAdminPerfil } from "@/components/admin/AdminPerfilContext";

/**
 * Encabezado del sidebar admin: marca del despacho con isotipo blanco sobre
 * violeta (diferencia visual vs portal de cliente que es blanco/azul y vs
 * sitio público que es blanco/negro) + avatar/identidad del usuario.
 */
export default function SidebarAdminHeader() {
  const pathname = usePathname();
  const { perfil } = useAdminPerfil();

  const nombre =
    perfil?.perfil.nombreCompleto?.trim() ||
    perfil?.email?.split("@")[0] ||
    "Administrador";
  const subtitulo = perfil?.perfil.cargo?.trim() || perfil?.email || "";
  const inicial = (nombre.charAt(0) || "?").toUpperCase();
  const activo = pathname === "/perfil";

  return (
    <div className="border-b border-slate-100">
      <div className="p-4 pb-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 group"
          aria-label="RDC CRM · Ir al dashboard"
        >
          {/* Isotipo fijo: gradiente violeta + R blanca, sin variante de modo oscuro. */}
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
          <span className="leading-tight">
            <p className="text-[15px] font-black text-slate-900">RDC</p>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-600 -mt-0.5">
              Consola admin
            </p>
          </span>
        </Link>
      </div>
      <Link
        href="/perfil"
        className={`mx-3 mb-3 flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
          activo
            ? "bg-violet-50 ring-1 ring-violet-100"
            : "hover:bg-slate-50"
        }`}
      >
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
        <div className="min-w-0">
          <p className="text-[12px] font-black text-slate-800 truncate leading-tight">
            {nombre}
          </p>
          <p className="text-[10px] font-bold text-slate-400 truncate leading-tight">
            {subtitulo}
          </p>
        </div>
      </Link>
    </div>
  );
}
