"use client";

import { type Cliente, type Periodo } from "@/lib/clientes";
import {
  asegurarBloques,
  documentoPdfDisponible,
  type RegistroCumplimiento,
  type TipoDocumentoSingular,
} from "@/lib/cumplimiento";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import DropClasificarPdf, {
  type DestinoDropPdf,
} from "@/components/admin/DropClasificarPdf";

type PdfFila = {
  key: string;
  titulo: string;
  dataUrl: string;
};

function primerNombre(razon: string): string {
  return razon.trim().split(/\s+/)[0] || "Cliente";
}

function tituloEstiloFinder(
  mes: number,
  anio: number,
  nombre: string,
  tipo: "Declaracion" | "Impuestos",
  nombreArchivo?: string
): string {
  if (nombreArchivo?.trim()) return nombreArchivo.trim();
  const mm = String(mes + 1).padStart(2, "0");
  return `${mm} ${nombre} ${tipo} ${anio}.pdf`;
}

function pdfsDelAnio(
  cliente: Cliente,
  anio: number,
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined
): PdfFila[] {
  const nombre = primerNombre(cliente.razonSocial);
  const out: PdfFila[] = [];
  for (let mes = 0; mes < 12; mes++) {
    const periodo: Periodo = { mes, anio };
    const reg = getCumplimientoPeriodo(cliente.id, periodo);
    if (!reg) continue;
    const b = asegurarBloques(reg);
    const decl = b.federales.declaracion;
    if (documentoPdfDisponible(decl) && decl?.dataUrl) {
      out.push({
        key: `decl-${mes}`,
        titulo: tituloEstiloFinder(mes, anio, nombre, "Declaracion", decl.nombreArchivo),
        dataUrl: decl.dataUrl,
      });
    }
    const linea = b.federales.lineasCaptura[0]?.documento;
    if (documentoPdfDisponible(linea) && linea?.dataUrl) {
      out.push({
        key: `imp-${mes}`,
        titulo: tituloEstiloFinder(mes, anio, nombre, "Impuestos", linea.nombreArchivo),
        dataUrl: linea.dataUrl,
      });
    }
    (reg.extemporaneo?.federales?.lineas ?? []).forEach((l, i) => {
      const doc = l.documento;
      if (!documentoPdfDisponible(doc) || !doc?.dataUrl) return;
      out.push({
        key: `ext-${mes}-${l.id}-${i}`,
        titulo:
          doc.nombreArchivo?.trim() ||
          `${String(mes + 1).padStart(2, "0")} ${nombre} Impuestos Ext ${anio}.pdf`,
        dataUrl: doc.dataUrl,
      });
    });
  }
  return out;
}

function IconoPdf() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-600 shrink-0"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconoDescarga() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

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
  onAbrirTipo?: (tipo: TipoDocumentoSingular, periodo: Periodo) => void;
}) {
  const recibir = (d: DestinoDropPdf) => {
    if (d.tipoId !== "declaracion" && d.tipoId !== "impuestos") return;
    onCargar({ file: d.file, tipo: d.tipoId, periodo: d.periodo });
  };
  const pdfs = pdfsDelAnio(cliente, anio, getCumplimientoPeriodo);

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold text-slate-500">SAT · {anio} · PDFs</p>
      <DropClasificarPdf
        anio={anio}
        mesDefault={mesDefault}
        opciones={[
          { id: "declaracion", label: "Declaración" },
          { id: "impuestos", label: "Impuestos" },
        ]}
        onListo={recibir}
        etiqueta="Suelta un PDF"
        descripcion="01 Carolina Declaracion 2026 · o Impuestos."
      />
      {pdfs.length === 0 ? (
        <p className="text-[12px] font-medium text-slate-400 px-1 py-6 text-center">
          Aún no hay PDFs de este año.
        </p>
      ) : (
        <ul className="rounded-2xl border border-slate-100 bg-white overflow-hidden divide-y divide-slate-100">
          {pdfs.map((p) => (
            <li key={p.key} className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => abrirPdfEnNuevaPestana(p.dataUrl)}
                className="min-w-0 flex-1 flex items-center gap-2 text-left hover:opacity-80"
                title={p.titulo}
              >
                <IconoPdf />
                <span className="text-[12px] font-semibold text-slate-800 truncate">
                  {p.titulo}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Descargar ${p.titulo}`}
                onClick={() => descargarArchivo(p.dataUrl, p.titulo)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center shrink-0"
              >
                <IconoDescarga />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
