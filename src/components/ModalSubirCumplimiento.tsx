"use client";

import { useCallback, useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm } from "@/components/ConfirmProvider";
import { readFileAsDataUrl } from "@/lib/archivos";
import {
  type TipoDocumentoSingular,
  type CategoriaId,
  CATEGORIA_META,
  DOCUMENTO_CUMPLIMIENTO_LABELS,
  formatFechaCumplimiento,
  formatMontoImpuesto,
  formatFechaLimiteImpuestoCorta,
  getDocumentoSingular,
  documentoImssEnSlot,
  adminPuedeSubirPdf,
  clienteConfirmoPreview,
  esSinPagoImpuestos,
  getSubtotalCategoria,
  getFechaLimiteCategoria,
  asegurarBloques,
  EMA_NOMBRE_LARGO,
  EBA_NOMBRE_LARGO,
  MAX_PDF_EMA_EBA,
} from "@/lib/cumplimiento";

const CATEGORIA_POR_TIPO: Partial<Record<TipoDocumentoSingular, CategoriaId>> = {
  declaracion: "federales",
  impuestos: "federales",
  sipare: "imss",
  ema: "imss",
  eba: "imss",
  nomina3: "estatales",
  estatales: "estatales",
};
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import ZonaSubirPdf from "@/components/ZonaSubirPdf";
import VisorPdfInline from "@/components/VisorPdfInline";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  tipo: TipoDocumentoSingular;
  lineaId?: string;
  slotIndex?: number;
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
  lineaId,
  slotIndex = 0,
  onClose,
}: Props) {
  const {
    getCumplimientoPeriodo,
    subirDocumentoCumplimiento,
    eliminarDocumentoCumplimiento,
  } = useClientes();
  const confirm = useConfirm();

  const registro = getCumplimientoPeriodo(cliente.id, periodo);
  const documento =
    tipo === "ema" || tipo === "eba"
      ? documentoImssEnSlot(registro, tipo, slotIndex)
      : getDocumentoSingular(registro, tipo, lineaId);
  const labelBase = DOCUMENTO_CUMPLIMIENTO_LABELS[tipo];
  const label =
    tipo === "ema"
      ? `${EMA_NOMBRE_LARGO}${MAX_PDF_EMA_EBA > 1 ? ` · PDF ${slotIndex + 1}` : ""}`
      : tipo === "eba"
        ? `${EBA_NOMBRE_LARGO}${MAX_PDF_EMA_EBA > 1 ? ` · PDF ${slotIndex + 1}` : ""}`
        : labelBase;
  const puedeSubir = adminPuedeSubirPdf(registro, tipo);
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [verEnLinea, setVerEnLinea] = useState(false);

  const subirArchivo = useCallback(
    async (file: File) => {
      setError(null);
      setOk(false);

      if (!puedeSubir) {
        setError(
          tipo === "declaracion"
            ? "Aún no puedes subir la declaración para este periodo."
            : "El cliente debe validar el previo de impuestos antes de subir PDFs."
        );
        return;
      }

      setSubiendo(true);
      setArchivoPendiente(file);
      try {
        const dataUrl = await readFileAsDataUrl(file);
        subirDocumentoCumplimiento(
          cliente.id,
          periodo,
          tipo,
          {
            nombreArchivo: file.name,
            tipoMime: file.type || "application/pdf",
            dataUrl,
          },
          undefined,
          lineaId,
          slotIndex
        );
        setArchivoPendiente(null);
        setOk(true);
        setTimeout(() => setOk(false), 3000);
      } catch {
        setError("No se pudo guardar. Intente de nuevo.");
      } finally {
        setSubiendo(false);
      }
    },
    [
      puedeSubir,
      tipo,
      cliente.id,
      periodo,
      lineaId,
      slotIndex,
      subirDocumentoCumplimiento,
    ]
  );

  const onArchivoSeleccionado = useCallback(
    (file: File) => {
      void subirArchivo(file);
    },
    [subirArchivo]
  );

  const reintentarGuardar = () => {
    if (!archivoPendiente) {
      setError("Seleccione un PDF para subir.");
      return;
    }
    void subirArchivo(archivoPendiente);
  };

  const onEliminar = async () => {
    if (!documento) return;
    const ok = await confirm({
      titulo: `Eliminar ${label.toLowerCase()}`,
      mensaje: `Vas a eliminar este documento del periodo ${periodoLabel(periodo)}. Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminarDocumentoCumplimiento(
      cliente.id,
      periodo,
      tipo,
      lineaId,
      tipo === "ema" || tipo === "eba" ? slotIndex : undefined
    );
    setArchivoPendiente(null);
    setVerEnLinea(false);
  };

  const descripcionTipo =
    tipo === "impuestos"
      ? "Paso 2 · PDF de impuestos declarados ante Hacienda (el previo ya fue validado por el cliente)."
      : tipo === "declaracion"
        ? "Documento informativo para el portal. Se guarda automáticamente al seleccionar el PDF."
        : "Paso 2 · Documento para consulta del cliente en el portal.";

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

          {!puedeSubir && (
            <p className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 leading-relaxed">
              {(tipo === "ema" || tipo === "eba" || tipo === "sipare") &&
              !registro?.imss?.activo &&
              !registro?.aplicaImss
                ? "IMSS no aplica para este cliente en este periodo."
                : tipo === "declaracion" &&
                    !esSinPagoImpuestos(registro) &&
                    !registro?.saldoFavor?.activo
                  ? "Para subir la declaración, marque «sin pago», capture saldo a favor o espere la validación del previo por el cliente."
                  : !clienteConfirmoPreview(registro)
                    ? "Espere a que el cliente valide el previo de impuestos en su portal."
                    : "No puede subir este documento aún."}
            </p>
          )}

          {(() => {
            if (!registro || !clienteConfirmoPreview(registro)) return null;
            const categoria = CATEGORIA_POR_TIPO[tipo];
            if (!categoria) return null;
            const regB = asegurarBloques(registro);
            const monto = getSubtotalCategoria(regB, categoria);
            if (monto <= 0) return null;
            const fechaCat = getFechaLimiteCategoria(regB, categoria);
            const catLabel = CATEGORIA_META[categoria].label;
            return (
              <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded-xl px-3 py-2">
                {catLabel} · {formatMontoImpuesto(monto)}
                {fechaCat
                  ? ` · vence ${formatFechaLimiteImpuestoCorta(fechaCat)}`
                  : ""}
              </p>
            );
          })()}


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

          {puedeSubir && (
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
            descripcion="se guarda al elegir · máx. 5 MB"
            compacto={!!documento}
          />
          )}

          {archivoPendiente && error && (
            <button
              type="button"
              onClick={reintentarGuardar}
              disabled={subiendo || !puedeSubir}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
            >
              {subiendo ? "Guardando…" : "Reintentar guardar"}
            </button>
          )}

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
