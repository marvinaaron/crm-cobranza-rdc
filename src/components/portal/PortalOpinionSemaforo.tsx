"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { opinionUi } from "@/lib/sat/opinion-ui";
import type { OpinionPublicaEstado } from "@/lib/sat/types";

type OpinionPayload = {
  estado: OpinionPublicaEstado;
  mensaje?: string;
  ultimaConsulta?: string;
};

const TONO_CARD: Record<
  ReturnType<typeof opinionUi>["tono"],
  string
> = {
  ok: "bg-emerald-50 border-emerald-200",
  bad: "bg-red-50 border-red-200",
  warn: "bg-amber-50 border-amber-200",
  neutral: "bg-slate-50 border-slate-200",
};

/**
 * Tarjeta compacta en Inicio: semáforo de opinión 32-D con consulta automática al SAT.
 */
export default function PortalOpinionSemaforo() {
  const [cargando, setCargando] = useState(true);
  const [opinion, setOpinion] = useState<OpinionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (force = false) => {
    setCargando(true);
    setError(null);
    try {
      const url = force
        ? "/api/portal/opinion-cumplimiento?force=1"
        : "/api/portal/opinion-cumplimiento";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo consultar.");
        setOpinion(null);
        return;
      }
      if (data.opinion) setOpinion(data.opinion);
    } catch {
      setError("Error de conexión al consultar el SAT.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar(false);
  }, [cargar]);

  const ui = opinionUi(opinion?.estado);
  const cardClass = TONO_CARD[ui.tono];

  return (
    <div className={`rounded-2xl border px-4 py-4 ${cardClass}`}>
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${ui.dot} ${
            cargando ? "animate-pulse" : ""
          }`}
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Opinión de cumplimiento · SAT
            </p>
            <Link
              href="/portal/sat"
              className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-navy)] hover:text-[var(--portal-navy-hover)]"
            >
              Ver más →
            </Link>
          </div>
          {cargando ? (
            <p className="text-sm font-bold text-slate-600 mt-1">
              Consultando con el SAT…
            </p>
          ) : error ? (
            <p className="text-sm font-bold text-slate-700 mt-1">{error}</p>
          ) : (
            <>
              <p className="text-sm font-black text-slate-800 mt-1">{ui.etiqueta}</p>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5 leading-snug">
                {opinion?.mensaje ?? ui.detalle}
              </p>
              {opinion?.ultimaConsulta && (
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                  Actualizado{" "}
                  {new Date(opinion.ultimaConsulta).toLocaleString("es-MX", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </>
          )}
        </div>
        {!cargando && (
          <button
            type="button"
            onClick={() => void cargar(true)}
            className="shrink-0 text-[9px] font-black uppercase tracking-widest text-[var(--portal-navy)] hover:text-[var(--portal-navy-hover)] px-2 py-1"
            title="Volver a consultar"
          >
            ↻
          </button>
        )}
      </div>
    </div>
  );
}
