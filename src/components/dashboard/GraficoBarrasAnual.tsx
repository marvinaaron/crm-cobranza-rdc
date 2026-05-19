"use client";

import { useMemo } from "react";
import type { MesResumenAnual } from "@/lib/dashboard-metrics";

type Props = {
  meses: MesResumenAnual[];
  anio: number;
};

const W = 640;
const H = 220;
const PAD = { top: 12, right: 8, bottom: 28, left: 52 };

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

export default function GraficoBarrasAnual({ meses, anio }: Props) {
  const enCurso = meses.filter((m) => m.enCurso);
  const maxValor = Math.max(...enCurso.map((m) => Math.max(m.compromiso, m.cobrado)), 1);

  const chart = useMemo(() => {
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const slot = innerW / 12;
    const barW = Math.min(36, slot * 0.55);

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: PAD.top + innerH * (1 - t),
      label: fmtCompact(maxValor * t),
    }));

    const barras = meses.map((m, i) => {
      const cx = PAD.left + slot * i + slot / 2;
      const x = cx - barW / 2;

      if (!m.enCurso) {
        return { mes: m.mes, label: m.label, enCurso: false as const, x, cx, barW };
      }

      const alturaTotal = Math.max(m.compromiso, m.cobrado);
      const hCobrado = m.cobrado > 0 ? (m.cobrado / maxValor) * innerH : 0;
      const hPendiente =
        alturaTotal > 0 ? Math.max(0, (alturaTotal / maxValor) * innerH - hCobrado) : 0;
      const yBase = PAD.top + innerH;
      const yCobrado = yBase - hCobrado;
      const yPendiente = yCobrado - hPendiente;

      return {
        mes: m.mes,
        label: m.label,
        enCurso: true as const,
        x,
        cx,
        barW,
        compromiso: m.compromiso,
        cobrado: m.cobrado,
        pendiente: m.pendiente,
        hCobrado,
        hPendiente,
        yCobrado,
        yPendiente,
        yBase,
      };
    });

    return { yTicks, barras, yBase: PAD.top + innerH };
  }, [meses, maxValor]);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-6 h-full flex flex-col min-h-0">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4 shrink-0">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Esperado vs cobrado
          </p>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Cobranza {anio}
          </h2>
        </div>
        <div className="flex flex-wrap gap-5 text-[9px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-2 text-indigo-600">
            <span className="w-3 h-3 rounded-sm bg-indigo-500" />
            Cobrado real
          </span>
          <span className="flex items-center gap-2 text-indigo-400">
            <span className="w-3 h-3 rounded-sm border-2 border-dashed border-indigo-300 bg-indigo-50/80" />
            Por cobrar (meta)
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[200px] w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Gráfica de cobranza ${anio}: esperado versus cobrado por mes`}
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
              x={PAD.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-slate-400 text-[9px] font-bold"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {chart.barras.map((b) => {
          if (!b.enCurso) {
            return (
              <g key={b.mes} opacity={0.25}>
                <rect
                  x={b.x}
                  y={chart.yBase - 12}
                  width={b.barW}
                  height={12}
                  rx={4}
                  fill="#e2e8f0"
                />
                <text
                  x={b.cx}
                  y={H - 6}
                  textAnchor="middle"
                  className="fill-slate-300 text-[8px] font-bold uppercase"
                >
                  {b.label}
                </text>
              </g>
            );
          }

          return (
            <g key={b.mes} className="group">
              {b.hPendiente > 0 && (
                <rect
                  x={b.x}
                  y={b.yPendiente}
                  width={b.barW}
                  height={b.hPendiente}
                  rx={b.hCobrado > 0 ? 0 : 6}
                  fill="rgba(199, 210, 254, 0.35)"
                  stroke="#a5b4fc"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
              )}
              {b.hCobrado > 0 && (
                <rect
                  x={b.x}
                  y={b.yCobrado}
                  width={b.barW}
                  height={b.hCobrado}
                  rx={b.hPendiente > 0 ? 0 : 6}
                  fill="#6366f1"
                />
              )}
              <title>
                {b.label}: ${b.cobrado.toLocaleString("es-MX")} cobrado · $
                {b.compromiso.toLocaleString("es-MX")} esperado
              </title>
              <text
                x={b.cx}
                y={H - 6}
                textAnchor="middle"
                className="fill-slate-500 text-[8px] font-black uppercase"
              >
                {b.label}
              </text>
            </g>
          );
        })}
        </svg>
      </div>

      <p className="text-[9px] font-bold text-slate-400 mt-4 text-center shrink-0">
        Altura total = compromiso del mes · Relleno sólido = cobrado · Contorno punteado = pendiente
      </p>
    </div>
  );
}
