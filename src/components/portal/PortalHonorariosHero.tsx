"use client";

import { useMemo } from "react";
import {
  type Cliente,
  type Periodo,
  contarMesesImpagos,
  calcularEstado,
  estaPagado,
} from "@/lib/clientes";
import { fechaLimitePago, getFechaLimiteDate } from "@/lib/correo";
import Fiscalino from "@/components/Fiscalino";
import { fmtMxn } from "@/components/portal/portal-ui";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  deudaNeta: number;
  pendienteHonorarios: number;
  totalExtraPorCobrar: number;
  compromisoMes: number;
  anticipoDisponible: number;
  mesesImpagos: number;
  onIrAPago?: () => void;
};

function diasEntre(de: Date, hasta: Date): number {
  const a = new Date(de.getFullYear(), de.getMonth(), de.getDate());
  const b = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function scrollToAnchor(id: string, onBefore?: () => void) {
  onBefore?.();
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export default function PortalHonorariosHero({
  cliente,
  periodo,
  deudaNeta,
  pendienteHonorarios,
  totalExtraPorCobrar,
  compromisoMes,
  anticipoDisponible,
  mesesImpagos,
  onIrAPago,
}: Props) {
  const hoy = useMemo(() => new Date(), []);
  const pagadoMes = estaPagado(cliente, periodo);
  const estado = calcularEstado(cliente, periodo);
  const limite = fechaLimitePago(cliente, periodo);
  const fechaLimiteDate = getFechaLimiteDate(cliente, periodo);
  const diasAlVencimiento = diasEntre(hoy, fechaLimiteDate);
  const honorariosVencidos = !pagadoMes && diasAlVencimiento < 0;
  const mesesImpagosCalc = useMemo(
    () => contarMesesImpagos(cliente, periodo),
    [cliente, periodo]
  );
  const nMeses = Math.max(mesesImpagos, mesesImpagosCalc);
  const urgente = honorariosVencidos || nMeses >= 2 || estado === "ATRASADO";

  const soloExtra = pendienteHonorarios <= 0 && totalExtraPorCobrar > 0;
  const alCorriente = deudaNeta <= 0 && totalExtraPorCobrar <= 0 && pagadoMes;

  const desglose =
    pendienteHonorarios > 0 && totalExtraPorCobrar > 0
      ? `${fmtMxn(pendienteHonorarios)} honorarios + ${fmtMxn(totalExtraPorCobrar)} adicional`
      : totalExtraPorCobrar > 0
        ? `${fmtMxn(totalExtraPorCobrar)} trabajo adicional`
        : nMeses > 1
          ? `${nMeses} meses pendientes`
          : undefined;

  if (alCorriente) {
    return (
      <div className="flex items-center gap-4 rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-5 py-4 sm:px-6 sm:py-5">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
            Honorarios al día
          </p>
          <p className="text-sm font-bold text-emerald-600 leading-snug mt-0.5">
            No tienes saldo pendiente con el despacho.
            {compromisoMes > 0 && (
              <> Tu compromiso mensual es {fmtMxn(compromisoMes)}.</>
            )}
          </p>
          {anticipoDisponible > 0 && (
            <p className="text-[11px] font-bold text-emerald-700/80 mt-1">
              Anticipo disponible: {fmtMxn(anticipoDisponible)}
            </p>
          )}
        </div>
        <Fiscalino mood="confident" size={72} className="shrink-0 -my-2 hidden sm:block" />
      </div>
    );
  }

  const montoHero = soloExtra ? totalExtraPorCobrar : deudaNeta;
  const montoHonorariosHero = pendienteHonorarios;

  const titulo = soloExtra
    ? "Trabajo adicional por pagar"
    : totalExtraPorCobrar > 0
      ? "Tienes saldo pendiente con el despacho"
      : nMeses > 1
        ? "Tienes honorarios pendientes por regularizar"
        : pendienteHonorarios > 0
          ? "Honorario pendiente de pago"
          : "Confirma tu pago de honorarios";

  const detalle = soloExtra
    ? "Liquida los cargos por trabajo fuera de tu mensualidad."
    : urgente
      ? nMeses >= 2
        ? `Llevas ${nMeses} meses por cubrir. Puedes pagar todo en un solo movimiento.`
        : `El pago ya venció (límite ${limite}). Puedes pagar por transferencia o tarjeta.`
      : pendienteHonorarios > 0
        ? nMeses > 1
          ? `Total de honorarios: ${fmtMxn(montoHonorariosHero)}. Un solo pago cubre todos los meses.`
          : `Fecha límite: ${limite}. Paga por SPEI o tarjeta desde tu portal.`
        : "Sube tu comprobante para que tu contador valide el pago.";

  const cta = soloExtra
    ? "Ver cargos"
    : pendienteHonorarios > 0
      ? nMeses > 1
        ? "Pagar todo"
        : "Pagar ahora"
      : "Subir comprobante";
  const anchor = soloExtra ? "trabajo-adicional" : "pago";

  const fondo = urgente
    ? "rdc-glass-alert-red border-red-100 bg-red-50/70"
    : "rdc-glass-alert-orange border-amber-100 bg-amber-50/70";
  const iconBg = urgente ? "bg-red-500" : "bg-amber-500";
  const btnCls = urgente
    ? "bg-red-600 hover:bg-red-700"
    : "bg-amber-500 hover:bg-amber-600";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 rounded-[1.25rem] border px-4 py-3 sm:px-5 sm:py-4 ${fondo}`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${iconBg}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black text-slate-800 leading-snug">{titulo}</p>
          {montoHero > 0 && (
            <p
              className={`text-2xl sm:text-[1.65rem] font-black tabular-nums leading-none mt-1 ${
                urgente ? "text-red-600" : "text-slate-800"
              }`}
            >
              {fmtMxn(montoHero)}
            </p>
          )}
          {desglose && (
            <p className="text-[11px] font-bold text-slate-500 mt-1">{desglose}</p>
          )}
          <p
            className={`text-[11px] font-bold leading-snug mt-1 ${
              urgente ? "text-red-600" : "text-slate-500"
            }`}
          >
            {detalle}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-stretch sm:items-end gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => scrollToAnchor(anchor, onIrAPago)}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-[11px] font-black uppercase tracking-widest transition-colors ${btnCls}`}
        >
          {cta}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
        </button>
        {!soloExtra && pendienteHonorarios > 0 && (
          <button
            type="button"
            onClick={() => scrollToAnchor("pago", onIrAPago)}
            className={`text-center text-[10px] font-bold underline-offset-2 hover:underline ${
              urgente ? "text-red-700" : "text-amber-700"
            }`}
          >
            Ya pagué · subir comprobante
          </button>
        )}
      </div>
    </div>
  );
}
