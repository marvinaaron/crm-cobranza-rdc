"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import PeriodoSelector from "@/components/PeriodoSelector";
import PeriodoSelectorMovil from "@/components/admin/PeriodoSelectorMovil";
import { useClientes } from "@/context/ClientesContext";
import { regimenPorClave } from "@/lib/regimenes-fiscales";
import { badgesPortalCliente } from "@/lib/notificaciones-badges";
import RegistrarServiceWorker from "@/components/portal/RegistrarServiceWorker";
import AppBadgeSync from "@/components/AppBadgeSync";
import BadgeTabPopover from "@/components/BadgeTabPopover";
import BottomNavPortal from "@/components/portal/BottomNavPortal";
import MiCuentaTabs from "@/components/portal/MiCuentaTabs";
import PortalEstadoAtencion from "@/components/portal/PortalEstadoAtencion";
import SessionTimeoutGuard from "@/components/SessionTimeoutGuard";
import NotificacionesBell from "@/components/NotificacionesBell";
import EdgeSwipeZones from "@/components/EdgeSwipeZones";
import PullToRefresh from "@/components/PullToRefresh";
import PortalEfirmaRecordatorio from "@/components/portal/PortalEfirmaRecordatorio";
import PortalCumpleanosCelebracion from "@/components/portal/PortalCumpleanosCelebracion";
import PortalOnboarding from "@/components/portal/PortalOnboarding";
import PortalPushRequerido from "@/components/portal/PortalPushRequerido";
import Logo from "@/components/publico/Logo";

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

// Menú del sidebar de escritorio. "Mi Cuenta" agrupa Cumplimiento (estatus
// mensual) y, como sub-página, la Situación fiscal (SAT).
const menuItems = [
  { name: "Inicio", href: "/portal/inicio", icon: <InicioIcon /> },
  { name: "Mi Cuenta", href: "/portal/cumplimiento", icon: <CumplimientoIcon /> },
  { name: "Honorarios", href: "/portal/honorarios", icon: <HonorariosIcon /> },
  { name: "Solicitudes", href: "/portal/encargos", icon: <EncargosIcon /> },
  { name: "Perfil", href: "/portal/perfil", icon: <PerfilIcon /> },
];

const TITULOS_PAGINA: Record<string, string> = {
  "/portal/inicio": "Inicio",
  "/portal/cumplimiento": "Mi Cuenta",
  "/portal/sat": "Situación fiscal",
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
  const esHonorarios = pathname === "/portal/honorarios";
  const esMiCuenta = pathname === "/portal/cumplimiento" || pathname === "/portal/sat";

  const nombreParaSidebar =
    perfil?.perfil.nombre?.trim() ||
    perfil?.razonSocial?.trim() ||
    cliente?.razonSocial?.trim() ||
    "Mi cuenta";
  const inicialSidebar = nombreParaSidebar.charAt(0).toUpperCase() || "C";
  const avatarUrl = perfil?.perfil.avatarUrl;
  const regimenLabel = regimenPorClave(cliente?.regimenFiscalClave)?.label;

  useEffect(() => {
    if (esCumplimiento) {
      irAPeriodoFiscalVigente();
    } else {
      irAPeriodoActual();
    }
  }, [pathname, esCumplimiento, irAPeriodoActual, irAPeriodoFiscalVigente]);

  const onLogout = async () => {
    await logout();
    router.replace("/portal/login");
    router.refresh();
  };

  const tituloPagina = TITULOS_PAGINA[pathname] ?? "Portal";

  return (
    <div className="rdc-portal flex min-h-dvh bg-[var(--portal-surface)] dark:bg-[#0a0f1e]">
      {/* Blobs decorativos del wallpaper (solo móvil, detrás del contenido) */}
      <span className="rdc-blob rdc-blob-1 lg:hidden" aria-hidden />
      <span className="rdc-blob rdc-blob-2 lg:hidden" aria-hidden />
      <span className="rdc-blob rdc-blob-3 lg:hidden" aria-hidden />
      <span className="rdc-blob rdc-blob-4 lg:hidden" aria-hidden />
      <RegistrarServiceWorker />
      <AppBadgeSync count={noLeidas} />
      {cliente ? <PortalOnboarding clienteId={cliente.id} /> : null}
      {cliente ? <PortalPushRequerido /> : null}
      <PortalEfirmaRecordatorio />
      <PortalCumpleanosCelebracion />
      <SessionTimeoutGuard rutaLogin="/portal/login" onCerrarSesion={() => void logout()} />

      {/* Header móvil: marca + título + campana (sin hamburguesa; el nav vive abajo).
          El fondo se desvanece hacia abajo (sólido en el dynamic island → transparente). */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4">
        {/* Capa de fondo degradada (detrás del contenido, no afecta iconos/título) */}
        <div
          className="rdc-portal-header-fade absolute inset-x-0 top-0 -bottom-6 -z-10 pointer-events-none"
          aria-hidden
        />

        {/* Izquierda: isotipo */}
        <div className="flex items-center shrink-0 relative z-10">
          <Link href="/portal/inicio" className="flex items-center shrink-0" aria-label="RDC Portal · Inicio">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-[var(--portal-navy)] ring-1 ring-[var(--portal-navy)]/30">
              <Logo mark="r" variante="white" alto={18} />
            </span>
          </Link>
        </div>

        {/* Centro: título */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[9px] font-bold text-[var(--portal-ink-muted)] dark:text-slate-400 uppercase tracking-widest truncate max-w-[38%] px-2">
            {tituloPagina}
          </p>
        </div>

        {/* Derecha: calendario + campana */}
        <div className="flex items-center gap-0.5 shrink-0 relative z-10">
          {(esCumplimiento || esHonorarios) && (
            <PeriodoSelectorMovil modoFiscal={esCumplimiento} acento="navy" />
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

      {/* Header desktop — navy Skydropx */}
      <header className="hidden lg:flex fixed top-0 left-64 right-0 z-30 h-14 items-center justify-between gap-4 px-8 bg-[var(--portal-navy)] text-white shadow-sm">
        <p className="text-sm font-semibold tracking-tight truncate min-w-0">{tituloPagina}</p>
        <div className="flex items-center gap-2 shrink-0">
          {cliente ? (
            <NotificacionesBell
              destinatario="cliente"
              clienteId={cliente.id}
              tamano="sm"
              tituloModal="Notificaciones"
              variante="light"
            />
          ) : null}
        </div>
      </header>

      {/* Swipe desde la derecha abre notificaciones (gesto independiente del menú) */}
      <EdgeSwipeZones
        onSwipeDesdeDerecha={() => {
          if (cliente) {
            window.dispatchEvent(new CustomEvent("rdc:abrir-notificaciones"));
          }
        }}
      />

      <PullToRefresh />

      {/* Sidebar solo escritorio (intacto). En móvil se usa el bottom nav. */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-white/10 flex-col fixed h-full shadow-sm z-40">
        <div className="px-5 pb-4 pt-[max(0.5rem,env(safe-area-inset-top))] border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/portal/inicio"
              className="flex items-center gap-2 min-w-0 group overflow-hidden"
              aria-label="RDC Portal · Ir al inicio"
            >
              <span
                className="
                  inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0
                  bg-[var(--portal-navy)]
                  shadow-md ring-1 ring-[var(--portal-navy)]/25
                  group-hover:bg-[var(--portal-navy-hover)]
                  transition-colors
                "
              >
                <Logo mark="r" variante="white" alto={22} />
              </span>
              <span className="leading-tight min-w-0 whitespace-nowrap">
                <span className="block text-[15px] font-black text-slate-900 dark:text-white">
                  RDC
                </span>
                <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-[var(--portal-purple)] -mt-0.5">
                  Portal del cliente
                </span>
              </span>
            </Link>
          </div>
          <Link
            href="/portal/perfil"
            className={`mt-3 flex items-center gap-3 rounded-xl p-3 ring-1 transition-colors ${
              pathname === "/portal/perfil"
                ? "bg-[var(--portal-purple-soft)] ring-[var(--portal-purple-border)]"
                : "bg-slate-50/70 ring-slate-100 hover:bg-slate-100/70 dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10"
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
              <div className="w-10 h-10 rounded-full bg-[var(--portal-navy)] text-white flex items-center justify-center text-sm font-black shrink-0">
                {inicialSidebar}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[14px] font-black text-slate-800 dark:text-white leading-snug line-clamp-2">
                {nombreParaSidebar}
              </p>
              {regimenLabel ? (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-[var(--portal-purple-soft)] text-[9px] font-black uppercase tracking-widest text-[var(--portal-purple)]">
                  {regimenLabel}
                </span>
              ) : (
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-1">
                  Ver mi perfil
                </p>
              )}
            </div>
          </Link>

          <div className="mt-2">
            <PortalEstadoAtencion />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const badge = badges[item.href];
            const activo =
              item.href === "/portal/cumplimiento"
                ? esMiCuenta
                : pathname === item.href;
            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 ${
                    badge ? "pr-12" : ""
                  } rounded-xl transition-all ${
                    activo
                      ? "portal-sidebar-link-active font-semibold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[var(--portal-navy)] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  <span
                    className={
                      activo
                        ? "text-[var(--portal-navy)]"
                        : "text-slate-400 dark:text-slate-400"
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 font-semibold text-[15px]">
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
                      href={item.href}
                      acento="navy"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <PeriodoSelector modoFiscal={esCumplimiento} />

        <div className="p-4 border-t border-slate-100 dark:border-white/10">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/15 dark:hover:text-red-300 transition-colors"
          >
            Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden pt-16 lg:pt-14 lg:ml-64 lg:w-auto lg:max-w-[calc(100vw-16rem)] px-4 sm:px-6 lg:px-8 pb-[calc(92px+env(safe-area-inset-bottom))] lg:pb-8 min-h-dvh">
        {/* Sub-navegación de Mi Cuenta (Cumplimiento / Situación fiscal) */}
        {esMiCuenta && (
          <div className="pt-6 lg:pt-4">
            <MiCuentaTabs />
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
        />
      ) : null}
    </div>
  );
}
