"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BadgeSeccion } from "@/lib/notificaciones-badges";
import type { Cliente } from "@/lib/clientes";
import { HaciendaVisorIcon } from "@/components/portal/HaciendaNav";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  modoPortalCliente,
  portalMuestraDeclaracionAnual,
  portalMuestraEncargos,
  portalMuestraHonorarios,
} from "@/lib/config-portal-cliente";

type Props = {
  badges: Record<string, BadgeSeccion>;
  cliente: Cliente | null;
};

type IconProps = { active: boolean };

const stroke = (active: boolean) => (active ? 1.75 : 1.5);

const HomeIcon = ({ active }: IconProps) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    fillOpacity={active ? 0.22 : undefined}
    stroke="currentColor"
    strokeWidth={stroke(active)}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CuentaIcon = ({ active }: IconProps) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    fillOpacity={active ? 0.22 : undefined}
    stroke="currentColor"
    strokeWidth={stroke(active)}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15l2 2 4-4" />
  </svg>
);

const HonorariosIcon = ({ active }: IconProps) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    fillOpacity={active ? 0.22 : undefined}
    stroke="currentColor"
    strokeWidth={stroke(active)}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const HaciendaTabIcon = ({ active }: IconProps) => (
  <HaciendaVisorIcon activo={active} size={26} />
);

const PlusIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

type Tab = {
  href: string;
  label: string;
  icon: (p: IconProps) => ReactElement;
  isActive: (path: string) => boolean;
  badgeKey?: string;
  lado: "izq" | "der";
};

const TABS: Tab[] = [
  {
    href: "/portal/inicio",
    label: "Inicio",
    icon: HomeIcon,
    isActive: (p) => p === "/portal/inicio",
    lado: "izq",
  },
  {
    href: "/portal/cumplimiento",
    label: "Declaraciones",
    icon: CuentaIcon,
    isActive: (p) => p === "/portal/cumplimiento" || p === "/portal/sat",
    badgeKey: "/portal/cumplimiento",
    lado: "izq",
  },
  {
    href: "/portal/honorarios",
    label: "Honorarios",
    icon: HonorariosIcon,
    isActive: (p) => p === "/portal/honorarios",
    badgeKey: "/portal/honorarios",
    lado: "der",
  },
  {
    href: "/portal/hacienda/visor",
    label: "CFDI",
    icon: HaciendaTabIcon,
    isActive: (p) => p.startsWith("/portal/hacienda"),
    lado: "der",
  },
];

type AccionCentro = {
  href: string;
  label: string;
  icon: ReactElement;
  badge?: number;
  circulo: string;
};

const IconPagoHonorarios = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const IconPagoImpuestos = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15l2 2 4-4" />
  </svg>
);

const IconSolicitudes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

function colorBadge(tab: Tab, count: number): string {
  if (tab.href === "/portal/honorarios") {
    return count >= 2 ? "bg-red-500" : "bg-orange-400";
  }
  return "bg-[var(--portal-navy)]";
}

export default function BottomNavPortal({ badges, cliente }: Props) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  const tabs = TABS.filter((tab) => {
    if (!cliente) return true;
    const modo = modoPortalCliente(cliente);
    if (modo === "completo") return true;
    if (tab.href === "/portal/inicio" && modo === "solo_visor") return false;
    if (tab.href === "/portal/cumplimiento") {
      return portalMuestraDeclaracionAnual(cliente) && modo === "asalariado_anual";
    }
    if (tab.href === "/portal/honorarios") return portalMuestraHonorarios(cliente);
    if (tab.href.startsWith("/portal/hacienda")) return true;
    return false;
  });

  const izquierda = tabs.filter((t) => t.lado === "izq");
  const derecha = tabs.filter((t) => t.lado === "der");

  const badgeSolicitudes = badges["/portal/encargos"];
  const pendientesCentro = badgeSolicitudes?.count ?? 0;

  const acciones: AccionCentro[] = [];
  if (!cliente || portalMuestraHonorarios(cliente)) {
    acciones.push({
      href: "/portal/honorarios#comprobante",
      label: "Subir pago honorarios",
      icon: <IconPagoHonorarios />,
      circulo: "bg-[var(--portal-navy)] text-white",
    });
  }
  if (
    !cliente ||
    modoPortalCliente(cliente) === "completo" ||
    portalMuestraDeclaracionAnual(cliente)
  ) {
    acciones.push({
      href: "/portal/cumplimiento#comprobante",
      label: "Subir pago impuestos",
      icon: <IconPagoImpuestos />,
      circulo: "bg-[var(--portal-ingresos,#06b6d4)] text-white",
    });
  }
  if (!cliente || portalMuestraEncargos(cliente)) {
    acciones.push({
      href: "/portal/encargos",
      label: "Solicitudes",
      icon: <IconSolicitudes />,
      badge: pendientesCentro,
      circulo: "bg-[var(--portal-notas,#f5c518)] text-[var(--portal-navy)]",
    });
  }

  const abrir = () => {
    setAbierto(true);
    setSaliendo(false);
    requestAnimationFrame(() => setVisible(true));
  };

  const cerrar = () => {
    setSaliendo(true);
    setVisible(false);
    window.setTimeout(() => {
      setAbierto(false);
      setSaliendo(false);
    }, 150);
  };

  const toggle = () => (abierto && !saliendo ? cerrar() : abrir());

  useEffect(() => {
    setAbierto(false);
    setVisible(false);
    setSaliendo(false);
  }, [pathname]);

  useScrollLock(abierto);

  const tabBtn = (tab: Tab) => {
    const activo = tab.isActive(pathname);
    const badge = tab.badgeKey ? badges[tab.badgeKey] : undefined;
    const color = activo
      ? "text-[var(--portal-navy)] dark:text-indigo-200"
      : "text-[var(--portal-ink-muted)] dark:text-white/40";
    const label =
      tab.href === "/portal/cumplimiento" &&
      cliente &&
      modoPortalCliente(cliente) === "asalariado_anual"
        ? "Anual"
        : tab.label;
    const haciaCentro =
      tab.href === "/portal/inicio"
        ? "translate-x-1.5"
        : tab.href === "/portal/hacienda/visor"
          ? "-translate-x-1.5"
          : "";

    return (
      <Link
        key={tab.href}
        href={tab.href}
        className={`relative flex items-center justify-center h-full w-full min-w-0 ${haciaCentro} ${color}`}
        aria-current={activo ? "page" : undefined}
      >
        {activo ? (
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-current"
            aria-hidden
          />
        ) : null}
        <span
          className={`relative flex flex-col items-center justify-start gap-0.5 px-2 pt-2 pb-1 h-full transition-colors duration-200 ${color}`}
        >
          <span className="relative flex items-center justify-center">
            {tab.icon({ active: activo })}
            {badge && badge.count > 0 && (
              <span
                className={`absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full ${colorBadge(
                  tab,
                  badge.count
                )} text-white text-[10px] font-bold flex items-center justify-center`}
              >
                {badge.count}
              </span>
            )}
          </span>
          <span
            className={`text-[10px] leading-none ${activo ? "font-semibold" : ""}`}
          >
            {label}
          </span>
        </span>
      </Link>
    );
  };

  return (
    <>
      {abierto && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Cerrar acciones"
            onClick={cerrar}
            className={`absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-150 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className="absolute left-1/2"
            style={{ bottom: "calc(114px + env(safe-area-inset-bottom))" }}
          >
            {acciones.map((accion, i) => {
              const N = acciones.length;
              const spanDeg = N === 1 ? 0 : 108;
              const startDeg = 90 + spanDeg / 2;
              const ang =
                ((startDeg - (N > 1 ? (spanDeg / (N - 1)) * i : 0)) * Math.PI) /
                180;
              const R = N === 1 ? 110 : 132;
              const x = Math.cos(ang) * R;
              const y = Math.sin(ang) * R;
              const trans = visible
                ? `translate(calc(-50% + ${x.toFixed(1)}px), calc(50% - ${y.toFixed(1)}px)) scale(1)`
                : "translate(-50%, 50%) scale(0.3)";
              return (
                <Link
                  key={accion.href}
                  href={accion.href}
                  aria-label={accion.label}
                  title={accion.label}
                  onClick={cerrar}
                  className="absolute left-0 bottom-0 active:scale-95"
                  style={{
                    transform: trans,
                    opacity: visible ? 1 : 0,
                    transition:
                      "transform 240ms cubic-bezier(0.2,0.9,0.3,1.2), opacity 160ms ease",
                    transitionDelay: `${visible ? i * 22 : 0}ms`,
                  }}
                >
                  <span
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg shadow-slate-900/20 ring-1 ring-[#d1d1d6]/55 ${accion.circulo}`}
                  >
                    {accion.icon}
                  </span>
                  {accion.badge && accion.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 z-10 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                      {accion.badge}
                    </span>
                  ) : null}
                  <span className="absolute left-1/2 top-full -translate-x-1/2 mt-1.5 w-[5.75rem] text-center text-[10px] font-semibold text-white leading-[1.15] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                    {accion.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav
        className="rdc-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-50 overflow-visible bg-white dark:bg-[#3c3c3e] rounded-t-[1.75rem] shadow-[0_-10px_28px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegación principal"
      >
        <div className="pointer-events-auto mx-auto w-full grid grid-cols-5 items-center h-[69px] px-1 overflow-visible">
          {Array.from({ length: Math.max(0, 2 - izquierda.length) }).map((_, i) => (
            <span key={`pad-l-${i}`} aria-hidden />
          ))}
          {izquierda.map(tabBtn)}

          <div className="relative flex items-center justify-center h-full">
            <button
              type="button"
              onClick={toggle}
              aria-label={abierto ? "Cerrar acciones" : "Acciones rápidas"}
              aria-expanded={abierto}
              className="relative -mt-8 shrink-0 flex items-center justify-center w-[48px] h-[48px] rounded-full text-white shadow-lg shadow-black/15 ring-[3px] ring-white dark:ring-slate-900 bg-[var(--portal-navy)] active:scale-95 transition-transform"
            >
              <span
                className={`transition-transform duration-300 ${
                  abierto ? "rotate-45" : "rotate-0"
                }`}
              >
                <PlusIcon />
              </span>
              {!abierto && pendientesCentro > 0 && (
                <span className="absolute -top-1 -right-1 z-10 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {pendientesCentro}
                </span>
              )}
            </button>
          </div>

          {derecha.map(tabBtn)}
          {Array.from({ length: Math.max(0, 2 - derecha.length) }).map((_, i) => (
            <span key={`pad-r-${i}`} aria-hidden />
          ))}
        </div>
      </nav>
    </>
  );
}
