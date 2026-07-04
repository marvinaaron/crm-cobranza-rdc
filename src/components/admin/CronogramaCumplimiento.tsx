"use client";

import { useMemo } from "react";
import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  clienteActivoEnPeriodo,
} from "@/lib/clientes";
import {
  getFlujoCumplimiento,
  FLUJO_CUMPLIMIENTO_LABELS,
  type RegistroCumplimiento,
} from "@/lib/cumplimiento";
import { FLUJO_NUMERO, FLUJO_TONO } from "@/lib/cobranza-workflow";

type FlujoTono =
  | "slate"
  | "sky"
  | "amber"
  | "teal"
  | "violet"
  | "indigo"
  | "emerald";

const TONO_BG: Record<FlujoTono, string> = {
  slate: "bg-slate-100 text-slate-500",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  teal: "bg-teal-100 text-teal-700",
  violet: "bg-violet-100 text-violet-700",
  indigo: "bg-indigo-100 text-indigo-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

const TONO_BG_FUERTE: Record<FlujoTono, string> = {
  slate: "bg-slate-200 text-slate-600",
  sky: "bg-sky-200 text-sky-800",
  amber: "bg-amber-200 text-amber-800",
  teal: "bg-teal-200 text-teal-800",
  violet: "bg-violet-200 text-violet-800",
  indigo: "bg-indigo-200 text-indigo-800",
  emerald: "bg-emerald-500 text-white",
};

const MESES_ABREV = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

type Props = {
  clientes: Cliente[];
  periodo: Periodo;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
  onSelectClient?: (cliente: Cliente) => void;
};

export default function CronogramaCumplimiento({
  clientes,
  periodo,
  getCumplimientoPeriodo,
  onSelectClient,
}: Props) {
  const anio = periodo.anio;
  const mesActual = periodo.mes;

  const matriz = useMemo(() => {
    return clientes.map((cli) => {
      const pasos: (number | null)[] = [];
      for (let m = 0; m < 12; m++) {
        const p: Periodo = { mes: m, anio };
        if (!clienteActivoEnPeriodo(cli, p)) {
          pasos.push(null);
          continue;
        }
        const reg = getCumplimientoPeriodo(cli.id, p);
        const flujo = getFlujoCumplimiento(reg);
        pasos.push(FLUJO_NUMERO[flujo]);
      }
      return { cliente: cli, pasos };
    });
  }, [clientes, anio, getCumplimientoPeriodo]);

  const promediosPorMes = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const valores = matriz
        .map((r) => r.pasos[m])
        .filter((v): v is number => v !== null);
      if (valores.length === 0) return null;
      return Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10;
    });
  }, [matriz]);

  if (clientes.length === 0) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
        Sin clientes para mostrar en el cronograma
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0 min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 sticky left-0 bg-slate-50/95 z-10 min-w-[200px]">
                Contribuyente
              </th>
              {MESES_ABREV.map((label, i) => {
                const esMesActual = i === mesActual;
                return (
                  <th
                    key={i}
                    className={`px-1 py-3 text-[9px] font-black uppercase tracking-widest text-center min-w-[52px] ${
                      esMesActual
                        ? "text-indigo-600 bg-indigo-50/50"
                        : "text-slate-400"
                    }`}
                  >
                    {label}
                  </th>
                );
              })}
              <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center min-w-[44px]">
                Avg
              </th>
            </tr>
          </thead>
          <tbody>
            {matriz.map(({ cliente, pasos }) => {
              const pasosValidos = pasos.filter(
                (v): v is number => v !== null
              );
              const avg =
                pasosValidos.length > 0
                  ? Math.round(
                      (pasosValidos.reduce((a, b) => a + b, 0) /
                        pasosValidos.length) *
                        10
                    ) / 10
                  : null;

              return (
                <tr
                  key={cliente.id}
                  onClick={() => onSelectClient?.(cliente)}
                  className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 sticky left-0 bg-white z-10 group-hover:bg-slate-50/50">
                    <p className="text-[11px] font-black text-slate-800 truncate max-w-[190px]">
                      {cliente.razonSocial}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 tabular-nums">
                      {cliente.rfc}
                    </p>
                  </td>
                  {pasos.map((paso, m) => {
                    const esMesActual = m === mesActual;
                    if (paso === null) {
                      return (
                        <td
                          key={m}
                          className={`px-1 py-2.5 text-center ${
                            esMesActual ? "bg-indigo-50/30" : ""
                          }`}
                        >
                          <span className="text-[9px] text-slate-200">—</span>
                        </td>
                      );
                    }

                    const flujoKey = (
                      Object.entries(FLUJO_NUMERO) as [string, number][]
                    ).find(([, n]) => n === paso)?.[0] as string;
                    const tono = FLUJO_TONO[
                      flujoKey as keyof typeof FLUJO_TONO
                    ] as FlujoTono;
                    const esCompleto = paso === 7;
                    const colorClass = esCompleto
                      ? TONO_BG_FUERTE[tono]
                      : TONO_BG[tono];

                    return (
                      <td
                        key={m}
                        className={`px-1 py-2.5 text-center ${
                          esMesActual ? "bg-indigo-50/30" : ""
                        }`}
                      >
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-black tabular-nums ${colorClass}`}
                          title={`${MESES_NOM[m]}: Paso ${paso} — ${
                            FLUJO_CUMPLIMIENTO_LABELS[
                              flujoKey as keyof typeof FLUJO_CUMPLIMIENTO_LABELS
                            ] ?? ""
                          }`}
                        >
                          {paso}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-center">
                    {avg !== null ? (
                      <span
                        className={`text-[10px] font-black tabular-nums ${
                          avg >= 6.5
                            ? "text-emerald-600"
                            : avg >= 4
                              ? "text-amber-600"
                              : "text-slate-400"
                        }`}
                      >
                        {avg.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-200">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50/80">
              <td className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 sticky left-0 bg-slate-50/95 z-10">
                Promedio
              </td>
              {promediosPorMes.map((avg, m) => (
                <td
                  key={m}
                  className={`px-1 py-3 text-center ${
                    m === mesActual ? "bg-indigo-50/30" : ""
                  }`}
                >
                  {avg !== null ? (
                    <span
                      className={`text-[10px] font-black tabular-nums ${
                        avg >= 6.5
                          ? "text-emerald-600"
                          : avg >= 4
                            ? "text-amber-600"
                            : "text-slate-400"
                      }`}
                    >
                      {avg.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-200">—</span>
                  )}
                </td>
              ))}
              <td className="px-3 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-t border-slate-100">
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mr-1">
          Leyenda
        </span>
        {([1, 2, 3, 4, 5, 6, 7] as const).map((n) => {
          const flujoKey = (
            Object.entries(FLUJO_NUMERO) as [string, number][]
          ).find(([, v]) => v === n)?.[0] as string;
          const tono = FLUJO_TONO[
            flujoKey as keyof typeof FLUJO_TONO
          ] as FlujoTono;
          const label =
            FLUJO_CUMPLIMIENTO_LABELS[
              flujoKey as keyof typeof FLUJO_CUMPLIMIENTO_LABELS
            ] ?? "";
          return (
            <span
              key={n}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold ${
                n === 7 ? TONO_BG_FUERTE[tono] : TONO_BG[tono]
              }`}
            >
              {n} {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
