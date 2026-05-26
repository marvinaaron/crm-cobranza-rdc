"use client";

import { useEffect, useState } from "react";
import type { Cliente } from "@/lib/clientes";
import { ETIQUETAS_DOCUMENTO_SAT, type TipoDocumentoSAT } from "@/lib/sat/types";

type Props = {
  cliente: Cliente;
  onClienteActualizado: (cliente: Cliente) => void;
};

/**
 * Botón discreto (icono) que abre un modal con la gestión de documentos SAT
 * del cliente. Pensado para colocarse junto al nombre/RFC en el panel admin.
 */
export default function AdminDocumentosSAT({
  cliente,
  onClienteActualizado,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [subiendo, setSubiendo] = useState<TipoDocumentoSAT | null>(null);
  const [autorizada, setAutorizada] = useState(
    cliente.satPortal?.opinionAutorizadaEnSat === true
  );
  const [guardandoFlag, setGuardandoFlag] = useState(false);

  const docs = cliente.satPortal?.documentos;
  const opinion = cliente.satPortal?.opinionPublica;
  const tieneAlgunDoc = !!(docs?.constancia || docs?.opinionPdf);

  useEffect(() => {
    setAutorizada(cliente.satPortal?.opinionAutorizadaEnSat === true);
  }, [cliente.satPortal?.opinionAutorizadaEnSat]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  async function subir(tipo: TipoDocumentoSAT, file: File) {
    setSubiendo(tipo);
    try {
      const fd = new FormData();
      fd.append("clienteId", String(cliente.id));
      fd.append("tipo", tipo);
      fd.append("archivo", file);
      const res = await fetch("/api/admin/clientes/documentos-sat", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir.");
      if (data.cliente) onClienteActualizado(data.cliente);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo subir el archivo.");
    } finally {
      setSubiendo(null);
    }
  }

  async function toggleAutorizada(next: boolean) {
    setAutorizada(next);
    setGuardandoFlag(true);
    try {
      const res = await fetch("/api/admin/clientes/documentos-sat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          opinionAutorizadaEnSat: next,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar.");
      if (data.cliente) onClienteActualizado(data.cliente);
    } catch (e) {
      setAutorizada(!next);
      alert(e instanceof Error ? e.message : "Error.");
    } finally {
      setGuardandoFlag(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        title="Documentos SAT del portal cliente"
        className={`relative inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
          tieneAlgunDoc
            ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            : "text-slate-300 hover:text-indigo-500 hover:bg-indigo-50"
        }`}
      >
        <SatIcon />
        {tieneAlgunDoc && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
        )}
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setAbierto(false)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
          <div
            className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                  Documentos SAT
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">
                  {cliente.razonSocial}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="text-slate-300 hover:text-red-500 p-1"
                aria-label="Cerrar"
              >
                <CloseIcon />
              </button>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autorizada}
                disabled={guardandoFlag}
                onChange={(e) => void toggleAutorizada(e.target.checked)}
                className="mt-0.5 rounded border-slate-300"
              />
              <span className="text-[10px] font-bold text-slate-600 leading-snug">
                Cliente ya autorizó opinión pública 32-D en el SAT
              </span>
            </label>

            {opinion?.ultimaConsulta && (
              <p className="text-[9px] font-bold text-slate-400">
                Última consulta: <span className="text-slate-600">{opinion.estado}</span> ·{" "}
                {new Date(opinion.ultimaConsulta).toLocaleString("es-MX")}
              </p>
            )}

            {(["constancia", "opinion"] as const).map((tipo) => {
              const ref = tipo === "constancia" ? docs?.constancia : docs?.opinionPdf;
              return (
                <div
                  key={tipo}
                  className="rounded-xl border border-slate-100 p-3 space-y-2"
                >
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {ETIQUETAS_DOCUMENTO_SAT[tipo]}
                  </p>
                  {ref ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-700 truncate min-w-0 flex-1">
                        {ref.nombreArchivo}
                      </span>
                      <a
                        href={`/api/admin/clientes/documentos-sat/descarga?clienteId=${cliente.id}&tipo=${tipo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800 shrink-0"
                      >
                        Ver
                      </a>
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400">Sin archivo</p>
                  )}
                  <label className="block">
                    <span className="sr-only">Subir {tipo}</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={subiendo === tipo}
                      className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-indigo-600 file:text-white"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void subir(tipo, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function SatIcon() {
  return (
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
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
