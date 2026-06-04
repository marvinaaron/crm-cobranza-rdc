"use client";

/**
 * Indicador "Portal activo" en el sidebar del portal del cliente.
 *
 * Refleja si en este momento estamos dentro del horario de atención del
 * despacho (HORARIO_ATENCION, Lun–Vie). Si estamos abiertos: punto verde
 * pulsante + "En horario de atención". Si no: punto gris + cuándo
 * volvemos. Se hidrata en cliente para evitar mismatch con SSR.
 */

import { useEffect, useMemo, useState } from "react";
import { HORARIO_ATENCION } from "@/lib/contacto-publico";

type EstadoCalculado =
  | { abierto: true; cierraEn: string }
  | { abierto: false; abreEn: string };

function calcular(ahora: Date): EstadoCalculado {
  const dia = ahora.getDay();
  const hora = ahora.getHours() + ahora.getMinutes() / 60;
  const hoy = HORARIO_ATENCION.dias.find((d) => d.dia === dia);

  if (hoy && hora >= hoy.abre && hora < hoy.cierra) {
    return { abierto: true, cierraEn: `${String(hoy.cierra).padStart(2, "0")}:00` };
  }

  for (let i = 0; i < 7; i++) {
    const candidato = (dia + i) % 7;
    const def = HORARIO_ATENCION.dias.find((d) => d.dia === candidato);
    if (!def) continue;
    if (i === 0 && hora >= def.abre) continue;
    const cuando =
      i === 0
        ? `hoy ${String(def.abre).padStart(2, "0")}:00`
        : i === 1
          ? `mañana ${String(def.abre).padStart(2, "0")}:00`
          : `${def.etiqueta} ${String(def.abre).padStart(2, "0")}:00`;
    return { abierto: false, abreEn: cuando };
  }
  return { abierto: false, abreEn: "el próximo día hábil" };
}

export default function PortalEstadoAtencion() {
  const [estado, setEstado] = useState<EstadoCalculado | null>(null);

  useEffect(() => {
    const tick = () => setEstado(calcular(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const { abierto, etiqueta, detalle } = useMemo(() => {
    if (!estado) {
      return {
        abierto: false,
        etiqueta: "Portal activo",
        detalle: HORARIO_ATENCION.resumen,
      };
    }
    if (estado.abierto) {
      return {
        abierto: true,
        etiqueta: "En horario de atención",
        detalle: `Cerramos hoy ${estado.cierraEn}`,
      };
    }
    return {
      abierto: false,
      etiqueta: "Fuera de horario",
      detalle: `Te respondemos ${estado.abreEn}`,
    };
  }, [estado]);

  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-slate-50/70 ring-1 ring-slate-100 dark:bg-white/5 dark:ring-white/10">
      <span className="relative flex h-2 w-2 shrink-0">
        {abierto && (
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            abierto ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-500"
          }`}
        />
      </span>
      <div className="min-w-0 leading-tight">
        <p
          className={`text-[11px] font-black ${
            abierto
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-slate-500 dark:text-slate-300"
          }`}
        >
          {etiqueta}
        </p>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">
          {detalle}
        </p>
      </div>
    </div>
  );
}
