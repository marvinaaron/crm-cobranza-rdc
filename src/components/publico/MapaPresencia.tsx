"use client";

/**
 * Mapa de presencia nacional: SVG estilizado de México que destaca los
 * estados donde el despacho tiene clientes activos.
 *
 * Los paths son simplificados (no son polígonos catastrales reales) pero
 * conservan la forma general de cada estado y su posición relativa en el
 * país. Esto mantiene el componente liviano (sin dependencias de mapas
 * externos) y suficientemente reconocible para el visitante.
 *
 * Si quieres agregar/quitar estados con clientes, edita ESTADOS_CON_CLIENTES
 * — el resto se mantiene automáticamente.
 */

import { useState } from "react";

type Estado = {
  id: string;
  nombre: string;
  /** Path SVG simplificado del estado (viewBox 1000x720). */
  path: string;
  /** Posición aproximada para colocar el pin animado (cx, cy). */
  pin?: { x: number; y: number };
};

/** Estados destacados: el despacho tiene clientes activos en estos giros. */
const ESTADOS_CON_CLIENTES = new Set([
  "chih",
  "jal",
  "col",
  "qro",
  "mex",
  "cdmx",
  "pue",
]);

/** Información extra que se muestra al hover sobre un estado destacado. */
const INFO_ESTADOS: Record<
  string,
  { ciudad: string; perfilCliente: string }
> = {
  chih: { ciudad: "Chihuahua", perfilCliente: "Comercio y servicios" },
  jal: { ciudad: "Guadalajara", perfilCliente: "Profesionistas y PM" },
  col: { ciudad: "Colima", perfilCliente: "Comercio" },
  qro: { ciudad: "Querétaro", perfilCliente: "Industria y PM" },
  mex: { ciudad: "Edo. de México", perfilCliente: "PM con nómina" },
  cdmx: { ciudad: "Ciudad de México", perfilCliente: "Honorarios y PM" },
  pue: { ciudad: "Puebla", perfilCliente: "Servicios y comercio" },
};

/**
 * Paths simplificados de los 32 estados de México.
 * viewBox: 1000 x 720
 */
const ESTADOS: Estado[] = [
  { id: "bcn", nombre: "Baja California", path: "M 60 100 L 130 95 L 145 145 L 155 200 L 170 250 L 180 305 L 155 320 L 130 295 L 110 240 L 90 200 L 75 150 Z" },
  { id: "bcs", nombre: "Baja California Sur", path: "M 180 305 L 220 320 L 240 365 L 250 420 L 245 470 L 260 510 L 245 540 L 215 535 L 195 495 L 200 450 L 195 405 L 185 355 Z" },
  { id: "son", nombre: "Sonora", path: "M 200 110 L 295 105 L 360 130 L 380 195 L 365 245 L 320 270 L 280 270 L 240 250 L 220 220 L 210 175 Z", pin: { x: 280, y: 195 } },
  { id: "chih", nombre: "Chihuahua", path: "M 295 105 L 470 100 L 495 195 L 480 265 L 410 285 L 365 245 L 380 195 L 360 130 Z", pin: { x: 405, y: 195 } },
  { id: "coa", nombre: "Coahuila", path: "M 470 100 L 600 120 L 650 200 L 625 280 L 540 295 L 495 235 L 480 155 Z", pin: { x: 545, y: 200 } },
  { id: "nl", nombre: "Nuevo León", path: "M 600 120 L 700 155 L 705 235 L 640 255 L 600 215 L 595 165 Z", pin: { x: 645, y: 195 } },
  { id: "tam", nombre: "Tamaulipas", path: "M 700 155 L 770 195 L 790 290 L 760 360 L 720 365 L 700 295 L 690 235 Z", pin: { x: 735, y: 280 } },
  { id: "sin", nombre: "Sinaloa", path: "M 280 270 L 360 285 L 400 360 L 395 410 L 360 430 L 320 405 L 300 350 Z", pin: { x: 340, y: 350 } },
  { id: "dur", nombre: "Durango", path: "M 380 265 L 480 275 L 505 360 L 470 405 L 410 410 L 400 360 L 370 325 Z", pin: { x: 440, y: 340 } },
  { id: "zac", nombre: "Zacatecas", path: "M 480 275 L 575 305 L 590 395 L 525 415 L 505 360 Z", pin: { x: 540, y: 355 } },
  { id: "slp", nombre: "San Luis Potosí", path: "M 575 305 L 690 320 L 720 400 L 650 425 L 590 415 L 580 365 Z", pin: { x: 640, y: 370 } },
  { id: "nay", nombre: "Nayarit", path: "M 360 430 L 405 420 L 415 460 L 400 480 L 370 470 Z", pin: { x: 390, y: 455 } },
  { id: "ags", nombre: "Aguascalientes", path: "M 485 410 L 510 410 L 515 435 L 485 435 Z" },
  { id: "jal", nombre: "Jalisco", path: "M 405 420 L 510 410 L 530 460 L 515 505 L 460 520 L 415 490 L 410 460 Z", pin: { x: 470, y: 470 } },
  { id: "gto", nombre: "Guanajuato", path: "M 515 410 L 585 410 L 590 450 L 555 475 L 525 460 L 515 435 Z", pin: { x: 555, y: 440 } },
  { id: "qro", nombre: "Querétaro", path: "M 590 425 L 625 430 L 630 470 L 595 475 Z", pin: { x: 610, y: 450 } },
  { id: "hgo", nombre: "Hidalgo", path: "M 625 430 L 690 425 L 705 470 L 660 490 L 630 470 Z", pin: { x: 660, y: 460 } },
  { id: "mex", nombre: "Edo. de México", path: "M 555 475 L 595 475 L 630 480 L 625 520 L 580 535 L 545 510 Z", pin: { x: 580, y: 510 } },
  { id: "cdmx", nombre: "Ciudad de México", path: "M 580 510 L 605 510 L 608 528 L 588 538 L 575 528 Z", pin: { x: 590, y: 525 } },
  { id: "tlx", nombre: "Tlaxcala", path: "M 625 482 L 655 482 L 657 503 L 625 503 Z" },
  { id: "pue", nombre: "Puebla", path: "M 605 510 L 685 505 L 705 575 L 645 585 L 610 555 Z", pin: { x: 655, y: 545 } },
  { id: "ver", nombre: "Veracruz", path: "M 705 355 L 745 380 L 770 440 L 780 500 L 775 555 L 745 590 L 720 580 L 705 535 L 695 470 L 690 415 L 695 380 Z", pin: { x: 740, y: 470 } },
  { id: "mich", nombre: "Michoacán", path: "M 515 460 L 595 470 L 605 530 L 555 555 L 490 535 L 480 495 Z", pin: { x: 545, y: 510 } },
  { id: "col", nombre: "Colima", path: "M 460 505 L 495 505 L 498 528 L 465 528 Z", pin: { x: 478, y: 517 } },
  { id: "gro", nombre: "Guerrero", path: "M 545 540 L 645 545 L 670 605 L 595 625 L 545 595 Z", pin: { x: 600, y: 580 } },
  { id: "mor", nombre: "Morelos", path: "M 590 528 L 625 535 L 625 555 L 595 558 Z" },
  { id: "oax", nombre: "Oaxaca", path: "M 645 595 L 760 590 L 780 660 L 705 685 L 660 665 Z", pin: { x: 705, y: 635 } },
  { id: "chs", nombre: "Chiapas", path: "M 770 590 L 840 605 L 860 690 L 770 705 L 740 660 L 760 615 Z", pin: { x: 800, y: 655 } },
  { id: "tab", nombre: "Tabasco", path: "M 760 545 L 815 540 L 835 590 L 775 600 L 750 580 Z", pin: { x: 790, y: 575 } },
  { id: "cam", nombre: "Campeche", path: "M 835 535 L 880 490 L 905 555 L 895 615 L 870 625 L 840 595 Z", pin: { x: 870, y: 560 } },
  { id: "yuc", nombre: "Yucatán", path: "M 870 475 L 950 465 L 970 510 L 945 545 L 905 540 L 880 515 Z", pin: { x: 920, y: 510 } },
  { id: "qroo", nombre: "Quintana Roo", path: "M 950 475 L 985 490 L 995 580 L 980 635 L 950 645 L 925 605 L 940 555 L 970 525 Z", pin: { x: 960, y: 560 } },
];

const COLORES_DESTACADO = "fill-indigo-500 hover:fill-indigo-600";
const COLOR_NEUTRAL = "fill-slate-200 hover:fill-slate-300";

export default function MapaPresencia() {
  const [seleccion, setSeleccion] = useState<string | null>(null);

  const estadosConClientes = ESTADOS.filter((e) =>
    ESTADOS_CON_CLIENTES.has(e.id)
  );

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-100/40 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden />

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
            Trabajamos 100% digital — desde Chihuahua hasta Puebla. La fiscal es
            la misma en todo el país, así que la distancia no es problema.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Mapa SVG */}
          <div className="lg:col-span-3">
            <div className="relative bg-white rounded-3xl ring-1 ring-slate-200 shadow-xl p-4 sm:p-6">
              <svg
                viewBox="0 0 1000 720"
                className="w-full h-auto"
                role="img"
                aria-label="Mapa de México con estados donde RDC Contadores tiene clientes"
              >
                {/* Estados base */}
                {ESTADOS.map((estado) => {
                  const activo = ESTADOS_CON_CLIENTES.has(estado.id);
                  const sel = seleccion === estado.id;
                  return (
                    <path
                      key={estado.id}
                      d={estado.path}
                      className={`${
                        activo ? COLORES_DESTACADO : COLOR_NEUTRAL
                      } stroke-white transition-colors cursor-pointer`}
                      strokeWidth="1.5"
                      style={{
                        filter: sel
                          ? "drop-shadow(0 4px 12px rgba(79,70,229,0.4))"
                          : undefined,
                      }}
                      onMouseEnter={() =>
                        activo ? setSeleccion(estado.id) : undefined
                      }
                      onMouseLeave={() => setSeleccion(null)}
                      onClick={() =>
                        activo ? setSeleccion(estado.id) : undefined
                      }
                    >
                      <title>{estado.nombre}</title>
                    </path>
                  );
                })}

                {/* Pins pulsantes sobre los estados con clientes */}
                {estadosConClientes.map((estado) =>
                  estado.pin ? (
                    <g key={`pin-${estado.id}`} className="pointer-events-none">
                      <circle
                        cx={estado.pin.x}
                        cy={estado.pin.y}
                        r="14"
                        fill="rgb(99 102 241 / 0.3)"
                        className="origin-center"
                      >
                        <animate
                          attributeName="r"
                          values="8;18;8"
                          dur="2.5s"
                          repeatCount="indefinite"
                          begin={`${ESTADOS.indexOf(estado) * 0.3}s`}
                        />
                        <animate
                          attributeName="opacity"
                          values="0.6;0;0.6"
                          dur="2.5s"
                          repeatCount="indefinite"
                          begin={`${ESTADOS.indexOf(estado) * 0.3}s`}
                        />
                      </circle>
                      <circle
                        cx={estado.pin.x}
                        cy={estado.pin.y}
                        r="6"
                        fill="white"
                        stroke="rgb(79 70 229)"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx={estado.pin.x}
                        cy={estado.pin.y}
                        r="2.5"
                        fill="rgb(79 70 229)"
                      />
                    </g>
                  ) : null
                )}
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
                {estadosConClientes.map((estado) => {
                  const info = INFO_ESTADOS[estado.id];
                  const sel = seleccion === estado.id;
                  return (
                    <li
                      key={estado.id}
                      onMouseEnter={() => setSeleccion(estado.id)}
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
                          {info?.ciudad ?? estado.nombre}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {info?.perfilCliente ?? estado.nombre}
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
