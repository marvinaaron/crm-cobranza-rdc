"use client";

/**
 * Mapa de presencia nacional con paths reales (@svg-maps/mexico).
 * Estados activos usan gradiente de marca; pins con triple latido;
 * panel lateral con glass cards, regiones e íconos por giro.
 */

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import mexicoMap from "@svg-maps/mexico";

type MapLocation = { id: string; name: string; path: string };
type SvgMap = { viewBox: string; locations: MapLocation[] };
const mapa = mexicoMap as unknown as SvgMap;

type IconoGiro =
  | "comercio"
  | "profesion"
  | "industria"
  | "nomina"
  | "honorarios"
  | "servicios";

const ESTADOS_CON_CLIENTES = new Set([
  "chh",
  "jal",
  "col",
  "que",
  "mex",
  "cmx",
  "pue",
]);

const INFO_ESTADOS: Record<
  string,
  {
    ciudad: string;
    perfilCliente: string;
    sigla: string;
    icono: IconoGiro;
  }
> = {
  chh: {
    ciudad: "Chihuahua",
    perfilCliente: "Comercio y servicios",
    sigla: "CHIH",
    icono: "comercio",
  },
  jal: {
    ciudad: "Guadalajara, Jal.",
    perfilCliente: "Profesionistas y PM",
    sigla: "JAL",
    icono: "profesion",
  },
  col: {
    ciudad: "Colima",
    perfilCliente: "Comercio",
    sigla: "COL",
    icono: "comercio",
  },
  que: {
    ciudad: "Querétaro",
    perfilCliente: "Industria y PM",
    sigla: "QRO",
    icono: "industria",
  },
  mex: {
    ciudad: "Edo. de México",
    perfilCliente: "PM con nómina",
    sigla: "MEX",
    icono: "nomina",
  },
  cmx: {
    ciudad: "Ciudad de México",
    perfilCliente: "Honorarios y PM",
    sigla: "CDMX",
    icono: "honorarios",
  },
  pue: {
    ciudad: "Puebla",
    perfilCliente: "Servicios y comercio",
    sigla: "PUE",
    icono: "servicios",
  },
};

const REGIONES: { label: string; ids: string[] }[] = [
  { label: "Norte", ids: ["chh"] },
  { label: "Occidente", ids: ["jal", "col"] },
  { label: "Bajío", ids: ["que"] },
  { label: "Centro", ids: ["mex", "cmx"] },
  { label: "Sur", ids: ["pue"] },
];

const ORDEN_LISTA = ["chh", "jal", "col", "que", "mex", "cmx", "pue"];

const PIN_OFFSETS: Record<string, { dx: number; dy: number }> = {
  cmx: { dx: 4, dy: 2 },
  mex: { dx: -8, dy: -4 },
};

const COLOR_NEUTRAL = "fill-slate-200 hover:fill-slate-300";

type PinPos = { x: number; y: number };

function IconoGiro({ tipo }: { tipo: IconoGiro }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (tipo) {
    case "comercio":
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "profesion":
      return (
        <svg {...props}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
        </svg>
      );
    case "industria":
      return (
        <svg {...props}>
          <path d="M2 20h20" />
          <path d="M5 20V10l4-3v13" />
          <path d="M13 20V6l6-4v18" />
        </svg>
      );
    case "nomina":
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "honorarios":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "servicios":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
  }
}

function PinLatido({
  x,
  y,
  idx,
  seleccionado,
}: {
  x: number;
  y: number;
  idx: number;
  seleccionado: boolean;
}) {
  const base = idx * 0.35;
  const rCentro = seleccionado ? 3.2 : 2.4;

  return (
    <g className="pointer-events-none" filter="url(#pinGlow)">
      {[0, 0.45, 0.9].map((delay, ring) => (
        <circle
          key={ring}
          cx={x}
          cy={y}
          r="4"
          fill="none"
          stroke="rgb(192 132 252)"
          strokeWidth="1.2"
        >
          <animate
            attributeName="r"
            values="3;11;3"
            dur="2.2s"
            repeatCount="indefinite"
            begin={`${base + delay}s`}
          />
          <animate
            attributeName="opacity"
            values="0.55;0;0.55"
            dur="2.2s"
            repeatCount="indefinite"
            begin={`${base + delay}s`}
          />
        </circle>
      ))}
      <circle cx={x} cy={y} r={rCentro + 2} fill="rgb(139 92 246 / 0.25)">
        <animate
          attributeName="r"
          values={`${rCentro + 1.5};${rCentro + 3.5};${rCentro + 1.5}`}
          dur="1.4s"
          repeatCount="indefinite"
          begin={`${base}s`}
        />
        <animate
          attributeName="opacity"
          values="0.5;0.15;0.5"
          dur="1.4s"
          repeatCount="indefinite"
          begin={`${base}s`}
        />
      </circle>
      <circle
        cx={x}
        cy={y}
        r={rCentro + 1}
        fill="white"
        stroke="rgb(124 58 237)"
        strokeWidth="1.2"
      />
      <circle cx={x} cy={y} r={rCentro * 0.45} fill="rgb(124 58 237)">
        <animate
          attributeName="r"
          values={`${rCentro * 0.4};${rCentro * 0.55};${rCentro * 0.4}`}
          dur="1.4s"
          repeatCount="indefinite"
          begin={`${base}s`}
        />
      </circle>
    </g>
  );
}

export default function MapaPresencia() {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [pinPos, setPinPos] = useState<Record<string, PinPos>>({});
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});

  function recomputePins() {
    const positions: Record<string, PinPos> = {};
    for (const id of ORDEN_LISTA) {
      const el = pathRefs.current[id];
      if (!el) continue;
      const box = el.getBBox();
      const offset = PIN_OFFSETS[id] ?? { dx: 0, dy: 0 };
      positions[id] = {
        x: box.x + box.width / 2 + offset.dx,
        y: box.y + box.height / 2 + offset.dy,
      };
    }
    setPinPos(positions);
  }

  useLayoutEffect(() => {
    recomputePins();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", recomputePins);
    return () => window.removeEventListener("resize", recomputePins);
  }, []);

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-white via-violet-50/30 to-white overflow-hidden">
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-violet-200/50 rounded-full blur-3xl -z-0 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl -z-0 pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-violet-600">
            Presencia nacional
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Atendemos clientes en{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              7 estados de México
            </span>
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Trabajamos 100% digital — desde Chihuahua hasta Puebla. La materia
            fiscal es la misma en todo el país, así que la distancia nunca es
            problema.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Mapa */}
          <div className="lg:col-span-3 flex">
            <div className="relative flex-1 bg-white rounded-3xl ring-1 ring-violet-100 shadow-xl shadow-violet-100/50 p-4 sm:p-6">
              <svg
                viewBox={mapa.viewBox}
                className="w-full h-auto"
                role="img"
                aria-label="Mapa de México con los estados donde RDC Contadores tiene clientes"
              >
                <defs>
                  <linearGradient
                    id="brandGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient
                    id="brandGradientActive"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#4338ca" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                  <filter
                    id="mapShadow"
                    x="-5%"
                    y="-5%"
                    width="110%"
                    height="110%"
                  >
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.15" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g filter="url(#mapShadow)">
                  {mapa.locations.map((loc) => {
                    const activo = ESTADOS_CON_CLIENTES.has(loc.id);
                    const sel = seleccion === loc.id;
                    return (
                      <path
                        key={loc.id}
                        ref={(el) => {
                          pathRefs.current[loc.id] = el;
                        }}
                        d={loc.path}
                        fill={
                          activo
                            ? sel
                              ? "url(#brandGradientActive)"
                              : "url(#brandGradient)"
                            : undefined
                        }
                        className={`${
                          activo ? "" : COLOR_NEUTRAL
                        } stroke-white transition-all duration-200 ${
                          activo ? "cursor-pointer" : ""
                        }`}
                        strokeWidth="0.6"
                        style={{
                          filter: sel
                            ? "drop-shadow(0 3px 10px rgba(124,58,237,0.5))"
                            : activo
                              ? "drop-shadow(0 1px 4px rgba(79,70,229,0.25))"
                              : undefined,
                        }}
                        onMouseEnter={() =>
                          activo ? setSeleccion(loc.id) : undefined
                        }
                        onMouseLeave={() =>
                          activo ? setSeleccion(null) : undefined
                        }
                        onClick={() =>
                          activo ? setSeleccion(loc.id) : undefined
                        }
                      >
                        <title>{loc.name}</title>
                      </path>
                    );
                  })}

                  {ORDEN_LISTA.map((id, idx) => {
                    const pos = pinPos[id];
                    if (!pos) return null;
                    return (
                      <PinLatido
                        key={`pin-${id}`}
                        x={pos.x}
                        y={pos.y}
                        idx={idx}
                        seleccionado={seleccion === id}
                      />
                    );
                  })}
                </g>
              </svg>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-gradient-to-br from-indigo-600 to-violet-600" />
                  <span className="text-slate-700">Con clientes activos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-slate-200" />
                  <span className="text-slate-500">
                    Disponible — atendemos en todo México
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-2 flex">
            <div className="relative flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 text-white shadow-2xl shadow-violet-900/30 ring-1 ring-white/10">
              <div
                className="absolute -top-16 -right-16 w-56 h-56 bg-violet-500/25 rounded-full blur-3xl pointer-events-none"
                aria-hidden
              />
              <div
                className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"
                aria-hidden
              />

              <div className="relative p-6 sm:p-7 flex flex-col h-full">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-300">
                  Estados activos
                </p>

                {/* Hero stat */}
                <div className="mt-4 flex items-end gap-3 flex-wrap">
                  <div>
                    <p className="text-4xl sm:text-5xl font-black tabular-nums leading-none bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
                      7
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300 mt-0.5">
                      estados
                    </p>
                  </div>
                  <span className="text-2xl text-violet-400/60 font-light pb-1">
                    ·
                  </span>
                  <div>
                    <p className="text-4xl sm:text-5xl font-black tabular-nums leading-none bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
                      +20
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300 mt-0.5">
                      clientes
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-violet-100/80">
                  Donde llevamos contabilidad hoy
                </p>

                <div className="mt-5 flex-1 space-y-4 overflow-y-auto max-h-[420px] lg:max-h-none pr-0.5">
                  {REGIONES.map((region) => (
                    <div key={region.label}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-violet-400/90 mb-2 pl-1">
                        {region.label}
                      </p>
                      <ul className="space-y-2">
                        {region.ids.map((id) => {
                          const info = INFO_ESTADOS[id];
                          if (!info) return null;
                          const sel = seleccion === id;
                          return (
                            <li
                              key={id}
                              onMouseEnter={() => setSeleccion(id)}
                              onMouseLeave={() => setSeleccion(null)}
                              className={`group flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm transition-all duration-200 cursor-default border-l-4 ${
                                sel
                                  ? "bg-white/15 ring-1 ring-violet-300/50 border-violet-400 scale-[1.02] shadow-lg shadow-violet-900/30"
                                  : "bg-white/5 hover:bg-white/10 ring-1 ring-white/10 border-transparent hover:border-violet-500/40"
                              }`}
                            >
                              <span
                                className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[9px] font-black tracking-tight ${
                                  sel
                                    ? "bg-violet-500 text-white"
                                    : "bg-violet-600/40 text-violet-100 ring-1 ring-violet-400/30"
                                }`}
                              >
                                {info.sigla}
                              </span>
                              <span
                                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                  sel
                                    ? "bg-white/20 text-white"
                                    : "bg-white/5 text-violet-200"
                                }`}
                              >
                                <IconoGiro tipo={info.icono} />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black truncate">
                                  {info.ciudad}
                                </p>
                                <p className="text-[11px] text-violet-200/70 truncate">
                                  {info.perfilCliente}
                                </p>
                              </div>
                              {sel && (
                                <span className="shrink-0 w-2 h-2 rounded-full bg-violet-300 animate-pulse" />
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                  <p className="text-xs text-violet-100/70 leading-relaxed">
                    ¿Tu estado no aparece? También trabajamos contigo — la
                    operación es 100% digital.
                  </p>
                  <Link
                    href="/contacto"
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:from-violet-400 hover:to-indigo-400 transition-all shadow-lg shadow-violet-900/40"
                  >
                    Solicita una cotización donde estés
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
