"use client";

import { useState } from "react";
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
import { aniosVisiblesPortal } from "@/lib/facturas";
import { fechaLimitePago } from "@/lib/correo";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
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
  const { periodoVista, periodoHoy, esPeriodoActual, irAPeriodoActual } =
    usePeriodoHonorarios();
  const aniosHistorial = aniosVisiblesPortal(periodoHoy.anio);
  const [anioHistorial, setAnioHistorial] = useState<number>(periodoVista.anio);
  // Si el periodo seleccionado a nivel app sale del rango visible (más viejo), cae al año actual.
  const anioHistorialSeguro = aniosHistorial.includes(anioHistorial)
    ? anioHistorial
    : periodoHoy.anio;
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
      sub:
        pendienteTotal > 0
          ? "Adeudo total · requiere atención"
          : "Sin adeudo hasta el periodo",
      color: pendienteTotal > 0 ? "text-red-600" : "text-emerald-600",
      bg:
        pendienteTotal > 0
          ? "bg-red-50 border-red-100"
          : "bg-emerald-50 border-emerald-100",
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
      color: "text-slate-700",
      bg: "bg-slate-100 border-slate-200",
    },
  ];

  return (
    <div className={portalPage}>
      <StripePagoRetorno />

      <PortalPageHeader
        eyebrow="Mi cuenta"
        title="Honorarios"
        subtitle={
          <>
            Estado de cuenta ·{" "}
            <span className="font-black text-blue-600">{periodoLabel(periodoVista)}</span>
            {!esPeriodoActual && " · periodo histórico"}
          </>
        }
        subtitleExtra={<EstadoBadge cliente={cliente} periodo={periodoVista} />}
        actions={
          !esPeriodoActual ? (
            <button
              type="button"
              onClick={irAPeriodoActual}
              className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800"
            >
              Mes actual
            </button>
          ) : undefined
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
              {montoPagoMes > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  <DatosTransferenciaPortal
                    montoReferencia={montoPagoMes}
                    className="h-full min-w-0"
                  />
                  <SubirComprobante
                    clienteId={cliente.id}
                    periodo={periodoVista}
                    className="h-full min-w-0 flex flex-col"
                  />
                </div>
              ) : (
                <SubirComprobante clienteId={cliente.id} periodo={periodoVista} />
              )}
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
          <PortalSection title={`Historial ${anioHistorialSeguro}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5">
                <span className="inline-flex p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </span>
                Icono PDF = factura del despacho
              </p>
              {aniosHistorial.length > 1 && (
                <div
                  role="tablist"
                  aria-label="Año del historial"
                  className="inline-flex rounded-full bg-slate-100 p-0.5"
                >
                  {aniosHistorial.map((a) => {
                    const seleccionado = a === anioHistorialSeguro;
                    return (
                      <button
                        key={a}
                        type="button"
                        role="tab"
                        aria-selected={seleccionado}
                        onClick={() => setAnioHistorial(a)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest transition-colors ${
                          seleccionado
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="space-y-1.5 max-h-[min(28rem,70vh)] overflow-y-auto pr-1">
              {(() => {
                const items = MESES_NOM.map((_m, i) => i).filter((i) => {
                  const p = { mes: i, anio: anioHistorialSeguro };
                  if (!clienteActivoEnPeriodo(cliente, p)) return false;
                  if (
                    anioHistorialSeguro === periodoHoy.anio &&
                    periodoKey(p) > periodoKey(periodoHoy)
                  )
                    return false;
                  return true;
                });
                if (items.length === 0) {
                  return (
                    <p className="text-[11px] font-bold text-slate-400 text-center py-8 px-2 leading-relaxed">
                      Sin movimientos en {anioHistorialSeguro}.
                      <br />
                      Su cuenta inició en {periodoLabel({ mes: cliente.inicioMes, anio: Number(cliente.inicioAnio) })}.
                    </p>
                  );
                }
                return null;
              })()}
              {MESES_NOM.map((m, i) => {
                const p = { mes: i, anio: anioHistorialSeguro };
                if (!clienteActivoEnPeriodo(cliente, p)) return null;
                if (
                  anioHistorialSeguro === periodoHoy.anio &&
                  periodoKey(p) > periodoKey(periodoHoy)
                )
                  return null;

                const pagado = estaPagado(cliente, p);
                const parcial = tienePagoParcial(cliente, p);
                const monto =
                  pagado || parcial ? getMontoMes(cliente, p) : getCompromisoMes(cliente, p);
                const esMesActual =
                  anioHistorialSeguro === periodoHoy.anio && i === periodoHoy.mes;
                // Mes en curso pendiente = amarillo (mismo color que "Saldo del mes").
                // Meses pasados pendientes = rojo (vencidos).
                const pendienteActual = !pagado && esMesActual;
                const pendienteAtrasado = !pagado && !esMesActual;

                const contenedorCls = pagado
                  ? "border-emerald-100 bg-emerald-50/40"
                  : pendienteActual
                    ? "border-amber-200 bg-amber-50/70"
                    : pendienteAtrasado
                      ? "border-red-200 bg-red-50/50"
                      : "border-slate-50 bg-slate-50/50";

                const bulletCls = pagado
                  ? "bg-emerald-500"
                  : pendienteActual
                    ? "bg-amber-500"
                    : parcial
                      ? "bg-amber-500"
                      : "bg-red-400";

                const estadoTextoCls = pagado
                  ? "text-emerald-600"
                  : pendienteActual
                    ? "text-amber-600"
                    : parcial
                      ? "text-amber-600"
                      : "text-red-500";

                return (
                  <div
                    key={m}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${contenedorCls}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-2 h-2 shrink-0 rounded-full ${bulletCls}`}
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
                          className={`text-[8px] font-black uppercase tracking-widest ${estadoTextoCls}`}
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

          <PortalSection title="¿No ve su factura?">
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
              Si el ícono <span className="inline-flex items-center justify-center align-middle text-emerald-600 mx-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span> no aparece activo, significa que el despacho está generando su factura. En un lapso aproximado de 24 horas debería verla disponible. Si después de ese tiempo aún no la ve, contáctenos:
            </p>
            <div className="mt-4 flex items-center gap-4 text-slate-400">
              <a
                href="mailto:cp.aaronr@rdcontadores.com"
                aria-label="Correo cp.aaronr@rdcontadores.com"
                title="cp.aaronr@rdcontadores.com"
                className="transition-all hover:scale-110 hover:text-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-10 5L2 7"/>
                </svg>
              </a>
              <a
                href={CONTACTO_PUBLICO.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${CONTACTO_PUBLICO.whatsapp.numeroDisplay}`}
                title={`WhatsApp ${CONTACTO_PUBLICO.whatsapp.numeroDisplay}`}
                className="transition-all hover:scale-110 hover:text-emerald-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
              <a
                href={CONTACTO_PUBLICO.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${CONTACTO_PUBLICO.instagram.usuario}`}
                title={`Instagram ${CONTACTO_PUBLICO.instagram.usuario}`}
                className="transition-all hover:scale-110 hover:text-pink-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect width="20" height="20" x="2" y="2" rx="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href={CONTACTO_PUBLICO.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Facebook ${CONTACTO_PUBLICO.facebook.nombre}`}
                title={`Facebook ${CONTACTO_PUBLICO.facebook.nombre}`}
                className="transition-all hover:scale-110 hover:text-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </PortalSection>
        </div>
      </div>
    </div>
  );
}
