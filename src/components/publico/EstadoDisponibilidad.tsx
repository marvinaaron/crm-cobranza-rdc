"use client";

/**
 * Indicador en vivo: "Atendiendo ahora" / "Fuera de horario".
 *
 * Calcula en cliente — basado en HORARIO_ATENCION — si en este momento
 * estamos abiertos. Si lo estamos, dice a qué hora cerramos hoy. Si no,
 * dice cuándo volvemos a abrir.
 *
 * Se hidrata en el cliente para evitar mismatch con SSR (la hora actual
 * difiere entre el render del servidor y el del navegador). Por eso
 * mostramos un placeholder neutral hasta que monta.
 */

import { useEffect, useMemo, useState } from "react";
import { HORARIO_ATENCION } from "@/lib/contacto-publico";

type EstadoCalculado =
  | { abierto: true; cierraEn: string }
  | { abierto: false; abreEn: string };

function calcularEstado(ahora: Date): EstadoCalculado {
  // Hora local del usuario — aproximación razonable para clientes en MX.
  const dia = ahora.getDay();
  const hora = ahora.getHours() + ahora.getMinutes() / 60;

  const hoy = HORARIO_ATENCION.dias.find((d) => d.dia === dia);

  if (hoy && hora >= hoy.abre && hora < hoy.cierra) {
    return {
      abierto: true,
      cierraEn: `${String(hoy.cierra).padStart(2, "0")}:00`,
    };
  }

  // Buscar el próximo día que abre.
  for (let i = 0; i < 7; i++) {
    const candidato = (dia + i) % 7;
    const definicion = HORARIO_ATENCION.dias.find((d) => d.dia === candidato);
    if (!definicion) continue;
    if (i === 0 && hora >= definicion.cierra) continue;
    if (i === 0 && hora >= definicion.abre) continue;
    const cuando =
      i === 0
        ? `hoy a las ${String(definicion.abre).padStart(2, "0")}:00`
        : i === 1
          ? `mañana a las ${String(definicion.abre).padStart(2, "0")}:00`
          : `${definicion.etiqueta} a las ${String(definicion.abre).padStart(2, "0")}:00`;
    return { abierto: false, abreEn: cuando };
  }

  return { abierto: false, abreEn: "el próximo día hábil" };
}

export default function EstadoDisponibilidad() {
  const [estado, setEstado] = useState<EstadoCalculado | null>(null);

  useEffect(() => {
    const tick = () => setEstado(calcularEstado(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const { tono, etiqueta, detalle } = useMemo(() => {
    if (!estado)
      return {
        tono: "neutral" as const,
        etiqueta: "Cargando estado…",
        detalle: HORARIO_ATENCION.resumen,
      };
    if (estado.abierto)
      return {
        tono: "vivo" as const,
        etiqueta: "Atendiendo ahora",
        detalle: `Cerramos hoy a las ${estado.cierraEn}`,
      };
    return {
      tono: "frio" as const,
      etiqueta: "Fuera de horario",
      detalle: `Volvemos ${estado.abreEn}`,
    };
  }, [estado]);

  const colores =
    tono === "vivo"
      ? "bg-emerald-500/15 ring-emerald-400/40 text-emerald-100"
      : tono === "frio"
        ? "bg-rose-500/20 ring-rose-400/50 text-rose-100"
        : "bg-white/10 ring-white/20 text-slate-200";

  const punto =
    tono === "vivo"
      ? "bg-emerald-400"
      : tono === "frio"
        ? "bg-rose-500"
        : "bg-slate-400";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 text-[11px] font-bold ${colores}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        {tono === "vivo" && (
          <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-70" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${punto}`} />
      </span>
      <span className="uppercase tracking-widest">{etiqueta}</span>
      <span className="hidden sm:inline text-[10px] font-medium opacity-80 normal-case tracking-normal">
        · {detalle}
      </span>
    </span>
  );
}
