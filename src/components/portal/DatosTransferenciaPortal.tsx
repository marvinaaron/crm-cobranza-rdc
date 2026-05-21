"use client";

import { useState } from "react";
import { DATOS_BANCARIOS_PORTAL } from "@/lib/datos-bancarios";
import { DESPACHO_NOMBRE } from "@/lib/correo";
import PortalSection from "@/components/portal/PortalSection";
import { fmtMxn } from "@/components/portal/portal-ui";

type Props = {
  montoReferencia?: number;
  className?: string;
};

export default function DatosTransferenciaPortal({ montoReferencia, className }: Props) {
  const [copiado, setCopiado] = useState(false);

  const copiarClabe = async () => {
    try {
      await navigator.clipboard.writeText(DATOS_BANCARIOS_PORTAL.clabe);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <PortalSection title="Pago por transferencia" className={className}>
      <p className="text-[11px] font-bold text-slate-700 leading-relaxed mb-5">
        Los pagos por <span className="font-black">transferencia o SPEI</span> no cobran
        comisión por uso de plataforma. Solo paga el monto de sus honorarios.
      </p>

      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Banco
          </dt>
          <dd className="font-black text-slate-800">{DATOS_BANCARIOS_PORTAL.banco}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Titular
          </dt>
          <dd className="font-black text-slate-800">{DATOS_BANCARIOS_PORTAL.titular}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
            CLABE interbancaria
          </dt>
          <dd className="flex flex-wrap items-center gap-3">
            <span className="font-black text-slate-900 text-base tracking-wide tabular-nums">
              {DATOS_BANCARIOS_PORTAL.clabeDisplay}
            </span>
            <button
              type="button"
              onClick={copiarClabe}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
            >
              {copiado ? "Copiada" : "Copiar CLABE"}
            </button>
          </dd>
        </div>
        {montoReferencia != null && montoReferencia > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <dt className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Monto a transferir
            </dt>
            <dd className="text-2xl font-black text-emerald-700 tabular-nums">
              {fmtMxn(montoReferencia, 2)}
            </dd>
          </div>
        )}
      </dl>

      <p className="text-[10px] font-bold text-slate-400 mt-5 leading-relaxed">
        Después de transferir, suba su comprobante en esta misma página para que {DESPACHO_NOMBRE}{" "}
        valide su pago.
      </p>
    </PortalSection>
  );
}
