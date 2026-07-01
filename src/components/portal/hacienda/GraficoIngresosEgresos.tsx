"use client";

import { useMemo } from "react";
import type { PuntoTendenciaMes } from "@/lib/cfdi/resumen-mes";
import { portalCard, portalCardTitle } from "@/components/portal/portal-ui";

type Props = {
  puntos: PuntoTendenciaMes[];
  mesActivo?: number;
  anio: number;
};

const W = 400;
const H = 200;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 };

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  if (n === 0) return "$0";
  return `$${Math.round(n)}`;
}

function lineaPolyline(
  puntos: { x: number; y: number }[]
): string {
  if (puntos.length === 0) return "";
  return puntos.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

export default function GraficoIngresosEgresos({ puntos, mesActivo, anio }: Props) {
  const chart = useMemo(() => {
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const maxVal = Math.max(
      1,
      ...puntos.flatMap((p) => [p.ingresos, p.egresos])
    );

    const toY = (v: number) => PAD.top + plotH - (v / maxVal) * plotH;
    const toX = (i: number) =>
      PAD.left + (puntos.length <= 1 ? plotW / 2 : (i / (puntos.length - 1)) * plotW);

    const ingresosPts = puntos.map((p, i) => ({
      x: toX(i),
      y: toY(p.ingresos),
      valor: p.ingresos,
      mes: p.mes,
    }));
    const egresosPts = puntos.map((p, i) => ({
      x: toX(i),
      y: toY(p.egresos),
      valor: p.egresos,
      mes: p.mes,
    }));

    const yTicks = [0, 0.5, 1].map((f) => ({
      y: PAD.top + plotH * (1 - f),
      label: fmtCompact(maxVal * f),
    }));

    return { ingresosPts, egresosPts, yTicks, maxVal };
  }, [puntos]);

  const sinDatos = puntos.every((p) => p.ingresos === 0 && p.egresos === 0);

  return (
    <section className={`${portalCard} flex flex-col h-full min-h-[280px]`}>
      <p className={portalCardTitle}>Ingresos vs egresos · {anio}</p>

      <div className="flex items-center gap-4 text-[10px] font-bold mt-1 mb-3">
        <span className="flex items-center gap-1.5 text-emerald-700">
          <span className="w-4 h-0.5 rounded bg-emerald-500" />
          Ingresos
        </span>
        <span className="flex items-center gap-1.5 text-red-600">
          <span className="w-4 h-0.5 rounded bg-red-400" />
          Egresos
        </span>
      </div>

      {sinDatos ? (
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-sm font-semibold text-slate-400">
            Sin movimientos en {anio} para graficar
          </p>
        </div>
      ) : (
        <div className="flex-1 w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Gráfica de ingresos y egresos por mes en ${anio}`}
          >
            {chart.yTicks.map((tick) => (
              <g key={tick.label}>
                <line
                  x1={PAD.left}
                  y1={tick.y}
                  x2={W - PAD.right}
                  y2={tick.y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 6}
                  y={tick.y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-semibold"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            <path
              d={lineaPolyline(chart.ingresosPts)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={lineaPolyline(chart.egresosPts)}
              fill="none"
              stroke="#f87171"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {chart.ingresosPts.map((p, i) => (
              <circle
                key={`ing-${i}`}
                cx={p.x}
                cy={p.y}
                r={p.mes === mesActivo ? 4 : 2.5}
                fill="#10b981"
                opacity={p.mes === mesActivo ? 1 : 0.85}
              />
            ))}
            {chart.egresosPts.map((p, i) => (
              <circle
                key={`egr-${i}`}
                cx={p.x}
                cy={p.y}
                r={p.mes === mesActivo ? 4 : 2.5}
                fill="#f87171"
                opacity={p.mes === mesActivo ? 1 : 0.85}
              />
            ))}

            {puntos.map((p, i) => {
              const x =
                PAD.left +
                (puntos.length <= 1
                  ? (W - PAD.left - PAD.right) / 2
                  : (i / (puntos.length - 1)) * (W - PAD.left - PAD.right));
              const activo = p.mes === mesActivo;
              return (
                <text
                  key={p.mes}
                  x={x}
                  y={H - 6}
                  textAnchor="middle"
                  className={`text-[8px] font-bold ${
                    activo ? "fill-[var(--portal-navy)]" : "fill-slate-400"
                  }`}
                >
                  {p.label}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}
