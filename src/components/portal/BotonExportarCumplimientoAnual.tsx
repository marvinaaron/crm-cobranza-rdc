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
  const [abreDerecha, setAbreDerecha] = useState(true);
  const [exportando, setExportando] = useState<"anual" | "pagados" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menu]);

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

  function toggleMenu() {
    if (menu) {
      setMenu(false);
      return;
    }
    const r = btnRef.current?.getBoundingClientRect();
    const menuW = 224;
    const margen = 12;
    const cabeDerecha = r
      ? r.left + menuW <= window.innerWidth - margen
      : true;
    setAbreDerecha(cabeDerecha);
    setMenu(true);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={toggleMenu}
        disabled={!!exportando}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        aria-label={`Exportar ${anio} en PDF`}
        aria-expanded={menu}
      >
        <DownloadIcon />
      </button>

      {menu ? (
        <div
          className={`absolute top-full mt-2 z-30 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 overflow-hidden ${
            abreDerecha ? "left-0" : "right-0"
          }`}
        >
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

