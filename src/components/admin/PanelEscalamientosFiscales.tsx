"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type LineaEscalamientoFiscal,
  ETIQUETAS_ESCALON,
  contarEscalamientosPendientesHoy,
} from "@/lib/admin/escalamientos-fiscales";
import { periodoLabel } from "@/lib/clientes";

type Props = {
  lineas: LineaEscalamientoFiscal[];
  compact?: boolean;
  /** Sin encabezado propio (lo provee el dashboard colapsable). */
  embebido?: boolean;
  titulo?: string;
  verTodosHref?: string;
};

type Filtro = "todos" | "pendiente_hoy" | "enviado" | "admin";

function formatEnviado(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BadgeEstado({ linea }: { linea: LineaEscalamientoFiscal }) {
  if (linea.estado === "pendiente_hoy") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
        Hoy
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
      Enviado
    </span>
  );
}

function FilaLinea({ linea }: { linea: LineaEscalamientoFiscal }) {
  const escTxt = linea.escalon ? ETIQUETAS_ESCALON[linea.escalon] : null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3 border-b border-slate-100 dark:border-white/10 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <BadgeEstado linea={linea} />
          {linea.destinatario === "admin" && (
            <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Despacho
            </span>
          )}
          {escTxt && (
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              {escTxt}
            </span>
          )}
          <span className="text-[9px] font-bold text-slate-400">
            {periodoLabel(linea.periodo)}
          </span>
        </div>
        <p className="text-sm font-black text-slate-800 dark:text-white truncate">
          {linea.titulo}
        </p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          {linea.detalle}
          {linea.enviadoEn && (
            <span className="text-slate-400"> · {formatEnviado(linea.enviadoEn)}</span>
          )}
        </p>
      </div>
      <Link
        href={linea.href}
        className="shrink-0 text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 dark:text-violet-400"
      >
        Abrir →
      </Link>
    </div>
  );
}

export default function PanelEscalamientosFiscales({
  lineas,
  compact = false,
  embebido = false,
  titulo = "Alertas fiscales automáticas",
  verTodosHref,
}: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const conteos = useMemo(() => contarEscalamientosPendientesHoy(lineas), [lineas]);

  const visibles = useMemo(() => {
    let out = lineas;
    if (filtro === "pendiente_hoy") out = out.filter((l) => l.estado === "pendiente_hoy");
    if (filtro === "enviado") out = out.filter((l) => l.estado === "enviado");
    if (filtro === "admin") out = out.filter((l) => l.destinatario === "admin");
    return compact ? out.slice(0, 5) : out;
  }, [lineas, filtro, compact]);

  const filtros: Array<{ key: Filtro; label: string; count?: number }> = [
    { key: "todos", label: "Todos", count: lineas.length },
    { key: "pendiente_hoy", label: "Hoy", count: conteos.total },
    { key: "admin", label: "Despacho", count: conteos.admin },
    { key: "enviado", label: "Enviados" },
  ];

  return (
    <section
      className={
        embebido
          ? "rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/50 overflow-hidden"
          : "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/50 overflow-hidden"
      }
    >
      {!embebido && (
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
                SAT e impuestos · automático
              </p>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {titulo}
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                El sistema avisa solo al cliente cuando se acerca o pasa un plazo fiscal. En
                casos graves también te avisa a ti. Distinto del cobro manual.
              </p>
            </div>
            {verTodosHref && compact && (
              <Link
                href={verTodosHref}
                className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 dark:text-violet-400"
              >
                Ver todos →
              </Link>
            )}
          </div>

          {!compact && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filtros.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFiltro(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                    filtro === f.key
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/40"
                      : "border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {f.label}
                  {f.count != null && f.count > 0 ? ` · ${f.count}` : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {embebido && (
        <div className="px-4 sm:px-5 pt-4 pb-2 border-b border-slate-100 dark:border-white/10">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Avisos automáticos al cliente (y a ti en casos graves). Distinto del cobro manual.
          </p>
          {!compact && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filtros.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFiltro(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                    filtro === f.key
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/40"
                      : "border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {f.label}
                  {f.count != null && f.count > 0 ? ` · ${f.count}` : ""}
                </button>
              ))}
            </div>
          )}
          {verTodosHref && (
            <Link
              href={verTodosHref}
              className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 dark:text-violet-400"
            >
              Abrir vista completa →
            </Link>
          )}
        </div>
      )}

      <div className="px-4 sm:px-5">
        {visibles.length === 0 ? (
          <p className="py-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            {filtro === "pendiente_hoy"
              ? "Nada programado para hoy — no hay plazos fiscales que avisar."
              : "Sin registros en este filtro."}
          </p>
        ) : (
          visibles.map((l) => <FilaLinea key={l.clave} linea={l} />)
        )}
      </div>

      {compact && lineas.length > 5 && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <p className="text-[10px] font-bold text-slate-500">
            +{lineas.length - 5} más en el historial reciente
          </p>
        </div>
      )}
    </section>
  );
}
