"use client";

import { useState } from "react";
import type { Cliente } from "@/lib/clientes";
import { ETIQUETAS_DOCUMENTO_SAT, type TipoDocumentoSAT } from "@/lib/sat/types";

type Props = {
  cliente: Cliente;
  onClienteActualizado: (cliente: Cliente) => void;
};

export default function AdminDocumentosSAT({
  cliente,
  onClienteActualizado,
}: Props) {
  const [subiendo, setSubiendo] = useState<TipoDocumentoSAT | null>(null);
  const [autorizada, setAutorizada] = useState(
    cliente.satPortal?.opinionAutorizadaEnSat === true
  );
  const [guardandoFlag, setGuardandoFlag] = useState(false);

  const docs = cliente.satPortal?.documentos;
  const opinion = cliente.satPortal?.opinionPublica;

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
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4 mb-3">
      <div>
        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
          Documentos SAT · portal cliente
        </p>
        <p className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed">
          Suba PDF de constancia y opinión. El portal consulta la opinión 32-D en el
          SAT si el cliente autorizó la consulta pública.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={autorizada}
          disabled={guardandoFlag}
          onChange={(e) => void toggleAutorizada(e.target.checked)}
          className="mt-1 rounded border-slate-300"
        />
        <span className="text-[10px] font-bold text-slate-600 leading-relaxed">
          El cliente ya autorizó opinión pública en el SAT (32-D)
        </span>
      </label>

      {opinion?.ultimaConsulta && (
        <p className="text-[9px] font-bold text-slate-500">
          Última consulta SAT: {opinion.estado} ·{" "}
          {new Date(opinion.ultimaConsulta).toLocaleString("es-MX")}
        </p>
      )}

      {(["constancia", "opinion"] as const).map((tipo) => {
        const ref = tipo === "constancia" ? docs?.constancia : docs?.opinionPdf;
        return (
          <div
            key={tipo}
            className="rounded-xl bg-white border border-slate-100 p-3 space-y-2"
          >
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {ETIQUETAS_DOCUMENTO_SAT[tipo]}
            </p>
            {ref ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-700 truncate max-w-[200px]">
                  {ref.nombreArchivo}
                </span>
                <a
                  href={`/api/admin/clientes/documentos-sat/descarga?clienteId=${cliente.id}&tipo=${tipo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800"
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
                className="text-[10px] w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-indigo-600 file:text-white"
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
  );
}
