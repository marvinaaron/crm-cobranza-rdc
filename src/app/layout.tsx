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
import NotificacionesBell from "@/components/NotificacionesBell";
import PaletaComandos from "@/components/admin/PaletaComandos";
import EdgeSwipeZones from "@/components/EdgeSwipeZones";
import PullToRefresh from "@/components/PullToRefresh";
import type { Modulo } from "@/lib/admin/permisos";
import { RUTA_LOGIN_ADMIN, esRutaAdmin } from "@/lib/auth/rutas";
import {
  SidebarColapsoProvider,
  useSidebarColapso,
} from "@/components/admin/SidebarColapsoContext";

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 18 6-6-6-6"/></svg>
);

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

/**
 * Sincroniza el periodo del sidebar con la ruta para que el contador
 * siempre vea el periodo correcto sin pensarlo:
 *  - /cumplimiento     → mes vencido (periodo fiscal vigente)
 *  - /dashboard
 *  - /clientes
 *  - /cobranza         → mes actual del calendario
 *
 * Esto evita el caso de "estaba en abril en cumplimiento y al ir a
 * cobranza sigo viendo abril cuando en realidad estoy cobrando mayo".
 */
const RUTAS_PERIODO_ACTUAL_ADMIN = new Set([
  "/dashboard",
  "/clientes",
  "/cobranza",
]);

function AdminPeriodoSync() {
  const pathname = usePathname();
  const { irAPeriodoActual, irAPeriodoFiscalVigente } = useClientes();

  useEffect(() => {
    if (!pathname) return;
    if (pathname === "/cumplimiento") {
      irAPeriodoFiscalVigente();
      return;
    }
    if (RUTAS_PERIODO_ACTUAL_ADMIN.has(pathname)) {
      irAPeriodoActual();
    }
  }, [pathname, irAPeriodoActual, irAPeriodoFiscalVigente]);

  return null;
}

function AdminSidebar({
  menuAbierto,
  onCerrar,
  onAbrirPaleta,
  arrastreX,
}: {
  menuAbierto: boolean;
  onCerrar: () => void;
  onAbrirPaleta: () => void;
  /** Px de arrastre del dedo durante swipe; null si no hay arrastre activo. */
  arrastreX: number | null;
}) {
  const pathname = usePathname();
  const esCumplimientoAdmin = pathname === "/cumplimiento";
  const { perfil } = useAdminPerfil();
  const {
    colapsado,
    efectivoExpandido,
    toggleColapsado,
    setHoverExpandido,
  } = useSidebarColapso();

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

  const anchoLg = efectivoExpandido ? "lg:w-64" : "lg:w-[72px]";

  const labelClass = `min-w-0 whitespace-nowrap transition-opacity duration-200 ${
    efectivoExpandido ? "opacity-100" : "opacity-0 pointer-events-none"
  }`;

  const ANCHO_DRAWER = 256;
  const arrastrando = arrastreX != null;
  const inlineStyle: React.CSSProperties | undefined = arrastrando
    ? {
        transform: `translate3d(${Math.min(arrastreX!, ANCHO_DRAWER) - ANCHO_DRAWER}px, 0, 0)`,
        transition: "none",
        willChange: "transform",
      }
    : undefined;

  return (
    <aside
      onMouseEnter={() => {
        if (colapsado) setHoverExpandido(true);
      }}
      onMouseLeave={() => setHoverExpandido(false)}
      style={inlineStyle}
      className={`w-64 ${anchoLg} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 flex flex-col fixed h-full shadow-sm z-50 transition-[width,transform] duration-300 ease-out
        ${menuAbierto ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${menuAbierto || arrastrando ? "" : "pointer-events-none lg:pointer-events-auto"}`}
    >
      <SidebarAdminHeader onCerrar={onCerrar} />

      <div className="px-3 pt-3 pb-1">
        <button
          type="button"
          onClick={onAbrirPaleta}
          title={!efectivoExpandido ? "Buscar (Cmd K)" : undefined}
          className="flex w-full items-center gap-3 h-10 rounded-xl overflow-hidden text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100 transition-colors"
        >
          <span className="w-12 shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <span
            className={`${labelClass} flex-1 text-left text-[12px] font-bold uppercase tracking-widest pr-2`}
          >
            Buscar
          </span>
          <span
            className={`${labelClass} hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[9px] font-black tracking-wider text-slate-500 dark:text-slate-300 mr-3`}
          >
            ⌘ K
          </span>
        </button>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={!efectivoExpandido ? item.name : undefined}
            className={`flex w-full items-center gap-3 h-11 rounded-xl overflow-hidden transition-colors ${
              pathname === item.href
                ? "bg-violet-600 text-white shadow-lg shadow-violet-100 dark:shadow-violet-900/40"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            <span
              className={`w-12 shrink-0 flex items-center justify-center ${
                pathname === item.href
                  ? "text-white"
                  : "text-slate-400 dark:text-slate-400"
              }`}
            >
              {item.icon}
            </span>
            <span className={`${labelClass} font-semibold text-[15px] pr-3`}>
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      <PeriodoSelector modoFiscal={esCumplimientoAdmin} />

      <div className="pt-3 border-t border-slate-100 dark:border-white/10 pb-[max(1rem,env(safe-area-inset-bottom))] px-3 space-y-1">
        {verConfig ? (
          <Link
            href="/configuracion"
            title={!efectivoExpandido ? "Configuración" : undefined}
            className={`flex w-full items-center gap-3 h-11 rounded-xl overflow-hidden transition-colors ${
              pathname === "/configuracion"
                ? "bg-slate-900 text-white dark:bg-white/15"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            <span className="w-12 shrink-0 flex items-center justify-center">
              <SettingsIcon />
            </span>
            <span className={`${labelClass} font-semibold text-[13px] pr-3`}>
              Configuración
            </span>
          </Link>
        ) : null}
        <LogoutButton />
        <button
          type="button"
          onClick={toggleColapsado}
          title={colapsado ? "Expandir barra lateral" : "Colapsar barra lateral"}
          aria-label={colapsado ? "Expandir barra lateral" : "Colapsar barra lateral"}
          className="hidden lg:flex w-full items-center gap-3 h-10 rounded-xl overflow-hidden text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100 transition-colors"
        >
          <span className="w-12 shrink-0 flex items-center justify-center">
            {colapsado ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </span>
          <span
            className={`${labelClass} text-[10px] font-black uppercase tracking-widest pr-3`}
          >
            {colapsado ? "Mantener expandido" : "Colapsar"}
          </span>
        </button>
      </div>
    </aside>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [paletaAbierta, setPaletaAbierta] = useState(false);
  const [arrastreSidebar, setArrastreSidebar] = useState<number | null>(null);
  const { colapsado } = useSidebarColapso();
  const ANCHO_DRAWER = 256;

  // Cierra el menú móvil al cambiar de ruta.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMenuAbierto(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Atajo global Cmd+K / Ctrl+K para abrir la paleta de comandos.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const esK = e.key === "k" || e.key === "K";
      if (esK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletaAbierta((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  // Safety net: si el arrastre queda atrapado, lo limpiamos tras un tick.
  useEffect(() => {
    if (arrastreSidebar == null) return;
    const id = setTimeout(() => setArrastreSidebar(null), 600);
    return () => clearTimeout(id);
  }, [arrastreSidebar]);

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
      <AdminSidebar
        menuAbierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        onAbrirPaleta={() => setPaletaAbierta(true)}
        arrastreX={arrastreSidebar}
      />

      {(menuAbierto || (arrastreSidebar != null && arrastreSidebar > 8)) && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-slate-900"
          aria-label="Cerrar menú"
          style={{
            opacity:
              arrastreSidebar != null
                ? Math.min(arrastreSidebar / ANCHO_DRAWER, 1) * 0.4
                : 0.4,
            transition: arrastreSidebar != null ? "none" : "opacity 200ms ease",
          }}
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
        <div className="flex items-center justify-end gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setPaletaAbierta(true)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 active:scale-95 transition"
            aria-label="Buscar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <NotificacionesBell destinatario="admin" tamano="sm" escucharEventoGlobal />
        </div>
      </header>

      <PaletaComandos abierto={paletaAbierta} onCerrar={() => setPaletaAbierta(false)} />

      <EdgeSwipeZones
        onArrastreIzquierda={(dx) => setArrastreSidebar(dx)}
        onSoltarIzquierda={(dx) => {
          if (dx > ANCHO_DRAWER / 3) {
            setMenuAbierto(true);
          }
          requestAnimationFrame(() => setArrastreSidebar(null));
        }}
        onSwipeDesdeDerecha={() => {
          window.dispatchEvent(new CustomEvent("rdc:abrir-notificaciones"));
        }}
      />

      <PullToRefresh />

      <main
        className={`flex-1 w-full max-w-full overflow-x-hidden pt-16 px-4 pb-8 lg:pt-8 lg:pl-8 lg:pr-8 lg:w-auto transition-[margin,max-width] duration-300 ease-in-out ${
          colapsado
            ? "lg:ml-[72px] lg:max-w-[calc(100vw-72px)]"
            : "lg:ml-64 lg:max-w-[calc(100vw-16rem)]"
        }`}
      >
        {children}
      </main>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  const isPortal = pathname.startsWith("/portal");
  // El shell admin (con sidebar y chrome del CRM) SOLO se monta en
  // rutas reconocidas como admin. Para cualquier otra cosa
  // (sitio público, portal, login, 404 o URL desconocida tipo
  // /admin) usamos el shell "bare" para no filtrar la existencia ni
  // el contenido del back office a usuarios no autenticados.
  const usaAdminShell = esRutaAdmin(pathname);

  if (!usaAdminShell) {
    const manifestHref = isPortal
      ? "/manifest-portal.webmanifest"
      : "/manifest.webmanifest";
    const themeColor = isPortal ? "#2563eb" : "#0f172a";
    const appleTitle = isPortal ? "RDC Portal" : "RDC Contadores";
    return (
      <html lang="es">
        <head>
          <link rel="manifest" href={manifestHref} />
          <link rel="apple-touch-icon" href="/apple-touch-icon-v2.png" sizes="180x180" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-light.png?v=13"
            media="(prefers-color-scheme: light)"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-dark.png?v=13"
            media="(prefers-color-scheme: dark)"
          />
          <meta name="theme-color" content={themeColor} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content={appleTitle} />
        </head>
        <body className="min-h-screen bg-slate-50 antialiased">
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest-admin.webmanifest" />
        {/* PWA admin (Dock / home screen): cuadro violeta. */}
        <link rel="apple-touch-icon" href="/apple-touch-icon-admin-v2.png" sizes="180x180" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-light.png?v=13"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-dark.png?v=13"
          media="(prefers-color-scheme: dark)"
        />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RDC Admin" />
      </head>
      <body className="bg-slate-50 min-h-screen">
        <ConfirmProvider>
          <AdminPerfilProvider>
            <ClientesProvider>
              <AdminPeriodoSync />
              <SessionTimeoutGuard rutaLogin={RUTA_LOGIN_ADMIN} />
              <SidebarColapsoProvider>
                <AdminShell>{children}</AdminShell>
              </SidebarColapsoProvider>
            </ClientesProvider>
          </AdminPerfilProvider>
        </ConfirmProvider>
      </body>
    </html>
  );
}