"use client";

import Link from "next/link";
import { useAnilloFill } from "@/hooks/useAnilloFill";
import type { TonoAnilloInicio } from "@/lib/dashboard-anillos";

export type AnilloVista = {
  id: string;
  label: string;
  centro: string;
  pie: string;
  pct: number;
  tono: TonoAnilloInicio;
  href?: string;
  onClick?: () => void;
};

const COLOR_ANILLO: Record<TonoAnilloInicio, { stroke: string; texto: string }> = {
  navy: { stroke: "#1a164d", texto: "text-[var(--portal-navy,#1a164d)]" },
  emerald: { stroke: "#10b981", texto: "text-emerald-600" },
  amber: { stroke: "#eab308", texto: "text-yellow-600" },
  rose: { stroke: "#ef4444", texto: "text-red-500" },
  slate: { stroke: "#cbd5e1", texto: "text-slate-400" },
};

const ANILLO_BOX = 72;
const ANILLO_R = 28;
const ANILLO_STROKE = 5.5;
const ANILLO_CIRC = 2 * Math.PI * ANILLO_R;
/** Herradura: hueco más abierto abajo (~90°) para anidar la etiqueta. */
const ANILLO_ARC_DEG = 270;
const ANILLO_ARC = (ANILLO_ARC_DEG / 360) * ANILLO_CIRC;

type Props = {
  anillo: AnilloVista;
  delayMs?: number;
};

/**
 * Velocímetro de herradura (Inicio / Cobranza).
 * Link si hay href; botón si hay onClick.
 */
export default function AnilloHerradura({ anillo, delayMs = 0 }: Props) {
  const color = COLOR_ANILLO[anillo.tono];
  const offset = useAnilloFill(ANILLO_ARC, anillo.pct);
  const centroLargo = anillo.centro.length > 6;
  const className =
    "flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-0.5 sm:px-1 py-1 active:bg-white/60 dark:active:bg-[#3c3c3e]";

  const inner = (
    <>
      <span
        className="relative shrink-0 w-14 h-14 sm:w-[72px] sm:h-[72px] -mt-0.5"
        role="img"
        aria-label={`${anillo.label} · ${anillo.pie}`}
      >
        <svg
          viewBox={`0 0 ${ANILLO_BOX} ${ANILLO_BOX}`}
          className="h-full w-full rotate-[135deg]"
          aria-hidden
        >
          <circle
            cx={ANILLO_BOX / 2}
            cy={ANILLO_BOX / 2}
            r={ANILLO_R}
            fill="none"
            stroke="var(--rdc-ring-track)"
            strokeWidth={ANILLO_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${ANILLO_ARC} ${ANILLO_CIRC}`}
          />
          <circle
            cx={ANILLO_BOX / 2}
            cy={ANILLO_BOX / 2}
            r={ANILLO_R}
            fill="none"
            stroke={color.stroke}
            strokeWidth={ANILLO_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${ANILLO_ARC} ${ANILLO_CIRC}`}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
            style={{ transitionDelay: `${delayMs}ms` }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-bold tabular-nums leading-none ${
            centroLargo ? "text-[12px] sm:text-[15px]" : "text-[16px] sm:text-[22px]"
          } ${color.texto}`}
        >
          {anillo.centro}
        </span>
      </span>
      <span className="inline-flex max-w-full items-center justify-center gap-0.5 -mt-1.5 text-[10px] sm:text-[13px] font-semibold text-center leading-tight text-slate-900">
        <span>{anillo.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-400 shrink-0"
          aria-hidden
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
      <span className="text-[9px] sm:text-[12px] text-slate-500 text-center leading-none truncate max-w-full">
        {anillo.pie}
      </span>
    </>
  );

  if (anillo.onClick) {
    return (
      <button type="button" onClick={anillo.onClick} className={className}>
        {inner}
      </button>
    );
  }
  if (anillo.href) {
    return (
      <Link href={anillo.href} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}
