"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
  type CSSProperties,
} from "react";
import type { MesResumenAnual } from "@/lib/dashboard-metrics";
import { MESES_NOM } from "@/lib/clientes";

/**
 * Gráfica de ingresos cobrados vs esperado.
 *
 * Características:
 *  - Línea gris UNIFORME (curva sólida, sin punteado) marcando el
 *    esperado mensual; en cada mes hay un círculo gris con efecto
 *    "radar" (anillo pulsante estilo página pública).
 *  - Tooltip flotante al hover sobre cualquier punto con el importe.
 *  - Área degradada violeta con la línea sólida del cobrado real.
 *  - Comparativa año actual vs año anterior (siempre los dos últimos
 *    años visibles).
 *  - Toggle Año/Mes:
 *      · Año: 12 meses + comparativa
 *      · Mes: detalle visual del mes seleccionado con cobrado vs
 *        esperado, tasa, diferencia y comparativa con el mismo mes
 *        del año anterior.
 *  - Animación de entrada con IntersectionObserver: las áreas y
 *    líneas "suben" desde la base cuando el componente entra al
 *    viewport.
 */
type Props = {
  mesesActual: MesResumenAnual[];
  mesesAnterior: MesResumenAnual[];
  anio: number;
};

const W = 760;
const H = 330;
const PAD = { top: 24, right: 16, bottom: 28, left: 52 };

type Punto = { x: number; y: number; valor: number; label: string; mes: number };

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
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

export default function GraficoIngresosAnual({
  mesesActual,
  mesesAnterior,
  anio,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [hoverMes, setHoverMes] = useState<number | null>(null);
  const [modo, setModo] = useState<"anual" | "mes">("anual");
  const [desgloseAbierto, setDesgloseAbierto] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(() => {
    // por defecto: el último mes con cobrado del año actual
    const enCurso = mesesActual.filter((m) => m.enCurso);
    return enCurso.length > 0 ? enCurso[enCurso.length - 1].mes : 0;
  });

  // Cierra el popover de desglose al click afuera o con Esc.
  useEffect(() => {
    if (!desgloseAbierto) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-desglose-anchor]")) {
        setDesgloseAbierto(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDesgloseAbierto(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [desgloseAbierto]);

  // Animación de entrada con IntersectionObserver.
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
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
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
    const yBase = PAD.top + innerH;

    const enCursoActual = mesesActual.filter((m) => m.enCurso);
    const totalCobrado = enCursoActual.reduce((a, m) => a + m.cobrado, 0);
    const totalEsperado = enCursoActual.reduce((a, m) => a + m.compromiso, 0);

    const todosValores = [
      ...mesesActual.map((m) => Math.max(m.compromiso, m.cobrado)),
      ...mesesAnterior.map((m) => Math.max(m.compromiso, m.cobrado)),
    ];
    const maxValor = Math.max(...todosValores, 1);

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: PAD.top + innerH * (1 - t),
      label: fmtCompact(maxValor * t),
    }));

    const toPunto = (
      m: { mes: number; label: string },
      valor: number
    ): Punto => {
      const x = PAD.left + (innerW * m.mes) / 11;
      // Multiplicamos por progreso para la animación de entrada.
      const altura = (valor / maxValor) * innerH * progreso;
      const y = yBase - altura;
      return { x, y, valor, label: m.label, mes: m.mes };
    };

    const cobradoPts = mesesActual.map((m) =>
      toPunto({ mes: m.mes, label: m.label }, m.cobrado)
    );
    const esperadoPts = mesesActual.map((m) =>
      toPunto({ mes: m.mes, label: m.label }, m.compromiso)
    );
    const anteriorPts = mesesAnterior.map((m) =>
      toPunto({ mes: m.mes, label: m.label }, m.cobrado)
    );

    // Para las líneas solo tomamos los puntos en curso (no proyectamos
    // a meses futuros que tienen valor 0).
    const cobradoEnCurso = cobradoPts.filter((_, i) => mesesActual[i].enCurso);
    const esperadoEnCurso = esperadoPts.filter((_, i) => mesesActual[i].enCurso);

    const lineaCobrado = curvaSuave(cobradoEnCurso);
    const lineaEsperado = curvaSuave(esperadoEnCurso);
    const lineaAnterior = curvaSuave(anteriorPts);
    const areaCobrado =
      cobradoEnCurso.length > 0
        ? `${lineaCobrado} L ${cobradoEnCurso[cobradoEnCurso.length - 1].x} ${yBase} L ${cobradoEnCurso[0].x} ${yBase} Z`
        : "";

    return {
      yTicks,
      cobradoPts,
      esperadoPts,
      anteriorPts,
      cobradoEnCurso,
      esperadoEnCurso,
      lineaCobrado,
      lineaEsperado,
      lineaAnterior,
      areaCobrado,
      yBase,
      totalCobrado,
      totalEsperado,
      maxValor,
    };
  }, [mesesActual, mesesAnterior, progreso]);

  const tasa =
    chart.totalEsperado > 0
      ? Math.round((chart.totalCobrado / chart.totalEsperado) * 100)
      : 100;

  // Datos del mes para el tooltip / panel detalle.
  const mesParaDetalle =
    hoverMes !== null && modo === "anual" ? hoverMes : mesSeleccionado;
  const datoMes = mesesActual[mesParaDetalle];
  const datoMesAnterior = mesesAnterior[mesParaDetalle];

  // Posición del tooltip dentro del SVG.
  const tooltipPunto =
    hoverMes !== null && chart.cobradoPts[hoverMes]
      ? chart.cobradoPts[hoverMes]
      : null;

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-[2rem] border border-slate-50 shadow-sm px-4 lg:px-5 pt-5 pb-3 h-full flex flex-col min-h-0"
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4 shrink-0">
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Ingresos cobrados vs esperado
          </p>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Cobranza {anio}
          </h2>
          <div
            className="flex flex-wrap items-baseline gap-3 mt-2 relative"
            data-desglose-anchor
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDesgloseAbierto((v) => !v);
              }}
              className="group inline-flex items-baseline gap-1.5 rounded-lg px-1.5 py-0.5 -mx-1.5 hover:bg-indigo-50/70 active:bg-indigo-100/70 transition-colors"
              aria-expanded={desgloseAbierto}
              aria-label="Ver desglose mensual"
              title="Click para ver desglose mensual"
            >
              <span className="text-2xl font-black bg-gradient-to-r from-slate-900 via-indigo-800 to-blue-700 bg-clip-text text-transparent tabular-nums leading-none">
                {fmt(chart.totalCobrado)}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-indigo-700 transition-transform ${desgloseAbierto ? "rotate-180" : ""} group-hover:translate-y-0.5`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <span className="text-[10px] font-bold text-slate-400">
              cobrado en {anio}
            </span>
            <span
              className={`text-[10px] font-black tabular-nums ${
                tasa >= 80
                  ? "text-emerald-600"
                  : tasa >= 50
                    ? "text-amber-600"
                    : "text-red-500"
              }`}
            >
              {tasa}% del esperado
            </span>

            {desgloseAbierto && (
              <DesgloseMensualPopover
                meses={mesesActual}
                anio={anio}
                onCerrar={() => setDesgloseAbierto(false)}
                onClickMes={(idx) => {
                  setMesSeleccionado(idx);
                  setModo("mes");
                  setDesgloseAbierto(false);
                }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Toggle Año / Mes */}
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

          {/* Leyenda */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-[8px] font-black uppercase tracking-widest text-violet-700">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            {anio}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            {anio - 1}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-white text-[8px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-3 h-px bg-slate-400" />
            Esperado
          </span>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {modo === "anual" ? (
        <div className="flex-1 min-h-[260px] lg:min-h-[320px] w-full relative -mx-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Ingresos cobrados versus esperado por mes en ${anio}`}
            onMouseLeave={() => setHoverMes(null)}
          >
            <defs>
              {/* Gradiente VIOLETA vibrante (mismo lenguaje de marca
                  que la web pública). */}
              <linearGradient id={`grad-ing-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                <stop offset="55%" stopColor="#7c3aed" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
              </linearGradient>
              {/* Gradiente de la línea: violet-600 → fuchsia-500. */}
              <linearGradient
                id={`line-ing-${uid}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#c026d3" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {chart.yTicks.map((tick) => (
              <g key={tick.label}>
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

            {/* Año anterior (línea fantasma) */}
            <path
              d={chart.lineaAnterior}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.6}
            />

            {/* Área cobrado actual */}
            {chart.areaCobrado && (
              <path d={chart.areaCobrado} fill={`url(#grad-ing-${uid})`} />
            )}

            {/* Línea ESPERADO: gris uniforme (sólida) */}
            <path
              d={chart.lineaEsperado}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Línea cobrado real con degradado violet→fuchsia. */}
            <path
              d={chart.lineaCobrado}
              fill="none"
              stroke={`url(#line-ing-${uid})`}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter:
                  "drop-shadow(0 2px 6px rgba(139, 92, 246, 0.38))",
              }}
            />

            {/* Etiquetas mes (eje X) */}
            {chart.cobradoPts.map((p, i) => (
              <text
                key={`label-${i}`}
                x={p.x}
                y={H - 12}
                textAnchor="middle"
                className={`text-[9px] font-black uppercase ${
                  mesesActual[i].enCurso
                    ? "fill-slate-500"
                    : "fill-slate-300"
                }`}
              >
                {p.label}
              </text>
            ))}

            {/* PUNTOS PULSANTES ESTILO RADAR sobre la LÍNEA VIOLETA
                (cobrado real). Solo en meses en curso. */}
            {chart.cobradoPts.map((p, i) => {
              const enCurso = mesesActual[i].enCurso;
              if (!enCurso) return null;
              const esActivo = hoverMes === i;
              return (
                <g key={`radar-${i}`}>
                  {/* Anillo exterior pulsante violeta. */}
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
                  {/* Punto central violeta encendido. */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={esActivo ? 5.5 : 4}
                    fill={esActivo ? "#7c3aed" : "#a855f7"}
                    stroke="white"
                    strokeWidth={2}
                    style={{
                      transition: "r 0.18s ease, fill 0.18s ease",
                      filter:
                        "drop-shadow(0 0 6px rgba(168, 85, 247, 0.55))",
                    }}
                  />
                </g>
              );
            })}

            {/* Hit-area transparente por mes para hover */}
            {chart.cobradoPts.map((p, i) => {
              const enCurso = mesesActual[i].enCurso;
              if (!enCurso) return null;
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
                  onClick={() => {
                    setMesSeleccionado(i);
                    setModo("mes");
                  }}
                  style={{ cursor: "pointer" }}
                />
              );
            })}

            {/* Línea vertical guía al hover */}
            {hoverMes !== null && chart.cobradoPts[hoverMes] && (
              <line
                x1={chart.cobradoPts[hoverMes].x}
                y1={PAD.top}
                x2={chart.cobradoPts[hoverMes].x}
                y2={H - PAD.bottom}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.6}
              />
            )}
          </svg>

          {/* TOOLTIP flotante */}
          {tooltipPunto && hoverMes !== null && (
            <TooltipMes
              x={(tooltipPunto.x / W) * 100}
              y={(tooltipPunto.y / H) * 100}
              datoActual={mesesActual[hoverMes]}
              datoAnterior={mesesAnterior[hoverMes]}
              anioActual={anio}
            />
          )}
        </div>
      ) : (
        // MODO MES: detalle visual del mes seleccionado.
        <DetalleMesView
          mesIdx={mesSeleccionado}
          setMesIdx={setMesSeleccionado}
          datoActual={datoMes}
          datoAnterior={datoMesAnterior}
          anioActual={anio}
        />
      )}

      {/* Footer texto */}
      <p className="text-[9px] font-bold text-slate-400 mt-4 text-center shrink-0">
        {modo === "anual"
          ? "Pasa el mouse por los puntos · Click en un mes para ver detalle"
          : "Cambia de mes con las flechas · Vuelve a Año para ver la serie completa"}
      </p>

      {/* Keyframes radar (scoped al document, mínima huella) */}
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

/* -------------------------------------------------------------------------- */
/* TOOLTIP flotante                                                            */
/* -------------------------------------------------------------------------- */

function TooltipMes({
  x,
  y,
  datoActual,
  datoAnterior,
  anioActual,
}: {
  x: number;
  y: number;
  datoActual: MesResumenAnual;
  datoAnterior?: MesResumenAnual;
  anioActual: number;
}) {
  const tasa =
    datoActual.compromiso > 0
      ? Math.round((datoActual.cobrado / datoActual.compromiso) * 100)
      : 100;

  // Decide lado del tooltip para no salirse de la gráfica.
  const lado: "izq" | "der" = x > 70 ? "izq" : "der";
  const style: CSSProperties = {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(${lado === "der" ? "12px" : "calc(-100% - 12px)"}, -50%)`,
  };

  // Texto con leve "halo blanco" para asegurar legibilidad sobre
  // el cristal súper transparente.
  const textoHalo: CSSProperties = {
    textShadow:
      "0 1px 2px rgba(255,255,255,0.85), 0 0 6px rgba(255,255,255,0.55)",
  };

  return (
    <div
      className="pointer-events-none absolute z-10 min-w-[180px] rounded-2xl bg-white/25 backdrop-blur-2xl backdrop-saturate-200 shadow-[0_8px_32px_rgba(15,23,42,0.12)] px-3.5 py-3 ring-1 ring-white/50 border border-white/30"
      style={style}
    >
      <p
        className="text-[9px] font-black text-violet-700 uppercase tracking-widest mb-2"
        style={textoHalo}
      >
        {MESES_NOM[datoActual.mes]} {anioActual}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className="text-[10px] font-bold text-slate-600 uppercase tracking-wider"
            style={textoHalo}
          >
            Cobrado
          </span>
          <span
            className="text-sm font-black text-violet-700 tabular-nums"
            style={textoHalo}
          >
            {fmt(datoActual.cobrado)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span
            className="text-[10px] font-bold text-slate-600 uppercase tracking-wider"
            style={textoHalo}
          >
            Esperado
          </span>
          <span
            className="text-sm font-black text-slate-700 tabular-nums"
            style={textoHalo}
          >
            {fmt(datoActual.compromiso)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-1 mt-1 border-t border-white/40">
          <span
            className="text-[10px] font-bold text-slate-600 uppercase tracking-wider"
            style={textoHalo}
          >
            Tasa
          </span>
          <span
            className={`text-sm font-black tabular-nums ${
              tasa >= 80
                ? "text-emerald-700"
                : tasa >= 50
                  ? "text-amber-700"
                  : "text-red-600"
            }`}
            style={textoHalo}
          >
            {tasa}%
          </span>
        </div>
        {datoAnterior && datoAnterior.cobrado > 0 && (
          <div className="flex items-baseline justify-between gap-3">
            <span
              className="text-[10px] font-bold text-slate-600 uppercase tracking-wider"
              style={textoHalo}
            >
              {MESES_NOM[datoActual.mes].substring(0, 3)} {anioActual - 1}
            </span>
            <span
              className="text-xs font-bold text-slate-700 tabular-nums"
              style={textoHalo}
            >
              {fmt(datoAnterior.cobrado)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* POPOVER de desglose mensual (al click en el total)                          */
/* -------------------------------------------------------------------------- */

function DesgloseMensualPopover({
  meses,
  anio,
  onCerrar,
  onClickMes,
}: {
  meses: MesResumenAnual[];
  anio: number;
  onCerrar: () => void;
  onClickMes: (idx: number) => void;
}) {
  const enCurso = meses.filter((m) => m.enCurso);
  const totalCobrado = enCurso.reduce((a, m) => a + m.cobrado, 0);
  const totalEsperado = enCurso.reduce((a, m) => a + m.compromiso, 0);
  const maxCobrado = Math.max(...enCurso.map((m) => m.cobrado), 1);

  return (
    <div
      className="absolute top-full left-0 mt-3 z-30 w-[320px] max-w-[calc(100vw-3rem)] rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 bg-gradient-to-br from-indigo-50 to-blue-50/60 border-b border-indigo-100 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-800">
            Desglose mensual {anio}
          </p>
          <p className="text-sm font-black text-slate-800 tabular-nums mt-0.5">
            {fmt(totalCobrado)}{" "}
            <span className="text-[10px] font-bold text-slate-400">
              · {fmt(totalEsperado)} esperado
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <ul className="max-h-[360px] overflow-y-auto py-1">
        {enCurso.map((m) => {
          const tasa =
            m.compromiso > 0
              ? Math.round((m.cobrado / m.compromiso) * 100)
              : 100;
          const pctBarra = (m.cobrado / maxCobrado) * 100;
          return (
            <li key={m.mes}>
              <button
                type="button"
                onClick={() => onClickMes(m.mes)}
                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50/60 transition-colors group"
              >
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-indigo-800 transition-colors">
                    {MESES_NOM[m.mes]}
                  </span>
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-sm font-black text-indigo-800 tabular-nums">
                      {fmt(m.cobrado)}
                    </span>
                    <span
                      className={`text-[9px] font-black tabular-nums ${
                        tasa >= 80
                          ? "text-emerald-600"
                          : tasa >= 50
                            ? "text-amber-600"
                            : "text-red-500"
                      }`}
                    >
                      {tasa}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-slate-900 via-indigo-800 to-blue-600 transition-all duration-300"
                    style={{ width: `${pctBarra}%` }}
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-1">
                  Esperado {fmt(m.compromiso)}
                  {m.pendiente > 0 && (
                    <>
                      {" · "}
                      <span className="text-amber-600">
                        Pendiente {fmt(m.pendiente)}
                      </span>
                    </>
                  )}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 text-center">
        <p className="text-[9px] font-bold text-slate-400">
          Click en un mes para abrir su detalle
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DETALLE MES                                                                 */
/* -------------------------------------------------------------------------- */

function DetalleMesView({
  mesIdx,
  setMesIdx,
  datoActual,
  datoAnterior,
  anioActual,
}: {
  mesIdx: number;
  setMesIdx: (v: number) => void;
  datoActual?: MesResumenAnual;
  datoAnterior?: MesResumenAnual;
  anioActual: number;
}) {
  if (!datoActual) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-bold">
        Sin datos para este mes.
      </div>
    );
  }

  const tasa =
    datoActual.compromiso > 0
      ? Math.round((datoActual.cobrado / datoActual.compromiso) * 100)
      : 100;
  const diferencia = datoActual.cobrado - datoActual.compromiso;
  const variacionVsAnterior =
    datoAnterior && datoAnterior.cobrado > 0
      ? Math.round(
          ((datoActual.cobrado - datoAnterior.cobrado) / datoAnterior.cobrado) *
            100
        )
      : null;

  const irAtras = () => setMesIdx(Math.max(0, mesIdx - 1));
  const irAdelante = () => setMesIdx(Math.min(11, mesIdx + 1));

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      {/* Selector de mes con flechas */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={irAtras}
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
            {MESES_NOM[datoActual.mes]} {anioActual}
          </p>
        </div>
        <button
          type="button"
          onClick={irAdelante}
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

      {/* Barra grande cobrado vs esperado */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-800">
            Cobrado
          </span>
          <span className="text-2xl font-black text-indigo-800 tabular-nums">
            {fmt(datoActual.cobrado)}
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/60 overflow-hidden shadow-inner ring-1 ring-indigo-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-slate-900 via-indigo-800 to-blue-600 transition-all duration-700"
            style={{ width: `${Math.min(100, tasa)}%` }}
          />
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Esperado · {fmt(datoActual.compromiso)}
          </span>
          <span
            className={`text-[10px] font-black tabular-nums ${
              tasa >= 80
                ? "text-emerald-600"
                : tasa >= 50
                  ? "text-amber-600"
                  : "text-red-500"
            }`}
          >
            {tasa}% cumplido
          </span>
        </div>
      </div>

      {/* Grid de stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Diferencia
          </p>
          <p
            className={`text-lg font-black tabular-nums ${
              diferencia >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {diferencia >= 0 ? "+" : ""}
            {fmt(diferencia)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Pendiente
          </p>
          <p className="text-lg font-black tabular-nums text-amber-600">
            {fmt(datoActual.pendiente)}
          </p>
        </div>
        {variacionVsAnterior !== null && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
              vs {anioActual - 1}
            </p>
            <p
              className={`text-lg font-black tabular-nums ${
                variacionVsAnterior >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {variacionVsAnterior >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(variacionVsAnterior)}%
            </p>
          </div>
        )}
      </div>

      {/* Comparativa visual año anterior */}
      {datoAnterior && (
        <div className="rounded-xl bg-white border border-slate-100 p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Mismo mes año anterior
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Cobrado {anioActual - 1}
              </p>
              <p className="text-base font-black text-slate-600 tabular-nums">
                {fmt(datoAnterior.cobrado)}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Esperado {anioActual - 1}
              </p>
              <p className="text-base font-black text-slate-600 tabular-nums">
                {fmt(datoAnterior.compromiso)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
