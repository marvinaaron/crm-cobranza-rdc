"use client";

import { useAnilloFill } from "@/hooks/useAnilloFill";
import { parseFechaLimite, diasHastaLimite } from "@/lib/cumplimiento-fechas";

const BOX = 72;
const R = 28;
const STROKE = 5.5;
const CIRC = 2 * Math.PI * R;
const ARC_DEG = 270;
const ARC = (ARC_DEG / 360) * CIRC;
const VENTANA = 17;

const MESES_CORTOS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

type Tono = "navy" | "amarillo" | "naranja" | "rojo" | "hecho";

const COLOR: Record<Tono, { stroke: string; texto: string }> = {
  navy: { stroke: "var(--portal-navy, #1a164d)", texto: "text-[var(--portal-navy)]" },
  amarillo: { stroke: "#eab308", texto: "text-yellow-600" },
  naranja: { stroke: "#FDB203", texto: "text-marca-naranja" },
  rojo: { stroke: "#ef4444", texto: "text-red-500" },
  hecho: { stroke: "#10b981", texto: "text-emerald-600" },
};

function tonoDeDias(dias: number | null, pagado: boolean): Tono {
  if (pagado) return "hecho";
  if (dias === null) return "navy";
  if (dias < 0) return "rojo";
  if (dias <= 2) return "rojo";
  if (dias <= 5) return "naranja";
  if (dias <= 10) return "amarillo";
  return "navy";
}

function pctDeDias(dias: number | null, pagado: boolean): number {
  if (pagado) return 100;
  if (dias === null) return 0;
  if (dias < 0) return 100;
  return Math.min(
    100,
    Math.max(8, Math.round(((VENTANA - dias) / VENTANA) * 100))
  );
}

type Props = {
  fechaIso: string;
  pagado?: boolean;
  onAgregarCalendario?: () => void;
};

export default function VelocimetroVencimiento({
  fechaIso,
  pagado = false,
  onAgregarCalendario,
}: Props) {
  const fecha = parseFechaLimite(fechaIso);
  const dias = diasHastaLimite(fechaIso);
  const tono = tonoDeDias(dias, pagado);
  const color = COLOR[tono];
  const pct = pctDeDias(dias, pagado);
  const offset = useAnilloFill(ARC, pct);
  if (!fecha) return null;
  const dia = fecha.getDate();
  const mes = MESES_CORTOS[fecha.getMonth()] ?? "";
  const anio = String(fecha.getFullYear()).slice(-2);

  const cuerpo = (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: BOX, height: BOX }}
      role="img"
      aria-label={
        pagado
          ? `Pagado · ${dia} ${mes} ${anio}`
          : `Vence ${dia} ${mes} ${anio}`
      }
    >
      <svg
        width={BOX}
        height={BOX}
        className="absolute inset-0 rotate-[135deg]"
        aria-hidden
      >
        <circle
          cx={BOX / 2}
          cy={BOX / 2}
          r={R}
          fill="none"
          stroke="var(--rdc-ring-track)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${ARC} ${CIRC}`}
        />
        <circle
          cx={BOX / 2}
          cy={BOX / 2}
          r={R}
          fill="none"
          stroke={color.stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${ARC} ${CIRC}`}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span
        className={`relative z-10 flex flex-col items-center justify-center pt-1 ${color.texto}`}
      >
        <span className="font-bold tabular-nums text-[20px] leading-none">
          {dia}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold leading-none tracking-wide whitespace-nowrap">
          {mes} {anio}
        </span>
      </span>
    </span>
  );

  if (onAgregarCalendario && !pagado) {
    return (
      <button
        type="button"
        onClick={onAgregarCalendario}
        title="Agregar al calendario del teléfono"
        className="inline-flex shrink-0"
      >
        {cuerpo}
      </button>
    );
  }

  return <div className="inline-flex shrink-0">{cuerpo}</div>;
}
