"use client";
import "./globals.css"; // Ruta corregida
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ClientesProvider, useClientes } from "@/context/ClientesContext";
import PeriodoSelector from "@/components/PeriodoSelector";
import LogoutButton from "@/components/admin/LogoutButton";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import {
  AdminPerfilProvider,
  useAdminPerfil,
} from "@/components/admin/AdminPerfilContext";
import SidebarAdminHeader from "@/components/admin/SidebarAdminHeader";
import SessionTimeoutGuard from "@/components/SessionTimeoutGuard";
import AdminAppleTouchIcon from "@/components/admin/AdminAppleTouchIcon";
import NotificacionesBell from "@/components/NotificacionesBell";
import type { Modulo } from "@/lib/admin/permisos";
import { RUTA_LOGIN_ADMIN } from "@/lib/auth/rutas";

// --- ICONOS MINIMALISTAS (NUEVOS) ---
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const CobranzaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

const CumplimientoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
);

const EfirmaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

/** En Cumplimiento el periodo del sidebar es fiscal (mes vencido); al entrar se alinea con abril en mayo, etc. */
function AdminPeriodoSync() {
  const pathname = usePathname();
  const { irAPeriodoFiscalVigente } = useClientes();

  useEffect(() => {
    if (pathname === "/cumplimiento") {
      irAPeriodoFiscalVigente();
    }
  }, [pathname, irAPeriodoFiscalVigente]);

  return null;
}

function AdminSidebar({
  menuAbierto,
  onCerrar,
}: {
  menuAbierto: boolean;
  onCerrar: () => void;
}) {
  const pathname = usePathname();
  const esCumplimientoAdmin = pathname === "/cumplimiento";
  const { perfil } = useAdminPerfil();

  const menuItems: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
    modulo: Modulo;
  }> = [
    { name: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, modulo: "dashboard" },
    { name: "Mis Clientes", href: "/clientes", icon: <UsersIcon />, modulo: "clientes" },
    { name: "Cobranza", href: "/cobranza", icon: <CobranzaIcon />, modulo: "cobranza" },
    { name: "Cumplimiento", href: "/cumplimiento", icon: <CumplimientoIcon />, modulo: "cumplimiento" },
    { name: "E.firmas", href: "/efirmas", icon: <EfirmaIcon />, modulo: "efirmas" },
  ];

  // Si todavía no carga el perfil, mostramos TODO (el guard del servidor decide).
  // Si ya cargó, filtramos por permisos. El propietario ve todo.
  const items = perfil
    ? perfil.propietario
      ? menuItems
      : menuItems.filter((m) => perfil.permisos.includes(m.modulo))
    : menuItems;

  const verConfig =
    !perfil || perfil.propietario || perfil.permisos.includes("configuracion");

  return (
    <aside
      className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm z-50 transition-transform duration-300 ease-out
        ${menuAbierto ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${menuAbierto ? "" : "pointer-events-none lg:pointer-events-auto"}`}
    >
      <div className="lg:hidden flex justify-end px-3 pt-3 -mb-2">
        <button
          type="button"
          onClick={onCerrar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-50"
          aria-label="Cerrar menú"
        >
          <CloseIcon />
        </button>
      </div>
      <SidebarAdminHeader />

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
              pathname === item.href
                ? "bg-violet-600 text-white shadow-lg shadow-violet-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <span className={`${pathname === item.href ? "text-white" : "text-slate-400"}`}>
              {item.icon}
            </span>
            <span className="font-semibold text-[15px]">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-4 space-y-2">
        {verConfig ? (
          <Link
            href="/configuracion"
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
              pathname === "/configuracion"
                ? "bg-slate-900 text-white"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            }`}
          >
            <span>
              <SettingsIcon />
            </span>
            <span className="font-semibold text-[13px]">Configuración</span>
          </Link>
        ) : null}
        <LogoutButton />
      </div>

      <PeriodoSelector modoFiscal={esCumplimientoAdmin} />
    </aside>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra el menú móvil al cambiar de ruta.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  // Bloquea scroll del body cuando el drawer móvil está abierto.
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

  const tituloPagina = (() => {
    if (!pathname) return "RDC CRM";
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/clientes")) return "Mis clientes";
    if (pathname.startsWith("/cobranza")) return "Cobranza";
    if (pathname.startsWith("/cumplimiento")) return "Cumplimiento";
    if (pathname.startsWith("/efirmas")) return "E.firmas";
    if (pathname.startsWith("/configuracion")) return "Configuración";
    if (pathname.startsWith("/perfil")) return "Mi perfil";
    return "RDC CRM";
  })();

  return (
    <>
      <AdminSidebar menuAbierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      {menuAbierto && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}

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
          <p className="text-base font-black text-violet-600 leading-none">RDC Admin</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
            {tituloPagina}
          </p>
        </div>
        <div className="flex items-center justify-end shrink-0">
          <NotificacionesBell destinatario="admin" tamano="sm" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-full overflow-x-hidden pt-16 px-4 pb-8 lg:pt-8 lg:pl-8 lg:pr-8 lg:ml-64">
        {children}
      </main>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPortal = pathname?.startsWith("/portal");
  const esLogin = pathname === RUTA_LOGIN_ADMIN;
  const RUTAS_PUBLICAS_SITIO = [
    "/",
    "/servicios",
    "/proceso",
    "/herramientas",
    "/nosotros",
    "/contacto",
    "/aviso-de-privacidad",
  ];
  const esSitioPublico =
    RUTAS_PUBLICAS_SITIO.includes(pathname ?? "") ||
    (pathname?.startsWith("/herramientas") ?? false);

  if (isPortal || esLogin || esSitioPublico) {
    const manifestHref = isPortal
      ? "/manifest-portal.webmanifest"
      : "/manifest.webmanifest";
    const themeColor = isPortal ? "#2563eb" : "#0f172a";
    const appleTitle = isPortal ? "RDC Portal" : "RDC Contadores";
    return (
      <html lang="es">
        <head>
          <link rel="manifest" href={manifestHref} />
          <meta name="theme-color" content={themeColor} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content={appleTitle} />
        </head>
        <body className="min-h-screen bg-slate-50 antialiased">
          <ConfirmProvider>
            {isPortal ? (
              <ClientesProvider>{children}</ClientesProvider>
            ) : (
              children
            )}
          </ConfirmProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest-admin.webmanifest" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RDC Admin" />
      </head>
      <body className="bg-slate-50 min-h-screen">
        <ConfirmProvider>
          <AdminPerfilProvider>
            <ClientesProvider>
              <AdminAppleTouchIcon />
              <AdminPeriodoSync />
              <SessionTimeoutGuard rutaLogin={RUTA_LOGIN_ADMIN} />
              <AdminShell>{children}</AdminShell>
            </ClientesProvider>
          </AdminPerfilProvider>
        </ConfirmProvider>
      </body>
    </html>
  );
}