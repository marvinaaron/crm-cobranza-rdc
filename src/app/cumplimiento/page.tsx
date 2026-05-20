"use client";

import { useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import {
  type Cliente,
  type Periodo,
  periodoLabel,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
} from "@/lib/clientes";
import {
  type TipoDocumentoSingular,
  estadoCumplimientoCliente,
  puedeNotificarCumplimiento,
  formatMontoImpuesto,
  formatFechaLimiteImpuesto,
  formatFechaLimiteImpuestoCorta,
  contarArchivosNomina,
  getSubtotalCategoria,
  getFechaLimiteCategoria,
  categoriaConPagoEnRegistro,
  clienteConfirmoPreview,
  tieneResumenImpuestos,
  adminPuedeSubirPdf,
  documentoAdminCargado,
  asegurarBloques,
  getFlujoCumplimiento,
  FLUJO_CUMPLIMIENTO_LABELS,
  previewPublicado,
  periodoVencidoSinPago,
  CATEGORIA_META,
  EMA_NOMBRE_LARGO,
  EBA_NOMBRE_LARGO,
  type CategoriaId,
} from "@/lib/cumplimiento";
import {
  categoriasHabilitadasCliente,
  categoriaAplicaCliente,
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";
import ModalExtemporaneo from "@/components/ModalExtemporaneo";
import {
  abrirCorreoCumplimientoListo,
  abrirCorreoRecordatorioLimite,
  copiarCorreoCumplimientoHtml,
} from "@/lib/correo-cumplimiento";
import { isValidEmail } from "@/lib/email";
import ModalSubirCumplimiento from "@/components/ModalSubirCumplimiento";
import ModalSubirNomina from "@/components/ModalSubirNomina";
import ModalPrevisImpuestos from "@/components/ModalPrevisImpuestos";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);

type ModalDoc = {
  cliente: Cliente;
  periodo: Periodo;
  tipo: TipoDocumentoSingular;
  lineaId?: string;
  slotIndex?: number;
};

type ModalNomina = {
  cliente: Cliente;
  periodo: Periodo;
  modo: "nomina";
};

const ESTADO_CHIP: Record<
  ReturnType<typeof estadoCumplimientoCliente>,
  { label: string; clase: string }
> = {
  pendiente: { label: "Sin impuestos", clase: "bg-slate-100 text-slate-500" },
  parcial: { label: "Impuestos incompletos", clase: "bg-amber-100 text-amber-700" },
  listo: { label: "Listo", clase: "bg-emerald-100 text-emerald-700" },
  notificado: { label: "Notificado", clase: "bg-indigo-100 text-indigo-700" },
};

function chipDocumento(cargado: boolean, variante: "default" | "federales" = "default") {
  if (variante === "federales") {
    return cargado
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100";
  }
  return cargado
    ? "bg-indigo-600 text-white hover:bg-indigo-700"
    : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100";
}

const COLS_TABLA = 16;
/** Separador vertical entre grupos de columnas (tenue). */
const SEP_GRUPO = "border-l border-slate-200";

function BotonPdf({
  cargado,
  habilitado,
  etiqueta,
  variante = "default",
  onClick,
}: {
  cargado: boolean;
  habilitado: boolean;
  etiqueta?: string;
  variante?: "default" | "federales";
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!habilitado}
      title={!habilitado ? "Espere validación del cliente" : undefined}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${
        !habilitado
          ? "bg-slate-50 text-slate-300 cursor-not-allowed"
          : chipDocumento(cargado, variante)
      }`}
    >
      <PdfIcon />
      {etiqueta ?? (cargado ? "PDF" : "Subir")}
    </button>
  );
}

function CeldaMontoLimite({
  reg,
  cat,
  aplica,
  conPago,
  borderClass = "border-l border-slate-50",
}: {
  reg: import("@/lib/cumplimiento").RegistroCumplimiento | undefined;
  cat: CategoriaId;
  aplica: boolean;
  conPago: boolean;
  borderClass?: string;
}) {
  if (!aplica) {
    return (
      <td className={`px-2 py-6 text-center ${borderClass}`}>
        <span className="text-[8px] font-bold text-slate-300">N/A</span>
      </td>
    );
  }
  if (!reg || !conPago) {
    return (
      <td className={`px-2 py-6 text-center ${borderClass}`}>
        <span className="text-[8px] font-bold text-slate-300">—</span>
      </td>
    );
  }
  const monto = getSubtotalCategoria(reg, cat);
  const fecha = getFechaLimiteCategoria(reg, cat);
  return (
    <td className={`px-2 py-6 min-w-[108px] ${borderClass}`}>
      <p className="text-xs font-black text-slate-800 tabular-nums">
        {formatMontoImpuesto(monto)}
      </p>
      {fecha ? (
        <p className="text-[9px] font-bold text-amber-600 mt-0.5 leading-snug">
          {formatFechaLimiteImpuestoCorta(fecha)}
        </p>
      ) : null}
    </td>
  );
}

function BotonNotificar({
  puede,
  emailOk,
  title,
  onClick,
}: {
  puede: boolean;
  emailOk: boolean;
  title: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      disabled={!puede || !emailOk}
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-full transition-all ${
        puede && emailOk
          ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          : "bg-slate-50 text-slate-300 cursor-not-allowed"
      }`}
    >
      <MailIcon />
    </button>
  );
}

export default function CumplimientoPage() {
  const {
    listaClientes,
    periodo,
    getCumplimientoPeriodo,
    marcarCumplimientoNotificado,
    marcarRecordatorioLimiteEnviado,
    eliminarPreviewImpuestos,
  } = useClientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalDoc, setModalDoc] = useState<ModalDoc | null>(null);
  const [modalNomina, setModalNomina] = useState<ModalNomina | null>(null);
  const [modalPrevio, setModalPrevio] = useState<{ cliente: Cliente; periodo: Periodo } | null>(null);
  const [modalExtemp, setModalExtemp] = useState<{
    cliente: Cliente;
    periodo: Periodo;
    categoria: CategoriaId;
  } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [htmlCopiado, setHtmlCopiado] = useState(false);

  const mesLabel = periodoLabel(periodo);

  const clientes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return listaClientes
      .filter((c) => c.activo && !esIngresoGeneralCliente(c))
      .filter((c) => clienteActivoEnPeriodo(c, periodo))
      .filter(
        (c) =>
          !q ||
          c.razonSocial.toLowerCase().includes(q) ||
          c.rfc.toLowerCase().includes(q)
      )
      .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial, "es"));
  }, [listaClientes, periodo, searchTerm]);

  const resumen = useMemo(() => {
    let listos = 0;
    let notificados = 0;
    clientes.forEach((c) => {
      const reg = getCumplimientoPeriodo(c.id, periodo);
      const est = estadoCumplimientoCliente(reg);
      if (est === "listo" || est === "notificado") listos++;
      if (est === "notificado") notificados++;
    });
    return { total: clientes.length, listos, notificados };
  }, [clientes, periodo, getCumplimientoPeriodo]);

  const abrirModalDoc = (
    e: React.MouseEvent,
    cliente: Cliente,
    tipo: TipoDocumentoSingular,
    lineaId?: string,
    slotIndex?: number
  ) => {
    e.stopPropagation();
    const reg = getCumplimientoPeriodo(cliente.id, periodo);
    if (!adminPuedeSubirPdf(reg, tipo)) return;
    if (tipo === "imss") {
      setModalDoc({ cliente, periodo, tipo: "sipare", lineaId, slotIndex });
      return;
    }
    setModalDoc({ cliente, periodo, tipo, lineaId, slotIndex });
  };

  const abrirModalPrevio = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation();
    setModalPrevio({ cliente, periodo });
  };

  const abrirModalNomina = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation();
    setModalNomina({ cliente, periodo, modo: "nomina" });
  };

  const enviarNotificacionTotal = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation();
    const reg = getCumplimientoPeriodo(cliente.id, periodo);
    if (!reg) return;
    const cats = categoriasConPagoEnPreview(cliente, asegurarBloques(reg));
    if (cats.length === 0) return;
    if (!clienteConfirmoPreview(reg)) {
      window.alert("El cliente aún no ha validado el previo de impuestos.");
      return;
    }
    if (!cliente.email?.trim() || !isValidEmail(cliente.email)) {
      window.alert("Este cliente no tiene un correo válido en su expediente.");
      return;
    }
    const ok = abrirCorreoCumplimientoListo(cliente, periodo, reg, undefined, {
      categorias: cats,
    });
    if (
      ok &&
      puedeNotificarCumplimiento(reg, categoriasHabilitadasCliente(cliente))
    ) {
      marcarCumplimientoNotificado(cliente.id, periodo);
    }
  };

  const copiarHtml = async (cliente: Cliente) => {
    const reg = getCumplimientoPeriodo(cliente.id, periodo);
    if (!reg) return;
    const cats = categoriasConPagoEnPreview(cliente, asegurarBloques(reg));
    const opts = cats.length > 0 ? { categorias: cats } : undefined;
    if (!opts || !puedeNotificarCumplimiento(reg, categoriasHabilitadasCliente(cliente)))
      return;
    await copiarCorreoCumplimientoHtml(cliente, periodo, reg, undefined, opts);
    setHtmlCopiado(true);
    setTimeout(() => setHtmlCopiado(false), 2000);
  };

  return (
    <div className="space-y-8 -m-8 p-8 min-h-screen bg-[#F8FAFC]">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">
            Hacienda · SAT
          </p>
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight">
            Cumplimiento
          </h1>
          <p className="text-slate-400 font-bold text-sm mt-2">
            {mesLabel} · Periodo fiscal (mes vencido) · Documentación por cliente
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="px-5 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Clientes</p>
            <p className="text-xl font-black text-slate-800">{resumen.total}</p>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">Listos</p>
            <p className="text-xl font-black text-emerald-700">{resumen.listos}</p>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-100">
            <p className="text-[8px] font-black uppercase text-indigo-600 tracking-widest">Notificados</p>
            <p className="text-xl font-black text-indigo-700">{resumen.notificados}</p>
          </div>
        </div>
      </header>

      <div className="relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
          <SearchIcon />
        </span>
        <input
          type="search"
          placeholder="Buscar por razón social o RFC…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-white text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th
                  rowSpan={2}
                  className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 align-bottom"
                >
                  Cliente
                </th>
                <th
                  rowSpan={2}
                  className="px-3 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center align-bottom"
                >
                  Flujo
                </th>
                <th
                  rowSpan={2}
                  className="px-3 py-4 text-[9px] font-black uppercase tracking-widest text-amber-600 text-center align-bottom"
                >
                  Previo
                </th>
                <th
                  colSpan={3}
                  className={`px-3 py-2 text-[8px] font-black uppercase tracking-widest text-blue-600 text-center bg-blue-50/60 ${SEP_GRUPO}`}
                >
                  {CATEGORIA_META.federales.label}
                </th>
                <th
                  colSpan={4}
                  className={`px-3 py-2 text-[8px] font-black uppercase tracking-widest text-emerald-700 text-center bg-emerald-50/60 ${SEP_GRUPO}`}
                >
                  {CATEGORIA_META.imss.label}
                </th>
                <th
                  colSpan={3}
                  className={`px-3 py-2 text-[8px] font-black uppercase tracking-widest text-violet-700 text-center bg-violet-50/60 ${SEP_GRUPO}`}
                >
                  {CATEGORIA_META.estatales.label}
                </th>
                <th
                  rowSpan={2}
                  className={`px-3 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center align-bottom ${SEP_GRUPO}`}
                >
                  Otros
                </th>
                <th
                  colSpan={2}
                  className={`px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-600 text-center bg-slate-50/80 ${SEP_GRUPO}`}
                >
                  Total general
                </th>
              </tr>
              <tr className="border-b border-slate-50">
                <th className={`px-2 py-3 text-[8px] font-black uppercase tracking-widest text-blue-600 text-center ${SEP_GRUPO}`}>
                  Declaración
                </th>
                <th className="px-2 py-3 text-[8px] font-black uppercase tracking-widest text-blue-600 text-center">
                  Impuestos
                </th>
                <th className="px-2 py-3 text-[7px] font-black uppercase tracking-widest text-blue-600 text-center">
                  Monto
                </th>
                <th className={`px-2 py-3 text-[8px] font-black uppercase tracking-widest text-emerald-700 text-center ${SEP_GRUPO}`}>
                  SIPARE
                </th>
                <th
                  className="px-2 py-3 text-[8px] font-black uppercase tracking-widest text-emerald-700 text-center"
                  title={EMA_NOMBRE_LARGO}
                >
                  EMA
                </th>
                <th
                  className="px-2 py-3 text-[8px] font-black uppercase tracking-widest text-emerald-700 text-center"
                  title={EBA_NOMBRE_LARGO}
                >
                  EBA
                </th>
                <th className="px-2 py-3 text-[7px] font-black uppercase tracking-widest text-emerald-700 text-center">
                  Monto
                </th>
                <th className={`px-2 py-3 text-[8px] font-black uppercase tracking-widest text-violet-700 text-center ${SEP_GRUPO}`}>
                  Nómina
                </th>
                <th className="px-2 py-3 text-[8px] font-black uppercase tracking-widest text-violet-700 text-center">
                  Línea captura
                </th>
                <th className="px-2 py-3 text-[7px] font-black uppercase tracking-widest text-violet-700 text-center">
                  Monto
                </th>
                <th className={`px-2 py-3 text-[7px] font-black uppercase tracking-widest text-slate-600 text-center ${SEP_GRUPO}`}>
                  Monto
                </th>
                <th className="px-1 py-3 text-[7px] font-black uppercase tracking-widest text-slate-600 text-center">
                  Mail
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.length > 0 ? (
                clientes.map((cli) => {
                  const reg = getCumplimientoPeriodo(cli.id, periodo);
                  const regB = reg ? asegurarBloques(reg) : undefined;
                  const flujo = getFlujoCumplimiento(reg);
                  const est = estadoCumplimientoCliente(reg);
                  const chip = ESTADO_CHIP[est];
                  const puedePdf = (tipo: TipoDocumentoSingular) => adminPuedeSubirPdf(reg, tipo);
                  const emailOk = !!cli.email?.trim() && isValidEmail(cli.email);
                  const nNomina = contarArchivosNomina(reg);
                  const fedOn = categoriaAplicaCliente(cli, "federales");
                  const imssOn =
                    categoriaAplicaCliente(cli, "imss") && !!regB?.imss.activo;
                  const estOn =
                    categoriaAplicaCliente(cli, "estatales") && !!regB?.estatales.activo;
                  const fedPago = fedOn && !!reg && categoriaConPagoEnRegistro(reg, "federales");
                  const imssPago = imssOn && !!reg && categoriaConPagoEnRegistro(reg, "imss");
                  const estPago = estOn && !!reg && categoriaConPagoEnRegistro(reg, "estatales");
                  const catsPago = reg
                    ? categoriasConPagoEnPreview(cli, asegurarBloques(reg))
                    : [];
                  const nEma = regB?.imss.ema.length ?? 0;
                  const nEba = regB?.imss.eba.length ?? 0;
                  const lineasFed = regB?.federales.lineasCaptura ?? [];
                  const lineasEst = regB?.estatales.lineasCaptura ?? [];
                  const totalGeneral = catsPago.reduce(
                    (s, cat) => s + getSubtotalCategoria(reg!, cat),
                    0
                  );

                  return (
                    <tr
                      key={cli.id}
                      onClick={() => setSelectedClient(cli)}
                      className="group border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-6">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                          {cli.razonSocial}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{cli.rfc}</p>
                      </td>
                      <td className="px-3 py-6 text-center">
                        <span className="inline-flex px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 max-w-[100px] leading-tight">
                          {FLUJO_CUMPLIMIENTO_LABELS[flujo]}
                        </span>
                      </td>
                      <td className="px-3 py-6 text-center">
                        <button
                          type="button"
                          onClick={(e) => abrirModalPrevio(e, cli)}
                          className={`inline-flex px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            previewPublicado(reg)
                              ? clienteConfirmoPreview(reg)
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                              : "bg-amber-50 text-amber-600 border border-amber-200"
                          }`}
                        >
                          {previewPublicado(reg)
                            ? clienteConfirmoPreview(reg)
                              ? "Validado"
                              : "Pendiente"
                            : "Publicar"}
                        </button>
                      </td>
                      {/* Impuestos federales */}
                      <td className={`px-2 py-6 text-center ${SEP_GRUPO}`}>
                        {!fedOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={documentoAdminCargado(reg, "declaracion")}
                            habilitado={puedePdf("declaracion")}
                            variante="federales"
                            onClick={(e) => abrirModalDoc(e, cli, "declaracion")}
                          />
                        )}
                      </td>
                      <td className="px-2 py-6 text-center">
                        {!fedOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : lineasFed.length === 0 ? (
                          <span className="text-[8px] font-bold text-slate-300">—</span>
                        ) : (
                          <div className="flex flex-col gap-1 items-center">
                            {lineasFed.map((l) => (
                              <BotonPdf
                                key={l.id}
                                cargado={!!l.documento}
                                habilitado={puedePdf("impuestos")}
                                variante="federales"
                                etiqueta={l.documento ? "PDF" : l.etiqueta.slice(0, 8)}
                                onClick={(e) =>
                                  abrirModalDoc(e, cli, "impuestos", l.id)
                                }
                              />
                            ))}
                          </div>
                        )}
                      </td>
                      <CeldaMontoLimite
                        reg={reg}
                        cat="federales"
                        aplica={fedOn}
                        conPago={!!fedPago}
                        borderClass={SEP_GRUPO}
                      />
                      {/* IMSS */}
                      <td className={`px-2 py-6 text-center ${SEP_GRUPO}`}>
                        {!imssOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={documentoAdminCargado(reg, "sipare")}
                            habilitado={puedePdf("sipare")}
                            onClick={(e) => abrirModalDoc(e, cli, "sipare")}
                          />
                        )}
                      </td>
                      <td className="px-2 py-6 text-center">
                        {!imssOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={nEma > 0}
                            habilitado={puedePdf("ema")}
                            etiqueta={nEma > 0 ? (nEma > 1 ? `${nEma} PDF` : "PDF") : "Subir"}
                            onClick={(e) => abrirModalDoc(e, cli, "ema", undefined, 0)}
                          />
                        )}
                      </td>
                      <td className="px-2 py-6 text-center">
                        {!imssOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={nEba > 0}
                            habilitado={puedePdf("eba")}
                            etiqueta={nEba > 0 ? (nEba > 1 ? `${nEba} PDF` : "PDF") : "Subir"}
                            onClick={(e) => abrirModalDoc(e, cli, "eba", undefined, 0)}
                          />
                        )}
                      </td>
                      <CeldaMontoLimite
                        reg={reg}
                        cat="imss"
                        aplica={imssOn}
                        conPago={!!imssPago}
                        borderClass={SEP_GRUPO}
                      />
                      {/* Impuestos estatales */}
                      <td className={`px-2 py-6 text-center ${SEP_GRUPO}`}>
                        {!estOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => abrirModalNomina(e, cli)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${chipDocumento(nNomina > 0)}`}
                          >
                            <PdfIcon />
                            {nNomina > 0 ? `${nNomina} arch.` : "Subir"}
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-6 text-center">
                        {!estOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : lineasEst.length === 0 ? (
                          <span className="text-[8px] font-bold text-slate-300">—</span>
                        ) : (
                          <div className="flex flex-col gap-1 items-center">
                            {lineasEst.map((l) => (
                              <BotonPdf
                                key={l.id}
                                cargado={!!l.documento}
                                habilitado={puedePdf("estatales")}
                                etiqueta={l.documento ? "PDF" : "Línea"}
                                onClick={(e) =>
                                  abrirModalDoc(e, cli, "estatales", l.id)
                                }
                              />
                            ))}
                          </div>
                        )}
                      </td>
                      <CeldaMontoLimite
                        reg={reg}
                        cat="estatales"
                        aplica={estOn}
                        conPago={!!estPago}
                        borderClass={SEP_GRUPO}
                      />
                      <td className={`px-3 py-6 text-center ${SEP_GRUPO}`}>
                        {!categoriaAplicaCliente(cli, "federales") &&
                        !categoriaAplicaCliente(cli, "imss") &&
                        !categoriaAplicaCliente(cli, "estatales") ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={documentoAdminCargado(reg, "otros")}
                            habilitado={puedePdf("otros")}
                            onClick={(e) => abrirModalDoc(e, cli, "otros")}
                          />
                        )}
                      </td>
                      <td className={`px-3 py-6 min-w-[120px] bg-slate-50/40 ${SEP_GRUPO}`}>
                        {catsPago.length > 0 && reg ? (
                          <p className="text-sm font-black text-slate-900 tabular-nums">
                            {formatMontoImpuesto(totalGeneral)}
                          </p>
                        ) : (
                          <span className="text-[8px] font-bold text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-2 py-6 text-center bg-slate-50/40">
                        {catsPago.length > 0 ? (
                          <BotonNotificar
                            puede={
                              !!reg &&
                              clienteConfirmoPreview(reg) &&
                              emailOk
                            }
                            emailOk={emailOk}
                            title={
                              !reg || !clienteConfirmoPreview(reg)
                                ? "Espere validación del previo por el cliente"
                                : catsPago.length === 1
                                  ? `Notificar ${CATEGORIA_META[catsPago[0]!].label}`
                                  : "Notificar desglose por concepto (federales, IMSS, estatales)"
                            }
                            onClick={(e) => enviarNotificacionTotal(e, cli)}
                          />
                        ) : (
                          <span className="text-[8px] font-bold text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={COLS_TABLA}
                    className="px-10 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]"
                  >
                    No hay clientes activos en {mesLabel}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClient && (
        <div className="fixed inset-0 z-[45] flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setSelectedClient(null)}
          />
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto p-8">
            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="text-[9px] font-black uppercase text-slate-400 hover:text-red-500 mb-6"
            >
              Cerrar
            </button>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1">
              {selectedClient.razonSocial}
            </h2>
            <p className="text-[10px] font-mono text-slate-400 mb-6">{selectedClient.rfc}</p>

            {selectedClient.email && (
              <p className="text-[11px] font-bold text-indigo-500 mb-4">{selectedClient.email}</p>
            )}

            <button
              type="button"
              onClick={(e) => abrirModalPrevio(e, selectedClient)}
              className="w-full py-3.5 mb-2 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700"
            >
              {previewPublicado(getCumplimientoPeriodo(selectedClient.id, periodo))
                ? "Editar previo de impuestos"
                : "Paso 1 · Publicar previo de impuestos"}
            </button>
            {previewPublicado(getCumplimientoPeriodo(selectedClient.id, periodo)) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    !window.confirm(
                      "¿Eliminar el previo? El cliente dejará de ver el importe y se quitarán los PDFs de este periodo."
                    )
                  ) {
                    return;
                  }
                  eliminarPreviewImpuestos(selectedClient.id, periodo);
                }}
                className="w-full py-2 mb-4 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700"
              >
                Eliminar previo publicado
              </button>
            )}

            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Paso 2 · PDFs · {mesLabel}
            </p>
            <div className="flex flex-col gap-4 mb-6">
              {categoriaAplicaCliente(selectedClient, "federales") && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3 space-y-2">
                  <p className="text-[8px] font-black uppercase text-blue-700 tracking-widest">
                    {CATEGORIA_META.federales.label}
                  </p>
                  <button
                    type="button"
                    disabled={
                      !adminPuedeSubirPdf(
                        getCumplimientoPeriodo(selectedClient.id, periodo),
                        "declaracion"
                      )
                    }
                    onClick={(e) => abrirModalDoc(e, selectedClient, "declaracion")}
                    className="w-full py-2.5 rounded-xl border border-blue-100 bg-white text-[9px] font-black uppercase text-blue-800 hover:bg-blue-50 disabled:opacity-40"
                  >
                    Declaración
                  </button>
                  {getCumplimientoPeriodo(selectedClient.id, periodo)?.federales.lineasCaptura.map(
                    (l) => (
                      <button
                        key={l.id}
                        type="button"
                        disabled={
                          !adminPuedeSubirPdf(
                            getCumplimientoPeriodo(selectedClient.id, periodo),
                            "impuestos"
                          )
                        }
                        onClick={(e) =>
                          abrirModalDoc(e, selectedClient, "impuestos", l.id)
                        }
                        className="w-full py-2 rounded-xl border border-blue-100 bg-white text-[8px] font-black uppercase text-blue-700 hover:bg-blue-50 disabled:opacity-40"
                      >
                        {l.etiqueta}
                      </button>
                    )
                  )}
                </div>
              )}
              {categoriaAplicaCliente(selectedClient, "imss") &&
                getCumplimientoPeriodo(selectedClient.id, periodo)?.imss.activo && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3 space-y-2">
                    <p className="text-[8px] font-black uppercase text-emerald-700 tracking-widest">
                      {CATEGORIA_META.imss.label}
                    </p>
                    <button
                      type="button"
                      disabled={
                        !adminPuedeSubirPdf(
                          getCumplimientoPeriodo(selectedClient.id, periodo),
                          "sipare"
                        )
                      }
                      onClick={(e) => abrirModalDoc(e, selectedClient, "sipare")}
                      className="w-full py-2.5 rounded-xl border border-emerald-100 bg-white text-[9px] font-black uppercase text-emerald-800 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      SIPARE
                    </button>
                    <button
                      type="button"
                      disabled={
                        !adminPuedeSubirPdf(
                          getCumplimientoPeriodo(selectedClient.id, periodo),
                          "ema"
                        )
                      }
                      onClick={(e) =>
                        abrirModalDoc(e, selectedClient, "ema", undefined, 0)
                      }
                      className="w-full py-2 rounded-xl border border-emerald-100 bg-white text-[8px] font-black uppercase text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      {EMA_NOMBRE_LARGO}
                    </button>
                    <button
                      type="button"
                      disabled={
                        !adminPuedeSubirPdf(
                          getCumplimientoPeriodo(selectedClient.id, periodo),
                          "eba"
                        )
                      }
                      onClick={(e) =>
                        abrirModalDoc(e, selectedClient, "eba", undefined, 0)
                      }
                      className="w-full py-2 rounded-xl border border-emerald-100 bg-white text-[8px] font-black uppercase text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      {EBA_NOMBRE_LARGO}
                    </button>
                  </div>
                )}
              {categoriaAplicaCliente(selectedClient, "estatales") &&
                getCumplimientoPeriodo(selectedClient.id, periodo)?.estatales.activo && (
                  <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-3 space-y-2">
                    <p className="text-[8px] font-black uppercase text-violet-700 tracking-widest">
                      {CATEGORIA_META.estatales.label}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => abrirModalNomina(e, selectedClient)}
                      className="w-full py-2.5 rounded-xl border border-violet-100 bg-white text-[9px] font-black uppercase text-violet-800 hover:bg-violet-50"
                    >
                      Nómina
                    </button>
                    {getCumplimientoPeriodo(selectedClient.id, periodo)?.estatales.lineasCaptura.map(
                      (l) => (
                        <button
                          key={l.id}
                          type="button"
                          disabled={
                            !adminPuedeSubirPdf(
                              getCumplimientoPeriodo(selectedClient.id, periodo),
                              "estatales"
                            )
                          }
                          onClick={(e) =>
                            abrirModalDoc(e, selectedClient, "estatales", l.id)
                          }
                          className="w-full py-2 rounded-xl border border-violet-100 bg-white text-[8px] font-black uppercase text-violet-700 hover:bg-violet-50 disabled:opacity-40"
                        >
                          Línea de captura
                        </button>
                      )
                    )}
                  </div>
                )}
              <button
                type="button"
                disabled={
                  !adminPuedeSubirPdf(
                    getCumplimientoPeriodo(selectedClient.id, periodo),
                    "otros"
                  )
                }
                onClick={(e) => abrirModalDoc(e, selectedClient, "otros")}
                className="w-full py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Otros documentos
              </button>
            </div>

            {periodoVencidoSinPago(getCumplimientoPeriodo(selectedClient.id, periodo)) &&
              categoriasHabilitadasCliente(selectedClient).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setModalExtemp({ cliente: selectedClient, periodo, categoria: cat })
                  }
                  className="w-full py-2.5 mb-2 rounded-xl border border-red-200 text-[9px] font-black uppercase text-red-600 hover:bg-red-50"
                >
                  Pago extemporáneo · {cat === "federales" ? "Federales" : cat === "imss" ? "IMSS" : "Estatales"}
                </button>
              ))}

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!reg || !tieneResumenImpuestos(reg)) return null;
              return (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 mb-6">
                  <p className="text-[9px] font-black uppercase text-amber-800 mb-1">Pago impuestos</p>
                  <p className="text-lg font-black text-slate-800">
                    {formatMontoImpuesto(reg.montoImpuesto)}
                  </p>
                  <p className="text-xs font-bold text-amber-700 mt-1">
                    {formatFechaLimiteImpuesto(reg.fechaLimite)}
                  </p>
                </div>
              );
            })()}

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!reg?.comprobantePago) return null;
              const c = reg.comprobantePago;
              return (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mb-4">
                  <p className="text-[9px] font-black uppercase text-emerald-700 mb-2">
                    Comprobante de pago (cliente)
                  </p>
                  <p className="text-xs font-bold text-slate-700 truncate">{c.nombreArchivo}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => abrirPdfEnNuevaPestana(c.dataUrl)}
                      className="flex-1 py-2 rounded-lg bg-white border text-[8px] font-black uppercase text-indigo-700"
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => descargarArchivo(c.dataUrl, c.nombreArchivo)}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 text-[8px] font-black uppercase text-white"
                    >
                      Descargar
                    </button>
                  </div>
                </div>
              );
            })()}

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!reg || !clienteConfirmoPreview(reg) || !reg.fechaLimite) return null;
              return (
                <button
                  type="button"
                  disabled={!selectedClient.email || !isValidEmail(selectedClient.email ?? "")}
                  onClick={() => {
                    if (abrirCorreoRecordatorioLimite(selectedClient, periodo, reg)) {
                      marcarRecordatorioLimiteEnviado(selectedClient.id, periodo);
                    }
                  }}
                  className="w-full py-3 mb-4 rounded-xl border border-red-200 text-[9px] font-black uppercase text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  Enviar recordatorio de fecha límite
                </button>
              );
            })()}

            <a
              href={`/portal/login?cliente=${selectedClient.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 mb-4 rounded-xl bg-slate-100 text-center text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200"
            >
              Abrir portal del cliente
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  !puedeNotificarCumplimiento(
                    getCumplimientoPeriodo(selectedClient.id, periodo)
                  ) ||
                  !selectedClient.email ||
                  !isValidEmail(selectedClient.email)
                }
                onClick={(e) => enviarNotificacionTotal(e, selectedClient)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40"
              >
                <MailIcon />
                Notificar por correo
              </button>
              <button
                type="button"
                onClick={() => copiarHtml(selectedClient)}
                disabled={
                  !puedeNotificarCumplimiento(
                    getCumplimientoPeriodo(selectedClient.id, periodo)
                  )
                }
                className="px-4 py-3 rounded-xl border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                {htmlCopiado ? "¡Copiado!" : "HTML"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {modalDoc && (
        <ModalSubirCumplimiento
          cliente={modalDoc.cliente}
          periodo={modalDoc.periodo}
          tipo={modalDoc.tipo}
          lineaId={modalDoc.lineaId}
          slotIndex={modalDoc.slotIndex}
          onClose={() => setModalDoc(null)}
        />
      )}

      {modalNomina && (
        <ModalSubirNomina
          cliente={modalNomina.cliente}
          periodo={modalNomina.periodo}
          onClose={() => setModalNomina(null)}
        />
      )}

      {modalPrevio && (
        <ModalPrevisImpuestos
          cliente={modalPrevio.cliente}
          periodo={modalPrevio.periodo}
          onClose={() => setModalPrevio(null)}
        />
      )}

      {modalExtemp && (
        <ModalExtemporaneo
          cliente={modalExtemp.cliente}
          periodo={modalExtemp.periodo}
          categoria={modalExtemp.categoria}
          onClose={() => setModalExtemp(null)}
        />
      )}
    </div>
  );
}
