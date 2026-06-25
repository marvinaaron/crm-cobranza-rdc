"use client";

import { useState } from "react";
import { DATOS_BANCARIOS_PORTAL } from "@/lib/datos-bancarios";
import { DESPACHO_NOMBRE } from "@/lib/correo";
import PortalSection from "@/components/portal/PortalSection";
import { fmtMxn } from "@/components/portal/portal-ui";

type Props = {
  montoReferencia?: number;
  className?: string;
  /** Sin tarjeta PortalSection (dentro de selector de método). */
  embedded?: boolean;
};

export default function DatosTransferenciaPortal({
  montoReferencia,
  className,
  embedded = false,
}: Props) {
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

  const contenido = (
    <>
      <p className="text-[11px] font-bold text-slate-700 leading-relaxed mb-5">
        Los pagos por <span className="font-black">transferencia o SPEI</span> no incluyen
        costo de procesamiento. Solo pagas el monto de tus honorarios — es la opción que
        recomendamos.
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
              className="px-3 py-1.5 rounded-lg bg-[var(--portal-navy)] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[var(--portal-navy-hover)] transition-colors"
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
        Después de transferir, sube tu comprobante abajo para que {DESPACHO_NOMBRE}{" "}
        valide tu pago.
      </p>
    </>
  );

  if (embedded) {
    return (
      <div className={`rounded-2xl bg-slate-50 border border-slate-100 p-4 ${className ?? ""}`}>
        {contenido}
      </div>
    );
  }

  return (
    <PortalSection title="Pago por transferencia" className={className}>
      {contenido}
    </PortalSection>
  );
}
