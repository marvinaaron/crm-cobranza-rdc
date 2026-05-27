"use client";

/**
 * Mapa de presencia nacional.
 *
 * Renderiza un SVG real de los 32 estados de México usando los paths del
 * dataset `@svg-maps/mexico` (mismos polígonos que Wikipedia, viewBox 793x498)
 * y resalta los estados donde el despacho tiene clientes activos.
 *
 * Los pins pulsantes se posicionan dinámicamente sobre el centroide de cada
 * estado destacado usando `getBBox()` después del montaje, así que no hay que
 * pre-calcular coordenadas: si más adelante se agrega/quita un estado a
 * ESTADOS_CON_CLIENTES, el pin se reubica solo.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import mexicoMap from "@svg-maps/mexico";

/** Tipo local para evitar depender de `svg-maps__common`. */
type MapLocation = { id: string; name: string; path: string };
type SvgMap = { viewBox: string; locations: MapLocation[] };
const mapa = mexicoMap as unknown as SvgMap;

/**
 * IDs del dataset @svg-maps/mexico:
 *   chh = Chihuahua, jal = Jalisco, col = Colima, que = Querétaro,
 *   mex = Estado de México, cmx = Ciudad de México, pue = Puebla.
 */
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
  { ciudad: string; perfilCliente: string }
> = {
  chh: { ciudad: "Chihuahua", perfilCliente: "Comercio y servicios" },
  jal: { ciudad: "Guadalajara, Jal.", perfilCliente: "Profesionistas y PM" },
  col: { ciudad: "Colima", perfilCliente: "Comercio" },
  que: { ciudad: "Querétaro", perfilCliente: "Industria y PM" },
  mex: { ciudad: "Edo. de México", perfilCliente: "PM con nómina" },
  cmx: { ciudad: "Ciudad de México", perfilCliente: "Honorarios y PM" },
  pue: { ciudad: "Puebla", perfilCliente: "Servicios y comercio" },
};

/** Orden de aparición en la lista lateral (de norte a sur / occidente a oriente). */
const ORDEN_LISTA = ["chh", "jal", "col", "que", "mex", "cmx", "pue"];

/**
 * Pequeños offsets manuales para evitar que dos pins se traslapen
 * (CDMX y Edo. Méx. comparten centroide).
 */
const PIN_OFFSETS: Record<string, { dx: number; dy: number }> = {
  cmx: { dx: 4, dy: 2 },
  mex: { dx: -8, dy: -4 },
};

const COLOR_DESTACADO = "fill-indigo-500 hover:fill-indigo-600";
const COLOR_DESTACADO_ACTIVO = "fill-indigo-600";
const COLOR_NEUTRAL = "fill-slate-200 hover:fill-slate-300";

type PinPos = { x: number; y: number };

export default function MapaPresencia() {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [pinPos, setPinPos] = useState<Record<string, PinPos>>({});
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});

  // Calcula el centroide (centro del bounding box) de cada estado destacado
  // una vez que los paths están en el DOM.
  useLayoutEffect(() => {
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
  }, []);

  // Recalcula al redimensionar (por si el navegador re-layoutea).
  useEffect(() => {
    function recompute() {
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
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-100/40 rounded-full blur-3xl -z-0 pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Mapa SVG */}
          <div className="lg:col-span-3">
            <div className="relative bg-white rounded-3xl ring-1 ring-slate-200 shadow-xl p-4 sm:p-6">
              <svg
                viewBox={mapa.viewBox}
                className="w-full h-auto"
                role="img"
                aria-label="Mapa de México con los estados donde RDC Contadores tiene clientes"
              >
                {/* Sombra suave debajo del mapa */}
                <defs>
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
                        className={`${
                          activo
                            ? sel
                              ? COLOR_DESTACADO_ACTIVO
                              : COLOR_DESTACADO
                            : COLOR_NEUTRAL
                        } stroke-white transition-colors ${
                          activo ? "cursor-pointer" : ""
                        }`}
                        strokeWidth="0.6"
                        style={{
                          filter: sel
                            ? "drop-shadow(0 2px 6px rgba(79,70,229,0.45))"
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

                  {/* Pins pulsantes */}
                  {ORDEN_LISTA.map((id, idx) => {
                    const pos = pinPos[id];
                    if (!pos) return null;
                    const sel = seleccion === id;
                    return (
                      <g
                        key={`pin-${id}`}
                        className="pointer-events-none"
                        opacity={1}
                      >
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="5"
                          fill="rgb(99 102 241 / 0.35)"
                        >
                          <animate
                            attributeName="r"
                            values="3;8;3"
                            dur="2.5s"
                            repeatCount="indefinite"
                            begin={`${idx * 0.3}s`}
                          />
                          <animate
                            attributeName="opacity"
                            values="0.7;0;0.7"
                            dur="2.5s"
                            repeatCount="indefinite"
                            begin={`${idx * 0.3}s`}
                          />
                        </circle>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={sel ? 3.4 : 2.6}
                          fill="white"
                          stroke="rgb(79 70 229)"
                          strokeWidth="1.1"
                          style={{ transition: "r 0.15s ease" }}
                        />
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="1"
                          fill="rgb(79 70 229)"
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Leyenda */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-indigo-500" />
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

          {/* Lista de estados */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-300">
                Estados activos
              </p>
              <h3 className="mt-2 text-xl font-black">
                Donde llevamos contabilidad hoy
              </h3>

              <ul className="mt-5 space-y-2.5">
                {ORDEN_LISTA.map((id) => {
                  const info = INFO_ESTADOS[id];
                  if (!info) return null;
                  const sel = seleccion === id;
                  return (
                    <li
                      key={id}
                      onMouseEnter={() => setSeleccion(id)}
                      onMouseLeave={() => setSeleccion(null)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-default ${
                        sel
                          ? "bg-indigo-600/30 ring-1 ring-indigo-400/50"
                          : "bg-white/5 hover:bg-white/10 ring-1 ring-white/10"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0 animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">
                          {info.ciudad}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {info.perfilCliente}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-xs text-slate-300 leading-relaxed">
                  ¿Tu estado no aparece? También trabajamos contigo. Toda la
                  operación es digital y la materia fiscal es federal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
