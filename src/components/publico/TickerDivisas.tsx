"use client";

import { useEffect, useState } from "react";
import { MONEDAS, type RespuestaDivisas, type TasaDivisa } from "@/lib/fiscal/divisas";

function FlechaIcono({ subio, neutro }: { subio: boolean; neutro: boolean }) {
  if (neutro) return <span className="opacity-60">·</span>;
  return subio ? <span>▲</span> : <span>▼</span>;
}

function TickerItem({ tasa }: { tasa: TasaDivisa }) {
  const subio = (tasa.variacionPct ?? 0) >= 0;
  const neutro = tasa.variacionPct === null;
  const moneda = MONEDAS[tasa.codigo];

  return (
    <span className="inline-flex items-center gap-2 px-4 text-xs sm:text-sm">
      <span className="tracking-wide text-slate-600">{moneda.codigo}/MXN</span>
      <span className="tabular-nums text-slate-900">
        ${tasa.valorMxn.toFixed(tasa.codigo === "JPY" || tasa.codigo === "CNY" ? 4 : 2)}
      </span>
      <span
        className={`tabular-nums ${
          neutro ? "text-slate-400" : subio ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        <FlechaIcono subio={subio} neutro={neutro} />
        {tasa.variacionPct !== null ? ` ${Math.abs(tasa.variacionPct).toFixed(2)}%` : ""}
      </span>
    </span>
  );
}

export default function TickerDivisas() {
  const [datos, setDatos] = useState<RespuestaDivisas | null>(null);

  useEffect(() => {
    let activo = true;
    fetch("/api/fiscal/divisas")
      .then((r) => r.json())
      .then((d: RespuestaDivisas) => {
        if (activo) setDatos(d);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  if (!datos || !datos.tasas.length) return null;

  // Duplicamos las tasas para que la animación sea continua sin saltos.
  const tasasDuplicadas = [...datos.tasas, ...datos.tasas];

  return (
    <div className="relative overflow-hidden bg-white border-b border-slate-200">
      {/* Etiqueta fija */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 sm:px-4 bg-slate-900 text-white">
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
          Tipo de cambio
        </span>
      </div>

      {/* Fade derecho */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white to-transparent" />

      {/* Ticker animado */}
      <div className="ticker-track flex py-2.5 whitespace-nowrap pl-32 sm:pl-36 will-change-transform">
        {tasasDuplicadas.map((tasa, i) => (
          <TickerItem key={`${tasa.codigo}-${i}`} tasa={tasa} />
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 45s linear infinite;
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
