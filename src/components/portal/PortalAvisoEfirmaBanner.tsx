"use client";

import { useEffect, useState } from "react";
import CuentaRegresivaEfirma from "@/components/admin/CuentaRegresivaEfirma";
import { etiquetaDiasRestantes } from "@/lib/efirma/vigencia";

type EstadoEfirma = {
  tieneEfirma: boolean;
  vigenciaFinLabel?: string;
  diasRestantes?: number;
  enVentanaAlerta?: boolean;
  estado?: string;
};

export default function PortalAvisoEfirmaBanner() {
  const [estado, setEstado] = useState<EstadoEfirma | null>(null);

  useEffect(() => {
    void fetch("/api/portal/efirma-estado")
      .then((r) => r.json())
      .then(setEstado)
      .catch(() => setEstado(null));
  }, []);

  if (!estado?.tieneEfirma || !estado.enVentanaAlerta) return null;

  const dias = estado.diasRestantes ?? 0;
  const urgente = dias <= 7;

  return (
    <div
      className={`rounded-2xl border px-4 py-4 overflow-hidden ${
        urgente ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <CuentaRegresivaEfirma diasRestantes={dias} tamano="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1">
            Aviso · e.firma (FIEL)
          </p>
          <p className="text-sm font-bold text-slate-800 leading-snug">
            Su certificado vence el{" "}
            <span className="text-amber-900">{estado.vigenciaFinLabel}</span>.
            Coordine la renovación con su contador en RDC Contadores.
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mt-2">
            {etiquetaDiasRestantes(dias)}
          </p>
        </div>
      </div>
    </div>
  );
}
