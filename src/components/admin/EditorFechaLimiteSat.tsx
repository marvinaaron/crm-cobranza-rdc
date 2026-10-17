"use client";

import { useEffect, useState } from "react";
import { type Periodo } from "@/lib/clientes";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import { formatFechaLimiteImpuestoCompacta } from "@/lib/cumplimiento";
import {
  fechaLimiteSAT,
  fechaLimiteSATConOverride,
  isoFechaLocal,
} from "@/lib/portal/fechas-fiscales";

function IconoLapiz({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function FechaEditableConLapiz({
  iso,
  onGuardar,
  tono = "claro",
}: {
  iso: string;
  onGuardar: (fechaIso: string) => void;
  tono?: "claro" | "oscuro" | "alerta";
}) {
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(iso);

  useEffect(() => {
    setBorrador(iso);
    setEditando(false);
  }, [iso]);

  const texto =
    tono === "oscuro"
      ? "text-white"
      : tono === "alerta"
        ? "text-red-800"
        : "text-slate-800";
  const lapiz =
    tono === "oscuro"
      ? "text-white/70 hover:text-white hover:bg-white/10"
      : tono === "alerta"
        ? "text-red-600 hover:bg-red-100"
        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100";
  const scheme = tono === "oscuro" ? "[color-scheme:dark]" : "[color-scheme:light]";

  if (!iso) {
    return <p className={`text-[15px] font-bold ${texto}`}>—</p>;
  }

  if (editando) {
    return (
      <div className="flex items-center gap-1 mt-auto">
        <input
          type="date"
          value={borrador}
          autoFocus
          onChange={(e) => setBorrador(e.target.value)}
          className={`min-w-0 flex-1 bg-transparent text-[13px] font-bold tabular-nums outline-none border-0 p-0 ${texto} ${scheme}`}
        />
        <button
          type="button"
          aria-label="Guardar fecha"
          disabled={!borrador}
          onClick={() => {
            if (!borrador) return;
            onGuardar(borrador);
            setEditando(false);
          }}
          className={`w-7 h-7 rounded-lg text-[13px] font-bold ${lapiz}`}
        >
          ✓
        </button>
        <button
          type="button"
          aria-label="Cancelar"
          onClick={() => {
            setBorrador(iso);
            setEditando(false);
          }}
          className={`w-7 h-7 rounded-lg text-[15px] leading-none ${lapiz}`}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-auto">
      <p className={`text-[15px] font-bold tabular-nums leading-tight ${texto}`}>
        {formatFechaLimiteImpuestoCompacta(iso)}
      </p>
      <button
        type="button"
        aria-label="Editar fecha de vencimiento"
        onClick={() => setEditando(true)}
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${lapiz}`}
      >
        <IconoLapiz />
      </button>
    </div>
  );
}

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
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        Vence SAT
      </p>
      <FechaEditableConLapiz iso={iso} onGuardar={onGuardar} tono="claro" />
      {ajustada ? (
        <p className="mt-1 text-[10px] font-medium text-slate-500">
          El cálculo por RFC daba {formatFechaLimiteImpuestoCompacta(isoCalc)}.
          Las notificaciones usan esta fecha.
        </p>
      ) : (
        <p className="mt-1 text-[10px] font-medium text-slate-400">
          Según RFC. Toca el lápiz si el SAT da más plazo.
        </p>
      )}
      {ajustada ? (
        <button
          type="button"
          onClick={() => onGuardar(isoCalc)}
          className="mt-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
        >
          Volver a {formatFechaLimiteImpuestoCompacta(isoCalc)}
        </button>
      ) : null}
      {previas.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5">
          {previas.map((h, i) => (
            <li
              key={`${h.fecha}-${h.reemplazadaEn}-${i}`}
              className="text-[10px] text-slate-500"
            >
              Antes: {formatFechaLimiteImpuestoCompacta(h.fecha)}
              {h.motivo === "extemporaneo" ? " · línea anterior" : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
