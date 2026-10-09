"use client";

import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import {
  formatFechaLimiteImpuesto,
  formatMontoImpuesto,
  DOCUMENTO_CUMPLIMIENTO_LABELS,
  registroTieneContenido,
  tieneResumenImpuestos,
  asegurarBloques,
  getTotalImpuestos,
} from "@/lib/cumplimiento";
import AccionesDocumentoPdf from "@/components/AccionesDocumentoPdf";

type Props = {
  cliente: Cliente;
  periodoVista: Periodo;
};

export default function CumplimientoPortal({ cliente, periodoVista }: Props) {
  const { getCumplimientoPeriodo } = useClientes();
  const registroRaw = getCumplimientoPeriodo(cliente.id, periodoVista);
  const registro = registroRaw ? asegurarBloques(registroRaw) : undefined;

  if (!registroTieneContenido(registroRaw)) {
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
          consultarla aquí.
        </p>
      </div>
    );
  }

  if (!registro) return null;

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

      {tieneResumenImpuestos(registro) && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-800 mb-2">
            Total a pagar
          </p>
          <p className="text-2xl font-black text-slate-800">
            {formatMontoImpuesto(getTotalImpuestos(registro))}
          </p>
          <p className="text-sm font-bold text-amber-700 mt-2">
            Fecha límite: {formatFechaLimiteImpuesto(registro.fechaLimite)}
          </p>
        </div>
      )}

      {registro.federales.declaracion && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-2">
            {DOCUMENTO_CUMPLIMIENTO_LABELS.declaracion}
          </p>
          <AccionesDocumentoPdf documento={registro.federales.declaracion} alturaVisor="h-56" />
        </div>
      )}

      {registro.federales.lineasCaptura
        .filter((l) => l.documento)
        .map((l) => (
          <div key={l.id}>
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-2">
              {l.etiqueta}
            </p>
            {l.documento && (
              <AccionesDocumentoPdf documento={l.documento} alturaVisor="h-56" />
            )}
          </div>
        ))}

      {registro.imss.sipare && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2">
            SIPARE
          </p>
          <AccionesDocumentoPdf documento={registro.imss.sipare} alturaVisor="h-56" />
        </div>
      )}

      {registro.imss.ema.map((doc) => (
        <div key={doc.id}>
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2">
            EMA
          </p>
          <AccionesDocumentoPdf documento={doc} alturaVisor="h-48" />
        </div>
      ))}

      {registro.imss.eba.map((doc) => (
        <div key={doc.id}>
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2">
            EBA
          </p>
          <AccionesDocumentoPdf documento={doc} alturaVisor="h-48" />
        </div>
      ))}

      {registro.estatales.nominas.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-violet-600 mb-2">
            {DOCUMENTO_CUMPLIMIENTO_LABELS.nomina}
          </p>
          <div className="space-y-2">
            {registro.estatales.nominas.map((doc) => (
              <AccionesDocumentoPdf key={doc.id} documento={doc} alturaVisor="h-48" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
