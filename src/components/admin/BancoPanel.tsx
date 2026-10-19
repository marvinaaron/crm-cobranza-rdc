"use client";

import { useCallback, useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import {
  CUENTAS_BANCO_DESPACHO,
  formatFechaIso,
  periodoLabel,
  type Cliente,
  type CuentaBancoDespacho,
  type Periodo,
} from "@/lib/clientes";
import {
  isoFinAnio,
  isoFinPeriodo,
  isoInicioAnio,
  isoInicioPeriodo,
  listarMovimientosBancariosConFacturaRango,
  resumenFacturacionBanco,
  type MovimientoBancarioEnriquecido,
} from "@/lib/cobranza-caja";
import BotonFacturaCobranza from "@/components/BotonFacturaCobranza";
import BotonCorreoFactura from "@/components/admin/BotonCorreoFactura";
import ModalSubirFactura from "@/components/ModalSubirFactura";
import PanelDetalleCliente from "@/components/admin/PanelDetalleCliente";
import MenuFiltroIcono from "@/components/admin/MenuFiltroIcono";
import EncabezadoOrdenable from "@/components/admin/EncabezadoOrdenable";
import PillDeslizable from "@/components/ui/PillDeslizable";
import {
  alternarOrdenTabla,
  compararCeldasTabla,
  type OrdenTablaDir,
} from "@/lib/tabla-orden";
import { CampoFechaCaja } from "@/components/admin/CamposPago";

type SortKeyBanco =
  | "fecha"
  | "cliente"
  | "importe"
  | "meses"
  | "metodo"
  | "factura";
type VistaBanco = "mes" | "anio" | "rango";
type FiltroBanco = "todos" | "sin_factura";
type FiltroCuenta = "todas" | CuentaBancoDespacho;

function valorOrdenBanco(
  m: MovimientoBancarioEnriquecido,
  key: SortKeyBanco
): string | number {
  switch (key) {
    case "fecha":
      return m.fechaPago;
    case "cliente":
      return m.clienteNombre;
    case "importe":
      return m.monto;
    case "meses":
      return m.mesesPagadosLabel;
    case "metodo":
      return `${m.metodoLabel} ${m.cuentaLabel ?? ""}`;
    case "factura":
      return m.facturado ? 1 : 0;
  }
}

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

export default function BancoPanel() {
  const { listaClientes, periodo, facturas } = useClientes();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroBanco>("todos");
  const [vista, setVista] = useState<VistaBanco>("mes");
  const [cuentaFiltro, setCuentaFiltro] = useState<FiltroCuenta>("todas");
  const [rangoManual, setRangoManual] = useState<{ desde: string; hasta: string }>(
    () => ({ desde: isoInicioPeriodo(periodo), hasta: isoFinPeriodo(periodo) })
  );
  const [facturaModal, setFacturaModal] = useState<{
    cliente: Cliente;
    periodo: Periodo;
  } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [periodoPanel, setPeriodoPanel] = useState<Periodo | null>(null);
  const [sortKey, setSortKey] = useState<SortKeyBanco>("fecha");
  const [sortDir, setSortDir] = useState<OrdenTablaDir>("desc");

  const desde =
    vista === "anio"
      ? isoInicioAnio(periodo.anio)
      : vista === "rango"
        ? rangoManual.desde
        : isoInicioPeriodo(periodo);
  const hasta =
    vista === "anio"
      ? isoFinAnio(periodo.anio)
      : vista === "rango"
        ? rangoManual.hasta
        : isoFinPeriodo(periodo);

  const movimientos = useMemo(
    () =>
      listarMovimientosBancariosConFacturaRango(
        listaClientes,
        desde,
        hasta,
        facturas
      ),
    [listaClientes, desde, hasta, facturas]
  );

  const porCuenta = useMemo(() => {
    if (cuentaFiltro === "todas") return movimientos;
    return movimientos.filter((m) => m.cuentaBanco === cuentaFiltro);
  }, [movimientos, cuentaFiltro]);

  const resumen = useMemo(() => resumenFacturacionBanco(porCuenta), [porCuenta]);

  const filtrados = useMemo(() => {
    let lista = porCuenta;
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
            m.mesesPagadosLabel.toLowerCase().includes(q) ||
            m.metodoLabel.toLowerCase().includes(q) ||
            (m.cuentaLabel ?? "").toLowerCase().includes(q)
        );
    return [...buscados].sort((a, b) =>
      compararCeldasTabla(valorOrdenBanco(a, sortKey), valorOrdenBanco(b, sortKey), sortDir)
    );
  }, [porCuenta, filtro, busqueda, sortKey, sortDir]);

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

  const rangoLabel = useMemo(() => {
    if (vista === "mes") return periodoLabel(periodo);
    if (vista === "anio") return String(periodo.anio);
    if (desde === hasta) return formatFechaIso(desde);
    return `${formatFechaIso(desde)} – ${formatFechaIso(hasta)}`;
  }, [vista, periodo, desde, hasta]);

  const cuentaActivaLabel =
    cuentaFiltro === "todas"
      ? "Todas las cuentas"
      : CUENTAS_BANCO_DESPACHO.find((c) => c.id === cuentaFiltro)?.label ??
        cuentaFiltro;

  const abrirFactura = useCallback(
    (e: React.MouseEvent, clienteId: number, periodoAplicado: Periodo) => {
      e.stopPropagation();
      const cliente = clientesPorId.get(clienteId);
      if (cliente) setFacturaModal({ cliente, periodo: periodoAplicado });
    },
    [clientesPorId]
  );

  const abrirMovimiento = useCallback(
    (m: MovimientoBancarioEnriquecido) => {
      const c = clientesPorId.get(m.clienteId);
      if (c) {
        setSelectedClient(c);
        setPeriodoPanel(m.periodoAplicado);
      }
    },
    [clientesPorId]
  );

  const kpis = [
    {
      id: "ingreso",
      label: "Ingreso del periodo",
      value: `$${fmt(resumen.montoTotal)}`,
      detalle: rangoLabel,
      color: "text-emerald-600",
      onClick: undefined as undefined | (() => void),
    },
    {
      id: "movimientos",
      label: "Movimientos",
      value: String(resumen.movimientos),
      detalle: cuentaActivaLabel,
      color: "text-slate-900",
      onClick: undefined as undefined | (() => void),
    },
    {
      id: "factura",
      label: "Sin facturar",
      value: String(resumen.sinFactura),
      detalle:
        resumen.sinFactura > 0
          ? `$${fmt(resumen.montoSinFactura)}`
          : resumen.movimientos === 0
            ? "Sin ingresos"
            : "Todo facturado",
      color: resumen.sinFactura > 0 ? "text-amber-600" : "text-emerald-600",
      onClick: () =>
        setFiltro((f) => (f === "sin_factura" ? "todos" : "sin_factura")),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="px-1 lg:px-0">
        <div className="rounded-[1.25rem] bg-white overflow-hidden">
          <div className="grid grid-cols-3 grid-rows-[auto_auto_auto]">
            {kpis.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={card.onClick}
                disabled={!card.onClick}
                className={`min-w-0 grid grid-rows-subgrid row-span-3 px-3 py-4 sm:px-5 text-left transition-colors ${
                  card.onClick
                    ? filtro === "sin_factura"
                      ? "bg-slate-50"
                      : "active:bg-slate-50/80"
                    : "cursor-default"
                }`}
              >
                <p className="text-[11px] font-semibold text-slate-500 truncate">
                  {card.label}
                  {card.id === "factura" && filtro === "sin_factura" ? (
                    <span className="ml-1 text-slate-400">· filtro</span>
                  ) : null}
                </p>
                <p
                  className={`mt-1.5 text-[22px] sm:text-[26px] font-bold tabular-nums leading-none tracking-tight whitespace-nowrap ${card.color}`}
                >
                  {card.value}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-400 leading-snug truncate min-h-[1.25rem]">
                  {card.detalle}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[1.25rem] bg-white overflow-hidden">
        <div className="px-4 lg:px-5 py-4">
          <p className="text-[11px] font-semibold text-slate-500">
            Estado de cuenta
          </p>
          <p className="mt-1 text-[17px] font-bold tracking-tight text-slate-900">
            {cuentaActivaLabel} · {rangoLabel}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 leading-snug">
            Por fecha de pago. Meses pagados es el periodo de honorarios o extra
            al que se aplicó el abono.
          </p>
        </div>

        <div className="px-4 lg:px-5 pb-4 space-y-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <PillDeslizable
              acento="claro"
              size="sm"
              className="w-full lg:w-auto lg:min-w-[16rem]"
              value={vista}
              onChange={(v) => {
                if (v === "rango") {
                  setRangoManual({
                    desde:
                      vista === "anio"
                        ? isoInicioAnio(periodo.anio)
                        : isoInicioPeriodo(periodo),
                    hasta:
                      vista === "anio"
                        ? isoFinAnio(periodo.anio)
                        : isoFinPeriodo(periodo),
                  });
                }
                setVista(v);
              }}
              opciones={[
                { value: "mes", label: "Mes" },
                { value: "anio", label: "Año" },
                { value: "rango", label: "Rango" },
              ]}
            />
            <PillDeslizable
              acento="claro"
              size="sm"
              className="w-full lg:w-auto lg:min-w-[16rem]"
              value={cuentaFiltro}
              onChange={setCuentaFiltro}
              opciones={[
                { value: "todas", label: "Todas" },
                ...CUENTAS_BANCO_DESPACHO.map((c) => ({
                  value: c.id,
                  label: c.label,
                })),
              ]}
            />
          </div>

          {vista === "rango" ? (
            <div className="grid grid-cols-2 gap-2 max-w-md min-w-0">
              <CampoFechaCaja
                label="Desde"
                value={rangoManual.desde}
                onChange={(v) =>
                  setRangoManual((r) => ({ ...r, desde: v }))
                }
                max={rangoManual.hasta}
              />
              <CampoFechaCaja
                label="Hasta"
                value={rangoManual.hasta}
                onChange={(v) =>
                  setRangoManual((r) => ({ ...r, hasta: v }))
                }
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cliente, RFC o mes…"
              className="h-10 w-full sm:flex-1 sm:min-w-[12rem] mr-auto px-4 rounded-full bg-slate-100 text-[13px] font-medium text-slate-800 outline-none"
            />
            <MenuFiltroIcono
              grupos={[
                {
                  modo: "single",
                  valorPorDefecto: "todos",
                  opciones: [
                    { id: "todos", label: "Todos" },
                    {
                      id: "sin_factura",
                      label: "Sin factura",
                      count: resumen.sinFactura || undefined,
                    },
                  ],
                  seleccion: [filtro],
                  onChange: (ids) =>
                    setFiltro((ids[0] as FiltroBanco) ?? "todos"),
                },
              ]}
            />
          </div>
        </div>

        {filtrados.length === 0 ? (
          <p className="text-center py-12 text-[13px] font-medium text-slate-400">
            {movimientos.length === 0
              ? "Sin ingresos en este periodo"
              : filtro === "sin_factura"
                ? "No hay movimientos pendientes de facturar"
                : "Sin resultados para esta búsqueda"}
          </p>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto px-4 lg:px-5 pb-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-3">
                      <EncabezadoOrdenable
                        label="Fecha de pago"
                        activo={sortKey === "fecha"}
                        dir={sortDir}
                        onClick={() => toggleSort("fecha")}
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
                        label="Cliente"
                        activo={sortKey === "cliente"}
                        dir={sortDir}
                        onClick={() => toggleSort("cliente")}
                      />
                    </th>
                    <th className="py-2 pr-3">
                      <EncabezadoOrdenable
                        label="Meses pagados"
                        activo={sortKey === "meses"}
                        dir={sortDir}
                        onClick={() => toggleSort("meses")}
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
                      onClick={() => abrirMovimiento(m)}
                    >
                      <td className="py-2.5 pr-3 font-medium text-slate-600 tabular-nums whitespace-nowrap">
                        {formatFechaIso(m.fechaPago)}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-bold text-emerald-600 tabular-nums whitespace-nowrap">
                        ${fmt(m.monto)}
                      </td>
                      <td className="py-2.5 pr-3 min-w-[140px]">
                        <p className="font-semibold text-slate-900 leading-tight">
                          {m.clienteNombre}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {m.rfc}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${claseCategoria(m.categoria)}`}
                        >
                          {m.mesesPagadosLabel}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <p className="text-[12px] font-medium text-slate-600">
                          {m.metodoLabel}
                        </p>
                        {m.cuentaLabel ? (
                          <p className="text-[11px] text-slate-400">
                            {m.cuentaLabel}
                          </p>
                        ) : null}
                      </td>
                      <td
                        className="py-2.5 pr-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-center gap-1">
                          <BotonFacturaCobranza
                            factura={m.factura}
                            pagadoMes
                            onClick={(e) =>
                              abrirFactura(e, m.clienteId, m.periodoAplicado)
                            }
                          />
                          {clientesPorId.get(m.clienteId) && (
                            <BotonCorreoFactura
                              cliente={clientesPorId.get(m.clienteId)!}
                              periodo={m.periodoAplicado}
                              factura={m.factura}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td className="py-3 pr-3 text-[11px] font-semibold text-slate-500">
                      Total visible
                    </td>
                    <td className="py-3 pr-3 text-right text-[22px] font-bold tracking-tight text-emerald-600 tabular-nums">
                      ${fmt(totalVisible)}
                    </td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              </table>
            </div>

            <ul className="lg:hidden space-y-2 px-4 pb-4">
              {filtrados.map((m) => (
                <li key={m.id}>
                  <div className="rounded-[1.25rem] bg-slate-50 px-3.5 py-3">
                    <button
                      type="button"
                      onClick={() => abrirMovimiento(m)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold text-slate-900 truncate">
                            {m.clienteNombre}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {formatFechaIso(m.fechaPago)}
                            {m.cuentaLabel ? ` · ${m.cuentaLabel}` : ` · ${m.metodoLabel}`}
                          </p>
                        </div>
                        <p className="text-[17px] font-bold text-emerald-600 tabular-nums shrink-0">
                          ${fmt(m.monto)}
                        </p>
                      </div>
                      <p className="mt-1.5 text-[11px] font-semibold text-slate-500">
                        {m.mesesPagadosLabel}
                      </p>
                    </button>
                    <div className="mt-2 pt-2 border-t border-slate-100/80 flex justify-end gap-1">
                      <BotonFacturaCobranza
                        factura={m.factura}
                        pagadoMes
                        onClick={(e) =>
                          abrirFactura(e, m.clienteId, m.periodoAplicado)
                        }
                      />
                      {clientesPorId.get(m.clienteId) && (
                        <BotonCorreoFactura
                          cliente={clientesPorId.get(m.clienteId)!}
                          periodo={m.periodoAplicado}
                          factura={m.factura}
                        />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
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
