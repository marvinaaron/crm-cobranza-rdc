"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import type { AccionDespacho } from "@/lib/admin/siguiente-paso-despacho";

type Props = {
  acciones: AccionDespacho[];
  vivos?: number;
  onOcultar?: (clave: string) => void;
  onMostrarOcultos?: () => void;
};

function FilaAccion({
  accion,
  indice,
  total,
  onOcultar,
}: {
  accion: AccionDespacho;
  indice: number;
  total: number;
  onOcultar?: (clave: string) => void;
}) {
  const urg = accion.urgente;
  const eyebrow =
    total > 1
      ? `${indice + 1} de ${total} · ${accion.etiqueta}`
      : accion.etiqueta;

  return (
    <div
      className={`rounded-[1.25rem] px-4 py-4 sm:px-5 ${
        urg
          ? "bg-rose-50 ring-1 ring-rose-100"
          : "bg-white ring-1 ring-black/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-[11px] font-semibold ${
            urg ? "text-rose-600" : "text-slate-500"
          }`}
        >
          {eyebrow}
        </p>
        {onOcultar && (
          <button
            type="button"
            onClick={() => onOcultar(accion.clave)}
            className="text-[13px] font-semibold text-slate-400 hover:text-slate-700"
            title="Ocultar. Si ya resolviste el vencimiento, desaparece solo."
          >
            Ocultar
          </button>
        )}
      </div>
      <h2 className="text-[17px] font-bold text-slate-900 leading-snug mt-0.5">
        {accion.titulo}
      </h2>
      <p className="text-[15px] text-slate-500 mt-1 leading-relaxed">
        {accion.detalle}
      </p>
      <Link
        href={accion.href}
        className={`mt-3 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-[15px] font-semibold ${
          urg
            ? "bg-rose-600 text-white hover:bg-rose-700"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {accion.cta}
      </Link>
    </div>
  );
}

export default function AdminSiguientePaso({
  acciones,
  vivos = 0,
  onOcultar,
  onMostrarOcultos,
}: Props) {
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
    if (vivos > 0 && onMostrarOcultos) {
      return (
        <section className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] px-4 py-3.5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-slate-500">Siguiente paso</p>
            <p className="text-[15px] text-slate-500 mt-0.5">
              Ocultaste {vivos} pendiente{vivos === 1 ? "" : "s"}.
            </p>
          </div>
          <button
            type="button"
            onClick={onMostrarOcultos}
            className="text-[13px] font-semibold text-slate-700 shrink-0"
          >
            Mostrar
          </button>
        </section>
      );
    }
    return (
      <section className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] px-4 py-3.5">
        <p className="text-[13px] font-semibold text-emerald-700">Siguiente paso</p>
        <p className="text-[15px] text-slate-500 mt-0.5">Al día. No hay nada pendiente de tocar.</p>
      </section>
    );
  }

  if (acciones.length === 1) {
    return (
      <section className="space-y-2" aria-label="Siguiente paso">
        <p className="px-1 text-[13px] font-semibold text-slate-500">Siguiente paso</p>
        <FilaAccion
          accion={acciones[0]}
          indice={0}
          total={1}
          onOcultar={onOcultar}
        />
      </section>
    );
  }

  return (
    <section className="space-y-2.5" aria-label="Siguiente paso del despacho">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <p className="text-[13px] font-semibold text-slate-500">Siguiente paso</p>
          {resumen && (
            <p className="text-[15px] text-slate-400 mt-0.5">{resumen}</p>
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
            <FilaAccion
              accion={accion}
              indice={i}
              total={acciones.length}
              onOcultar={onOcultar}
            />
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
