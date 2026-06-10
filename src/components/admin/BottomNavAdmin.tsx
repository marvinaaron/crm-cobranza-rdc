"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClientes } from "@/context/ClientesContext";
import { useAdminPerfil } from "@/components/admin/AdminPerfilContext";
import { badgesAdmin, type BadgeSeccion } from "@/lib/notificaciones-badges";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { RUTA_LOGIN_ADMIN } from "@/lib/auth/rutas";
import type { Modulo } from "@/lib/admin/permisos";

/* ---------- Iconos (mismos trazos que el sidebar) ---------- */
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const CobranzaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const CumplimientoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
);
const PresupuestoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/><path d="M15 9h4v4"/></svg>
);
const EncargosIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);
const RecordatorioIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
);
const EfirmaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const BlogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const PerfilIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

type Item = {
  name: string;
  href: string;
  icon: React.ReactNode;
  modulo: Modulo;
  badgeKey?: string;
};

// Las 4 tabs principales (1 toque). El resto vive en el "+".
const PRINCIPALES: Item[] = [
  { name: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, modulo: "dashboard" },
  { name: "Clientes", href: "/clientes", icon: <UsersIcon />, modulo: "clientes" },
  { name: "Cobranza", href: "/cobranza", icon: <CobranzaIcon />, modulo: "cobranza", badgeKey: "/cobranza" },
  { name: "Cumplimiento", href: "/cumplimiento", icon: <CumplimientoIcon />, modulo: "cumplimiento", badgeKey: "/cumplimiento" },
];

const SECUNDARIOS: Item[] = [
  { name: "Presupuestos", href: "/presupuestos", icon: <PresupuestoIcon />, modulo: "cobranza" },
  { name: "Encargos", href: "/encargos", icon: <EncargosIcon />, modulo: "encargos", badgeKey: "/encargos" },
  { name: "Recordatorios", href: "/recordatorios", icon: <RecordatorioIcon />, modulo: "cobranza" },
  { name: "E.firmas", href: "/efirmas", icon: <EfirmaIcon />, modulo: "efirmas" },
];

/** Color del círculo de badge según severidad de la sección. */
function colorBadge(href: string, count: number): string {
  if (href === "/cobranza" || href === "/cumplimiento") {
    return count >= 3 ? "bg-rose-500" : "bg-orange-400";
  }
  return "bg-violet-600";
}

/** Acento de color por tile (estilo iconos iOS). */
const ACENTO: Record<string, string> = {
  "/presupuestos": "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  "/encargos": "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  "/recordatorios": "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  "/efirmas": "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  "/blog-comentarios": "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  "/configuracion": "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200",
  "/perfil": "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
};

export default function BottomNavAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const { perfil } = useAdminPerfil();
  const { listaClientes, cumplimiento, comprobantesNuevos, encargos } = useClientes();

  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  const badges = useMemo(
    () => badgesAdmin(listaClientes, cumplimiento, comprobantesNuevos, encargos),
    [listaClientes, cumplimiento, comprobantesNuevos, encargos]
  );

  const tienePermiso = (modulo: Modulo): boolean => {
    if (!perfil) return true; // aún cargando: el guard del server decide
    if (perfil.propietario) return true;
    return perfil.permisos.includes(modulo);
  };

  const principales = PRINCIPALES.filter((i) => tienePermiso(i.modulo));

  const verConfig = !perfil || perfil.propietario || perfil.permisos.includes("configuracion");
  const esPropietario = !perfil || perfil.propietario;

  // En el arco: módulos secundarios + blog + perfil.
  // Configuración y Cerrar sesión viven en las esquinas superiores.
  const secundarios: Item[] = [
    ...SECUNDARIOS.filter((i) => tienePermiso(i.modulo)),
    ...(esPropietario
      ? [{ name: "Blog · Q&A", href: "/blog-comentarios", icon: <BlogIcon />, modulo: "dashboard" as Modulo }]
      : []),
    { name: "Mi perfil", href: "/perfil", icon: <PerfilIcon />, modulo: "dashboard" as Modulo },
  ];

  // Datos del avatar del admin (para el círculo "Mi perfil").
  const avatarUrl = perfil?.perfil.avatarUrl;
  const nombreAdmin =
    perfil?.perfil.nombreCompleto?.trim() ||
    perfil?.email?.split("@")[0] ||
    "Admin";
  const inicialAdmin = (nombreAdmin.charAt(0) || "A").toUpperCase();

  // Suma de pendientes que quedan escondidos detrás del "+", para avisar
  // con un puntito rojo que hay algo por atender en el menú secundario.
  const pendientesSecundarios = secundarios.reduce((acc, i) => {
    const b: BadgeSeccion | undefined = i.badgeKey ? badges[i.badgeKey] : undefined;
    return acc + (b?.count ?? 0);
  }, 0);

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

  // Cierra al cambiar de ruta.
  useEffect(() => {
    setAbierto(false);
    setVisible(false);
    setSaliendo(false);
  }, [pathname]);

  // Bloquea scroll del body mientras el menú "+" está abierto.
  useEffect(() => {
    if (!abierto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [abierto]);

  async function handleLogout() {
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
      router.push(RUTA_LOGIN_ADMIN);
      router.refresh();
    } catch {
      /* noop */
    }
  }

  const tabBtn = (item: Item) => {
    const activo = pathname === item.href;
    const badge = item.badgeKey ? badges[item.badgeKey] : undefined;
    const color = activo
      ? "text-[#4f46e5] dark:text-[#a5b4fc]"
      : "text-[rgba(30,27,75,0.45)] dark:text-white/45";
    return (
      <Link
        key={item.href}
        href={item.href}
        className="flex items-center justify-center h-full"
        aria-current={activo ? "page" : undefined}
      >
        <span
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition-colors duration-200 ${color} ${
            activo ? "rdc-nav-pill" : ""
          }`}
        >
          <span className="relative flex items-center justify-center">
            {item.icon}
            {badge && badge.count > 0 && (
              <span
                className={`absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full ${colorBadge(
                  item.href,
                  badge.count
                )} text-white text-[10px] font-bold flex items-center justify-center`}
              >
                {badge.count}
              </span>
            )}
          </span>
          <span className={`text-[9px] leading-none ${activo ? "font-semibold" : ""}`}>
            {item.name}
          </span>
        </span>
      </Link>
    );
  };

  // Reparte las principales 2 a la izquierda y el resto a la derecha del "+".
  const izquierda = principales.slice(0, 2);
  const derecha = principales.slice(2);

  // Ítems que se despliegan en arco desde el "+" (círculos).
  const ACENTO_DEFAULT =
    "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200";
  type ArcoItem = {
    key: string;
    icon: React.ReactNode;
    name: string;
    href?: string;
    onClick?: () => void;
    badge?: BadgeSeccion;
    acento: string;
    activo: boolean;
  };
  const arco: ArcoItem[] = secundarios.map((i) => ({
    key: i.href,
    icon: i.icon,
    name: i.name,
    href: i.href,
    badge: i.badgeKey ? badges[i.badgeKey] : undefined,
    acento: ACENTO[i.href] ?? ACENTO_DEFAULT,
    activo: pathname === i.href,
  }));

  return (
    <>
      {/* Overlay + rejilla de iconos (estilo Control Center de iOS) */}
      {abierto && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={cerrar}
            className={`absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-150 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Arco de círculos que emergen desde el "+" */}
          <div
            className="absolute left-1/2"
            style={{ bottom: "calc(56px + env(safe-area-inset-bottom))" }}
          >
            {arco.map((it, i) => {
              const N = arco.length;
              const spanDeg = 156;
              const startDeg = 90 + spanDeg / 2; // arranca por la izquierda
              const ang =
                ((startDeg - (N > 1 ? (spanDeg / (N - 1)) * i : 0)) * Math.PI) /
                180;
              const R = 150;
              const x = Math.cos(ang) * R;
              const y = Math.sin(ang) * R;
              const trans = visible
                ? `translate(calc(-50% + ${x.toFixed(1)}px), calc(50% - ${y.toFixed(
                    1
                  )}px)) scale(1)`
                : "translate(-50%, 50%) scale(0.3)";

              const esPerfil = it.key === "/perfil";
              const circulo = (
                <span
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg shadow-slate-900/15 overflow-hidden ${
                    esPerfil ? "bg-white dark:bg-slate-800" : it.acento
                  } ${
                    it.activo
                      ? "ring-2 ring-violet-500"
                      : "ring-1 ring-black/5 dark:ring-white/10"
                  }`}
                >
                  {esPerfil ? (
                    avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="Mi perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
                        {inicialAdmin}
                      </span>
                    )
                  ) : (
                    it.icon
                  )}
                  {it.badge && it.badge.count > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full ${colorBadge(
                        it.href ?? "",
                        it.badge.count
                      )} text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900`}
                    >
                      {it.badge.count}
                    </span>
                  )}
                </span>
              );

              const estilo: React.CSSProperties = {
                transform: trans,
                opacity: visible ? 1 : 0,
                transition: "transform 240ms cubic-bezier(0.2,0.9,0.3,1.2), opacity 160ms ease",
                transitionDelay: `${visible ? i * 22 : 0}ms`,
              };

              return it.href ? (
                <Link
                  key={it.key}
                  href={it.href}
                  aria-label={it.name}
                  title={it.name}
                  onClick={cerrar}
                  className="absolute left-0 bottom-0 active:scale-95"
                  style={estilo}
                >
                  {circulo}
                </Link>
              ) : (
                <button
                  key={it.key}
                  type="button"
                  aria-label={it.name}
                  title={it.name}
                  onClick={it.onClick}
                  className="absolute left-0 bottom-0 active:scale-95"
                  style={estilo}
                >
                  {circulo}
                </button>
              );
            })}
          </div>

          {/* Esquinas superiores: Ajustes (izq) y Cerrar sesión (der) */}
          {verConfig && (
            <Link
              href="/configuracion"
              onClick={cerrar}
              className="absolute left-4 flex items-center gap-2 rounded-full pl-2 pr-3.5 py-2 bg-white/85 dark:bg-slate-800/85 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg text-slate-700 dark:text-slate-100 active:scale-95"
              style={{
                top: "calc(env(safe-area-inset-top) + 12px)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(-10px)",
                transition: "opacity 160ms ease, transform 220ms ease",
                transitionDelay: visible ? "60ms" : "0ms",
              }}
            >
              <span className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200">
                <SettingsIcon />
              </span>
              <span className="text-[12px] font-semibold">Ajustes</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              cerrar();
              void handleLogout();
            }}
            className="absolute right-4 flex items-center gap-2 rounded-full pl-3.5 pr-2 py-2 bg-white/85 dark:bg-slate-800/85 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg text-rose-600 dark:text-rose-300 active:scale-95"
            style={{
              top: "calc(env(safe-area-inset-top) + 12px)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(-10px)",
              transition: "opacity 160ms ease, transform 220ms ease",
              transitionDelay: visible ? "60ms" : "0ms",
            }}
          >
            <span className="text-[12px] font-semibold">Cerrar sesión</span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
              <LogoutIcon />
            </span>
          </button>
        </div>
      )}

      {/* Barra inferior */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pointer-events-none"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        aria-label="Navegación principal"
      >
        <div className="rdc-glass-nav pointer-events-auto mx-auto w-full max-w-[330px] flex items-center justify-around h-14 rounded-full px-2 bg-white border border-slate-200 dark:bg-slate-900 dark:border-white/10">
          {izquierda.map(tabBtn)}

          {/* FAB central */}
          <button
            type="button"
            onClick={toggle}
            aria-label={abierto ? "Cerrar menú" : "Más opciones"}
            aria-expanded={abierto}
            className="relative -mt-6 shrink-0 flex items-center justify-center w-[50px] h-[50px] rounded-full text-white shadow-lg shadow-violet-500/30 ring-[3px] ring-white dark:ring-slate-900 bg-gradient-to-br from-violet-600 to-indigo-700 active:scale-95 transition-transform"
          >
            <span
              className={`transition-transform duration-300 ${abierto ? "rotate-45" : "rotate-0"}`}
            >
              <PlusIcon />
            </span>
            {!abierto && pendientesSecundarios > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {derecha.map(tabBtn)}
        </div>
      </nav>
    </>
  );
}
