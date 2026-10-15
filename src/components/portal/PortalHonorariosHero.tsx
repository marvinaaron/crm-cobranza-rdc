"use client";

import { useMemo } from "react";
import {
  type Cliente,
  type Periodo,
  contarMesesImpagos,
  estaPagado,
} from "@/lib/clientes";
import { fechaLimitePago } from "@/lib/correo";
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
};

export default function PortalHonorariosHero({
  cliente,
  periodo,
  deudaNeta,
  pendienteHonorarios,
  totalExtraPorCobrar,
  compromisoMes,
  anticipoDisponible,
  mesesImpagos,
}: Props) {
  const pagadoMes = estaPagado(cliente, periodo);
  const limite = fechaLimitePago(cliente, periodo);
  const mesesImpagosCalc = useMemo(
    () => contarMesesImpagos(cliente, periodo),
    [cliente, periodo]
  );
  const nMeses = Math.max(mesesImpagos, mesesImpagosCalc);

  const soloExtra = pendienteHonorarios <= 0 && totalExtraPorCobrar > 0;
  const alCorriente = deudaNeta <= 0 && totalExtraPorCobrar <= 0 && pagadoMes;

  if (alCorriente) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-5">
        <p className="text-[13px] text-slate-500">Saldo con el despacho</p>
        <p className="mt-0.5 text-[28px] font-bold tabular-nums leading-none text-emerald-600">
          Al corriente
        </p>
        <p className="mt-2 text-[15px] text-slate-500 leading-snug">
          No tienes saldo pendiente.
          {compromisoMes > 0 ? ` Tu mensualidad es ${fmtMxn(compromisoMes)}.` : ""}
        </p>
        {anticipoDisponible > 0 ? (
          <p className="text-[13px] text-slate-500 mt-1">
            Anticipo disponible: {fmtMxn(anticipoDisponible)}
          </p>
        ) : null}
      </div>
    );
  }

  const montoHero = soloExtra ? totalExtraPorCobrar : deudaNeta;
  const desglose =
    pendienteHonorarios > 0 && totalExtraPorCobrar > 0
      ? `${fmtMxn(pendienteHonorarios)} honorarios + ${fmtMxn(totalExtraPorCobrar)} adicional`
      : totalExtraPorCobrar > 0
        ? `${fmtMxn(totalExtraPorCobrar)} trabajo adicional`
        : nMeses > 1
          ? `${nMeses} meses`
          : undefined;

  const detalle = soloExtra
    ? "Cargos fuera de tu mensualidad. Puedes pagarlos solos o junto con tus honorarios."
    : pendienteHonorarios > 0 && totalExtraPorCobrar > 0
      ? "El trabajo adicional aparece como otra línea en tu cuenta."
      : nMeses > 1
        ? `Incluye ${nMeses} meses. Elige SPEI o tarjeta abajo.`
        : `Fecha límite: ${limite}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-5">
      <p className="text-[13px] text-slate-500">A pagar</p>
      <p className="mt-0.5 text-[34px] font-bold tabular-nums leading-none tracking-tight text-slate-900 dark:text-white">
        {fmtMxn(montoHero)}
      </p>
      {desglose ? (
        <p className="text-[13px] text-slate-500 mt-1.5">{desglose}</p>
      ) : null}
      <p className="text-[15px] text-slate-500 mt-1 leading-snug">{detalle}</p>
    </div>
  );
}
