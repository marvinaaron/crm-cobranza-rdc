"use client";

import { useCallback, useId, useMemo, useState } from "react";
import type { PuntoTendenciaMes } from "@/lib/cfdi/resumen-mes";
import { portalCard, portalCardTitle } from "@/components/portal/portal-ui";

type Props = {
  puntos: PuntoTendenciaMes[];
  /** @deprecated Preferir `mesesActivos`. */
  mesActivo?: number;
  mesesActivos?: number[];
  anio: number;
};

const W = 400;
const H = 200;
const PAD = { top: 14, right: 10, bottom: 28, left: 42 };

/** Mismos colores que los totales del encabezado. */
const COLOR_INGRESOS = "#06b6d4"; // cyan-500
const COLOR_EGRESOS = "#1e3a8a"; // blue-900 (navy)
const COLOR_EGRESOS_SOFT = "#1e40af";

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  if (n === 0) return "$0";
  return `$${Math.round(n)}`;
}

function fmtMxn(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function lineaPolyline(puntos: { x: number; y: number }[]): string {
  if (puntos.length === 0) return "";
  return puntos.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function areaPath(
  puntos: { x: number; y: number }[],
  baselineY: number
): string {
  if (puntos.length === 0) return "";
  const line = lineaPolyline(puntos);
  const last = puntos[puntos.length - 1];
  const first = puntos[0];
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export default function GraficoIngresosEgresos({
  puntos,
  mesActivo,
  mesesActivos,
  anio,
}: Props) {
  const gradId = useId().replace(/:/g, "");
  const activos = new Set(
    mesesActivos?.length ? mesesActivos : mesActivo != null ? [mesActivo] : []
  );
  const [focusMes, setFocusMes] = useState<number | null>(null);

  const totalIngresos = useMemo(
    () => puntos.reduce((s, p) => s + (p.ingresos || 0), 0),
    [puntos]
  );
  const totalEgresos = useMemo(
    () => puntos.reduce((s, p) => s + (p.egresos || 0), 0),
    [puntos]
  );

  const chart = useMemo(() => {
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const maxVal = Math.max(
      1,
      ...puntos.flatMap((p) => [p.ingresos, p.egresos])
    );
    const baselineY = PAD.top + plotH;

    const toY = (v: number) => PAD.top + plotH - (v / maxVal) * plotH;
    const toX = (i: number) =>
      PAD.left +
      (puntos.length <= 1 ? plotW / 2 : (i / (puntos.length - 1)) * plotW);

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

    // 5 líneas de guía: 0 · 25% · 50% · 75% · 100%
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      y: PAD.top + plotH * (1 - f),
      label: fmtCompact(maxVal * f),
      f,
    }));

    const colW =
      puntos.length <= 1 ? plotW : plotW / Math.max(1, puntos.length - 1);

    return {
      ingresosPts,
      egresosPts,
      yTicks,
      maxVal,
      baselineY,
      toX,
      colW,
      plotW,
    };
  }, [puntos]);

  const sinDatos = puntos.every((p) => p.ingresos === 0 && p.egresos === 0);
  const puntoFocus =
    focusMes != null ? puntos.find((p) => p.mes === focusMes) : null;
  const idxFocus =
    focusMes != null ? puntos.findIndex((p) => p.mes === focusMes) : -1;

  const toggleMes = useCallback((mes: number) => {
    setFocusMes((prev) => (prev === mes ? null : mes));
  }, []);

  return (
    <section className={`${portalCard} !rounded-2xl !p-4 sm:!p-5 flex flex-col h-full`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className={portalCardTitle}>Ingresos vs egresos · {anio}</p>
        <div className="flex items-baseline gap-3 sm:gap-4 ml-auto">
          <p className={`${portalCardTitle} !text-cyan-600 tabular-nums`}>
            Ing {fmtMxn(totalIngresos)}
          </p>
          <p className={`${portalCardTitle} !text-blue-900 tabular-nums`}>
            Gas {fmtMxn(totalEgresos)}
          </p>
        </div>
      </div>

      {sinDatos ? (
        <div className="flex-1 flex items-center justify-center text-center px-4 py-8">
          <p className="text-xs font-semibold text-slate-400">
            Sin movimientos en {anio} para graficar
          </p>
        </div>
      ) : (
        <div className="relative mt-2 flex-1 w-full min-h-[180px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full min-h-[180px]"
            role="img"
            aria-label={`Gráfica de ingresos y egresos por mes en ${anio}`}
          >
            <defs>
              <linearGradient
                id={`ing-${gradId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={COLOR_INGRESOS} stopOpacity="0.28" />
                <stop offset="100%" stopColor={COLOR_INGRESOS} stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id={`egr-${gradId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={COLOR_EGRESOS} stopOpacity="0.2" />
                <stop offset="100%" stopColor={COLOR_EGRESOS} stopOpacity="0" />
              </linearGradient>
            </defs>

            {chart.yTicks.map((tick) => (
              <g key={tick.f}>
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
                  className="fill-slate-400 text-[8px] font-semibold"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            <path
              d={areaPath(chart.ingresosPts, chart.baselineY)}
              fill={`url(#ing-${gradId})`}
            />
            <path
              d={areaPath(chart.egresosPts, chart.baselineY)}
              fill={`url(#egr-${gradId})`}
            />

            <path
              d={lineaPolyline(chart.ingresosPts)}
              fill="none"
              stroke={COLOR_INGRESOS}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={lineaPolyline(chart.egresosPts)}
              fill="none"
              stroke={COLOR_EGRESOS}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {chart.ingresosPts.map((p, i) => (
              <circle
                key={`ing-${i}`}
                cx={p.x}
                cy={p.y}
                r={
                  focusMes === p.mes || activos.has(p.mes) ? 4.5 : 2.5
                }
                fill={COLOR_INGRESOS}
                opacity={focusMes != null && focusMes !== p.mes ? 0.35 : 1}
              />
            ))}
            {chart.egresosPts.map((p, i) => (
              <circle
                key={`egr-${i}`}
                cx={p.x}
                cy={p.y}
                r={
                  focusMes === p.mes || activos.has(p.mes) ? 4.5 : 2.5
                }
                fill={COLOR_EGRESOS_SOFT}
                opacity={focusMes != null && focusMes !== p.mes ? 0.35 : 1}
              />
            ))}

            {/* Zonas táctiles por mes */}
            {puntos.map((p, i) => {
              const x = chart.toX(i);
              const half =
                puntos.length <= 1
                  ? chart.plotW / 2
                  : chart.colW / 2;
              const activar = () => toggleMes(p.mes);
              return (
                <rect
                  key={`hit-${p.mes}`}
                  x={x - half}
                  y={PAD.top}
                  width={Math.max(half * 2, 18)}
                  height={H - PAD.top - 4}
                  fill="transparent"
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.label} ${anio}: ingresos ${fmtMxn(p.ingresos)}, gastos ${fmtMxn(p.egresos)}`}
                  onMouseEnter={() => setFocusMes(p.mes)}
                  onMouseLeave={() => setFocusMes(null)}
                  onFocus={() => setFocusMes(p.mes)}
                  onBlur={() => setFocusMes(null)}
                  onClick={activar}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      activar();
                    }
                  }}
                />
              );
            })}

            {puntos.map((p, i) => {
              const x = chart.toX(i);
              const activo = activos.has(p.mes) || focusMes === p.mes;
              return (
                <text
                  key={p.mes}
                  x={x}
                  y={H - 6}
                  textAnchor="middle"
                  className={`text-[8px] font-bold pointer-events-none ${
                    activo ? "fill-slate-900" : "fill-slate-400"
                  }`}
                >
                  {p.label}
                </text>
              );
            })}
          </svg>

          {puntoFocus && idxFocus >= 0 && (
            <div
              className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white/95 shadow-lg px-2.5 py-2 min-w-[7.5rem]"
              style={{
                left: `${(chart.toX(idxFocus) / W) * 100}%`,
                top: "12%",
                transform:
                  idxFocus > puntos.length / 2
                    ? "translateX(-100%)"
                    : "translateX(0)",
              }}
            >
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                {puntoFocus.label} {anio}
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-bold text-cyan-600">Ing</span>
                  <span className="text-[11px] font-black tabular-nums text-cyan-700">
                    {fmtMxn(puntoFocus.ingresos)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-bold text-blue-900">Gas</span>
                  <span className="text-[11px] font-black tabular-nums text-blue-900">
                    {fmtMxn(puntoFocus.egresos)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
