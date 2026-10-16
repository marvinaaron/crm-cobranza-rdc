"use client";

import { useMemo } from "react";
import type { Cliente } from "@/lib/clientes";
import { calcularCrecimientoMensual } from "@/lib/dashboard-metrics";

/**
 * Gráfica de barras: nuevos clientes recurrentes por mes.
 *  - Año en curso (índigo)
 *  - Año anterior (gris translúcido, para comparativa)
 *  - Etiqueta numérica encima de cada barra del año actual.
 */
type Props = {
  clientes: Cliente[];
  anio: number;
};

const W = 560;
const H = 240;
const PAD = { top: 44, right: 12, bottom: 32, left: 32 };

export default function GraficoNuevosClientes({ clientes, anio }: Props) {
  const datos = useMemo(
    () => calcularCrecimientoMensual(clientes, anio),
    [clientes, anio]
  );

  const chart = useMemo(() => {
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const slot = innerW / 12;
    const barW = Math.min(28, slot * 0.45);
    const gap = 2;

    const maxValor = Math.max(
      ...datos.actual.meses.map((m) => m.nuevos),
      ...datos.anterior.meses.map((m) => m.nuevos),
      1
    );

    const yBase = PAD.top + innerH;
    const yTicks = [0, 0.5, 1].map((t) => ({
      y: PAD.top + innerH * (1 - t),
      label: String(Math.round(maxValor * t)),
    }));

    const barras = datos.actual.meses.map((m, i) => {
      const cx = PAD.left + slot * i + slot / 2;
      const anterior = datos.anterior.meses[i]?.nuevos ?? 0;

      const hActual = (m.nuevos / maxValor) * innerH;
      const hAnterior = (anterior / maxValor) * innerH;

      return {
        mes: m.mes,
        label: m.label,
        valor: m.nuevos,
        valorAnterior: anterior,
        cx,
        xActual: cx + gap / 2,
        xAnterior: cx - barW - gap / 2,
        barW,
        hActual,
        hAnterior,
        yActual: yBase - hActual,
        yAnterior: yBase - hAnterior,
        yBase,
      };
    });

    return { yTicks, barras, yBase };
  }, [datos]);

  const { actual, anterior, variacionPct } = datos;
  const subio = variacionPct >= 0;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-6 h-full flex flex-col min-h-0">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4 shrink-0">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Crecimiento de cartera
          </p>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Nuevos clientes
          </h2>
          <div className="flex flex-wrap items-baseline gap-3 mt-2">
            <p className="text-2xl font-black text-indigo-600 tabular-nums leading-none">
              {actual.totalAnio}
            </p>
            <span className="text-[10px] font-bold text-slate-400">
              en {anio}
            </span>
            <span
              className={`text-[10px] font-black tabular-nums ${
                subio ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {subio ? "↑" : "↓"} {Math.abs(variacionPct)}% vs {anterior.anio}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-[8px] font-black uppercase tracking-widest text-indigo-700">
            <span className="w-2 h-2 rounded-sm bg-indigo-500" />
            {actual.anio}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-2 h-2 rounded-sm bg-slate-300" />
            {anterior.anio}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[180px] w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Nuevos clientes por mes en ${anio}`}
        >
          {chart.yTicks.map((tick) => (
            <g key={tick.label}>
              <line
                x1={PAD.left}
                y1={tick.y}
                x2={W - PAD.right}
                y2={tick.y}
                stroke="#f1f5f9"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 6}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[9px] font-bold"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {chart.barras.map((b) => (
            <g key={b.mes}>
              {b.hAnterior > 0 && (
                <rect
                  x={b.xAnterior}
                  y={b.yAnterior}
                  width={b.barW}
                  height={b.hAnterior}
                  rx={4}
                  fill="#cbd5e1"
                  opacity={0.6}
                >
                  <title>
                    {b.label} {anterior.anio}: {b.valorAnterior} cliente
                    {b.valorAnterior === 1 ? "" : "s"}
                  </title>
                </rect>
              )}
              {b.hActual > 0 && (
                <rect
                  x={b.xActual}
                  y={b.yActual}
                  width={b.barW}
                  height={b.hActual}
                  rx={4}
                  fill="#8b5cf6"
                >
                  <title>
                    {b.label} {actual.anio}: {b.valor} cliente
                    {b.valor === 1 ? "" : "s"}
                  </title>
                </rect>
              )}
              {b.valor > 0 && (
                <text
                  x={b.xActual + b.barW / 2}
                  y={b.yActual - 4}
                  textAnchor="middle"
                  className="fill-indigo-700 text-[8px] font-black"
                >
                  {b.valor}
                </text>
              )}
              <text
                x={b.cx}
                y={H - 8}
                textAnchor="middle"
                className="fill-slate-400 text-[8px] font-bold uppercase"
              >
                {b.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="text-[9px] font-bold text-slate-400 mt-3 text-center shrink-0">
        Barra índigo = {actual.anio} · Barra gris = {anterior.anio}
      </p>
    </div>
  );
}
