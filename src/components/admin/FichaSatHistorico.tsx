"use client";

import { MESES_NOM, type Cliente, type Periodo } from "@/lib/clientes";
import {
  categoriaConPagoEnRegistro,
  categoriaTieneAlgunDocumento,
  esSinPagoImpuestos,
  formatMontoImpuesto,
  getFechaLimiteCategoria,
  getSubtotalCategoria,
  parseFechaLimite,
  type RegistroCumplimiento,
} from "@/lib/cumplimiento";
import { diasHastaLimite } from "@/lib/cumplimiento-fechas";
import { formatearDiaMesCorto } from "@/lib/portal/fechas-fiscales";

function claseFecha(fecha: string | null): string {
  if (!fecha) return "text-slate-400";
  const dias = diasHastaLimite(fecha);
  if (dias === null) return "text-slate-400";
  if (dias < 0) return "text-red-600";
  return "text-orange-600";
}

export default function FichaSatHistorico({
  cliente,
  anio,
  getCumplimientoPeriodo,
}: {
  cliente: Cliente;
  anio: number;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 mb-3">
        SAT · {anio}
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {MESES_NOM.map((label, mes) => {
          const periodo: Periodo = { mes, anio };
          const reg = getCumplimientoPeriodo(cliente.id, periodo);
          const sinPago = esSinPagoImpuestos(reg);
          const conPago = !!reg && categoriaConPagoEnRegistro(reg, "federales");
          const cargado = categoriaTieneAlgunDocumento(reg, "federales");
          const monto = conPago && reg ? getSubtotalCategoria(reg, "federales") : null;
          const fecha = conPago && reg ? getFechaLimiteCategoria(reg, "federales") : null;
          const dt = fecha ? parseFechaLimite(fecha) : null;
          return (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-1">
                <p className="text-[10px] font-bold text-slate-500 truncate">
                  {label.slice(0, 3)}
                </p>
                <span
                  title={cargado ? "PDF cargado" : "Sin PDF"}
                  className={`h-1.5 w-1.5 rounded-full ${
                    cargado
                      ? "bg-[#1D4ED8]"
                      : "border-[1.5px] border-[#1D4ED8] bg-transparent"
                  }`}
                />
              </div>
              {sinPago ? (
                <p className="mt-1 text-[12px] font-bold text-slate-500">$0</p>
              ) : monto != null ? (
                <>
                  <p className="mt-1 text-[13px] font-bold tabular-nums text-slate-900">
                    {formatMontoImpuesto(monto)}
                  </p>
                  {dt ? (
                    <p className={`text-[11px] font-semibold tabular-nums ${claseFecha(fecha)}`}>
                      {formatearDiaMesCorto(dt)}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-1 text-[12px] text-slate-300">—</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
