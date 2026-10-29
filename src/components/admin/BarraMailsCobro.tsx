"use client";

import { useRef, useState } from "react";
import {
  CORREO_BOTON_LABEL,
  PASOS_CORREO_COBRO,
  type TipoCorreoCobranza,
} from "@/lib/correo";

/** 0 nada · 1 pre-aviso · 2 vencido · 3 adeudo */
const FILL = ["#e2e8f0", "#67e8f9", "#fde68a", "#ddd6fe"];
const MAX = PASOS_CORREO_COBRO.length;

function MailIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function BarraMailsCobro({
  posicion,
  disabled,
  onClick,
  onAvanzar,
}: {
  /** 0..3 (nada → adeudo) */
  posicion: number;
  disabled?: boolean;
  onClick: () => void;
  /** Solo al siguiente paso. */
  onAvanzar: (siguiente: TipoCorreoCobranza) => void;
}) {
  const pistaRef = useRef<HTMLDivElement>(null);
  const [arrastre, setArrastre] = useState<number | null>(null);
  const dragRef = useRef<{
    startX: number;
    moved: boolean;
    pointer: number;
  } | null>(null);

  const pos = Math.max(0, Math.min(MAX, arrastre ?? posicion));
  const pct = (pos / MAX) * 100;
  const fill = FILL[Math.max(0, Math.min(FILL.length - 1, Math.round(pos)))];
  const puedeAvanzar = !disabled && posicion < MAX;
  const siguiente =
    posicion < MAX ? PASOS_CORREO_COBRO[posicion] : null;

  const title =
    posicion >= MAX
      ? "Cierre enviado"
      : siguiente
        ? `Ahora: ${CORREO_BOTON_LABEL[siguiente]}. Arrastra un paso para el siguiente.`
        : "Correo de cobro";

  const xAPos = (clientX: number) => {
    const el = pistaRef.current;
    if (!el) return posicion;
    const r = el.getBoundingClientRect();
    const t = (clientX - r.left) / Math.max(1, r.width);
    const raw = t * MAX;
    const min = posicion;
    const max = puedeAvanzar ? posicion + 1 : posicion;
    return Math.max(min, Math.min(max, raw));
  };

  return (
    <div
      className={`relative w-[6.75rem] h-8 ${disabled ? "opacity-40" : ""}`}
      title={title}
    >
      <div
        ref={pistaRef}
        className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-slate-100 overflow-hidden"
      >
        <div
          className="h-full rounded-full transition-[width,background-color] duration-150"
          style={{ width: `${pct}%`, backgroundColor: fill }}
        />
      </div>
      {PASOS_CORREO_COBRO.map((_, i) => (
        <span
          key={i}
          className="absolute top-1/2 h-1 w-1 rounded-full bg-white ring-1 ring-slate-300"
          style={{ left: `${((i + 1) / MAX) * 100}%`, transform: "translate(-50%, -50%)" }}
        />
      ))}
      <button
        type="button"
        disabled={disabled}
        aria-label={title}
        className="absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-black/[0.06] cursor-grab active:cursor-grabbing touch-none"
        style={{
          left: `clamp(0px, calc(${pct}% - 14px), calc(100% - 28px))`,
        }}
        onPointerDown={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
          dragRef.current = {
            startX: e.clientX,
            moved: false,
            pointer: e.pointerId,
          };
          setArrastre(posicion);
        }}
        onPointerMove={(e) => {
          const d = dragRef.current;
          if (!d || d.pointer !== e.pointerId) return;
          if (Math.abs(e.clientX - d.startX) > 3) d.moved = true;
          if (d.moved) setArrastre(xAPos(e.clientX));
        }}
        onPointerUp={(e) => {
          const d = dragRef.current;
          dragRef.current = null;
          setArrastre(null);
          if (!d) return;
          e.stopPropagation();
          if (!d.moved) {
            onClick();
            return;
          }
          const dest = xAPos(e.clientX);
          if (puedeAvanzar && siguiente && dest >= posicion + 0.5) {
            onAvanzar(siguiente);
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setArrastre(null);
        }}
      >
        <MailIcon />
      </button>
    </div>
  );
}
