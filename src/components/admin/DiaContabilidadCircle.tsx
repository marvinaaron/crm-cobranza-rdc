"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useClientes } from "@/context/ClientesContext";
import type { Cliente } from "@/lib/clientes";
import { TONO_RING } from "@/lib/cobranza-workflow";
import {
  normalizarDiaContabilidad,
  progresoDiaContabilidad,
} from "@/lib/admin/dia-contabilidad";

type Props = {
  cliente: Cliente;
  size?: "sm" | "xs";
};

const RADIO = 16;
const PERIMETRO = 2 * Math.PI * RADIO;

const TONO_POR_ESTADO = {
  pendiente: TONO_RING.indigo,
  hoy: TONO_RING.emerald,
  vencido: TONO_RING.amber,
} as const;

export default function DiaContabilidadCircle({ cliente, size = "sm" }: Props) {
  const { actualizarCliente } = useClientes();
  const [abierto, setAbierto] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const compacto = size === "xs";
  const dia = normalizarDiaContabilidad(cliente.diaContabilidad);

  useEffect(() => {
    if (!abierto) return;
    function posicionar() {
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      const ancho = 280;
      const left = Math.min(
        Math.max(ancho / 2 + 8, r.left + r.width / 2),
        window.innerWidth - ancho / 2 - 8
      );
      const top = r.bottom + 8;
      setCoords({ top, left });
    }
    posicionar();
    function cerrar(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setAbierto(false);
    }
    function onScroll() {
      setAbierto(false);
    }
    document.addEventListener("mousedown", cerrar);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", cerrar);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [abierto]);

  function guardar(siguiente: number | undefined) {
    const next: Cliente = { ...cliente };
    if (siguiente == null) {
      delete next.diaContabilidad;
      delete next.diaContabilidadEn;
    } else {
      next.diaContabilidad = siguiente;
      next.diaContabilidadEn = new Date().toISOString();
    }
    actualizarCliente(next);
    setAbierto(false);
  }

  const progreso = dia != null ? progresoDiaContabilidad(dia) : null;
  const tono = progreso ? TONO_POR_ESTADO[progreso.estado] : TONO_RING.slate;
  const dashOffset = progreso
    ? PERIMETRO - (PERIMETRO * progreso.porcentaje) / 100
    : PERIMETRO;

  const titulo =
    dia == null
      ? "Asignar día para trabajar su contabilidad"
      : progreso?.estado === "hoy"
        ? `Hoy trabajas la contabilidad (día ${progreso.diaAjustado})`
        : progreso?.estado === "vencido"
          ? `El día ${progreso.diaAjustado} ya pasó este mes — muévelo si lo vas a retomar`
          : `Contabilidad agendada el día ${progreso?.diaAjustado}`;

  const panel =
    abierto && coords && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            className="fixed z-[140] w-[17.5rem] rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 p-3"
            style={{ top: coords.top, left: coords.left, transform: "translateX(-50%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
              Día de contabilidad
            </p>
            <p className="text-[11px] font-bold text-slate-600 mt-0.5 leading-snug">
              Elige el día del mes en que vas a trabajar a{" "}
              <span className="text-slate-900">{cliente.razonSocial}</span>.
            </p>
            <div className="mt-2.5 grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
                const activo = dia === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => guardar(n)}
                    className={`h-7 rounded-lg text-[11px] font-black tabular-nums transition-colors ${
                      activo
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            {dia != null && (
              <button
                type="button"
                onClick={() => guardar(undefined)}
                className="mt-2 w-full text-[10px] font-bold text-slate-400 hover:text-rose-600"
              >
                Quitar fecha
              </button>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <div
      ref={wrapRef}
      className="relative inline-flex"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={`relative ${compacto ? "w-8 h-8" : "w-11 h-11"} rounded-full hover:bg-slate-50 transition-colors`}
        title={titulo}
        aria-label={titulo}
        aria-expanded={abierto}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full -rotate-90"
          aria-hidden
        >
          <circle
            cx="20"
            cy="20"
            r={RADIO}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={compacto ? 4 : 3.5}
          />
          <circle
            cx="20"
            cy="20"
            r={RADIO}
            fill="none"
            stroke={tono.hex}
            strokeWidth={compacto ? 4 : 3.5}
            strokeLinecap="round"
            strokeDasharray={PERIMETRO}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 600ms ease, stroke 400ms ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          {dia == null ? (
            <svg
              width={compacto ? 12 : 15}
              height={compacto ? 12 : 15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400"
              aria-hidden
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ) : (
            <span
              className={`font-black tabular-nums leading-none ${
                compacto ? "text-xs" : "text-base"
              } ${tono.numText}`}
            >
              {progreso?.diaAjustado ?? dia}
            </span>
          )}
        </span>
      </button>
      {panel}
    </div>
  );
}
