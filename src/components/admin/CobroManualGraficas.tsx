"use client";

import { useId, useMemo, useState } from "react";
import type {
  AgingBucketKey,
  AgingCartera,
  MesResumenAnual,
} from "@/lib/dashboard-metrics";
import type { AnillosCobroManual, FilaCobroManual } from "@/lib/cobro-manual";
import AnilloHerradura, { type AnilloVista } from "@/components/admin/AnilloHerradura";
import { tonoAvance, pctSafe } from "@/lib/dashboard-anillos";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

type Punto = { x: number; y: number; valor: number };

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

const W = 640;
const H = 200;
const PAD = { top: 10, right: 16, bottom: 24, left: 16 };

export function GraficoCobranzaAnio({
  meses,
  anio,
}: {
  meses: MesResumenAnual[];
  anio: number;
}) {
  const uid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const visibles = meses.filter((m) => m.enCurso);

  const chart = useMemo(() => {
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const max = Math.max(
      1,
      ...visibles.map((m) => Math.max(m.ingresoBancario, m.compromiso))
    );
    const n = Math.max(1, visibles.length);
    const xDe = (i: number) => PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const yDe = (v: number) => PAD.top + innerH - (v / max) * innerH;
    const cobrado: Punto[] = visibles.map((m, i) => ({
      x: xDe(i),
      y: yDe(m.ingresoBancario),
      valor: m.ingresoBancario,
    }));
    const pendiente: Punto[] = visibles.map((m, i) => ({
      x: xDe(i),
      y: yDe(m.compromiso),
      valor: m.compromiso,
    }));
    const cobradoTotal = visibles.reduce((a, m) => a + m.ingresoBancario, 0);
    const compromisoTotal = visibles.reduce((a, m) => a + m.compromiso, 0);
    const tasa =
      compromisoTotal > 0 ? Math.round((cobradoTotal / compromisoTotal) * 100) : 0;
    return { cobrado, pendiente, cobradoTotal, tasa, xDe, innerH };
  }, [visibles]);

  const area = (pts: Punto[]) => {
    if (pts.length === 0) return "";
    const base = PAD.top + chart.innerH;
    return `${curvaSuave(pts)} L ${pts[pts.length - 1].x} ${base} L ${pts[0].x} ${base} Z`;
  };

  const hoverMes = hover != null ? visibles[hover] : null;

  return (
    <div className="rounded-[1.25rem] bg-white h-full overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-500">
            Ingreso en banco vs esperado
          </p>
          <p className="mt-1 text-[22px] font-bold tabular-nums tracking-tight text-slate-900 leading-none">
            {fmt(chart.cobradoTotal)}
          </p>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {chart.tasa}% del esperado · misma cifra que Inicio
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] font-medium text-slate-500 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-slate-800" />
            En banco
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-slate-300" />
            Esperado
          </span>
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-slate-400">Sin meses en curso</p>
      ) : (
        <div className="relative px-0.5 pb-2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-[172px] sm:h-[188px]"
            role="img"
            aria-label={`Ingreso en banco versus esperado por mes en ${anio}`}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={`g-cob-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id={`g-pen-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={area(chart.pendiente)} fill={`url(#g-pen-${uid})`} />
            <path d={area(chart.cobrado)} fill={`url(#g-cob-${uid})`} />
            <path
              d={curvaSuave(chart.pendiente)}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
            />
            <path
              d={curvaSuave(chart.cobrado)}
              fill="none"
              stroke="#1e293b"
              strokeWidth="2.2"
            />
            {visibles.map((m, i) => (
              <g key={m.mes}>
                <rect
                  x={chart.xDe(i) - 18}
                  y={PAD.top}
                  width="36"
                  height={chart.innerH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                />
                <text
                  x={chart.xDe(i)}
                  y={H - 8}
                  textAnchor="middle"
                  className="fill-slate-400"
                  fontSize="11"
                  fontWeight="600"
                >
                  {m.label}
                </text>
              </g>
            ))}
            {hover != null && chart.cobrado[hover] ? (
              <>
                <circle
                  cx={chart.cobrado[hover].x}
                  cy={chart.cobrado[hover].y}
                  r="4"
                  fill="#1e293b"
                />
                <circle
                  cx={chart.pendiente[hover].x}
                  cy={chart.pendiente[hover].y}
                  r="4"
                  fill="#94a3b8"
                />
              </>
            ) : null}
          </svg>
          {hoverMes ? (
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-2 rounded-xl bg-slate-900 text-white px-3 py-2 text-[12px] shadow-lg">
              <p className="font-semibold">{hoverMes.label} {anio}</p>
              <p className="text-slate-200 tabular-nums">
                En banco {fmt(hoverMes.ingresoBancario)}
              </p>
              <p className="text-slate-400 tabular-nums">
                Esperado {fmt(hoverMes.compromiso)}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export const BARRAS_AGING: Array<{
  key: AgingBucketKey;
  label: string;
  color: string;
}> = [
  { key: "enCurso", label: "Vigente", color: "bg-slate-200" },
  { key: "d1_30", label: "1 mes", color: "bg-slate-400" },
  { key: "d31_60", label: "2 meses", color: "bg-slate-600" },
  { key: "d61_plus", label: "3+ meses", color: "bg-slate-800" },
];

export function GraficoCarteraVencida({
  aging,
  seleccionado,
  onSeleccionar,
}: {
  aging: AgingCartera;
  seleccionado?: AgingBucketKey | null;
  onSeleccionar?: (key: AgingBucketKey | null) => void;
}) {
  const max = Math.max(
    1,
    aging.enCurso,
    aging.d1_30,
    aging.d31_60,
    aging.d61_plus
  );

  return (
    <div className="rounded-[1.25rem] bg-white p-4 sm:p-5 h-full">
      <p className="text-[11px] font-semibold text-slate-500">Cartera vencida</p>
      <p className="mt-1 text-[22px] font-bold tabular-nums tracking-tight text-slate-900 leading-none">
        {fmt(aging.total)}
      </p>
      <p className="mt-1.5 text-[11px] text-slate-400">
        {seleccionado
          ? "Filtro en el listado · toca otra vez para quitar"
          : "Toca una barra para filtrar el listado"}
      </p>

      {aging.total === 0 ? (
        <p className="py-10 text-center text-[13px] text-slate-500 font-semibold">
          Cartera al día
        </p>
      ) : (
        <div className="mt-4 flex items-end gap-2 h-[140px] sm:h-[160px]">
          {BARRAS_AGING.map((b) => {
            const valor = aging[b.key];
            const pct = (valor / max) * 100;
            const activa = seleccionado === b.key;
            return (
              <button
                key={b.key}
                type="button"
                onClick={() =>
                  onSeleccionar?.(activa ? null : b.key)
                }
                className={`flex-1 min-w-0 flex flex-col items-center h-full rounded-xl px-0.5 pt-0.5 transition-colors ${
                  activa ? "bg-slate-50 ring-1 ring-slate-300" : "hover:bg-slate-50/80"
                }`}
                title={`${b.label}: ${fmt(valor)}`}
                aria-pressed={activa}
              >
                <p className="text-[11px] font-semibold tabular-nums text-slate-600 mb-1">
                  {fmtCompact(valor)}
                </p>
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t-lg ${b.color}`}
                    style={{ height: `${Math.max(valor > 0 ? 8 : 0, pct)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] font-medium text-slate-400 text-center leading-tight">
                  {b.label}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AnillosCobroCard({
  anillos,
  filtro,
  onFiltro,
}: {
  anillos: AnillosCobroManual;
  filtro: string | null;
  onFiltro: (id: string | null) => void;
}) {
  const vista: AnilloVista[] = [
    {
      id: "cobrado",
      label: "Cobrado",
      centro: `${anillos.tasa}%`,
      pie:
        anillos.compromiso > 0
          ? `${fmt(anillos.cobrado)} de ${fmt(anillos.compromiso)}`
          : "Sin compromiso",
      pct: anillos.tasa,
      tono: tonoAvance(anillos.tasa),
      onClick: () => onFiltro(filtro === "cobrado" ? null : "cobrado"),
    },
    {
      id: "pagaron",
      label: "Pagaron",
      centro: String(anillos.pagaron),
      pie:
        anillos.cartera > 0
          ? `${anillos.pagaron} de ${anillos.cartera}`
          : "Sin clientes",
      pct: pctSafe(anillos.pagaron, anillos.cartera),
      tono: tonoAvance(pctSafe(anillos.pagaron, anillos.cartera)),
      onClick: () => onFiltro(filtro === "pagaron" ? null : "pagaron"),
    },
    {
      id: "factura",
      label: "Factura",
      centro: String(anillos.facturados),
      pie:
        anillos.cartera > 0
          ? `${anillos.facturados} de ${anillos.cartera}`
          : "Sin clientes",
      pct: pctSafe(anillos.facturados, anillos.cartera),
      tono: tonoAvance(pctSafe(anillos.facturados, anillos.cartera)),
      onClick: () => onFiltro(filtro === "factura" ? null : "factura"),
    },
    {
      id: "al-dia",
      label: "Al día",
      centro: String(anillos.alDia),
      pie:
        anillos.cartera > 0
          ? `${anillos.alDia} de ${anillos.cartera}`
          : "Sin clientes",
      pct: pctSafe(anillos.alDia, anillos.cartera),
      tono: tonoAvance(pctSafe(anillos.alDia, anillos.cartera)),
      onClick: () => onFiltro(filtro === "al-dia" ? null : "al-dia"),
    },
  ];

  return (
    <div className="rounded-[1.25rem] bg-white overflow-hidden h-full flex items-center px-1.5 py-3 sm:px-2 sm:py-4">
      <div className="grid grid-cols-2 gap-y-2 w-full">
        {vista.map((a, i) => (
          <div
            key={a.id}
            className={`rounded-xl ${filtro === a.id ? "bg-slate-50" : ""}`}
          >
            <AnilloHerradura anillo={a} delayMs={i * 70} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CobranzaPorCliente({
  filas,
}: {
  filas: Pick<FilaCobroManual, "cliente" | "monto">[];
}) {
  const ordenadas = filas.slice().sort((a, b) => b.monto - a.monto);
  const total = ordenadas.reduce((a, f) => a + f.monto, 0);
  const ancho = Math.max(
    1,
    ...[total, ...ordenadas.map((f) => f.monto)].map(
      (n) => n.toLocaleString("es-MX", { maximumFractionDigits: 0 }).length
    )
  );

  return (
    <div className="rounded-[1.25rem] bg-white p-4 sm:p-5 h-full flex flex-col">
      <p className="text-[15px] font-semibold text-slate-800">Cobranza por Cliente</p>
      {ordenadas.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Sin saldos</p>
      ) : (
        <>
          <ul className="mt-3 min-h-0 overflow-y-auto max-h-[28rem]">
            {ordenadas.map((f) => (
              <li
                key={f.cliente.id}
                className="flex items-baseline justify-between gap-4 py-[5px]"
              >
                <p className="min-w-0 truncate text-[13px] text-slate-600">
                  {f.cliente.razonSocial}
                </p>
                <p className="shrink-0 inline-flex items-baseline text-[13px] tabular-nums text-slate-900">
                  <span>$</span>
                  <span className="text-right" style={{ width: `${ancho}ch` }}>
                    {f.monto.toLocaleString("es-MX", { maximumFractionDigits: 0 })}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between gap-4">
            <p className="text-[13px] font-semibold text-slate-800">
              Total · {ordenadas.length}
            </p>
            <p className="shrink-0 inline-flex items-baseline text-[13px] font-semibold tabular-nums text-slate-900">
              <span>$</span>
              <span className="text-right" style={{ width: `${ancho}ch` }}>
                {total.toLocaleString("es-MX", { maximumFractionDigits: 0 })}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
