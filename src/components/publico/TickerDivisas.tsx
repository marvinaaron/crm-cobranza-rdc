"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type IndicadorMercado,
  type RespuestaMercados,
  type TasaActivo,
  formatearValorActivo,
} from "@/lib/fiscal/divisas";

function ItemTickerForex({ tasa }: { tasa: TasaActivo }) {
  const subio = (tasa.variacionPct ?? 0) >= 0;
  const neutro = tasa.variacionPct === null;
  return (
    <span className="inline-flex items-baseline gap-1.5 px-3 text-[11px]">
      <span className="font-medium text-slate-500">{tasa.id}</span>
      <span className="font-bold tabular-nums text-slate-900">
        {formatearValorActivo(tasa.id, tasa.valor)}
      </span>
      {!neutro ? (
        <span
          className={`tabular-nums text-[10px] font-semibold ${
            subio ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {subio ? "▲" : "▼"}
          {Math.abs(tasa.variacionPct ?? 0).toFixed(2)}%
        </span>
      ) : null}
    </span>
  );
}

function ItemTickerIndicador({ ind }: { ind: IndicadorMercado }) {
  const subio = (ind.variacionPct ?? 0) >= 0;
  const neutro = ind.variacionPct === null;
  const valor =
    ind.unidad === "%"
      ? `${ind.valor.toFixed(2)}%`
      : ind.unidad === "USD/bbl"
      ? `$${ind.valor.toFixed(2)}`
      : ind.valor.toFixed(ind.id === "UDI" ? 4 : 2);

  return (
    <span className="inline-flex items-baseline gap-1.5 px-3 text-[11px]">
      <span className="font-medium text-slate-500">{ind.etiqueta}</span>
      <span className="font-bold tabular-nums text-slate-900">{valor}</span>
      {!neutro ? (
        <span
          className={`tabular-nums text-[10px] font-semibold ${
            subio ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {subio ? "▲" : "▼"}
          {Math.abs(ind.variacionPct ?? 0).toFixed(2)}%
        </span>
      ) : null}
    </span>
  );
}

function formatearFechaCorta(): string {
  return new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
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
    if (!datos) return { fxItems: [] as TasaActivo[], indItems: [] as IndicadorMercado[] };
    const forex = ["USD", "EUR", "GBP", "JPY"] as const;
    const fxItems = forex
      .map((id) => datos.activos.find((a) => a.id === id))
      .filter((a): a is TasaActivo => !!a);
    const indItems = datos.indicadores.filter((i) =>
      ["UDI", "TIIE_28", "WTI"].includes(i.id)
    );
    return { fxItems, indItems };
  }, [datos]);

  if (!datos || (items.fxItems.length === 0 && items.indItems.length === 0)) return null;

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
    <div className="relative overflow-hidden bg-white/95 backdrop-blur border-b border-slate-200/80">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-32 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-white to-transparent" />

      <div className="ticker-track flex py-1.5 whitespace-nowrap pr-36 will-change-transform">
        {duplicados.map((b, i) =>
          b.tipo === "fx" ? (
            <ItemTickerForex key={`fx-${b.data.id}-${i}`} tasa={b.data} />
          ) : (
            <ItemTickerIndicador key={`ind-${b.data.id}-${i}`} ind={b.data} />
          )
        )}
      </div>

      <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center gap-1.5 px-3 bg-white border-l border-slate-200/80">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 tabular-nums">
          {formatearFechaCorta()}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${
            enVivo ? "text-emerald-600" : "text-slate-400"
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
          {enVivo ? "En vivo" : "Ref."}
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
