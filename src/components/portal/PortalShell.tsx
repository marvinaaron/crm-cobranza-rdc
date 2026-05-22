"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import PeriodoSelector from "@/components/PeriodoSelector";
import { useClientes } from "@/context/ClientesContext";
import RegistrarServiceWorker from "@/components/portal/RegistrarServiceWorker";
import SessionTimeoutGuard from "@/components/SessionTimeoutGuard";
import NotificacionesBell from "@/components/NotificacionesBell";
import PortalEfirmaRecordatorio from "@/components/portal/PortalEfirmaRecordatorio";

const InicioIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const PerfilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const HonorariosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

const CumplimientoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const menuItems = [
  { name: "Inicio", href: "/portal/inicio", icon: <InicioIcon /> },
  { name: "Cumplimiento", href: "/portal/cumplimiento", icon: <CumplimientoIcon /> },
  { name: "Honorarios", href: "/portal/honorarios", icon: <HonorariosIcon /> },
  { name: "Mi perfil", href: "/portal/perfil", icon: <PerfilIcon /> },
];

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { cliente, logout } = usePortalAuth();
  const { perfil } = usePortalPerfil();
  const { irAPeriodoActual, irAPeriodoFiscalVigente } = useClientes();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const esCumplimiento = pathname === "/portal/cumplimiento";

  const nombreParaSidebar =
    perfil?.perfil.nombre?.trim() ||
    perfil?.razonSocial?.trim() ||
    cliente?.razonSocial?.trim() ||
    "Mi cuenta";
  const inicialSidebar =
    nombreParaSidebar.charAt(0).toUpperCase() || "C";
  const avatarUrl = perfil?.perfil.avatarUrl;

  useEffect(() => {
    if (esCumplimiento) {
      irAPeriodoFiscalVigente();
    } else {
      irAPeriodoActual();
    }
  }, [pathname, esCumplimiento, irAPeriodoActual, irAPeriodoFiscalVigente]);

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuAbierto) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  const onLogout = async () => {
    await logout();
    router.replace("/portal/login");
    router.refresh();
  };

  const tituloPagina =
    menuItems.find((item) => item.href === pathname)?.name ?? "Portal";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <RegistrarServiceWorker />
      <PortalEfirmaRecordatorio />
      <SessionTimeoutGuard rutaLogin="/portal/login" onCerrarSesion={() => void logout()} />
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-50"
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </button>
        <div className="text-center flex-1 min-w-0 px-2">
          <p className="text-lg font-black text-blue-600 leading-none">RDC Portal</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
            {tituloPagina}
          </p>
        </div>
        {cliente ? (
          <div className="flex items-center justify-end shrink-0">
            <NotificacionesBell
              destinatario="cliente"
              clienteId={cliente.id}
              tamano="sm"
              tituloModal="Mis notificaciones"
            />
          </div>
        ) : (
          <div className="w-10" aria-hidden />
        )}
      </header>


      {menuAbierto && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside
        className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm z-50 transition-transform duration-300 ease-out
          ${menuAbierto ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${menuAbierto ? "" : "pointer-events-none lg:pointer-events-auto"}`}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-black text-blue-600">RDC Portal</h1>
            <button
              type="button"
              onClick={() => setMenuAbierto(false)}
              className="lg:hidden shrink-0 p-2 rounded-xl text-slate-500 hover:bg-slate-50"
              aria-label="Cerrar menú"
            >
              <CloseIcon />
            </button>
          </div>
          <Link
            href="/portal/perfil"
            className={`mt-4 flex items-center gap-3 rounded-xl p-3 ring-1 transition-colors ${
              pathname === "/portal/perfil"
                ? "bg-blue-50 ring-blue-100"
                : "bg-slate-50/70 ring-slate-100 hover:bg-slate-100/70"
            }`}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={nombreParaSidebar}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0">
                {inicialSidebar}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Mi perfil
              </p>
              <p className="text-[13px] font-bold text-slate-700 mt-1 leading-snug line-clamp-2">
                {nombreParaSidebar}
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                pathname === item.href
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <span className={pathname === item.href ? "text-white" : "text-slate-400"}>
                {item.icon}
              </span>
              <span className="font-semibold text-[15px]">{item.name}</span>
            </Link>
          ))}
        </nav>

        <PeriodoSelector modoFiscal={esCumplimiento} />

        <div className="p-4 border-t border-slate-100 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden pt-16 lg:pt-10 lg:ml-64 lg:w-auto lg:max-w-[calc(100vw-16rem)] px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 min-h-screen">
        {children}
        <footer className="mt-12 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/aviso-de-privacidad"
            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest"
          >
            Aviso de privacidad
          </Link>
        </footer>
      </main>
    </div>
  );
}
