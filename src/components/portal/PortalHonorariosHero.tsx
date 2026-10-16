"use client";

import { useMemo, useState } from "react";
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
  const [abierto, setAbierto] = useState(false);

  const soloExtra = pendienteHonorarios <= 0 && totalExtraPorCobrar > 0;
  const alCorriente = deudaNeta <= 0 && totalExtraPorCobrar <= 0 && pagadoMes;

  if (alCorriente) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-5">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="w-full text-left"
        >
          {abierto ? (
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Palomita />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] text-slate-500">Saldo con el despacho</span>
                <span className="mt-0.5 block text-[28px] font-bold leading-none text-emerald-600">
                  Al corriente
                </span>
              </span>
              <Chevron abierto={abierto} />
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center py-4">
              <span className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Palomita grande />
              </span>
              <span className="mt-3 text-[17px] font-semibold text-emerald-700">
                Al corriente
              </span>
              <span className="absolute right-0 top-0">
                <Chevron abierto={false} />
              </span>
            </div>
          )}
        </button>
        {abierto ? (
          <div className="mt-4 space-y-1">
            <p className="text-[15px] text-slate-500 leading-snug">
              No tienes saldo pendiente.
              {compromisoMes > 0
                ? ` Tu mensualidad es ${fmtMxn(compromisoMes)}.`
                : ""}
            </p>
            {anticipoDisponible > 0 ? (
              <p className="text-[13px] text-slate-500">
                Anticipo disponible: {fmtMxn(anticipoDisponible)}
              </p>
            ) : null}
          </div>
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

function Palomita({ grande = false }: { grande?: boolean }) {
  return (
    <svg
      width={grande ? 32 : 22}
      height={grande ? 32 : 22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-slate-400 transition-transform ${abierto ? "rotate-180" : ""}`}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
