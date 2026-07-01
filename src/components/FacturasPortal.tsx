"use client";

import { useMemo, useState } from "react";
import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  periodoKey,
  clienteActivoEnPeriodo,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import AccionesFacturaPdf from "@/components/AccionesFacturaPdf";
import {
  aniosVisiblesPortal,
  type FacturaPago,
  facturaPdfDisponible,
  facturaRegistrada,
} from "@/lib/facturas";
import { portalCard, portalCardTitle } from "@/components/portal/portal-ui";
import PillDeslizable from "@/components/ui/PillDeslizable";

type Props = {
  cliente: Cliente;
  periodoVista: Periodo;
};

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ExternalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

function FacturaInactiva() {
  const cls =
    "p-2 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed";
  return (
    <div
      className="flex items-center gap-1.5 shrink-0"
      title="Factura pendiente · será publicada por el despacho"
    >
      <span className={cls} aria-hidden>
        <EyeIcon />
      </span>
      <span className={cls} aria-hidden>
        <ExternalIcon />
      </span>
      <span className={cls} aria-hidden>
        <DownloadIcon />
      </span>
    </div>
  );
}

export default function FacturasPortal({ cliente, periodoVista }: Props) {
  const { getFacturaPeriodo, periodoHoy } = useClientes();

  const aniosTabs = aniosVisiblesPortal(periodoHoy.anio);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(
    aniosTabs.includes(periodoVista.anio) ? periodoVista.anio : periodoHoy.anio
  );
  const anioFinal = aniosTabs.includes(anioSeleccionado)
    ? anioSeleccionado
    : periodoHoy.anio;

  type FacturaRow = {
    periodo: Periodo;
    label: string;
    factura: FacturaPago | null;
    esMesActual: boolean;
  };

  // Mostramos todos los meses del año (hasta el mes en curso si es el año actual)
  // donde el cliente ya estaba activo. Los meses sin factura quedan en gris.
  const filasDelAnio = useMemo<FacturaRow[]>(() => {
    const items: FacturaRow[] = [];
    MESES_NOM.forEach((m, i) => {
      const p: Periodo = { mes: i, anio: anioFinal };
      if (!clienteActivoEnPeriodo(cliente, p)) return;
      if (
        anioFinal === periodoHoy.anio &&
        periodoKey(p) > periodoKey(periodoHoy)
      )
        return;
      const f = getFacturaPeriodo(cliente.id, p) ?? null;
      items.push({
        periodo: p,
        label: m,
        factura: f,
        esMesActual:
          p.mes === periodoVista.mes && p.anio === periodoVista.anio,
      });
    });
    return items.reverse();
  }, [cliente, anioFinal, periodoHoy, periodoVista, getFacturaPeriodo]);

  // Sólo render si el cliente estuvo activo en algún mes de cualquiera de los años visibles.
  const clienteTieneMesesVisibles = useMemo(() => {
    return aniosTabs.some((a) =>
      MESES_NOM.some((_m, i) => {
        const p: Periodo = { mes: i, anio: a };
        if (!clienteActivoEnPeriodo(cliente, p)) return false;
        if (
          a === periodoHoy.anio &&
          periodoKey(p) > periodoKey(periodoHoy)
        )
          return false;
        return true;
      })
    );
  }, [aniosTabs, cliente, periodoHoy]);
  if (!clienteTieneMesesVisibles) return null;

  return (
    <div className={`${portalCard} space-y-4`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className={`${portalCardTitle} mb-1`}>Facturas · PDF</p>
          <p className="text-sm font-bold text-slate-600">
            Documentos fiscales de sus pagos confirmados
          </p>
        </div>
        {aniosTabs.length > 1 && (
          <PillDeslizable
            opciones={aniosTabs.map((a) => ({
              value: String(a),
              label: String(a),
            }))}
            value={String(anioFinal)}
            onChange={(v) => setAnioSeleccionado(Number(v))}
            scrollable
          />
        )}
      </div>

      {filasDelAnio.length === 0 ? (
        <p className="text-[11px] font-bold text-slate-400 text-center py-6 leading-relaxed">
          Su cuenta aún no estaba activa en {anioFinal}.
        </p>
      ) : (
        <div className="space-y-1.5">
          {filasDelAnio.map(({ periodo: p, label, factura, esMesActual }) => {
            const tieneFactura = facturaRegistrada(factura);
            const pdfOk = facturaPdfDisponible(factura);
            const contenedorCls = tieneFactura
              ? esMesActual
                ? pdfOk
                  ? "border-indigo-200 bg-indigo-50/60"
                  : "border-slate-200 bg-slate-50/80"
                : pdfOk
                  ? "border-slate-100 bg-slate-50/60"
                  : "border-slate-200 bg-slate-50/50"
              : "border-slate-100 bg-slate-50/30 opacity-60";
            const labelCls = tieneFactura
              ? esMesActual
                ? pdfOk
                  ? "text-indigo-700"
                  : "text-slate-600"
                : "text-slate-700"
              : "text-slate-400";
            return (
              <div
                key={`${p.anio}-${p.mes}`}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border ${contenedorCls}`}
              >
                <span
                  className={`text-xs font-black uppercase tracking-tight truncate ${labelCls}`}
                >
                  {label}
                </span>
                {pdfOk && factura ? (
                  <AccionesFacturaPdf factura={factura} alturaVisor="h-56" />
                ) : tieneFactura ? (
                  <span
                    className="text-[9px] font-bold text-slate-500 text-right leading-snug max-w-[55%]"
                    title="Facturado · PDF archivado"
                  >
                    Facturado · PDF archivado
                  </span>
                ) : (
                  <FacturaInactiva />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
