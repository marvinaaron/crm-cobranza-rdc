"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Cliente } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { abrirPdfEnNuevaPestana } from "@/lib/pdf-blob";
import {
  haySipareEnCarpeta,
  recolectarCarpetaDocumentos,
  type ArchivoCarpeta,
  type CarpetaId,
} from "@/lib/portal/carpeta-documentos";

type Props = { cliente: Cliente };

const CARPETAS: { id: CarpetaId; label: string }[] = [
  { id: "honorarios", label: "Honorarios" },
  { id: "declaraciones", label: "Declaraciones" },
  { id: "lineas", label: "Líneas de captura" },
  { id: "imss", label: "IMSS" },
];

function fmtFecha(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function abrirArchivo(doc: ArchivoCarpeta) {
  if (doc.href) {
    window.open(doc.href, "_blank", "noopener,noreferrer");
    return;
  }
  if (doc.dataUrl) abrirPdfEnNuevaPestana(doc.dataUrl);
}

/** Carpeta rellena estilo Archivos de iPhone (no círculo de Ajustes). */
function IosFolderIcon({ vacia }: { vacia: boolean }) {
  const cuerpo = vacia ? "#C7C7CC" : "#007AFF";
  const pestaña = vacia ? "#D1D1D6" : "#64D2FF";
  return (
    <svg
      width="64"
      height="52"
      viewBox="0 0 64 52"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 16.5c0-2.5 2-4.5 4.5-4.5h10.2c.8 0 1.6.3 2.2.8L28 16h23.5c2.5 0 4.5 2 4.5 4.5V41c0 2.5-2 4.5-4.5 4.5h-39C9.5 45.5 8 44 8 41.5V16.5Z"
        fill={cuerpo}
      />
      <path
        d="M8 14c0-2.2 1.8-4 4-4h11.4c.7 0 1.4.3 1.9.7L29 14H12c-2.2 0-4 1.8-4 4v-4Z"
        fill={pestaña}
      />
    </svg>
  );
}

function IosDocIcon() {
  return (
    <svg width="28" height="34" viewBox="0 0 28 34" fill="none" aria-hidden>
      <path
        d="M6 1.5h10.2L26 11.3V30a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 4 30V4A2.5 2.5 0 0 1 6.5 1.5H6Z"
        fill="#E8F1FF"
      />
      <path d="M16.2 1.5V9a2 2 0 0 0 2 2h7.6L16.2 1.5Z" fill="#007AFF" />
      <path
        d="M8 18h12M8 23h9"
        stroke="#007AFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PortalCarpetaInicio({ cliente }: Props) {
  const { cumplimiento, facturas } = useClientes();
  const [abierta, setAbierta] = useState<CarpetaId | null>(null);

  const archivos = useMemo(
    () => recolectarCarpetaDocumentos(cliente, cumplimiento, facturas),
    [cliente, cumplimiento, facturas]
  );
  const mostrarImss = haySipareEnCarpeta(archivos);

  const carpetasVisibles = CARPETAS.filter(
    (c) => c.id !== "imss" || mostrarImss
  );

  const delFolder = abierta
    ? archivos.filter((a) => a.carpeta === abierta)
    : [];
  const tituloFolder =
    CARPETAS.find((c) => c.id === abierta)?.label ?? "Carpeta";

  return (
    <>
      <section>
        <p className="px-4 mb-2 text-[13px] font-semibold text-slate-500">
          Carpeta
        </p>
        <div className="bg-white dark:bg-slate-900 rounded-2xl px-2 py-4">
          <div className="grid grid-cols-2 gap-y-5 gap-x-2">
            {carpetasVisibles.map((c) => {
              const n = archivos.filter((a) => a.carpeta === c.id).length;
              const vacia = n === 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAbierta(c.id)}
                  className="flex flex-col items-center gap-1.5 px-2 py-1 rounded-xl active:bg-slate-50 dark:active:bg-white/5"
                >
                  <IosFolderIcon vacia={vacia} />
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-white text-center leading-tight">
                    {c.label}
                  </span>
                  <span className="text-[12px] text-slate-400 leading-none">
                    {vacia ? "Vacía" : n === 1 ? "1" : String(n)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {abierta ? (
        <HojaCarpeta
          titulo={tituloFolder}
          archivos={delFolder}
          onClose={() => setAbierta(null)}
        />
      ) : null}
    </>
  );
}

function HojaCarpeta({
  titulo,
  archivos,
  onClose,
}: {
  titulo: string;
  archivos: ArchivoCarpeta[];
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="carpeta-titulo"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <div className="relative w-full sm:max-w-lg max-h-[min(92vh,720px)] flex flex-col rounded-t-[1.25rem] sm:rounded-[1.25rem] overflow-hidden bg-[#f2f2f7] dark:bg-slate-900">
        <div className="rdc-sheet-handle mt-2.5 mb-0 sm:hidden shrink-0" aria-hidden />
        <div className="shrink-0 px-5 pt-3 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-500">Archivos</p>
            <h2
              id="carpeta-titulo"
              className="text-[22px] font-bold leading-tight mt-0.5 text-slate-900 dark:text-white"
            >
              {titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-black/10 text-slate-600"
            aria-label="Cerrar"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {archivos.length === 0 ? (
            <p className="px-4 py-10 text-center text-[15px] text-slate-500">
              Esta carpeta está vacía.
            </p>
          ) : (
            <ul className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200/70">
              {archivos.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => abrirArchivo(doc)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left active:bg-slate-50"
                  >
                    <IosDocIcon />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] font-normal text-slate-900 dark:text-white truncate">
                        {doc.titulo}
                      </span>
                      <span className="block text-[13px] text-slate-500 mt-0.5">
                        PDF · {fmtFecha(doc.fechaIso)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
