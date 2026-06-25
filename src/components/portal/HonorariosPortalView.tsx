"use client";

import { useMemo, useState } from "react";
import {
  type Cliente,
  MESES_NOM,
  periodoLabel,
  periodoKey,
  getCompromisoMes,
  getCompromisoBrutoMes,
  getDescuentoMes,
  getMontoDescuento,
  getMontoMes,
  getSaldoMes,
  getTotalPendiente,
  getAnticipoHonorarios,
  getDeudaNetaHonorarios,
  getServiciosAdicionalesAnio,
  getTotalAdicionalesAnio,
  getExtrasEsperados,
  getAbonadoExtraEsperado,
  getAbonosExtraEsperado,
  getSaldoExtraEsperado,
  getTotalExtraPorCobrar,
  labelPeriodoExtra,
  estaPagado,
  tienePagoParcial,
  clienteActivoEnPeriodo,
  listarMesesImpagos,
} from "@/lib/clientes";
import { aniosVisiblesPortal } from "@/lib/facturas";
import { fechaLimitePago } from "@/lib/correo";
import { usePeriodoHonorarios } from "@/hooks/usePeriodoHonorarios";
import { usePortalEsMovil } from "@/hooks/usePortalEsMovil";
import SubirComprobante from "@/components/SubirComprobante";
import FacturasPortal from "@/components/FacturasPortal";
import MetodoPagoHonorarios from "@/components/portal/MetodoPagoHonorarios";
import StripePagoRetorno from "@/components/portal/StripePagoRetorno";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import PagoExtraPortal from "@/components/portal/PagoExtraPortal";
import PortalHonorariosHero from "@/components/portal/PortalHonorariosHero";
import PortalContadorAsignadoCard from "@/components/portal/PortalContadorAsignadoCard";
import { portalPage, fmtMxn } from "@/components/portal/portal-ui";
import FacturaHistorialIcono from "@/components/portal/FacturaHistorialIcono";

type Props = { cliente: Cliente };

type VistaHonorariosMovil = "pagar" | "historial" | "facturas" | "extras";

export default function HonorariosPortalView({ cliente }: Props) {
  const { periodoVista, periodoHoy, esPeriodoActual, irAPeriodoActual } =
    usePeriodoHonorarios();
  const esMovil = usePortalEsMovil();
  const aniosHistorial = aniosVisiblesPortal(periodoHoy.anio);
  const [anioHistorial, setAnioHistorial] = useState<number>(periodoVista.anio);
  const anioHistorialSeguro = aniosHistorial.includes(anioHistorial)
    ? anioHistorial
    : periodoHoy.anio;

  const adicionalesAnio = getServiciosAdicionalesAnio(cliente, anioHistorialSeguro);
  const totalAdicionalesAnio = getTotalAdicionalesAnio(cliente, anioHistorialSeguro);
  const extrasEsperados = getExtrasEsperados(cliente);
  const totalExtraPorCobrar = getTotalExtraPorCobrar(cliente);
  const pagadoMes = estaPagado(cliente, periodoVista);
  const saldoMes = getSaldoMes(cliente, periodoVista);
  const compromisoMes = getCompromisoMes(cliente, periodoVista);
  const compromisoBruto = getCompromisoBrutoMes(cliente, periodoVista);
  const descuentoMes = getDescuentoMes(cliente, periodoVista);
  const pendienteTotal = getTotalPendiente(cliente, periodoVista);
  const anticipoDisponible = getAnticipoHonorarios(cliente);
  const deudaNeta = getDeudaNetaHonorarios(cliente, periodoVista);
  const montoPagoMes = pagadoMes ? 0 : saldoMes || compromisoMes;

  const impagos = useMemo(
    () => listarMesesImpagos(cliente, periodoVista),
    [cliente, periodoVista]
  );
  const pagosHonorarios = useMemo(
    () =>
      impagos.map((m) => ({
        periodo: m.periodo,
        montoHonorarios: m.saldo,
      })),
    [impagos]
  );
  const hayHonorariosPendientes = pendienteTotal > 0;

  const tabsMovil = useMemo(() => {
    const tabs: { id: VistaHonorariosMovil; label: string }[] = [
      { id: "pagar", label: "Pagar" },
      { id: "historial", label: "Historial" },
      { id: "facturas", label: "Facturas" },
    ];
    if (adicionalesAnio.length > 0) {
      tabs.push({ id: "extras", label: "Extras" });
    }
    return tabs;
  }, [adicionalesAnio.length]);

  const [vistaMovil, setVistaMovil] = useState<VistaHonorariosMovil>("pagar");

  const bloquePago = hayHonorariosPendientes && (
    <div id="pago" className="scroll-mt-24">
      {montoPagoMes > 0 || impagos.length > 0 ? (
        <MetodoPagoHonorarios
          cliente={cliente}
          periodo={periodoVista}
          montoHonorarios={pendienteTotal}
          pagos={pagosHonorarios}
        />
      ) : (
        <PortalSection title="Confirmar pago">
          <p className="text-[11px] font-bold text-slate-500 mb-4 leading-relaxed">
            Si ya transferiste, sube tu comprobante para que tu contador valide el pago de{" "}
            {periodoLabel(periodoVista)}.
          </p>
          <SubirComprobante clienteId={cliente.id} periodo={periodoVista} />
        </PortalSection>
      )}
    </div>
  );

  const bloqueTrabajoAdicional = extrasEsperados.length > 0 && (
    <div id="trabajo-adicional" className="scroll-mt-24">
      <PortalSection title="Trabajo adicional">
        <p className="text-[10px] font-bold text-slate-400 mb-3">
          Cargos por trabajo fuera de tu mensualidad. Saldo total por pagar:{" "}
          <span className="font-black text-amber-700">{fmtMxn(totalExtraPorCobrar)}</span>
        </p>
        <div className="space-y-2">
          {extrasEsperados.map((extra) => {
            const abonado = getAbonadoExtraEsperado(cliente, extra.id);
            const saldo = getSaldoExtraEsperado(cliente, extra);
            const liquidado = saldo <= 0;
            return (
              <div
                key={extra.id}
                className={`px-4 py-3 rounded-2xl border ${
                  liquidado
                    ? "bg-emerald-50/60 border-emerald-100"
                    : "bg-amber-50/60 border-amber-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800">{extra.concepto}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700 mt-0.5">
                      Mes: {labelPeriodoExtra(extra)}
                    </p>
                    {extra.nota && (
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">{extra.nota}</p>
                    )}
                    <p className="text-[10px] font-bold text-amber-700 mt-1 tabular-nums">
                      Total {fmtMxn(extra.montoTotal)} · Abonado {fmtMxn(abonado)}
                      {!liquidado && <> · Te restan {fmtMxn(saldo)}</>}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      liquidado
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {liquidado ? "Liquidado" : "Por pagar"}
                  </span>
                </div>
                {(() => {
                  const abonos = getAbonosExtraEsperado(cliente, extra.id);
                  if (abonos.length === 0) return null;
                  return (
                    <div className="mt-2.5 pt-2 border-t border-amber-100 space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-amber-800/70">
                        Historial de abonos
                      </p>
                      {abonos.map((a) => (
                        <div
                          key={a.id ?? `${a.mes}-${a.monto}`}
                          className="flex items-start justify-between gap-2 text-[10px] font-bold text-slate-600"
                        >
                          <span className="min-w-0">
                            {MESES_NOM[a.mes]} {a.anio}
                            {a.fechaPago ? ` · ${a.fechaPago}` : ""}
                            {a.nota ? ` · ${a.nota}` : ""}
                          </span>
                          <span className="shrink-0 tabular-nums text-emerald-700">
                            {fmtMxn(a.monto)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {!liquidado && (
                  <PagoExtraPortal
                    cliente={cliente}
                    extra={extra}
                    saldo={saldo}
                    periodoAbono={periodoHoy}
                  />
                )}
              </div>
            );
          })}
        </div>
      </PortalSection>
    </div>
  );

  const bloquePlan = (
    <PortalSection
      title="Tu plan"
      collapsible
      defaultOpen
    >
      <div className="space-y-4">
        <div className="rdc-card dark:bg-slate-900 dark:border-white/10 bg-white border-slate-100 rounded-2xl border shadow-sm px-5 py-4 flex items-stretch">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
              Compromiso mensual
            </p>
            <p
              className={`text-xl font-black tabular-nums ${
                descuentoMes ? "text-rose-700" : "text-slate-800"
              }`}
            >
              {fmtMxn(compromisoMes)}
            </p>
          </div>
          <div className="w-px self-stretch bg-slate-100 dark:bg-white/10 mx-4" />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
              Día de pago
            </p>
            <p className="text-xl font-black text-slate-800">Día {cliente.fechaPago}</p>
            {!pagadoMes && (
              <p className="text-[10px] font-bold text-slate-500 mt-1">Límite: {fechaLimitePago(cliente, periodoVista)}</p>
            )}
          </div>
        </div>

        {anticipoDisponible > 0 && (
          <div
            id="anticipo"
            className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-5 py-4"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
              Tu anticipo
            </p>
            <p className="mt-1 text-2xl font-black tabular-nums text-emerald-800">
              {fmtMxn(anticipoDisponible)}
            </p>
            <p className="mt-2 text-sm font-medium text-emerald-900/80 leading-relaxed">
              {deudaNeta > 0
                ? "Se descuenta de lo que debes. El resto se aplica a tus próximos honorarios."
                : "Saldo a tu favor para próximos honorarios."}
            </p>
          </div>
        )}

        {descuentoMes && (
          <div className="rounded-2xl bg-rose-50 border border-rose-100 px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">
              Descuento en {periodoLabel(periodoVista)}
            </p>
            <p className="text-sm font-bold text-rose-800 mt-1">
              Tu compromiso es {fmtMxn(compromisoMes)} (antes {fmtMxn(compromisoBruto)}). Motivo:{" "}
              {descuentoMes.motivo}.
            </p>
          </div>
        )}
      </div>
    </PortalSection>
  );

  const bloqueHistorialMensual = (
    <HonorariosHistorialMensual
      cliente={cliente}
      periodoHoy={periodoHoy}
      anioHistorialSeguro={anioHistorialSeguro}
      aniosHistorial={aniosHistorial}
      onAnioChange={setAnioHistorial}
      defaultOpen={!esMovil}
    />
  );

  const bloqueFacturas = (
    <FacturasPortal cliente={cliente} periodoVista={periodoVista} />
  );

  const bloqueExtrasAnio = adicionalesAnio.length > 0 && (
    <PortalSection title={`Servicios adicionales · ${anioHistorialSeguro}`}>
      <p className="text-[10px] font-bold text-slate-400 mb-3">
        Cobros puntuales fuera de tu mensualidad. Total del año:{" "}
        <span className="font-black text-violet-700">{fmtMxn(totalAdicionalesAnio)}</span>
      </p>
      <div className="space-y-2">
        {adicionalesAnio.map((p) => (
          <div
            key={p.id ?? `${p.mes}-${p.concepto}-${p.monto}`}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-violet-50/60 border border-violet-100"
          >
            <div className="min-w-0 pr-2">
              <p className="text-sm font-black text-violet-800 truncate">
                {p.concepto ?? "Servicio adicional"}
              </p>
              <p className="text-[10px] font-bold text-violet-600 mt-0.5">
                {MESES_NOM[p.mes]}
                {p.nota ? ` · ${p.nota}` : ""}
              </p>
            </div>
            <p className="text-base font-black text-violet-700 tabular-nums shrink-0">
              {fmtMxn(p.monto)}
            </p>
          </div>
        ))}
      </div>
    </PortalSection>
  );

  const bloqueInfo = (
    <>
      <PortalSection title="Información" collapsible defaultOpen={!esMovil}>
        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
          Los pagos con tarjeta incluyen un costo de procesamiento (comisión Stripe + IVA) para que
          el despacho reciba el monto íntegro de honorarios. Si transfieres, sube tu comprobante
          para agilizar la validación.
        </p>
      </PortalSection>

      <PortalSection title="¿No ves tu factura?" collapsible defaultOpen={false}>
        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
          Si el ícono PDF no aparece activo, tu contador está generando la factura. En ~24 horas
          debería estar disponible. Si después de ese tiempo aún no la ves, escríbele directamente:
        </p>
        <div className="mt-4">
          <PortalContadorAsignadoCard
            montoPendiente={deudaNeta > 0 ? fmtMxn(deudaNeta) : undefined}
          />
        </div>
      </PortalSection>
    </>
  );

  return (
    <div className={portalPage}>
      <StripePagoRetorno />

      <PortalPageHeader
        eyebrow="Mi cuenta"
        title="Honorarios"
        subtitle={
          <>
            Estado de cuenta ·{" "}
            <span className="font-black text-[var(--portal-purple)]">
              {periodoLabel(periodoVista)}
            </span>
            {!esPeriodoActual && " · periodo histórico"}
          </>
        }
        actions={
          !esPeriodoActual ? (
            <button
              type="button"
              onClick={irAPeriodoActual}
              className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[var(--portal-navy)] text-white hover:bg-[var(--portal-navy-hover)]"
            >
              Mes actual
            </button>
          ) : undefined
        }
      />

      <PortalHonorariosHero
        cliente={cliente}
        periodo={periodoVista}
        deudaNeta={deudaNeta}
        pendienteHonorarios={pendienteTotal}
        totalExtraPorCobrar={totalExtraPorCobrar}
        compromisoMes={compromisoMes}
        anticipoDisponible={anticipoDisponible}
        mesesImpagos={impagos.length}
        onIrAPago={() => {
          if (esMovil) setVistaMovil("pagar");
        }}
      />

      {bloquePlan}

      {esMovil && (
        <div
          role="tablist"
          aria-label="Sección de honorarios"
          className="inline-flex w-full rounded-full bg-slate-100 p-0.5"
        >
          {tabsMovil.map((tab) => {
            const activo = vistaMovil === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => setVistaMovil(tab.id)}
                className={`flex-1 px-2 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                  activo
                    ? "bg-white text-[var(--portal-navy)] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {esMovil ? (
        <div className="space-y-6 min-w-0">
          {vistaMovil === "pagar" && (
            <>
              {bloquePago}
              {bloqueTrabajoAdicional}
            </>
          )}
          {vistaMovil === "facturas" && bloqueFacturas}
          {vistaMovil === "extras" && bloqueExtrasAnio}
          {vistaMovil === "historial" && (
            <>
              {bloqueHistorialMensual}
              {bloqueInfo}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {bloquePago}
            {bloqueTrabajoAdicional}
            {bloqueFacturas}
            {bloqueExtrasAnio}
          </div>
          <div className="space-y-6 min-w-0">
            {bloqueHistorialMensual}
            {bloqueInfo}
          </div>
        </div>
      )}
    </div>
  );
}

function HonorariosHistorialMensual({
  cliente,
  periodoHoy,
  anioHistorialSeguro,
  aniosHistorial,
  onAnioChange,
  defaultOpen,
}: {
  cliente: Cliente;
  periodoHoy: { mes: number; anio: number };
  anioHistorialSeguro: number;
  aniosHistorial: number[];
  onAnioChange: (anio: number) => void;
  defaultOpen: boolean;
}) {
  return (
    <PortalSection
      title={`Historial ${anioHistorialSeguro}`}
      collapsible
      defaultOpen={defaultOpen}
    >
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
                  onClick={() => onAnioChange(a)}
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
                Tu cuenta inició en{" "}
                {periodoLabel({ mes: cliente.inicioMes, anio: Number(cliente.inicioAnio) })}.
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
          const descMes = getDescuentoMes(cliente, p);
          const monto =
            pagado || parcial ? getMontoMes(cliente, p) : getCompromisoMes(cliente, p);
          const esMesActual =
            anioHistorialSeguro === periodoHoy.anio && i === periodoHoy.mes;
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
                <div className={`w-2 h-2 shrink-0 rounded-full ${bulletCls}`} />
                <div className="min-w-0">
                  <span className="text-xs font-black uppercase text-slate-700 truncate block">
                    {m}
                  </span>
                  {descMes && (
                    <span
                      className="text-[8px] font-black text-rose-600 uppercase tracking-widest truncate block max-w-[120px]"
                      title={descMes.motivo}
                    >
                      {descMes.tipo === "porcentaje"
                        ? `-${descMes.valor}%`
                        : `-${fmtMxn(getMontoDescuento(cliente, p))}`}{" "}
                      · {descMes.motivo}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-1">
                <div className="text-right">
                  <p className="text-xs font-black text-slate-700 tabular-nums">{fmtMxn(monto)}</p>
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
  );
}
