"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CuentaRegresivaEfirma from "@/components/admin/CuentaRegresivaEfirma";
import { etiquetaDiasRestantes } from "@/lib/efirma/vigencia";
import { opinionUi } from "@/lib/sat/opinion-ui";
import type { OpinionPublicaEstado } from "@/lib/sat/types";

type EstadoEfirma = {
  tieneEfirma: boolean;
  vigenciaFinLabel?: string;
  diasRestantes?: number;
  enVentanaAlerta?: boolean;
};

type OpinionPayload = {
  estado: OpinionPublicaEstado;
  mensaje?: string;
  ultimaConsulta?: string;
};

const TONO_CARD: Record<
  ReturnType<typeof opinionUi>["tono"] | "efirma-urgente" | "efirma-warn",
  string
> = {
  ok: "bg-emerald-50/80 border-emerald-200",
  bad: "bg-red-50/80 border-red-200",
  warn: "bg-amber-50/80 border-amber-200",
  neutral: "bg-white border-slate-200",
  "efirma-urgente": "bg-red-50/80 border-red-200",
  "efirma-warn": "bg-amber-50/80 border-amber-200",
};

/**
 * Franja unificada de situación SAT en Inicio: opinión 32-D + aviso de e.firma.
 */
export default function PortalSituacionSatStrip() {
  const [cargandoOpinion, setCargandoOpinion] = useState(true);
  const [opinion, setOpinion] = useState<OpinionPayload | null>(null);
  const [errorOpinion, setErrorOpinion] = useState<string | null>(null);
  const [efirma, setEfirma] = useState<EstadoEfirma | null>(null);

  const cargarOpinion = useCallback(async (force = false) => {
    setCargandoOpinion(true);
    setErrorOpinion(null);
    try {
      const url = force
        ? "/api/portal/opinion-cumplimiento?force=1"
        : "/api/portal/opinion-cumplimiento";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setErrorOpinion(data.error ?? "No se pudo consultar.");
        setOpinion(null);
        return;
      }
      if (data.opinion) setOpinion(data.opinion);
    } catch {
      setErrorOpinion("Error de conexión al consultar el SAT.");
    } finally {
      setCargandoOpinion(false);
    }
  }, []);

  useEffect(() => {
    void cargarOpinion(false);
    void fetch("/api/portal/efirma-estado")
      .then((r) => r.json())
      .then(setEfirma)
      .catch(() => setEfirma(null));
  }, [cargarOpinion]);

  const ui = opinionUi(opinion?.estado);
  const muestraEfirma = Boolean(efirma?.tieneEfirma && efirma.enVentanaAlerta);
  const diasEfirma = efirma?.diasRestantes ?? 0;
  const efirmaUrgente = muestraEfirma && diasEfirma <= 7;

  const tonoCard = muestraEfirma
    ? efirmaUrgente
      ? TONO_CARD["efirma-urgente"]
      : TONO_CARD["efirma-warn"]
    : TONO_CARD[ui.tono];

  return (
    <div className={`rounded-2xl border px-4 py-3.5 sm:px-5 ${tonoCard}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
          Tu situación SAT
        </p>
        <Link
          href="/portal/sat"
          className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-navy)] hover:text-[var(--portal-navy-hover)] shrink-0"
        >
          Ver más →
        </Link>
      </div>

      <div className="space-y-3">
        {/* Opinión 32-D */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${ui.dot} ${
              cargandoOpinion ? "animate-pulse" : ""
            }`}
            aria-hidden
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Opinión 32-D
            </p>
            {cargandoOpinion ? (
              <p className="text-sm font-bold text-slate-600 mt-0.5">
                Consultando con el SAT…
              </p>
            ) : errorOpinion ? (
              <p className="text-sm font-bold text-slate-700 mt-0.5">{errorOpinion}</p>
            ) : (
              <>
                <p className="text-sm font-black text-slate-800 mt-0.5">{ui.etiqueta}</p>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5 leading-snug">
                  {opinion?.mensaje ?? ui.detalle}
                </p>
              </>
            )}
          </div>
          {!cargandoOpinion && (
            <button
              type="button"
              onClick={() => void cargarOpinion(true)}
              className="shrink-0 text-[9px] font-black uppercase tracking-widest text-[var(--portal-navy)] hover:text-[var(--portal-navy-hover)] px-1.5 py-1"
              title="Volver a consultar"
            >
              ↻
            </button>
          )}
        </div>

        {/* e.firma (solo en ventana de alerta) */}
        {muestraEfirma && (
          <div
            className={`flex items-center gap-3 pt-3 border-t ${
              efirmaUrgente ? "border-red-200/80" : "border-amber-200/80"
            }`}
          >
            <CuentaRegresivaEfirma diasRestantes={diasEfirma} tamano="md" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                e.firma (FIEL)
              </p>
              <p className="text-[12px] font-bold text-slate-800 leading-snug mt-0.5">
                Vence el{" "}
                <span className="text-amber-900">{efirma?.vigenciaFinLabel}</span>
                {" · "}
                {etiquetaDiasRestantes(diasEfirma)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
