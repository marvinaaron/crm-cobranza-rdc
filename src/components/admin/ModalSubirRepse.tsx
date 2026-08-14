"use client";

import { useState } from "react";
import type { Cliente } from "@/lib/clientes";
import {
  REPSE_META,
  type PeriodoRepse,
  type TipoDocumentoRepse,
  periodoRepseLabelLargo,
} from "@/lib/repse";
import { readFileAsDataUrl, validarArchivoPdf } from "@/lib/archivos";
import { useClientes } from "@/context/ClientesContext";
import AnimacionCargaArchivo, {
  useFaseCargaArchivo,
} from "@/components/AnimacionCargaArchivo";

type Props = {
  cliente: Cliente;
  periodoRepse: PeriodoRepse;
  tipo: TipoDocumentoRepse;
  onClose: () => void;
};

export default function ModalSubirRepse({
  cliente,
  periodoRepse,
  tipo,
  onClose,
}: Props) {
  const { subirDocumentoRepse } = useClientes();
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const { fase, progreso, ocupado } = useFaseCargaArchivo(subiendo);
  const meta = REPSE_META[tipo];

  async function manejarArchivo(file: File | undefined) {
    if (!file) return;
    const err = validarArchivoPdf(file);
    if (err) {
      setError(err);
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      subirDocumentoRepse(cliente.id, periodoRepse, tipo, {
        nombreArchivo: file.name,
        tipoMime: file.type || "application/pdf",
        dataUrl,
      });
      setSubiendo(false);
      await new Promise((r) => setTimeout(r, 1050));
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo cargar el documento."
      );
      setSubiendo(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-slate-100">
        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
          REPSE · {periodoRepseLabelLargo(periodoRepse)}
        </p>
        <h2 className="text-xl font-black text-slate-800 mb-1">
          Subir {meta.label}
        </h2>
        <p className="text-[11px] font-bold text-slate-400 mb-6">
          {cliente.razonSocial} · {meta.autoridad}
        </p>

        <label
          htmlFor="repse-upload"
          className={`flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-2xl transition-colors ${
            ocupado
              ? fase === "listo"
                ? "border-emerald-200 bg-emerald-50/70 cursor-default"
                : "border-indigo-200 bg-indigo-50/50 cursor-wait"
              : "border-slate-200 cursor-pointer hover:border-amber-400"
          }`}
        >
          {ocupado ? (
            <>
              <AnimacionCargaArchivo
                progreso={progreso}
                listo={fase === "listo"}
              />
              <span
                className={`text-[11px] font-black uppercase tracking-widest ${
                  fase === "listo" ? "text-emerald-700" : "text-indigo-700"
                }`}
              >
                {fase === "listo" ? "Listo" : "Cargando PDF…"}
              </span>
            </>
          ) : (
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Seleccionar PDF (máx. 5 MB)
            </span>
          )}
          <input
            id="repse-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={ocupado}
            onChange={(e) => {
              void manejarArchivo(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>

        {error && (
          <p className="mt-4 text-[11px] font-bold text-rose-600">{error}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
