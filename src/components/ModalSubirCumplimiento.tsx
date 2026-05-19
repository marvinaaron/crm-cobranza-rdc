"use client";

import { useCallback, useEffect, useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { readFileAsDataUrl } from "@/lib/archivos";
import {
  type TipoDocumentoSingular,
  DOCUMENTO_CUMPLIMIENTO_LABELS,
  formatFechaCumplimiento,
  formatMontoImpuesto,
  formatFechaLimiteImpuesto,
  requiereMetadataImpuestos,
  getDocumentoSingular,
} from "@/lib/cumplimiento";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import ZonaSubirPdf from "@/components/ZonaSubirPdf";
import VisorPdfInline from "@/components/VisorPdfInline";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  tipo: TipoDocumentoSingular;
  onClose: () => void;
};

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);

export default function ModalSubirCumplimiento({
  cliente,
  periodo,
  tipo,
  onClose,
}: Props) {
  const {
    getCumplimientoPeriodo,
    subirDocumentoCumplimiento,
    actualizarMetadataCumplimiento,
    eliminarDocumentoCumplimiento,
  } = useClientes();

  const registro = getCumplimientoPeriodo(cliente.id, periodo);
  const documento = getDocumentoSingular(registro, tipo);
  const label = DOCUMENTO_CUMPLIMIENTO_LABELS[tipo];
  const conImpuestos = requiereMetadataImpuestos(tipo);

  const [monto, setMonto] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [verEnLinea, setVerEnLinea] = useState(false);

  useEffect(() => {
    if (!conImpuestos) return;
    if (registro?.montoImpuesto) setMonto(String(registro.montoImpuesto));
    if (registro?.fechaLimite) setFechaLimite(registro.fechaLimite);
  }, [conImpuestos, registro?.montoImpuesto, registro?.fechaLimite]);

  const parseMonto = (): number | null => {
    const n = Number(String(monto).replace(/,/g, "").trim());
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  };

  const validarMetadata = (): { montoImpuesto: number; fechaLimite: string } | null => {
    const montoImpuesto = parseMonto();
    if (montoImpuesto === null) {
      setError("Indique el monto a pagar de impuestos.");
      return null;
    }
    if (!fechaLimite.trim()) {
      setError("Indique la fecha límite de pago.");
      return null;
    }
    return { montoImpuesto, fechaLimite: fechaLimite.trim() };
  };

  const onArchivoSeleccionado = useCallback((file: File) => {
    setArchivoPendiente(file);
    setError(null);
    setOk(false);
  }, []);

  const guardar = async () => {
    setError(null);
    setOk(false);

    let metadata: { montoImpuesto: number; fechaLimite: string } | undefined;
    if (conImpuestos) {
      const m = validarMetadata();
      if (!m) return;
      metadata = m;
    }

    if (!archivoPendiente && !documento) {
      setError("Seleccione un PDF para subir.");
      return;
    }

    setSubiendo(true);
    try {
      if (archivoPendiente) {
        const dataUrl = await readFileAsDataUrl(archivoPendiente);
        subirDocumentoCumplimiento(
          cliente.id,
          periodo,
          tipo,
          {
            nombreArchivo: archivoPendiente.name,
            tipoMime: archivoPendiente.type || "application/pdf",
            dataUrl,
          },
          metadata
        );
        setArchivoPendiente(null);
      } else if (documento && conImpuestos && metadata) {
        actualizarMetadataCumplimiento(cliente.id, periodo, metadata);
      }
      setOk(true);
      setTimeout(() => setOk(false), 3000);
    } catch {
      setError("No se pudo guardar. Intente de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  const onEliminar = () => {
    if (!documento) return;
    if (!window.confirm(`¿Eliminar ${label.toLowerCase()} de este periodo?`)) return;
    eliminarDocumentoCumplimiento(cliente.id, periodo, tipo);
    setArchivoPendiente(null);
    setVerEnLinea(false);
  };

  const descripcionTipo =
    tipo === "impuestos"
      ? "Suba el PDF de impuestos. Indique el monto a pagar y la fecha límite; el cliente verá esta información en su portal."
      : "Documento informativo para consulta del cliente en el portal. No requiere monto ni fecha límite.";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-50 flex justify-between items-start gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Cumplimiento · {periodoLabel(periodo)}
            </p>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-snug">
              {label}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">{cliente.razonSocial}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{cliente.rfc}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-300 hover:text-red-500">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{descripcionTipo}</p>

          {conImpuestos && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                    Monto a pagar (MXN)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                    Fecha límite de pago
                  </label>
                  <input
                    type="date"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              {registro && registro.montoImpuesto > 0 && registro.fechaLimite && (
                <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded-xl px-3 py-2">
                  Resumen guardado: {formatMontoImpuesto(registro.montoImpuesto)} · vence{" "}
                  {formatFechaLimiteImpuesto(registro.fechaLimite)}
                </p>
              )}
            </>
          )}

          {documento && (
            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-indigo-600 shrink-0">
                  <PdfIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-700">
                    PDF cargado
                  </p>
                  <p className="text-xs font-bold text-slate-700 truncate mt-1">{documento.nombreArchivo}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatFechaCumplimiento(documento.subidoEn)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setVerEnLinea((v) => !v)}
                  className="flex-1 min-w-[80px] py-2 rounded-xl bg-white border border-indigo-200 text-[9px] font-black uppercase tracking-widest text-indigo-700 hover:bg-indigo-50"
                >
                  {verEnLinea ? "Ocultar" : "Ver PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => abrirPdfEnNuevaPestana(documento.dataUrl)}
                  className="flex-1 min-w-[80px] py-2 rounded-xl bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-600"
                >
                  Abrir
                </button>
                <button
                  type="button"
                  onClick={() => descargarArchivo(documento.dataUrl, documento.nombreArchivo)}
                  className="flex-1 min-w-[80px] py-2 rounded-xl bg-indigo-600 text-[9px] font-black uppercase tracking-widest text-white"
                >
                  Descargar
                </button>
              </div>
              {verEnLinea && (
                <div className="mt-3">
                  <VisorPdfInline
                    dataUrl={documento.dataUrl}
                    titulo={documento.nombreArchivo}
                    altura="h-64"
                  />
                </div>
              )}
            </div>
          )}

          <ZonaSubirPdf
            onArchivo={onArchivoSeleccionado}
            cargando={subiendo}
            etiqueta={
              archivoPendiente
                ? archivoPendiente.name
                : documento
                  ? "Arrastra otro PDF para reemplazar"
                  : `Arrastra el PDF de ${label.toLowerCase()}`
            }
            descripcion="o haz clic para buscar · máx. 5 MB"
            compacto={!!documento}
          />

          <button
            type="button"
            onClick={guardar}
            disabled={subiendo}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
          >
            {subiendo
              ? "Guardando…"
              : conImpuestos
                ? "Guardar documento e información"
                : "Guardar documento"}
          </button>

          {documento && (
            <button
              type="button"
              onClick={onEliminar}
              disabled={subiendo}
              className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 disabled:opacity-40"
            >
              Eliminar {label.toLowerCase()}
            </button>
          )}

          {error && <p className="text-[11px] font-bold text-red-600 text-center">{error}</p>}
          {ok && (
            <p className="text-[11px] font-bold text-emerald-600 text-center">
              Guardado. El cliente verá este documento en su portal.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
