"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useClientes } from "@/context/ClientesContext";
import {
  calcularKpisDashboard,
  calcularResumenAnual,
  listarPrincipalesMorosos,
  listarPagosSinFactura,
  etiquetaPeriodoDashboard,
  esPeriodoActual,
  construirResumenExcel,
} from "@/lib/dashboard-metrics";
import * as XLSX from "xlsx";
import {
  periodoLabel,
  esIngresoGeneralCliente,
  fechaNacimientoDeRFC,
  formatearFechaNacimientoCorta,
  MESES_NOM,
} from "@/lib/clientes";
import GraficoBarrasAnual from "@/components/dashboard/GraficoBarrasAnual";
import GraficoCrecimientoClientes from "@/components/dashboard/GraficoCrecimientoClientes";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

function BarraProgreso({
  valor,
  color,
  etiqueta,
}: {
  valor: number;
  color: string;
  etiqueta: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {etiqueta}
        </span>
        <span className={`text-lg font-black tabular-nums ${color}`}>{valor}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            valor >= 80 ? "bg-emerald-500" : valor >= 50 ? "bg-amber-400" : "bg-red-500"
          }`}
          style={{ width: `${Math.min(100, valor)}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const {
    listaClientes,
    periodo,
    periodoHoy,
    comprobantesNuevos,
    irAPeriodoActual,
    facturas,
  } = useClientes();

  const kpis = useMemo(
    () => calcularKpisDashboard(listaClientes, periodo, periodoHoy, facturas),
    [listaClientes, periodo, periodoHoy, facturas]
  );

  const mesesAnio = useMemo(
    () => calcularResumenAnual(listaClientes, periodo.anio, periodoHoy),
    [listaClientes, periodo.anio, periodoHoy]
  );

  const morosos = useMemo(
    () => listarPrincipalesMorosos(listaClientes, periodo),
    [listaClientes, periodo]
  );

  const pagosSinFactura = useMemo(
    () => listarPagosSinFactura(listaClientes, periodo, facturas),
    [listaClientes, periodo, facturas]
  );

  /**
   * Clientes activos cuyo cumpleaños cae en el mes actual.
   * - Ordenados: hoy primero, luego próximos por día ascendente, luego ya pasados.
   * - `diasParaCumple` es positivo si aún falta; 0 si es hoy; negativo si ya pasó.
   */
  const cumplesDelMes = useMemo(() => {
    const hoy = new Date();
    const mesHoy = hoy.getMonth();
    const diaHoy = hoy.getDate();
    const items = listaClientes
      .filter((c) => c.activo && !esIngresoGeneralCliente(c))
      .map((c) => {
        const fecha = fechaNacimientoDeRFC(c.rfc, c.esPersonaMoral);
        if (!fecha || fecha.mes !== mesHoy) return null;
        return { cliente: c, fecha, diasParaCumple: fecha.dia - diaHoy };
      })
      .filter(
        (x): x is { cliente: typeof listaClientes[number]; fecha: { mes: number; dia: number; anio: number }; diasParaCumple: number } => x !== null
      );
    items.sort((a, b) => {
      const ka = a.diasParaCumple < 0 ? 9999 - a.diasParaCumple : a.diasParaCumple;
      const kb = b.diasParaCumple < 0 ? 9999 - b.diasParaCumple : b.diasParaCumple;
      return ka - kb;
    });
    return items;
  }, [listaClientes]);

  const mesActualNombre = useMemo(() => {
    return MESES_NOM[new Date().getMonth()];
  }, []);

  const tasaFacturacion =
    kpis.cobradoMes > 0
      ? Math.round((kpis.facturadoMes / kpis.cobradoMes) * 100)
      : 100;

  const esActual = esPeriodoActual(periodo, periodoHoy);
  const totalEstados =
    kpis.clientesCorrientes + kpis.clientesPendientes + kpis.clientesAtrasados;

  const descargarResumenExcel = () => {
    const { resumen, detalle } = construirResumenExcel(
      listaClientes,
      periodo,
      kpis
    );
    const wb = XLSX.utils.book_new();
    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    const wsDetalle = XLSX.utils.json_to_sheet(detalle);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
    XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle por cliente");
    XLSX.writeFile(
      wb,
      `resumen-cobranza-${periodo.anio}-${String(periodo.mes + 1).padStart(2, "0")}.xlsx`
    );
  };

  const tarjetas = [
    {
      label: `Honorarios (${periodoLabel(periodo).split(" ")[0]})`,
      value: fmt(kpis.cobradoMes),
      sub: `${kpis.tasaCobranzaMes}% del compromiso del mes`,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      label: `Facturación (${periodoLabel(periodo).split(" ")[0]})`,
      value: fmt(kpis.facturadoMes),
      sub:
        kpis.pendienteFacturarMes > 0
          ? `Falta facturar ${fmt(kpis.pendienteFacturarMes)} · ${kpis.pagosSinFacturaMes} cliente${kpis.pagosSinFacturaMes === 1 ? "" : "s"}`
          : kpis.cobradoMes > 0
            ? "Todos los ingresos facturados"
            : "Sin ingresos este mes",
      color:
        kpis.pendienteFacturarMes > 0 ? "text-violet-600" : "text-emerald-600",
      bg:
        kpis.pendienteFacturarMes > 0
          ? "bg-violet-50 border-violet-100"
          : "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Por cobrar (mes)",
      value: fmt(kpis.porCobrarMes),
      sub: "Honorarios del mes sin cubrir",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    },
    {
      label: "Pendiente acumulado",
      value: fmt(kpis.pendienteAcumulado),
      sub: "Saldo total hasta el periodo",
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100",
    },
    {
      label: "Clientes atrasados",
      value: String(kpis.clientesAtrasados),
      sub: `de ${kpis.clientesActivos} activos en operación`,
      color: "text-red-600",
      bg: "bg-red-50 border-red-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">
            Panel ejecutivo
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-800">
            Dashboard
          </h1>
          <p className="text-slate-400 font-bold mt-2 text-sm">
            <span className="font-black text-blue-600">
              {etiquetaPeriodoDashboard(periodo)}
            </span>
            {!esActual && (
              <span className="ml-2 text-amber-600">· periodo histórico</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!esActual && (
            <button
              type="button"
              onClick={irAPeriodoActual}
              className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800"
            >
              Ir a mes actual
            </button>
          )}
          <button
            type="button"
            onClick={descargarResumenExcel}
            className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Exportar Excel
          </button>
          <Link
            href="/cobranza"
            className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"
          >
            Ir a cobranza
            {comprobantesNuevos > 0 && (
              <span className="ml-1.5 inline-flex min-w-[18px] h-[18px] px-1 rounded-full bg-white text-emerald-700 text-[8px] items-center justify-center">
                {comprobantesNuevos}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {tarjetas.map((card) => (
          <div
            key={card.label}
            className={`p-6 rounded-[2rem] border shadow-sm ${card.bg}`}
          >
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">
              {card.label}
            </p>
            <p className={`text-3xl font-black tabular-nums ${card.color}`}>
              {card.value}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-2 leading-snug">
              {card.sub}
            </p>
          </div>
        ))}
        <div className="p-6 rounded-[2rem] border shadow-sm bg-slate-50 border-slate-100 flex flex-col justify-center gap-3">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
            Extras del mes
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-violet-600">
                Adicionales
              </span>
              <span className="text-base font-black text-violet-700 tabular-nums">
                {fmt(kpis.adicionalesMes)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-600">
                Descuentos
              </span>
              <span className="text-base font-black text-rose-700 tabular-nums">
                {fmt(kpis.descuentosMes)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 min-w-0 flex flex-col h-full">
          <GraficoBarrasAnual meses={mesesAnio} anio={periodo.anio} />
        </div>

        <div className="flex flex-col gap-6 min-w-0 h-full">
          <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-7">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Cobranza y facturación
            </p>
            <div className="space-y-6">
              <BarraProgreso
                valor={kpis.tasaCobranzaMes}
                color="text-emerald-600"
                etiqueta="Cobrado del mes"
              />
              <BarraProgreso
                valor={tasaFacturacion}
                color="text-violet-600"
                etiqueta="Facturado del cobrado"
              />
              <BarraProgreso
                valor={kpis.tasaCobranzaAnual}
                color="text-indigo-600"
                etiqueta={`Acumulado ${periodo.anio}`}
              />
            </div>
            <div className="mt-6 pt-5 border-t border-slate-50 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Cobrado {periodo.anio}
                </p>
                <p className="text-base font-black text-emerald-600 tabular-nums">
                  {fmt(kpis.cobradoAnual)}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Facturado {periodo.anio}
                </p>
                <p className="text-base font-black text-violet-600 tabular-nums">
                  {fmt(kpis.facturadoAnual)}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Esperado {periodo.anio}
                </p>
                <p className="text-base font-black text-slate-700 tabular-nums">
                  {fmt(kpis.compromisoAnual)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-7">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Cartera por estatus
            </p>
            {totalEstados === 0 ? (
              <p className="text-sm font-bold text-slate-400">Sin clientes activos.</p>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: "Al corriente",
                    n: kpis.clientesCorrientes,
                    pct: Math.round((kpis.clientesCorrientes / totalEstados) * 100),
                    bar: "bg-emerald-500",
                    text: "text-emerald-700",
                  },
                  {
                    label: "Pendiente",
                    n: kpis.clientesPendientes,
                    pct: Math.round((kpis.clientesPendientes / totalEstados) * 100),
                    bar: "bg-amber-400",
                    text: "text-amber-700",
                  },
                  {
                    label: "Atrasado",
                    n: kpis.clientesAtrasados,
                    pct: Math.round((kpis.clientesAtrasados / totalEstados) * 100),
                    bar: "bg-red-500",
                    text: "text-red-700",
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                      <span className={row.text}>{row.label}</span>
                      <span className="text-slate-500">
                        {row.n} · {row.pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.bar}`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {cumplesDelMes.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-violet-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 lg:px-8 lg:py-5 border-b border-violet-50 flex flex-wrap justify-between items-center gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest">
                Recordatorio
              </p>
              <h2 className="text-base lg:text-lg font-black text-slate-800 uppercase tracking-tight">
                🎂 Cumpleaños de {mesActualNombre}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                {cumplesDelMes.length} cliente{cumplesDelMes.length === 1 ? "" : "s"} cumple{cumplesDelMes.length === 1 ? "" : "n"} este mes
              </p>
            </div>
          </div>
          <ul className="divide-y divide-violet-50">
            {cumplesDelMes.map(({ cliente, fecha, diasParaCumple }) => {
              const esHoy = diasParaCumple === 0;
              const yaPaso = diasParaCumple < 0;
              const totalDiasMes = new Date(
                fecha.anio,
                fecha.mes + 1,
                0
              ).getDate();
              const pct = esHoy
                ? 100
                : yaPaso
                  ? 100
                  : Math.max(8, Math.round((1 - diasParaCumple / totalDiasMes) * 100));
              const colorBarra = esHoy
                ? "bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400"
                : yaPaso
                  ? "bg-slate-200"
                  : diasParaCumple <= 7
                    ? "bg-violet-400"
                    : "bg-violet-200";
              const etiquetaDias = esHoy
                ? "🎉 HOY"
                : yaPaso
                  ? "Ya pasó"
                  : `Faltan ${diasParaCumple} día${diasParaCumple === 1 ? "" : "s"}`;
              const colorEtiqueta = esHoy
                ? "text-violet-700 animate-pulse"
                : yaPaso
                  ? "text-slate-300"
                  : diasParaCumple <= 7
                    ? "text-violet-600"
                    : "text-slate-500";
              return (
                <li key={cliente.id} className="px-5 lg:px-8 py-3.5">
                  <Link
                    href={`/clientes#cliente=${cliente.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate transition-colors ${yaPaso ? "text-slate-400" : "text-slate-800 group-hover:text-violet-700"}`}>
                          {cliente.razonSocial}
                        </p>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mt-0.5">
                          {formatearFechaNacimientoCorta(fecha)}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest tabular-nums ${colorEtiqueta}`}>
                        {etiquetaDias}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorBarra}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <GraficoCrecimientoClientes clientes={listaClientes} anio={periodo.anio} />

        <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col min-h-[320px]">
          <div className="px-5 py-5 lg:px-8 lg:py-6 border-b border-slate-50 flex flex-wrap justify-between items-center gap-3 shrink-0">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Atención prioritaria
              </p>
              <h2 className="text-base lg:text-lg font-black text-slate-800 uppercase tracking-tight">
                Mayores saldos pendientes
              </h2>
            </div>
            <Link
              href="/cobranza"
              className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 shrink-0"
            >
              Ver todos →
            </Link>
          </div>
          {morosos.length === 0 ? (
            <p className="px-5 py-12 text-center text-slate-400 font-bold text-sm flex-1 flex items-center justify-center">
              No hay saldos pendientes en este periodo.
            </p>
          ) : (
            <>
              {/* Móvil: lista compacta */}
              <ul className="lg:hidden divide-y divide-slate-50 flex-1 overflow-auto min-h-0">
                {morosos.map(({ cliente, pendiente, estado }) => (
                  <li
                    key={cliente.id}
                    className="px-5 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {cliente.razonSocial}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            estado === "ATRASADO"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {estado}
                        </span>
                        <p className="text-[9px] font-mono text-slate-300 uppercase tracking-widest truncate">
                          {cliente.rfc}
                        </p>
                      </div>
                    </div>
                    <p className="font-black text-red-600 tabular-nums text-base shrink-0">
                      {fmt(pendiente)}
                    </p>
                  </li>
                ))}
              </ul>
              {/* Desktop: tabla */}
              <div className="hidden lg:block flex-1 overflow-auto min-h-0">
                <table className="w-full text-left">
                  <thead className="bg-[#FBFBFF] text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-4 py-4 text-center">Estatus</th>
                      <th className="px-6 py-4 text-right">Pendiente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {morosos.map(({ cliente, pendiente, estado }) => (
                      <tr key={cliente.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{cliente.razonSocial}</p>
                          <p className="text-[10px] font-mono text-slate-300 uppercase">{cliente.rfc}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              estado === "ATRASADO"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-red-600 tabular-nums text-lg">
                          {fmt(pendiente)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {pagosSinFactura.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-violet-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-violet-50 flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest">
                Control de facturación
              </p>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Pagos recibidos sin factura · {periodoLabel(periodo)}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                {pagosSinFactura.length} cliente{pagosSinFactura.length === 1 ? "" : "s"} ·
                {" "}Falta facturar {fmt(kpis.pendienteFacturarMes)}
              </p>
            </div>
            <Link
              href="/cobranza"
              className="text-[9px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800"
            >
              Emitir facturas →
            </Link>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-violet-50/40 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-3">Cliente</th>
                  <th className="px-6 py-3 text-right">Pago recibido</th>
                  <th className="px-8 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {pagosSinFactura.map(({ cliente, monto }) => (
                  <tr key={cliente.id} className="hover:bg-violet-50/30">
                    <td className="px-8 py-3.5">
                      <p className="font-bold text-slate-800 text-sm">{cliente.razonSocial}</p>
                      <p className="text-[10px] font-mono text-slate-300 uppercase">{cliente.rfc}</p>
                    </td>
                    <td className="px-6 py-3.5 text-right font-black text-violet-700 tabular-nums">
                      {fmt(monto)}
                    </td>
                    <td className="px-8 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-violet-100 text-violet-700">
                        Sin factura
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 font-medium text-center pb-4">
        Las facturas PDF se conservan solo del año en curso ({periodoHoy.anio}). Use el selector
        de periodo en el menú lateral para revisar otros años de cobranza.
      </p>
    </div>
  );
}
