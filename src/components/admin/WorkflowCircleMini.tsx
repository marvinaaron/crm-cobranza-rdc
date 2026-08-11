/**
 * Círculo compacto con el número del paso del flujo de cumplimiento
 * (1-7) y un anillo de progreso al rededor coloreado según el paso.
 * Reutilizado en cobranza, cartera de clientes y cumplimiento para
 * mantener un mismo lenguaje visual.
 *
 * Los colores siguen la misma escala que ya usa /cumplimiento en sus
 * tarjetas StepWorkflowCard:
 *
 *   1 slate · 2 sky · 3 amber · 4 teal · 5 violet · 6 indigo · 7 emerald
 *
 * Al pasar el mouse se despliega un popover oscuro con la lista de
 * los 7 pasos, marcando el actual y los que ya superó el cliente.
 */

"use client";

import { TONO_RING, type WorkflowResumen } from "@/lib/cobranza-workflow";

type Props = {
  resumen: WorkflowResumen;
  /**
   * Lado al que sale el popover. En tablas anchas con la columna
   * pegada al borde derecho, `left` evita que se corte; en tablas
   * estrechas o cuando la columna está en el medio, `right` se ve
   * mejor. Defecto: `left`.
   */
  popoverHacia?: "left" | "right";
  /**
   * `sm` (defecto): círculo ~44px con etiqueta corta debajo.
   * `xs`: círculo ~32px sin etiqueta — pensado para la vista anual.
   */
  size?: "sm" | "xs";
};

export default function WorkflowCircleMini({
  resumen,
  popoverHacia = "left",
  size = "sm",
}: Props) {
  const { paso, totalPasos, tono, labelCorto, descripcion, pasos } = resumen;
  const t = TONO_RING[tono];
  const porcentaje = (paso / totalPasos) * 100;
  const compacto = size === "xs";

  // Math para un círculo SVG con radio 16 (perímetro ≈ 100.5).
  const RADIO = 16;
  const PERIMETRO = 2 * Math.PI * RADIO;
  const dashOffset = PERIMETRO - (PERIMETRO * porcentaje) / 100;

  const popoverPos =
    popoverHacia === "right" ? "left-full ml-3" : "right-full mr-3";

  return (
    <div className="relative inline-block group/wf">
      <div className="flex flex-col items-center gap-0.5">
        <div className={compacto ? "relative w-8 h-8" : "relative w-11 h-11"}>
          <svg
            viewBox="0 0 40 40"
            className="w-full h-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r={RADIO}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={compacto ? 4 : 3.5}
            />
            <circle
              cx="20"
              cy="20"
              r={RADIO}
              fill="none"
              stroke={t.hex}
              strokeWidth={compacto ? 4 : 3.5}
              strokeLinecap="round"
              strokeDasharray={PERIMETRO}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 600ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`font-black tabular-nums leading-none ${
                compacto ? "text-xs" : "text-base"
              } ${t.numText}`}
            >
              {paso}
            </span>
          </div>
        </div>
        {!compacto && (
          <p
            className={`text-[9px] font-black tracking-wide uppercase ${t.subtitleText}`}
          >
            {labelCorto}
          </p>
        )}
      </div>

      <div
        role="tooltip"
        className={`pointer-events-none absolute z-30 ${popoverPos} top-1/2 -translate-y-1/2 w-64 opacity-0 group-hover/wf:opacity-100 group-hover/wf:pointer-events-auto transition-opacity duration-150`}
      >
        <div className="rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 p-3 space-y-2">
          <div className="flex items-baseline justify-between border-b border-slate-700 pb-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              Flujo cumplimiento
            </p>
            <p
              className="text-[10px] font-black tabular-nums"
              style={{ color: t.hex }}
            >
              {paso} / {totalPasos}
            </p>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {descripcion}
          </p>
          <ul className="space-y-1 pt-1 border-t border-slate-700">
            {pasos.map((p) => {
              const colorHex = TONO_RING[p.tono].hex;
              const dot = p.actual ? "●" : p.superado ? "✓" : "○";
              return (
                <li key={p.flujo} className="flex items-center gap-2">
                  <span
                    className="text-xs leading-none w-3 text-center font-bold"
                    style={{
                      color: p.actual || p.superado ? colorHex : "#475569",
                    }}
                  >
                    {dot}
                  </span>
                  <span
                    className={`text-[10px] tabular-nums font-black ${
                      p.actual ? "" : "text-slate-500"
                    }`}
                    style={p.actual ? { color: colorHex } : undefined}
                  >
                    {p.numero}.
                  </span>
                  <span
                    className={`text-[10px] flex-1 ${
                      p.actual
                        ? "text-white font-bold"
                        : p.superado
                          ? "text-slate-300"
                          : "text-slate-500"
                    }`}
                  >
                    {p.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
