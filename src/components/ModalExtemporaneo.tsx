"use client";

import { useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { readFileAsDataUrl } from "@/lib/archivos";
import {
  type CategoriaId,
  CATEGORIA_META,
  periodoVencidoSinPago,
} from "@/lib/cumplimiento";
import ZonaSubirPdf from "@/components/ZonaSubirPdf";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  categoria: CategoriaId;
  onClose: () => void;
};

export default function ModalExtemporaneo({
  cliente,
  periodo,
  categoria,
  onClose,
}: Props) {
  const { getCumplimientoPeriodo, publicarExtemporaneo } = useClientes();
  const reg = getCumplimientoPeriodo(cliente.id, periodo);
  const meta = CATEGORIA_META[categoria];

  const [monto, setMonto] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const guardar = async () => {
    setError(null);
    const n = Number(String(monto).replace(/,/g, ""));
    if (!Number.isFinite(n) || n < 0) {
      setError("Indique el monto de la nueva línea de captura.");
      return;
    }
    if (!fechaLimite.trim()) {
      setError("Indique la nueva fecha límite de pago.");
      return;
    }
    if (!archivo) {
      setError("Adjunte el PDF de la línea de captura.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(archivo);
      publicarExtemporaneo(
        cliente.id,
        periodo,
        categoria,
        { monto: n, fechaLimite: fechaLimite.trim(), etiqueta: "Pago extemporáneo" },
        {
          nombreArchivo: archivo.name,
          tipoMime: archivo.type || "application/pdf",
          dataUrl,
        }
      );
      setOk(true);
      setTimeout(onClose, 1500);
    } catch {
      setError("No se pudo guardar. Intente de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] border border-slate-100 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">
          Pago extemporáneo
        </p>
        <h2 className="text-lg font-black text-slate-800">{meta.label}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {cliente.razonSocial} · {periodoLabel(periodo)}
        </p>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          El plazo venció sin comprobante de pago. Publique la nueva línea de captura sin validación
          de importe por parte del cliente.
        </p>
        {!periodoVencidoSinPago(reg) && (
          <p className="text-[11px] font-bold text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mb-4">
            El periodo aún no aparece como vencido; puede publicar igual si ya redeclaró.
          </p>
        )}
        <div className="space-y-3 mb-4">
          <input
            type="number"
            min={0}
            placeholder="Monto (MXN)"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold"
          />
          <input
            type="date"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold"
          />
        </div>
        <ZonaSubirPdf
          onArchivo={(f) => {
            setArchivo(f);
            setError(null);
          }}
          etiqueta={archivo ? archivo.name : "PDF línea de captura"}
          descripcion="Requerido · máx. 5 MB"
        />
        <button
          type="button"
          onClick={guardar}
          className="w-full mt-4 py-3.5 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest"
        >
          Publicar pago extemporáneo
        </button>
        {error && <p className="text-[11px] font-bold text-red-600 text-center mt-3">{error}</p>}
        {ok && (
          <p className="text-[11px] font-bold text-emerald-600 text-center mt-3">
            Publicado en el portal del cliente.
          </p>
        )}
      </div>
    </div>
  );
}
