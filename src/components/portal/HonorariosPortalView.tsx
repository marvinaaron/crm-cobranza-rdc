"use client";

import {
  type Cliente,
  MESES_NOM,
  periodoLabel,
  periodoKey,
  getCompromisoMes,
  getMontoMes,
  getSaldoMes,
  getTotalPendiente,
  estaPagado,
  tienePagoParcial,
  clienteActivoEnPeriodo,
  calcularEstado,
} from "@/lib/clientes";
import { fechaLimitePago } from "@/lib/correo";
import { usePeriodoHonorarios } from "@/hooks/usePeriodoHonorarios";
import EstadoBadge from "@/components/EstadoBadge";
import SubirComprobante from "@/components/SubirComprobante";
import HistorialPendienteCliente from "@/components/HistorialPendienteCliente";
import FacturasPortal from "@/components/FacturasPortal";
import PagoStripeHonorarios from "@/components/portal/PagoStripeHonorarios";
import DatosTransferenciaPortal from "@/components/portal/DatosTransferenciaPortal";
import StripePagoRetorno from "@/components/portal/StripePagoRetorno";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalStatCard from "@/components/portal/PortalStatCard";
import PortalSection from "@/components/portal/PortalSection";
import { portalPage, fmtMxn } from "@/components/portal/portal-ui";
import FacturaHistorialIcono from "@/components/portal/FacturaHistorialIcono";

type Props = {
  cliente: Cliente;
};

export default function HonorariosPortalView({ cliente }: Props) {
  const { periodoVista, esPeriodoActual, irAPeriodoActual } = usePeriodoHonorarios();
  const pagadoMes = estaPagado(cliente, periodoVista);
  const saldoMes = getSaldoMes(cliente, periodoVista);
  const compromisoMes = getCompromisoMes(cliente, periodoVista);
  const limite = fechaLimitePago(cliente, periodoVista);
  const estado = calcularEstado(cliente, periodoVista);
  const pendienteTotal = getTotalPendiente(cliente, periodoVista);
  const montoPagoMes = pagadoMes ? 0 : saldoMes || compromisoMes;
  const montoMesDisplay = pagadoMes ? 0 : saldoMes || compromisoMes;

  const tarjetas = [
    {
      label: "Saldo del mes",
      value: fmtMxn(montoMesDisplay),
      sub: pagadoMes ? "Sin adeudo · periodo cubierto" : `Límite: ${limite}`,
      color: pagadoMes ? "text-emerald-600" : "text-amber-600",
      bg: pagadoMes
        ? "bg-emerald-50 border-emerald-100"
        : "bg-amber-50 border-amber-100",
    },
    {
      label: "Pendiente acumulado",
      value: fmtMxn(pendienteTotal),
      sub: "Hasta el periodo seleccionado",
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100",
    },
    {
      label: "Compromiso mensual",
      value: fmtMxn(compromisoMes),
      sub: "Honorarios acordados",
      color: "text-slate-800",
      bg: "bg-white border-slate-100",
    },
    {
      label: "Día de pago",
      value: `Día ${cliente.fechaPago}`,
      sub: "Fecha acordada cada mes",
      color: "text-slate-800",
      bg: "bg-white border-slate-100",
    },
  ];

  return (
    <div className={portalPage}>
      <StripePagoRetorno />

      <PortalPageHeader
        eyebrow="Mi cuenta"
        title="Honorarios"
        subtitle={`Estado de cuenta · ${periodoLabel(periodoVista)}${!esPeriodoActual ? " · periodo histórico" : ""}`}
        actions={
          <>
            {!esPeriodoActual && (
              <button
                type="button"
                onClick={irAPeriodoActual}
                className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800"
              >
                Mes actual
              </button>
            )}
            <EstadoBadge cliente={cliente} periodo={periodoVista} />
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {tarjetas.map((card) => (
          <PortalStatCard key={card.label} {...card} />
        ))}
      </div>

      {estado === "AL CORRIENTE" && (
        <div className="rounded-[2rem] bg-emerald-50 border border-emerald-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
              Cuenta al corriente
            </p>
            <p className="text-xs font-bold text-emerald-600 mt-1">
              No tiene honorarios pendientes con el despacho.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {!pagadoMes && (
            <>
              {montoPagoMes > 0 && (
                <DatosTransferenciaPortal montoReferencia={montoPagoMes} />
              )}
              <SubirComprobante clienteId={cliente.id} periodo={periodoVista} />
              {montoPagoMes > 0 && (
                <PortalSection title="Pago en línea con tarjeta">
                  <PagoStripeHonorarios
                    cliente={cliente}
                    periodo={periodoVista}
                    montoHonorarios={montoPagoMes}
                    embedded
                  />
                </PortalSection>
              )}
            </>
          )}

          <HistorialPendienteCliente cliente={cliente} periodo={periodoVista} />

          <FacturasPortal cliente={cliente} periodoVista={periodoVista} />
        </div>

        <div className="space-y-6 min-w-0">
          <PortalSection title={`Historial ${periodoVista.anio}`}>
            <p className="text-[9px] font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <span className="inline-flex p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              Icono PDF = factura del despacho
            </p>
            <div className="space-y-1.5 max-h-[min(28rem,70vh)] overflow-y-auto pr-1">
              {MESES_NOM.map((m, i) => {
                const p = { mes: i, anio: periodoVista.anio };
                if (!clienteActivoEnPeriodo(cliente, p)) return null;
                if (periodoKey(p) > periodoKey(periodoVista)) return null;

                const pagado = estaPagado(cliente, p);
                const parcial = tienePagoParcial(cliente, p);
                const monto =
                  pagado || parcial ? getMontoMes(cliente, p) : getCompromisoMes(cliente, p);
                const activo = i === periodoVista.mes;

                return (
                  <div
                    key={m}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${
                      activo
                        ? "border-indigo-200 bg-indigo-50/60"
                        : !pagado
                          ? "border-red-200 bg-red-50/50"
                          : "border-slate-50 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-2 h-2 shrink-0 rounded-full ${
                          pagado ? "bg-emerald-500" : parcial ? "bg-amber-500" : "bg-red-400"
                        }`}
                      />
                      <span className="text-xs font-black uppercase text-slate-700 truncate">
                        {m}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-1">
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-700 tabular-nums">
                          {fmtMxn(monto)}
                        </p>
                        <p
                          className={`text-[8px] font-black uppercase tracking-widest ${
                            pagado ? "text-emerald-600" : parcial ? "text-amber-600" : "text-red-500"
                          }`}
                        >
                          {pagado ? "Pagado" : parcial ? "Parcial" : "Pendiente"}
                        </p>
                      </div>
                      <FacturaHistorialIcono
                        clienteId={cliente.id}
                        periodo={p}
                        pagado={pagado}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </PortalSection>

          <PortalSection title="Información">
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
              Los pagos con tarjeta se aplican de inmediato a su cuenta. Si transfiere o paga en
              efectivo, suba su comprobante para agilizar la validación por el despacho.
            </p>
          </PortalSection>
        </div>
      </div>
    </div>
  );
}
