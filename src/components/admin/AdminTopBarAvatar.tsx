"use client";

import Link from "next/link";
import { useAdminPerfil } from "@/components/admin/AdminPerfilContext";

/** Avatar + nombre + cargo en la barra superior del admin (estilo SAP). */
export default function AdminTopBarAvatar() {
  const { perfil } = useAdminPerfil();
  const nombre =
    perfil?.perfil.nombreCompleto?.trim() ||
    perfil?.email?.split("@")[0] ||
    "Administrador";
  const cargo = perfil?.perfil.cargo?.trim() || perfil?.email || "";
  const inicial = (nombre.charAt(0) || "?").toUpperCase();

  return (
    <Link
      href="/perfil"
      className="flex items-center gap-2.5 pl-3 ml-1 border-l border-slate-200/80 hover:opacity-90 transition-opacity shrink-0 min-w-0"
      aria-label="Mi perfil"
    >
      {perfil?.perfil.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={perfil.perfil.avatarUrl}
          alt=""
          className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-100 shrink-0"
        />
      ) : (
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center text-[13px] font-bold ring-2 ring-violet-100 shrink-0">
          {inicial}
        </span>
      )}
      <span className="hidden sm:block min-w-0 text-right leading-tight">
        <span className="block text-[12px] font-bold text-slate-800 truncate max-w-[140px] lg:max-w-[180px]">
          {nombre}
        </span>
        <span className="block text-[10px] font-medium text-slate-400 truncate max-w-[140px] lg:max-w-[180px]">
          {cargo}
        </span>
      </span>
    </Link>
  );
}
