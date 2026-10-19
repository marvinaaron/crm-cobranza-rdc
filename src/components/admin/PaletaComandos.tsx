"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useClientes } from "@/context/ClientesContext";
import { useAdminPerfil } from "@/components/admin/AdminPerfilContext";
import type { Cliente } from "@/lib/clientes";
import { useScrollLock } from "@/hooks/useScrollLock";
import { HaciendaVisorIcon } from "@/components/portal/HaciendaNav";

type Atajo = {
  id: string;
  titulo: string;
  subtitulo?: string;
  badge?: string;
  icon: ReactNode;
  iconClase?: string;
  destacado?: boolean;
  onSelect: () => void;
  /** Para clasificación visual. */
  grupo: "clientes" | "navegacion" | "acciones";
};

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
const InicioIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const CobranzaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const BancoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h16"/><path d="M12 3 4 7h16l-8-4z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/><path d="M2 18h20"/></svg>
);
const PresupuestoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/><path d="M15 9h4v4"/></svg>
);
const CobroManualIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
);
const CumplimientoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
);
const PendientesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
);
const EncargosIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);
const AccesosIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const TicketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const BlogIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const POZO_ICONO = "bg-slate-100 text-slate-600";

const RUTAS_NAV: Array<{
  label: string;
  href: string;
  desc: string;
  icon: ReactNode;
}> = [
  { label: "Inicio", href: "/dashboard", desc: "Resumen del despacho", icon: <InicioIcon /> },
  { label: "Mis Clientes", href: "/clientes", desc: "Catálogo de clientes", icon: <UserIcon /> },
  { label: "CFDI", href: "/cfdi", desc: "Visor fiscal y carga de XML por cliente", icon: <HaciendaVisorIcon size={18} /> },
  { label: "Cobranza", href: "/cobranza", desc: "Cobros, comprobantes, facturas", icon: <CobranzaIcon /> },
  { label: "Banco", href: "/banco", desc: "Ingresos reales y control de facturación", icon: <BancoIcon /> },
  { label: "Presupuestos", href: "/presupuestos", desc: "Cotizaciones y prospectos", icon: <PresupuestoIcon /> },
  { label: "Cobro manual", href: "/recordatorios", desc: "Correos de honorarios (manual)", icon: <CobroManualIcon /> },
  { label: "Cumplimiento", href: "/cumplimiento", desc: "Impuestos, REPSE, IMSS", icon: <CumplimientoIcon /> },
  { label: "Pendientes", href: "/pendientes", desc: "To-dos y timeline del despacho", icon: <PendientesIcon /> },
  { label: "Encargos", href: "/encargos", desc: "Solicitudes personalizadas", icon: <EncargosIcon /> },
  { label: "Accesos", href: "/accesos", desc: "E.firmas y contraseñas", icon: <AccesosIcon /> },
  { label: "Configuración", href: "/configuracion", desc: "Respaldos y equipo", icon: <SettingsIcon /> },
  { label: "Comentarios del blog", href: "/blog-comentarios", desc: "Preguntas y respuestas del blog", icon: <BlogIcon /> },
  { label: "Mi perfil", href: "/perfil", desc: "Tus datos y avatar", icon: <UserIcon /> },
];

const ATAJOS_RAPIDOS: Array<{
  label: string;
  href: string;
  desc: string;
  icon: ReactNode;
  iconClase: string;
  destacado?: boolean;
}> = [
  {
    label: "Comprobantes nuevos",
    href: "/cobranza?filtro=comprobantes",
    desc: "Validar pagos del portal",
    icon: <TicketIcon />,
    iconClase: "bg-[#1a164d] text-white",
    destacado: true,
  },
  {
    label: "Clientes atrasados",
    href: "/cobranza?filtro=clientes_atrasados",
    desc: "Cobranza vencida",
    icon: <CobranzaIcon />,
    iconClase: "bg-slate-800 text-white",
    destacado: true,
  },
  {
    label: "Sin iniciar (Cumplimiento)",
    href: "/cumplimiento?filtro=paso1",
    desc: "Pendientes de iniciar",
    icon: <CumplimientoIcon />,
    iconClase: POZO_ICONO,
  },
  {
    label: "Listos para notificar",
    href: "/cumplimiento?filtro=paso4",
    desc: "Espera confirmación del cliente",
    icon: <MailIcon />,
    iconClase: POZO_ICONO,
  },
];

function quitarAcentos(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

type Props = {
  abierto: boolean;
  onCerrar: () => void;
};

export default function PaletaComandos({ abierto, onCerrar }: Props) {
  const router = useRouter();
  const { listaClientes } = useClientes();
  const { perfil } = useAdminPerfil();
  const [consulta, setConsulta] = useState("");
  const [indiceActivo, setIndiceActivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  useScrollLock(abierto);

  useEffect(() => {
    if (!abierto) return;
    setConsulta("");
    setIndiceActivo(0);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [abierto]);

  const tienePermiso = useCallback(
    (modulo: string) => {
      if (!perfil) return true;
      if (perfil.propietario) return true;
      return (
        modulo === "perfil" ||
        perfil.permisos.includes(modulo as never)
      );
    },
    [perfil]
  );

  const moduloDeRuta = (href: string): string => {
    if (href.startsWith("/dashboard")) return "dashboard";
    if (href.startsWith("/clientes")) return "clientes";
    if (href.startsWith("/cobranza")) return "cobranza";
    if (href.startsWith("/banco")) return "cobranza";
    if (href.startsWith("/presupuestos")) return "cobranza";
    if (href.startsWith("/recordatorios")) return "cobranza";
    if (href.startsWith("/cumplimiento")) return "cumplimiento";
    if (href.startsWith("/pendientes")) return "cumplimiento";
    if (href.startsWith("/encargos")) return "encargos";
    if (href.startsWith("/accesos") || href.startsWith("/efirmas")) return "efirmas";
    if (href.startsWith("/configuracion")) return "configuracion";
    return "perfil";
  };

  const irA = useCallback(
    (href: string) => {
      router.push(href);
      onCerrar();
    },
    [router, onCerrar]
  );

  const todosLosAtajos = useMemo<Atajo[]>(() => {
    const q = quitarAcentos(consulta.trim());

    const clientesFiltrados = listaClientes
      .filter((c) => c.activo)
      .filter((c) => {
        if (!q) return false;
        return (
          quitarAcentos(c.razonSocial).includes(q) ||
          quitarAcentos(c.rfc).includes(q)
        );
      })
      .slice(0, 8);

    const clientesAtajos: Atajo[] = clientesFiltrados.map((c: Cliente) => ({
      id: `cli-${c.id}`,
      titulo: c.razonSocial,
      subtitulo: c.rfc,
      icon: <UserIcon />,
      iconClase: POZO_ICONO,
      onSelect: () => irA(`/clientes#cliente=${c.id}`),
      grupo: "clientes",
    }));

    const navAtajos: Atajo[] = RUTAS_NAV.filter((r) => tienePermiso(moduloDeRuta(r.href)))
      .filter((r) => {
        if (!q) return true;
        return (
          quitarAcentos(r.label).includes(q) ||
          quitarAcentos(r.desc).includes(q)
        );
      })
      .map((r) => ({
        id: `nav-${r.href}`,
        titulo: r.label,
        subtitulo: r.desc,
        icon: r.icon,
        iconClase: POZO_ICONO,
        onSelect: () => irA(r.href),
        grupo: "navegacion",
      }));

    const accionAtajos: Atajo[] = ATAJOS_RAPIDOS.filter((a) =>
      tienePermiso(moduloDeRuta(a.href))
    )
      .filter((a) => {
        if (!q) return true;
        return (
          quitarAcentos(a.label).includes(q) ||
          quitarAcentos(a.desc).includes(q)
        );
      })
      .map((a) => ({
        id: `acc-${a.href}`,
        titulo: a.label,
        subtitulo: a.desc,
        icon: a.icon,
        iconClase: a.iconClase,
        destacado: a.destacado,
        onSelect: () => irA(a.href),
        grupo: "acciones",
      }));

    return [...clientesAtajos, ...accionAtajos, ...navAtajos];
  }, [consulta, listaClientes, tienePermiso, irA]);

  useEffect(() => {
    setIndiceActivo(0);
  }, [consulta]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCerrar();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndiceActivo((i) =>
          Math.min(i + 1, Math.max(todosLosAtajos.length - 1, 0))
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndiceActivo((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const seleccion = todosLosAtajos[indiceActivo];
        if (seleccion) seleccion.onSelect();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, indiceActivo, todosLosAtajos, onCerrar]);

  useEffect(() => {
    const el = listaRef.current?.querySelector(
      `[data-indice="${indiceActivo}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [indiceActivo]);

  if (!abierto) return null;

  const grupos: { titulo: string; atajos: Atajo[] }[] = [
    {
      titulo: "Clientes",
      atajos: todosLosAtajos.filter((a) => a.grupo === "clientes"),
    },
    {
      titulo: "Atajos rápidos",
      atajos: todosLosAtajos.filter((a) => a.grupo === "acciones"),
    },
    {
      titulo: "Ir a…",
      atajos: todosLosAtajos.filter((a) => a.grupo === "navegacion"),
    },
  ].filter((g) => g.atajos.length > 0);

  let indiceGlobal = -1;

  return (
    <div className="rdc-spotlight-backdrop fixed inset-0 z-[150] flex items-start justify-center p-3 pt-[8vh] sm:pt-[15vh]">
      <div
        className="absolute inset-0 bg-marca-navy/25 backdrop-blur-2xl backdrop-saturate-150"
        onClick={onCerrar}
      />
      <div className="rdc-spotlight-panel relative w-full max-w-[560px] rounded-3xl bg-white/95 backdrop-blur-xl shadow-[0_30px_80px_-15px_rgba(15,29,46,0.45)] ring-1 ring-white/40 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <span className="text-marca-navy/50">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar cliente, página o acción…"
            className="flex-1 bg-transparent outline-none text-base font-bold text-marca-navy placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-md bg-marca-navy/8 text-[9px] font-black uppercase tracking-widest text-marca-navy">
            Esc
          </kbd>
        </div>

        <div
          ref={listaRef}
          data-rdc-scroll-allow
          className="max-h-[55vh] overflow-y-auto p-2"
        >
          {grupos.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                {consulta
                  ? `Sin resultados para "${consulta}"`
                  : "Empieza a escribir…"}
              </p>
            </div>
          ) : (
            grupos.map((g) => (
              <div key={g.titulo} className="mb-1 last:mb-0">
                <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {g.titulo}
                </p>
                {g.atajos.map((a) => {
                  indiceGlobal += 1;
                  const idx = indiceGlobal;
                  const activo = idx === indiceActivo;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      data-indice={idx}
                      onMouseEnter={() => setIndiceActivo(idx)}
                      onClick={() => a.onSelect()}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-colors ${
                        activo
                          ? "bg-marca-navy/[0.06] ring-1 ring-marca-navy/15"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                          a.iconClase ?? POZO_ICONO
                        }`}
                      >
                        {a.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[13px] font-semibold truncate ${
                            activo ? "text-marca-navy" : "text-slate-800"
                          }`}
                        >
                          {a.titulo}
                        </p>
                        {a.subtitulo && (
                          <p className="text-[11px] font-medium text-slate-500 truncate">
                            {a.subtitulo}
                          </p>
                        )}
                      </div>
                      {a.destacado ? (
                        <span
                          className={`shrink-0 ${
                            activo ? "text-amber-500" : "text-amber-400"
                          }`}
                          aria-hidden
                        >
                          <BoltIcon />
                        </span>
                      ) : (
                        <span
                          className={`shrink-0 ${
                            activo ? "text-marca-navy/60" : "text-slate-300"
                          }`}
                          aria-hidden
                        >
                          <ArrowIcon />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="hidden sm:flex items-center justify-between px-5 py-2.5 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white ring-1 ring-slate-200 text-slate-600 font-bold">↑↓</kbd>
              Navegar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white ring-1 ring-slate-200 text-slate-600 font-bold">↵</kbd>
              Abrir
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-marca-navy">
            RDC
          </span>
        </div>
      </div>
    </div>
  );
}
