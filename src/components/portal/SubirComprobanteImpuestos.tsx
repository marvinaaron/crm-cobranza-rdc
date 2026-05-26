"use client";

import { useRef, useState } from "react";
import { type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { readFileAsDataUrl } from "@/lib/archivos";
import { MAX_COMPROBANTE_BYTES } from "@/lib/comprobantes";
import { formatFechaCumplimiento } from "@/lib/cumplimiento";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import PortalSection from "@/components/portal/PortalSection";

type Props = {
  clienteId: number;
  periodo: Periodo;
};

export default function SubirComprobanteImpuestos({ clienteId, periodo }: Props) {
  const { getCumplimientoPeriodo, subirComprobantePagoImpuestos } = useClientes();
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const registro = getCumplimientoPeriodo(clienteId, periodo);
  const comprobante = registro?.comprobantePago;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setOk(false);

    if (file.size > MAX_COMPROBANTE_BYTES) {
      setError("El archivo no debe superar 3 MB.");
      return;
    }

    const permitidos = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!permitidos.includes(file.type)) {
      setError("Use imagen (JPG, PNG) o PDF.");
      return;
    }

    setSubiendo(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      subirComprobantePagoImpuestos(clienteId, periodo, {
        nombreArchivo: file.name,
        tipoMime: file.type,
        dataUrl,
      });
      setOk(true);
      setTimeout(() => setOk(false), 4000);
    } catch {
      setError("No se pudo cargar el archivo.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <PortalSection title="Comprobante de pago de impuestos">
      <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
        {periodoLabel(periodo)} · Suba el comprobante una vez realizado el pago ante el SAT.
      </p>

      {comprobante ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
            Comprobante enviado
          </p>
          <p className="text-xs font-bold text-slate-700 mt-1 truncate">{comprobante.nombreArchivo}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {formatFechaCumplimiento(comprobante.subidoEn)}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">            <button
              type="button"
              onClick={() => abrirPdfEnNuevaPestana(comprobante.dataUrl)}
              className="px-3 py-2 rounded-lg bg-white border text-[9px] font-black uppercase text-indigo-700"
            >
              Ver
            </button>
            <button
              type="button"
              onClick={() => descargarArchivo(comprobante.dataUrl, comprobante.nombreArchivo)}
              className="px-3 py-2 rounded-lg bg-blue-900 text-[9px] font-black uppercase text-white hover:bg-blue-800"
            >
              Descargar
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 rounded-lg border text-[9px] font-black uppercase text-slate-600"
            >
              Reemplazar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={subiendo}
          onClick={() => inputRef.current?.click()}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          {subiendo ? "Subiendo…" : "Subir comprobante de pago"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onFile}
      />

      {error && <p className="text-[11px] font-bold text-red-600 mt-3 text-center">{error}</p>}
      {ok && (
        <p className="text-[11px] font-bold text-emerald-600 mt-3 text-center">
          Comprobante recibido. El despacho lo revisará.
        </p>
      )}
    </PortalSection>
  );
}
