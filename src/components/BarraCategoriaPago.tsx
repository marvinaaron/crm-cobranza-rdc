"use client";

import {
  type CategoriaId,
  CATEGORIA_META,
  plazoCategoria,
  formatMontoImpuesto,
  formatFechaLimiteImpuestoCorta,
  type RegistroCumplimiento,
  getSubtotalCategoria,
} from "@/lib/cumplimiento";

type Props = {
  registro: RegistroCumplimiento;
  categoria: CategoriaId;
};

export default function BarraCategoriaPago({ registro, categoria }: Props) {
  const meta = CATEGORIA_META[categoria];
  const subtotal = getSubtotalCategoria(registro, categoria);
  const plazo = plazoCategoria(registro, categoria);

  if (subtotal <= 0 || !plazo) return null;

  const { dias, vencido, progreso, fecha } = plazo;

  let mensaje = "";
  if (vencido) mensaje = "Vencido";
  else if (dias === 0) mensaje = "Hoy";
  else if (dias !== null) mensaje = `${dias}d`;

  const barraFill = vencido || dias === 0 ? "bg-red-500" : meta.bar;

  return (
    <div className={`rounded-xl border px-4 py-3 ${meta.border} ${meta.bg}`}>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="shrink-0 min-w-[120px]">
          <p className={`text-[8px] font-black uppercase tracking-widest ${meta.accent}`}>
            {meta.label}
          </p>
          <p className={`text-lg font-black tabular-nums leading-tight ${meta.accent}`}>
            {formatMontoImpuesto(subtotal)}
          </p>
        </div>

        <div className="flex-1 min-w-[140px]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className={`text-[8px] font-black uppercase tracking-widest ${meta.accent}`}>
              Plazo de pago
            </p>
            <span
              className={`text-[9px] font-black uppercase tabular-nums ${
                vencido || dias === 0 ? "text-red-600" : meta.accent
              }`}
            >
              {mensaje}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white border border-white/80 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barraFill}`}
              style={{ width: `${progreso}%` }}
              aria-hidden
            />
          </div>
        </div>

        <p className="text-[10px] font-bold text-slate-500 shrink-0 hidden sm:block max-w-[180px] leading-snug">
          Límite: {formatFechaLimiteImpuestoCorta(fecha)}
        </p>
      </div>
    </div>
  );
}
