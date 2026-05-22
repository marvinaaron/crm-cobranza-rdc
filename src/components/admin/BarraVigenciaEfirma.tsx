"use client";

import {
  colorBarraVigencia,
  etiquetaDiasRestantes,
  porcentajeVentana30,
} from "@/lib/efirma/vigencia";

type Props = {
  diasRestantes: number;
  /** Si false, solo muestra la barra sin texto largo */
  compacto?: boolean;
};

export default function BarraVigenciaEfirma({ diasRestantes, compacto }: Props) {
  if (diasRestantes > 30) return null;

  const pct = porcentajeVentana30(diasRestantes);
  const color = colorBarraVigencia(diasRestantes);

  return (
    <div className="w-full">
      {!compacto && (
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Cuenta regresiva · 30 días
          </span>
          <span
            className={`text-[9px] font-black uppercase tracking-widest ${
              diasRestantes <= 7 ? "text-red-600" : diasRestantes <= 15 ? "text-amber-700" : "text-yellow-700"
            }`}
          >
            {etiquetaDiasRestantes(diasRestantes)}
          </span>
        </div>
      )}
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Vigencia e.firma: ${etiquetaDiasRestantes(diasRestantes)}`}
        />
      </div>
    </div>
  );
}
