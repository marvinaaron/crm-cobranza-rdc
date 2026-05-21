"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Cliente,
  type Periodo,
  periodoLabel,
  getMontoPagado,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm } from "@/components/ConfirmProvider";
import { readFileAsDataUrl } from "@/lib/archivos";
import { formatFechaFactura } from "@/lib/facturas";
import { abrirPdfEnNuevaPestana, descargarPdf } from "@/lib/pdf-blob";
import ZonaSubirPdf from "@/components/ZonaSubirPdf";
import VisorPdfInline from "@/components/VisorPdfInline";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  onClose: () => void;
};

function formatCurrencyInput(value: string) {
  const numericValue = value.toString().replace(/\D/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseMontoInput(value: string): number {
  return Number(value.replace(/,/g, "")) || 0;
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12h4M10 16h4"/></svg>
);

export default function ModalSubirFactura({ cliente, periodo, onClose }: Props) {
  const { getFacturaPeriodo, subirFactura, eliminarFactura, listaClientes } =
    useClientes();
  const confirm = useConfirm();
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [verEnLinea, setVerEnLinea] = useState(false);
  const clienteActual =
    listaClientes.find((c) => c.id === cliente.id) ?? cliente;
  const factura = getFacturaPeriodo(cliente.id, periodo);

  // Default sugerido: el monto pagado en el mes (que normalmente es lo que se factura).
  const montoSugerido = getMontoPagado(clienteActual, periodo);

  const [montoInput, setMontoInput] = useState<string>(() => {
    if (factura?.monto && factura.monto > 0) return factura.monto.toLocaleString();
    return montoSugerido > 0 ? montoSugerido.toLocaleString() : "";
  });

  // Sincroniza si cambia el periodo o el cliente
  useEffect(() => {
    if (factura?.monto && factura.monto > 0) {
      setMontoInput(factura.monto.toLocaleString());
    } else if (montoSugerido > 0) {
      setMontoInput(montoSugerido.toLocaleString());
    } else {
      setMontoInput("");
    }
  }, [cliente.id, periodo.mes, periodo.anio, factura?.monto, montoSugerido]);

  const procesarPdf = useCallback(
    async (file: File) => {
      setError(null);
      setOk(false);
      const monto = parseMontoInput(montoInput);
      if (monto <= 0) {
        setError("Captura el monto facturado antes de subir el PDF.");
        return;
      }
      setSubiendo(true);
      try {
        const dataUrl = await readFileAsDataUrl(file);
        subirFactura(
          cliente.id,
          periodo,
          {
            nombreArchivo: file.name,
            tipoMime: file.type || "application/pdf",
            dataUrl,
          },
          monto
        );
        setOk(true);
        setTimeout(() => setOk(false), 3000);
      } catch {
        setError("No se pudo cargar el archivo. Intente de nuevo.");
      } finally {
        setSubiendo(false);
      }
    },
    [cliente.id, periodo, subirFactura, montoInput]
  );

  const onEliminar = async () => {
    if (!factura) return;
    const ok = await confirm({
      titulo: "Eliminar factura",
      mensaje: `Vas a eliminar la factura de ${periodoLabel(periodo)}. Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminarFactura(factura.id);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-start gap-3">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Factura · {periodoLabel(periodo)}
            </p>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-snug">
              {cliente.razonSocial}
            </h2>
            <p className="text-[10px] font-mono text-slate-400 mt-1">{cliente.rfc}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-300 hover:text-red-500">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Suba el PDF de la factura emitida por el despacho. El cliente podrá verla y descargarla desde su portal.
          </p>

          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
              Monto facturado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg font-black pointer-events-none">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder={
                  montoSugerido > 0
                    ? `Sugerido ${montoSugerido.toLocaleString()} (lo pagado en el mes)`
                    : "0"
                }
                value={montoInput}
                onChange={(e) => setMontoInput(formatCurrencyInput(e.target.value))}
                className="w-full bg-slate-50 rounded-2xl pl-7 pr-4 py-3 font-black text-slate-700 text-lg outline-none focus:ring-2 focus:ring-emerald-100 placeholder:text-[11px] placeholder:font-bold placeholder:text-slate-400"
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-snug">
              Se usa en el dashboard para comparar contra los ingresos cobrados.
            </p>
          </div>

          {factura && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-emerald-600 shrink-0">
                  <PdfIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
                    Factura cargada
                  </p>
                  <p className="text-xs font-bold text-slate-700 truncate mt-1">{factura.nombreArchivo}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{formatFechaFactura(factura.subidoEn)}</p>
                  {typeof factura.monto === "number" && factura.monto > 0 && (
                    <p className="text-sm font-black text-emerald-700 mt-1 tabular-nums">
                      ${factura.monto.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setVerEnLinea((v) => !v)}
                  className="flex-1 min-w-[80px] py-2 rounded-xl bg-white border border-emerald-200 text-[9px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-50"
                >
                  {verEnLinea ? "Ocultar" : "Ver PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => abrirPdfEnNuevaPestana(factura.dataUrl)}
                  className="flex-1 min-w-[80px] py-2 rounded-xl bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                >
                  Abrir
                </button>
                <button
                  type="button"
                  onClick={() => descargarPdf(factura.dataUrl, factura.nombreArchivo)}
                  className="flex-1 min-w-[80px] py-2 rounded-xl bg-emerald-600 text-[9px] font-black uppercase tracking-widest text-white hover:bg-emerald-700"
                >
                  Descargar
                </button>
              </div>
              {verEnLinea && (
                <div className="mt-3">
                  <VisorPdfInline
                    dataUrl={factura.dataUrl}
                    titulo={factura.nombreArchivo}
                    altura="h-80"
                  />
                </div>
              )}
            </div>
          )}

          <ZonaSubirPdf
            onArchivo={procesarPdf}
            cargando={subiendo}
            etiqueta={factura ? "Arrastra otro PDF para reemplazar" : "Arrastra tu factura PDF aquí"}
            descripcion="o haz clic para buscar en tu equipo · máx. 5 MB"
            compacto={!!factura}
          />

          {factura && (
            <button
              type="button"
              onClick={onEliminar}
              disabled={subiendo}
              className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 disabled:opacity-40"
            >
              Eliminar factura
            </button>
          )}

          {error && <p className="text-[11px] font-bold text-red-600 text-center">{error}</p>}
          {ok && (
            <p className="text-[11px] font-bold text-emerald-600 text-center">
              Factura guardada. Ya está disponible en el portal del cliente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
