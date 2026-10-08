"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BotonCopiar from "@/components/publico/BotonCopiar";
import PalabraSua from "@/components/publico/PalabraSua";
import {
  INPC_FALLBACK,
  NOMBRES_MES_INPC,
  buscarRegistroInpc,
  formatearInpcSua,
  ultimoRegistroInpc,
  type RegistroInpc,
} from "@/lib/fiscal/inpc";
import { recargosDelAnio } from "@/lib/fiscal/recargos";

export const HREF_SUA_INPC =
  "/herramientas/actualizar-inpc-recargos-sua";
const HREF_INPC = "/herramientas/inpc";
const HREF_RECARGOS = "/herramientas/recargos-federales";
const HREF_BLOG_SUA = "/blog/sua-imss-como-actualizar-inpc-y-recargos";
const HREF_BLOG_INPC = "/blog/inpc-2026-tabla-mensual-sua";

const CLASE_SELECT =
  "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const CLASE_DATO =
  "h-9 w-[7.5rem] rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-bold tabular-nums text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

type Origen =
  | "herramienta"
  | "inpc"
  | "blog-sua"
  | "blog-inpc";

function Etiqueta({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="w-[5.25rem] shrink-0 text-right text-sm font-semibold text-slate-600"
    >
      {children}
    </label>
  );
}

function IconoGuia() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconoTabla() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  );
}

function IconoBlog() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h5" />
    </svg>
  );
}

function IconoRecargos() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="13" r="8" />
      <polyline points="12 9 12 13 14 15" />
    </svg>
  );
}

function IconoSuaMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="13" y2="12" />
      <line x1="7" y1="16" x2="11" y2="16" />
    </svg>
  );
}

const LIGAS = [
  {
    id: "herramienta" as const,
    hideOn: "herramienta" as Origen,
    href: HREF_SUA_INPC,
    eyebrow: "Utilerías",
    titulo: "SUA - Actualiza",
    hint: "Mes y año · mora e INPC",
    acento: "from-indigo-500 via-violet-500 to-fuchsia-500",
    iconBg: "bg-violet-100 text-violet-700",
    icon: <IconoSuaMini />,
  },
  {
    id: "blog-sua" as const,
    hideOn: "blog-sua" as Origen,
    href: HREF_BLOG_SUA,
    eyebrow: "Guía",
    titulo: "Guía del SUA",
    hint: "Dónde pegar INPC y recargos",
    acento: "from-cyan-400 via-sky-500 to-blue-600",
    iconBg: "bg-sky-100 text-sky-700",
    icon: <IconoGuia />,
  },
  {
    id: "inpc" as const,
    hideOn: "inpc" as Origen,
    href: HREF_INPC,
    eyebrow: "INEGI",
    titulo: "Tabla INPC",
    hint: "Histórico e inflación",
    acento: "from-emerald-400 via-teal-500 to-cyan-600",
    iconBg: "bg-emerald-100 text-emerald-700",
    icon: <IconoTabla />,
  },
  {
    id: "blog-inpc" as const,
    hideOn: "blog-inpc" as Origen,
    href: HREF_BLOG_INPC,
    eyebrow: "Artículo",
    titulo: "Blog INPC",
    hint: "Cómo pegarlo en el SUA",
    acento: "from-amber-400 via-orange-400 to-rose-400",
    iconBg: "bg-amber-100 text-amber-700",
    icon: <IconoBlog />,
  },
  {
    id: "recargos" as const,
    hideOn: null,
    href: HREF_RECARGOS,
    eyebrow: "LIF",
    titulo: "Tasas de recargos",
    hint: "Mora 2.07 · prórroga 1.38",
    acento: "from-rose-400 via-orange-400 to-amber-400",
    iconBg: "bg-rose-100 text-rose-700",
    icon: <IconoRecargos />,
  },
];

export default function ActualizarInpcRecargosSua({
  serieInicial,
  origen = "herramienta",
}: {
  serieInicial?: RegistroInpc[];
  origen?: Origen;
}) {
  const [serie, setSerie] = useState<RegistroInpc[]>(
    serieInicial?.length ? serieInicial : INPC_FALLBACK
  );
  const [mes, setMes] = useState(
    () => ultimoRegistroInpc(serieInicial?.length ? serieInicial : INPC_FALLBACK).mes
  );
  const [anio, setAnio] = useState(
    () => ultimoRegistroInpc(serieInicial?.length ? serieInicial : INPC_FALLBACK).anio
  );
  const periodoFijado = useRef(false);

  useEffect(() => {
    if (serieInicial?.length) {
      setSerie(serieInicial);
      return;
    }
    let activo = true;
    fetch("/api/fiscal/inpc")
      .then((r) => r.json())
      .then((data: { serie?: RegistroInpc[] }) => {
        if (!activo || !data?.serie?.length) return;
        setSerie(data.serie);
        if (periodoFijado.current) return;
        const u = ultimoRegistroInpc(data.serie);
        setMes(u.mes);
        setAnio(u.anio);
        periodoFijado.current = true;
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [serieInicial]);

  const anios = useMemo(() => {
    const set = new Set<number>();
    for (const r of serie) set.add(r.anio);
    set.add(anio);
    return Array.from(set).sort((a, b) => b - a);
  }, [serie, anio]);

  const registro = buscarRegistroInpc(serie, anio, mes);
  const recargos = recargosDelAnio(anio).mora;
  const recargosTxt = recargos.toFixed(2);
  const inpcTxt = registro ? formatearInpcSua(registro.valor) : "";

  const elegir = (m: number, a: number) => {
    periodoFijado.current = true;
    setMes(m);
    setAnio(a);
  };

  const ligas = LIGAS.filter((l) => l.hideOn !== origen);

  return (
    <section
      aria-labelledby="sua-inpc-titulo"
      className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm"
    >
      <div className="px-4 pt-5 pb-5 sm:px-6">
        <p
          id="sua-inpc-titulo"
          className="text-center text-base font-black tracking-tight text-slate-900 sm:text-lg"
        >
          Actualizar INPC y Recargos
        </p>
        <p className="mt-1 text-center text-[11px] text-slate-500">
          Elige mes y año. Copia los dos números al{" "}
          <PalabraSua />{" "}
          <span className="whitespace-nowrap">
            (Utilerías → Actualizar INPC y Recargos)
          </span>
          .
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex flex-nowrap items-center justify-center gap-5 sm:gap-10">
            <div className="flex items-center gap-2">
              <Etiqueta htmlFor={`sua-mes-${origen}`}>Mes:</Etiqueta>
              <select
                id={`sua-mes-${origen}`}
                className={`${CLASE_SELECT} w-[9.25rem]`}
                value={mes}
                onChange={(e) => elegir(Number(e.target.value), anio)}
              >
                {NOMBRES_MES_INPC.map((nombre, i) => (
                  <option key={nombre} value={i + 1}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Etiqueta htmlFor={`sua-anio-${origen}`}>Año:</Etiqueta>
              <select
                id={`sua-anio-${origen}`}
                className={`${CLASE_SELECT} w-[6.25rem]`}
                value={anio}
                onChange={(e) => elegir(mes, Number(e.target.value))}
              >
                {anios.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Etiqueta htmlFor={`sua-recargos-${origen}`}>Recargos:</Etiqueta>
            <input
              id={`sua-recargos-${origen}`}
              readOnly
              value={recargosTxt}
              onFocus={(e) => e.target.select()}
              className={CLASE_DATO}
            />
            <BotonCopiar valor={recargosTxt} etiqueta="recargos" />
          </div>

          <div className="flex items-center gap-2">
            <Etiqueta htmlFor={`sua-inpc-${origen}`}>INPC:</Etiqueta>
            <input
              id={`sua-inpc-${origen}`}
              readOnly
              value={inpcTxt}
              placeholder="—"
              onFocus={(e) => e.target.select()}
              className={CLASE_DATO}
            />
            {inpcTxt ? (
              <BotonCopiar valor={inpcTxt} etiqueta="INPC" />
            ) : (
              <span className="inline-block h-6 w-6" aria-hidden />
            )}
          </div>
        </div>

        {!registro ? (
          <p className="mt-3 text-center text-xs text-amber-700">
            INEGI aún no publica el cierre de {NOMBRES_MES_INPC[mes - 1]?.toLowerCase()}{" "}
            {anio}. La tasa de recargos ({recargosTxt}) sí está lista para pegar.
          </p>
        ) : (
          <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
            Recargos = mora del año, sin el signo %. INPC = cierre mensual
            INEGI, tres decimales.
          </p>
        )}
      </div>

      <nav
        aria-label="Relacionado"
        className={`grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/60 p-3 sm:gap-2.5 sm:p-4 ${
          origen === "inpc" ? "" : "sm:grid-cols-4"
        }`}
      >
        {ligas.map((a) => (
          <Link
            key={a.id}
            href={a.href}
            className="group relative overflow-hidden rounded-xl bg-white ring-1 ring-violet-100 shadow-sm shadow-violet-100/40 px-3 py-2.5 hover:ring-violet-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <span
              aria-hidden
              className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${a.acento}`}
            />
            <div className="flex items-start gap-2">
              <span
                className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${a.iconBg}`}
              >
                {a.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  {a.eyebrow}
                </p>
                <p className="text-[13px] font-bold text-slate-900 leading-snug">
                  {a.titulo}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500 leading-snug line-clamp-1">
                  {a.hint}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </nav>
    </section>
  );
}
