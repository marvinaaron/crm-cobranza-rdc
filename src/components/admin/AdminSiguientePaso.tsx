"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import type { AccionDespacho } from "@/lib/admin/siguiente-paso-despacho";

type Props = {
  acciones: AccionDespacho[];
};

function FilaAccion({
  accion,
  indice,
  total,
}: {
  accion: AccionDespacho;
  indice: number;
  total: number;
}) {
  const urg = accion.urgente;
  const eyebrow =
    total > 1
      ? `Pendiente ${indice + 1} de ${total} · ${accion.etiqueta}`
      : accion.etiqueta;

  return (
    <div
      className={`rounded-2xl border px-4 py-4 sm:px-5 ${
        urg
          ? "border-rose-200 bg-rose-50/90 dark:border-rose-500/30 dark:bg-rose-500/10"
          : "border-amber-200 bg-amber-50/80 dark:border-amber-500/25 dark:bg-amber-500/10"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] font-black uppercase tracking-widest ${
              urg ? "text-rose-600 dark:text-rose-400" : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {eyebrow}
          </p>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mt-0.5">
            {accion.titulo}
          </h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {accion.detalle}
          </p>
        </div>
        <Link
          href={accion.href}
          className={`shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
            urg
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          }`}
        >
          {accion.cta}
        </Link>
      </div>
    </div>
  );
}

export default function AdminSiguientePaso({ acciones }: Props) {
  const [indice, setIndice] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const total = acciones.length;
  const actual = acciones[indice];

  const ir = useCallback(
    (dir: -1 | 1) => {
      if (total <= 1) return;
      setIndice((i) => (i + dir + total) % total);
    },
    [total]
  );

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") ir(-1);
      if (e.key === "ArrowRight") ir(1);
    },
    [ir]
  );

  const resumen = useMemo(() => {
    const urgentes = acciones.filter((a) => a.urgente).length;
    if (urgentes > 0) {
      return `${urgentes} urgente${urgentes === 1 ? "" : "s"} · ${total} en cola`;
    }
    return `${total} pendiente${total === 1 ? "" : "s"} operativo${total === 1 ? "" : "s"}`;
  }, [acciones, total]);

  if (total === 0) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 dark:border-emerald-500/25 dark:bg-emerald-500/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Siguiente paso del despacho
        </p>
        <p className="text-base font-black text-slate-800 dark:text-white mt-1">
          Sin pendientes operativos destacados
        </p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          Cobranza, cumplimiento y encargos al día según el periodo vigente.
        </p>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      tabIndex={0}
      onKeyDown={onKey}
      className="space-y-3 outline-none"
      aria-label="Siguiente paso del despacho"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
            Siguiente paso del despacho
          </p>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            {resumen}
          </p>
        </div>
        {total > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => ir(-1)}
              aria-label="Pendiente anterior"
              className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              ‹
            </button>
            <span className="text-[10px] font-black tabular-nums text-slate-400">
              {indice + 1}/{total}
            </span>
            <button
              type="button"
              onClick={() => ir(1)}
              aria-label="Siguiente pendiente"
              className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {actual && <FilaAccion accion={actual} indice={indice} total={total} />}

      {total > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {acciones.map((a, i) => (
            <button
              key={a.clave}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ir a: ${a.titulo}`}
              className={`h-1.5 rounded-full transition-all ${
                i === indice
                  ? "w-6 bg-violet-600"
                  : "w-1.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
