"use client";

import Link from "next/link";
import type { Pendiente } from "@/lib/pendientes";

type Props = {
  clienteId: number;
  pendientes: Pendiente[];
  className?: string;
};

export default function PildoraPendientesCliente({
  clienteId,
  pendientes,
  className = "",
}: Props) {
  if (pendientes.length === 0) return null;
  const primero = pendientes[0]?.titulo ?? "Pendiente";
  const extra = pendientes.length - 1;
  return (
    <Link
      href={`/pendientes?cliente=${clienteId}`}
      onClick={(e) => e.stopPropagation()}
      title={pendientes.map((p) => p.titulo).join(" · ")}
      className={`inline-flex items-center gap-1.5 min-w-0 max-w-full rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 px-2.5 py-1 text-[12px] font-semibold hover:bg-amber-100 ${className}`}
    >
      <span className="h-4 w-4 shrink-0 rounded-full bg-amber-500 text-white text-[10px] font-bold tabular-nums inline-flex items-center justify-center">
        {pendientes.length}
      </span>
      <span className="truncate">{primero}</span>
      {extra > 0 ? (
        <span className="shrink-0 text-amber-600 tabular-nums">+{extra}</span>
      ) : null}
    </Link>
  );
}
