import {
  type DesgloseCobro,
  IVA_SOBRE_COMISION_STRIPE,
  STRIPE_TARIFA_FIJO_MXN,
  STRIPE_TARIFA_PCT,
} from "@/lib/stripe-honorarios";
import { fmtMxn } from "@/components/portal/portal-ui";

type Props = {
  desglose: DesgloseCobro;
  /** Tamaño de fuente del total (clase Tailwind). */
  totalClassName?: string;
};

/**
 * Desglose del costo de procesamiento Stripe (comisión + IVA) y total a pagar.
 */
export default function DesglosePagoTarjeta({
  desglose,
  totalClassName = "text-lg",
}: Props) {
  const pctLabel = (STRIPE_TARIFA_PCT * 100).toFixed(1).replace(/\.0$/, "");
  const ivaLabel = (IVA_SOBRE_COMISION_STRIPE * 100).toFixed(0);

  return (
    <>
      <div className="rounded-xl bg-white/70 border border-slate-100 px-3 py-2.5 space-y-1.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Costo de procesamiento (tarjeta)
        </p>
        <div className="flex justify-between gap-2 text-[12px]">
          <span className="font-bold text-slate-500">
            Comisión Stripe ({pctLabel}% + {fmtMxn(STRIPE_TARIFA_FIJO_MXN, 2)})
          </span>
          <span className="font-black text-slate-600 tabular-nums">
            {fmtMxn(desglose.comisionStripe, 2)}
          </span>
        </div>
        <div className="flex justify-between gap-2 text-[12px]">
          <span className="font-bold text-slate-500">IVA ({ivaLabel}%)</span>
          <span className="font-black text-slate-600 tabular-nums">
            {fmtMxn(desglose.ivaStripe, 2)}
          </span>
        </div>
        {desglose.ajusteRedondeo > 0 && (
          <div className="flex justify-between gap-2 text-[12px]">
            <span className="font-bold text-slate-500">Ajuste redondeo</span>
            <span className="font-black text-slate-600 tabular-nums">
              {fmtMxn(desglose.ajusteRedondeo, 2)}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-2 pt-1 border-t border-slate-100 text-sm">
          <span className="font-bold text-slate-600">Subtotal costo</span>
          <span className="font-black text-slate-700 tabular-nums">
            {fmtMxn(desglose.comision, 2)}
          </span>
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 leading-relaxed px-0.5">
        El costo de procesamiento cubre la comisión de Stripe para que el despacho
        reciba el monto íntegro de honorarios.
      </p>
      <div className="rounded-xl bg-emerald-50/80 border border-emerald-100 px-3 py-2.5 space-y-1">
        <div className="flex justify-between gap-2 text-[12px]">
          <span className="font-bold text-emerald-800">
            Transferencia SPEI <span className="font-black">(recomendado)</span>
          </span>
          <span className="font-black text-emerald-800 tabular-nums">
            {fmtMxn(desglose.montoHonorarios, 2)}
          </span>
        </div>
        <p className="text-[9px] font-bold text-emerald-700/90 leading-relaxed">
          Sin costo de procesamiento. Es la forma más económica de pagar tus honorarios.
        </p>
      </div>
      <div className="flex justify-between gap-2 pt-2 border-t border-slate-200">
        <span className="font-black text-slate-800">Total con tarjeta</span>
        <span
          className={`font-black text-[var(--portal-navy)] tabular-nums ${totalClassName}`}
        >
          {fmtMxn(desglose.total, 2)}
        </span>
      </div>
      <p className="text-[9px] font-bold text-slate-400 leading-relaxed px-0.5">
        El total con tarjeta incluye el costo de la pasarela de pago. Puedes evitarlo
        pagando por transferencia arriba en esta página.
      </p>
    </>
  );
}
