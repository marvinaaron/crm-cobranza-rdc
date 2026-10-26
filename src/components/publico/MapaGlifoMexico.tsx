"use client";

import { useLayoutEffect, useRef, useState } from "react";
import mexicoMap from "@svg-maps/mexico";

type MapLocation = { id: string; name: string; path: string };
type SvgMap = { viewBox: string; locations: MapLocation[] };
const mapa = mexicoMap as unknown as SvgMap;

export const ESTADOS_ACTIVOS = ["jal", "chh", "col", "que", "mex", "cmx", "pue"] as const;

export const INFO_ESTADOS: Record<
  string,
  { ciudad: string; perfil: string; sigla: string; nombre: string }
> = {
  jal: {
    ciudad: "Guadalajara, Jal.",
    perfil: "Profesionistas y PM",
    sigla: "JAL",
    nombre: "Jalisco",
  },
  chh: {
    ciudad: "Chihuahua",
    perfil: "Comercio y servicios",
    sigla: "CHIH",
    nombre: "Chihuahua",
  },
  col: {
    ciudad: "Colima",
    perfil: "Comercio",
    sigla: "COL",
    nombre: "Colima",
  },
  que: {
    ciudad: "Querétaro",
    perfil: "Industria y PM",
    sigla: "QRO",
    nombre: "Querétaro",
  },
  mex: {
    ciudad: "Edo. de México",
    perfil: "PM con nómina",
    sigla: "MEX",
    nombre: "Edo. Méx.",
  },
  cmx: {
    ciudad: "Ciudad de México",
    perfil: "Honorarios y PM",
    sigla: "CDMX",
    nombre: "CDMX",
  },
  pue: {
    ciudad: "Puebla",
    perfil: "Servicios y comercio",
    sigla: "PUE",
    nombre: "Puebla",
  },
};

const ETIQUETA: Record<
  string,
  { dx?: number; dy?: number; x?: number; y?: number; anchor: "start" | "end" }
> = {
  chh: { dx: 78, dy: -42, anchor: "start" },
  jal: { dx: -86, dy: 4, anchor: "end" },
  col: { dx: -86, dy: 22, anchor: "end" },
  que: { x: 628, y: 308, anchor: "start" },
  mex: { x: 628, y: 344, anchor: "start" },
  cmx: { x: 628, y: 378, anchor: "start" },
  pue: { x: 628, y: 412, anchor: "start" },
};

const ACTIVOS = new Set<string>(ESTADOS_ACTIVOS);

const PIN_OFFSETS: Record<string, { dx: number; dy: number }> = {
  cmx: { dx: 4, dy: 2 },
  mex: { dx: -8, dy: -4 },
};

export default function MapaGlifoMexico({
  seleccion,
  onSelect,
}: {
  seleccion: string;
  onSelect: (id: string) => void;
}) {
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const [pins, setPins] = useState<Record<string, { x: number; y: number }>>({});

  useLayoutEffect(() => {
    const next: Record<string, { x: number; y: number }> = {};
    for (const id of ESTADOS_ACTIVOS) {
      const el = pathRefs.current[id];
      if (!el) continue;
      const box = el.getBBox();
      const offset = PIN_OFFSETS[id] ?? { dx: 0, dy: 0 };
      next[id] = {
        x: box.x + box.width / 2 + offset.dx,
        y: box.y + box.height / 2 + offset.dy,
      };
    }
    setPins(next);
  }, []);

  return (
    <svg
      viewBox="-90 -48 973 586"
      className="ns-map"
      role="img"
      aria-label="Mapa de México. Los siete estados con clientes se pueden elegir."
    >
      {mapa.locations.map((loc) => {
        const activo = ACTIVOS.has(loc.id);
        const sel = seleccion === loc.id;
        return (
          <path
            key={loc.id}
            ref={(el) => {
              pathRefs.current[loc.id] = el;
            }}
            d={loc.path}
            data-on={activo ? (sel ? "sel" : "idle") : undefined}
            tabIndex={-1}
            onClick={() => {
              if (activo) onSelect(loc.id);
            }}
          >
            <title>{loc.name}</title>
          </path>
        );
      })}
      {ESTADOS_ACTIVOS.map((id) => {
        const pos = pins[id];
        const item = INFO_ESTADOS[id];
        const etiqueta = ETIQUETA[id];
        if (!pos || !item || !etiqueta) return null;
        const sel = seleccion === id;
        const tx = etiqueta.x ?? pos.x + (etiqueta.dx ?? 0);
        const ty = etiqueta.y ?? pos.y + (etiqueta.dy ?? 0);
        return (
          <g
            key={`pin-${id}`}
            className="ns-pin"
            data-on={sel ? "true" : undefined}
            onClick={() => onSelect(id)}
          >
            <line
              className="ns-pin-line"
              x1={pos.x}
              y1={pos.y}
              x2={tx}
              y2={ty}
            />
            <circle className="ns-pin-ring" cx={pos.x} cy={pos.y} r="11" />
            <circle className="ns-pin-dot" cx={pos.x} cy={pos.y} r={sel ? 4 : 3.2} />
            <text
              className="ns-pin-name"
              x={tx}
              y={ty}
              textAnchor={etiqueta.anchor}
              dy="0.35em"
            >
              {item.nombre}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
