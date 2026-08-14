"use client";

import { useMemo, useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { readFileAsDataUrl } from "@/lib/archivos";
import {
  type CategoriaId,
  CATEGORIA_META,
  asegurarBloques,
  formatFechaLimiteImpuesto,
  formatMontoImpuesto,
  getFechaLimiteCategoria,
  getSubtotalCategoria,
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
  const regRaw = getCumplimientoPeriodo(cliente.id, periodo);
  const reg = regRaw ? asegurarBloques(regRaw) : undefined;
  const meta = CATEGORIA_META[categoria];
  const existente = reg?.extemporaneo?.[categoria]?.lineas[0];

  const montoOriginal = reg ? getSubtotalCategoria(reg, categoria) : 0;
  const fechaOriginal = reg ? getFechaLimiteCategoria(reg, categoria) : "";

  const [monto, setMonto] = useState(
    existente ? String(existente.monto) : montoOriginal > 0 ? String(montoOriginal) : ""
  );
  const [fechaLimite, setFechaLimite] = useState(existente?.fechaLimite ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const montoNuevo = useMemo(() => {
    const n = Number(String(monto).replace(/,/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }, [monto]);

  const recargo = useMemo(() => {
    if (!Number.isFinite(montoNuevo) || montoOriginal <= 0) return null;
    return Math.round((montoNuevo - montoOriginal) * 100) / 100;
  }, [montoNuevo, montoOriginal]);

  const pdfListo = !!archivo || !!existente?.documento;

  const guardar = async () => {
    setError(null);
    if (!Number.isFinite(montoNuevo) || montoNuevo < 0) {
      setError("Indique el monto de la nueva línea de captura.");
      return;
    }
    if (!fechaLimite.trim()) {
      setError("Indique la nueva fecha límite de pago.");
      return;
    }
    if (!pdfListo) {
      setError("Adjunte el PDF de la línea de captura extemporánea.");
      return;
    }

    setGuardando(true);
    try {
      const adjunto = archivo
        ? {
            nombreArchivo: archivo.name,
            tipoMime: archivo.type || "application/pdf",
            dataUrl: await readFileAsDataUrl(archivo),
          }
        : undefined;

      await publicarExtemporaneo(
        cliente.id,
        periodo,
        categoria,
        {
          monto: montoNuevo,
          fechaLimite: fechaLimite.trim(),
          etiqueta: "Pago extemporáneo",
        },
        adjunto
      );
      setOk(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar. Intente de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
        onClick={guardando ? undefined : onClose}
        aria-hidden
      />
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] border border-slate-100 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">
          Pago extemporáneo
        </p>
        <h2 className="text-lg font-black text-slate-800">{meta.label}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {cliente.razonSocial} · {periodoLabel(periodo)}
        </p>

        {/* Comparativa original vs nueva */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Línea original
            </p>
            <p className="text-base font-black text-slate-700 tabular-nums mt-0.5">
              {montoOriginal > 0 ? formatMontoImpuesto(montoOriginal) : "—"}
            </p>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">
              {fechaOriginal
                ? `Venció ${formatFechaLimiteImpuesto(fechaOriginal)}`
                : "Sin fecha"}
            </p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50/80 px-3 py-2.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-red-600">
              Extemporánea
            </p>
            <p className="text-base font-black text-red-700 tabular-nums mt-0.5">
              {Number.isFinite(montoNuevo)
                ? formatMontoImpuesto(montoNuevo)
                : "—"}
            </p>
            <p className="text-[9px] font-bold text-red-600/80 mt-0.5">
              {recargo == null
                ? "Indique el monto nuevo"
                : recargo > 0
                  ? `Recargo +${formatMontoImpuesto(recargo)}`
                  : recargo < 0
                    ? `Dif. ${formatMontoImpuesto(recargo)}`
                    : "Sin cambio de monto"}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Publique la nueva línea de captura (con recargos/actualizaciones) sin
          pedir otra validación de importes al cliente. Quedará visible aparte de
          la línea original.
        </p>

        {!periodoVencidoSinPago(regRaw) && (
          <p className="text-[11px] font-bold text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mb-4">
            El periodo aún no aparece como vencido; puede publicar igual si ya
            redeclaró.
          </p>
        )}

        <div className="space-y-3 mb-4">
          <label className="block">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Monto extemporáneo (MXN)
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Monto con recargos"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              disabled={guardando}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold tabular-nums"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Nueva fecha límite
            </span>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              disabled={guardando}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold"
            />
          </label>
        </div>

        <ZonaSubirPdf
          onArchivo={(f) => {
            setArchivo(f);
            setError(null);
          }}
          disabled={guardando}
          cargando={guardando}
          etiqueta={
            archivo
              ? archivo.name
              : existente?.documento
                ? existente.documento.nombreArchivo
                : "Clic o arrastra el PDF de la línea extemporánea"
          }
          descripcion={
            archivo
              ? "PDF listo · clic para reemplazarlo · máx. 5 MB"
              : existente?.documento
                ? "Ya hay un PDF · clic para reemplazarlo · máx. 5 MB"
                : "Requerido · clic para elegir o arrastra aquí · máx. 5 MB"
          }
        />

        <button
          type="button"
          onClick={() => void guardar()}
          disabled={guardando}
          className="w-full mt-4 py-3.5 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-60"
        >
          {guardando
            ? "Guardando…"
            : existente
              ? "Actualizar pago extemporáneo"
              : "Publicar pago extemporáneo"}
        </button>
        {error && (
          <p className="text-[11px] font-bold text-red-600 text-center mt-3">
            {error}
          </p>
        )}
        {ok && (
          <p className="text-[11px] font-bold text-emerald-600 text-center mt-3">
            Guardado. Visible en el portal del cliente.
          </p>
        )}
      </div>
    </div>
  );
}
