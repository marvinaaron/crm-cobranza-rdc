"use client";

import type { AgingCartera } from "@/lib/dashboard-metrics";

/**
 * Gráfica de aging de cartera: barras horizontales segmentadas por
 * antigüedad de la deuda. Permite ver de un vistazo cuánto saldo es
 * "fresco" (mes en curso) y cuánto ya es deuda vieja difícil de cobrar.
 *
 * Segmentos:
 *  - En curso (mes actual)        → emerald
 *  - 1 mes vencido                → amber
 *  - 2 meses vencidos             → orange
 *  - 3+ meses vencidos            → red
 */
type Props = {
  aging: AgingCartera;
};

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

const SEGMENTOS = [
  {
    key: "enCurso" as const,
    label: "En curso",
    descripcion: "Mes actual",
    color: "bg-emerald-500",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    key: "d1_30" as const,
    label: "1 mes vencido",
    descripcion: "1-30 días",
    color: "bg-amber-400",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  {
    key: "d31_60" as const,
    label: "2 meses vencidos",
    descripcion: "31-60 días",
    color: "bg-orange-500",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  {
    key: "d61_plus" as const,
    label: "3+ meses vencidos",
    descripcion: "60+ días",
    color: "bg-red-600",
    text: "text-red-700",
    dot: "bg-red-600",
  },
];

export default function GraficoAgingCartera({ aging }: Props) {
  const total = aging.total;
  const sinDeuda = total === 0;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-6 h-full flex flex-col">
      <div className="mb-4">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Antigüedad del saldo (aging)
        </p>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
          Cartera por antigüedad
        </h2>
        <div className="flex items-baseline gap-3 mt-2">
          <p
            className={`text-2xl font-black tabular-nums leading-none ${
              sinDeuda ? "text-emerald-600" : "text-slate-800"
            }`}
          >
            {fmt(total)}
          </p>
          <span className="text-[10px] font-bold text-slate-400">
            saldo total pendiente
          </span>
        </div>
      </div>

      {sinDeuda ? (
        <div className="flex-1 flex items-center justify-center text-center py-8">
          <div>
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-sm font-black text-emerald-700 uppercase tracking-wider">
              Cartera al día
            </p>
            <p className="text-xs text-slate-400 mt-1">
              No hay saldos pendientes en ningún cliente
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Barra apilada horizontal. */}
          <div className="h-6 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-50 ring-1 ring-slate-100 mb-5">
            {SEGMENTOS.map((seg) => {
              const valor = aging[seg.key];
              if (valor <= 0) return null;
              const pct = (valor / total) * 100;
              return (
                <div
                  key={seg.key}
                  className={`${seg.color} h-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                  title={`${seg.label}: ${fmt(valor)} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>

          {/* Lista de segmentos. */}
          <div className="space-y-3 flex-1">
            {SEGMENTOS.map((seg) => {
              const valor = aging[seg.key];
              const pct = total > 0 ? (valor / total) * 100 : 0;
              return (
                <div
                  key={seg.key}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-3 h-3 rounded-sm ${seg.dot}`} />
                    <div className="min-w-0">
                      <p
                        className={`text-[11px] font-black uppercase tracking-wider ${seg.text}`}
                      >
                        {seg.label}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400">
                        {seg.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-800 tabular-nums">
                      {fmt(valor)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 tabular-nums">
                      {pct.toFixed(0)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
