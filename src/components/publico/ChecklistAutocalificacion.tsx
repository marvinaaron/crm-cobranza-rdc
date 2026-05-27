"use client";

/**
 * Checklist interactivo de autocalificación.
 *
 * Cada item se puede marcar/desmarcar con click. El CTA cambia su copy
 * y estilo según cuántos items lleve marcados el visitante:
 *  - 0–1 → estado neutral.
 *  - 2–3 → "Definitivamente debemos hablar".
 *  - 4+ → "Urgente — Hablemos hoy mismo".
 */

import Link from "next/link";
import { useState } from "react";

const ITEMS = [
  "Nunca te enteras de qué se declara ante el SAT",
  "Tu contador te manda todo por WhatsApp y la información importante se pierde entre mensajes",
  "No sabes con certeza si estás al corriente o si tienes algún adeudo con el SAT",
  "Tu contador tarda días — o semanas — en contestarte",
  "Quieres pagar tus honorarios con tarjeta de crédito y no puedes porque tienes que transferir forzosamente",
  "Ni tú ni tu contador recuerdan si quedó algún honorario pendiente del mes",
  "Te gustaría ver tu situación fiscal cuando quieras, desde el celular",
  "Buscar tus impuestos anteriores o saldos a favor te toma horas entre WhatsApp y correo",
];

export default function ChecklistAutocalificacion() {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const total = checked.size;

  let ctaCopy: string;
  let ctaTone: "neutro" | "calido" | "urgente";
  if (total >= 6) {
    ctaCopy = "Urgente — Hablemos hoy mismo";
    ctaTone = "urgente";
  } else if (total >= 2) {
    ctaCopy = "Definitivamente debemos hablar";
    ctaTone = "calido";
  } else {
    ctaCopy = "Solicitar cotización";
    ctaTone = "neutro";
  }

  const ctaClass =
    ctaTone === "urgente"
      ? "bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 shadow-lg shadow-rose-200 ring-1 ring-white/20"
      : ctaTone === "calido"
        ? "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-violet-200 ring-1 ring-white/20"
        : "bg-slate-900 hover:bg-slate-800 shadow-lg";

  const helperCopy =
    total === 0
      ? "Marca los que te suenen familiares."
      : total === 1
        ? "Si marcaste 2 o más, hablemos. Cotización gratis en 24 hrs."
        : total >= 6
          ? "Marcaste muchos — la buena noticia es que esto se arregla en una llamada."
          : "Suficientes señales para platicar. Cotización gratis en 24 hrs.";

  return (
    <div className="relative rounded-3xl bg-white ring-1 ring-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600"
        aria-hidden
      />

      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex w-10 h-10 rounded-xl bg-violet-100 text-violet-700 items-center justify-center ring-1 ring-violet-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
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
                  ? "bg-rose-100 text-rose-700"
                  : "bg-violet-100 text-violet-700"
            }`}
            aria-live="polite"
          >
            {total} / {ITEMS.length}
          </span>
        </div>

        <ul className="space-y-2.5">
          {ITEMS.map((item, idx) => {
            const isChecked = checked.has(idx);
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-pressed={isChecked}
                  className={`w-full text-left flex items-start gap-3 p-3.5 rounded-2xl ring-1 transition-all duration-200 ${
                    isChecked
                      ? "bg-gradient-to-br from-violet-50 to-indigo-50 ring-violet-300/70 shadow-sm"
                      : "bg-slate-50/70 ring-slate-100 hover:bg-violet-50/40 hover:ring-violet-200/70"
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${
                      isChecked
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-violet-300 ring-1 ring-violet-300/40 scale-105"
                        : "bg-white text-transparent ring-2 ring-slate-300 group-hover:ring-violet-300"
                    }`}
                    aria-hidden
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Cierre con CTA dinámico */}
        <div className="mt-6 pt-5 border-t border-dashed border-slate-200 flex flex-col gap-3">
          <p className="text-sm text-slate-600 leading-snug">
            {helperCopy}
          </p>
          <Link
            href="/contacto"
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold transition-all self-start ${ctaClass}`}
          >
            {ctaCopy}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
