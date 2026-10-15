"use client";

import { useState } from "react";
import { CUENTAS_BANCARIAS_PORTAL } from "@/lib/datos-bancarios";
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
  const [copiada, setCopiada] = useState<string | null>(null);

  const copiarClabe = async (clabe: string) => {
    try {
      await navigator.clipboard.writeText(clabe);
      setCopiada(clabe);
      setTimeout(() => setCopiada(null), 2500);
    } catch {
      setCopiada(null);
    }
  };

  const contenido = (
    <>
      <p className="text-[15px] text-slate-600 leading-relaxed mb-5">
        Los pagos por <span className="font-semibold text-slate-800">transferencia o SPEI</span> no
        incluyen costo de procesamiento. Solo pagas el monto de tus honorarios.
      </p>

      {montoReferencia != null && montoReferencia > 0 && (
        <div className="mb-4">
          <p className="text-[13px] font-semibold text-slate-500 mb-1">
            Monto a transferir
          </p>
          <p className="text-[28px] font-bold text-slate-900 tabular-nums leading-none">
            {fmtMxn(montoReferencia, 2)}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {CUENTAS_BANCARIAS_PORTAL.map((cuenta) => (
          <div key={cuenta.id} className="rounded-xl bg-white px-4 py-4">
            <p className="text-[17px] font-semibold text-slate-900">{cuenta.banco}</p>
            <p className="text-[13px] text-slate-500 mt-0.5">{cuenta.titular}</p>
            {cuenta.nota ? (
              <p className="text-[13px] text-slate-500 mt-1">{cuenta.nota}</p>
            ) : null}
            <p className="mt-3 text-[13px] font-semibold text-slate-500">
              CLABE interbancaria
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900 text-[15px] tracking-wide tabular-nums">
                {cuenta.clabeDisplay}
              </span>
              <button
                type="button"
                onClick={() => void copiarClabe(cuenta.clabe)}
                className="px-3 py-1.5 rounded-lg bg-[var(--portal-navy)] text-white text-[13px] font-semibold hover:bg-[var(--portal-navy-hover)] transition-colors"
              >
                {copiada === cuenta.clabe ? "Copiada" : "Copiar CLABE"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[13px] text-slate-400 mt-5 leading-relaxed">
        Después de transferir, sube tu comprobante abajo para que {DESPACHO_NOMBRE}{" "}
        valide tu pago.
      </p>
    </>
  );

  if (embedded) {
    return (
      <div className={`rounded-xl bg-slate-50 p-4 ${className ?? ""}`}>
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
