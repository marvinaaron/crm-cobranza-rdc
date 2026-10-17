"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
  type CSSProperties,
} from "react";
import { MESES_NOM, type Cliente } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { usePeriodoFiscal } from "@/hooks/usePeriodoPortal";
import {
  cierreContableCapturado,
  formatMontoImpuesto,
} from "@/lib/cumplimiento";

const W = 760;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 22, left: 48 };

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type MesCierre = {
  mes: number;
  label: string;
  capturado: boolean;
  ingresos: number;
  gastos: number;
  ventasExentas: number;
  utilidad: number;
};

type Punto = { x: number; y: number; valor: number; label: string; mes: number };

function utilidadDe(ingresos: number, gastos: number) {
  return Math.round((ingresos - gastos) * 100) / 100;
}

function fmtCompact(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}k`;
  return `${sign}$${abs}`;
}

function curvaSuave(puntos: Punto[]): string {
  if (puntos.length === 0) return "";
  if (puntos.length === 1) return `M ${puntos[0].x} ${puntos[0].y}`;
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function etiquetaUtilidad(n: number) {
  return n < 0 ? "Pérdida" : "Utilidad";
}

export default function PortalCierreIngresosGastos({
  cliente,
}: {
  cliente: Cliente;
}) {
  const uid = useId().replace(/:/g, "");
  const { getCumplimientoPeriodo } = useClientes();
  const { periodoVista } = usePeriodoFiscal();
  const anio = periodoVista.anio;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [hoverMes, setHoverMes] = useState<number | null>(null);
  const [modo, setModo] = useState<"anual" | "mes">("anual");
  const [mesSeleccionado, setMesSeleccionado] = useState(periodoVista.mes);

  const meses: MesCierre[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, mes) => {
        const reg = getCumplimientoPeriodo(cliente.id, { mes, anio });
        const cierre = reg?.cierreContable;
        const capturado = cierreContableCapturado(reg);
        const ingresos = capturado ? cierre?.ingresos ?? 0 : 0;
        const gastos = capturado ? cierre?.gastos ?? 0 : 0;
        return {
          mes,
          label: MESES_CORTOS[mes],
          capturado,
          ingresos,
          gastos,
          ventasExentas: capturado ? cierre?.ventasExentas ?? 0 : 0,
          utilidad: capturado ? utilidadDe(ingresos, gastos) : 0,
        };
      }),
    [anio, cliente.id, getCumplimientoPeriodo]
  );

  const capturados = useMemo(
    () => meses.filter((m) => m.capturado),
    [meses]
  );

  useEffect(() => {
    if (meses[periodoVista.mes]?.capturado) {
      setMesSeleccionado(periodoVista.mes);
      return;
    }
    if (capturados.length > 0) {
      setMesSeleccionado(capturados[capturados.length - 1].mes);
    }
  }, [capturados, meses, periodoVista.mes]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setProgreso(1);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 900;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setProgreso(eased);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const chart = useMemo(() => {
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const valores = capturados.map((m) => m.utilidad);
    const minVal = Math.min(0, ...valores);
    const maxVal = Math.max(0, ...valores, 1);
    const rango = maxVal - minVal || 1;
    const yDeEstatico = (valor: number) =>
      PAD.top + innerH * (1 - (valor - minVal) / rango);
    const yZero = yDeEstatico(0);
    const yDe = (valor: number) =>
      yZero + (yDeEstatico(valor) - yZero) * progreso;
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const valor = minVal + rango * t;
      return { y: yDeEstatico(valor), label: fmtCompact(valor), t };
    });
    const pts = meses.map((m) => ({
      x: PAD.left + (innerW * m.mes) / 11,
      y: yDe(m.utilidad),
      valor: m.utilidad,
      label: m.label,
      mes: m.mes,
    }));
    const ptsCapturados = pts.filter((_, i) => meses[i].capturado);
    const linea = curvaSuave(ptsCapturados);
    let area = "";
    if (ptsCapturados.length === 1) {
      const p = ptsCapturados[0];
      area = `M ${p.x - 10} ${yZero} L ${p.x - 10} ${p.y} L ${p.x + 10} ${p.y} L ${p.x + 10} ${yZero} Z`;
    } else if (ptsCapturados.length > 1) {
      area = `${linea} L ${ptsCapturados[ptsCapturados.length - 1].x} ${yZero} L ${ptsCapturados[0].x} ${yZero} Z`;
    }
    return { yTicks, pts, ptsCapturados, linea, area, yZero };
  }, [capturados, meses, progreso]);

  const utilidadAnual = capturados.reduce((a, m) => a + m.utilidad, 0);
  const mesActivo =
    hoverMes !== null && modo === "anual" ? hoverMes : mesSeleccionado;
  const datoMes = meses[mesActivo];
  const tooltipPunto =
    hoverMes !== null && chart.pts[hoverMes] ? chart.pts[hoverMes] : null;

  if (capturados.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-[2rem] border border-slate-50 shadow-sm px-4 sm:px-5 pt-5 pb-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Ingresos, gastos y utilidad
          </p>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Utilidad {anio}
          </h2>
          <p
            className={`mt-2 text-2xl font-black tabular-nums leading-none bg-clip-text text-transparent bg-gradient-to-r ${
              utilidadAnual < 0
                ? "from-red-700 via-rose-600 to-orange-500"
                : "from-blue-900 via-indigo-700 to-violet-600"
            }`}
          >
            {formatMontoImpuesto(utilidadAnual)}
          </p>
          <p
            className={`mt-1 text-[10px] font-black tabular-nums ${
              utilidadAnual >= 0 ? "text-violet-600" : "text-red-500"
            }`}
          >
            {etiquetaUtilidad(utilidadAnual)} acumulada
            {capturados.length === 1
              ? ` · ${MESES_NOM[capturados[0].mes]}`
              : ` · ${capturados.length} meses`}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2 ml-auto">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setModo("anual")}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                modo === "anual"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Año
            </button>
            <button
              type="button"
              onClick={() => setModo("mes")}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                modo === "mes"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Mes
            </button>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-[8px] font-black uppercase tracking-widest text-violet-700">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            {anio}
          </span>
        </div>
      </div>

      {modo === "anual" ? (
        <div className="relative min-h-[168px] w-full -mx-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Utilidad mes a mes en ${anio}`}
            onMouseLeave={() => setHoverMes(null)}
          >
            <defs>
              <linearGradient id={`grad-ut-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                <stop offset="55%" stopColor="#9333ea" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={`line-ut-${uid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#c026d3" />
              </linearGradient>
            </defs>

            {chart.yTicks.map((tick) => (
              <g key={tick.t}>
                <line
                  x1={PAD.left}
                  y1={tick.y}
                  x2={W - PAD.right}
                  y2={tick.y}
                  stroke="#f1f5f9"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-bold"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            <line
              x1={PAD.left}
              y1={chart.yZero}
              x2={W - PAD.right}
              y2={chart.yZero}
              stroke="#cbd5e1"
              strokeWidth={1.25}
            />

            {chart.area && (
              <path d={chart.area} fill={`url(#grad-ut-${uid})`} />
            )}

            <path
              d={chart.linea}
              fill="none"
              stroke={`url(#line-ut-${uid})`}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0 2px 6px rgba(139, 92, 246, 0.38))",
              }}
            />

            {chart.pts.map((p, i) => (
              <text
                key={`label-${i}`}
                x={p.x}
                y={H - 4}
                textAnchor="middle"
                className={`text-[9px] font-black uppercase ${
                  meses[i].capturado ? "fill-slate-500" : "fill-slate-300"
                }`}
              >
                {p.label}
              </text>
            ))}

            {chart.pts.map((p, i) => {
              if (!meses[i].capturado) return null;
              const esActivo = hoverMes === i || mesSeleccionado === i;
              return (
                <g key={`radar-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill="#a855f7"
                    opacity={0.55}
                    style={{
                      transformOrigin: `${p.x}px ${p.y}px`,
                      animation: `radarPulse 2.4s ease-out ${i * 0.18}s infinite`,
                    }}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={esActivo ? 5.5 : 4}
                    fill={esActivo ? "#9333ea" : "#a855f7"}
                    stroke="white"
                    strokeWidth={2}
                    style={{
                      transition: "r 0.18s ease, fill 0.18s ease",
                      filter: "drop-shadow(0 0 6px rgba(168, 85, 247, 0.55))",
                    }}
                  />
                </g>
              );
            })}

            {chart.pts.map((p, i) => {
              if (!meses[i].capturado) return null;
              const slot = (W - PAD.left - PAD.right) / 11;
              return (
                <rect
                  key={`hit-${i}`}
                  x={p.x - slot / 2}
                  y={PAD.top}
                  width={slot}
                  height={H - PAD.top - PAD.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHoverMes(i)}
                  onClick={() => setMesSeleccionado(i)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}

            {hoverMes !== null && chart.pts[hoverMes] && (
              <line
                x1={chart.pts[hoverMes].x}
                y1={PAD.top}
                x2={chart.pts[hoverMes].x}
                y2={H - PAD.bottom}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.6}
              />
            )}
          </svg>

          {tooltipPunto && hoverMes !== null && meses[hoverMes]?.capturado && (
            <TooltipMes
              x={(tooltipPunto.x / W) * 100}
              y={(tooltipPunto.y / H) * 100}
              dato={meses[hoverMes]}
              anio={anio}
            />
          )}
        </div>
      ) : (
        <DetalleMesView
          meses={meses}
          mesIdx={mesSeleccionado}
          setMesIdx={setMesSeleccionado}
          anio={anio}
        />
      )}

      {datoMes ? (
        <ResumenMesPuntual dato={datoMes} anio={anio} />
      ) : null}

      {capturados.length > 1 ? (
        <HistoricoMeses
          meses={capturados}
          mesActivo={mesSeleccionado}
          onElegir={(mes) => {
            setMesSeleccionado(mes);
            setModo("mes");
          }}
        />
      ) : null}

      <p className="text-[9px] font-bold text-slate-400 mt-3 text-center">
        {modo === "anual"
          ? "Toca un mes para ver utilidad, ingresos y gastos"
          : "Cambia de mes con las flechas · Año muestra el comportamiento anual"}
      </p>

      <style jsx global>{`
        @keyframes radarPulse {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          70% {
            transform: scale(2.4);
            opacity: 0;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function ResumenMesPuntual({ dato, anio }: { dato: MesCierre; anio: number }) {
  if (!dato.capturado) {
    return (
      <p className="text-[13px] text-slate-500 text-center py-3 leading-snug">
        Tu despacho aún no registra el cierre de {MESES_NOM[dato.mes]}.
      </p>
    );
  }
  const perdida = dato.utilidad < 0;
  return (
    <div className="mt-3 space-y-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
        {MESES_NOM[dato.mes]} {anio}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <StatMes
          label={etiquetaUtilidad(dato.utilidad)}
          monto={dato.utilidad}
          tono={perdida ? "perdida" : "utilidad"}
        />
        <StatMes label="Ingresos" monto={dato.ingresos} tono="neutro" />
        <StatMes label="Gastos" monto={dato.gastos} tono="neutro" />
      </div>
      {dato.ventasExentas > 0 ? (
        <p className="text-[12px] text-slate-500">
          Ventas exentas {formatMontoImpuesto(dato.ventasExentas)}
        </p>
      ) : null}
    </div>
  );
}

function StatMes({
  label,
  monto,
  tono,
}: {
  label: string;
  monto: number;
  tono: "utilidad" | "perdida" | "neutro";
}) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p
        className={`text-[13px] sm:text-[15px] font-black tabular-nums leading-tight ${
          tono === "perdida"
            ? "text-red-600"
            : tono === "utilidad"
              ? "text-violet-700"
              : "text-slate-800"
        }`}
      >
        {formatMontoImpuesto(monto)}
      </p>
    </div>
  );
}

function HistoricoMeses({
  meses,
  mesActivo,
  onElegir,
}: {
  meses: MesCierre[];
  mesActivo: number;
  onElegir: (mes: number) => void;
}) {
  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
        Histórico
      </p>
      <ul className="space-y-1">
        {[...meses].reverse().map((m) => {
          const activo = m.mes === mesActivo;
          return (
            <li key={m.mes}>
              <button
                type="button"
                onClick={() => onElegir(m.mes)}
                className={`w-full flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  activo ? "bg-violet-50" : "hover:bg-slate-50"
                }`}
              >
                <span
                  className={`text-[13px] font-semibold ${
                    activo ? "text-violet-800" : "text-slate-600"
                  }`}
                >
                  {MESES_NOM[m.mes]}
                </span>
                <span className="min-w-0 flex-1 text-right text-[11px] text-slate-400 tabular-nums truncate">
                  {formatMontoImpuesto(m.ingresos)} ·{" "}
                  {formatMontoImpuesto(m.gastos)}
                </span>
                <span
                  className={`text-[13px] font-black tabular-nums shrink-0 ${
                    m.utilidad < 0 ? "text-red-600" : "text-violet-700"
                  }`}
                >
                  {formatMontoImpuesto(m.utilidad)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TooltipMes({
  x,
  y,
  dato,
  anio,
}: {
  x: number;
  y: number;
  dato: MesCierre;
  anio: number;
}) {
  const lado: "izq" | "der" = x > 70 ? "izq" : "der";
  const style: CSSProperties = {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(${lado === "der" ? "12px" : "calc(-100% - 12px)"}, -50%)`,
  };
  const textoHalo: CSSProperties = {
    textShadow:
      "0 1px 2px rgba(255,255,255,0.85), 0 0 6px rgba(255,255,255,0.55)",
  };
  return (
    <div
      className="pointer-events-none absolute z-10 min-w-[168px] rounded-2xl bg-white/25 backdrop-blur-2xl backdrop-saturate-200 shadow-[0_8px_32px_rgba(15,23,42,0.12)] px-3.5 py-3 ring-1 ring-white/50 border border-white/30"
      style={style}
    >
      <p
        className="text-[9px] font-black text-violet-700 uppercase tracking-widest mb-2"
        style={textoHalo}
      >
        {MESES_NOM[dato.mes]} {anio}
      </p>
      <div className="space-y-1.5">
        <FilaTip
          label={etiquetaUtilidad(dato.utilidad)}
          valor={formatMontoImpuesto(dato.utilidad)}
          fuerte
          negativo={dato.utilidad < 0}
          halo={textoHalo}
        />
        <FilaTip
          label="Ingresos"
          valor={formatMontoImpuesto(dato.ingresos)}
          halo={textoHalo}
        />
        <FilaTip
          label="Gastos"
          valor={formatMontoImpuesto(dato.gastos)}
          halo={textoHalo}
        />
      </div>
    </div>
  );
}

function FilaTip({
  label,
  valor,
  fuerte,
  negativo,
  halo,
}: {
  label: string;
  valor: string;
  fuerte?: boolean;
  negativo?: boolean;
  halo: CSSProperties;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className="text-[10px] font-bold text-slate-600 uppercase tracking-wider"
        style={halo}
      >
        {label}
      </span>
      <span
        className={`text-sm font-black tabular-nums ${
          negativo ? "text-red-600" : fuerte ? "text-violet-700" : "text-slate-700"
        }`}
        style={halo}
      >
        {valor}
      </span>
    </div>
  );
}

function DetalleMesView({
  meses,
  mesIdx,
  setMesIdx,
  anio,
}: {
  meses: MesCierre[];
  mesIdx: number;
  setMesIdx: (v: number) => void;
  anio: number;
}) {
  const dato = meses[mesIdx];
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <button
        type="button"
        onClick={() => setMesIdx(Math.max(0, mesIdx - 1))}
        disabled={mesIdx === 0}
        className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Mes anterior"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Detalle del mes
        </p>
        <p className="text-lg font-black text-slate-800 uppercase tracking-tight">
          {dato ? MESES_NOM[dato.mes] : ""} {anio}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setMesIdx(Math.min(11, mesIdx + 1))}
        disabled={mesIdx === 11}
        className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Mes siguiente"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
