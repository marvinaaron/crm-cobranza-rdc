"use client";

import { useMemo } from "react";
import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  clienteActivoEnPeriodo,
} from "@/lib/clientes";
import {
  type RegistroCumplimiento,
  esSinPagoImpuestos,
  formatMontoImpuesto,
  getSaldoFavorPeriodo,
  getSubtotalFederales,
  pagoValidadoCategoria,
  previewPublicado,
} from "@/lib/cumplimiento";

const MESES_ABREV = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/** Umbral para marcar desfase vs. el mes anterior con importe. */
const UMBRAL_DESFASE = 0.35;

type CeldaFederal = {
  monto: number;
  pagado: boolean;
  sinPago: boolean;
  publicado: boolean;
  aFavor: boolean;
  inactivo: boolean;
  /** Variación vs. último mes con importe distinto de 0. */
  delta: number | null;
};

type Props = {
  clientes: Cliente[];
  periodo: Periodo;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
  onSelectClient?: (cliente: Cliente) => void;
};

function fmtCorto(n: number): string {
  const abs = Math.abs(n);
  const signo = n < 0 ? "−" : "";
  if (abs <= 0) return "$0";
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${signo}$${m.toLocaleString("es-MX", {
      minimumFractionDigits: m >= 10 ? 0 : 1,
      maximumFractionDigits: 1,
    })}M`;
  }
  return `${signo}${formatMontoImpuesto(abs).replace("-$", "$")}`;
}

function pct(delta: number): string {
  const n = Math.round(Math.abs(delta) * 100);
  return `${delta > 0 ? "+" : "−"}${n}%`;
}

export default function VistaFederalCumplimiento({
  clientes,
  periodo,
  getCumplimientoPeriodo,
  onSelectClient,
}: Props) {
  const anio = periodo.anio;
  const mesActual = periodo.mes;

  const matriz = useMemo(() => {
    return clientes.map((cli) => {
      const raw: Omit<CeldaFederal, "delta">[] = [];
      for (let m = 0; m < 12; m++) {
        const p: Periodo = { mes: m, anio };
        if (!clienteActivoEnPeriodo(cli, p)) {
          raw.push({
            monto: 0,
            pagado: false,
            sinPago: false,
            publicado: false,
            aFavor: false,
            inactivo: true,
          });
          continue;
        }
        const reg = getCumplimientoPeriodo(cli.id, p);
        const sinPago = esSinPagoImpuestos(reg);
        const publicado = previewPublicado(reg);
        const cargo = reg ? getSubtotalFederales(reg) : 0;
        const saldo = getSaldoFavorPeriodo(reg)?.total ?? 0;
        const monto =
          cargo > 0 || saldo > 0 ? cargo - saldo : sinPago ? 0 : 0;
        const aFavor = monto < 0;
        const pagado =
          cargo > 0 && pagoValidadoCategoria(reg, "federales");
        raw.push({
          monto,
          pagado,
          sinPago,
          publicado,
          aFavor,
          inactivo: false,
        });
      }

      const celdas: CeldaFederal[] = raw.map((c, i) => {
        let prev: number | null = null;
        for (let j = i - 1; j >= 0; j--) {
          if (raw[j].inactivo) continue;
          if (raw[j].monto !== 0) {
            prev = raw[j].monto;
            break;
          }
        }
        let delta: number | null = null;
        if (prev != null && prev !== 0 && c.monto !== 0) {
          const d = (c.monto - prev) / Math.abs(prev);
          if (Math.abs(d) >= UMBRAL_DESFASE) delta = d;
        }
        return { ...c, delta };
      });

      const anual = celdas.reduce(
        (s, c) => s + (c.inactivo ? 0 : c.monto),
        0
      );
      return { cliente: cli, celdas, anual };
    });
  }, [clientes, anio, getCumplimientoPeriodo]);

  const totalesMes = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) =>
      matriz.reduce((s, r) => s + (r.celdas[m].inactivo ? 0 : r.celdas[m].monto), 0)
    );
  }, [matriz]);

  const granTotal = useMemo(
    () => totalesMes.reduce((a, b) => a + b, 0),
    [totalesMes]
  );

  if (clientes.length === 0) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
        Sin clientes para mostrar en la vista federal
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
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
            flecha marca un desfase de {Math.round(UMBRAL_DESFASE * 100)}% o más
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
              {MESES_ABREV.map((label, i) => (
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
                  <p className="text-[11px] font-black text-slate-800 truncate max-w-[190px]">
                    {cliente.razonSocial}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 tabular-nums">
                    {cliente.rfc}
                  </p>
                </td>
                {celdas.map((c, m) => {
                  const esMesActual = m === mesActual;
                  const fondo = esMesActual ? "bg-blue-50/30" : "";
                  if (c.inactivo) {
                    return (
                      <td key={m} className={`px-1.5 py-2 text-center ${fondo}`}>
                        <span className="text-[9px] text-slate-200">—</span>
                      </td>
                    );
                  }
                  if (c.sinPago && c.monto === 0) {
                    return (
                      <td
                        key={m}
                        className={`px-1.5 py-2 text-center ${fondo}`}
                        title={`${MESES_NOM[m]} · sin pago de impuestos`}
                      >
                        <span className="text-[9px] font-black text-slate-300">
                          0
                        </span>
                      </td>
                    );
                  }
                  if (c.monto === 0) {
                    return (
                      <td key={m} className={`px-1.5 py-2 text-center ${fondo}`}>
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
                      className={`px-1.5 py-1.5 text-center ${fondo}`}
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
                          ? ` · desfase ${pct(c.delta)} vs mes anterior`
                          : ""
                      }`}
                    >
                      <span
                        className={`block text-[10px] font-black tabular-nums leading-tight ${color}`}
                      >
                        {fmtCorto(c.monto)}
                      </span>
                      {c.delta != null && (
                        <span
                          className={`block text-[8px] font-black tabular-nums ${
                            c.delta > 0 ? "text-rose-500" : "text-sky-600"
                          }`}
                        >
                          {c.delta > 0 ? "▲" : "▼"} {pct(c.delta)}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right">
                  {anual !== 0 ? (
                    <span
                      className={`text-[11px] font-black tabular-nums ${
                        anual < 0 ? "text-teal-700" : "text-slate-800"
                      }`}
                    >
                      {fmtCorto(anual)}
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
                      className={`text-[10px] font-black tabular-nums ${
                        t < 0 ? "text-teal-700" : "text-slate-700"
                      }`}
                    >
                      {fmtCorto(t)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-200">—</span>
                  )}
                </td>
              ))}
              <td className="px-3 py-3 text-right">
                <span className="text-[11px] font-black tabular-nums text-slate-800">
                  {fmtCorto(granTotal)}
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
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold text-rose-600">
          ▲ Desfase al alza
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold text-sky-700">
          ▼ Desfase a la baja
        </span>
      </div>
    </div>
  );
}
