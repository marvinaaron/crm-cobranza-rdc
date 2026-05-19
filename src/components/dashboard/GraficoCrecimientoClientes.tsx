"use client";

import { useMemo, useId } from "react";
import type { Cliente } from "@/lib/clientes";
import { calcularCrecimientoMensual } from "@/lib/dashboard-metrics";

type Props = {
  clientes: Cliente[];
  anio: number;
};

const W = 560;
const H = 220;
const PAD = { top: 44, right: 12, bottom: 32, left: 32 };

type Punto = { x: number; y: number; valor: number; label: string };

function curvaSuave(puntos: Punto[]): string {
  if (puntos.length === 0) return "";
  if (puntos.length === 1) return `M ${puntos[0].x} ${puntos[0].y}`;
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function GraficoCrecimientoClientes({ clientes, anio }: Props) {
  const uid = useId().replace(/:/g, "");
  const datos = useMemo(
    () => calcularCrecimientoMensual(clientes, anio),
    [clientes, anio]
  );

  const chart = useMemo(() => {
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const yBase = PAD.top + innerH;

    const maxValor = Math.max(
      ...datos.actual.meses.map((m) => m.nuevos),
      ...datos.anterior.meses.map((m) => m.nuevos),
      1
    );

    const toPoints = (valores: { nuevos: number; label: string }[]): Punto[] =>
      valores.map((m, i) => {
        const x = PAD.left + (innerW * i) / 11;
        const y = yBase - (m.nuevos / maxValor) * innerH;
        return { x, y, valor: m.nuevos, label: m.label };
      });

    const actualPts = toPoints(datos.actual.meses);
    const lineaActual = curvaSuave(actualPts);
    const lineaAnterior = curvaSuave(toPoints(datos.anterior.meses));
    const areaActual = `${lineaActual} L ${actualPts[actualPts.length - 1]?.x ?? PAD.left} ${yBase} L ${actualPts[0]?.x ?? PAD.left} ${yBase} Z`;

    return { actualPts, lineaActual, lineaAnterior, areaActual };
  }, [datos]);

  const { actual, anterior, variacionPct } = datos;
  const subio = variacionPct >= 0;

  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-50 shadow-sm p-5 sm:p-6 h-full flex flex-col min-h-0">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3 shrink-0">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Crecimiento de cartera
          </p>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
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
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            {actual.anio}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-dashed border-slate-300 bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-4 border-t border-dashed border-slate-400" />
            {anterior.anio}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full flex-1 min-h-[160px]"
        role="img"
        aria-label={`Nuevos clientes por mes en ${anio}`}
      >
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + (H - PAD.top - PAD.bottom) * (1 - t);
          return (
            <line
              key={t}
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          );
        })}

        <path d={chart.areaActual} fill={`url(#grad-${uid})`} />
        <path
          d={chart.lineaAnterior}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        <path
          d={chart.lineaActual}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {chart.actualPts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="white" stroke="#6366f1" strokeWidth={2} />
            {p.valor > 0 && (
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                className="fill-indigo-600 text-[8px] font-black"
              >
                {p.valor}
              </text>
            )}
            <text
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[8px] font-bold uppercase"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      <p className="text-[9px] font-bold text-slate-400 mt-2 text-center shrink-0">
        Línea índigo = altas {actual.anio} · Punteada = {anterior.anio}
      </p>
    </div>
  );
}
