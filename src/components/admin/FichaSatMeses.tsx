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
      { tipo: "declaracion", titulo: "Declaración" },
      { tipo: "impuestos", titulo: "Impuestos" },
    ];
  }
  const b = asegurarBloques(reg);
  const decl = b.federales.declaracion;
  const linea = b.federales.lineasCaptura[0];
  return [
    {
      tipo: "declaracion",
      titulo: "Declaración",
      nombreArchivo: documentoPdfDisponible(decl) ? decl?.nombreArchivo : undefined,
      dataUrl: documentoPdfDisponible(decl) ? decl?.dataUrl : undefined,
    },
    {
      tipo: "impuestos",
      titulo: "Impuestos",
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
            { id: "impuestos", label: "Impuestos" },
          ]}
          onListo={recibir}
          etiqueta="Suelta un PDF"
          descripcion="09 Nombre Declaración 2026 · o Impuestos. Si no se entiende, eliges tipo y mes."
        />
      ) : null}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden divide-y divide-slate-100">
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
              className={`flex items-center gap-2 px-3 py-2 min-h-[2.75rem] ${
                esActual ? "bg-blue-50/80" : "bg-white"
              }`}
            >
              <p className="w-[4.75rem] shrink-0 text-[12px] font-bold text-slate-800">
                {label}
              </p>
              <div className="min-w-0 flex-1">
                {sinPago ? (
                  <p className="text-[12px] font-bold text-slate-500">$0 · sin pago</p>
                ) : monto != null ? (
                  <p className="text-[13px] font-bold tabular-nums text-slate-900 leading-tight">
                    {formatMontoImpuesto(monto)}
                    {dt ? (
                      <span className={`ml-1.5 text-[11px] font-semibold ${claseFecha(fecha)}`}>
                        {formatearDiaMesCorto(dt)}
                      </span>
                    ) : null}
                  </p>
                ) : (
                  <p className="text-[11px] font-medium text-slate-400">Sin declaración</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                {docs.map((d) => {
                  const activo = !!d.dataUrl;
                  const puedeAbrir = modo === "carpeta" || activo;
                  const cls = `text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    activo ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                  }`;
                  if (!puedeAbrir) {
                    return (
                      <span key={d.tipo} className={cls}>
                        {d.titulo}
                      </span>
                    );
                  }
                  return (
                    <button
                      key={d.tipo}
                      type="button"
                      title={d.nombreArchivo || d.titulo}
                      onClick={() => {
                        if (d.dataUrl) abrirPdfEnNuevaPestana(d.dataUrl);
                        else onAbrirTipo?.(d.tipo, periodo);
                      }}
                      className={`${cls} ${activo ? "hover:bg-blue-700" : "hover:border-blue-300 hover:text-blue-700"}`}
                    >
                      {d.titulo}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
