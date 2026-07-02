"use client";

import { useCallback, useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { formatFechaComprobante } from "@/lib/comprobantes";
import {
  listarMovimientosBancariosConFactura,
  resumenFacturacionBanco,
  type MovimientoBancarioEnriquecido,
} from "@/lib/cobranza-caja";
import BotonFacturaCobranza from "@/components/BotonFacturaCobranza";
import ModalSubirFactura from "@/components/ModalSubirFactura";
import PanelDetalleCliente from "@/components/admin/PanelDetalleCliente";
import EncabezadoOrdenable from "@/components/admin/EncabezadoOrdenable";
import {
  alternarOrdenTabla,
  compararCeldasTabla,
  type OrdenTablaDir,
} from "@/lib/tabla-orden";

type SortKeyBanco = "fecha" | "cliente" | "importe" | "aplicado" | "metodo" | "factura";

function valorOrdenBanco(m: MovimientoBancarioEnriquecido, key: SortKeyBanco): string | number {
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
    case "factura":
      return m.facturado ? 1 : 0;
  }
}

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

type FiltroBanco = "todos" | "sin_factura";

export default function BancoPanel() {
  const { listaClientes, periodo, facturas } = useClientes();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroBanco>("todos");
  const [facturaModal, setFacturaModal] = useState<{ cliente: Cliente; periodo: Periodo } | null>(
    null
  );
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [periodoPanel, setPeriodoPanel] = useState<Periodo | null>(null);
  const [sortKey, setSortKey] = useState<SortKeyBanco>("fecha");
  const [sortDir, setSortDir] = useState<OrdenTablaDir>("desc");

  const movimientos = useMemo(
    () => listarMovimientosBancariosConFactura(listaClientes, periodo, facturas),
    [listaClientes, periodo, facturas]
  );

  const resumen = useMemo(() => resumenFacturacionBanco(movimientos), [movimientos]);

  const filtrados = useMemo(() => {
    let lista = movimientos;
    if (filtro === "sin_factura") {
      lista = lista.filter((m) => !m.facturado);
    }
    const q = busqueda.trim().toLowerCase();
    const buscados = !q
      ? lista
      : lista.filter(
          (m) =>
            m.clienteNombre.toLowerCase().includes(q) ||
            m.rfc.toLowerCase().includes(q) ||
            m.categoriaLabel.toLowerCase().includes(q) ||
            m.metodoLabel.toLowerCase().includes(q)
        );
    return [...buscados].sort((a, b) =>
      compararCeldasTabla(valorOrdenBanco(a, sortKey), valorOrdenBanco(b, sortKey), sortDir)
    );
  }, [movimientos, filtro, busqueda, sortKey, sortDir]);

  const toggleSort = useCallback((key: SortKeyBanco) => {
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

  const totalVisible = useMemo(
    () => filtrados.reduce((acc, m) => acc + m.monto, 0),
    [filtrados]
  );

  const clientesPorId = useMemo(() => {
    const map = new Map<number, Cliente>();
    for (const c of listaClientes) map.set(c.id, c);
    return map;
  }, [listaClientes]);

  const mesLabel = periodoLabel(periodo);

  const abrirFactura = useCallback(
    (e: React.MouseEvent, clienteId: number, periodoAplicado: Periodo) => {
      e.stopPropagation();
      const cliente = clientesPorId.get(clienteId);
      if (cliente) setFacturaModal({ cliente, periodo: periodoAplicado });
    },
    [clientesPorId]
  );

  const verificarFacturacion = useCallback(() => {
    if (resumen.todoFacturado) return;
    setFiltro("sin_factura");
    document.getElementById("tabla-banco")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [resumen.todoFacturado]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
            Ingreso bancario
          </p>
          <p className="text-3xl font-black text-emerald-400 tabular-nums mt-1">
            ${fmt(resumen.montoTotal)}
          </p>
          <p className="text-[11px] font-bold text-slate-400 mt-1">
            {resumen.movimientos} movimiento{resumen.movimientos === 1 ? "" : "s"} en {mesLabel}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-5 shadow-sm lg:col-span-2 ${
            resumen.movimientos === 0
              ? "border-slate-200 bg-slate-50"
              : resumen.todoFacturado
                ? "border-emerald-200 bg-emerald-50/80"
                : "border-amber-200 bg-amber-50/80"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
                Control de facturación
              </p>
              {resumen.movimientos === 0 ? (
                <p className="text-lg font-black text-slate-600 mt-1">
                  Sin ingresos registrados este mes
                </p>
              ) : resumen.todoFacturado ? (
                <p className="text-lg font-black text-emerald-800 mt-1">
                  Todo facturado
                </p>
              ) : (
                <>
                  <p className="text-lg font-black text-amber-900 mt-1">
                    Faltan {resumen.sinFactura} por facturar
                  </p>
                  <p className="text-[11px] font-bold text-amber-700/90 mt-0.5">
                    ${fmt(resumen.montoSinFactura)} sin factura · {resumen.conFactura} ya
                    facturado{resumen.conFactura === 1 ? "" : "s"}
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={verificarFacturacion}
              disabled={resumen.movimientos === 0}
              className={`shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                resumen.movimientos === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : resumen.todoFacturado
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200"
                    : "bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-200"
              }`}
            >
              {resumen.movimientos === 0 ? (
                "Sin movimientos"
              ) : resumen.todoFacturado ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Todo facturado
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Ver pendientes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <section
        id="tabla-banco"
        className="rounded-2xl lg:rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="px-4 lg:px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
            Detalle real · Caja
          </p>
          <p className="text-base lg:text-lg font-black text-slate-800 tracking-tight">
            Movimientos de {mesLabel}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">
            Por fecha de pago (cuándo entró el dinero). &quot;Aplicado a&quot; indica el periodo de
            honorarios liquidado; la factura se valida contra ese periodo.
          </p>
        </div>

        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cliente, RFC o concepto…"
              className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <div className="flex rounded-xl border border-slate-200 p-0.5 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setFiltro("todos")}
                className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                  filtro === "todos"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFiltro("sin_factura")}
                className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                  filtro === "sin_factura"
                    ? "bg-amber-600 text-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sin factura
                {resumen.sinFactura > 0 ? ` (${resumen.sinFactura})` : ""}
              </button>
            </div>
          </div>

          {filtrados.length === 0 ? (
            <p className="text-center py-12 text-[11px] font-bold uppercase tracking-widest text-slate-300">
              {movimientos.length === 0
                ? "Sin ingresos registrados con fecha de pago en este mes"
                : filtro === "sin_factura"
                  ? "No hay movimientos pendientes de facturar"
                  : "Sin resultados para esta búsqueda"}
            </p>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
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
                      <th className="py-2 pr-3 text-center">
                        <EncabezadoOrdenable
                          label="Factura"
                          activo={sortKey === "factura"}
                          dir={sortDir}
                          onClick={() => toggleSort("factura")}
                          align="center"
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtrados.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50/80 cursor-pointer"
                        onClick={() => {
                          const c = clientesPorId.get(m.clienteId);
                          if (c) {
                            setSelectedClient(c);
                            setPeriodoPanel(m.periodoAplicado);
                          }
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
                        <td className="py-2.5 pr-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <BotonFacturaCobranza
                            factura={m.factura}
                            pagadoMes
                            onClick={(e) => abrirFactura(e, m.clienteId, m.periodoAplicado)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td
                        colSpan={2}
                        className="py-3 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-500"
                      >
                        Total visible
                      </td>
                      <td className="py-3 pr-3 text-right text-lg font-black text-emerald-700 tabular-nums">
                        ${fmt(totalVisible)}
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <ul className="lg:hidden space-y-2">
                {filtrados.map((m) => (
                  <li key={m.id}>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          const c = clientesPorId.get(m.clienteId);
                          if (c) {
                            setSelectedClient(c);
                            setPeriodoPanel(m.periodoAplicado);
                          }
                        }}
                        className="w-full text-left"
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
                      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                        <BotonFacturaCobranza
                          factura={m.factura}
                          pagadoMes
                          onClick={(e) => abrirFactura(e, m.clienteId, m.periodoAplicado)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {facturaModal && (
        <ModalSubirFactura
          cliente={facturaModal.cliente}
          periodo={facturaModal.periodo}
          onClose={() => setFacturaModal(null)}
        />
      )}

      {selectedClient && (
        <PanelDetalleCliente
          cliente={selectedClient}
          periodoVisible={periodoPanel ?? periodo}
          onClose={() => {
            setSelectedClient(null);
            setPeriodoPanel(null);
          }}
          onAbrirFactura={(p) =>
            setFacturaModal({ cliente: selectedClient, periodo: p })
          }
          onAbrirIngresoExtra={() => {}}
        />
      )}
    </div>
  );
}
