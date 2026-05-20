"use client";

import { useCallback, useRef, useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { readFileAsDataUrl, validarArchivoNomina } from "@/lib/archivos";
import {
  formatFechaCumplimiento,
  esArchivoXml,
  getArchivosNomina,
} from "@/lib/cumplimiento";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import VisorPdfInline from "@/components/VisorPdfInline";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  onClose: () => void;
};

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function ModalSubirNomina({ cliente, periodo, onClose }: Props) {
  const {
    getCumplimientoPeriodo,
    agregarArchivoNomina,
    eliminarArchivoNomina,
  } = useClientes();

  const registro = getCumplimientoPeriodo(cliente.id, periodo);
  const archivos = getArchivosNomina(registro);

  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [visorId, setVisorId] = useState<string | null>(null);

  const procesarArchivos = useCallback(
    async (files: FileList | File[]) => {
      const lista = Array.from(files);
      if (!lista.length) return;

      setError(null);
      setOk(false);
      setSubiendo(true);

      try {
        for (const file of lista) {
          const err = validarArchivoNomina(file);
          if (err) {
            setError(err);
            continue;
          }
          const dataUrl = await readFileAsDataUrl(file);
          const mime =
            file.type ||
            (file.name.toLowerCase().endsWith(".xml")
              ? "application/xml"
              : "application/pdf");
          agregarArchivoNomina(cliente.id, periodo, {
            nombreArchivo: file.name,
            tipoMime: mime,
            dataUrl,
          });
        }
        setOk(true);
        setTimeout(() => setOk(false), 3000);
      } catch {
        setError("No se pudieron cargar uno o más archivos.");
      } finally {
        setSubiendo(false);
      }
    },
    [agregarArchivoNomina, cliente.id, periodo]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = "";
    if (files?.length) void procesarArchivos(files);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (subiendo) return;
    const files = e.dataTransfer.files;
    if (files?.length) void procesarArchivos(files);
  };

  const onEliminar = (id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar ${nombre}?`)) return;
    eliminarArchivoNomina(cliente.id, periodo, id);
    if (visorId === id) setVisorId(null);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-50 flex justify-between items-start gap-3 shrink-0">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Cumplimiento · {periodoLabel(periodo)}
            </p>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-snug">
              Nómina · Impuestos estatales
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">{cliente.razonSocial}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-300 hover:text-red-500">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Suba el PDF y/o XML de la nómina del periodo (impuestos estatales). Puede agregar varios archivos.
          </p>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onClick={() => !subiendo && inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all cursor-pointer ${
              subiendo
                ? "border-slate-100 bg-slate-50 opacity-60 cursor-wait"
                : "border-slate-200 bg-slate-50/80 hover:border-indigo-300 hover:bg-indigo-50/30"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.xml,application/pdf,application/xml,text/xml"
              className="hidden"
              disabled={subiendo}
              onChange={onInputChange}
            />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {subiendo ? "Subiendo archivos…" : "Arrastra PDF o XML aquí"}
            </p>
            <p className="text-xs font-medium text-slate-400 mt-1.5">
              o haz clic para elegir varios · máx. 5 MB c/u
            </p>
          </div>

          {archivos.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Archivos ({archivos.length})
              </p>
              {archivos.map((doc) => {
                const esXml = esArchivoXml(doc);
                return (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{doc.nombreArchivo}</p>
                        <p className="text-[10px] text-slate-400">
                          {esXml ? "XML" : "PDF"} · {formatFechaCumplimiento(doc.subidoEn)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onEliminar(doc.id, doc.nombreArchivo)}
                        className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 shrink-0"
                      >
                        Quitar
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {!esXml && (
                        <button
                          type="button"
                          onClick={() => setVisorId(visorId === doc.id ? null : doc.id)}
                          className="py-2 rounded-lg bg-white border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-600"
                        >
                          {visorId === doc.id ? "Ocultar" : "Ver"}
                        </button>
                      )}
                      {!esXml && (
                        <button
                          type="button"
                          onClick={() => abrirPdfEnNuevaPestana(doc.dataUrl)}
                          className="py-2 rounded-lg bg-white border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-600"
                        >
                          Abrir
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => descargarArchivo(doc.dataUrl, doc.nombreArchivo)}
                        className={`py-2 rounded-lg bg-indigo-600 text-[8px] font-black uppercase tracking-widest text-white hover:bg-indigo-700 ${
                          esXml ? "col-span-3" : ""
                        }`}
                      >
                        Descargar
                      </button>
                    </div>
                    {visorId === doc.id && !esXml && (
                      <VisorPdfInline
                        dataUrl={doc.dataUrl}
                        titulo={doc.nombreArchivo}
                        altura="h-48"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="text-[11px] font-bold text-red-600 text-center">{error}</p>}
          {ok && (
            <p className="text-[11px] font-bold text-emerald-600 text-center">
              Archivos guardados en el portal del cliente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
