"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  type FilaRadarSat,
  resumirRadarSat,
} from "@/lib/admin/radar-sat-clientes";

type Filtro = "abiertos" | "urgentes" | "todos";

type Props = {
  filas: FilaRadarSat[];
};

function formatearSaldo(n: number): string {
  if (n <= 0) return "Al corriente";
  return `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;
}

function etiquetaDias(fila: FilaRadarSat): string {
  if (fila.banda === "cerrado") return "Cerrado";
  if (fila.diasAlSat < 0) return `${Math.abs(fila.diasAlSat)}d vencido`;
  if (fila.diasAlSat === 0) return "Hoy";
  return `${fila.diasAlSat}d`;
}

function FilaRadar({ fila }: { fila: FilaRadarSat }) {
  const urg = fila.urgente;
  const cerrada = fila.banda === "cerrado";

  return (
    <Link
      href={fila.href}
      className={`block rounded-2xl border px-4 py-3.5 sm:px-5 transition-colors ${
        urg
          ? "border-rose-200 bg-rose-50/90 hover:bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10"
          : cerrada
            ? "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
            : "border-amber-200 bg-amber-50/70 hover:bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${
                urg
                  ? "text-rose-600 dark:text-rose-400"
                  : cerrada
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400"
              }`}
            >
              Paso {fila.paso} · {fila.flujoLabel}
            </p>
            <span className="text-[10px] font-bold text-slate-400 tracking-wide">
              {fila.rfc}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mt-0.5">
            {fila.titulo}
          </h3>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {fila.detalle}
          </p>

          <div className="mt-2.5 max-w-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Ventana · {fila.fechaInicioCorta} → corte {fila.fechaSatCorta}
              </span>
              <span
                className={`text-[9px] font-black uppercase tabular-nums ${
                  urg ? "text-rose-600" : cerrada ? "text-emerald-600" : "text-amber-700"
                }`}
              >
                {etiquetaDias(fila)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white border border-slate-200/80 overflow-hidden dark:bg-white/10 dark:border-white/10">
              <div
                className={`h-full rounded-full ${
                  urg ? "bg-rose-500" : cerrada ? "bg-emerald-500" : "bg-indigo-600"
                }`}
                style={{ width: `${fila.progreso}%` }}
              />
            </div>
          </div>

          {fila.saldoHonorarios > 0 && (
            <p className="text-[11px] font-bold text-slate-500 mt-2">
              Honorarios: {formatearSaldo(fila.saldoHonorarios)}
              {fila.estadoCobranza === "ATRASADO" ? " · atrasado" : ""}
            </p>
          )}
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1 mt-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
            urg
              ? "bg-rose-600 text-white"
              : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          }`}
        >
          Abrir
          <ChevronRight className="w-3 h-3" strokeWidth={3} aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export default function AdminTableroSat({ filas }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("abiertos");
  const [cerradosAbiertos, setCerradosAbiertos] = useState(false);
  const resumen = useMemo(() => resumirRadarSat(filas), [filas]);

  const visibles = useMemo(() => {
    if (filtro === "urgentes") return filas.filter((f) => f.banda === "urgente");
    if (filtro === "todos") return filas;
    return filas.filter((f) => f.banda !== "cerrado");
  }, [filas, filtro]);

  const cerrados = useMemo(
    () => filas.filter((f) => f.banda === "cerrado"),
    [filas]
  );

  if (filas.length === 0) return null;

  const chips: { id: Filtro; label: string }[] = [
    { id: "abiertos", label: `Abiertos ${resumen.urgentes + resumen.ventana}` },
    { id: "urgentes", label: `Urgentes ${resumen.urgentes}` },
    { id: "todos", label: `Todos ${resumen.total}` },
  ];

  return (
    <section className="space-y-3" aria-label="Corte SAT de todos los clientes">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
            Corte SAT · todos los clientes
          </p>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            {resumen.urgentes} urgente{resumen.urgentes === 1 ? "" : "s"} ·{" "}
            {resumen.ventana} en ventana · {resumen.cerrados} cerrado
            {resumen.cerrados === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFiltro(c.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                filtro === c.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2.5">
        {visibles.length === 0 && (
          <li className="text-sm font-medium text-slate-500 px-1">
            Nadie en este filtro.
          </li>
        )}
        {visibles.map((fila) => (
          <li key={fila.clienteId}>
            <FilaRadar fila={fila} />
          </li>
        ))}
      </ul>

      {filtro === "abiertos" && cerrados.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setCerradosAbiertos((v) => !v)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700"
          >
            {cerradosAbiertos ? "Ocultar cerrados" : `Ver ${cerrados.length} cerrados`}
          </button>
          {cerradosAbiertos && (
            <ul className="space-y-2.5 mt-2.5">
              {cerrados.map((fila) => (
                <li key={fila.clienteId}>
                  <FilaRadar fila={fila} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
