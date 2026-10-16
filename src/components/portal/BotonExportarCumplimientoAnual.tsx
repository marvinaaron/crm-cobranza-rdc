"use client";

import { useEffect, useRef, useState } from "react";
import { type Cliente } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { usePeriodoFiscal } from "@/hooks/usePeriodoPortal";
import { CATEGORIA_META } from "@/lib/cumplimiento";
import {
  construirExportCumplimientoAnualCliente,
  exportarCumplimientoAnualClientePdf,
  exportarImpuestosPagadosClientePdf,
} from "@/lib/cumplimiento-export";

type Props = {
  cliente: Cliente;
};

export default function BotonExportarCumplimientoAnual({ cliente }: Props) {
  const { getCumplimientoPeriodo, getHistorialImpuestosCliente } = useClientes();
  const { periodoVista } = usePeriodoFiscal();
  const anio = periodoVista.anio;
  const [menu, setMenu] = useState(false);
  const [info, setInfo] = useState(false);
  const [exportando, setExportando] = useState<"anual" | "pagados" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu && !info) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setMenu(false);
        setInfo(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menu, info]);

  async function exportarAnual() {
    if (exportando) return;
    setExportando("anual");
    try {
      const datos = construirExportCumplimientoAnualCliente({
        cliente,
        anio,
        getRegistro: (p) => getCumplimientoPeriodo(cliente.id, p),
      });
      await exportarCumplimientoAnualClientePdf(datos, cliente, anio);
    } finally {
      setExportando(null);
      setMenu(false);
    }
  }

  async function exportarPagados() {
    if (exportando) return;
    setExportando("pagados");
    try {
      const hist = getHistorialImpuestosCliente(cliente.id).filter(
        (h) => h.anio === anio
      );
      await exportarImpuestosPagadosClientePdf(
        cliente,
        anio,
        hist.map((h) => ({
          mes: h.mes,
          categoria: CATEGORIA_META[h.categoria]?.label ?? h.categoria,
          monto: h.monto,
          pagadoEn: h.pagadoEn,
        }))
      );
    } finally {
      setExportando(null);
      setMenu(false);
    }
  }

  return (
    <div ref={rootRef} className="relative flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          setMenu((v) => !v);
          setInfo(false);
        }}
        disabled={!!exportando}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        aria-label={`Exportar ${anio} en PDF`}
        aria-expanded={menu}
      >
        <DownloadIcon />
      </button>
      <button
        type="button"
        onClick={() => {
          setInfo((v) => !v);
          setMenu(false);
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600"
        aria-label="Qué se descarga"
        aria-expanded={info}
      >
        <span className="text-[13px] font-semibold leading-none">i</span>
      </button>

      {menu ? (
        <div className="absolute right-0 top-full mt-2 z-30 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 overflow-hidden">
          <button
            type="button"
            onClick={() => void exportarAnual()}
            className="w-full px-4 py-3 text-left text-[15px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            {exportando === "anual" ? "Preparando…" : "Cumplimiento anual"}
          </button>
          <button
            type="button"
            onClick={() => void exportarPagados()}
            className="w-full px-4 py-3 text-left text-[15px] font-semibold text-slate-800 hover:bg-slate-50 border-t border-slate-100"
          >
            {exportando === "pagados" ? "Preparando…" : "Impuestos pagados"}
          </button>
        </div>
      ) : null}

      {info ? (
        <div className="absolute right-0 top-full mt-2 z-30 w-64 rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[15px] font-semibold text-slate-900">
              Descargas {anio}
            </p>
            <button
              type="button"
              onClick={() => setInfo(false)}
              className="shrink-0 w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <XIcon />
            </button>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">
            El icono baja un PDF de {anio}: cumplimiento anual (estado de cada
            mes) o impuestos pagados (montos que ya liquidaste).
          </p>
        </div>
      ) : null}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
