"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminPerfil } from "@/components/admin/AdminPerfilContext";

/**
 * Encabezado del sidebar admin: marca del despacho + avatar/identidad del
 * usuario logueado. Clickear el bloque del usuario navega a /perfil.
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
      <div className="p-5 pb-3">
        <p className="text-xl font-black text-blue-600 leading-none">RDC CRM</p>
      </div>
      <Link
        href="/perfil"
        className={`mx-3 mb-3 flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
          activo
            ? "bg-blue-50 ring-1 ring-blue-100"
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-black ring-2 ring-white shadow">
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
