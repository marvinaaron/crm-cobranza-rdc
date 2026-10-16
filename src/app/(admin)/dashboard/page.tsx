"use client";

import { useEffect, useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import type { RegistroEfirma } from "@/lib/efirma/types";
import { diasHastaVencimiento } from "@/lib/efirma/vigencia";
import {
  calcularKpisDashboard,
  calcularResumenAnual,
  listarPrincipalesMorosos,
  listarPagosSinFacturaBancario,
  etiquetaPeriodoDashboard,
  esPeriodoActual,
  construirAnalisisAnualExcel,
  construirEstadoFinanciero,
} from "@/lib/dashboard-metrics";
import * as XLSX from "xlsx";
import {
  periodoLabel,
  esIngresoGeneralCliente,
  fechaNacimientoDeRFC,
  MESES_NOM,
} from "@/lib/clientes";
import GraficoIngresosAnual from "@/components/dashboard/GraficoIngresosAnual";
import EstadoFinancieroPDF, {
  descargarEstadoFinancieroPDF,
} from "@/components/dashboard/EstadoFinancieroPDF";
import GraficoNuevosClientes from "@/components/dashboard/GraficoNuevosClientes";
import CalendarioFiscalAdmin from "@/components/dashboard/CalendarioFiscalAdmin";
import AdminSiguientePaso from "@/components/admin/AdminSiguientePaso";
import DashboardWallet from "@/components/admin/DashboardWallet";
import { resumirAnillosInicio } from "@/lib/dashboard-anillos";
import DashboardAgendaMes from "@/components/admin/DashboardAgendaMes";
import { construirSiguientePasoDespacho } from "@/lib/admin/siguiente-paso-despacho";
import {
  leerPasosOcultosInicio,
  mostrarPasosInicio,
  ocultarPasoInicio,
  podarPasosOcultosInicio,
} from "@/lib/admin/inicio-ocultos";

export default function DashboardPage() {
  const {
    listaClientes,
    periodo,
    periodoHoy,
    irAPeriodoActual,
    facturas,
    cumplimiento,
    comprobantes,
    encargos,
    getCumplimientoPeriodo,
  } = useClientes();

  const kpis = useMemo(
    () => calcularKpisDashboard(listaClientes, periodo, periodoHoy, facturas),
    [listaClientes, periodo, periodoHoy, facturas]
  );

  const mesesAnio = useMemo(
    () => calcularResumenAnual(listaClientes, periodo.anio, periodoHoy),
    [listaClientes, periodo.anio, periodoHoy]
  );

  const mesesAnioAnterior = useMemo(
    () =>
      calcularResumenAnual(listaClientes, periodo.anio - 1, {
        mes: 11,
        anio: periodo.anio - 1,
      }),
    [listaClientes, periodo.anio]
  );

  const morosos = useMemo(
    () => listarPrincipalesMorosos(listaClientes, periodo, 10),
    [listaClientes, periodo]
  );

  const pagosSinFactura = useMemo(
    () => listarPagosSinFacturaBancario(listaClientes, periodo, facturas),
    [listaClientes, periodo, facturas]
  );

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
        (
          x
        ): x is {
          cliente: (typeof listaClientes)[number];
          fecha: { mes: number; dia: number; anio: number };
          diasParaCumple: number;
        } => x !== null
      );
    items.sort((a, b) => {
      const ka = a.diasParaCumple < 0 ? 9999 - a.diasParaCumple : a.diasParaCumple;
      const kb = b.diasParaCumple < 0 ? 9999 - b.diasParaCumple : b.diasParaCumple;
      return ka - kb;
    });
    return items;
  }, [listaClientes]);

  const mesActualNombre = MESES_NOM[new Date().getMonth()];

  const [registrosEfirma, setRegistrosEfirma] = useState<RegistroEfirma[]>([]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/efirmas", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { registros?: RegistroEfirma[] };
        if (!cancel) setRegistrosEfirma(data.registros ?? []);
      } catch {
        /* el inicio sigue sin esta sección */
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const efirmasProximas = useMemo(() => {
    return registrosEfirma
      .map((reg) => {
        const dias = diasHastaVencimiento(reg.vigenciaFin);
        const cliente = listaClientes.find((c) => c.id === reg.clienteId);
        return { reg, dias, cliente };
      })
      .filter(
        (
          x
        ): x is {
          reg: RegistroEfirma;
          dias: number;
          cliente: (typeof listaClientes)[number];
        } => !!x.cliente && x.dias >= 0 && x.dias <= 90
      )
      .sort((a, b) => a.dias - b.dias);
  }, [registrosEfirma, listaClientes]);

  const efirmasParaBandeja = useMemo(
    () =>
      efirmasProximas
        .filter((x) => x.dias <= 30)
        .map((x) => ({ clienteId: x.cliente.id, dias: x.dias })),
    [efirmasProximas]
  );

  const accionesDespacho = useMemo(
    () =>
      construirSiguientePasoDespacho({
        clientes: listaClientes,
        cumplimiento,
        comprobantes,
        encargos,
        periodo,
        efirmasProximas: efirmasParaBandeja,
      }),
    [listaClientes, cumplimiento, comprobantes, encargos, periodo, efirmasParaBandeja]
  );

  const [pasosOcultos, setPasosOcultos] = useState<string[]>([]);
  useEffect(() => {
    const guardados = leerPasosOcultosInicio();
    if (listaClientes.length === 0) {
      setPasosOcultos(guardados);
      return;
    }
    setPasosOcultos(podarPasosOcultosInicio(accionesDespacho.map((a) => a.clave)));
  }, [accionesDespacho, listaClientes.length]);

  const accionesVisibles = useMemo(
    () => accionesDespacho.filter((a) => !pasosOcultos.includes(a.clave)),
    [accionesDespacho, pasosOcultos]
  );

  const esActual = esPeriodoActual(periodo, periodoHoy);
  const [menuExportAbierto, setMenuExportAbierto] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const estadoFinanciero = useMemo(
    () => construirEstadoFinanciero(listaClientes, periodoHoy),
    [listaClientes, periodoHoy]
  );

  const descargarAnalisisAnualExcel = () => {
    const { resumenAnual, mensualPorAnio, composicion, clientePorAnio } =
      construirAnalisisAnualExcel(listaClientes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(resumenAnual),
      "Resumen por año"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(mensualPorAnio),
      "Mensual por año"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(composicion),
      "Composición"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(clientePorAnio),
      "Cliente por año"
    );
    XLSX.writeFile(wb, `analisis-ingresos-RDC-${periodoHoy.anio}.xlsx`);
  };

  const deudaExtras = kpis.extraPorCobrar;
  const deudaAtrasado = kpis.atrasadoMonto;
  const deudaEnCurso = Math.max(0, kpis.pendienteAcumulado - kpis.atrasadoMonto);
  const deudaTotal = kpis.pendienteAcumulado + deudaExtras;
  const mesCorto = periodoLabel(periodo).split(" ")[0];

  const anillosInicio = useMemo(
    () =>
      resumirAnillosInicio({
        clientes: listaClientes,
        periodo,
        facturas,
        getRegistro: getCumplimientoPeriodo,
      }),
    [listaClientes, periodo, facturas, getCumplimientoPeriodo]
  );

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <header className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[34px] font-bold tracking-tight text-slate-900 leading-none">
            Inicio
          </h1>
          <p className="mt-2 text-[15px] text-slate-500">
            {etiquetaPeriodoDashboard(periodo)}
            {!esActual && (
              <span className="ml-2 text-amber-600">· periodo histórico</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!esActual && (
            <button
              type="button"
              onClick={irAPeriodoActual}
              className="px-3.5 py-2 rounded-full text-[13px] font-semibold bg-slate-900 text-white"
            >
              Mes actual
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuExportAbierto((v) => !v)}
              disabled={generandoPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold bg-white ring-1 ring-black/[0.06] text-slate-700 disabled:opacity-50"
            >
              {generandoPdf ? "PDF…" : "Exportar"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 transition-transform ${menuExportAbierto ? "rotate-180" : ""}`}
                aria-hidden
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {menuExportAbierto && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuExportAbierto(false)}
                  className="fixed inset-0 z-20 cursor-default"
                />
                <div className="absolute right-0 top-full mt-2 z-30 w-44 rounded-2xl bg-white shadow-lg ring-1 ring-black/[0.06] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuExportAbierto(false);
                      descargarAnalisisAnualExcel();
                    }}
                    className="w-full px-4 py-3 text-left text-[15px] text-slate-800 hover:bg-slate-50"
                  >
                    Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => void (async () => {
                      setMenuExportAbierto(false);
                      setGenerandoPdf(true);
                      try {
                        await new Promise((r) => setTimeout(r, 60));
                        await descargarEstadoFinancieroPDF(estadoFinanciero.anioActual);
                      } finally {
                        setGenerandoPdf(false);
                      }
                    })()}
                    className="w-full px-4 py-3 text-left text-[15px] text-slate-800 hover:bg-slate-50 border-t border-slate-100"
                  >
                    PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <AdminSiguientePaso
          acciones={accionesVisibles}
          vivos={accionesDespacho.length}
          onOcultar={(clave) => setPasosOcultos(ocultarPasoInicio(clave))}
          onMostrarOcultos={() => setPasosOcultos(mostrarPasosInicio())}
        />

        <DashboardWallet
          kpis={kpis}
          deudaTotal={deudaTotal}
          deudaEnCurso={deudaEnCurso}
          deudaAtrasado={deudaAtrasado}
          deudaExtras={deudaExtras}
          mesLabel={mesCorto}
          pagosSinFactura={pagosSinFactura}
          morosos={morosos}
          anillos={anillosInicio}
        />

        <CalendarioFiscalAdmin clientes={listaClientes} periodo={periodo} />

        <DashboardAgendaMes
          mesNombre={mesActualNombre}
          cumples={cumplesDelMes}
          efirmas={efirmasProximas}
        />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-stretch">
          <div className="xl:col-span-3 min-w-0">
            <GraficoIngresosAnual
              mesesActual={mesesAnio}
              mesesAnterior={mesesAnioAnterior}
              anio={periodo.anio}
            />
          </div>
          <div className="xl:col-span-2 min-w-0">
            <GraficoNuevosClientes clientes={listaClientes} anio={periodo.anio} />
          </div>
        </div>
      </div>

      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: -99999,
          width: 816,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <EstadoFinancieroPDF data={estadoFinanciero} />
      </div>
    </div>
  );
}
