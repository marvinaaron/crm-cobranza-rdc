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

type Atajo = {
  id: string;
  titulo: string;
  subtitulo?: string;
  badge?: string;
  icon: ReactNode;
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
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const RUTAS_NAV = [
  { label: "Dashboard", href: "/dashboard", desc: "KPIs y resumen del despacho" },
  { label: "Mis Clientes", href: "/clientes", desc: "Catálogo de clientes" },
  { label: "Cobranza", href: "/cobranza", desc: "Cobros, comprobantes, facturas" },
  { label: "Presupuestos", href: "/presupuestos", desc: "Cotizaciones y prospectos" },
  { label: "Recordatorios", href: "/recordatorios", desc: "Correos de cobro y scripts" },
  { label: "Cumplimiento", href: "/cumplimiento", desc: "Impuestos, REPSE, IMSS" },
  { label: "E.firmas", href: "/efirmas", desc: "Vigencia de FIEL" },
  { label: "Configuración", href: "/configuracion", desc: "Respaldos y equipo" },
  { label: "Comentarios del blog", href: "/blog-comentarios", desc: "Preguntas y respuestas del blog" },
  { label: "Mi perfil", href: "/perfil", desc: "Tus datos y avatar" },
];

const ATAJOS_RAPIDOS = [
  { label: "Comprobantes nuevos", href: "/cobranza?filtro=comprobantes", desc: "Validar pagos del portal" },
  { label: "Clientes atrasados", href: "/cobranza?filtro=clientes_atrasados", desc: "Cobranza vencida" },
  { label: "Sin iniciar (Cumplimiento)", href: "/cumplimiento?filtro=paso1", desc: "Pendientes de iniciar" },
  { label: "Listos para notificar", href: "/cumplimiento?filtro=paso4", desc: "Espera confirmación del cliente" },
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
    if (href.startsWith("/presupuestos")) return "cobranza";
    if (href.startsWith("/recordatorios")) return "cobranza";
    if (href.startsWith("/cumplimiento")) return "cumplimiento";
    if (href.startsWith("/efirmas")) return "efirmas";
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
        icon: <ArrowIcon />,
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
        icon: <BoltIcon />,
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
    <div className="fixed inset-0 z-[150] flex items-start justify-center p-3 pt-[8vh] sm:pt-[15vh]">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onCerrar}
      />
      <div className="relative w-full max-w-[560px] rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <span className="text-slate-400">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar cliente, página o acción…"
            className="flex-1 bg-transparent outline-none text-base font-bold text-slate-800 placeholder:text-slate-300"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500">
            Esc
          </kbd>
        </div>

        <div
          ref={listaRef}
          className="max-h-[55vh] overflow-y-auto py-2"
        >
          {grupos.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                {consulta
                  ? `Sin resultados para "${consulta}"`
                  : "Empieza a escribir…"}
              </p>
            </div>
          ) : (
            grupos.map((g) => (
              <div key={g.titulo} className="py-1">
                <p className="px-5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
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
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        activo
                          ? "bg-violet-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          activo
                            ? "bg-violet-100 text-violet-600"
                            : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        {a.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[13px] font-bold truncate ${
                            activo ? "text-violet-700" : "text-slate-700"
                          }`}
                        >
                          {a.titulo}
                        </p>
                        {a.subtitulo && (
                          <p className="text-[10px] font-mono text-slate-400 truncate uppercase tracking-widest">
                            {a.subtitulo}
                          </p>
                        )}
                      </div>
                      {activo && (
                        <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-md bg-violet-100 text-[9px] font-black uppercase tracking-widest text-violet-700 shrink-0">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="hidden sm:flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">↑↓</kbd>
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">↵</kbd>
              Abrir
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Cmd K · paleta de comandos
          </span>
        </div>
      </div>
    </div>
  );
}
