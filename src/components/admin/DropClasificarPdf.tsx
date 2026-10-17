"use client";

import { useCallback, useState } from "react";
import { MESES_NOM, type Periodo } from "@/lib/clientes";
import { adivinarDestinoPdf } from "@/lib/clasificar-pdf-cumplimiento";
import ZonaSubirPdf from "@/components/ZonaSubirPdf";

export type OpcionDropPdf = { id: string; label: string };

export type DestinoDropPdf = {
  file: File;
  tipoId: string;
  periodo: Periodo;
};

export default function DropClasificarPdf({
  anio,
  mesDefault,
  opciones,
  onListo,
  etiqueta = "Arrastra el PDF aquí",
  descripcion = "Si no lo reconocemos, te pedimos tipo y mes.",
}: {
  anio: number;
  mesDefault: number;
  opciones: OpcionDropPdf[];
  onListo: (d: DestinoDropPdf) => void;
  etiqueta?: string;
  descripcion?: string;
}) {
  const [pendiente, setPendiente] = useState<{
    file: File;
    tipoId: string;
    mes: number;
  } | null>(null);

  const ids = opciones.map((o) => o.id);

  const recibir = useCallback(
    (file: File) => {
      const guess = adivinarDestinoPdf(file.name);
      const tipoOk = guess.tipoId && ids.includes(guess.tipoId) ? guess.tipoId : null;
      const mes = guess.mes ?? mesDefault;
      const anioDoc = guess.anio ?? anio;
      if (tipoOk && guess.mes != null) {
        onListo({ file, tipoId: tipoOk, periodo: { mes, anio: anioDoc } });
        return;
      }
      setPendiente({
        file,
        tipoId: tipoOk ?? opciones[0]?.id ?? "",
        mes,
      });
    },
    [anio, ids, mesDefault, onListo, opciones]
  );

  return (
    <div className="space-y-2">
      <ZonaSubirPdf
        onArchivo={recibir}
        etiqueta={etiqueta}
        descripcion={descripcion}
        compacto
      />
      {pendiente ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-slate-700 truncate" title={pendiente.file.name}>
            No reconocí el archivo. Elige tipo y mes.
          </p>
          <p className="text-[10px] text-slate-500 truncate">{pendiente.file.name}</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Tipo
              </span>
              <select
                value={pendiente.tipoId}
                onChange={(e) =>
                  setPendiente((p) => (p ? { ...p, tipoId: e.target.value } : p))
                }
                className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-semibold text-slate-800"
              >
                {opciones.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Mes
              </span>
              <select
                value={pendiente.mes}
                onChange={(e) =>
                  setPendiente((p) =>
                    p ? { ...p, mes: Number(e.target.value) } : p
                  )
                }
                className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-semibold text-slate-800"
              >
                {MESES_NOM.map((label, i) => (
                  <option key={label} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPendiente(null)}
              className="flex-1 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!pendiente.tipoId}
              onClick={() => {
                onListo({
                  file: pendiente.file,
                  tipoId: pendiente.tipoId,
                  periodo: {
                    mes: pendiente.mes,
                    anio: adivinarDestinoPdf(pendiente.file.name).anio ?? anio,
                  },
                });
                setPendiente(null);
              }}
              className="flex-1 py-1.5 rounded-lg bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
