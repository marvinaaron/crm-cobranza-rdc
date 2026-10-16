"use client";

import { useState } from "react";
import Link from "next/link";
import type { Cliente } from "@/lib/clientes";
import type { KpisDashboard, MorosoDashboard, PagoSinFactura } from "@/lib/dashboard-metrics";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

type Fila = {
  label: string;
  value: number;
  href?: string;
  tono?: "rose" | "emerald" | "amber" | "slate";
};

type Props = {
  kpis: KpisDashboard;
  deudaTotal: number;
  deudaEnCurso: number;
  deudaAtrasado: number;
  deudaExtras: number;
  mesLabel: string;
  pagosSinFactura: PagoSinFactura[];
  morosos: MorosoDashboard[];
};

export default function DashboardWallet({
  kpis,
  deudaTotal,
  deudaEnCurso,
  deudaAtrasado,
  deudaExtras,
  mesLabel,
  pagosSinFactura,
  morosos,
}: Props) {
  const [abierto, setAbierto] = useState(false);

  const celdas = [
    {
      id: "deuda",
      label: "Deuda",
      value: deudaTotal,
      sub:
        deudaTotal > 0
          ? `${kpis.clientesAtrasados + kpis.clientesPendientes} con saldo`
          : "Al corriente",
      tono: deudaTotal > 0 ? "rose" : "emerald",
    },
    {
      id: "cobrado",
      label: `Cobrado · ${mesLabel}`,
      value: kpis.cobradoMes,
      sub: `${kpis.tasaCobranzaMes}% del esperado`,
      tono: "emerald",
    },
    {
      id: "vencidos",
      label: "Vencidos hoy",
      value: kpis.vencidoMesMonto,
      sub:
        kpis.clientesVencidosMes > 0
          ? `${kpis.clientesVencidosMes} cliente${kpis.clientesVencidosMes === 1 ? "" : "s"}`
          : "Nadie vencido",
      tono: kpis.vencidoMesMonto > 0 ? "rose" : "emerald",
    },
  ] as const;

  const filas: Fila[] = [
    {
      label: "Ingreso en banco",
      value: kpis.ingresoBancarioMes,
      href: "/banco",
      tono: "emerald",
    },
    { label: "Facturado", value: kpis.facturadoMes },
    { label: "Esperado del mes", value: kpis.compromisoMes },
    {
      label: "Cobrado del mes",
      value: kpis.cobradoMes,
      href: "/cobranza?filtro=cobrado_mes",
      tono: "emerald",
    },
    {
      label: "Pendientes del mes",
      value: kpis.porCobrarMes,
      href: "/cobranza?filtro=por_cobrar_mes",
      tono: kpis.porCobrarMes > 0 ? "amber" : "slate",
    },
    {
      label: "Vencidos a hoy",
      value: kpis.vencidoMesMonto,
      href: "/cobranza?filtro=por_cobrar_mes",
      tono: kpis.vencidoMesMonto > 0 ? "rose" : "slate",
    },
    {
      label: "Por vencer del mes",
      value: kpis.porVencerMesMonto,
      tono: kpis.porVencerMesMonto > 0 ? "amber" : "slate",
    },
    { label: "Deuda en curso", value: deudaEnCurso },
    {
      label: "Deuda atrasada",
      value: deudaAtrasado,
      href: "/cobranza?filtro=clientes_atrasados",
      tono: deudaAtrasado > 0 ? "rose" : "slate",
    },
    { label: "Extras por cobrar", value: deudaExtras, tono: deudaExtras > 0 ? "amber" : "slate" },
    { label: "Servicios adicionales", value: kpis.adicionalesMes },
    { label: "Descuentos", value: kpis.descuentosMes },
    ...(kpis.pendienteFacturarMes > 0
      ? [
          {
            label: "Falta facturar",
            value: kpis.pendienteFacturarMes,
            href: "/cobranza",
            tono: "amber" as const,
          },
        ]
      : []),
  ];

  const tonoValor: Record<string, string> = {
    rose: "text-rose-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    slate: "text-slate-900",
  };

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="w-full text-left rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] overflow-hidden active:scale-[0.99] transition-transform"
      >
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          {celdas.map((c) => (
            <div key={c.id} className="px-3.5 py-4 sm:px-5">
              <p className="text-[11px] font-semibold text-slate-500 truncate">{c.label}</p>
              <p
                className={`mt-1.5 text-[22px] sm:text-[26px] font-bold tabular-nums leading-none tracking-tight ${tonoValor[c.tono]}`}
              >
                {fmt(c.value)}
              </p>
              <p className="mt-1.5 text-[11px] text-slate-400 leading-snug">{c.sub}</p>
            </div>
          ))}
        </div>
        <p className="px-5 pb-3 text-[12px] text-slate-400">
          {abierto ? "Toca para cerrar el desglose" : "Toca para ver banco, facturado, esperado y más"}
        </p>
      </button>

      {abierto && (
        <div className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {filas.map((f) => {
              const inner = (
                <>
                  <span className="text-[15px] text-slate-800">{f.label}</span>
                  <span
                    className={`text-[15px] font-semibold tabular-nums ${tonoValor[f.tono ?? "slate"]}`}
                  >
                    {fmt(f.value)}
                    {f.href ? (
                      <span className="ml-1 text-slate-300 font-normal">›</span>
                    ) : null}
                  </span>
                </>
              );
              return (
                <li key={f.label}>
                  {f.href ? (
                    <Link
                      href={f.href}
                      className="flex items-center justify-between gap-3 px-4 py-3 active:bg-slate-50"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {pagosSinFactura.length > 0 && (
            <div className="border-t border-slate-100">
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Sin factura
              </p>
              <ul className="divide-y divide-slate-100">
                {pagosSinFactura.slice(0, 6).map(({ cliente, monto }) => (
                  <li key={cliente.id}>
                    <Link
                      href={`/cobranza?cliente=${cliente.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 active:bg-slate-50"
                    >
                      <span className="text-[15px] text-slate-800 truncate">
                        {cliente.razonSocial}
                      </span>
                      <span className="text-[15px] font-semibold tabular-nums text-violet-700">
                        {fmt(monto)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {morosos.length > 0 && (
            <div className="border-t border-slate-100">
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Mayores saldos
              </p>
              <ul className="divide-y divide-slate-100">
                {morosos.slice(0, 5).map(({ cliente, pendiente }: { cliente: Cliente; pendiente: number }) => (
                  <li key={cliente.id}>
                    <Link
                      href={`/cobranza?cliente=${cliente.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 active:bg-slate-50"
                    >
                      <span className="text-[15px] text-slate-800 truncate">
                        {cliente.razonSocial}
                      </span>
                      <span className="text-[15px] font-semibold tabular-nums text-rose-600">
                        {fmt(pendiente)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
