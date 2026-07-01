"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import PeriodoSelector from "@/components/PeriodoSelector";
import PeriodoSelectorMovil from "@/components/admin/PeriodoSelectorMovil";
import { useClientes } from "@/context/ClientesContext";
import { badgesPortalCliente } from "@/lib/notificaciones-badges";
import RegistrarServiceWorker from "@/components/portal/RegistrarServiceWorker";
import AppBadgeSync from "@/components/AppBadgeSync";
import BadgeTabPopover from "@/components/BadgeTabPopover";
import BottomNavPortal from "@/components/portal/BottomNavPortal";
import MiCuentaTabs from "@/components/portal/MiCuentaTabs";
import HaciendaNav from "@/components/portal/HaciendaNav";
import SessionTimeoutGuard from "@/components/SessionTimeoutGuard";
import NotificacionesBell from "@/components/NotificacionesBell";
import EdgeSwipeZones from "@/components/EdgeSwipeZones";
import PullToRefresh from "@/components/PullToRefresh";
import PortalEfirmaRecordatorio from "@/components/portal/PortalEfirmaRecordatorio";
import PortalCumpleanosCelebracion from "@/components/portal/PortalCumpleanosCelebracion";
import PortalOnboarding from "@/components/portal/PortalOnboarding";
import PortalPushRequerido from "@/components/portal/PortalPushRequerido";
import PortalBuscador from "@/components/portal/PortalBuscador";
import PortalEnlacesUtilidad from "@/components/portal/PortalEnlacesUtilidad";
import PortalModoVisorGuard from "@/components/portal/PortalModoVisorGuard";
import Logo from "@/components/publico/Logo";
import {
  destinoPortalPrincipal,
  modoPortalCliente,
  portalMuestraEncargos,
  portalMuestraHonorarios,
  portalMuestraDeclaracionAnual,
  portalMuestraSituacionFiscal,
} from "@/lib/config-portal-cliente";

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

const EncargosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);

const ChevronRightIcon = ({ abierto }: { abierto?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${abierto ? "rotate-90" : ""}`}
    aria-hidden
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

type SubMenuItem = { name: string; href: string };
type MenuItem = {
  name: string;
  href?: string;
  icon: React.ReactNode;
  children?: SubMenuItem[];
};

// Menú lateral estilo Konta: ítems con submenú muestran chevron.
const menuItems: MenuItem[] = [
  { name: "Inicio", href: "/portal/inicio", icon: <InicioIcon /> },
  {
    name: "Mi Cuenta",
    icon: <CumplimientoIcon />,
    children: [
      { name: "Declaraciones", href: "/portal/cumplimiento" },
      { name: "Situación fiscal", href: "/portal/sat" },
    ],
  },
  { name: "Honorarios", href: "/portal/honorarios", icon: <HonorariosIcon /> },
  { name: "Solicitudes", href: "/portal/encargos", icon: <EncargosIcon /> },
  { name: "Perfil", href: "/portal/perfil", icon: <PerfilIcon /> },
];

const TITULOS_PAGINA: Record<string, string> = {
  "/portal/inicio": "Inicio",
  "/portal/cumplimiento": "Declaraciones",
  "/portal/sat": "Situación fiscal",
  "/portal/hacienda/visor": "Visor fiscal",
  "/portal/hacienda/clientes": "Hacienda · Clientes",
  "/portal/hacienda/proveedores": "Hacienda · Proveedores",
  "/portal/honorarios": "Honorarios",
  "/portal/encargos": "Solicitudes",
  "/portal/perfil": "Perfil",
};

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { cliente, logout } = usePortalAuth();
  const { perfil } = usePortalPerfil();
  const {
    irAPeriodoActual,
    irAPeriodoFiscalVigente,
    cumplimiento,
    encargos,
    notificacionesClienteNoLeidas,
  } = useClientes();

  const badges = useMemo(
    () => (cliente ? badgesPortalCliente(cliente, cumplimiento, encargos) : {}),
    [cliente, cumplimiento, encargos]
  );
  const noLeidas = cliente ? notificacionesClienteNoLeidas(cliente.id) : 0;
  const esCumplimiento = pathname === "/portal/cumplimiento";
  const esHacienda = pathname.startsWith("/portal/hacienda");
  const esHonorarios = pathname === "/portal/honorarios";
  const esMiCuenta =
    pathname === "/portal/cumplimiento" ||
    pathname === "/portal/sat";
  const [miCuentaAbierto, setMiCuentaAbierto] = useState(esMiCuenta);

  useEffect(() => {
    if (esMiCuenta) setMiCuentaAbierto(true);
  }, [esMiCuenta]);

  const nombreParaSidebar =
    perfil?.perfil.nombre?.trim() ||
    perfil?.razonSocial?.trim() ||
    cliente?.razonSocial?.trim() ||
    "Mi cuenta";
  const inicialSidebar = nombreParaSidebar.charAt(0).toUpperCase() || "C";
  const avatarUrl = perfil?.perfil.avatarUrl;

  useEffect(() => {
    if (esCumplimiento || esHacienda) {
      irAPeriodoFiscalVigente();
    } else {
      irAPeriodoActual();
    }
  }, [pathname, esCumplimiento, esHacienda, irAPeriodoActual, irAPeriodoFiscalVigente]);

  const onLogout = async () => {
    await logout();
    router.replace("/portal/login");
    router.refresh();
  };

  const tituloPagina =
    TITULOS_PAGINA[pathname] ??
    (pathname.startsWith("/portal/hacienda") ? "Visor fiscal" : "Portal");

  const modoPortal = cliente ? modoPortalCliente(cliente) : "completo";

  const navItems = useMemo(() => {
    if (!cliente || modoPortal === "completo") return menuItems;

    const items: MenuItem[] = [];

    if (modoPortal !== "solo_visor") {
      items.push({ name: "Inicio", href: "/portal/inicio", icon: <InicioIcon /> });
    }

    if (portalMuestraDeclaracionAnual(cliente) && modoPortal === "asalariado_anual") {
      items.push({
        name: "Mi Cuenta",
        icon: <CumplimientoIcon />,
        children: [{ name: "Declaración anual", href: "/portal/cumplimiento" }],
      });
    }

    if (portalMuestraHonorarios(cliente)) {
      items.push({ name: "Honorarios", href: "/portal/honorarios", icon: <HonorariosIcon /> });
    }
    if (portalMuestraEncargos(cliente)) {
      items.push({ name: "Solicitudes", href: "/portal/encargos", icon: <EncargosIcon /> });
    }

    items.push({ name: "Perfil", href: "/portal/perfil", icon: <PerfilIcon /> });
    return items;
  }, [cliente, modoPortal]);

  const inicioHref = cliente ? destinoPortalPrincipal(cliente) : "/portal/inicio";

  return (
    <div className="rdc-portal flex min-h-dvh bg-[var(--portal-surface)] dark:bg-[#0a0f1e]">
      <RegistrarServiceWorker />
      <AppBadgeSync count={noLeidas} />
      {cliente ? <PortalOnboarding clienteId={cliente.id} /> : null}
      {cliente ? <PortalModoVisorGuard cliente={cliente} /> : null}
      {cliente ? <PortalPushRequerido /> : null}
      <PortalEfirmaRecordatorio />
      <PortalCumpleanosCelebracion />
      <SessionTimeoutGuard rutaLogin="/portal/login" onCerrarSesion={() => void logout()} />

      {/* Header móvil — alineado al desktop (fondo sólido, borde inferior) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 bg-[#fafbfc] border-b border-slate-200/80">
        <div className="flex items-center shrink-0">
          <Link href={inicioHref} className="flex items-center gap-2 shrink-0" aria-label="RDC Portal · Inicio">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-white ring-1 ring-slate-200">
              <Logo mark="r" variante="black" alto={18} />
            </span>
          </Link>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm font-medium text-slate-500 truncate max-w-[42%] px-2">
            {tituloPagina}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <PortalBuscador />
          {(esCumplimiento || esHacienda || esHonorarios) && (
            <PeriodoSelectorMovil modoFiscal={esCumplimiento || esHacienda} acento="navy" />
          )}
          {cliente ? (
            <NotificacionesBell
              destinatario="cliente"
              clienteId={cliente.id}
              tamano="sm"
              tituloModal="Notificaciones"
              escucharEventoGlobal
            />
          ) : (
            <div className="w-9" aria-hidden />
          )}
        </div>
      </header>

      <EdgeSwipeZones
        onSwipeDesdeDerecha={() => {
          if (cliente) {
            window.dispatchEvent(new CustomEvent("rdc:abrir-notificaciones"));
          }
        }}
      />

      <PullToRefresh />

      {/* Header desktop — mismo tono que el sidebar (estilo Konta) */}
      <header className="hidden lg:flex fixed top-0 left-64 right-0 z-30 h-14 items-center justify-between gap-4 px-8 bg-[#fafbfc] border-b border-slate-200/80 text-slate-700">
        <p className="text-sm font-medium text-slate-500 truncate min-w-0">{tituloPagina}</p>
        <div className="flex items-center gap-2 shrink-0">
          <PortalBuscador variante="barra" />
          {cliente ? (
            <NotificacionesBell
              destinatario="cliente"
              clienteId={cliente.id}
              tamano="sm"
              tituloModal="Notificaciones"
            />
          ) : null}
          <Link
            href="/portal/perfil"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-navy-soft)] text-[var(--portal-navy)] text-xs font-bold ring-1 ring-[var(--portal-navy-border)] overflow-hidden"
            title={nombreParaSidebar}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              inicialSidebar
            )}
          </Link>
        </div>
      </header>

      {/* Sidebar escritorio — limpio, iconos con color al activo */}
      <aside className="hidden lg:flex w-64 bg-[#fafbfc] border-r border-slate-200/80 flex-col fixed h-full z-40">
        <div className="px-4 pt-5 pb-3 border-b border-slate-200/60">
          <Link
            href={inicioHref}
            className="flex items-center gap-2 min-w-0"
            aria-label="RDC Portal · Ir al inicio"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-white ring-1 ring-slate-200">
              <Logo mark="r" variante="black" alto={18} />
            </span>
            <span className="leading-tight min-w-0">
              <span className="block text-sm font-bold text-slate-900 truncate">
                RDC Contadores
              </span>
              <span className="block text-[10px] font-medium text-slate-500 truncate">
                Portal del Cliente
              </span>
            </span>
          </Link>
          {cliente && portalMuestraEncargos(cliente) && (
          <Link
            href="/portal/encargos"
            className="mt-3 flex w-full items-center justify-center gap-2 h-9 rounded-lg bg-white text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
          >
            <span className="text-base leading-none" aria-hidden>+</span>
            Nueva solicitud
          </Link>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const tieneHijos = Boolean(item.children?.length);
            const activoHijo = item.children?.some((c) => pathname === c.href);
            const activo = item.href
              ? pathname === item.href || pathname.startsWith(`${item.href}/`)
              : Boolean(activoHijo);
            const badgeKey = item.href ?? "/portal/cumplimiento";
            const badge = badges[badgeKey];

            if (tieneHijos) {
              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() => setMiCuentaAbierto((v) => !v)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activoHijo
                        ? "text-[var(--portal-purple)] bg-white ring-1 ring-[var(--portal-purple-border)] shadow-sm"
                        : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
                    }`}
                  >
                    <span className={activoHijo ? "text-[var(--portal-purple)]" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className={`flex-1 text-sm ${activoHijo ? "font-bold" : "font-medium"}`}>
                      {item.name}
                    </span>
                    <ChevronRightIcon abierto={miCuentaAbierto} />
                  </button>
                  {miCuentaAbierto && (
                    <div className="mt-0.5 ml-4 pl-3 border-l border-[var(--portal-purple-border)] space-y-0.5">
                      {item.children!.map((sub) => {
                        const subActivo = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              subActivo
                                ? "font-bold text-[var(--portal-purple)] bg-[var(--portal-purple-soft)]"
                                : "font-medium text-slate-500 hover:text-slate-800 hover:bg-white/60"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {badge && activoHijo && (
                    <div className="px-3 pt-1">
                      <BadgeTabPopover
                        titulo={item.name}
                        count={badge.count}
                        motivo={badge.motivo}
                        cta={badge.cta}
                        href="/portal/cumplimiento"
                        acento="violet"
                      />
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href!}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    badge ? "pr-12" : ""
                  }                   ${
                    activo
                      ? "text-[var(--portal-purple)] bg-white ring-1 ring-[var(--portal-purple-border)] shadow-sm"
                      : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
                  }`}
                >
                  <span className={activo ? "text-[var(--portal-purple)]" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span className={`flex-1 text-sm ${activo ? "font-bold" : "font-medium"}`}>
                    {item.name}
                  </span>
                </Link>
                {badge && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <BadgeTabPopover
                      titulo={item.name}
                      count={badge.count}
                      motivo={badge.motivo}
                      cta={badge.cta}
                      href={item.href!}
                      acento="violet"
                    />
                  </div>
                )}
              </div>
            );
          })}
          <HaciendaNav variante="sidebar" />
        </nav>

        <PeriodoSelector modoFiscal={esCumplimiento || esHacienda} />

        <div className="px-3 py-3 border-t border-slate-200/60 space-y-0.5">
          <PortalEnlacesUtilidad />
          <button
            type="button"
            onClick={onLogout}
            className="w-full mt-1 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden pt-14 lg:pt-14 lg:ml-64 lg:w-auto lg:max-w-[calc(100vw-16rem)] px-4 sm:px-6 lg:px-8 pb-[calc(92px+env(safe-area-inset-bottom))] lg:pb-8 min-h-dvh">
        {/* Sub-navegación de Mi Cuenta (Cumplimiento / Situación fiscal) */}
        {esMiCuenta && cliente && portalMuestraSituacionFiscal(cliente) && (
          <div className="pt-6 lg:pt-4">
            <MiCuentaTabs />
          </div>
        )}
        {esHacienda && (
          <div className="pt-6 lg:pt-4 lg:hidden">
            <HaciendaNav variante="pills" />
          </div>
        )}

        {children}
        <footer className="mt-12 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/aviso-de-privacidad"
            className="text-[10px] font-bold text-slate-400 hover:text-[var(--portal-purple)] uppercase tracking-widest"
          >
            Aviso de privacidad
          </Link>
        </footer>
      </main>

      {cliente ? (
        <BottomNavPortal
          badges={badges}
          avatarUrl={avatarUrl}
          inicial={inicialSidebar}
          cliente={cliente}
        />
      ) : null}
    </div>
  );
}
