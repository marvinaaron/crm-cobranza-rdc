"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACTIVOS,
  ACTIVOS_ORDEN_DEFECTO,
  MERCADOS_FALLBACK,
  decimalesActivo,
  etiquetaPar,
  formatearValorActivo,
  guardarPreferenciasActivos,
  leerPreferenciasActivos,
  type IdActivo,
  type IndicadorMercado,
  type RespuestaMercados,
  type TasaActivo,
} from "@/lib/fiscal/divisas";
import BotonCopiar from "./BotonCopiar";

function MiniSparkline({ puntos, color = "#8b5cf6" }: { puntos: number[]; color?: string }) {
  if (puntos.length < 2) {
    return <div className="h-10 w-full rounded bg-slate-50" />;
  }
  const W = 120;
  const H = 40;
  const min = Math.min(...puntos);
  const max = Math.max(...puntos);
  const rango = max - min || 1;
  const pts = puntos.map((v, i) => {
    const x = (i / (puntos.length - 1)) * W;
    const y = H - ((v - min) / rango) * (H - 4) - 2;
    return { x, y };
  });
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M ${pts[0].x} ${pts[0].y} ${pts
    .slice(1)
    .map((p) => `L ${p.x} ${p.y}`)
    .join(" ")} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${color})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeroUsd({
  usd,
  historial,
  usdFix,
}: {
  usd: TasaActivo;
  historial: { fecha: string; valor: number }[];
  usdFix: number | null;
}) {
  const spark = historial.length >= 2 ? historial.map((p) => p.valor) : usd.sparkline;
  const min30 = spark.length ? Math.min(...spark) : null;
  const max30 = spark.length ? Math.max(...spark) : null;
  const subio = (usd.variacionPct ?? 0) >= 0;

  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-marca-navy">
            Dólar · referencia principal
          </p>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-4xl sm:text-5xl font-black text-slate-900 tabular-nums leading-none">
              ${usd.valor.toFixed(2)}
              <span className="text-lg text-slate-400 font-bold ml-2">MXN</span>
            </p>
            <BotonCopiar valor={usd.valor.toFixed(4)} etiqueta="USD/MXN" />
          </div>
          <p className="text-sm text-slate-500 mt-2">1 USD = {usd.valor.toFixed(4)} pesos</p>
          {usdFix !== null && Math.abs(usdFix - usd.valor) > 0.001 ? (
            <p className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1.5">
              FIX Banxico: <span className="font-semibold tabular-nums">${usdFix.toFixed(4)}</span>
              <BotonCopiar
                valor={usdFix.toFixed(4)}
                etiqueta="USD FIX"
                className="!h-5 !w-5"
              />
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {usd.variacionPct !== null ? (
              <span
                className={`font-semibold tabular-nums ${
                  subio ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {subio ? "↑" : "↓"} {Math.abs(usd.variacionPct).toFixed(2)}% vs día hábil previo
              </span>
            ) : null}
            {min30 !== null && max30 !== null ? (
              <span className="text-slate-500 tabular-nums">
                Rango 30d: ${min30.toFixed(2)} – ${max30.toFixed(2)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="p-4 sm:p-6 bg-slate-50/80 flex flex-col justify-end min-h-[140px]">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Últimos 30 días
          </p>
          <MiniSparkline puntos={spark} />
        </div>
      </div>
    </div>
  );
}

function ConversorRapido({ activos }: { activos: TasaActivo[] }) {
  const opciones = activos.filter((a) => a.id !== "WTI");
  const [monto, setMonto] = useState("1000");
  const [moneda, setMoneda] = useState<IdActivo>("USD");

  const tasa = opciones.find((a) => a.id === moneda);
  const resultado = useMemo(() => {
    const n = parseFloat(monto.replace(/,/g, ""));
    if (!tasa || !Number.isFinite(n)) return null;
    return n * tasa.valor;
  }, [monto, tasa]);

  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-5 sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
        Conversor rápido
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Cantidad
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-lg font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="sm:w-36">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Moneda
          </label>
          <select
            value={moneda}
            onChange={(e) => setMoneda(e.target.value as IdActivo)}
            className="mt-1 w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {opciones.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white">
        <p className="text-[10px] uppercase tracking-widest text-slate-400">Resultado en MXN</p>
        <p className="text-2xl font-black tabular-nums mt-1">
          {resultado !== null
            ? resultado.toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
                maximumFractionDigits: 2,
              })
            : "—"}
        </p>
      </div>
    </div>
  );
}

function FilaIndicadores({ items }: { items: IndicadorMercado[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((ind) => {
        const subio = (ind.variacionPct ?? 0) >= 0;
        const neutro = ind.variacionPct === null;
        const valorTexto =
          ind.unidad === "%"
            ? `${ind.valor.toFixed(2)}%`
            : ind.unidad === "USD/bbl"
            ? `$${ind.valor.toFixed(2)}`
            : ind.valor.toFixed(ind.id === "UDI" ? 4 : 2);
        const valorCopia =
          ind.unidad === "%"
            ? ind.valor.toFixed(4)
            : ind.id === "UDI"
            ? ind.valor.toFixed(6)
            : ind.valor.toFixed(2);

        return (
          <div
            key={ind.id}
            className="rounded-xl ring-1 ring-slate-200 bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {ind.etiqueta}
              </p>
              <BotonCopiar
                valor={valorCopia}
                etiqueta={ind.etiqueta}
                className="!h-5 !w-5"
              />
            </div>
            <p className="mt-1 text-xl font-black text-slate-900 tabular-nums">{valorTexto}</p>
            {!neutro ? (
              <p
                className={`text-[10px] tabular-nums mt-0.5 ${
                  subio ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {subio ? "↑" : "↓"} {Math.abs(ind.variacionPct ?? 0).toFixed(2)}%
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-0.5">Referencia</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FichaActivo({ tasa }: { tasa: TasaActivo }) {
  const info = ACTIVOS[tasa.id];
  const subio = (tasa.variacionPct ?? 0) >= 0;
  const neutro = tasa.variacionPct === null;

  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{info.bandera}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{etiquetaPar(tasa.id)}</p>
            <p className="text-[10px] text-slate-500 truncate">{info.nombre}</p>
          </div>
        </div>
        {!neutro && tasa.id !== "WTI" ? (
          <span
            className={`shrink-0 text-[10px] tabular-nums px-1.5 py-0.5 rounded-full ${
              subio ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {subio ? "↑" : "↓"}
            {tasa.variacionPct !== null ? ` ${Math.abs(tasa.variacionPct).toFixed(1)}%` : ""}
          </span>
        ) : null}
      </div>
      <p className="text-2xl font-black text-slate-900 tabular-nums">
        {formatearValorActivo(tasa.id, tasa.valor)}
      </p>
      {tasa.sparkline.length >= 2 ? (
        <div className="mt-3">
          <MiniSparkline
            puntos={tasa.sparkline}
            color={tasa.id === "BTC" ? "#f59e0b" : tasa.id === "XAU" ? "#eab308" : "#8b5cf6"}
          />
        </div>
      ) : null}
    </div>
  );
}

function SeccionPersonalizar({
  preferidos,
  onChange,
}: {
  preferidos: IdActivo[];
  onChange: (ids: IdActivo[]) => void;
}) {
  const toggle = (id: IdActivo) => {
    if (id === "USD") return;
    if (preferidos.includes(id)) {
      onChange(preferidos.filter((x) => x !== id));
    } else {
      onChange([...preferidos, id]);
    }
  };

  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-5">
      <p className="text-sm text-slate-600 mb-4">
        Elige qué divisas y activos quieres ver en la cuadrícula. El dólar siempre permanece
        destacado arriba. Tu selección se guarda en este navegador.
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIVOS_ORDEN_DEFECTO.map((id) => {
          const activo = preferidos.includes(id);
          const bloqueado = id === "USD";
          return (
            <button
              key={id}
              type="button"
              disabled={bloqueado}
              onClick={() => toggle(id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                bloqueado
                  ? "bg-slate-900 text-white cursor-default"
                  : activo
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-900"
              }`}
            >
              <span>{ACTIVOS[id].bandera}</span>
              {id}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange([...ACTIVOS_ORDEN_DEFECTO])}
        className="mt-4 text-xs font-semibold text-marca-navy hover:text-indigo-800"
      >
        Restablecer todas
      </button>
    </div>
  );
}

export default function PanelDivisas() {
  const [datos, setDatos] = useState<RespuestaMercados>(MERCADOS_FALLBACK);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<"mercado" | "personalizar">("mercado");
  const [preferidos, setPreferidos] = useState<IdActivo[]>(ACTIVOS_ORDEN_DEFECTO);

  useEffect(() => {
    setPreferidos(leerPreferenciasActivos());
  }, []);

  useEffect(() => {
    let activo = true;
    fetch("/api/fiscal/divisas")
      .then((r) => r.json())
      .then((d: RespuestaMercados) => {
        if (activo && d?.activos?.length) setDatos(d);
      })
      .catch(() => {})
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const usd = datos.activos.find((a) => a.id === "USD");
  const activosGrid = useMemo(
    () =>
      preferidos
        .filter((id) => id !== "USD")
        .map((id) => datos.activos.find((a) => a.id === id))
        .filter((a): a is TasaActivo => !!a),
    [preferidos, datos.activos]
  );

  const indicadoresVisibles = datos.indicadores.filter((i) =>
    ["UDI", "TIIE_28", "WTI"].includes(i.id)
  );

  const handlePreferidos = (ids: IdActivo[]) => {
    const conUsd: IdActivo[] = ids.includes("USD") ? ids : ["USD", ...ids];
    setPreferidos(conUsd);
    guardarPreferenciasActivos(conUsd);
  };

  return (
    <div className="space-y-4 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Mercados y divisas</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {cargando ? "Actualizando…" : `Cotización del ${datos.actualizadoEn}`}
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
          {(
            [
              { id: "mercado", label: "Mercado" },
              { id: "personalizar", label: "Personalizar" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setVista(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                vista === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {vista === "personalizar" ? (
        <SeccionPersonalizar preferidos={preferidos} onChange={handlePreferidos} />
      ) : (
        <>
          {usd ? (
            <HeroUsd usd={usd} historial={datos.historialUsd} usdFix={datos.usdFix} />
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConversorRapido activos={datos.activos} />
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-1">
                Indicadores México
              </p>
              <FilaIndicadores items={indicadoresVisibles} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 px-1">
              Otras divisas y activos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activosGrid.map((tasa) => (
                <FichaActivo key={tasa.id} tasa={tasa} />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="rounded-2xl ring-1 ring-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed space-y-2">
        <p className="font-bold">Fuentes de datos</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <strong>USD FIX, UDI y TIIE:</strong> Banco de México (Banxico). Configure{" "}
            <code className="text-[10px] bg-amber-100 px-1 rounded">BANXICO_TOKEN</code> en el
            servidor para datos oficiales en vivo.
          </li>
          <li>
            <strong>Divisas:</strong> BCE vía Frankfurter.app (referencia diaria).
          </li>
          <li>
            <strong>Bitcoin y oro:</strong> CoinGecko (referencia, no oficial para contabilidad).
          </li>
          <li>
            <strong>WTI:</strong> valor referencial; para operaciones fiscales use fuentes
            especializadas.
          </li>
        </ul>
      </div>
    </div>
  );
}
