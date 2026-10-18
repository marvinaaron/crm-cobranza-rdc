"use client";

import { useState, type ReactNode } from "react";
import { useAnilloFill } from "@/hooks/useAnilloFill";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Cliente } from "@/lib/clientes";
import type { KpisDashboard, MorosoDashboard, PagoSinFactura } from "@/lib/dashboard-metrics";
import type { AnilloInicio, TonoAnilloInicio } from "@/lib/dashboard-anillos";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

function fmtEntero(n: number) {
  return Math.round(Math.abs(n)).toLocaleString("es-MX");
}

function anchoDigitosDe(valores: number[]) {
  return Math.max(1, ...valores.map((v) => fmtEntero(v).length));
}

function pct(parte: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (parte / total) * 100));
}

type Fila = {
  label: string;
  value: number;
  href?: string;
  tono?: "rose" | "emerald" | "amber" | "slate" | "violet";
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
  anillos: AnilloInicio[];
};

const tonoValor: Record<NonNullable<Fila["tono"]>, string> = {
  rose: "text-rose-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  slate: "text-slate-900",
  violet: "text-violet-700",
};

const AVATAR_COLORES = [
  "bg-indigo-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-emerald-600",
];

function inicialesCliente(razon: string): string {
  const partes = razon.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0] ?? ""}${partes[1][0] ?? ""}`.toUpperCase();
}

function colorAvatar(id: number): string {
  return AVATAR_COLORES[Math.abs(id) % AVATAR_COLORES.length] ?? "bg-slate-400";
}

export default function DashboardWallet({
  kpis,
  deudaTotal,
  deudaEnCurso,
  deudaAtrasado,
  deudaExtras,
  mesLabel,
  pagosSinFactura,
  morosos,
  anillos,
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

  const filasMes: Fila[] = [
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

  const filasCartera: Fila[] = [
    { label: "Deuda en curso", value: deudaEnCurso },
    {
      label: "Deuda atrasada",
      value: deudaAtrasado,
      href: "/cobranza?filtro=clientes_atrasados",
      tono: deudaAtrasado > 0 ? "rose" : "slate",
    },
    { label: "Extras por cobrar", value: deudaExtras, tono: deudaExtras > 0 ? "amber" : "slate" },
  ];

  const sinFactura = pagosSinFactura.slice(0, 8);
  const restoSinFactura = pagosSinFactura.length - sinFactura.length;
  const mayoresSaldos = morosos.slice(0, 8);
  const restoSaldos = morosos.slice(8);
  const restoSaldosMonto = restoSaldos.reduce((s, m) => s + m.pendiente, 0);
  const maxSaldo = Math.max(...mayoresSaldos.map((m) => m.pendiente), 1);
  const maxSinFactura = Math.max(...sinFactura.map((p) => p.monto), 1);
  const columnas =
    1 + (sinFactura.length > 0 ? 1 : 0) + (mayoresSaldos.length > 0 ? 1 : 0);
  const anchoCobranza = anchoDigitosDe([
    ...filasMes.map((f) => f.value),
    ...filasCartera.map((f) => f.value),
  ]);
  const anchoSinFactura = anchoDigitosDe(sinFactura.map((p) => p.monto));
  const anchoSaldos = anchoDigitosDe(mayoresSaldos.map((m) => m.pendiente));

  return (
    <section>
      <div className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] overflow-hidden">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="relative w-full text-left active:bg-slate-50/80"
        >
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {celdas.map((c) => (
              <div
                key={c.id}
                className={`px-3.5 py-4 sm:px-5 ${c.id === "vencidos" ? "pr-9 sm:pr-11" : ""}`}
              >
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
          <span className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
            <ChevronDown
              size={18}
              strokeWidth={2.2}
              className={`transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
              aria-hidden
            />
          </span>
        </button>

        <div className="grid grid-cols-4 gap-0 sm:gap-1 px-1 sm:px-2 py-3 sm:py-4 border-t border-slate-100">
          {anillos.map((a, i) => (
            <AnilloPortal key={a.id} anillo={a} delayMs={i * 70} />
          ))}
        </div>

        {abierto ? (
          <div
            className={`border-t border-slate-100 grid grid-cols-1 divide-y divide-slate-100 md:divide-y-0 md:divide-x ${
              columnas === 3 ? "md:grid-cols-3" : columnas === 2 ? "md:grid-cols-2" : "md:grid-cols-1"
            }`}
          >
            <Columna titulo="Cobranza" href="/cobranza" pie="Abrir cobranza">
              <Grupo titulo="Este mes">
                {filasMes.map((f) => (
                  <FilaMonto key={f.label} {...f} anchoDigitos={anchoCobranza} />
                ))}
              </Grupo>
              <Grupo titulo="Cartera">
                {filasCartera.map((f) => (
                  <FilaMonto key={f.label} {...f} anchoDigitos={anchoCobranza} />
                ))}
              </Grupo>
            </Columna>

            {sinFactura.length > 0 ? (
              <Columna titulo="Sin factura" href="/cobranza" pie="Ir a facturar">
                {sinFactura.map(({ cliente, monto }) => (
                  <FilaCliente
                    key={cliente.id}
                    cliente={cliente}
                    value={monto}
                    href={`/cobranza?cliente=${cliente.id}`}
                    tono="violet"
                    peso={pct(monto, maxSinFactura)}
                    anchoDigitos={anchoSinFactura}
                  />
                ))}
                {restoSinFactura > 0 ? (
                  <p className="px-4 py-2 text-[12px] text-slate-400">
                    +{restoSinFactura} más por facturar
                  </p>
                ) : null}
              </Columna>
            ) : null}

            {mayoresSaldos.length > 0 ? (
              <Columna
                titulo="Mayores saldos"
                href="/cobranza?filtro=clientes_atrasados"
                pie="Ver atrasados"
              >
                {mayoresSaldos.map(({ cliente, pendiente }: { cliente: Cliente; pendiente: number }) => (
                  <FilaCliente
                    key={cliente.id}
                    cliente={cliente}
                    value={pendiente}
                    href={`/cobranza?cliente=${cliente.id}`}
                    tono="rose"
                    peso={pct(pendiente, maxSaldo)}
                    anchoDigitos={anchoSaldos}
                  />
                ))}
                {restoSaldos.length > 0 ? (
                  <p className="px-4 py-2 text-[12px] text-slate-400">
                    +{restoSaldos.length} más · {fmt(restoSaldosMonto)}
                  </p>
                ) : null}
              </Columna>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Columna({
  titulo,
  href,
  pie,
  children,
}: {
  titulo: string;
  href?: string;
  pie?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 flex flex-col">
      <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {titulo}
      </p>
      <ul className="flex-1">{children}</ul>
      {href && pie ? (
        <Link
          href={href}
          className="mt-auto mx-3 mb-3 px-3 py-2 rounded-xl text-center text-[12px] font-semibold text-marca-navy bg-marca-navy/[0.05] hover:bg-marca-navy/[0.09] transition-colors"
        >
          {pie}
        </Link>
      ) : null}
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <li className="list-none">
      <p className="px-4 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
        {titulo}
      </p>
      <ul>{children}</ul>
    </li>
  );
}

function FilaMonto({
  label,
  value,
  href,
  tono = "slate",
  anchoDigitos,
}: Fila & { anchoDigitos: number }) {
  const color = tonoValor[tono ?? "slate"];
  const inner = (
    <>
      <span className="min-w-0 truncate text-[14px] text-slate-800">{label}</span>
      <span className={`shrink-0 inline-flex items-baseline text-[14px] font-semibold tabular-nums ${color}`}>
        <span>$</span>
        <span className="text-right" style={{ width: `${anchoDigitos}ch` }}>
          {fmtEntero(value)}
        </span>
        <span
          className={`ml-1 font-normal ${href ? "text-slate-300" : "invisible"}`}
          aria-hidden
        >
          ›
        </span>
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

function FilaCliente({
  cliente,
  value,
  href,
  tono,
  peso,
  anchoDigitos,
}: {
  cliente: Cliente;
  value: number;
  href: string;
  tono: "violet" | "rose";
  peso: number;
  anchoDigitos: number;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2.5 px-4 py-2 active:bg-slate-50"
      >
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${colorAvatar(cliente.id)}`}
        >
          {inicialesCliente(cliente.razonSocial)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-[14px] text-slate-800">{cliente.razonSocial}</span>
            <span className={`shrink-0 inline-flex items-baseline text-[14px] font-semibold tabular-nums ${tonoValor[tono]}`}>
              <span>$</span>
              <span className="text-right" style={{ width: `${anchoDigitos}ch` }}>
                {fmtEntero(value)}
              </span>
              <span className="ml-1 text-slate-300 font-normal">›</span>
            </span>
          </span>
          <span className="mt-1 hidden sm:block h-1 rounded-full bg-slate-100 overflow-hidden">
            <span
              className={`block h-full rounded-full ${tono === "rose" ? "bg-rose-400" : "bg-violet-400"}`}
              style={{ width: `${peso}%` }}
            />
          </span>
        </span>
      </Link>
    </li>
  );
}

const COLOR_ANILLO: Record<TonoAnilloInicio, { stroke: string; texto: string }> = {
  navy: { stroke: "#1a164d", texto: "text-[var(--portal-navy,#1a164d)]" },
  emerald: { stroke: "#10b981", texto: "text-emerald-600" },
  amber: { stroke: "#eab308", texto: "text-yellow-600" },
  rose: { stroke: "#ef4444", texto: "text-red-500" },
};

const ANILLO_BOX = 72;
const ANILLO_R = 28;
const ANILLO_STROKE = 5.5;
const ANILLO_CIRC = 2 * Math.PI * ANILLO_R;

function AnilloPortal({
  anillo,
  delayMs = 0,
}: {
  anillo: AnilloInicio;
  delayMs?: number;
}) {
  const color = COLOR_ANILLO[anillo.tono];
  const offset = useAnilloFill(ANILLO_CIRC, anillo.pct);
  const centroLargo = anillo.centro.length > 6;

  return (
    <Link
      href={anillo.href}
      className="flex min-w-0 flex-col items-center gap-1 sm:gap-1.5 rounded-xl px-0.5 sm:px-1 py-1 active:bg-slate-50"
    >
      <span
        className="relative shrink-0 w-14 h-14 sm:w-[72px] sm:h-[72px]"
        role="img"
        aria-label={`${anillo.label} · ${anillo.pie}`}
      >
        <svg
          viewBox={`0 0 ${ANILLO_BOX} ${ANILLO_BOX}`}
          className="h-full w-full -rotate-90"
          aria-hidden
        >
          <circle
            cx={ANILLO_BOX / 2}
            cy={ANILLO_BOX / 2}
            r={ANILLO_R}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={ANILLO_STROKE}
          />
          <circle
            cx={ANILLO_BOX / 2}
            cy={ANILLO_BOX / 2}
            r={ANILLO_R}
            fill="none"
            stroke={color.stroke}
            strokeWidth={ANILLO_STROKE}
            strokeLinecap="round"
            strokeDasharray={ANILLO_CIRC}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
            style={{ transitionDelay: `${delayMs}ms` }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-bold tabular-nums leading-none ${
            centroLargo ? "text-[12px] sm:text-[15px]" : "text-[16px] sm:text-[22px]"
          } ${color.texto}`}
        >
          {anillo.centro}
        </span>
      </span>
      <span className="inline-flex max-w-full items-center justify-center gap-0.5 text-[10px] sm:text-[13px] font-semibold text-center leading-tight text-slate-900">
        <span>{anillo.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hidden sm:block text-slate-400 shrink-0"
          aria-hidden
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
      <span className="text-[9px] sm:text-[12px] text-slate-500 text-center leading-none truncate max-w-full">
        {anillo.pie}
      </span>
    </Link>
  );
}
