"use client";

import { useMemo } from "react";
import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  periodoLabel,
  periodoKey,
  estaPagado,
  clienteActivoEnPeriodo,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import AccionesFacturaPdf from "@/components/AccionesFacturaPdf";
import { portalCard, portalCardTitle } from "@/components/portal/portal-ui";

type Props = {
  cliente: Cliente;
  periodoVista: Periodo;
};

export default function FacturasPortal({ cliente, periodoVista }: Props) {
  const { getFacturaPeriodo } = useClientes();

  const facturaActual = getFacturaPeriodo(cliente.id, periodoVista);
  const pagadoActual = estaPagado(cliente, periodoVista);

  const facturasHistorial = useMemo(() => {
    const items: { periodo: Periodo; label: string; factura: NonNullable<ReturnType<typeof getFacturaPeriodo>> }[] = [];
    MESES_NOM.forEach((m, i) => {
      const p: Periodo = { mes: i, anio: periodoVista.anio };
      if (!clienteActivoEnPeriodo(cliente, p)) return;
      if (periodoKey(p) > periodoKey(periodoVista)) return;
      if (!estaPagado(cliente, p)) return;
      const f = getFacturaPeriodo(cliente.id, p);
      if (!f) return;
      if (p.mes === periodoVista.mes && p.anio === periodoVista.anio) return;
      items.push({ periodo: p, label: m, factura: f });
    });
    return items.reverse();
  }, [cliente, periodoVista, getFacturaPeriodo]);

  const hayAlgo = (pagadoActual && facturaActual) || facturasHistorial.length > 0;

  if (!hayAlgo) {
    if (!pagadoActual) return null;
    return (
      <div className={portalCard}>
        <p className={`${portalCardTitle} mb-1`}>
          Factura del periodo
        </p>
        <p className="text-xs font-bold text-slate-500 leading-relaxed">
          Su pago está registrado. La factura en PDF aparecerá aquí cuando el despacho la publique.
        </p>
      </div>
    );
  }

  return (
    <div className={`${portalCard} space-y-4`}>
      <div>
        <p className={`${portalCardTitle} mb-1`}>
          Facturas · PDF
        </p>
        <p className="text-sm font-bold text-slate-600">
          Documentos fiscales de sus pagos confirmados
        </p>
      </div>

      {pagadoActual && facturaActual && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-2">
            {periodoLabel(periodoVista)}
          </p>
          <AccionesFacturaPdf factura={facturaActual} alturaVisor="h-64" />
        </div>
      )}

      {facturasHistorial.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-50">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Otros periodos
          </p>
          {facturasHistorial.map(({ label, factura }) => (
            <div key={factura.id}>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                {label} {periodoVista.anio}
              </p>
              <AccionesFacturaPdf factura={factura} alturaVisor="h-56" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
