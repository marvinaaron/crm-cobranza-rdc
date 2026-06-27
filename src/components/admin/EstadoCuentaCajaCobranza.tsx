"use client";

import { useMemo, useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import { periodoLabel } from "@/lib/clientes";
import { formatFechaComprobante } from "@/lib/comprobantes";
import { listarMovimientosBancariosMes } from "@/lib/cobranza-caja";

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
      return "bg-emerald-100 text-emerald-800";
    case "extra":
      return "bg-amber-100 text-amber-800";
    case "adicional":
      return "bg-violet-100 text-violet-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function EstadoCuentaCajaCobranza({
  clientes,
  periodo,
  onSelectCliente,
}: Props) {
  const [abierto, setAbierto] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const movimientos = useMemo(
    () => listarMovimientosBancariosMes(clientes, periodo),
    [clientes, periodo]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return movimientos;
    return movimientos.filter(
      (m) =>
        m.clienteNombre.toLowerCase().includes(q) ||
        m.rfc.toLowerCase().includes(q) ||
        m.categoriaLabel.toLowerCase().includes(q) ||
        m.metodoLabel.toLowerCase().includes(q)
    );
  }, [movimientos, busqueda]);

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
      <div className="rounded-2xl lg:rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 lg:px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-left"
        >
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
              Estado de cuenta · Caja
            </p>
            <p className="text-base lg:text-lg font-black text-white tracking-tight">
              Ingresos de {mesLabel}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">
              Por fecha de pago (cuándo entró el dinero). La columna &quot;Aplicado a&quot; indica
              qué mes de honorarios se liquidó.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl lg:text-2xl font-black text-emerald-400 tabular-nums">
              ${fmt(total)}
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              {filtrados.length} mov.{filtrados.length === 1 ? "" : "s"}
            </p>
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
                className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {filtrados.length === 0 ? (
              <p className="text-center py-10 text-[11px] font-bold uppercase tracking-widest text-slate-300">
                {movimientos.length === 0
                  ? "Sin ingresos registrados con fecha de pago en este mes"
                  : "Sin resultados para esta búsqueda"}
              </p>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="py-2 pr-3">Fecha</th>
                        <th className="py-2 pr-3">Cliente</th>
                        <th className="py-2 pr-3 text-right">Importe</th>
                        <th className="py-2 pr-3">Aplicado a</th>
                        <th className="py-2 pr-3">Método</th>
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
                          <td className="py-2.5 pr-3 font-bold text-slate-600 tabular-nums whitespace-nowrap">
                            {formatFechaComprobante(m.fechaPago)}
                          </td>
                          <td className="py-2.5 pr-3 min-w-[140px]">
                            <p className="font-black text-slate-800 leading-tight">
                              {m.clienteNombre}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 uppercase">
                              {m.rfc}
                            </p>
                          </td>
                          <td className="py-2.5 pr-3 text-right font-black text-emerald-700 tabular-nums whitespace-nowrap">
                            ${fmt(m.monto)}
                          </td>
                          <td className="py-2.5 pr-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${claseCategoria(m.categoria)}`}
                            >
                              {m.categoriaLabel}
                            </span>
                            {m.nota && (
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                                {m.nota}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            {m.metodoLabel}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50">
                        <td colSpan={2} className="py-3 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Total visible
                        </td>
                        <td className="py-3 pr-3 text-right text-lg font-black text-emerald-700 tabular-nums">
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
                        className="w-full text-left rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3 active:scale-[0.99] transition-transform"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">
                              {m.clienteNombre}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {formatFechaComprobante(m.fechaPago)} · {m.metodoLabel}
                            </p>
                          </div>
                          <p className="text-base font-black text-emerald-700 tabular-nums shrink-0">
                            ${fmt(m.monto)}
                          </p>
                        </div>
                        <p className="mt-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
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
