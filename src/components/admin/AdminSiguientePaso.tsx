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
  const carruselRef = useRef<HTMLDivElement>(null);
  const [indiceActivo, setIndiceActivo] = useState(0);

  const resumen = useMemo(() => {
    const urgentes = acciones.filter((a) => a.urgente).length;
    if (acciones.length === 0) return null;
    if (urgentes > 0) {
      return `${urgentes} urgente${urgentes === 1 ? "" : "s"} · ${acciones.length} en cola`;
    }
    return `${acciones.length} pendiente${acciones.length === 1 ? "" : "s"} operativo${acciones.length === 1 ? "" : "s"}`;
  }, [acciones]);

  const sincronizarIndice = useCallback(() => {
    const el = carruselRef.current;
    if (!el || el.clientWidth <= 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndiceActivo(Math.min(Math.max(i, 0), acciones.length - 1));
  }, [acciones.length]);

  const irASlide = (i: number) => {
    const el = carruselRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndiceActivo(i);
  };

  if (acciones.length === 0) {
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

  if (acciones.length === 1) {
    return (
      <section className="space-y-2" aria-label="Siguiente paso del despacho">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
            Siguiente paso del despacho
          </p>
          {resumen && (
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              {resumen}
            </p>
          )}
        </div>
        <FilaAccion accion={acciones[0]} indice={0} total={1} />
      </section>
    );
  }

  return (
    <section className="space-y-2.5" aria-label="Siguiente paso del despacho">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
            Siguiente paso del despacho
          </p>
          {resumen && (
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              {resumen}
            </p>
          )}
        </div>
        <p className="text-[10px] font-bold text-slate-400 shrink-0">
          Desliza ← →
        </p>
      </div>

      <div
        ref={carruselRef}
        onScroll={sincronizarIndice}
        className="flex items-start overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
      >
        {acciones.map((accion, i) => (
          <div
            key={accion.clave}
            className="w-full shrink-0 snap-center self-start"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${acciones.length}`}
          >
            <FilaAccion accion={accion} indice={i} total={acciones.length} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pt-0.5">
        {acciones.map((accion, i) => (
          <button
            key={accion.clave}
            type="button"
            onClick={() => irASlide(i)}
            aria-label={`Ver pendiente: ${accion.titulo}`}
            aria-current={i === indiceActivo ? "true" : undefined}
            className={`h-2 rounded-full transition-all ${
              i === indiceActivo
                ? `w-6 ${accion.urgente ? "bg-rose-500" : "bg-violet-600"}`
                : "w-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
