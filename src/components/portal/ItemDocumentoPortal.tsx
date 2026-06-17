"use client";

import { useState } from "react";
import {
  type DocumentoHacienda,
  formatFechaCumplimiento,
  esArchivoXml,
  documentoPdfDisponible,
  documentoPdfArchivado,
} from "@/lib/cumplimiento";
import ModalDocumentoPortal from "@/components/portal/ModalDocumentoPortal";

type Props = {
  documento?: DocumentoHacienda | null;
  /** Etiqueta principal mostrada en la tarjeta. */
  label: string;
  /** Información complementaria (e.g. monto · fecha límite). */
  hint?: string;
  /** Texto cuando el documento aún no está cargado. */
  pendiente?: string;
  /** Variante de color para el ícono y el realce. */
  variante?: "blue" | "emerald" | "violet" | "slate";
};

const ICON_VARIANTES: Record<NonNullable<Props["variante"]>, string> = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-700",
  violet: "bg-violet-50 text-violet-700",
  slate: "bg-slate-100 text-slate-600",
};

const BORDER_VARIANTES: Record<NonNullable<Props["variante"]>, string> = {
  blue: "border-blue-100 hover:border-blue-300",
  emerald: "border-emerald-100 hover:border-emerald-300",
  violet: "border-violet-100 hover:border-violet-300",
  slate: "border-slate-100 hover:border-slate-300",
};

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
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

export default function ItemDocumentoPortal({
  documento,
  label,
  hint,
  pendiente = "Pendiente",
  variante = "slate",
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const disponible = documentoPdfDisponible(documento);
  const archivado = documentoPdfArchivado(documento);
  const esXml = disponible ? esArchivoXml(documento!) : false;

  return (
    <>
      <button
        type="button"
        disabled={!disponible}
        onClick={() => setAbierto(true)}
        className={`w-full text-left rounded-xl border bg-white px-3 py-3 flex items-center gap-3 transition-all ${
          disponible
            ? `${BORDER_VARIANTES[variante]} hover:shadow-sm cursor-pointer`
            : archivado
              ? "border-slate-200 bg-slate-50/80 cursor-default"
              : "border-dashed border-slate-200 bg-slate-50/60 cursor-not-allowed"
        }`}
      >
        <div
          className={`p-2 rounded-lg shrink-0 ${
            disponible
              ? ICON_VARIANTES[variante]
              : archivado
                ? "bg-slate-100 text-slate-500"
                : "bg-white text-slate-300"
          }`}
        >
          <FileIcon />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] font-black uppercase tracking-widest leading-tight truncate ${
              disponible ? "text-slate-700" : archivado ? "text-slate-600" : "text-slate-400"
            }`}
          >
            {label}
          </p>
          {disponible ? (
            <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
              {documento!.nombreArchivo}
            </p>
          ) : archivado ? (
            <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-snug">
              Archivado · consulta tu portal del SAT
            </p>
          ) : (
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{pendiente}</p>
          )}
          {disponible && (
            <p className="text-[9px] text-slate-400 mt-0.5">
              {esXml ? "XML" : "PDF"} · {formatFechaCumplimiento(documento!.subidoEn)}
            </p>
          )}
          {archivado && documento?.subidoEn && (
            <p className="text-[9px] text-slate-400 mt-0.5">
              Subido {formatFechaCumplimiento(documento.subidoEn)}
            </p>
          )}
          {hint && (
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate">{hint}</p>
          )}
        </div>
      </button>

      {abierto && disponible && (
        <ModalDocumentoPortal
          documento={documento!}
          titulo={label}
          subtitulo={hint}
          onClose={() => setAbierto(false)}
        />
      )}
    </>
  );
}
