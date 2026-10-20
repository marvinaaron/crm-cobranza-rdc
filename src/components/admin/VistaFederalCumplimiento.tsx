"use client";

import { useMemo } from "react";
import {
  type Cliente,
  type Periodo,
  MESES_NOM,
} from "@/lib/clientes";
import {
  type RegistroCumplimiento,
  formatMontoImpuesto,
} from "@/lib/cumplimiento";
import DiaContabilidadCircle from "@/components/admin/DiaContabilidadCircle";
import {
  MESES_ABREV_FEDERAL,
  UMBRAL_DESFASE_FEDERAL,
  construirMatrizFederalAnual,
  formatMontoFederalCorto,
  formatPctDesfaseFederal,
  totalesMesFederal,
} from "@/lib/cumplimiento-federal-anual";

type Props = {
  clientes: Cliente[];
  periodo: Periodo;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
  onSelectClient?: (cliente: Cliente) => void;
};

export default function VistaFederalCumplimiento({
  clientes,
  periodo,
  getCumplimientoPeriodo,
  onSelectClient,
}: Props) {
  const anio = periodo.anio;
  const mesActual = periodo.mes;

  const matriz = useMemo(
    () => construirMatrizFederalAnual(clientes, anio, getCumplimientoPeriodo),
    [clientes, anio, getCumplimientoPeriodo]
  );

  const totalesMes = useMemo(() => totalesMesFederal(matriz), [matriz]);
  const granTotal = useMemo(
    () => totalesMes.reduce((a, b) => a + b, 0),
    [totalesMes]
  );

  if (clientes.length === 0) {
    return (
      <div className="rounded-[1.25rem] bg-white ring-1 ring-slate-200 p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
        Sin clientes para mostrar en la vista federal
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[1.25rem] border border-slate-50 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">
            Impuestos federales {anio}
          </p>
          <p className="text-sm font-black text-slate-800 mt-0.5">
            Importe SAT a cargo por mes (ENE–DIC)
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-1 max-w-2xl">
            Cargo federal menos saldo a favor (negativo = a favor). Verde = pago
            validado. Ámbar = publicado sin validar. Teal = saldo a favor. La
            flecha marca un desfase de {Math.round(UMBRAL_DESFASE_FEDERAL * 100)}% o más
            vs. el mes anterior.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Suma del año
          </p>
          <p className="text-lg font-black tabular-nums text-slate-800">
            {formatMontoImpuesto(granTotal)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0 min-w-[1080px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 sticky left-0 bg-slate-50/95 z-10 min-w-[200px]">
                Contribuyente
              </th>
              {MESES_ABREV_FEDERAL.map((label, i) => (
                <th
                  key={i}
                  className={`px-1.5 py-3 text-[9px] font-black uppercase tracking-widest text-center min-w-[72px] ${
                    i === mesActual
                      ? "text-blue-600 bg-blue-50/50"
                      : "text-slate-400"
                  }`}
                >
                  {label}
                </th>
              ))}
              <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right min-w-[88px]">
                Anual
              </th>
            </tr>
          </thead>
          <tbody>
            {matriz.map(({ cliente, celdas, anual }) => (
              <tr
                key={cliente.id}
                onClick={() => onSelectClient?.(cliente)}
                className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black text-slate-800 truncate max-w-[150px]">
                        {cliente.razonSocial}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 tabular-nums">
                        {cliente.rfc}
                      </p>
                    </div>
                    <DiaContabilidadCircle cliente={cliente} size="xs" />
                  </div>
                </td>
                {celdas.map((c, m) => {
                  const esMesActual = m === mesActual;
                  const fondo = esMesActual ? "bg-blue-50/30" : "";
                  const td = `relative h-8 px-1.5 text-center align-middle ${fondo}`;
                  if (c.inactivo) {
                    return (
                      <td key={m} className={td}>
                        <span className="text-[9px] text-slate-200">—</span>
                      </td>
                    );
                  }
                  if (c.sinPago && c.monto === 0) {
                    return (
                      <td
                        key={m}
                        className={td}
                        title={`${MESES_NOM[m]} · sin pago de impuestos`}
                      >
                        <span className="text-[11px] font-black tabular-nums leading-none text-slate-300">
                          0
                        </span>
                      </td>
                    );
                  }
                  if (c.monto === 0) {
                    return (
                      <td key={m} className={td}>
                        <span className="text-[9px] text-slate-200">—</span>
                      </td>
                    );
                  }

                  const color = c.aFavor
                    ? "text-teal-700"
                    : c.pagado
                      ? "text-emerald-700"
                      : c.publicado
                        ? "text-amber-700"
                        : "text-slate-500";

                  return (
                    <td
                      key={m}
                      className={td}
                      title={`${MESES_NOM[m]} · ${formatMontoImpuesto(c.monto)}${
                        c.aFavor
                          ? " · saldo a favor"
                          : c.pagado
                            ? " · pago validado"
                            : c.publicado
                              ? " · publicado, pago pendiente"
                              : ""
                      }${
                        c.delta != null
                          ? ` · desfase ${formatPctDesfaseFederal(c.delta)} vs mes anterior`
                          : ""
                      }`}
                    >
                      <span
                        className={`block text-[12px] font-black tabular-nums leading-none ${color}`}
                      >
                        {formatMontoFederalCorto(c.monto)}
                      </span>
                      {c.delta != null ? (
                        <span
                          className={`pointer-events-none absolute left-0 right-0 top-[calc(50%+8px)] text-[8px] font-normal tabular-nums leading-none ${
                            c.delta > 0 ? "text-rose-500" : "text-sky-600"
                          }`}
                        >
                          {formatPctDesfaseFederal(c.delta)}
                        </span>
                      ) : null}
                    </td>
                  );
                })}
                <td className="px-3 h-8 text-right align-middle">
                  {anual !== 0 ? (
                    <span
                      className={`text-[12px] font-black tabular-nums leading-none ${
                        anual < 0 ? "text-teal-700" : "text-slate-800"
                      }`}
                    >
                      {formatMontoFederalCorto(anual)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-200">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50/80">
              <td className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 sticky left-0 bg-slate-50/95 z-10">
                Total mes
              </td>
              {totalesMes.map((t, m) => (
                <td
                  key={m}
                  className={`px-1.5 py-3 text-center ${
                    m === mesActual ? "bg-blue-50/30" : ""
                  }`}
                >
                  {t !== 0 ? (
                    <span
                      className={`text-[12px] font-black tabular-nums ${
                        t < 0 ? "text-teal-700" : "text-slate-700"
                      }`}
                    >
                      {formatMontoFederalCorto(t)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-200">—</span>
                  )}
                </td>
              ))}
              <td className="px-3 py-3 text-right">
                <span className="text-[12px] font-black tabular-nums text-slate-800">
                  {formatMontoFederalCorto(granTotal)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-t border-slate-100">
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mr-1">
          Leyenda
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800">
          Pago validado
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800">
          Publicado · pendiente
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold bg-teal-100 text-teal-800">
          Saldo a favor
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold bg-slate-100 text-slate-500">
          Sin dato / en ceros
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-normal text-rose-600">
          ▲ Desfase al alza
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-normal text-sky-700">
          ▼ Desfase a la baja
        </span>
      </div>
    </div>
  );
}
