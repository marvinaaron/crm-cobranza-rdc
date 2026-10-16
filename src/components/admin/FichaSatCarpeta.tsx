"use client";

import { MESES_NOM, type Cliente, type Periodo } from "@/lib/clientes";
import {
  asegurarBloques,
  documentoPdfDisponible,
  type RegistroCumplimiento,
  type TipoDocumentoSingular,
} from "@/lib/cumplimiento";
import { abrirPdfEnNuevaPestana } from "@/lib/pdf-blob";
import DropClasificarPdf, {
  type DestinoDropPdf,
} from "@/components/admin/DropClasificarPdf";

type DocMes = {
  id: string;
  titulo: string;
  nombreArchivo: string;
  dataUrl: string;
};

export default function FichaSatCarpeta({
  cliente,
  anio,
  mesDefault,
  getCumplimientoPeriodo,
  onCargar,
}: {
  cliente: Cliente;
  anio: number;
  mesDefault: number;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
  onCargar: (d: {
    file: File;
    tipo: TipoDocumentoSingular;
    periodo: Periodo;
  }) => void;
}) {
  const meses = MESES_NOM.map((label, mes) => {
    const reg = getCumplimientoPeriodo(cliente.id, { mes, anio });
    const docs: DocMes[] = [];
    if (reg) {
      const b = asegurarBloques(reg);
      const decl = b.federales.declaracion;
      if (documentoPdfDisponible(decl) && decl) {
        docs.push({
          id: `decl-${mes}`,
          titulo: "Declaración",
          nombreArchivo: decl.nombreArchivo,
          dataUrl: decl.dataUrl,
        });
      }
      for (const l of b.federales.lineasCaptura) {
        if (documentoPdfDisponible(l.documento) && l.documento) {
          docs.push({
            id: `lin-${mes}-${l.id}`,
            titulo: l.etiqueta || "Línea de captura",
            nombreArchivo: l.documento.nombreArchivo,
            dataUrl: l.documento.dataUrl,
          });
        }
      }
    }
    return { mes, label, docs };
  });

  const hayAlgo = meses.some((m) => m.docs.length > 0);

  const recibir = (d: DestinoDropPdf) => {
    if (d.tipoId !== "declaracion" && d.tipoId !== "impuestos") return;
    onCargar({
      file: d.file,
      tipo: d.tipoId,
      periodo: d.periodo,
    });
  };

  return (
    <div className="space-y-4">
      <DropClasificarPdf
        anio={anio}
        mesDefault={mesDefault}
        opciones={[
          { id: "declaracion", label: "Declaración" },
          { id: "impuestos", label: "Línea de captura" },
        ]}
        onListo={recibir}
        etiqueta="Suelta PDFs de SAT"
        descripcion="Declaración o línea de captura. Si no se entiende el nombre, eliges tipo y mes."
      />
      {!hayAlgo ? (
        <p className="text-[12px] font-medium text-slate-400">
          Aún no hay acuses ni líneas de {anio} para {cliente.razonSocial}.
        </p>
      ) : (
        <div className="space-y-3">
          {meses
            .filter((m) => m.docs.length > 0)
            .map((m) => (
              <div key={m.mes}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  {m.label}
                </p>
                <div className="space-y-1.5">
                  {m.docs.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => abrirPdfEnNuevaPestana(doc.dataUrl)}
                      className="w-full flex items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2 text-left hover:bg-blue-50"
                    >
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold text-blue-800">
                          {doc.titulo}
                        </span>
                        <span className="block text-[10px] text-slate-500 truncate">
                          {doc.nombreArchivo}
                        </span>
                      </span>
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-blue-700">
                        Ver
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
