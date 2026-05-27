"use client";

import { useMemo, useId } from "react";
import type { MesResumenAnual } from "@/lib/dashboard-metrics";

/**
 * Gráfica de ingresos mensuales del año:
 *  - Área degradada (violeta) = cobrado real
 *  - Línea sólida indigo = trayectoria del cobrado
 *  - Línea punteada gris = compromiso/esperado del mes (referencia)
 *
 * La línea gris permite ver de un vistazo si estamos por debajo o por
 * encima de la expectativa cada mes.
 */
type Props = {
  meses: MesResumenAnual[];
  anio: number;
};

const W = 640;
const H = 240;
const PAD = { top: 48, right: 16, bottom: 32, left: 56 };

type Punto = { x: number; y: number; valor: number; label: string };

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

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

export default function GraficoIngresosAnual({ meses, anio }: Props) {
  const uid = useId().replace(/:/g, "");

  const chart = useMemo(() => {
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const yBase = PAD.top + innerH;

    const enCurso = meses.filter((m) => m.enCurso);
    const totalCobrado = enCurso.reduce((a, m) => a + m.cobrado, 0);
    const totalEsperado = enCurso.reduce((a, m) => a + m.compromiso, 0);
    const maxValor = Math.max(
      ...meses.map((m) => Math.max(m.compromiso, m.cobrado)),
      1
    );

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: PAD.top + innerH * (1 - t),
      label: fmtCompact(maxValor * t),
    }));

    const toPunto = (m: MesResumenAnual, valor: number): Punto => {
      const x = PAD.left + (innerW * m.mes) / 11;
      const y = yBase - (valor / maxValor) * innerH;
      return { x, y, valor, label: m.label };
    };

    const cobradoPts = enCurso.map((m) => toPunto(m, m.cobrado));
    const esperadoPts = enCurso.map((m) => toPunto(m, m.compromiso));

    const lineaCobrado = curvaSuave(cobradoPts);
    const lineaEsperado = curvaSuave(esperadoPts);
    const areaCobrado =
      cobradoPts.length > 0
        ? `${lineaCobrado} L ${cobradoPts[cobradoPts.length - 1].x} ${yBase} L ${cobradoPts[0].x} ${yBase} Z`
        : "";

    return {
      yTicks,
      cobradoPts,
      esperadoPts,
      lineaCobrado,
      lineaEsperado,
      areaCobrado,
      yBase,
      totalCobrado,
      totalEsperado,
    };
  }, [meses]);

  const tasa =
    chart.totalEsperado > 0
      ? Math.round((chart.totalCobrado / chart.totalEsperado) * 100)
      : 100;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-6 h-full flex flex-col min-h-0">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4 shrink-0">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Ingresos cobrados vs esperado
          </p>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Cobranza {anio}
          </h2>
          <div className="flex flex-wrap items-baseline gap-3 mt-2">
            <p className="text-2xl font-black text-violet-600 tabular-nums leading-none">
              ${chart.totalCobrado.toLocaleString("es-MX")}
            </p>
            <span className="text-[10px] font-bold text-slate-400">
              cobrado en {anio}
            </span>
            <span
              className={`text-[10px] font-black tabular-nums ${
                tasa >= 80 ? "text-emerald-600" : tasa >= 50 ? "text-amber-600" : "text-red-500"
              }`}
            >
              {tasa}% del esperado
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-[8px] font-black uppercase tracking-widest text-violet-700">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            Cobrado
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-dashed border-slate-300 bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-4 border-t border-dashed border-slate-400" />
            Esperado
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[180px] w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Ingresos cobrados versus esperado por mes en ${anio}`}
        >
          <defs>
            <linearGradient id={`grad-ing-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>

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

          {chart.areaCobrado && (
            <path d={chart.areaCobrado} fill={`url(#grad-ing-${uid})`} />
          )}
          <path
            d={chart.lineaEsperado}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <path
            d={chart.lineaCobrado}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {chart.cobradoPts.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill="white"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
              {p.valor > 0 && (
                <text
                  x={p.x}
                  y={H - 8}
                  textAnchor="middle"
                  className="fill-slate-500 text-[8px] font-black uppercase"
                >
                  {p.label}
                </text>
              )}
              <title>
                {p.label}: ${p.valor.toLocaleString("es-MX")} cobrado · $
                {chart.esperadoPts[i]?.valor.toLocaleString("es-MX") ?? 0}{" "}
                esperado
              </title>
            </g>
          ))}
        </svg>
      </div>

      <p className="text-[9px] font-bold text-slate-400 mt-3 text-center shrink-0">
        Área violeta = cobrado real · Punteada gris = esperado del mes
      </p>
    </div>
  );
}
