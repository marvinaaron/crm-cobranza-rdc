"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  type Cliente,
  getPeriodoHoy,
  getAnticipoHonorarios,
  getDeudaNetaHonorarios,
  contarMesesImpagos,
  estaPagado,
} from "@/lib/clientes";
import { getFechaLimiteDate } from "@/lib/correo";
import { fmtMxn } from "@/components/portal/portal-ui";

type Props = {
  cliente: Cliente;
  variante?: "desktop" | "mobile";
};

type PillEstado =
  | { tipo: "pendiente"; monto: number; urgente: boolean; href: string }
  | { tipo: "anticipo"; monto: number; href: string };

export function usePortalFinanzasPill(cliente: Cliente): PillEstado | null {
  return useMemo(() => {
    const periodoHoy = getPeriodoHoy();
    const anticipo = getAnticipoHonorarios(cliente);
    const deudaNeta = getDeudaNetaHonorarios(cliente, periodoHoy);

    if (deudaNeta > 0) {
      const hoy = new Date();
      const pagadoMes = estaPagado(cliente, periodoHoy);
      const fechaLimite = getFechaLimiteDate(cliente, periodoHoy);
      const honorariosVencidos = !pagadoMes && hoy > fechaLimite;
      const mesesImpagos = contarMesesImpagos(cliente, periodoHoy);
      return {
        tipo: "pendiente",
        monto: deudaNeta,
        urgente: honorariosVencidos || mesesImpagos >= 2,
        href: "/portal/honorarios",
      };
    }

    if (anticipo > 0) {
      return {
        tipo: "anticipo",
        monto: anticipo,
        href: "/portal/honorarios#anticipo",
      };
    }

    return null;
  }, [cliente]);
}

export default function PortalHeaderFinanzasPill({
  cliente,
  variante = "desktop",
}: Props) {
  const pill = usePortalFinanzasPill(cliente);
  if (!pill) return null;

  const enOscuro = variante === "desktop";
  const clases =
    pill.tipo === "anticipo"
      ? enOscuro
        ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/35 hover:bg-emerald-400/30"
        : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
      : pill.urgente
        ? enOscuro
          ? "bg-red-500/25 text-white ring-1 ring-red-400/40 hover:bg-red-500/35"
          : "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
        : enOscuro
          ? "bg-amber-400/20 text-amber-50 ring-1 ring-amber-300/35 hover:bg-amber-400/30"
          : "bg-amber-50 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100";

  const etiqueta =
    pill.tipo === "anticipo"
      ? `Anticipo ${fmtMxn(pill.monto)}`
      : `Pendiente ${fmtMxn(pill.monto)}`;

  return (
    <Link
      href={pill.href}
      className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-tight transition-colors max-w-[7.5rem] truncate sm:max-w-[9rem] sm:px-2.5 sm:py-1 sm:text-[10px] ${clases}`}
      title={
        pill.tipo === "anticipo"
          ? "Ver tu anticipo disponible para honorarios"
          : "Ver honorarios pendientes de pago"
      }
    >
      {etiqueta}
    </Link>
  );
}
