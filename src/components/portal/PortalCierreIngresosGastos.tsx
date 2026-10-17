"use client";

import { formatMontoImpuesto } from "@/lib/cumplimiento";
import PortalSection from "@/components/portal/PortalSection";

export default function PortalCierreIngresosGastos({
  ingresos,
  gastos,
  ventasExentas,
}: {
  ingresos: number;
  gastos: number;
  ventasExentas?: number;
}) {
  const utilidad = Math.round((ingresos - gastos) * 100) / 100;
  const filas: Array<{ label: string; monto: number; fuerte?: boolean }> = [
    { label: "Ingresos", monto: ingresos },
    { label: "Gastos", monto: gastos },
  ];
  if ((ventasExentas ?? 0) > 0) {
    filas.push({ label: "Ventas exentas", monto: ventasExentas ?? 0 });
  }
  filas.push({ label: "Utilidad", monto: utilidad, fuerte: true });

  return (
    <PortalSection title="Ingresos y gastos" collapsible>
      <div className="space-y-2">
        {filas.map((f) => (
          <div
            key={f.label}
            className={`flex items-baseline justify-between gap-3 ${
              f.fuerte ? "pt-2 border-t border-slate-100" : ""
            }`}
          >
            <p
              className={`text-[13px] ${
                f.fuerte ? "font-semibold text-slate-700" : "text-slate-500"
              }`}
            >
              {f.label}
            </p>
            <p
              className={`text-[17px] font-semibold tabular-nums ${
                f.fuerte && f.monto < 0 ? "text-red-600" : "text-slate-900"
              }`}
            >
              {formatMontoImpuesto(f.monto)}
            </p>
          </div>
        ))}
        <p className="text-[13px] text-slate-500 leading-snug pt-1">
          Subtotales del mes que registró tu despacho.
        </p>
      </div>
    </PortalSection>
  );
}
