"use client";

import {
  type Cliente,
  type Periodo,
  periodoLabel,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import {
  formatFechaLimiteImpuesto,
  formatMontoImpuesto,
  DOCUMENTO_CUMPLIMIENTO_LABELS,
  registroTieneContenido,
  impuestosConMetadata,
} from "@/lib/cumplimiento";
import AccionesDocumentoPdf from "@/components/AccionesDocumentoPdf";

type Props = {
  cliente: Cliente;
  periodoVista: Periodo;
};

export default function CumplimientoPortal({ cliente, periodoVista }: Props) {
  const { getCumplimientoPeriodo } = useClientes();
  const registro = getCumplimientoPeriodo(cliente.id, periodoVista);

  if (!registroTieneContenido(registro)) {
    return (
      <div
        id="cumplimiento"
        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 scroll-mt-6"
      >
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Cumplimiento fiscal
        </p>
        <p className="text-xs font-bold text-slate-500 leading-relaxed">
          Cuando su despacho publique la documentación de {periodoLabel(periodoVista)}, podrá
          consultarla aquí (declaración, impuestos, IMSS y nómina).
        </p>
      </div>
    );
  }

  return (
    <div
      id="cumplimiento"
      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-5 scroll-mt-6"
    >
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Cumplimiento fiscal · Hacienda
        </p>
        <p className="text-sm font-bold text-slate-600">{periodoLabel(periodoVista)}</p>
      </div>

      {registro && impuestosConMetadata(registro) && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-800 mb-2">
            Pago de impuestos
          </p>
          <p className="text-2xl font-black text-slate-800">
            {formatMontoImpuesto(registro.montoImpuesto)}
          </p>
          <p className="text-sm font-bold text-amber-700 mt-2">
            Fecha límite: {formatFechaLimiteImpuesto(registro.fechaLimite)}
          </p>
        </div>
      )}

      {registro?.declaracion && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-2">
            {DOCUMENTO_CUMPLIMIENTO_LABELS.declaracion}
          </p>
          <AccionesDocumentoPdf documento={registro.declaracion} alturaVisor="h-56" />
        </div>
      )}

      {registro?.impuestos && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-2">
            {DOCUMENTO_CUMPLIMIENTO_LABELS.impuestos}
          </p>
          <AccionesDocumentoPdf documento={registro.impuestos} alturaVisor="h-56" />
        </div>
      )}

      {registro?.imss && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-2">
            {DOCUMENTO_CUMPLIMIENTO_LABELS.imss}
          </p>
          <AccionesDocumentoPdf documento={registro.imss} alturaVisor="h-56" />
        </div>
      )}

      {registro?.nomina && registro.nomina.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-2">
            {DOCUMENTO_CUMPLIMIENTO_LABELS.nomina}
          </p>
          <div className="space-y-2">
            {registro.nomina.map((doc) => (
              <AccionesDocumentoPdf key={doc.id} documento={doc} alturaVisor="h-48" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
