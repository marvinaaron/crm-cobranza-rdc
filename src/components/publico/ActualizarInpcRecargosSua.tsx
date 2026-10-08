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
  formatoMesAnioSua,
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
  "h-9 w-full min-w-[9.5rem] rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const CLASE_DATO =
  "h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-bold tabular-nums text-slate-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

type Origen =
  | "herramienta"
  | "inpc"
  | "blog-sua"
  | "blog-inpc";

type FilaSua = {
  mes: number;
  anio: number;
  recargos: number;
  inpc: number;
};

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
      className="w-[5.75rem] shrink-0 text-right text-sm font-semibold text-[#8E2458]"
    >
      {children}
    </label>
  );
}

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
  const filaRef = useRef<HTMLTableRowElement | null>(null);
  const tablaScrollRef = useRef<HTMLDivElement | null>(null);
  const periodoFijado = useRef(false);
  const primerAcomodo = useRef(true);

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

  const filas = useMemo<FilaSua[]>(
    () =>
      [...serie]
        .reverse()
        .map((r) => ({
          mes: r.mes,
          anio: r.anio,
          recargos: recargosDelAnio(r.anio).mora,
          inpc: r.valor,
        })),
    [serie]
  );

  const registro = buscarRegistroInpc(serie, anio, mes);
  const recargos = recargosDelAnio(anio).mora;
  const recargosTxt = recargos.toFixed(2);
  const inpcTxt = registro ? formatearInpcSua(registro.valor) : "";

  useEffect(() => {
    if (primerAcomodo.current) {
      primerAcomodo.current = false;
      return;
    }
    const fila = filaRef.current;
    const caja = tablaScrollRef.current;
    if (!fila || !caja) return;
    caja.scrollTop = Math.max(0, fila.offsetTop - 40);
  }, [mes, anio]);

  const elegir = (m: number, a: number) => {
    periodoFijado.current = true;
    setMes(m);
    setAnio(a);
  };

  return (
    <section
      aria-labelledby="sua-inpc-titulo"
      className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm"
    >
      <div className="px-4 pt-5 pb-4 sm:px-6">
        <p
          id="sua-inpc-titulo"
          className="text-center text-base font-bold tracking-tight text-[#8E2458] sm:text-lg"
        >
          Actualizar INPC y Recargos
        </p>
        <p className="mt-1 text-center text-[11px] text-slate-500">
          Elige mes y año. Copia los dos números al{" "}
          <PalabraSua className="font-black" />{" "}
          <span className="whitespace-nowrap">
            (Utilerías → Actualizar INPC y Recargos)
          </span>
          .
        </p>

        <div className="mx-auto mt-5 grid max-w-lg gap-3 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-3">
          <div className="flex items-center gap-3">
            <Etiqueta htmlFor={`sua-mes-${origen}`}>Mes:</Etiqueta>
            <select
              id={`sua-mes-${origen}`}
              className={CLASE_SELECT}
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
          <div className="flex items-center gap-3">
            <Etiqueta htmlFor={`sua-anio-${origen}`}>Año:</Etiqueta>
            <select
              id={`sua-anio-${origen}`}
              className={CLASE_SELECT}
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
          <div className="flex items-center gap-3">
            <Etiqueta htmlFor={`sua-recargos-${origen}`}>Recargos:</Etiqueta>
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <input
                id={`sua-recargos-${origen}`}
                readOnly
                value={recargosTxt}
                onFocus={(e) => e.target.select()}
                className={CLASE_DATO}
              />
              <BotonCopiar valor={recargosTxt} etiqueta="recargos" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Etiqueta htmlFor={`sua-inpc-${origen}`}>INPC:</Etiqueta>
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
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
              ) : null}
            </div>
          </div>
        </div>

        {!registro ? (
          <p className="mt-3 text-center text-xs text-amber-700">
            INEGI aún no publica el cierre de {NOMBRES_MES_INPC[mes - 1]?.toLowerCase()}{" "}
            {anio}. La tasa de recargos ({recargosTxt}) sí está lista para pegar.
          </p>
        ) : null}
      </div>

      <p className="px-4 text-center text-sm font-semibold text-[#8E2458] sm:text-[15px]">
        Detalle de Recargos e INPC
      </p>

      <div className="mx-4 mb-4 mt-2 overflow-hidden rounded-xl ring-1 ring-slate-200 sm:mx-6">
        <div ref={tablaScrollRef} className="max-h-[22rem] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-bold">
                  Mes / Año
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-bold">
                  Tasa de Recargos
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-bold">
                  INPC
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => {
                const activa = f.mes === mes && f.anio === anio;
                return (
                  <tr
                    key={`${f.anio}-${f.mes}`}
                    ref={activa ? filaRef : undefined}
                    tabIndex={0}
                    onClick={() => elegir(f.mes, f.anio)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        elegir(f.mes, f.anio);
                      }
                    }}
                    className={`cursor-pointer border-t border-slate-100 tabular-nums transition-colors ${
                      activa
                        ? "bg-indigo-50 text-slate-900"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <td
                      className={`px-3 py-1.5 ${
                        activa ? "font-bold" : "font-medium text-slate-700"
                      }`}
                    >
                      {formatoMesAnioSua(f.mes, f.anio)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-slate-800">
                      {f.recargos.toFixed(2)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-slate-800">
                      {formatearInpcSua(f.inpc)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="px-4 pb-2 text-center text-[11px] leading-relaxed text-slate-500 sm:px-6">
        Recargos = mora del año, sin el signo %. INPC = cierre mensual INEGI,
        tres decimales. En 2026 la mora es 2.07 todos los meses.
      </p>

      <nav
        aria-label="Relacionado"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-slate-100 px-4 py-3 text-[11px] font-semibold sm:px-6"
      >
        {origen !== "herramienta" ? (
          <Link
            href={HREF_SUA_INPC}
            className="text-indigo-700 hover:underline"
          >
            Herramienta SUA
          </Link>
        ) : null}
        {origen !== "blog-sua" ? (
          <Link
            href={HREF_BLOG_SUA}
            className="text-indigo-700 hover:underline"
          >
            Guía del SUA
          </Link>
        ) : null}
        {origen !== "inpc" ? (
          <Link href={HREF_INPC} className="text-indigo-700 hover:underline">
            Tabla INPC
          </Link>
        ) : null}
        {origen !== "blog-inpc" ? (
          <Link
            href={HREF_BLOG_INPC}
            className="text-indigo-700 hover:underline"
          >
            Blog INPC
          </Link>
        ) : null}
        <Link href={HREF_RECARGOS} className="text-indigo-700 hover:underline">
          Tasas de recargos
        </Link>
      </nav>
    </section>
  );
}
