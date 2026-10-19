"use client";

import { useCallback, useMemo, useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import { periodoLabel } from "@/lib/clientes";
import { formatFechaComprobante } from "@/lib/comprobantes";
import {
  listarMovimientosBancariosMes,
  type MovimientoBancarioCobranza,
} from "@/lib/cobranza-caja";
import EncabezadoOrdenable from "@/components/admin/EncabezadoOrdenable";
import {
  alternarOrdenTabla,
  compararCeldasTabla,
  type OrdenTablaDir,
} from "@/lib/tabla-orden";

type SortKeyCaja = "fecha" | "cliente" | "importe" | "aplicado" | "metodo";

function valorOrdenCaja(m: MovimientoBancarioCobranza, key: SortKeyCaja): string | number {
  switch (key) {
    case "fecha":
      return m.fechaPago;
    case "cliente":
      return m.clienteNombre;
    case "importe":
      return m.monto;
    case "aplicado":
      return m.categoriaLabel;
    case "metodo":
      return m.metodoLabel;
  }
}

type Props = {
  clientes: Cliente[];
  periodo: Periodo;
  onSelectCliente?: (cliente: Cliente) => void;
};

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function claseCategoria(cat: string): string {
  switch (cat) {
    case "honorarios":
      return "bg-emerald-50 text-emerald-700";
    case "extra":
      return "bg-amber-50 text-amber-700";
    case "adicional":
      return "bg-violet-50 text-violet-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function EstadoCuentaCajaCobranza({
  clientes,
  periodo,
  onSelectCliente,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [sortKey, setSortKey] = useState<SortKeyCaja>("fecha");
  const [sortDir, setSortDir] = useState<OrdenTablaDir>("desc");

  const movimientos = useMemo(
    () => listarMovimientosBancariosMes(clientes, periodo),
    [clientes, periodo]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const buscados = !q
      ? movimientos
      : movimientos.filter(
          (m) =>
            m.clienteNombre.toLowerCase().includes(q) ||
            m.rfc.toLowerCase().includes(q) ||
            m.categoriaLabel.toLowerCase().includes(q) ||
            m.metodoLabel.toLowerCase().includes(q)
        );
    return [...buscados].sort((a, b) =>
      compararCeldasTabla(valorOrdenCaja(a, sortKey), valorOrdenCaja(b, sortKey), sortDir)
    );
  }, [movimientos, busqueda, sortKey, sortDir]);

  const toggleSort = useCallback((key: SortKeyCaja) => {
    setSortKey((prevKey) => {
      setSortDir((prevDir) =>
        alternarOrdenTabla(
          prevKey,
          key,
          prevDir,
          key === "fecha" || key === "importe" ? "desc" : "asc"
        )
      );
      return key;
    });
  }, []);

  const total = useMemo(
    () => filtrados.reduce((acc, m) => acc + m.monto, 0),
    [filtrados]
  );

  const clientesPorId = useMemo(() => {
    const map = new Map<number, Cliente>();
    for (const c of clientes) map.set(c.id, c);
    return map;
  }, [clientes]);

  const mesLabel = periodoLabel(periodo);

  return (
    <section className="mb-6 lg:mb-8 px-1 lg:px-0">
      <div className="rounded-[1.25rem] bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-label={abierto ? "Ocultar ingresos del mes" : "Mostrar ingresos del mes"}
          className="w-full flex items-center justify-between gap-3 px-4 lg:px-5 py-4 text-left active:bg-slate-50/80 dark:active:bg-[#3c3c3e]"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500">
              Estado de cuenta · Caja
            </p>
            <p className="mt-1 text-[17px] font-bold tracking-tight text-slate-900">
              Ingresos de {mesLabel}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 leading-snug">
              Por fecha de pago (cuándo entró el dinero). La columna &quot;Aplicado a&quot; indica
              qué mes de honorarios se liquidó.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[22px] sm:text-[26px] font-bold tabular-nums leading-none tracking-tight text-emerald-600">
                ${fmt(total)}
              </p>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {filtrados.length} mov.{filtrados.length === 1 ? "" : "s"}
              </p>
            </div>
            <span
              className={`text-slate-300 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </button>

        {abierto && (
          <div className="p-4 lg:p-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cliente, RFC o concepto…"
                className="flex-1 h-10 px-3 rounded-full bg-slate-100 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            {filtrados.length === 0 ? (
              <p className="text-center py-10 text-[13px] font-medium text-slate-400">
                {movimientos.length === 0
                  ? "Sin ingresos registrados con fecha de pago en este mes"
                  : "Sin resultados para esta búsqueda"}
              </p>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                        <th className="py-2 pr-3">
                          <EncabezadoOrdenable
                            label="Fecha"
                            activo={sortKey === "fecha"}
                            dir={sortDir}
                            onClick={() => toggleSort("fecha")}
                          />
                        </th>
                        <th className="py-2 pr-3">
                          <EncabezadoOrdenable
                            label="Cliente"
                            activo={sortKey === "cliente"}
                            dir={sortDir}
                            onClick={() => toggleSort("cliente")}
                          />
                        </th>
                        <th className="py-2 pr-3 text-right">
                          <EncabezadoOrdenable
                            label="Importe"
                            activo={sortKey === "importe"}
                            dir={sortDir}
                            onClick={() => toggleSort("importe")}
                            align="right"
                          />
                        </th>
                        <th className="py-2 pr-3">
                          <EncabezadoOrdenable
                            label="Aplicado a"
                            activo={sortKey === "aplicado"}
                            dir={sortDir}
                            onClick={() => toggleSort("aplicado")}
                          />
                        </th>
                        <th className="py-2 pr-3">
                          <EncabezadoOrdenable
                            label="Método"
                            activo={sortKey === "metodo"}
                            dir={sortDir}
                            onClick={() => toggleSort("metodo")}
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtrados.map((m) => (
                        <tr
                          key={m.id}
                          className={
                            onSelectCliente
                              ? "hover:bg-slate-50/80 cursor-pointer"
                              : undefined
                          }
                          onClick={() => {
                            const c = clientesPorId.get(m.clienteId);
                            if (c && onSelectCliente) onSelectCliente(c);
                          }}
                        >
                          <td className="py-2.5 pr-3 font-medium text-slate-600 tabular-nums whitespace-nowrap">
                            {formatFechaComprobante(m.fechaPago)}
                          </td>
                          <td className="py-2.5 pr-3 min-w-[140px]">
                            <p className="font-semibold text-slate-900 leading-tight">
                              {m.clienteNombre}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">
                              {m.rfc}
                            </p>
                          </td>
                          <td className="py-2.5 pr-3 text-right font-bold text-emerald-600 tabular-nums whitespace-nowrap">
                            ${fmt(m.monto)}
                          </td>
                          <td className="py-2.5 pr-3">
                            <span
                              className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${claseCategoria(m.categoria)}`}
                            >
                              {m.categoriaLabel}
                            </span>
                            {m.nota && (
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                                {m.nota}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 text-[12px] font-medium text-slate-500 whitespace-nowrap">
                            {m.metodoLabel}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-100 bg-slate-50">
                        <td colSpan={2} className="py-3 pr-3 text-[11px] font-semibold text-slate-500">
                          Total visible
                        </td>
                        <td className="py-3 pr-3 text-right text-[22px] font-bold tracking-tight text-emerald-600 tabular-nums">
                          ${fmt(total)}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <ul className="lg:hidden space-y-2">
                  {filtrados.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          const c = clientesPorId.get(m.clienteId);
                          if (c && onSelectCliente) onSelectCliente(c);
                        }}
                        className="w-full text-left rounded-[1.25rem] bg-slate-50 px-3.5 py-3 active:scale-[0.99] transition-transform"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[15px] font-semibold text-slate-900 truncate">
                              {m.clienteNombre}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {formatFechaComprobante(m.fechaPago)} · {m.metodoLabel}
                            </p>
                          </div>
                          <p className="text-[17px] font-bold text-emerald-600 tabular-nums shrink-0">
                            ${fmt(m.monto)}
                          </p>
                        </div>
                        <p className="mt-1.5 text-[11px] font-semibold text-slate-500">
                          {m.categoriaLabel}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
