"use client";

import { type Cliente, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { usePeriodoFiscal } from "@/hooks/usePeriodoPortal";
import {
  DOCUMENTO_CUMPLIMIENTO_LABELS,
  type TipoDocumentoSingular,
  formatFechaLimiteImpuesto,
  formatMontoImpuesto,
  impuestosConMetadata,
  registroTieneContenido,
} from "@/lib/cumplimiento";
import AccionesDocumentoPdf from "@/components/AccionesDocumentoPdf";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import PortalStatCard from "@/components/portal/PortalStatCard";
import { portalPage } from "@/components/portal/portal-ui";

const COLUMNAS: { tipo: TipoDocumentoSingular | "nomina"; label: string }[] = [
  { tipo: "declaracion", label: DOCUMENTO_CUMPLIMIENTO_LABELS.declaracion },
  { tipo: "impuestos", label: DOCUMENTO_CUMPLIMIENTO_LABELS.impuestos },
  { tipo: "imss", label: DOCUMENTO_CUMPLIMIENTO_LABELS.imss },
  { tipo: "nomina", label: DOCUMENTO_CUMPLIMIENTO_LABELS.nomina },
];

type Props = {
  cliente: Cliente;
};

export default function PortalCumplimientoVista({ cliente }: Props) {
  const { getCumplimientoPeriodo } = useClientes();
  const {
    periodoVista,
    periodoFiscalVigente,
    esPeriodoVigente,
    irAPeriodoFiscalVigente,
  } = usePeriodoFiscal();
  const registro = getCumplimientoPeriodo(cliente.id, periodoVista);
  const tieneImpuestos = registro && impuestosConMetadata(registro);

  return (
    <div className={portalPage}>
      <PortalPageHeader
        eyebrow="Mi cuenta"
        title="Cumplimiento"
        subtitle={`Hacienda · SAT · ${periodoLabel(periodoVista)}${!esPeriodoVigente ? " · periodo anterior" : ""}`}
        actions={
          !esPeriodoVigente ? (
            <button
              type="button"
              onClick={irAPeriodoFiscalVigente}
              className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800"
            >
              Periodo vigente
            </button>
          ) : undefined
        }
      />

      {tieneImpuestos && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PortalStatCard
            label="Pago de impuestos SAT"
            value={formatMontoImpuesto(registro!.montoImpuesto)}
            sub={`Fecha límite: ${formatFechaLimiteImpuesto(registro!.fechaLimite)}`}
            color="text-amber-700"
            bg="bg-amber-50 border-amber-100"
          />
          <PortalStatCard
            label="Periodo fiscal"
            value={periodoLabel(esPeriodoVigente ? periodoFiscalVigente : periodoVista)}
            sub={
              esPeriodoVigente
                ? "Mes vencido en curso · documentación del contador"
                : "Consulta de periodo anterior"
            }
            color="text-indigo-600"
            bg="bg-indigo-50 border-indigo-100"
          />
        </div>
      )}

      {!registroTieneContenido(registro) ? (
        <PortalSection>
          <p className="text-sm font-bold text-slate-500 leading-relaxed text-center py-4">
            Aún no hay documentación publicada para {periodoLabel(periodoVista)}. Cuando su
            contador la cargue, podrá consultarla y descargarla aquí.
          </p>
        </PortalSection>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COLUMNAS.map(({ tipo, label }) => {
            if (tipo === "nomina") {
              const archivos = registro?.nomina ?? [];
              return (
                <PortalSection key="nomina" title={label} className="md:col-span-2">
                  {archivos.length === 0 ? (
                    <p className="text-xs font-bold text-slate-400">
                      Sin archivos publicados.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {archivos.map((doc) => (
                        <AccionesDocumentoPdf key={doc.id} documento={doc} alturaVisor="h-48" />
                      ))}
                    </div>
                  )}
                </PortalSection>
              );
            }

            const doc = registro?.[tipo];
            return (
              <PortalSection key={tipo} title={label}>
                {doc ? (
                  <AccionesDocumentoPdf documento={doc} alturaVisor="h-52" />
                ) : (
                  <p className="text-xs font-bold text-slate-400 py-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                    Pendiente de publicación por el despacho.
                  </p>
                )}
              </PortalSection>
            );
          })}
        </div>
      )}
    </div>
  );
}
