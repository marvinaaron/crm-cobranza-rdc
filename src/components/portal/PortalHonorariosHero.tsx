"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Cliente,
  type Periodo,
  contarMesesImpagos,
  estaPagado,
  periodoKey,
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

function claveCierre(clienteId: number, periodo: Periodo): string {
  return `rdc-hero-honorarios-cerrado:${clienteId}:${periodoKey(periodo)}`;
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
}: Props) {
  const pagadoMes = estaPagado(cliente, periodo);
  const limite = fechaLimitePago(cliente, periodo);
  const mesesImpagosCalc = useMemo(
    () => contarMesesImpagos(cliente, periodo),
    [cliente, periodo]
  );
  const nMeses = Math.max(mesesImpagos, mesesImpagosCalc);
  const [abierto, setAbierto] = useState(false);
  const [cerrado, setCerrado] = useState(false);

  const hayDeuda = deudaNeta > 0 || totalExtraPorCobrar > 0;
  const alCorriente = !hayDeuda && pagadoMes;

  useEffect(() => {
    if (hayDeuda) {
      setCerrado(false);
      return;
    }
    try {
      setCerrado(localStorage.getItem(claveCierre(cliente.id, periodo)) === "1");
    } catch {
      setCerrado(false);
    }
  }, [hayDeuda, cliente.id, periodo.mes, periodo.anio]);

  function cerrarPalomita() {
    setCerrado(true);
    try {
      localStorage.setItem(claveCierre(cliente.id, periodo), "1");
    } catch {
      /* noop */
    }
  }

  if (alCorriente) {
    if (cerrado) return null;
    return (
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl px-5 py-5">
        <button
          type="button"
          onClick={cerrarPalomita}
          className="absolute right-3 top-3 w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Cerrar"
        >
          <XIcon />
        </button>
        <div className="flex flex-col items-center justify-center py-4">
          <span className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Palomita grande />
          </span>
          <span className="mt-3 text-[17px] font-semibold text-emerald-700">
            Al corriente
          </span>
          {anticipoDisponible > 0 ? (
            <p className="mt-2 text-[13px] text-slate-500">
              Anticipo disponible: {fmtMxn(anticipoDisponible)}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!hayDeuda) {
    return null;
  }

  const soloExtra = pendienteHonorarios <= 0 && totalExtraPorCobrar > 0;
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
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] text-slate-500">A pagar</span>
            <span
              className={`mt-0.5 block font-bold tabular-nums leading-none tracking-tight text-red-600 ${
                abierto ? "text-[34px]" : "text-[28px]"
              }`}
            >
              {fmtMxn(montoHero)}
            </span>
          </span>
          <span className="shrink-0 mt-1 text-red-500" aria-hidden>
            <AlertaIcon />
          </span>
          <span className="shrink-0 mt-1.5">
            <Chevron abierto={abierto} />
          </span>
        </div>
      </button>
      {abierto ? (
        <div className="mt-3 space-y-1">
          {desglose ? (
            <p className="text-[13px] text-slate-500">{desglose}</p>
          ) : null}
          <p className="text-[15px] text-slate-500 leading-snug">{detalle}</p>
        </div>
      ) : null}
    </div>
  );
}

function AlertaIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
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

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
