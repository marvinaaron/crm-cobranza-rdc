"use client";
import "../app/globals.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ClientesProvider, useClientes } from "@/context/ClientesContext";
import { badgesAdmin } from "@/lib/notificaciones-badges";
import AppBadgeSync from "@/components/AppBadgeSync";
import BadgeTabPopover from "@/components/BadgeTabPopover";
import PeriodoSelector from "@/components/PeriodoSelector";
import PeriodoSelectorMovil from "@/components/admin/PeriodoSelectorMovil";
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
import BottomNavAdmin from "@/components/admin/BottomNavAdmin";
import AdminLoadingOverlay from "@/components/admin/AdminLoadingOverlay";
import EdgeSwipeZones from "@/components/EdgeSwipeZones";
import PullToRefresh from "@/components/PullToRefresh";
import ThemeController from "@/components/ThemeController";
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

const RecordatorioIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
);

const CumplimientoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
);

const EncargosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);

const EfirmaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
);

const PresupuestoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/><path d="M15 9h4v4"/></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
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
  const { listaClientes, cumplimiento, comprobantesNuevos, encargos } = useClientes();
  const {
    colapsado,
    efectivoExpandido,
    toggleColapsado,
    setHoverExpandido,
  } = useSidebarColapso();

  const badges = useMemo(
    () => badgesAdmin(listaClientes, cumplimiento, comprobantesNuevos, encargos),
    [listaClientes, cumplimiento, comprobantesNuevos, encargos]
  );

  const menuItems: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
    modulo: Modulo;
  }> = [
    { name: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, modulo: "dashboard" },
    { name: "Mis Clientes", href: "/clientes", icon: <UsersIcon />, modulo: "clientes" },
    { name: "Cobranza", href: "/cobranza", icon: <CobranzaIcon />, modulo: "cobranza" },
    { name: "Presupuestos", href: "/presupuestos", icon: <PresupuestoIcon />, modulo: "cobranza" },
    { name: "Cumplimiento", href: "/cumplimiento", icon: <CumplimientoIcon />, modulo: "cumplimiento" },
    { name: "Encargos", href: "/encargos", icon: <EncargosIcon />, modulo: "encargos" },
    { name: "Cobro manual", href: "/recordatorios", icon: <RecordatorioIcon />, modulo: "cobranza" },
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
        {items.map((item) => {
          const badge = badges[item.href];
          const activo = pathname === item.href;
          return (
            <div key={item.href} className="relative">
              <Link
                href={item.href}
                title={!efectivoExpandido ? item.name : undefined}
                className={`flex w-full items-center gap-3 h-11 rounded-xl overflow-hidden transition-colors ${
                  badge && efectivoExpandido ? "pr-12" : ""
                } ${
                  activo
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-100 dark:shadow-violet-900/40"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <span
                  className={`w-12 shrink-0 flex items-center justify-center ${
                    activo
                      ? "text-white"
                      : "text-slate-400 dark:text-slate-400"
                  }`}
                >
                  {item.icon}
                </span>
                <span className={`${labelClass} flex-1 font-semibold text-[15px]`}>
                  {item.name}
                </span>
              </Link>
              {badge && (
                <div
                  className={`absolute ${
                    efectivoExpandido
                      ? "right-3 top-1/2 -translate-y-1/2"
                      : "top-1 right-1.5"
                  }`}
                >
                  <BadgeTabPopover
                    titulo={item.name}
                    count={badge.count}
                    motivo={badge.motivo}
                    cta={badge.cta}
                    href={item.href}
                    acento="violet"
                  />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <PeriodoSelector modoFiscal={esCumplimientoAdmin} />

      <div className="pt-3 border-t border-slate-100 dark:border-white/10 pb-[max(1rem,env(safe-area-inset-bottom))] px-3 space-y-1">
        {(!perfil || perfil.propietario) && (
          <Link
            href="/blog-comentarios"
            title={!efectivoExpandido ? "Comentarios del blog" : undefined}
            className={`flex w-full items-center gap-3 h-11 rounded-xl overflow-hidden transition-colors ${
              pathname === "/blog-comentarios"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-100 dark:shadow-violet-900/40"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            <span className="w-12 shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span className={`${labelClass} font-semibold text-[13px] pr-3`}>
              Blog · Q&amp;A
            </span>
          </Link>
        )}
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
  const mainScrollRef = useRef<HTMLElement>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [paletaAbierta, setPaletaAbierta] = useState(false);
  const [arrastreSidebar, setArrastreSidebar] = useState<number | null>(null);
  const { colapsado } = useSidebarColapso();
  const { notificacionesAdminNoLeidas } = useClientes();
  const { perfil } = useAdminPerfil();
  const ANCHO_DRAWER = 256;

  // Datos del avatar del admin para el header móvil.
  const avatarUrl = perfil?.perfil.avatarUrl;
  const nombreAdmin =
    perfil?.perfil.nombreCompleto?.trim() ||
    perfil?.email?.split("@")[0] ||
    "Admin";
  const inicialAdmin = (nombreAdmin.charAt(0) || "A").toUpperCase();

  // Cierra el menú móvil al cambiar de ruta.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMenuAbierto(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Al navegar, el scroll ocurre dentro de <main> (shell móvil), no en window.
  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
    window.scrollTo(0, 0);
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
    if (pathname.startsWith("/presupuestos")) return "Presupuestos";
    if (pathname.startsWith("/recordatorios")) return "Cobro manual";
    if (pathname.startsWith("/cumplimiento")) return "Cumplimiento";
    if (pathname.startsWith("/efirmas")) return "E.firmas";
    if (pathname.startsWith("/configuracion")) return "Configuración";
    if (pathname.startsWith("/blog-comentarios")) return "Blog · Q&A";
    if (pathname.startsWith("/perfil")) return "Mi perfil";
    return "RDC CRM";
  })();

  // Páginas cuyos datos dependen del mes/año: ahí mostramos el selector móvil.
  const rutaConPeriodo =
    !!pathname &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/clientes") ||
      pathname.startsWith("/cobranza") ||
      pathname.startsWith("/cumplimiento"));

  return (
    <>
      <AdminLoadingOverlay />
      <AppBadgeSync count={notificacionesAdminNoLeidas} />

      {/* Campana flotante fija — solo escritorio, presente en todas las páginas. */}
      <div className="hidden lg:flex fixed top-8 right-11 z-40 items-center">
        <NotificacionesBell destinatario="admin" tamano="md" />
      </div>

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

      <PaletaComandos abierto={paletaAbierta} onCerrar={() => setPaletaAbierta(false)} />

      <EdgeSwipeZones
        onSwipeDesdeDerecha={() => {
          window.dispatchEvent(new CustomEvent("rdc:abrir-notificaciones"));
        }}
      />

      <PullToRefresh />

      {/* Shell móvil: header + main scrolleable. La barra inferior flota
          (absolute) sobre el contenido, anclada a este shell h-dvh (no al
          viewport), así se ve como cápsula transparente y queda estable.
          En desktop (lg:contents) el layout vuelve al flujo normal con sidebar fijo. */}
      <div className="relative flex flex-col h-dvh max-h-dvh overflow-hidden lg:contents">
        <header className="lg:hidden relative shrink-0 z-30 h-14 bg-[#f8fafc] border-b border-slate-200/60 flex items-center justify-between px-4 dark:bg-[#0a0f1e] dark:border-white/10">
          {/* Izquierda: Perfil (avatar) + Calendario */}
          <div className="flex items-center gap-0.5 shrink-0 relative">
            <Link
              href="/perfil"
              aria-label="Mi perfil"
              className="shrink-0 rounded-full active:scale-95 transition"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Mi perfil"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center text-[13px] font-bold">
                  {inicialAdmin}
                </span>
              )}
            </Link>
            {rutaConPeriodo && (
              <PeriodoSelectorMovil modoFiscal={pathname === "/cumplimiento"} />
            )}
          </div>

          {/* Centro: título SIEMPRE centrado (independiente de los iconos) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
            <p className="text-base font-black text-violet-600 leading-none">RDC Admin</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[55%]">
              {tituloPagina}
            </p>
          </div>

          {/* Derecha: Buscador + Campana */}
          <div className="flex items-center gap-0.5 justify-end shrink-0 -mr-2 relative">
            <button
              type="button"
              onClick={() => setPaletaAbierta(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition"
              aria-label="Buscar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <NotificacionesBell destinatario="admin" tamano="sm" escucharEventoGlobal />
          </div>
        </header>

        <main
          ref={mainScrollRef}
          data-rdc-scroll-root
          className={`rdc-admin-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full max-w-full px-4 pb-[104px] lg:overflow-visible lg:flex-none lg:min-h-0 lg:pt-8 lg:pb-8 lg:pl-8 lg:pr-8 lg:w-auto transition-[margin,max-width] duration-300 ease-in-out ${
            colapsado
              ? "lg:ml-[72px] lg:max-w-[calc(100vw-72px)]"
              : "lg:ml-64 lg:max-w-[calc(100vw-16rem)]"
          }`}
        >
          {children}
        </main>

        <BottomNavAdmin />
      </div>
    </>
  );
}

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const usaAdminShell = esRutaAdmin(pathname);

  if (!usaAdminShell) {
    return (
      <>
        <ThemeController />
        <ConfirmProvider>{children}</ConfirmProvider>
      </>
    );
  }

  return (
    <>
      <ThemeController />
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
    </>
  );
}