"use client";
import "../app/globals.css";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  HaciendaClientesIcon,
  HaciendaProveedoresIcon,
  HaciendaVisorIcon,
} from "@/components/portal/HaciendaNav";
import { ClientesProvider, useClientes } from "@/context/ClientesContext";
import { badgesAdmin } from "@/lib/notificaciones-badges";
import AppBadgeSync from "@/components/AppBadgeSync";
import BadgeTabPopover from "@/components/BadgeTabPopover";
import PeriodoSelector from "@/components/PeriodoSelector";
import PeriodoSelectorMovil from "@/components/admin/PeriodoSelectorMovil";
import PeriodoSelectorTopBar from "@/components/PeriodoSelectorTopBar";
import LogoutButton from "@/components/admin/LogoutButton";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import {
  AdminPerfilProvider,
  useAdminPerfil,
  type AdminPerfilSnapshot,
} from "@/components/admin/AdminPerfilContext";
import SidebarAdminHeader from "@/components/admin/SidebarAdminHeader";
import AdminTopBarAvatar from "@/components/admin/AdminTopBarAvatar";
import SessionTimeoutGuard from "@/components/SessionTimeoutGuard";
import NotificacionesBell from "@/components/NotificacionesBell";
import PaletaComandos from "@/components/admin/PaletaComandos";
import ProspectoLlegadaAviso from "@/components/admin/ProspectoLlegadaAviso";
import BottomNavAdmin from "@/components/admin/BottomNavAdmin";
import {
  SidebarRailMenu,
  SidebarRailTip,
  type RailMenuItem,
} from "@/components/admin/SidebarRailPop";
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
import {
  AdminPageToolbarProvider,
  useAdminPageToolbar,
} from "@/components/admin/AdminPageToolbarContext";


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

const BancoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 21h18" />
    <path d="M4 10h16" />
    <path d="M12 3 4 7h16l-8-4z" />
    <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
  </svg>
);

const RecordatorioIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
);

const CumplimientoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
);

const PendientesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
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

const ProspectoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

const CfdiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
);

const BlogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
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

const ADMIN_NAV_ACTIVO =
  "bg-[var(--admin-sidebar-active)] text-slate-900 dark:text-white";
const ADMIN_NAV_IDLE =
  "text-slate-600 hover:bg-[var(--admin-sidebar-hover)] hover:text-slate-900 dark:text-slate-300 dark:hover:text-white";

type AdminNavLink = {
  kind: "link";
  name: string;
  href: string;
  icon: React.ReactNode;
  modulo: Modulo;
  soloPropietario?: boolean;
};

type AdminNavGroup = {
  kind: "group";
  name: string;
  icon: React.ReactNode;
  modulo: Modulo;
  /** Si existe, el nombre navega aquí y el chevron abre el resto. */
  href?: string;
  children: Array<{ name: string; href: string }>;
};

type AdminNavSection = {
  title: string;
  items: Array<AdminNavLink | AdminNavGroup>;
};

const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "Resumen",
    items: [
      { kind: "link", name: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, modulo: "dashboard" },
      { kind: "link", name: "Mis Clientes", href: "/clientes", icon: <UsersIcon />, modulo: "clientes" },
      {
        kind: "group",
        name: "CFDI",
        icon: <CfdiIcon />,
        modulo: "clientes",
        children: [
          { name: "Visor fiscal", href: "/cfdi" },
          { name: "Clientes", href: "/cfdi?tab=clientes" },
          { name: "Proveedores", href: "/cfdi?tab=proveedores" },
          { name: "Carga XML", href: "/cfdi?tab=carga" },
        ],
      },
    ],
  },
  {
    title: "Finanzas",
    items: [
      {
        kind: "group",
        name: "Cobranza",
        href: "/cobranza",
        icon: <CobranzaIcon />,
        modulo: "cobranza",
        children: [
          { name: "Banco", href: "/banco" },
          { name: "Cobro manual", href: "/recordatorios" },
        ],
      },
      {
        kind: "group",
        name: "Ventas",
        icon: <ProspectoIcon />,
        modulo: "cobranza",
        children: [
          { name: "Prospectos", href: "/prospectos" },
          { name: "Presupuestos", href: "/presupuestos" },
        ],
      },
    ],
  },
  {
    title: "Despacho",
    items: [
      { kind: "link", name: "Cumplimiento", href: "/cumplimiento", icon: <CumplimientoIcon />, modulo: "cumplimiento" },
      { kind: "link", name: "Pendientes", href: "/pendientes", icon: <PendientesIcon />, modulo: "cumplimiento" },
      { kind: "link", name: "Encargos", href: "/encargos", icon: <EncargosIcon />, modulo: "encargos" },
      {
        kind: "group",
        name: "Accesos",
        icon: <EfirmaIcon />,
        modulo: "efirmas",
        children: [
          { name: "E.firma", href: "/accesos" },
          { name: "Contraseñas", href: "/accesos?tab=contrasenas" },
        ],
      },
      {
        kind: "link",
        name: "Blog · Q&A",
        href: "/blog-comentarios",
        icon: <BlogIcon />,
        modulo: "dashboard",
        soloPropietario: true,
      },
    ],
  },
];

function adminTienePermiso(perfil: AdminPerfilSnapshot | null, modulo: Modulo): boolean {
  if (!perfil) return true;
  if (perfil.propietario) return true;
  return perfil.permisos.includes(modulo);
}

function navHijoActivo(pathname: string, searchParams: URLSearchParams, href: string): boolean {
  const [path, qs] = href.split("?");
  if (pathname !== path) return false;
  if (!qs) {
    const tab = searchParams.get("tab");
    return !tab || tab === "visor";
  }
  const esperado = new URLSearchParams(qs);
  for (const [k, v] of esperado.entries()) {
    if (searchParams.get(k) !== v) return false;
  }
  return true;
}

function hrefNavPreservandoCliente(
  pathname: string | null,
  searchParams: URLSearchParams,
  href: string
): string {
  if (!pathname?.startsWith("/cfdi")) return href;
  const cliente = searchParams.get("cliente");
  if (!cliente) return href;
  const url = new URL(href, "http://local");
  url.searchParams.set("cliente", cliente);
  return `${url.pathname}${url.search}`;
}

function iconoNavHijo(href: string) {
  if (href === "/cobranza") return <CobranzaIcon />;
  if (href === "/banco") return <BancoIcon />;
  if (href === "/recordatorios") return <RecordatorioIcon />;
  if (href === "/prospectos") return <ProspectoIcon />;
  if (href === "/presupuestos") return <PresupuestoIcon />;
  if (href.startsWith("/accesos")) {
    if (href.includes("tab=contrasenas")) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect width="18" height="11" x="3" y="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    }
    return <EfirmaIcon />;
  }
  if (href.startsWith("/cfdi")) {
    if (href.includes("tab=clientes")) return <HaciendaClientesIcon size={18} />;
    if (href.includes("tab=proveedores")) return <HaciendaProveedoresIcon size={18} />;
    if (href.includes("tab=carga")) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    }
    return <HaciendaVisorIcon size={18} />;
  }
  return null;
}

/**
 * Sincroniza el periodo del sidebar con la ruta para que el contador
 * siempre vea el periodo correcto sin pensarlo:
 *  - /cumplimiento     → mes vencido (periodo fiscal vigente)
 *  - /cfdi             → mes vencido (visor fiscal)
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
    if (pathname === "/cumplimiento" || pathname === "/cfdi") {
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
  arrastreX,
}: {
  menuAbierto: boolean;
  onCerrar: () => void;
  /** Px de arrastre del dedo durante swipe; null si no hay arrastre activo. */
  arrastreX: number | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const esCumplimientoAdmin = pathname === "/cumplimiento" || pathname?.startsWith("/cfdi");
  const { perfil } = useAdminPerfil();
  const { listaClientes, cumplimiento, comprobantesNuevos, encargos } = useClientes();
  const { colapsado } = useSidebarColapso();
  const [railTip, setRailTip] = useState<{ label: string; top: number } | null>(
    null
  );
  const [railMenu, setRailMenu] = useState<{
    id: string;
    top: number;
    items: RailMenuItem[];
  } | null>(null);

  const badges = useMemo(
    () => badgesAdmin(listaClientes, cumplimiento, comprobantesNuevos, encargos),
    [listaClientes, cumplimiento, comprobantesNuevos, encargos]
  );

  const secciones = useMemo(() => {
    return ADMIN_NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          if (item.kind === "link") {
            if (item.soloPropietario && perfil && !perfil.propietario) return null;
            return adminTienePermiso(perfil, item.modulo) ? item : null;
          }
          if (!adminTienePermiso(perfil, item.modulo)) return null;
          const children = item.children.filter(() => adminTienePermiso(perfil, item.modulo));
          return children.length ? { ...item, children } : null;
        })
        .filter((item): item is AdminNavLink | AdminNavGroup => item != null),
    })).filter((section) => section.items.length > 0);
  }, [perfil]);

  const [gruposAbiertos, setGruposAbiertos] = useState<Record<string, boolean>>(() => ({
    Cobranza:
      pathname === "/cobranza" ||
      pathname === "/banco" ||
      pathname === "/recordatorios",
    Ventas: pathname === "/prospectos" || pathname === "/presupuestos",
    CFDI: pathname?.startsWith("/cfdi") ?? false,
    Accesos: pathname?.startsWith("/accesos") ?? false,
  }));

  useEffect(() => {
    if (
      pathname === "/cobranza" ||
      pathname === "/banco" ||
      pathname === "/recordatorios"
    ) {
      setGruposAbiertos((g) => ({ ...g, Cobranza: true }));
    }
    if (pathname === "/prospectos" || pathname === "/presupuestos") {
      setGruposAbiertos((g) => ({ ...g, Ventas: true }));
    }
    if (pathname?.startsWith("/cfdi")) {
      setGruposAbiertos((g) => ({ ...g, CFDI: true }));
    }
    if (pathname?.startsWith("/accesos")) {
      setGruposAbiertos((g) => ({ ...g, Accesos: true }));
    }
  }, [pathname]);

  const toggleGrupo = useCallback((nombre: string) => {
    setGruposAbiertos((g) => ({ ...g, [nombre]: !g[nombre] }));
  }, []);

  useEffect(() => {
    if (!colapsado) {
      setRailTip(null);
      setRailMenu(null);
    }
  }, [colapsado]);

  useEffect(() => {
    setRailMenu(null);
    setRailTip(null);
  }, [pathname]);

  const mostrarTip = useCallback(
    (el: HTMLElement, label: string) => {
      if (!colapsado || railMenu) return;
      const r = el.getBoundingClientRect();
      setRailTip({ label, top: r.top + r.height / 2 });
    },
    [colapsado, railMenu]
  );

  const abrirMenuRail = useCallback(
    (id: string, el: HTMLElement, items: RailMenuItem[]) => {
      const r = el.getBoundingClientRect();
      setRailTip(null);
      setRailMenu((cur) =>
        cur?.id === id ? null : { id, top: r.top, items }
      );
    },
    []
  );

  const verConfig =
    !perfil || perfil.propietario || perfil.permisos.includes("configuracion");

  const anchoLg = colapsado ? "lg:w-[4.5rem]" : "lg:w-64";
  const labelClass = `min-w-0 flex-1 whitespace-nowrap text-[13px] transition-opacity duration-200 ${
    colapsado ? "opacity-0" : "opacity-100"
  }`;
  const iconSlot =
    "w-9 h-9 shrink-0 flex items-center justify-center";

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
    <>
    <aside
      style={inlineStyle}
      className={`w-64 ${anchoLg} bg-[var(--admin-sidebar)] border-r border-[var(--admin-sidebar-line)] flex flex-col fixed h-full z-50 overflow-visible transition-[width,transform] duration-200 ease-out
        ${menuAbierto ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${menuAbierto || arrastrando ? "" : "pointer-events-none lg:pointer-events-auto"}`}
    >
      <SidebarAdminHeader onCerrar={onCerrar} />

      <nav className="flex-1 py-3 px-0 overflow-y-auto overflow-x-hidden">
        {secciones.map((section, sectionIdx) => (
          <div key={section.title} className={sectionIdx > 0 ? "mt-4" : ""}>
            <div className="h-5 mb-1 flex items-center overflow-hidden">
              {colapsado ? (
                sectionIdx > 0 ? (
                  <div className="mx-3 w-9 border-t border-[var(--admin-sidebar-line)]" />
                ) : null
              ) : (
                <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {section.title}
                </p>
              )}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                if (item.kind === "link") {
                  const badge = badges[item.href];
                  const activo = pathname === item.href;
                  return (
                    <div key={item.href} className="relative">
                      <Link
                        href={item.href}
                        aria-label={item.name}
                        onMouseEnter={(e) =>
                          mostrarTip(e.currentTarget, item.name)
                        }
                        onMouseLeave={() => setRailTip(null)}
                        className={`flex w-full items-center gap-3 h-9 px-3 rounded-[8px] overflow-hidden transition-colors ${
                          badge && !colapsado ? "pr-12" : ""
                        } ${activo ? ADMIN_NAV_ACTIVO : ADMIN_NAV_IDLE}`}
                      >
                        <span
                          className={`${iconSlot} ${
                            activo ? "text-slate-800 dark:text-white" : "text-slate-400"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span
                          className={`${labelClass} ${
                            activo ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {item.name}
                        </span>
                      </Link>
                      {badge && (
                        <div
                          className={`absolute ${
                            colapsado
                              ? "top-0.5 right-1"
                              : "right-3 top-1/2 -translate-y-1/2"
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
                }

                const hijosMenu: RailMenuItem[] = (
                  item.href
                    ? [{ name: item.name, href: item.href }, ...item.children]
                    : item.children
                ).map((sub) => ({
                  name: sub.name,
                  href: hrefNavPreservandoCliente(pathname, searchParams, sub.href),
                  icon: iconoNavHijo(sub.href) ?? item.icon,
                  activo: navHijoActivo(pathname ?? "", searchParams, sub.href),
                }));
                const activoHijo =
                  (item.href
                    ? navHijoActivo(pathname ?? "", searchParams, item.href)
                    : false) ||
                  item.children.some((c) =>
                    navHijoActivo(pathname ?? "", searchParams, c.href)
                  );
                const grupoAbierto =
                  Boolean(gruposAbiertos[item.name]) && !colapsado;
                const badgeGrupo = item.href ? badges[item.href] : undefined;
                const filaActivaClase = activoHijo ? ADMIN_NAV_ACTIVO : ADMIN_NAV_IDLE;
                const iconoActivoClase = activoHijo
                  ? "text-slate-800 dark:text-white"
                  : "text-slate-400";

                if (colapsado) {
                  return (
                    <div key={item.name} className="relative">
                      <button
                        type="button"
                        aria-label={item.name}
                        aria-expanded={railMenu?.id === item.name}
                        onMouseEnter={(e) =>
                          mostrarTip(e.currentTarget, item.name)
                        }
                        onMouseLeave={() => setRailTip(null)}
                        onClick={(e) =>
                          abrirMenuRail(item.name, e.currentTarget, hijosMenu)
                        }
                        className={`flex w-full items-center gap-3 h-9 px-3 rounded-[8px] overflow-hidden transition-colors ${filaActivaClase}`}
                      >
                        <span className={`${iconSlot} ${iconoActivoClase}`}>
                          {item.icon}
                        </span>
                        <span
                          className={`${labelClass} ${
                            activoHijo ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {item.name}
                        </span>
                      </button>
                      {badgeGrupo && item.href ? (
                        <div className="absolute top-0.5 right-1">
                          <BadgeTabPopover
                            titulo={item.name}
                            count={badgeGrupo.count}
                            motivo={badgeGrupo.motivo}
                            cta={badgeGrupo.cta}
                            href={item.href}
                            acento="violet"
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <div key={item.name}>
                    <div
                      className={`flex items-center rounded-[8px] overflow-hidden transition-colors ${filaActivaClase} ${
                        badgeGrupo ? "pr-2" : ""
                      }`}
                    >
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="flex min-w-0 flex-1 items-center gap-3 h-9 px-3"
                        >
                          <span className={`${iconSlot} ${iconoActivoClase}`}>
                            {item.icon}
                          </span>
                          <span
                            className={`${labelClass} ${
                              activoHijo ? "font-semibold" : "font-medium"
                            }`}
                          >
                            {item.name}
                          </span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleGrupo(item.name)}
                          className="flex min-w-0 flex-1 items-center gap-3 h-9 px-3 text-left"
                        >
                          <span className={`${iconSlot} ${iconoActivoClase}`}>
                            {item.icon}
                          </span>
                          <span
                            className={`${labelClass} ${
                              activoHijo ? "font-semibold" : "font-medium"
                            }`}
                          >
                            {item.name}
                          </span>
                        </button>
                      )}
                      {badgeGrupo && item.href ? (
                        <BadgeTabPopover
                          titulo={item.name}
                          count={badgeGrupo.count}
                          motivo={badgeGrupo.motivo}
                          cta={badgeGrupo.cta}
                          href={item.href}
                          acento="violet"
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => toggleGrupo(item.name)}
                        aria-label={
                          grupoAbierto
                            ? `Ocultar opciones de ${item.name}`
                            : `Ver opciones de ${item.name}`
                        }
                        aria-expanded={grupoAbierto}
                        className="shrink-0 p-2 rounded-md text-slate-400 hover:text-slate-700 hover:bg-[var(--admin-sidebar-hover)] dark:hover:bg-white/10"
                      >
                        <ChevronRightIcon abierto={grupoAbierto} />
                      </button>
                    </div>
                    {grupoAbierto && (
                      <div className="mt-0.5 ml-4 pl-3 border-l border-[var(--admin-sidebar-line)] space-y-0.5">
                        {item.children.map((sub) => {
                          const subHref = hrefNavPreservandoCliente(pathname, searchParams, sub.href);
                          const subActivo = navHijoActivo(pathname ?? "", searchParams, sub.href);
                          return (
                            <Link
                              key={sub.href}
                              href={subHref}
                              className={`flex items-center gap-3 h-9 px-3 rounded-[8px] text-[13px] transition-colors ${
                                subActivo
                                  ? `font-semibold ${ADMIN_NAV_ACTIVO}`
                                  : `font-medium ${ADMIN_NAV_IDLE}`
                              }`}
                            >
                              <span
                                className={`shrink-0 ${
                                  subActivo
                                    ? "text-slate-800 dark:text-white"
                                    : "text-slate-400"
                                }`}
                              >
                                {iconoNavHijo(sub.href) ?? item.icon}
                              </span>
                              <span className="min-w-0 truncate">{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="lg:hidden">
        <PeriodoSelector modoFiscal={esCumplimientoAdmin} />
      </div>

      <div className="pt-3 border-t border-[var(--admin-sidebar-line)] pb-[max(1rem,env(safe-area-inset-bottom))] space-y-1">
        {verConfig ? (
          <Link
            href="/configuracion"
            aria-label="Configuración"
            onMouseEnter={(e) => mostrarTip(e.currentTarget, "Configuración")}
            onMouseLeave={() => setRailTip(null)}
            className={`flex w-full items-center gap-3 h-10 px-3 rounded-[8px] overflow-hidden transition-colors ${
              pathname === "/configuracion"
                ? ADMIN_NAV_ACTIVO
                : ADMIN_NAV_IDLE
            }`}
          >
            <span className={iconSlot}>
              <SettingsIcon />
            </span>
            <span className={`${labelClass} font-semibold pr-3`}>
              Configuración
            </span>
          </Link>
        ) : null}
        <div
          onMouseEnter={(e) => mostrarTip(e.currentTarget, "Cerrar sesión")}
          onMouseLeave={() => setRailTip(null)}
        >
          <LogoutButton />
        </div>
      </div>
    </aside>
    {colapsado && railTip && !railMenu ? (
      <SidebarRailTip label={railTip.label} top={railTip.top} />
    ) : null}
    {colapsado && railMenu ? (
      <SidebarRailMenu
        items={railMenu.items}
        top={railMenu.top}
        onClose={() => setRailMenu(null)}
        onNavigate={() => setRailMenu(null)}
      />
    ) : null}
    </>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainScrollRef = useRef<HTMLElement>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [paletaAbierta, setPaletaAbierta] = useState(false);
  const [arrastreSidebar, setArrastreSidebar] = useState<number | null>(null);
  const { acciones: accionesToolbar } = useAdminPageToolbar();
  const tieneHerramientas = Boolean(accionesToolbar);
  const { colapsado } = useSidebarColapso();
  const margenEscritorio = colapsado
    ? "lg:ml-[4.5rem] lg:max-w-[calc(100vw-4.5rem)]"
    : "lg:ml-64 lg:max-w-[calc(100vw-16rem)]";
  const leftTopBar = colapsado ? "left-[4.5rem]" : "left-64";
  const { notificacionesAdminNoLeidas } = useClientes();
  const ANCHO_DRAWER = 256;

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
    if (pathname.startsWith("/cfdi")) return "CFDI";
    if (pathname.startsWith("/cobranza")) return "Cobranza";
    if (pathname.startsWith("/banco")) return "Banco";
    if (pathname.startsWith("/presupuestos")) return "Presupuestos";
    if (pathname.startsWith("/prospectos")) return "Prospectos web";
    if (pathname.startsWith("/recordatorios")) return "Cobro manual";
    if (pathname.startsWith("/cumplimiento")) return "Cumplimiento";
    if (pathname.startsWith("/pendientes")) return "Pendientes";
    if (pathname.startsWith("/encargos")) return "Encargos";
    if (pathname.startsWith("/accesos")) return "Accesos";
    if (pathname.startsWith("/efirmas")) return "Accesos";
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
      pathname.startsWith("/cfdi") ||
      pathname.startsWith("/cobranza") ||
      pathname.startsWith("/banco") ||
      pathname.startsWith("/cumplimiento"));

  return (
    <>
      <AdminLoadingOverlay />
      <AppBadgeSync count={notificacionesAdminNoLeidas} />

      <Suspense fallback={null}>
        <AdminSidebar
          menuAbierto={menuAbierto}
          onCerrar={() => setMenuAbierto(false)}
          arrastreX={arrastreSidebar}
        />
      </Suspense>

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
      <ProspectoLlegadaAviso />

      <EdgeSwipeZones
        onSwipeDesdeDerecha={() => {
          window.dispatchEvent(new CustomEvent("rdc:abrir-notificaciones"));
        }}
      />

      <PullToRefresh />

      {/* Chrome escritorio: barra superior + barra de herramientas (SAP) */}
      <div className={`hidden lg:flex fixed top-0 ${leftTopBar} right-0 z-30 flex-col`}>
        <header className="h-14 shrink-0 flex items-center justify-between gap-4 px-8 bg-white border-b border-[var(--admin-sidebar-line)] dark:bg-[#1c1c1e]">
          <p className="text-[15px] font-semibold text-slate-900 dark:text-white truncate min-w-0">
            {tituloPagina}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setPaletaAbierta(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-[#f2f2f7] dark:hover:bg-white/10 transition-colors"
              aria-label="Buscar en el CRM"
              title="Buscar (⌘ K)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="text-[13px] font-medium hidden xl:inline">
                Buscar
              </span>
              <span className="hidden xl:inline text-[11px] font-medium text-slate-400 bg-[#f2f2f7] dark:bg-white/10 px-1.5 py-0.5 rounded">
                ⌘ K
              </span>
            </button>
            <NotificacionesBell destinatario="admin" tamano="sm" escucharEventoGlobal />
            {rutaConPeriodo && (
              <PeriodoSelectorTopBar
                modoFiscal={
                  pathname === "/cumplimiento" || pathname?.startsWith("/cfdi")
                }
                acento="navy"
              />
            )}
            <AdminTopBarAvatar />
          </div>
        </header>
        {tieneHerramientas ? (
          <div className="h-12 shrink-0 flex items-center gap-3 px-8 bg-white border-b border-slate-200/80 dark:bg-slate-900 dark:border-white/10 shadow-sm">
            <div className="flex flex-1 min-w-0 items-center gap-2 overflow-x-auto">
              {accionesToolbar}
            </div>
          </div>
        ) : null}
      </div>

      {/* Shell móvil: header + herramientas + main scrolleable. La barra inferior flota
          (absolute) sobre el contenido, anclada a este shell h-dvh (no al
          viewport), así se ve como cápsula transparente y queda estable.
          En desktop (lg:contents) el layout vuelve al flujo normal con sidebar fijo. */}
      <div className="relative flex flex-col h-dvh max-h-dvh overflow-hidden lg:contents">
        <header className="lg:hidden shrink-0 z-30 bg-white border-b border-[var(--admin-sidebar-line)] dark:bg-[#1c1c1e]">
          <div className="relative h-14 flex items-center justify-between gap-2 px-3">
            <div className="flex items-center gap-0.5 shrink-0 min-w-[72px]">
              {rutaConPeriodo ? (
                <PeriodoSelectorMovil
                  modoFiscal={pathname === "/cumplimiento" || pathname === "/cfdi"}
                  acento="navy"
                />
              ) : null}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-20">
              <p className="text-[15px] font-semibold text-slate-900 dark:text-white leading-none">
                RDC Admin
              </p>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5 truncate max-w-full">
                {tituloPagina}
              </p>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 -mr-1">
              <button
                type="button"
                onClick={() => setPaletaAbierta(true)}
                className="p-2 rounded-xl text-slate-600 hover:bg-[#f2f2f7] hover:text-slate-800 active:scale-95 transition"
                aria-label="Buscar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <NotificacionesBell destinatario="admin" tamano="sm" escucharEventoGlobal />
              <AdminTopBarAvatar />
            </div>
          </div>
          {tieneHerramientas ? (
            <div className="px-3 pb-2.5 pt-0 border-t border-slate-100/80 dark:border-white/5 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max pt-2.5">
                {accionesToolbar}
              </div>
            </div>
          ) : null}
        </header>

        <main
          ref={mainScrollRef}
          data-rdc-scroll-root
          className={`rdc-admin-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full max-w-full px-4 pt-5 pb-[104px] lg:overflow-visible lg:flex-none lg:min-h-0 lg:pb-10 lg:pl-8 lg:pr-8 ${margenEscritorio} lg:w-auto ${
            tieneHerramientas ? "lg:pt-[8.75rem]" : "lg:pt-20"
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
              <AdminPageToolbarProvider>
                <AdminShell>{children}</AdminShell>
              </AdminPageToolbarProvider>
            </SidebarColapsoProvider>
          </ClientesProvider>
        </AdminPerfilProvider>
      </ConfirmProvider>
    </>
  );
}