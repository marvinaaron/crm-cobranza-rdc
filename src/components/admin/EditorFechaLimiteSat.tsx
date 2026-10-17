"use client";

import { type Periodo } from "@/lib/clientes";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import { formatFechaLimiteImpuestoCorta } from "@/lib/cumplimiento";
import {
  fechaLimiteSAT,
  fechaLimiteSATConOverride,
  formatearDiaMesCorto,
  isoFechaLocal,
} from "@/lib/portal/fechas-fiscales";

export default function EditorFechaLimiteSat({
  rfc,
  periodo,
  registro,
  onGuardar,
}: {
  rfc: string;
  periodo: Periodo;
  registro: RegistroCumplimiento | undefined;
  onGuardar: (fechaIso: string) => void;
}) {
  const calculada = fechaLimiteSAT(rfc, periodo);
  const efectiva = fechaLimiteSATConOverride(
    rfc,
    periodo,
    registro?.fechaLimiteDeclaracion
  );
  const iso = isoFechaLocal(efectiva);
  const isoCalc = isoFechaLocal(calculada);
  const ajustada = iso !== isoCalc;
  const previas = (registro?.historialFechasLimite ?? []).slice(-3).reverse();

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <label className="min-w-0">
          <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Vence SAT
          </span>
          <input
            type="date"
            value={iso}
            onChange={(e) => {
              const v = e.target.value;
              if (v) onGuardar(v);
            }}
            className="mt-0.5 bg-transparent text-[13px] font-bold tabular-nums text-slate-800 outline-none"
          />
        </label>
        <p className="text-[11px] font-semibold tabular-nums text-orange-600 shrink-0">
          {formatearDiaMesCorto(efectiva)}
        </p>
      </div>
      {ajustada ? (
        <p className="mt-1 text-[10px] font-medium text-slate-500">
          El cálculo por RFC daba {formatearDiaMesCorto(calculada)}. Las
          notificaciones usan esta fecha.
        </p>
      ) : (
        <p className="mt-1 text-[10px] font-medium text-slate-400">
          Según RFC. Si el SAT da más plazo, cámbiala aquí.
        </p>
      )}
      {ajustada ? (
        <button
          type="button"
          onClick={() => onGuardar(isoCalc)}
          className="mt-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
        >
          Volver a {formatearDiaMesCorto(calculada)}
        </button>
      ) : null}
      {previas.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5">
          {previas.map((h, i) => (
            <li key={`${h.fecha}-${h.reemplazadaEn}-${i}`} className="text-[10px] text-slate-500">
              Antes: {formatFechaLimiteImpuestoCorta(h.fecha)}
              {h.motivo === "extemporaneo" ? " · línea anterior" : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
