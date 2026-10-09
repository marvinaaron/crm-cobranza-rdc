"use client";

import {
  type RegistroCumplimiento,
  diasHastaLimite,
  formatFechaLimiteImpuesto,
  formatMontoImpuesto,
  limiteVencido,
  progresoPlazoImpuestos,
} from "@/lib/cumplimiento";

type Props = {
  registro: RegistroCumplimiento;
};

export default function BarraPlazoImpuestos({ registro }: Props) {
  const dias = diasHastaLimite(registro.fechaLimite);
  const vencido = limiteVencido(registro.fechaLimite);
  const progreso = progresoPlazoImpuestos(
    registro.fechaLimite,
    registro.clienteConfirmoPreviewEn ?? registro.previewPublicadoEn
  );

  let mensaje = "";
  if (vencido) mensaje = "Vencido";
  else if (dias === 0) mensaje = "Hoy";
  else if (dias !== null) mensaje = `${dias}d`;

  const barraFill = vencido || dias === 0 ? "bg-red-500" : "bg-indigo-600";

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="shrink-0 min-w-[120px]">
          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-500">
            Importe preliminar
          </p>
          <p className="text-lg font-black text-indigo-700 tabular-nums leading-tight">
            {formatMontoImpuesto(registro.montoImpuesto)}
          </p>
        </div>

        <div className="flex-1 min-w-[140px]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-indigo-500">
              Plazo de pago
            </p>
            <span
              className={`text-[9px] font-black uppercase tabular-nums ${
                vencido || dias === 0 ? "text-red-600" : "text-indigo-600"
              }`}
            >
              {mensaje}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white border border-indigo-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barraFill}`}
              style={{ width: `${progreso}%` }}
              aria-hidden
            />
          </div>
        </div>

        <p className="text-[10px] font-bold text-slate-500 shrink-0 hidden sm:block max-w-[180px] leading-snug">
          Límite: {formatFechaLimiteImpuesto(registro.fechaLimite)}
        </p>
      </div>
      <p className="text-[10px] font-bold text-slate-500 mt-2 sm:hidden">
        Límite: {formatFechaLimiteImpuesto(registro.fechaLimite)}
      </p>
    </div>
  );
}
