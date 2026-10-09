"use client";

import {
  colorAnilloEfirma,
  colorTextoEfirma,
  numeroCuentaRegresiva,
  porcentajeVentana30,
} from "@/lib/efirma/vigencia";

type Props = {
  diasRestantes: number;
  /** sm = tarjetas móvil, md = admin escritorio, lg = banner portal */
  tamano?: "sm" | "md" | "lg";
};

const TAMANOS = {
  sm: { box: 52, r: 22, stroke: 3.5, valor: "text-lg", unidad: "text-[7px]" },
  md: { box: 60, r: 25, stroke: 4, valor: "text-xl", unidad: "text-[8px]" },
  lg: { box: 72, r: 30, stroke: 4.5, valor: "text-2xl", unidad: "text-[9px]" },
};

/**
 * Anillo de cuenta regresiva (30 días): el arco se llena y cambia de
 * amarillo → naranja → rojo conforme se acerca el vencimiento.
 * El número de días va en el centro.
 */
export default function CuentaRegresivaEfirma({
  diasRestantes,
  tamano = "md",
}: Props) {
  if (diasRestantes > 30) return null;

  const t = TAMANOS[tamano];
  const pct = porcentajeVentana30(diasRestantes);
  const circ = 2 * Math.PI * t.r;
  const offset = circ * (1 - pct / 100);
  const stroke = colorAnilloEfirma(diasRestantes);
  const { valor, unidad } = numeroCuentaRegresiva(diasRestantes);

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: t.box, height: t.box }}
      role="img"
      aria-label={`${valor} ${unidad} para vencimiento de e.firma`}
    >
      <svg
        width={t.box}
        height={t.box}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={t.box / 2}
          cy={t.box / 2}
          r={t.r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={t.stroke}
        />
        <circle
          cx={t.box / 2}
          cy={t.box / 2}
          r={t.r}
          fill="none"
          stroke={stroke}
          strokeWidth={t.stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className={`font-black tabular-nums ${t.valor} ${colorTextoEfirma(diasRestantes)}`}
        >
          {valor}
        </span>
        <span
          className={`font-black uppercase tracking-wider mt-0.5 ${t.unidad} ${colorTextoEfirma(diasRestantes)} opacity-80`}
        >
          {unidad}
        </span>
      </div>
    </div>
  );
}
