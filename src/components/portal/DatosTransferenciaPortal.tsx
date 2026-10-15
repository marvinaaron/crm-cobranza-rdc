"use client";

import { useState } from "react";
import {
  CUENTAS_BANCARIAS_PORTAL,
  type CuentaBancariaPortal,
} from "@/lib/datos-bancarios";
import { DESPACHO_NOMBRE } from "@/lib/correo";
import PortalSection from "@/components/portal/PortalSection";
import PillDeslizable from "@/components/ui/PillDeslizable";
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
  const [banco, setBanco] = useState<CuentaBancariaPortal["id"]>("bbva");
  const [copiada, setCopiada] = useState(false);
  const cuenta =
    CUENTAS_BANCARIAS_PORTAL.find((c) => c.id === banco) ??
    CUENTAS_BANCARIAS_PORTAL[0];

  const copiarClabe = async () => {
    try {
      await navigator.clipboard.writeText(cuenta.clabe);
      setCopiada(true);
      setTimeout(() => setCopiada(false), 2500);
    } catch {
      setCopiada(false);
    }
  };

  const elegirBanco = (id: CuentaBancariaPortal["id"]) => {
    setBanco(id);
    setCopiada(false);
  };

  const contenido = (
    <div className="space-y-4">
      {montoReferencia != null && montoReferencia > 0 ? (
        <div>
          <p className="text-[13px] text-slate-500">Monto a transferir</p>
          <p className="mt-0.5 text-[28px] font-bold text-slate-900 tabular-nums leading-none">
            {fmtMxn(montoReferencia, 2)}
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            SPEI · sin comisión
          </p>
        </div>
      ) : (
        <p className="text-[15px] text-slate-500 leading-snug">
          Transferencia SPEI, sin costo de procesamiento.
        </p>
      )}

      <PillDeslizable
        acento="portal"
        label="Cuenta para transferir"
        value={banco}
        onChange={elegirBanco}
        opciones={CUENTAS_BANCARIAS_PORTAL.map((c) => ({
          value: c.id,
          label: c.banco,
        }))}
      />

      <div>
        <p className="text-[13px] text-slate-500">Titular</p>
        <p className="text-[17px] font-semibold text-slate-900">{cuenta.titular}</p>
        <p className="mt-3 text-[13px] text-slate-500">CLABE interbancaria</p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="min-w-0 flex-1 text-[18px] font-semibold text-slate-900 tabular-nums tracking-wide leading-snug">
            {cuenta.clabeDisplay}
          </p>
          <button
            type="button"
            onClick={() => void copiarClabe()}
            title={copiada ? "CLABE copiada" : "Copiar CLABE al portapapeles"}
            aria-label={copiada ? "CLABE copiada" : "Copiar CLABE al portapapeles"}
            className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
              copiada
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500 hover:bg-[var(--portal-navy-soft)] hover:text-[var(--portal-navy)]"
            }`}
          >
            {copiada ? <CheckIcon /> : <CopiarIcon />}
          </button>
        </div>
        {cuenta.nota ? (
          <p className="mt-2 text-[13px] text-slate-500 leading-snug">{cuenta.nota}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => void copiarClabe()}
        className="w-full h-11 rounded-xl bg-[#1a164d] text-white text-[15px] font-semibold hover:bg-[#231f55]"
      >
        {copiada ? "CLABE copiada" : "Copiar CLABE"}
      </button>

      <p className="text-[13px] text-slate-400 leading-snug">
        Después de transferir, sube tu comprobante para que {DESPACHO_NOMBRE}{" "}
        lo valide.
      </p>
    </div>
  );

  if (embedded) {
    return <div className={className}>{contenido}</div>;
  }

  return (
    <PortalSection title="Pago por transferencia" className={className}>
      {contenido}
    </PortalSection>
  );
}

function CopiarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
