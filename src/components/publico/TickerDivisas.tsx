"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type IndicadorMercado,
  type RespuestaMercados,
  type TasaActivo,
  formatearValorActivo,
} from "@/lib/fiscal/divisas";

/** Chevron `<` rotado: arriba = -90°, abajo = 90°. */
function FlechaVar({ subio }: { subio: boolean }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      style={{ transform: subio ? "rotate(-90deg)" : "rotate(90deg)" }}
      aria-hidden
    >
      <polyline points="8 2 4 6 8 10" />
    </svg>
  );
}

function Variacion({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const subio = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-[0.12rem] text-[10px] font-semibold tabular-nums tracking-tight ${
        subio
          ? "bg-emerald-500/12 text-emerald-700"
          : "bg-rose-500/12 text-rose-700"
      }`}
    >
      <FlechaVar subio={subio} />
      {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

function ItemTickerForex({ tasa }: { tasa: TasaActivo }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-400">
        {tasa.id}
      </span>
      <span className="text-[12px] font-semibold tabular-nums tracking-tight text-slate-900">
        {formatearValorActivo(tasa.id, tasa.valor)}
      </span>
      <Variacion pct={tasa.variacionPct} />
    </span>
  );
}

function ItemTickerIndicador({ ind }: { ind: IndicadorMercado }) {
  const valor =
    ind.unidad === "%"
      ? `${ind.valor.toFixed(2)}%`
      : ind.unidad === "USD/bbl"
        ? `$${ind.valor.toFixed(2)}`
        : ind.valor.toFixed(ind.id === "UDI" ? 4 : 2);

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-400">
        {ind.etiqueta}
      </span>
      <span className="text-[12px] font-semibold tabular-nums tracking-tight text-slate-900">
        {valor}
      </span>
      <Variacion pct={ind.variacionPct} />
    </span>
  );
}

function Separador() {
  return (
    <span
      className="mx-0.5 inline-block h-3 w-px shrink-0 bg-slate-200/90"
      aria-hidden
    />
  );
}

function formatearFechaCorta(): string {
  return new Date()
    .toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    })
    .replace(".", "")
    .toUpperCase();
}

export default function TickerDivisas() {
  const [datos, setDatos] = useState<RespuestaMercados | null>(null);

  useEffect(() => {
    let activo = true;
    fetch("/api/fiscal/divisas")
      .then((r) => r.json())
      .then((d: RespuestaMercados) => {
        if (activo) setDatos(d);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  const items = useMemo(() => {
    if (!datos)
      return { fxItems: [] as TasaActivo[], indItems: [] as IndicadorMercado[] };
    const forex = ["USD", "EUR", "GBP", "JPY"] as const;
    const fxItems = forex
      .map((id) => datos.activos.find((a) => a.id === id))
      .filter((a): a is TasaActivo => !!a);
    const indItems = datos.indicadores.filter((i) =>
      ["UDI", "TIIE_28", "WTI"].includes(i.id)
    );
    return { fxItems, indItems };
  }, [datos]);

  if (!datos || (items.fxItems.length === 0 && items.indItems.length === 0))
    return null;

  const enVivo =
    datos.fuentes.divisas !== "fallback" ||
    datos.fuentes.banxico !== "fallback" ||
    datos.fuentes.crypto !== "fallback";

  const bloques = [
    ...items.fxItems.map((t) => ({ tipo: "fx" as const, data: t })),
    ...items.indItems.map((i) => ({ tipo: "ind" as const, data: i })),
  ];
  const duplicados = [...bloques, ...bloques];

  return (
    <div className="rdc-ticker relative overflow-hidden border-b border-slate-200/60 bg-[#f2f2f7]/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-[#f2f2f7] to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-[7.5rem] top-0 z-10 w-8 bg-gradient-to-l from-[#f2f2f7] to-transparent" />

      <div className="ticker-track flex items-center py-2 whitespace-nowrap pr-36 will-change-transform">
        {duplicados.map((b, i) => (
          <span key={`${b.tipo}-${b.data.id}-${i}`} className="inline-flex items-center">
            {i > 0 ? <Separador /> : null}
            {b.tipo === "fx" ? (
              <ItemTickerForex tasa={b.data} />
            ) : (
              <ItemTickerIndicador ind={b.data} />
            )}
          </span>
        ))}
      </div>

      <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center gap-2 bg-[#f2f2f7]/95 pl-2 pr-3 backdrop-blur-md">
        <span className="text-[9px] font-semibold tracking-[0.06em] text-slate-400 tabular-nums">
          {formatearFechaCorta()}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-[0.04em] ${
            enVivo
              ? "bg-emerald-500/12 text-emerald-700"
              : "bg-slate-400/10 text-slate-400"
          }`}
          title={enVivo ? "Datos en vivo" : "Datos referenciales"}
        >
          <span className="relative inline-flex h-1.5 w-1.5">
            {enVivo ? (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            ) : null}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                enVivo ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
          </span>
          {enVivo ? "EN VIVO" : "REF."}
        </span>
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 65s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
