"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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

const tonoValor: Record<string, string> = {
  rose: "text-rose-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  slate: "text-slate-900",
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

  const sinFactura = pagosSinFactura.slice(0, 8);
  const mayoresSaldos = morosos.slice(0, 6);
  const columnas =
    1 + (sinFactura.length > 0 ? 1 : 0) + (mayoresSaldos.length > 0 ? 1 : 0);

  return (
    <section>
      <div className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] overflow-hidden">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="w-full text-left flex items-stretch active:bg-slate-50/80"
        >
          <div className="grid flex-1 min-w-0 grid-cols-3 divide-x divide-slate-100">
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
          <span className="shrink-0 w-10 sm:w-12 flex items-center justify-center border-l border-slate-100 text-slate-400">
            <ChevronDown
              size={18}
              strokeWidth={2.2}
              className={`transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
              aria-hidden
            />
          </span>
        </button>

        {abierto ? (
          <div
            className={`border-t border-slate-100 grid grid-cols-1 divide-y divide-slate-100 md:divide-y-0 md:divide-x ${
              columnas === 3 ? "md:grid-cols-3" : columnas === 2 ? "md:grid-cols-2" : "md:grid-cols-1"
            }`}
          >
            <Columna titulo="Cobranza">
              {filas.map((f) => (
                <FilaMonto key={f.label} {...f} />
              ))}
            </Columna>

            {sinFactura.length > 0 ? (
              <Columna titulo="Sin factura">
                {sinFactura.map(({ cliente, monto }) => (
                  <FilaMonto
                    key={cliente.id}
                    label={cliente.razonSocial}
                    value={monto}
                    href={`/cobranza?cliente=${cliente.id}`}
                    tono="violet"
                  />
                ))}
              </Columna>
            ) : null}

            {mayoresSaldos.length > 0 ? (
              <Columna titulo="Mayores saldos">
                {mayoresSaldos.map(({ cliente, pendiente }: { cliente: Cliente; pendiente: number }) => (
                  <FilaMonto
                    key={cliente.id}
                    label={cliente.razonSocial}
                    value={pendiente}
                    href={`/cobranza?cliente=${cliente.id}`}
                    tono="rose"
                  />
                ))}
              </Columna>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Columna({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {titulo}
      </p>
      <ul>{children}</ul>
    </div>
  );
}

function FilaMonto({
  label,
  value,
  href,
  tono = "slate",
}: Fila & { tono?: Fila["tono"] | "violet" }) {
  const color =
    tono === "violet" ? "text-violet-700" : tonoValor[tono ?? "slate"];
  const inner = (
    <>
      <span className="min-w-0 truncate text-[14px] text-slate-800">{label}</span>
      <span className={`shrink-0 text-[14px] font-semibold tabular-nums ${color}`}>
        {fmt(value)}
        {href ? <span className="ml-1 text-slate-300 font-normal">›</span> : null}
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <Link
          href={href}
          className="flex items-center justify-between gap-3 px-4 py-2 active:bg-slate-50"
        >
          {inner}
        </Link>
      ) : (
        <div className="flex items-center justify-between gap-3 px-4 py-2">{inner}</div>
      )}
    </li>
  );
}
