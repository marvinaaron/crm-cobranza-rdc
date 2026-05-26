"use client";

import { useCallback, useMemo, useState } from "react";
import { useAdminDeepLink } from "@/hooks/useAdminDeepLink";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm, useNotify } from "@/components/ConfirmProvider";
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
  formatFechaLimiteImpuestoCompacta,
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
  getComprobantePagoCategoria,
  pagoValidadoCategoria,
  todosPagosValidados,
  algunDocumentoFiscalSubido,
  algunComprobantePagoCargado,
  contabilidadIniciada,
  esSinPagoImpuestos,
  categoriasVencidasSinPago,
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
import { abrirBorradorCorreo, DESPACHO_NOMBRE } from "@/lib/workspace-email";
import { getPortalClienteUrl } from "@/lib/correo";
import { isValidEmail } from "@/lib/email";
import ModalSubirCumplimiento from "@/components/ModalSubirCumplimiento";
import ModalSubirNomina from "@/components/ModalSubirNomina";
import ModalPrevisImpuestos from "@/components/ModalPrevisImpuestos";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import NotificacionesBell from "@/components/NotificacionesBell";
import FlujoCumplimientoTimeline from "@/components/FlujoCumplimientoTimeline";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaldoFavorEditor from "@/components/admin/SaldoFavorEditor";
import AdminDocumentosSAT from "@/components/admin/AdminDocumentosSAT";
import CumplimientoCardMovil from "@/components/admin/CumplimientoCardMovil";
import ModalSubirRepse from "@/components/admin/ModalSubirRepse";
import {
  type TipoDocumentoRepse,
  periodoRepseDesdePeriodoMensual,
  periodoRepseLabel,
  etiquetaMesPresentacion,
} from "@/lib/repse";

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);

type ToneWorkflow =
  | "neutral"
  | "slate"
  | "sky"
  | "amber"
  | "teal"
  | "indigo"
  | "violet"
  | "emerald";

type Bucket = "paso1" | "paso2" | "paso3" | "paso4" | "paso5" | "paso6" | "paso7";

const BUCKET_TONO: Record<Bucket, ToneWorkflow> = {
  paso1: "slate", // Por trabajar
  paso2: "sky", // Iniciando
  paso3: "amber", // Preliminar
  paso4: "teal", // Aceptación
  paso5: "violet", // Declaraciones
  paso6: "indigo", // Pago
  paso7: "emerald", // Completado
};

const BUCKET_LABEL: Record<Bucket, string> = {
  paso1: "Por trabajar",
  paso2: "Iniciando",
  paso3: "Preliminar",
  paso4: "Aceptación",
  paso5: "Declaraciones",
  paso6: "Pago",
  paso7: "Completado",
};

const BUCKET_CHIP: Record<Bucket, string> = {
  paso1: "bg-white border border-slate-200 text-slate-600",
  paso2: "bg-sky-100 text-sky-700",
  paso3: "bg-amber-100 text-amber-700",
  paso4: "bg-teal-100 text-teal-700",
  paso5: "bg-violet-100 text-violet-700",
  paso6: "bg-indigo-100 text-indigo-700",
  paso7: "bg-emerald-500 text-white",
};

const BUCKET_FILA: Record<Bucket, string> = {
  paso1: "",
  paso2: "bg-sky-50/60 hover:bg-sky-50 border-sky-100",
  paso3: "bg-amber-50/60 hover:bg-amber-50 border-amber-100",
  paso4: "bg-teal-50/60 hover:bg-teal-50 border-teal-100",
  paso5: "bg-violet-50/60 hover:bg-violet-50 border-violet-100",
  paso6: "bg-indigo-50/60 hover:bg-indigo-50 border-indigo-100",
  paso7: "bg-emerald-50/70 hover:bg-emerald-100/60 border-emerald-100",
};

const TONE_WORKFLOW: Record<
  ToneWorkflow,
  { bg: string; border: string; label: string; num: string }
> = {
  neutral: {
    bg: "bg-slate-100",
    border: "border-slate-200",
    label: "text-slate-500",
    num: "text-slate-700",
  },
  slate: {
    bg: "bg-white",
    border: "border-slate-200",
    label: "text-slate-500",
    num: "text-slate-700",
  },
  sky: {
    bg: "bg-sky-50",
    border: "border-sky-100",
    label: "text-sky-600",
    num: "text-sky-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    label: "text-amber-600",
    num: "text-amber-700",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-100",
    label: "text-teal-600",
    num: "text-teal-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    label: "text-indigo-600",
    num: "text-indigo-700",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-100",
    label: "text-violet-600",
    num: "text-violet-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "text-emerald-700",
    num: "text-emerald-800",
  },
};

function StepWorkflowCard({
  label,
  count,
  tone,
  onClick,
  selected = false,
}: {
  label: string;
  count: number;
  tone: ToneWorkflow;
  onClick?: () => void;
  selected?: boolean;
}) {
  const t = TONE_WORKFLOW[tone];
  const base = `px-5 py-3 rounded-2xl border ${t.border} ${t.bg} shadow-sm min-w-[110px] text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md`;
  // Anillo "inset" (dentro de la tarjeta) para que no quede recortado por el contenedor con overflow-x.
  const interact = selected ? "ring-2 ring-inset ring-slate-900" : "";
  const contenido = (
    <>
      <p
        className={`text-[8px] font-black uppercase tracking-widest ${t.label}`}
      >
        {label}
      </p>
      <p className={`text-xl font-black tabular-nums ${t.num}`}>{count}</p>
    </>
  );
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${interact}`}
    >
      {contenido}
    </button>
  );
}

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

type ModalRepseState = {
  cliente: Cliente;
  periodoRepse: import("@/lib/repse").PeriodoRepse;
  tipo: TipoDocumentoRepse;
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

function chipDocumento(
  cargado: boolean,
  variante:
    | "default"
    | "federales"
    | "imss"
    | "estatales"
    | "repse" = "default"
) {
  if (!cargado) {
    return "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100";
  }
  switch (variante) {
    case "federales":
      return "bg-blue-600 text-white hover:bg-blue-700";
    case "imss":
      return "bg-emerald-600 text-white hover:bg-emerald-700";
    case "estatales":
      return "bg-violet-600 text-white hover:bg-violet-700";
    case "repse":
      return "bg-amber-600 text-white hover:bg-amber-700";
    default:
      return "bg-indigo-600 text-white hover:bg-indigo-700";
  }
}

/** Botón delgado (estilo VER/DESCARGAR de los comprobantes) para subir/abrir un documento. */
function botonDocSidebar(
  cargado: boolean,
  cat: "federales" | "imss" | "estatales" | "repse"
) {
  const base =
    "w-full py-2 rounded-md text-[9px] font-black uppercase tracking-widest text-center leading-tight transition-colors disabled:opacity-40";
  if (cargado) {
    const solido = {
      federales: "bg-blue-600 text-white hover:bg-blue-700",
      imss: "bg-emerald-600 text-white hover:bg-emerald-700",
      estatales: "bg-violet-600 text-white hover:bg-violet-700",
      repse: "bg-amber-600 text-white hover:bg-amber-700",
    }[cat];
    return `${base} ${solido}`;
  }
  const outline = {
    federales: "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50",
    imss: "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    estatales: "bg-white border border-violet-200 text-violet-700 hover:bg-violet-50",
    repse: "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50",
  }[cat];
  return `${base} ${outline}`;
}

const COLS_TABLA = 17;
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
  variante?: "default" | "federales" | "imss" | "estatales" | "repse";
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
      <td className={`px-2 py-4 text-center ${borderClass}`}>
        <span className="text-[8px] font-bold text-slate-300">N/A</span>
      </td>
    );
  }
  if (!reg || !conPago) {
    return (
      <td className={`px-2 py-4 text-center ${borderClass}`}>
        <span className="text-[8px] font-bold text-slate-300">—</span>
      </td>
    );
  }
  const monto = getSubtotalCategoria(reg, cat);
  const fecha = getFechaLimiteCategoria(reg, cat);
  return (
    <td className={`px-2 py-4 min-w-[100px] text-center ${borderClass}`}>
      <p className="text-xs font-black text-slate-800 tabular-nums">
        {formatMontoImpuesto(monto)}
      </p>
      {fecha ? (
        <p className="text-[9px] font-black text-amber-600 mt-0.5 tracking-wider tabular-nums">
          {formatFechaLimiteImpuestoCompacta(fecha)}
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
    validarPagoCategoria,
    revertirValidacionPagoCategoria,
    marcarContabilidadIniciada,
    revertirContabilidadIniciada,
    marcarSinPagoImpuestos,
    revertirSinPagoImpuestos,
    actualizarSaldoFavor,
    actualizarCliente,
    getRegistroRepseCliente,
  } = useClientes();
  const confirm = useConfirm();
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroFlujo, setFiltroFlujo] = useState<
    "todos" | "paso1" | "paso2" | "paso3" | "paso4" | "paso5" | "paso6" | "paso7"
  >("todos");
  const [modalDoc, setModalDoc] = useState<ModalDoc | null>(null);
  const [modalNomina, setModalNomina] = useState<ModalNomina | null>(null);
  const [modalPrevio, setModalPrevio] = useState<{ cliente: Cliente; periodo: Periodo } | null>(null);
  const [modalExtemp, setModalExtemp] = useState<{
    cliente: Cliente;
    periodo: Periodo;
    categoria: CategoriaId;
  } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [modalRepse, setModalRepse] = useState<ModalRepseState | null>(null);
  const [htmlCopiado, setHtmlCopiado] = useState(false);

  const periodoRepseVista = useMemo(
    () => periodoRepseDesdePeriodoMensual(periodo),
    [periodo]
  );

  useAdminDeepLink({
    listaClientes,
    onCliente: setSelectedClient,
  });

  const mesLabel = periodoLabel(periodo);

  const clientesBase = useMemo(() => {
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

  const bucketCliente = useCallback(
    (c: Cliente): "paso1" | "paso2" | "paso3" | "paso4" | "paso5" | "paso6" | "paso7" => {
      const reg = getCumplimientoPeriodo(c.id, periodo);

      // Modo "sin pago": el flujo se reduce a Iniciando → Declaraciones → Completado
      if (esSinPagoImpuestos(reg)) {
        if (algunDocumentoFiscalSubido(reg)) return "paso7";
        return contabilidadIniciada(reg) ? "paso5" : "paso2";
      }

      if (!previewPublicado(reg)) {
        return contabilidadIniciada(reg) ? "paso2" : "paso1";
      }

      const catsPago = reg
        ? categoriasConPagoEnPreview(c, asegurarBloques(reg))
        : [];

      if (catsPago.length === 0) return "paso7";
      if (!clienteConfirmoPreview(reg)) return "paso3";
      if (!algunDocumentoFiscalSubido(reg, catsPago)) return "paso4";
      if (todosPagosValidados(reg, catsPago)) return "paso7";
      if (!algunComprobantePagoCargado(reg, catsPago)) return "paso5";
      return "paso6";
    },
    [getCumplimientoPeriodo, periodo]
  );

  const resumen = useMemo(() => {
    const b = {
      paso1: 0,
      paso2: 0,
      paso3: 0,
      paso4: 0,
      paso5: 0,
      paso6: 0,
      paso7: 0,
    };
    clientesBase.forEach((c) => {
      b[bucketCliente(c)]++;
    });
    return { total: clientesBase.length, ...b };
  }, [clientesBase, bucketCliente]);

  const clientes = useMemo(() => {
    if (filtroFlujo === "todos") return clientesBase;
    return clientesBase.filter((c) => bucketCliente(c) === filtroFlujo);
  }, [clientesBase, filtroFlujo, bucketCliente]);

  const toggleFiltroFlujo = (
    paso: "todos" | "paso1" | "paso2" | "paso3" | "paso4" | "paso5" | "paso6" | "paso7"
  ) => {
    setFiltroFlujo((prev) => (prev === paso ? "todos" : paso));
  };

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

  const abrirRepse = (
    e: React.MouseEvent,
    cliente: Cliente,
    tipo: TipoDocumentoRepse
  ) => {
    e.stopPropagation();
    if (!cliente.configRepse?.habilitado) return;
    const pRepse = periodoRepseDesdePeriodoMensual(periodo);
    const reg = getRegistroRepseCliente(cliente.id, pRepse);
    const doc = reg?.[tipo];
    if (doc) {
      abrirPdfEnNuevaPestana(doc.dataUrl);
      return;
    }
    setModalRepse({ cliente, periodoRepse: pRepse, tipo });
  };

  const abrirModalNomina = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation();
    setModalNomina({ cliente, periodo, modo: "nomina" });
  };

  const enviarNotificacionTotal = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation();
    const reg = getCumplimientoPeriodo(cliente.id, periodo);
    if (!reg) return;
    if (!cliente.email?.trim() || !isValidEmail(cliente.email)) {
      void notify({
        titulo: "Correo no disponible",
        mensaje:
          "Este cliente no tiene un correo válido en su expediente. Actualízalo en el catálogo de clientes antes de enviarle la notificación.",
        tono: "warning",
      });
      return;
    }

    // Modo "sin pago": correo simplificado avisando al cliente que no hay impuestos a pagar.
    if (esSinPagoImpuestos(reg)) {
      if (!documentoAdminCargado(reg, "declaracion")) {
        void notify({
          titulo: "Falta la declaración",
          mensaje:
            "Sube la declaración del SAT antes de notificar al cliente que está al corriente.",
          tono: "warning",
        });
        return;
      }
      const portalUrl = getPortalClienteUrl(cliente.id);
      const periodoTxt = periodoLabel(periodo);
      const subject = `Su declaración ${periodoTxt} ya está disponible · Sin impuestos a pagar`;
      const body = [
        `Estimado(a) ${cliente.razonSocial},`,
        "",
        `Le confirmamos que la declaración del periodo ${periodoTxt} ya fue presentada ante el SAT.`,
        "",
        "En este periodo NO genera impuestos a pagar — está al corriente con sus obligaciones fiscales.",
        "",
        "Puede ingresar a su portal para revisar y descargar el acuse de su declaración:",
        portalUrl,
        "",
        "Saludos cordiales,",
        DESPACHO_NOMBRE,
      ].join("\n");
      abrirBorradorCorreo({ to: cliente.email.trim(), subject, body });
      marcarCumplimientoNotificado(cliente.id, periodo);
      return;
    }

    const cats = categoriasConPagoEnPreview(cliente, asegurarBloques(reg));
    if (cats.length === 0) return;
    if (!clienteConfirmoPreview(reg)) {
      void notify({
        titulo: "Falta validación del cliente",
        mensaje:
          "El cliente aún no ha validado el previo de impuestos. Espera a que confirme desde su portal antes de enviarle el correo final.",
        tono: "info",
      });
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
    <div className="space-y-6 lg:space-y-8 min-h-screen bg-[#F8FAFC] max-w-full overflow-x-hidden">
      <header>
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1.5">
          Hacienda · SAT
        </p>
        <h1 className="text-2xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight">
          Cumplimiento
        </h1>
        <p className="text-slate-400 font-bold text-xs lg:text-sm mt-1.5">
          <span className="font-black text-blue-600">{mesLabel}</span> · Periodo fiscal · Documentación por cliente
        </p>
        {/* Campana global en barra superior móvil (AdminShell); en escritorio sigue aquí */}
        <div className="hidden lg:flex items-center gap-3 mt-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-1">
            <NotificacionesBell destinatario="admin" />
          </div>
        </div>
      </header>

      <div className="flex flex-nowrap lg:flex-wrap items-stretch gap-2 lg:gap-3 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 py-1">
        <StepWorkflowCard
          label="Clientes"
          count={resumen.total}
          tone="neutral"
          onClick={() => setFiltroFlujo("todos")}
          selected={filtroFlujo === "todos"}
        />
        <StepWorkflowCard
          label="Por trabajar"
          count={resumen.paso1}
          tone="slate"
          onClick={() => toggleFiltroFlujo("paso1")}
          selected={filtroFlujo === "paso1"}
        />
        <StepWorkflowCard
          label="Iniciando"
          count={resumen.paso2}
          tone="sky"
          onClick={() => toggleFiltroFlujo("paso2")}
          selected={filtroFlujo === "paso2"}
        />
        <StepWorkflowCard
          label="Preliminar"
          count={resumen.paso3}
          tone="amber"
          onClick={() => toggleFiltroFlujo("paso3")}
          selected={filtroFlujo === "paso3"}
        />
        <StepWorkflowCard
          label="Aceptación"
          count={resumen.paso4}
          tone="teal"
          onClick={() => toggleFiltroFlujo("paso4")}
          selected={filtroFlujo === "paso4"}
        />
        <StepWorkflowCard
          label="Declaraciones"
          count={resumen.paso5}
          tone="violet"
          onClick={() => toggleFiltroFlujo("paso5")}
          selected={filtroFlujo === "paso5"}
        />
        <StepWorkflowCard
          label="Pago"
          count={resumen.paso6}
          tone="indigo"
          onClick={() => toggleFiltroFlujo("paso6")}
          selected={filtroFlujo === "paso6"}
        />
        <StepWorkflowCard
          label="Completado"
          count={resumen.paso7}
          tone="emerald"
          onClick={() => toggleFiltroFlujo("paso7")}
          selected={filtroFlujo === "paso7"}
        />
      </div>

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

      {/* Vista móvil: cards (oculta en escritorio) */}
      <div className="lg:hidden space-y-3">
        {clientes.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
            {filtroFlujo === "todos"
              ? <>No hay clientes activos en <span className="font-black text-slate-500">{mesLabel}</span></>
              : <>Sin clientes en este paso para <span className="font-black text-slate-500">{mesLabel}</span></>}
          </div>
        ) : (
          clientes.map((cli) => (
            <CumplimientoCardMovil
              key={cli.id}
              cliente={cli}
              reg={getCumplimientoPeriodo(cli.id, periodo)}
              periodo={periodo}
              onSelect={(c) => setSelectedClient(c)}
            />
          ))
        )}
      </div>

      {/* Vista escritorio: tabla completa */}
      <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
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
                  colSpan={2}
                  className={`px-3 py-2 text-[8px] font-black uppercase tracking-widest text-amber-700 text-center bg-amber-50/60 ${SEP_GRUPO}`}
                >
                  REPSE
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
                <th className={`px-2 py-3 text-[8px] font-black uppercase tracking-widest text-amber-700 text-center ${SEP_GRUPO}`}>
                  SISUB
                </th>
                <th className="px-2 py-3 text-[8px] font-black uppercase tracking-widest text-amber-700 text-center">
                  ICSOE
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
                  const sinPago = esSinPagoImpuestos(reg);
                  const sinPagoCerrado =
                    sinPago && documentoAdminCargado(reg, "declaracion");
                  const filaCompleta =
                    sinPagoCerrado ||
                    (catsPago.length > 0 && todosPagosValidados(reg, catsPago));
                  const bucket = bucketCliente(cli);
                  const filaTono = BUCKET_FILA[bucket];

                  return (
                    <tr
                      key={cli.id}
                      onClick={() => setSelectedClient(cli)}
                      className={`group border-b cursor-pointer transition-colors ${
                        filaTono
                          ? filaTono
                          : "border-slate-50 hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                              {cli.razonSocial}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{cli.rfc}</p>
                          </div>
                          <div className="shrink-0">
                            <NotificacionesBell
                              destinatario="admin"
                              clienteId={cli.id}
                              tamano="sm"
                              comoModal
                              tituloModal={`Notificaciones · ${cli.razonSocial}`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest max-w-[110px] leading-tight ${BUCKET_CHIP[bucket]}`}
                        >
                          {BUCKET_LABEL[bucket]}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
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
                      <td className={`px-2 py-4 text-center ${SEP_GRUPO}`}>
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
                      <td className="px-2 py-4 text-center">
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
                      <td className={`px-2 py-4 text-center ${SEP_GRUPO}`}>
                        {!imssOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={documentoAdminCargado(reg, "sipare")}
                            habilitado={puedePdf("sipare")}
                            variante="imss"
                            onClick={(e) => abrirModalDoc(e, cli, "sipare")}
                          />
                        )}
                      </td>
                      <td className="px-2 py-4 text-center">
                        {!imssOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={nEma > 0}
                            habilitado={puedePdf("ema")}
                            variante="imss"
                            etiqueta={nEma > 0 ? (nEma > 1 ? `${nEma} PDF` : "PDF") : "Subir"}
                            onClick={(e) => abrirModalDoc(e, cli, "ema", undefined, 0)}
                          />
                        )}
                      </td>
                      <td className="px-2 py-4 text-center">
                        {!imssOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={nEba > 0}
                            habilitado={puedePdf("eba")}
                            variante="imss"
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
                      <td className={`px-2 py-4 text-center ${SEP_GRUPO}`}>
                        {!estOn ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => abrirModalNomina(e, cli)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${chipDocumento(nNomina > 0, "estatales")}`}
                          >
                            <PdfIcon />
                            {nNomina > 0 ? `${nNomina} arch.` : "Subir"}
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-4 text-center">
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
                                variante="estatales"
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
                      <td className={`px-2 py-4 text-center ${SEP_GRUPO}`}>
                        {!cli.configRepse?.habilitado ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={
                              !!getRegistroRepseCliente(cli.id, periodoRepseVista)
                                ?.sisub
                            }
                            habilitado
                            variante="repse"
                            etiqueta="SISUB"
                            onClick={(e) => abrirRepse(e, cli, "sisub")}
                          />
                        )}
                      </td>
                      <td className="px-2 py-4 text-center">
                        {!cli.configRepse?.habilitado ? (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        ) : (
                          <BotonPdf
                            cargado={
                              !!getRegistroRepseCliente(cli.id, periodoRepseVista)
                                ?.icsoe
                            }
                            habilitado
                            variante="repse"
                            etiqueta="ICSOE"
                            onClick={(e) => abrirRepse(e, cli, "icsoe")}
                          />
                        )}
                      </td>
                      <td className={`px-3 py-4 min-w-[120px] text-center ${SEP_GRUPO}`}>
                        {sinPago ? (
                          <p className="text-sm font-black text-slate-500 tabular-nums">
                            {formatMontoImpuesto(0)}
                          </p>
                        ) : catsPago.length > 0 && reg ? (
                          <p className="text-sm font-black text-slate-900 tabular-nums">
                            {formatMontoImpuesto(totalGeneral)}
                          </p>
                        ) : (
                          <span className="text-[8px] font-bold text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-2 py-4 text-center">
                        {sinPago ? (
                          <BotonNotificar
                            puede={sinPagoCerrado && emailOk}
                            emailOk={emailOk}
                            title={
                              !sinPagoCerrado
                                ? "Suba la declaración antes de notificar al cliente"
                                : !emailOk
                                  ? "Cliente sin correo válido"
                                  : "Notificar al cliente: sin impuestos a pagar este periodo"
                            }
                            onClick={(e) => enviarNotificacionTotal(e, cli)}
                          />
                        ) : catsPago.length > 0 ? (
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
                    {filtroFlujo === "todos"
                      ? <>No hay clientes activos en <span className="font-black text-slate-500">{mesLabel}</span></>
                      : <>Sin clientes en este paso para <span className="font-black text-slate-500">{mesLabel}</span></>}
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

            <AdminDocumentosSAT
              cliente={
                listaClientes.find((c) => c.id === selectedClient.id) ??
                selectedClient
              }
              onClienteActualizado={(c) => {
                actualizarCliente(c);
                setSelectedClient(c);
              }}
            />

            <div className="mb-5">
              <FlujoCumplimientoTimeline
                cliente={selectedClient}
                periodo={periodo}
                variante="compacto"
              />
            </div>

            {(() => {
              const regSel = getCumplimientoPeriodo(selectedClient.id, periodo);
              const sinPago = esSinPagoImpuestos(regSel);
              const publicado = previewPublicado(regSel);
              // El toggle no puede activarse si ya hay un previo publicado (hay importes que el cliente vio)
              const toggleDeshabilitado = publicado && !sinPago;
              return (
                <div className="mb-3">
                  <ToggleSwitch
                    checked={sinPago}
                    onChange={async (next) => {
                      if (next) {
                        if (publicado) {
                          const ok = await confirm({
                            titulo: "Marcar como 'Sin pago'",
                            mensaje:
                              "Esto invalidará el previo de impuestos publicado para este periodo. ¿Continuar?",
                            textoConfirmar: "Marcar sin pago",
                            tono: "warning",
                          });
                          if (!ok) return;
                        }
                        marcarSinPagoImpuestos(selectedClient.id, periodo);
                      } else {
                        const ok = await confirm({
                          titulo: "Desactivar 'Sin pago'",
                          mensaje:
                            "El flujo regresará a uno normal con preliminar y pago.",
                          textoConfirmar: "Desactivar",
                          tono: "info",
                        });
                        if (ok) {
                          revertirSinPagoImpuestos(selectedClient.id, periodo);
                        }
                      }
                    }}
                    disabled={toggleDeshabilitado}
                    label="Sin pago de impuestos este periodo"
                    description={
                      sinPago
                        ? "Declaración en ceros · solo se sube la declaración SAT"
                        : toggleDeshabilitado
                          ? "Elimine el previo publicado antes de activar este modo"
                          : "Active si el cliente no causó impuestos este periodo"
                    }
                    tono="slate"
                  />
                </div>
              );
            })()}

            {(() => {
              const regSel = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!esSinPagoImpuestos(regSel)) return null;
              const saldoActivo = regSel?.saldoFavor?.activo === true;
              return (
                <SaldoFavorEditor
                  activo={saldoActivo}
                  isr={regSel?.saldoFavor?.isr ?? 0}
                  iva={regSel?.saldoFavor?.iva ?? 0}
                  onToggle={(next) =>
                    actualizarSaldoFavor(selectedClient.id, periodo, {
                      activo: next,
                      isr: regSel?.saldoFavor?.isr,
                      iva: regSel?.saldoFavor?.iva,
                    })
                  }
                  onGuardar={(isr, iva) =>
                    actualizarSaldoFavor(selectedClient.id, periodo, {
                      activo: true,
                      isr,
                      iva,
                    })
                  }
                />
              );
            })()}

            {(() => {
              const regSel = getCumplimientoPeriodo(selectedClient.id, periodo);
              const iniciado = contabilidadIniciada(regSel);
              const publicado = previewPublicado(regSel);
              const sinPago = esSinPagoImpuestos(regSel);
              if (publicado || sinPago) return null;
              return (
                <div className="flex items-stretch gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      marcarContabilidadIniciada(selectedClient.id, periodo)
                    }
                    disabled={iniciado}
                    className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors ${
                      iniciado
                        ? "bg-sky-600 text-white cursor-default"
                        : "border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100"
                    }`}
                  >
                    {iniciado ? "✓ Contabilidad iniciada" : "Paso 1 · Iniciar contabilidad"}
                  </button>
                  {iniciado && (
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await confirm({
                          titulo: "Deshacer aviso",
                          mensaje:
                            "El cliente dejará de ver el estado 'Iniciando contabilidad'.",
                          textoConfirmar: "Deshacer",
                          tono: "warning",
                        });
                        if (ok) {
                          revertirContabilidadIniciada(
                            selectedClient.id,
                            periodo
                          );
                        }
                      }}
                      title="Deshacer"
                      className="px-3 rounded-xl border border-slate-200 text-slate-500 text-[9px] font-black hover:bg-slate-50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })()}

            {!esSinPagoImpuestos(getCumplimientoPeriodo(selectedClient.id, periodo)) && (
              <button
                type="button"
                onClick={(e) => abrirModalPrevio(e, selectedClient)}
                className="w-full py-3.5 mb-2 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700"
              >
                {previewPublicado(getCumplimientoPeriodo(selectedClient.id, periodo))
                  ? "Editar previo de impuestos"
                  : "Paso 2 · Publicar previo de impuestos"}
              </button>
            )}
            {previewPublicado(getCumplimientoPeriodo(selectedClient.id, periodo)) && (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  const ok = await confirm({
                    titulo: "Eliminar previo publicado",
                    mensaje:
                      "El cliente dejará de ver el importe y se quitarán los PDFs de este periodo.",
                    textoConfirmar: "Eliminar previo",
                    tono: "danger",
                  });
                  if (!ok) return;
                  eliminarPreviewImpuestos(selectedClient.id, periodo);
                }}
                className="w-full py-2 mb-4 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700"
              >
                Eliminar previo publicado
              </button>
            )}

            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Paso 3 · PDFs · <span className="text-slate-700">{mesLabel}</span>
            </p>
            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              const sinPago = esSinPagoImpuestos(reg);
              const declCargada = documentoAdminCargado(reg, "declaracion");
              const sipareCargado = documentoAdminCargado(reg, "sipare");
              const emaCargado = documentoAdminCargado(reg, "ema");
              const ebaCargado = documentoAdminCargado(reg, "eba");
              const pRepseSidebar = periodoRepseDesdePeriodoMensual(periodo);
              const regRepseSidebar = getRegistroRepseCliente(
                selectedClient.id,
                pRepseSidebar
              );
              const repseOn = selectedClient.configRepse?.habilitado === true;
              const nNominaSidebar = contarArchivosNomina(reg);
              const fedOn =
                categoriaAplicaCliente(selectedClient, "federales") &&
                (!sinPago || true); // federales siempre, para subir declaración
              // En modo "sin pago" IMSS y estatales se ocultan porque no hay pago
              const imssOn =
                !sinPago &&
                categoriaAplicaCliente(selectedClient, "imss") &&
                !!reg?.imss.activo;
              const estOn =
                !sinPago &&
                categoriaAplicaCliente(selectedClient, "estatales") &&
                !!reg?.estatales.activo;
              return (
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {fedOn && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-2.5 flex flex-col gap-1.5">
                      <p className="text-[8px] font-black uppercase text-blue-700 tracking-widest">
                        {CATEGORIA_META.federales.label}
                      </p>
                      {reg?.federales.lineasCaptura.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          disabled={!adminPuedeSubirPdf(reg, "impuestos")}
                          onClick={(e) =>
                            abrirModalDoc(e, selectedClient, "impuestos", l.id)
                          }
                          className={botonDocSidebar(!!l.documento, "federales")}
                        >
                          {l.etiqueta}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={!adminPuedeSubirPdf(reg, "declaracion")}
                        onClick={(e) =>
                          abrirModalDoc(e, selectedClient, "declaracion")
                        }
                        className={botonDocSidebar(declCargada, "federales")}
                      >
                        Declaración
                      </button>
                    </div>
                  )}
                  {imssOn && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-2.5 flex flex-col gap-1.5">
                      <p className="text-[8px] font-black uppercase text-emerald-700 tracking-widest">
                        {CATEGORIA_META.imss.label}
                      </p>
                      <button
                        type="button"
                        disabled={!adminPuedeSubirPdf(reg, "sipare")}
                        onClick={(e) => abrirModalDoc(e, selectedClient, "sipare")}
                        className={botonDocSidebar(sipareCargado, "imss")}
                      >
                        SIPARE
                      </button>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          disabled={!adminPuedeSubirPdf(reg, "ema")}
                          onClick={(e) =>
                            abrirModalDoc(e, selectedClient, "ema", undefined, 0)
                          }
                          className={botonDocSidebar(emaCargado, "imss")}
                        >
                          EMA
                        </button>
                        <button
                          type="button"
                          disabled={!adminPuedeSubirPdf(reg, "eba")}
                          onClick={(e) =>
                            abrirModalDoc(e, selectedClient, "eba", undefined, 0)
                          }
                          className={botonDocSidebar(ebaCargado, "imss")}
                        >
                          EBA
                        </button>
                      </div>
                    </div>
                  )}
                  {estOn && (
                    <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-2.5 flex flex-col gap-1.5">
                      <p className="text-[8px] font-black uppercase text-violet-700 tracking-widest">
                        {CATEGORIA_META.estatales.label}
                      </p>
                      {reg?.estatales.lineasCaptura.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          disabled={!adminPuedeSubirPdf(reg, "estatales")}
                          onClick={(e) =>
                            abrirModalDoc(e, selectedClient, "estatales", l.id)
                          }
                          className={botonDocSidebar(!!l.documento, "estatales")}
                        >
                          Línea de captura
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={(e) => abrirModalNomina(e, selectedClient)}
                        className={botonDocSidebar(nNominaSidebar > 0, "estatales")}
                      >
                        {nNominaSidebar > 0
                          ? `Nómina · ${nNominaSidebar}`
                          : "Nómina"}
                      </button>
                    </div>
                  )}
                  {repseOn && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-2.5 flex flex-col gap-1.5 col-span-2">
                      <p className="text-[8px] font-black uppercase text-amber-800 tracking-widest">
                        REPSE · {periodoRepseLabel(pRepseSidebar)}
                      </p>
                      <p className="text-[8px] font-bold text-amber-700/70 -mt-1">
                        Se presenta en {etiquetaMesPresentacion(pRepseSidebar.cuatrimestre)}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => abrirRepse(e, selectedClient, "sisub")}
                          className={botonDocSidebar(!!regRepseSidebar?.sisub, "repse")}
                        >
                          SISUB
                        </button>
                        <button
                          type="button"
                          onClick={(e) => abrirRepse(e, selectedClient, "icsoe")}
                          className={botonDocSidebar(!!regRepseSidebar?.icsoe, "repse")}
                        >
                          ICSOE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              const vencidas = categoriasVencidasSinPago(reg);
              if (!vencidas.length) return null;
              return (
                <div className="rounded-2xl border border-red-200 bg-red-50/60 p-3 mb-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-700 mb-1">
                    Plazo vencido · sin comprobante
                  </p>
                  <p className="text-[10px] font-bold text-red-700/80 leading-snug mb-2">
                    Genere una línea de captura extemporánea (con recargos y
                    actualizaciones) para reactivar el flujo del cliente.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {vencidas.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setModalExtemp({
                            cliente: selectedClient,
                            periodo,
                            categoria: cat,
                          })
                        }
                        className="w-full py-2 rounded-xl bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700"
                      >
                        + Línea extemporánea · {CATEGORIA_META[cat].label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!reg || !tieneResumenImpuestos(reg)) return null;
              return (
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="rounded-2xl bg-slate-100 border border-slate-200 p-3 flex flex-col justify-between min-h-[90px]">
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
                      Pago impuestos
                    </p>
                    <p className="text-lg font-black text-slate-900 tabular-nums">
                      {formatMontoImpuesto(reg.montoImpuesto)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 border border-slate-200 p-3 flex flex-col justify-between min-h-[90px]">
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
                      Fecha límite
                    </p>
                    <p className="text-base font-black text-slate-900 tabular-nums tracking-wider leading-tight">
                      {formatFechaLimiteImpuestoCompacta(reg.fechaLimite)}
                    </p>
                  </div>
                </div>
              );
            })()}

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!reg) return null;
              const entradas: Array<{
                cat: CategoriaId;
                doc: import("@/lib/cumplimiento").DocumentoHacienda;
              }> = [];
              for (const cat of ["federales", "imss", "estatales"] as CategoriaId[]) {
                const doc = getComprobantePagoCategoria(reg, cat);
                if (doc) entradas.push({ cat, doc });
              }
              if (!entradas.length && !reg.comprobantePago) return null;
              const colorCat: Record<CategoriaId, { txt: string; bord: string; bg: string }> = {
                federales: { txt: "text-blue-700", bord: "border-blue-200", bg: "bg-blue-50/60" },
                imss: { txt: "text-emerald-700", bord: "border-emerald-200", bg: "bg-emerald-50/60" },
                estatales: { txt: "text-violet-700", bord: "border-violet-200", bg: "bg-violet-50/60" },
              };
              return (
                <div className="mb-4">
                  <p className="text-[9px] font-black uppercase text-emerald-700 tracking-widest mb-2">
                    Comprobantes de pago (cliente)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {entradas.map(({ cat, doc }) => {
                      const validado = pagoValidadoCategoria(reg, cat);
                      const c = colorCat[cat];
                      return (
                        <div
                          key={cat}
                          className={`rounded-xl border p-2.5 flex flex-col gap-1.5 ${
                            validado
                              ? "bg-emerald-100/70 border-emerald-300"
                              : `${c.bg} ${c.bord}`
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className={`text-[8px] font-black uppercase tracking-widest leading-tight ${validado ? "text-emerald-800" : c.txt}`}>
                              {CATEGORIA_META[cat].label}
                            </p>
                            {validado && (
                              <span className="shrink-0 text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                                Validado
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-slate-600 truncate" title={doc.nombreArchivo}>
                            {doc.nombreArchivo}
                          </p>
                          <div className="grid grid-cols-2 gap-1 mt-auto">
                            <button
                              type="button"
                              onClick={() => abrirPdfEnNuevaPestana(doc.dataUrl)}
                              className="py-1.5 rounded-md bg-white border border-slate-200 text-[8px] font-black uppercase text-indigo-700 hover:bg-indigo-50"
                            >
                              Ver
                            </button>
                            <button
                              type="button"
                              onClick={() => descargarArchivo(doc.dataUrl, doc.nombreArchivo)}
                              className="py-1.5 rounded-md bg-slate-700 text-[8px] font-black uppercase text-white hover:bg-slate-800"
                            >
                              Descargar
                            </button>
                          </div>
                          {validado ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await confirm({
                                  titulo: "Revertir validación",
                                  mensaje:
                                    "El cliente verá nuevamente la opción de reemplazar el comprobante.",
                                  textoConfirmar: "Revertir",
                                  tono: "warning",
                                });
                                if (ok) {
                                  revertirValidacionPagoCategoria(
                                    selectedClient.id,
                                    periodo,
                                    cat
                                  );
                                }
                              }}
                              className="w-full py-1.5 rounded-md bg-white border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                            >
                              Revertir
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                validarPagoCategoria(selectedClient.id, periodo, cat)
                              }
                              className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest"
                            >
                              Validar
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {reg.comprobantePago && entradas.length === 0 && (
                      <div className="rounded-xl bg-white border border-emerald-100 p-2.5 col-span-2">
                        <p className="text-[10px] font-bold text-slate-700 truncate">
                          {reg.comprobantePago.nombreArchivo}
                        </p>
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          <button
                            type="button"
                            onClick={() => abrirPdfEnNuevaPestana(reg.comprobantePago!.dataUrl)}
                            className="py-1.5 rounded-md bg-white border border-slate-200 text-[8px] font-black uppercase text-indigo-700"
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              descargarArchivo(
                                reg.comprobantePago!.dataUrl,
                                reg.comprobantePago!.nombreArchivo
                              )
                            }
                            className="py-1.5 rounded-md bg-slate-700 text-[8px] font-black uppercase text-white"
                          >
                            Descargar
                          </button>
                        </div>
                      </div>
                    )}
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

      {modalRepse && (
        <ModalSubirRepse
          cliente={modalRepse.cliente}
          periodoRepse={modalRepse.periodoRepse}
          tipo={modalRepse.tipo}
          onClose={() => setModalRepse(null)}
        />
      )}
    </div>
  );
}
