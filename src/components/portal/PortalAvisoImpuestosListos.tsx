"use client";

import Link from "next/link";
import { periodoLabel } from "@/lib/clientes";
import { formatFechaLimiteImpuestoCompacta } from "@/lib/cumplimiento";
import { fmtMxn } from "@/components/portal/portal-ui";
import { hrefDeclaraciones } from "@/lib/portal/href-declaraciones";
import type { ImpuestosListosPorPagar } from "@/lib/portal/pendientes-impuestos-inicio";
import { limiteVencido } from "@/lib/cumplimiento-fechas";

type Props = { listos: ImpuestosListosPorPagar };

export default function PortalAvisoImpuestosListos({ listos }: Props) {
  const vencido = listos.fechaLimite ? limiteVencido(listos.fechaLimite) : false;
  const mes = periodoLabel(listos.periodo);

  return (
    <section className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-5 py-5">
      <p className="text-[13px] font-semibold text-amber-800">
        Impuestos listos
      </p>
      <h2 className="mt-1 text-[22px] font-bold text-slate-900 leading-snug tracking-tight">
        {vencido
          ? `Falta pagar ${mes}`
          : `Tus impuestos de ${mes} están listos`}
      </h2>
      {listos.monto > 0 ? (
        <p className="mt-2 text-[28px] font-bold tabular-nums leading-none text-slate-900">
          {fmtMxn(listos.monto)}
        </p>
      ) : null}
      {listos.fechaLimite ? (
        <p
          className={`mt-1 text-[13px] font-semibold ${
            vencido ? "text-red-600" : "text-slate-600"
          }`}
        >
          {vencido ? "Venció" : "Vence"}{" "}
          {formatFechaLimiteImpuestoCompacta(listos.fechaLimite)}
        </p>
      ) : null}
      <p className="mt-2 text-[15px] text-slate-600 leading-snug">
        Declaración y línea de captura ya están en tu portal. Un toque y las
        ves.
      </p>
      <Link
        href={hrefDeclaraciones(listos.periodo)}
        className="mt-4 flex w-full items-center justify-center h-11 px-5 rounded-xl text-[15px] font-semibold text-white bg-[var(--portal-navy)] hover:bg-[var(--portal-navy-hover)]"
      >
        Ver declaración y pagar
      </Link>
    </section>
  );
}
