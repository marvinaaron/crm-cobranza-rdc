"use client";

import { MESES_NOM, type Cliente, type Periodo } from "@/lib/clientes";
import {
  asegurarBloques,
  categoriaConPagoEnRegistro,
  documentoPdfDisponible,
  esSinPagoImpuestos,
  formatMontoImpuesto,
  getFechaLimiteCategoria,
  getSubtotalCategoria,
  parseFechaLimite,
  type RegistroCumplimiento,
  type TipoDocumentoSingular,
} from "@/lib/cumplimiento";
import { diasHastaLimite } from "@/lib/cumplimiento-fechas";
import { formatearDiaMesCorto } from "@/lib/portal/fechas-fiscales";
import { abrirPdfEnNuevaPestana } from "@/lib/pdf-blob";
import DropClasificarPdf, {
  type DestinoDropPdf,
} from "@/components/admin/DropClasificarPdf";

function claseFecha(fecha: string | null): string {
  if (!fecha) return "text-slate-400";
  const dias = diasHastaLimite(fecha);
  if (dias === null) return "text-slate-400";
  if (dias < 0) return "text-red-600";
  return "text-orange-600";
}

type DocMes = {
  tipo: "declaracion" | "impuestos";
  titulo: string;
  nombreArchivo?: string;
  dataUrl?: string;
};

function docsDelMes(reg: RegistroCumplimiento | undefined): DocMes[] {
  if (!reg) {
    return [
      { tipo: "declaracion", titulo: "Acuse" },
      { tipo: "impuestos", titulo: "Línea" },
    ];
  }
  const b = asegurarBloques(reg);
  const decl = b.federales.declaracion;
  const linea = b.federales.lineasCaptura[0];
  return [
    {
      tipo: "declaracion",
      titulo: "Acuse",
      nombreArchivo: documentoPdfDisponible(decl) ? decl?.nombreArchivo : undefined,
      dataUrl: documentoPdfDisponible(decl) ? decl?.dataUrl : undefined,
    },
    {
      tipo: "impuestos",
      titulo: "Línea",
      nombreArchivo: documentoPdfDisponible(linea?.documento)
        ? linea?.documento?.nombreArchivo
        : undefined,
      dataUrl: documentoPdfDisponible(linea?.documento)
        ? linea?.documento?.dataUrl
        : undefined,
    },
  ];
}

export default function FichaSatMeses({
  modo,
  cliente,
  anio,
  mesDefault,
  getCumplimientoPeriodo,
  onAbrirTipo,
  onCargar,
}: {
  modo: "historico" | "carpeta";
  cliente: Cliente;
  anio: number;
  mesDefault: number;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
  onAbrirTipo?: (tipo: TipoDocumentoSingular, periodo: Periodo) => void;
  onCargar?: (d: {
    file: File;
    tipo: TipoDocumentoSingular;
    periodo: Periodo;
  }) => void;
}) {
  const recibir = (d: DestinoDropPdf) => {
    if (!onCargar) return;
    if (d.tipoId !== "declaracion" && d.tipoId !== "impuestos") return;
    onCargar({ file: d.file, tipo: d.tipoId, periodo: d.periodo });
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold text-slate-500">
        SAT · {anio} · {modo === "carpeta" ? "documentos por mes" : "importes del año"}
      </p>
      {modo === "carpeta" && onCargar ? (
        <DropClasificarPdf
          anio={anio}
          mesDefault={mesDefault}
          opciones={[
            { id: "declaracion", label: "Declaración" },
            { id: "impuestos", label: "Línea de captura" },
          ]}
          onListo={recibir}
          etiqueta="Suelta un PDF"
          descripcion="Acuse o línea. Si no se entiende el nombre, eliges tipo y mes."
        />
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {MESES_NOM.map((label, mes) => {
          const periodo: Periodo = { mes, anio };
          const reg = getCumplimientoPeriodo(cliente.id, periodo);
          const sinPago = esSinPagoImpuestos(reg);
          const conPago = !!reg && categoriaConPagoEnRegistro(reg, "federales");
          const monto = conPago && reg ? getSubtotalCategoria(reg, "federales") : null;
          const fecha = conPago && reg ? getFechaLimiteCategoria(reg, "federales") : null;
          const dt = fecha ? parseFechaLimite(fecha) : null;
          const docs = docsDelMes(reg);
          const esActual = mes === mesDefault;
          return (
            <div
              key={label}
              className={`rounded-2xl border px-3 py-2.5 min-h-[7.5rem] flex flex-col ${
                esActual
                  ? "border-blue-200 bg-blue-50/60"
                  : "border-slate-100 bg-white"
              }`}
            >
              <p className="text-[11px] font-bold text-slate-700">{label}</p>
              {modo === "historico" ? (
                <>
                  {sinPago ? (
                    <p className="mt-1 text-[13px] font-bold text-slate-500">$0 · sin pago</p>
                  ) : monto != null ? (
                    <>
                      <p className="mt-1 text-[15px] font-bold tabular-nums text-slate-900">
                        {formatMontoImpuesto(monto)}
                      </p>
                      {dt ? (
                        <p className={`text-[11px] font-semibold tabular-nums ${claseFecha(fecha)}`}>
                          {formatearDiaMesCorto(dt)}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-1 text-[12px] font-medium text-slate-400">
                      Sin declaración
                    </p>
                  )}
                  <div className="mt-auto pt-2 flex flex-wrap gap-1">
                    {docs.map((d) => (
                      <span
                        key={d.tipo}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          d.dataUrl
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {d.titulo}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-1 flex-1">
                  {docs.map((d) =>
                    d.dataUrl ? (
                      <button
                        key={d.tipo}
                        type="button"
                        onClick={() => abrirPdfEnNuevaPestana(d.dataUrl!)}
                        className="w-full text-left rounded-lg bg-blue-600 text-white px-2 py-1.5 hover:bg-blue-700"
                      >
                        <span className="block text-[10px] font-bold">{d.titulo}</span>
                        <span className="block text-[9px] opacity-80 truncate">
                          {d.nombreArchivo}
                        </span>
                      </button>
                    ) : (
                      <button
                        key={d.tipo}
                        type="button"
                        onClick={() => onAbrirTipo?.(d.tipo, periodo)}
                        className="w-full text-left rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-400 hover:border-blue-300 hover:text-blue-700"
                      >
                        <span className="block text-[10px] font-bold">+ {d.titulo}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
