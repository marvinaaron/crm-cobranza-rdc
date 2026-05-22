"use client";

import { useClientes } from "@/context/ClientesContext";
import { MESES_NOM, periodoLabel, esMismoPeriodo } from "@/lib/clientes";

const ChevronUpDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
);

type Props = {
  /** En portal: periodo fiscal = mes vencido (en mayo se consulta abril). */
  modoFiscal?: boolean;
};

export default function PeriodoSelector({ modoFiscal = false }: Props) {
  const {
    periodo,
    periodoHoy,
    periodoFiscalVigente,
    setPeriodoMes,
    setPeriodoAnio,
    irAPeriodoActual,
    irAPeriodoFiscalVigente,
    aniosDisponibles,
  } = useClientes();

  const referencia = modoFiscal ? periodoFiscalVigente : periodoHoy;
  const viendoReferencia = esMismoPeriodo(periodo, referencia);

  return (
    <div className="px-4 pb-4">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
        {modoFiscal ? "Periodo fiscal" : "Periodo de consulta"}
      </p>

      <div className="space-y-2">
        <div className="relative">
          <select
            value={periodo.mes}
            onChange={(e) => setPeriodoMes(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 pr-8 text-[12px] font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-100"
          >
            {MESES_NOM.map((nombre, i) => (
              <option key={nombre} value={i}>
                {nombre}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronUpDown />
          </div>
        </div>

        <div className="relative">
          <select
            value={periodo.anio}
            onChange={(e) => setPeriodoAnio(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 pr-8 text-[12px] font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-100"
          >
            {aniosDisponibles.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronUpDown />
          </div>
        </div>
      </div>

      <p className="text-[10px] font-bold text-slate-500 mt-3 leading-snug">
        Viendo: <span className="text-blue-600">{periodoLabel(periodo)}</span>
      </p>

      {modoFiscal && (
        <p className="text-[9px] font-bold text-slate-400 mt-1 leading-snug">
          Vigente: {periodoLabel(periodoFiscalVigente)} (mes vencido)
        </p>
      )}

      {!viendoReferencia && (
        <button
          type="button"
          onClick={modoFiscal ? irAPeriodoFiscalVigente : irAPeriodoActual}
          className="mt-2 w-full text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition-colors"
        >
          {modoFiscal
            ? `Periodo vigente (${periodoLabel(periodoFiscalVigente)})`
            : `Ir a hoy (${periodoLabel(periodoHoy)})`}
        </button>
      )}
    </div>
  );
}
