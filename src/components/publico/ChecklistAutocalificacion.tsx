"use client";

/**
 * Checklist interactivo de autocalificación.
 *
 * Cada item se puede marcar/desmarcar con click. El CTA cambia su copy
 * y estilo según cuántos items lleve marcados el visitante:
 *  - 0–1 → estado neutral.
 *  - 2+ → "Definitivamente debemos hablar".
 *  - 6+ → "Urgente — Hablemos hoy mismo".
 *
 * En /empezar el CTA se oculta (el envío lo hace el formulario de la izquierda).
 */

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ITEMS_AUTOCALIFICACION,
  claseCtaUrgencia,
  copyCtaUrgencia,
  helperUrgencia,
  tonoDesdeChecks,
  type TonoUrgencia,
} from "@/lib/autocalificacion-urgencia";

export type ChecklistEstado = {
  total: number;
  items: string[];
  tono: TonoUrgencia;
};

type Props = {
  /** Si true, no muestra el botón inferior (p. ej. layout cotizar). */
  ocultarCta?: boolean;
  /** Destino del CTA en modo standalone (Nosotros). */
  ctaHref?: string;
  onChange?: (estado: ChecklistEstado) => void;
};

function estadoDesdeSet(checked: Set<number>): ChecklistEstado {
  const items = ITEMS_AUTOCALIFICACION.filter((_, i) => checked.has(i)).map(
    String
  );
  const total = checked.size;
  return { total, items, tono: tonoDesdeChecks(total) };
}

export default function ChecklistAutocalificacion({
  ocultarCta = false,
  ctaHref = "/empezar",
  onChange,
}: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const emitir = useCallback(
    (next: Set<number>) => {
      onChange?.(estadoDesdeSet(next));
    },
    [onChange]
  );

  const toggle = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      emitir(next);
      return next;
    });
  };

  const { total, tono } = estadoDesdeSet(checked);
  const ctaCopy = copyCtaUrgencia(tono);
  const ctaClass = claseCtaUrgencia(tono);
  const helperCopy = helperUrgencia(total);

  return (
    <div className="relative rounded-3xl bg-white ring-1 ring-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden h-full">
      <div
        className={`absolute inset-x-0 top-0 h-1.5 transition-colors ${
          tono === "urgente"
            ? "bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600"
            : "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600"
        }`}
        aria-hidden
      />

      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex w-10 h-10 rounded-xl items-center justify-center ring-1 transition-colors ${
                tono === "urgente"
                  ? "bg-rose-100 text-rose-700 ring-rose-200"
                  : "bg-violet-100 text-violet-700 ring-violet-200"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            <div>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                  tono === "urgente" ? "text-rose-600" : "text-violet-600"
                }`}
              >
                Autocalificación
              </p>
              <p className="text-sm font-black text-slate-900">
                Marca todo lo que te suene familiar
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tabular-nums transition-colors ${
              total === 0
                ? "bg-slate-100 text-slate-500"
                : total >= 6
                  ? "bg-rose-100 text-rose-700 animate-pulse"
                  : "bg-violet-100 text-violet-700"
            }`}
            aria-live="polite"
          >
            {total} / {ITEMS_AUTOCALIFICACION.length}
          </span>
        </div>

        <ul className="space-y-2.5">
          {ITEMS_AUTOCALIFICACION.map((item, idx) => {
            const isChecked = checked.has(idx);
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-pressed={isChecked}
                  className={`w-full text-left flex items-start gap-3 p-3.5 rounded-2xl ring-1 transition-all duration-200 ${
                    isChecked
                      ? tono === "urgente"
                        ? "bg-gradient-to-br from-rose-50 to-violet-50 ring-rose-300/70 shadow-sm"
                        : "bg-gradient-to-br from-violet-50 to-indigo-50 ring-violet-300/70 shadow-sm"
                      : "bg-slate-50/70 ring-slate-100 hover:bg-violet-50/40 hover:ring-violet-200/70"
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${
                      isChecked
                        ? tono === "urgente"
                          ? "bg-gradient-to-br from-rose-500 to-violet-600 text-white shadow-sm shadow-rose-300 ring-1 ring-rose-300/40 scale-105"
                          : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-violet-300 ring-1 ring-violet-300/40 scale-105"
                        : "bg-white text-transparent ring-2 ring-slate-300"
                    }`}
                    aria-hidden
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <p
                    className={`text-sm leading-snug transition-colors ${
                      isChecked
                        ? "text-slate-900 font-semibold"
                        : "text-slate-700"
                    }`}
                  >
                    <span className="font-bold text-slate-400 mr-1.5 tabular-nums">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-5 border-t border-dashed border-slate-200 flex flex-col gap-3">
          <p className="text-sm text-slate-600 leading-snug">{helperCopy}</p>
          {!ocultarCta && (
            <Link
              href={ctaHref}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold transition-all self-start ${ctaClass}`}
            >
              {ctaCopy}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          )}
          {ocultarCta && (
            <p className="text-xs font-semibold text-slate-500">
              Completa tus datos a la izquierda → la cotización se envía con el
              botón de color.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
