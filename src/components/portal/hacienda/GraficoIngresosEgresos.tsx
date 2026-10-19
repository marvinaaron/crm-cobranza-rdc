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
  /** Traza línea y puntos solo en `mesesActivos`; el eje X sigue mostrando todos. */
  lineaSoloActivos?: boolean;
};

const W = 400;
const H = 200;
const PAD = { top: 14, right: 10, bottom: 28, left: 42 };

/** Mismos colores que los totales del encabezado. */
const COLOR_INGRESOS = "#06b6d4"; // cyan-500
const COLOR_EGRESOS = "#1e3a8a"; // blue-900 (navy)
const COLOR_EGRESOS_SOFT = "#1e40af";
const COLOR_NOMINA = "#7c3aed"; // violet-600

function fmtCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return Number.isInteger(k) ? `$${k}k` : `$${k.toFixed(1)}k`;
  }
  if (n === 0) return "$0";
  return `$${Math.round(n)}`;
}

function niceMax(n: number): number {
  if (n <= 0) return 1;
  if (n <= 1_000) return Math.ceil(n / 200) * 200 || 200;
  const step = n <= 10_000 ? 2_000 : n <= 50_000 ? 10_000 : 25_000;
  return Math.ceil(n / step) * step;
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
  lineaSoloActivos = false,
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
  const totalNomina = useMemo(
    () => puntos.reduce((s, p) => s + (p.nomina || 0), 0),
    [puntos]
  );
  const hayNomina = puntos.some((p) => (p.nomina || 0) !== 0);

  const chart = useMemo(() => {
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const crudo = Math.max(
      1,
      ...puntos.flatMap((p) => [p.ingresos, p.egresos, p.nomina || 0])
    );
    const maxVal = niceMax(crudo);
    const baselineY = PAD.top + plotH;

    const toY = (v: number) => PAD.top + plotH - (v / maxVal) * plotH;
    const toX = (i: number) =>
      PAD.left +
      (puntos.length <= 1 ? plotW / 2 : (i / (puntos.length - 1)) * plotW);

    const enLinea = (mes: number) =>
      !lineaSoloActivos || activos.has(mes);

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
    const nominaPts = puntos.map((p, i) => ({
      x: toX(i),
      y: toY(p.nomina || 0),
      valor: p.nomina || 0,
      mes: p.mes,
    }));
    const ingresosLinea = ingresosPts.filter((p) => enLinea(p.mes));
    const egresosLinea = egresosPts.filter((p) => enLinea(p.mes));
    const nominaLinea = nominaPts.filter((p) => enLinea(p.mes));

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
      nominaPts,
      ingresosLinea,
      egresosLinea,
      nominaLinea,
      yTicks,
      maxVal,
      baselineY,
      toX,
      colW,
      plotW,
    };
  }, [puntos, lineaSoloActivos, mesesActivos, mesActivo]);

  const sinDatos = puntos.every(
    (p) => p.ingresos === 0 && p.egresos === 0 && (p.nomina || 0) === 0
  );
  const puntoFocus =
    focusMes != null ? puntos.find((p) => p.mes === focusMes) : null;
  const idxFocus =
    focusMes != null ? puntos.findIndex((p) => p.mes === focusMes) : -1;

  const toggleMes = useCallback((mes: number) => {
    setFocusMes((prev) => (prev === mes ? null : mes));
  }, []);

  return (
    <section className={`${portalCard} !rounded-[1.25rem] !p-4 sm:!p-5 flex flex-col`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className={portalCardTitle}>Ingresos vs gastos · {anio}</p>
        <div className="flex items-baseline gap-3 sm:gap-4 ml-auto flex-wrap justify-end">
          <p className={`${portalCardTitle} !text-cyan-600 tabular-nums`}>
            Ingresos {fmtMxn(totalIngresos)}
          </p>
          <p className={`${portalCardTitle} !text-blue-900 tabular-nums`}>
            Gastos {fmtMxn(totalEgresos)}
          </p>
          {hayNomina && (
            <p className={`${portalCardTitle} !text-violet-600 tabular-nums`}>
              Nómina {fmtMxn(totalNomina)}
            </p>
          )}
        </div>
      </div>

      {sinDatos ? (
        <div className="flex-1 flex items-center justify-center text-center px-4 py-8">
          <p className="text-xs font-semibold text-slate-400">
            Sin movimientos en {anio} para graficar
          </p>
        </div>
      ) : (
        <div className="relative mt-2 w-full h-[172px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full"
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
              <linearGradient
                id={`nom-${gradId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={COLOR_NOMINA} stopOpacity="0.18" />
                <stop offset="100%" stopColor={COLOR_NOMINA} stopOpacity="0" />
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
              d={areaPath(chart.ingresosLinea, chart.baselineY)}
              fill={`url(#ing-${gradId})`}
            />
            <path
              d={areaPath(chart.egresosLinea, chart.baselineY)}
              fill={`url(#egr-${gradId})`}
            />
            {hayNomina && (
              <path
                d={areaPath(chart.nominaLinea, chart.baselineY)}
                fill={`url(#nom-${gradId})`}
              />
            )}

            <path
              d={lineaPolyline(chart.ingresosLinea)}
              fill="none"
              stroke={COLOR_INGRESOS}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={lineaPolyline(chart.egresosLinea)}
              fill="none"
              stroke={COLOR_EGRESOS}
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {hayNomina && (
              <path
                d={lineaPolyline(chart.nominaLinea)}
                fill="none"
                stroke={COLOR_NOMINA}
                strokeWidth="0.95"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {chart.ingresosLinea.map((p) => (
              <circle
                key={`ing-${p.mes}`}
                cx={p.x}
                cy={p.y}
                r={
                  focusMes === p.mes || activos.has(p.mes) ? 3.5 : 2
                }
                fill={COLOR_INGRESOS}
                opacity={focusMes != null && focusMes !== p.mes ? 0.35 : 1}
              />
            ))}
            {chart.egresosLinea.map((p) => (
              <circle
                key={`egr-${p.mes}`}
                cx={p.x}
                cy={p.y}
                r={
                  focusMes === p.mes || activos.has(p.mes) ? 3.5 : 2
                }
                fill={COLOR_EGRESOS_SOFT}
                opacity={focusMes != null && focusMes !== p.mes ? 0.35 : 1}
              />
            ))}
            {hayNomina &&
              chart.nominaLinea.map((p) => (
                <circle
                  key={`nom-${p.mes}`}
                  cx={p.x}
                  cy={p.y}
                  r={
                    focusMes === p.mes || activos.has(p.mes) ? 3 : 1.75
                  }
                  fill={COLOR_NOMINA}
                  opacity={focusMes != null && focusMes !== p.mes ? 0.35 : 1}
                />
              ))}

            {/* Zonas táctiles por mes */}
            {puntos.map((p, i) => {
              if (lineaSoloActivos && !activos.has(p.mes)) return null;
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
                  aria-label={`${p.label} ${anio}: ingresos ${fmtMxn(p.ingresos)}, gastos ${fmtMxn(p.egresos)}${
                    hayNomina ? `, nómina ${fmtMxn(p.nomina || 0)}` : ""
                  }`}
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
                  <span className="text-[9px] font-bold text-cyan-600">Ingresos</span>
                  <span className="text-[11px] font-black tabular-nums text-cyan-700">
                    {fmtMxn(puntoFocus.ingresos)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-bold text-blue-900">Gastos</span>
                  <span className="text-[11px] font-black tabular-nums text-blue-900">
                    {fmtMxn(puntoFocus.egresos)}
                  </span>
                </div>
                {hayNomina && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-bold text-violet-600">Nómina</span>
                    <span className="text-[11px] font-black tabular-nums text-violet-700">
                      {fmtMxn(puntoFocus.nomina || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
