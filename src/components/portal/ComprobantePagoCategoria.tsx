"use client";

import { useRef, useState } from "react";
import { type Periodo } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  type CategoriaId,
  CATEGORIA_META,
  formatFechaCumplimiento,
  esArchivoXml,
  getComprobantePagoCategoria,
  pagoValidadoCategoria,
} from "@/lib/cumplimiento";
import { MAX_COMPROBANTE_BYTES } from "@/lib/comprobantes";
import { readFileAsDataUrl } from "@/lib/archivos";
import ModalDocumentoPortal from "@/components/portal/ModalDocumentoPortal";

type Variante = "blue" | "emerald" | "violet";

const VAR_BTN: Record<Variante, string> = {
  blue: "border-[var(--portal-navy-border)] text-[var(--portal-navy)] hover:bg-[var(--portal-navy-soft)]",
  emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
  violet: "border-violet-200 text-violet-700 hover:bg-violet-50",
};

const VAR_OK_BG: Record<Variante, string> = {
  blue: "bg-[var(--portal-navy-soft)] border-[var(--portal-navy-border)]",
  emerald: "bg-emerald-50/70 border-emerald-100",
  violet: "bg-violet-50/70 border-violet-100",
};

const VAR_OK_LABEL: Record<Variante, string> = {
  blue: "text-[var(--portal-navy)]",
  emerald: "text-emerald-700",
  violet: "text-violet-700",
};

const VAR_ICON: Record<Variante, string> = {
  blue: "bg-[var(--portal-navy-muted)] text-[var(--portal-navy)]",
  emerald: "bg-emerald-100 text-emerald-700",
  violet: "bg-violet-100 text-violet-700",
};

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

type Props = {
  clienteId: number;
  periodo: Periodo;
  categoria: CategoriaId;
  variante: Variante;
};

export default function ComprobantePagoCategoria({
  clienteId,
  periodo,
  categoria,
  variante,
}: Props) {
  const {
    getCumplimientoPeriodo,
    subirComprobantePagoCategoria,
    eliminarComprobantePagoCategoria,
  } = useClientes();
  const confirm = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verModal, setVerModal] = useState(false);

  const registro = getCumplimientoPeriodo(clienteId, periodo);
  const comprobante = getComprobantePagoCategoria(registro, categoria);
  const validado = pagoValidadoCategoria(registro, categoria);
  const fechaValidacion = registro?.pagoValidadoCategorias?.[categoria];
  const meta = CATEGORIA_META[categoria];

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    if (file.size > MAX_COMPROBANTE_BYTES) {
      setError("Máx. 3 MB.");
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
      subirComprobantePagoCategoria(clienteId, periodo, categoria, {
        nombreArchivo: file.name,
        tipoMime: file.type,
        dataUrl,
      });
    } catch {
      setError("No se pudo cargar el archivo.");
    } finally {
      setSubiendo(false);
    }
  };

  const onEliminar = async () => {
    if (!comprobante) return;
    const ok = await confirm({
      titulo: "Eliminar comprobante",
      mensaje: "Podrás subir otro en su lugar.",
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminarComprobantePagoCategoria(clienteId, periodo, categoria);
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
        Comprobante de pago
      </p>

      {comprobante ? (
        <>
          <button
            type="button"
            onClick={() => setVerModal(true)}
            className={`w-full text-left rounded-xl border ${
              validado
                ? "bg-emerald-50 border-emerald-200"
                : VAR_OK_BG[variante]
            } px-3 py-3 flex items-center gap-3 hover:shadow-sm transition-all`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                validado ? "bg-emerald-100 text-emerald-700" : VAR_ICON[variante]
              }`}
            >
              {validado ? <CheckIcon /> : <FileIcon />}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-[10px] font-black uppercase tracking-widest ${
                  validado ? "text-emerald-700" : VAR_OK_LABEL[variante]
                }`}
              >
                {validado ? "Pago confirmado" : "Pago enviado"}
              </p>
              <p className="text-[10px] font-bold text-slate-600 truncate mt-0.5">
                {comprobante.nombreArchivo}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                {esArchivoXml(comprobante) ? "XML" : "PDF / Imagen"} ·{" "}
                {formatFechaCumplimiento(comprobante.subidoEn)}
              </p>
              {validado && fechaValidacion && (
                <p className="text-[9px] font-bold text-emerald-700 mt-0.5">
                  Validado por tu contador · {formatFechaCumplimiento(fechaValidacion)}
                </p>
              )}
            </div>
          </button>
          {!validado && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={`flex-1 py-2 rounded-lg bg-white border text-[8px] font-black uppercase tracking-widest ${VAR_BTN[variante]}`}
              >
                Reemplazar
              </button>
              <button
                type="button"
                onClick={() => void onEliminar()}
                className="flex-1 py-2 rounded-lg bg-white border border-red-200 text-[8px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          disabled={subiendo}
          onClick={() => inputRef.current?.click()}
          className={`w-full py-3 rounded-xl border-2 border-dashed bg-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${VAR_BTN[variante]}`}
        >
          {subiendo
            ? "Subiendo…"
            : `Confirmar mi pago · ${meta.label.toLowerCase()}`}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onFile}
      />

      {error && (
        <p className="text-[10px] font-bold text-red-600 text-center mt-2">{error}</p>
      )}

      {verModal && comprobante && (
        <ModalDocumentoPortal
          documento={comprobante}
          titulo={`Comprobante · ${meta.label}`}
          subtitulo="Tu comprobante de pago"
          onClose={() => setVerModal(false)}
        />
      )}
    </div>
  );
}
