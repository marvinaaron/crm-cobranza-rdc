"use client";

import {
  ESTADO_ENCARGO_META,
  PASOS_ENCARGO_TOTAL,
  type EstadoEncargo,
} from "@/lib/encargos";

const PASOS: { estado: EstadoEncargo; label: string }[] = [
  { estado: "recibido", label: "Recibido" },
  { estado: "en_proceso", label: "En proceso" },
  { estado: "listo", label: "Listo" },
];

type Props = {
  estado: EstadoEncargo;
  /** Versión compacta para la fila de la lista. */
  compact?: boolean;
};

/**
 * Seguimiento visual tipo paquetería: Recibido → En proceso → Listo.
 */
export default function EncargoTimeline({ estado, compact = false }: Props) {
  const pasoActual = ESTADO_ENCARGO_META[estado].paso;

  return (
    <div className={compact ? "mt-2.5" : ""}>
      <div className="flex items-center">
        {PASOS.map((paso, i) => {
          const num = i + 1;
          const hecho = num < pasoActual;
          const activo = num === pasoActual;
          const meta = ESTADO_ENCARGO_META[paso.estado];

          return (
            <div
              key={paso.estado}
              className={`flex items-center ${i < PASOS_ENCARGO_TOTAL - 1 ? "flex-1" : ""}`}
            >
              <div className="flex flex-col items-center shrink-0">
                <span
                  className={`flex items-center justify-center rounded-full font-black transition-colors ${
                    compact ? "w-5 h-5 text-[8px]" : "w-7 h-7 text-[10px]"
                  } ${
                    hecho
                      ? "bg-emerald-500 text-white"
                      : activo
                        ? `${meta.barra} text-white ring-2 ring-offset-1 ring-slate-200`
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {hecho ? (
                    <svg
                      width={compact ? 10 : 12}
                      height={compact ? 10 : 12}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    num
                  )}
                </span>
                <span
                  className={`font-black uppercase tracking-wide text-center mt-1 ${
                    compact
                      ? "text-[7px] max-w-[52px] leading-tight"
                      : "text-[9px] max-w-[72px] leading-tight"
                  } ${
                    activo
                      ? "text-slate-800"
                      : hecho
                        ? "text-emerald-700"
                        : "text-slate-400"
                  }`}
                >
                  {paso.label}
                </span>
              </div>
              {i < PASOS_ENCARGO_TOTAL - 1 && (
                <div
                  className={`flex-1 mx-1 rounded-full ${
                    compact ? "h-0.5 mb-4" : "h-1 mb-5"
                  } ${hecho ? "bg-emerald-400" : activo ? "bg-slate-200" : "bg-slate-100"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      {!compact && (
        <p className="text-xs font-medium text-slate-500 mt-3">
          {ESTADO_ENCARGO_META[estado].detalleCliente}
        </p>
      )}
    </div>
  );
}
