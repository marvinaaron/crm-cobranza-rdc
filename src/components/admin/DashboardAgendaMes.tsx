"use client";

import Link from "next/link";
import type { Cliente } from "@/lib/clientes";
import { formatearFechaNacimientoCorta } from "@/lib/clientes";
import type { RegistroEfirma } from "@/lib/efirma/types";
import { formatFechaCertificado } from "@/lib/efirma/vigencia";
import BotonesCalendarioCumple from "@/components/admin/BotonesCalendarioCumple";

type Cumple = {
  cliente: Cliente;
  fecha: { mes: number; dia: number; anio: number };
  diasParaCumple: number;
};

type Efirma = {
  reg: RegistroEfirma;
  dias: number;
  cliente: Cliente;
};

type Props = {
  mesNombre: string;
  cumples: Cumple[];
  efirmas: Efirma[];
};

export default function DashboardAgendaMes({ mesNombre, cumples, efirmas }: Props) {
  return (
    <section className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] overflow-hidden">
      <div className="px-4 py-3.5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-slate-500">Agenda</p>
          <p className="text-[20px] font-bold text-slate-900 tracking-tight leading-tight">
            Cumpleaños y e.firmas
          </p>
        </div>
        <BotonesCalendarioCumple />
      </div>

      <div className="px-4 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Cumpleaños · {mesNombre}
        </p>
      </div>
      {cumples.length === 0 ? (
        <p className="px-4 pb-4 text-[15px] text-slate-400">Nadie cumple años este mes.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {cumples.map(({ cliente, fecha, diasParaCumple }) => {
            const esHoy = diasParaCumple === 0;
            const yaPaso = diasParaCumple < 0;
            const etiqueta = esHoy
              ? "Hoy"
              : yaPaso
                ? "Ya pasó"
                : diasParaCumple === 1
                  ? "Mañana"
                  : `En ${diasParaCumple} días`;
            return (
              <li key={cliente.id}>
                <Link
                  href={`/clientes#cliente=${cliente.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 active:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">
                      {cliente.razonSocial}
                    </p>
                    <p className="text-[13px] text-slate-400">
                      {formatearFechaNacimientoCorta(fecha)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[13px] font-semibold ${
                      esHoy ? "text-indigo-600" : yaPaso ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {etiqueta}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="px-4 pt-3 pb-2 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          E.firmas · 90 días
        </p>
        <Link href="/accesos" className="text-[13px] font-semibold text-amber-700">
          Ver todas
        </Link>
      </div>
      {efirmas.length === 0 ? (
        <p className="px-4 pb-4 text-[15px] text-slate-400">
          Sin vencimientos en los próximos 90 días.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {efirmas.map(({ reg, dias, cliente }) => {
            const urgente = dias <= 7;
            const etiqueta =
              dias === 0 ? "Hoy" : dias === 1 ? "Mañana" : `En ${dias} días`;
            return (
              <li key={reg.id}>
                <Link
                  href={`/accesos#cliente=${cliente.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 active:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">
                      {cliente.razonSocial}
                    </p>
                    <p className="text-[13px] text-slate-400">
                      Vence {formatFechaCertificado(reg.vigenciaFin)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[13px] font-semibold ${
                      urgente ? "text-rose-600" : dias <= 30 ? "text-amber-600" : "text-slate-500"
                    }`}
                  >
                    {etiqueta}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
