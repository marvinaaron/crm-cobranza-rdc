"use client";

import { useCallback, useRef, useState } from "react";
import { validarArchivoPdf } from "@/lib/archivos";

type Props = {
  onArchivo: (file: File) => void | Promise<void>;
  disabled?: boolean;
  cargando?: boolean;
  etiqueta?: string;
  descripcion?: string;
  compacto?: boolean;
};

const PdfIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 12h4M10 16h4" />
  </svg>
);

export default function ZonaSubirPdf({
  onArchivo,
  disabled = false,
  cargando = false,
  etiqueta = "Arrastra tu PDF aquí",
  descripcion = "o haz clic para elegir archivo · máx. 5 MB",
  compacto = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const procesar = useCallback(
    async (file: File | undefined) => {
      if (!file || disabled || cargando) return;
      const err = validarArchivoPdf(file);
      if (err) {
        setErrorLocal(err);
        return;
      }
      setErrorLocal(null);
      await onArchivo(file);
    },
    [disabled, cargando, onArchivo]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    void procesar(file);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || cargando) return;
    setArrastrando(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || cargando) return;
    setArrastrando(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setArrastrando(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(false);
    if (disabled || cargando) return;
    const file = e.dataTransfer.files?.[0];
    void procesar(file);
  };

  const activa = arrastrando && !disabled && !cargando;

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled || cargando ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => !disabled && !cargando && inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer select-none ${
          compacto ? "px-4 py-6" : "px-6 py-10"
        } ${
          disabled || cargando
            ? "border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-60"
            : activa
              ? "border-indigo-400 bg-indigo-50/80 scale-[1.01] shadow-inner"
              : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={disabled || cargando}
          onChange={onInputChange}
        />

        <div
          className={`inline-flex rounded-2xl mb-3 transition-colors ${
            activa ? "bg-indigo-100 text-indigo-600" : "bg-white text-slate-400"
          } ${compacto ? "p-2" : "p-3"}`}
        >
          <PdfIcon />
        </div>

        <p
          className={`font-black uppercase tracking-widest ${
            compacto ? "text-[9px]" : "text-[10px]"
          } ${activa ? "text-indigo-700" : "text-slate-500"}`}
        >
          {cargando ? "Cargando PDF…" : activa ? "Suelta el archivo aquí" : etiqueta}
        </p>
        {!cargando && (
          <p className={`mt-1.5 font-medium text-slate-400 ${compacto ? "text-[10px]" : "text-xs"}`}>
            {descripcion}
          </p>
        )}
      </div>

      {errorLocal && (
        <p className="text-[11px] font-bold text-red-600 text-center">{errorLocal}</p>
      )}
    </div>
  );
}
