"use client";

import { useEffect, useState } from "react";
import BarraVigenciaEfirma from "@/components/admin/BarraVigenciaEfirma";

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
      className={`rounded-2xl border px-4 py-4 ${
        urgente
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1">
        Aviso · e.firma (FIEL)
      </p>
      <p className="text-sm font-bold text-slate-800 leading-snug">
        Su certificado de e.firma vence el{" "}
        <span className="text-amber-900">{estado.vigenciaFinLabel}</span>.
        Coordine la renovación con su contador en RDC Contadores.
      </p>
      <div className="mt-3">
        <BarraVigenciaEfirma diasRestantes={dias} />
      </div>
    </div>
  );
}
