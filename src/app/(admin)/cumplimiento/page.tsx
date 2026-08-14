"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  clientePidioLineaCaptura,
  previoPausadoPorDuda,
  tieneResumenImpuestos,
  adminPuedeSubirPdf,
  documentoAdminCargado,
  asegurarBloques,
  getFlujoCumplimiento,
  FLUJO_CUMPLIMIENTO_LABELS,
  previewPublicado,
  type RegistroCumplimiento,
  periodoVencidoSinPago,
  CATEGORIA_META,
  EMA_NOMBRE_LARGO,
  EBA_NOMBRE_LARGO,
  getComprobantePagoCategoria,
  pagoValidadoCategoria,
  pagoMarcadoManualCategoria,
  todosPagosValidados,
  algunDocumentoFiscalSubido,
  algunComprobantePagoCargado,
  contabilidadIniciada,
  esSinPagoImpuestos,
  categoriasVencidasSinPago,
  categoriaTieneExtemporaneo,
  getFechaLimiteMasProxima,
  normalizarSaldoFavorLineas,
  documentosFiscalesCompletos,
  type CategoriaId,
} from "@/lib/cumplimiento";
import {
  categoriasHabilitadasCliente,
  categoriaAplicaCliente,
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";
import ModalExtemporaneo from "@/components/ModalExtemporaneo";
import BotonCorreoCumplimiento from "@/components/admin/BotonCorreoCumplimiento";
import { isValidEmail } from "@/lib/email";
import ModalSubirCumplimiento from "@/components/ModalSubirCumplimiento";
import ModalSubirNomina from "@/components/ModalSubirNomina";
import ModalPrevisImpuestos from "@/components/ModalPrevisImpuestos";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import NotificacionesBell from "@/components/NotificacionesBell";
import FlujoCumplimientoTimeline from "@/components/FlujoCumplimientoTimeline";
import {
  tituloPaso,
  numDePaso,
  pasoDeNum,
  type PasoBucket,
} from "@/components/admin/AdminCumplimientoPasosRail";
import WorkflowCircleMini from "@/components/admin/WorkflowCircleMini";
import { getWorkflowMesCliente } from "@/lib/cobranza-workflow";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaldoFavorEditor from "@/components/admin/SaldoFavorEditor";
import AdminDocumentosSAT from "@/components/admin/AdminDocumentosSAT";
import CumplimientoCardMovil from "@/components/admin/CumplimientoCardMovil";
import CronogramaCumplimiento from "@/components/admin/CronogramaCumplimiento";
import VistaFederalCumplimiento from "@/components/admin/VistaFederalCumplimiento";
import ModalSubirRepse from "@/components/admin/ModalSubirRepse";
import {
  type TipoDocumentoRepse,
  periodoRepseDesdePeriodoMensual,
  periodoRepseLabel,
  etiquetaMesPresentacion,
} from "@/lib/repse";
import { FLUJO_NUMERO } from "@/lib/cobranza-workflow";
import { regimenPorClave } from "@/lib/regimenes-fiscales";
import { fechaLimiteSAT, formatearDiaMesCorto } from "@/lib/portal/fechas-fiscales";
import EncabezadoFiltroTabla from "@/components/admin/EncabezadoFiltroTabla";
import {
  construirExportCumplimiento,
  exportarCumplimientoExcel,
  exportarCumplimientoPdf,
} from "@/lib/cumplimiento-export";

/** Nombre abreviado para botones de navegación (ej. "← B-Water"). */
function nombreCortoCliente(razonSocial: string): string {
  const limpio = razonSocial.trim();
  if (limpio.length <= 18) return limpio;
  const primera = limpio.split(/\s+/)[0] ?? limpio;
  return primera.length <= 18 ? primera : `${primera.slice(0, 16)}…`;
}

/** Texto del botón de notificación según el paso actual del flujo. */
function textoNotificarCorreo(
  cliente: Cliente,
  reg: RegistroCumplimiento | undefined
): string {
  const nombre = nombreCortoCliente(cliente.razonSocial);
  const flujo = getFlujoCumplimiento(reg);
  const paso = flujo ? FLUJO_NUMERO[flujo] : 1;
  if (paso === 1 || paso === 2) return `Notificar avance a ${nombre}`;
  if (paso === 5 || paso === 6) return `Notificar declaración a ${nombre}`;
  return "Notificar por correo";
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

/** Tipos de trabajo por los que se puede filtrar la cartera. */
type TipoTrabajo = "federales" | "imss" | "estatales" | "repse";

const TRABAJO_ORDEN: TipoTrabajo[] = ["federales", "imss", "estatales", "repse"];

const TRABAJO_LABEL: Record<TipoTrabajo, string> = {
  federales: "SAT",
  imss: "IMSS",
  estatales: "Nómina",
  repse: "REPSE",
};

/** Clase del chip de filtro por tipo de trabajo (activo/inactivo). */
const TRABAJO_CHIP: Record<TipoTrabajo, { activo: string; inactivo: string }> = {
  federales: {
    activo: "bg-blue-600 text-white border-blue-600",
    inactivo: "bg-white text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  imss: {
    activo: "bg-emerald-600 text-white border-emerald-600",
    inactivo: "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  estatales: {
    activo: "bg-violet-600 text-white border-violet-600",
    inactivo: "bg-white text-violet-700 border-violet-200 hover:bg-violet-50",
  },
  repse: {
    activo: "bg-amber-600 text-white border-amber-600",
    inactivo: "bg-white text-amber-700 border-amber-200 hover:bg-amber-50",
  },
};

/** ¿El cliente tiene contratado/configurado este tipo de trabajo? */
function clienteTieneTrabajo(c: Cliente, t: TipoTrabajo): boolean {
  if (t === "repse") return c.configRepse?.habilitado === true;
  return categoriaAplicaCliente(c, t);
}

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
  paso1: FLUJO_CUMPLIMIENTO_LABELS.por_trabajar,
  paso2: FLUJO_CUMPLIMIENTO_LABELS.iniciando_contabilidad,
  paso3: FLUJO_CUMPLIMIENTO_LABELS.preliminar,
  paso4: FLUJO_CUMPLIMIENTO_LABELS.aceptacion,
  paso5: FLUJO_CUMPLIMIENTO_LABELS.declaraciones,
  paso6: FLUJO_CUMPLIMIENTO_LABELS.pago,
  paso7: FLUJO_CUMPLIMIENTO_LABELS.completado,
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

/** Fila tipo barra dentro del recuadro de categoría (SAT, IMSS, etc.). */
function barraDocSidebar(
  cargado: boolean,
  cat: "federales" | "imss" | "estatales" | "repse" | "nomina" | "extemporaneo"
) {
  const base =
    "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-colors disabled:opacity-40";
  if (cargado) {
    const solido = {
      federales: "bg-blue-600 text-white hover:bg-blue-700",
      imss: "bg-green-600 text-white hover:bg-green-700",
      estatales: "bg-amber-600 text-white hover:bg-amber-700",
      repse: "bg-violet-600 text-white hover:bg-violet-700",
      nomina: "bg-orange-600 text-white hover:bg-orange-700",
      extemporaneo: "bg-red-600 text-white hover:bg-red-700",
    }[cat];
    return `${base} ${solido}`;
  }
  const outline = {
    federales: "bg-white border border-blue-200 text-blue-800 hover:bg-blue-50",
    imss: "bg-white border border-green-200 text-green-800 hover:bg-green-50",
    estatales: "bg-white border border-amber-200 text-amber-800 hover:bg-amber-50",
    repse: "bg-white border border-violet-200 text-violet-800 hover:bg-violet-50",
    nomina: "bg-white border border-orange-200 text-orange-800 hover:bg-orange-50",
    extemporaneo: "bg-white border border-red-200 text-red-800 hover:bg-red-50",
  }[cat];
  return `${base} ${outline}`;
}

const COLS_TABLA = 19;
const SIN_REGIMEN = "__sin__";

function regimenLabelCliente(c: Cliente): string {
  if (!c.regimenFiscalClave) return "Sin régimen";
  return regimenPorClave(c.regimenFiscalClave)?.label ?? c.regimenFiscalClave;
}

function claveRegimenCliente(c: Cliente): string {
  return c.regimenFiscalClave ?? SIN_REGIMEN;
}
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
      title={!habilitado ? "Publica el previo para habilitar" : undefined}
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

function marcarNotificadoSiAplica(
  cliente: Cliente,
  reg: RegistroCumplimiento | undefined,
  marcar: (clienteId: number, periodo: Periodo) => void,
  periodo: Periodo
) {
  if (!reg) return;
  if (!puedeNotificarCumplimiento(reg, categoriasHabilitadasCliente(cliente))) return;
  marcar(cliente.id, periodo);
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
    marcarPagoManualCategoria,
    revertirValidacionPagoCategoria,
    marcarContabilidadIniciada,
    revertirContabilidadIniciada,
    marcarSinPagoImpuestos,
    revertirSinPagoImpuestos,
    actualizarSaldoFavor,
    actualizarCliente,
    getRegistroRepseCliente,
    confirmarPreviewCliente,
    liberarDudaPrevioAdmin,
  } = useClientes();
  const confirm = useConfirm();
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroFlujos, setFiltroFlujos] = useState<Set<Bucket>>(() => new Set());
  const [filtroRegimen, setFiltroRegimen] = useState<Set<string>>(() => new Set());
  const [ordenVencDecl, setOrdenVencDecl] = useState<"asc" | "desc" | null>(null);
  const [filtroTrabajo, setFiltroTrabajo] = useState<Set<TipoTrabajo>>(
    () => new Set()
  );
  const [menuExportAbierto, setMenuExportAbierto] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [modalDoc, setModalDoc] = useState<ModalDoc | null>(null);
  const [modalNomina, setModalNomina] = useState<ModalNomina | null>(null);
  const [modalPrevio, setModalPrevio] = useState<{ cliente: Cliente; periodo: Periodo } | null>(null);
  const [modalExtemp, setModalExtemp] = useState<{
    cliente: Cliente;
    periodo: Periodo;
    categoria: CategoriaId;
  } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [pasoEditando, setPasoEditando] = useState<PasoBucket>("paso1");
  const [modalRepse, setModalRepse] = useState<ModalRepseState | null>(null);
  const [vistaLista, setVistaLista] = useState<"tabla" | "anual" | "federal">(
    "tabla"
  );

  const periodoRepseVista = useMemo(
    () => periodoRepseDesdePeriodoMensual(periodo),
    [periodo]
  );

  useAdminDeepLink({
    listaClientes,
    onCliente: setSelectedClient,
  });

  // Bloqueo de scroll de fondo mientras el panel lateral del cliente está
  // abierto en móvil (el shell admin scrollea en <main data-rdc-scroll-root>,
  // no en el body). Sin esto, el gesto de scroll dentro del panel arrastraba
  // la página de atrás. También cierra con Esc.
  useEffect(() => {
    if (!selectedClient) return;
    const root = document.querySelector<HTMLElement>("[data-rdc-scroll-root]");
    const prevBody = document.body.style.overflow;
    const prevRoot = root?.style.overflow ?? "";
    document.body.style.overflow = "hidden";
    if (root) root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedClient(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevBody;
      if (root) root.style.overflow = prevRoot;
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedClient]);

  const mesLabel = periodoLabel(periodo);

  // Cartera tras búsqueda y periodo (sin aplicar el filtro por tipo de trabajo),
  // base para contar cuántos clientes hay de cada tipo.
  const clientesBuscados = useMemo(() => {
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

  // Conteo por tipo de trabajo (para las píldoras de filtro).
  const conteoTrabajo = useMemo(() => {
    const out: Record<TipoTrabajo, number> = {
      federales: 0,
      imss: 0,
      estatales: 0,
      repse: 0,
    };
    clientesBuscados.forEach((c) => {
      TRABAJO_ORDEN.forEach((t) => {
        if (clienteTieneTrabajo(c, t)) out[t] += 1;
      });
    });
    return out;
  }, [clientesBuscados]);

  // Cartera final: además del tipo de trabajo seleccionado (semántica Y: el
  // cliente debe tener TODOS los tipos marcados).
  const clientesBase = useMemo(() => {
    if (filtroTrabajo.size === 0) return clientesBuscados;
    const tipos = [...filtroTrabajo];
    return clientesBuscados.filter((c) =>
      tipos.every((t) => clienteTieneTrabajo(c, t))
    );
  }, [clientesBuscados, filtroTrabajo]);

  const toggleFiltroTrabajo = (t: TipoTrabajo) => {
    setFiltroTrabajo((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

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
      if (todosPagosValidados(reg, catsPago)) return "paso7";
      if (algunComprobantePagoCargado(reg, catsPago)) return "paso6";
      if (algunDocumentoFiscalSubido(reg, catsPago)) {
        return documentosFiscalesCompletos(reg, catsPago) ? "paso5" : "paso4";
      }
      if (previoPausadoPorDuda(reg)) return "paso3";
      if (clienteConfirmoPreview(reg)) return "paso4";
      return "paso3";
    },
    [getCumplimientoPeriodo, periodo]
  );

  // Al abrir/cambiar cliente o periodo, enfoca el paso real del registro.
  // El admin puede brincar a otro paso sin mutar el estado.
  useEffect(() => {
    if (!selectedClient) return;
    setPasoEditando(bucketCliente(selectedClient));
    // Solo al abrir/cambiar cliente o periodo — no al mutar el registro.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bucket al abrir
  }, [selectedClient?.id, periodo.mes, periodo.anio]);

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

  const regimenesEnCartera = useMemo(() => {
    const map = new Map<string, { clave: string; label: string; count: number }>();
    clientesBuscados.forEach((c) => {
      const clave = claveRegimenCliente(c);
      const label = regimenLabelCliente(c);
      const prev = map.get(clave);
      map.set(clave, { clave, label, count: (prev?.count ?? 0) + 1 });
    });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [clientesBuscados]);

  const opcionesFiltroFlujo = useMemo(() => {
    const conteo: Record<Bucket, number> = {
      paso1: 0,
      paso2: 0,
      paso3: 0,
      paso4: 0,
      paso5: 0,
      paso6: 0,
      paso7: 0,
    };
    clientesBase.forEach((c) => {
      conteo[bucketCliente(c)]++;
    });
    return (Object.keys(BUCKET_LABEL) as Bucket[]).map((b) => ({
      id: b,
      label: BUCKET_LABEL[b],
      count: conteo[b],
    }));
  }, [clientesBase, bucketCliente]);

  const clientes = useMemo(() => {
    let list = clientesBase;
    if (filtroFlujos.size > 0) {
      list = list.filter((c) => filtroFlujos.has(bucketCliente(c)));
    }
    if (filtroRegimen.size > 0) {
      list = list.filter((c) => filtroRegimen.has(claveRegimenCliente(c)));
    }
    if (ordenVencDecl) {
      list = [...list].sort((a, b) => {
        const fedA = categoriaAplicaCliente(a, "federales");
        const fedB = categoriaAplicaCliente(b, "federales");
        const ta = fedA ? fechaLimiteSAT(a.rfc, periodo).getTime() : 0;
        const tb = fedB ? fechaLimiteSAT(b.rfc, periodo).getTime() : 0;
        return ordenVencDecl === "asc" ? ta - tb : tb - ta;
      });
    }
    return list;
  }, [
    clientesBase,
    filtroFlujos,
    filtroRegimen,
    ordenVencDecl,
    bucketCliente,
    periodo,
  ]);

  const toggleFiltroFlujo = (
    paso: "todos" | "paso1" | "paso2" | "paso3" | "paso4" | "paso5" | "paso6" | "paso7"
  ) => {
    if (paso === "todos") {
      setFiltroFlujos(new Set());
      return;
    }
    setFiltroFlujos((prev) => {
      if (prev.size === 1 && prev.has(paso)) return new Set();
      return new Set([paso]);
    });
  };

  const toggleFiltroRegimen = (clave: string) => {
    setFiltroRegimen((prev) => {
      const next = new Set(prev);
      if (next.has(clave)) next.delete(clave);
      else next.add(clave);
      return next;
    });
  };

  const datosExport = useMemo(
    () =>
      construirExportCumplimiento({
        clientes,
        periodo,
        pasoLabel: (c) => BUCKET_LABEL[bucketCliente(c)],
        getRegistro: (id) => getCumplimientoPeriodo(id, periodo),
        getRegistroRepse: (id, pRepse) => getRegistroRepseCliente(id, pRepse),
      }),
    [clientes, periodo, bucketCliente, getCumplimientoPeriodo, getRegistroRepseCliente]
  );

  const exportarExcel = async () => {
    setMenuExportAbierto(false);
    setExportando(true);
    try {
      await exportarCumplimientoExcel(datosExport, periodo);
      void notify({
        titulo: "Excel descargado",
        mensaje: `${clientes.length} clientes exportados.`,
        tono: "info",
      });
    } finally {
      setExportando(false);
    }
  };

  const exportarPdf = async () => {
    setMenuExportAbierto(false);
    setExportando(true);
    try {
      await exportarCumplimientoPdf(datosExport, periodo);
      void notify({
        titulo: "PDF descargado",
        mensaje: `${clientes.length} clientes en el reporte.`,
        tono: "info",
      });
    } finally {
      setExportando(false);
    }
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
    const yaTieneDoc = documentoAdminCargado(
      reg,
      tipo === "imss" ? "sipare" : tipo
    );
    if (!adminPuedeSubirPdf(reg, tipo) && !yaTieneDoc) return;
    if (tipo === "imss") {
      setModalDoc({ cliente, periodo, tipo: "sipare", lineaId, slotIndex });
      return;
    }
    // SAT: siempre la línea consolidada (evita IDs viejos ISR/IVA).
    if (tipo === "impuestos") {
      const consolidada = reg
        ? asegurarBloques(reg).federales.lineasCaptura[0]
        : undefined;
      setModalDoc({
        cliente,
        periodo,
        tipo,
        lineaId: consolidada?.id,
        slotIndex,
      });
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
      </header>

      <div className="flex flex-nowrap lg:flex-wrap items-stretch gap-2 lg:gap-3 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 py-1">
        <StepWorkflowCard
          label="Clientes"
          count={resumen.total}
          tone="neutral"
          onClick={() => toggleFiltroFlujo("todos")}
          selected={filtroFlujos.size === 0}
        />
        <StepWorkflowCard
          label={BUCKET_LABEL.paso1}
          count={resumen.paso1}
          tone="slate"
          onClick={() => toggleFiltroFlujo("paso1")}
          selected={filtroFlujos.size === 1 && filtroFlujos.has("paso1")}
        />
        <StepWorkflowCard
          label={BUCKET_LABEL.paso2}
          count={resumen.paso2}
          tone="sky"
          onClick={() => toggleFiltroFlujo("paso2")}
          selected={filtroFlujos.size === 1 && filtroFlujos.has("paso2")}
        />
        <StepWorkflowCard
          label={BUCKET_LABEL.paso3}
          count={resumen.paso3}
          tone="amber"
          onClick={() => toggleFiltroFlujo("paso3")}
          selected={filtroFlujos.size === 1 && filtroFlujos.has("paso3")}
        />
        <StepWorkflowCard
          label={BUCKET_LABEL.paso4}
          count={resumen.paso4}
          tone="teal"
          onClick={() => toggleFiltroFlujo("paso4")}
          selected={filtroFlujos.size === 1 && filtroFlujos.has("paso4")}
        />
        <StepWorkflowCard
          label={BUCKET_LABEL.paso5}
          count={resumen.paso5}
          tone="violet"
          onClick={() => toggleFiltroFlujo("paso5")}
          selected={filtroFlujos.size === 1 && filtroFlujos.has("paso5")}
        />
        <StepWorkflowCard
          label={BUCKET_LABEL.paso6}
          count={resumen.paso6}
          tone="indigo"
          onClick={() => toggleFiltroFlujo("paso6")}
          selected={filtroFlujos.size === 1 && filtroFlujos.has("paso6")}
        />
        <StepWorkflowCard
          label={BUCKET_LABEL.paso7}
          count={resumen.paso7}
          tone="emerald"
          onClick={() => toggleFiltroFlujo("paso7")}
          selected={filtroFlujos.size === 1 && filtroFlujos.has("paso7")}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
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
        <div className="hidden lg:flex shrink-0 rounded-2xl bg-slate-100 p-1">
          {(
            [
              { id: "tabla", label: "Tabla" },
              { id: "anual", label: "Anual" },
              { id: "federal", label: "Federal" },
            ] as const
          ).map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => setVistaLista(op.id)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                vistaLista === op.id
                  ? op.id === "federal"
                    ? "bg-white text-blue-700 shadow-sm"
                    : op.id === "anual"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => void exportarExcel()}
            disabled={exportando || clientes.length === 0}
            className="pl-4 pr-3 py-3.5 rounded-l-2xl text-[9px] font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
          >
            {exportando ? "Exportando…" : "Exportar Excel"}
          </button>
          <button
            type="button"
            onClick={() => setMenuExportAbierto((v) => !v)}
            disabled={exportando || clientes.length === 0}
            aria-label="Más formatos de exportación"
            aria-expanded={menuExportAbierto}
            className="px-3 py-3.5 rounded-r-2xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm border-l border-indigo-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${menuExportAbierto ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {menuExportAbierto && (
            <>
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                onClick={() => setMenuExportAbierto(false)}
                className="fixed inset-0 z-20 cursor-default"
              />
              <div className="absolute right-0 top-full mt-2 z-30 w-52 rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() => void exportarExcel()}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-emerald-50/70 text-[10px] font-black uppercase tracking-widest text-slate-700"
                >
                  Excel completo
                </button>
                <button
                  type="button"
                  onClick={() => void exportarPdf()}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-indigo-50/70 text-[10px] font-black uppercase tracking-widest text-slate-700 border-t border-slate-50"
                >
                  PDF resumen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filtro por tipo de trabajo (SAT, IMSS, Nómina, REPSE). Selección
          múltiple con semántica Y: el cliente debe tener todos los marcados. */}
      <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 py-0.5">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-1">
          Tipo de trabajo
        </span>
        {TRABAJO_ORDEN.map((t) => {
          const activo = filtroTrabajo.has(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleFiltroTrabajo(t)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                activo ? TRABAJO_CHIP[t].activo : TRABAJO_CHIP[t].inactivo
              }`}
            >
              {TRABAJO_LABEL[t]}
              <span
                className={`min-w-[16px] h-4 px-1 rounded-full text-[9px] flex items-center justify-center tabular-nums ${
                  activo ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {conteoTrabajo[t]}
              </span>
            </button>
          );
        })}
        {filtroTrabajo.size > 0 && (
          <button
            type="button"
            onClick={() => setFiltroTrabajo(new Set())}
            className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filtro por régimen fiscal */}
      <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 py-0.5">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-1">
          Régimen
        </span>
        {regimenesEnCartera.map((r) => {
          const activo = filtroRegimen.has(r.clave);
          return (
            <button
              key={r.clave}
              type="button"
              onClick={() => toggleFiltroRegimen(r.clave)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                activo
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="normal-case tracking-normal">{r.label}</span>
              <span
                className={`min-w-[16px] h-4 px-1 rounded-full text-[9px] flex items-center justify-center tabular-nums ${
                  activo ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {r.count}
              </span>
            </button>
          );
        })}
        {filtroRegimen.size > 0 && (
          <button
            type="button"
            onClick={() => setFiltroRegimen(new Set())}
            className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Vista móvil: cards (oculta en escritorio) */}
      <div className="lg:hidden space-y-3 px-1">
        {clientes.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
            {filtroFlujos.size === 0 && filtroRegimen.size === 0
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

      {/* Vista escritorio: cronograma pivote */}
      {vistaLista === "anual" && (
        <div className="hidden lg:block">
          <CronogramaCumplimiento
            clientes={clientes}
            periodo={periodo}
            getCumplimientoPeriodo={getCumplimientoPeriodo}
            onSelectClient={setSelectedClient}
          />
        </div>
      )}

      {vistaLista === "federal" && (
        <div className="hidden lg:block">
          <VistaFederalCumplimiento
            clientes={clientes}
            periodo={periodo}
            getCumplimientoPeriodo={getCumplimientoPeriodo}
            onSelectClient={setSelectedClient}
          />
        </div>
      )}

      {/* Vista escritorio: tabla completa */}
      <div className={`${vistaLista !== "tabla" ? "hidden" : "hidden lg:block"} bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden`}>
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
                <EncabezadoFiltroTabla
                  label="Régimen"
                  opciones={regimenesEnCartera.map((r) => ({
                    id: r.clave,
                    label: r.label,
                    count: r.count,
                  }))}
                  seleccionados={filtroRegimen}
                  onChange={setFiltroRegimen}
                  rowSpan={2}
                  alineacion="center"
                />
                <th
                  rowSpan={2}
                  className="px-2 py-4 text-[9px] font-black uppercase tracking-widest text-blue-600 text-center align-bottom"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrdenVencDecl((prev) =>
                        prev === null ? "asc" : prev === "asc" ? "desc" : null
                      );
                    }}
                    className={`inline-flex items-center gap-1 hover:text-blue-800 ${
                      ordenVencDecl ? "text-blue-700" : ""
                    }`}
                    title="Ordenar por vencimiento de declaración"
                  >
                    Venc. decl.
                    {ordenVencDecl === "asc" && <span>↑</span>}
                    {ordenVencDecl === "desc" && <span>↓</span>}
                  </button>
                </th>
                <EncabezadoFiltroTabla
                  label="Flujo"
                  opciones={opcionesFiltroFlujo}
                  seleccionados={filtroFlujos}
                  onChange={(next) =>
                    setFiltroFlujos(new Set([...next].filter((id): id is Bucket => id in BUCKET_LABEL)))
                  }
                  rowSpan={2}
                  alineacion="center"
                />
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
                      <td className="px-2 py-4 text-center">
                        <span className="inline-block max-w-[88px] text-[8px] font-bold text-slate-600 leading-tight">
                          {regimenLabelCliente(cli)}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        {fedOn ? (
                          <span className="text-[9px] font-black text-blue-700 tabular-nums">
                            {formatearDiaMesCorto(fechaLimiteSAT(cli.rfc, periodo))}
                          </span>
                        ) : (
                          <span className="text-[8px] font-bold text-slate-300">N/A</span>
                        )}
                      </td>
                      <td
                        className="px-3 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <WorkflowCircleMini
                          resumen={getWorkflowMesCliente(cli, periodo, reg)}
                          popoverHacia="right"
                        />
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
                          <BotonPdf
                            cargado={!!lineasFed[0]?.documento}
                            habilitado={puedePdf("impuestos")}
                            variante="federales"
                            etiqueta={lineasFed[0]?.documento ? "PDF" : "Línea"}
                            onClick={(e) =>
                              abrirModalDoc(
                                e,
                                cli,
                                "impuestos",
                                lineasFed[0]?.id
                              )
                            }
                          />
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
                          <BotonCorreoCumplimiento
                            cliente={cli}
                            periodo={periodo}
                            tipo="sin_pago"
                            registro={reg}
                            habilitado={sinPagoCerrado && emailOk}
                            motivo={
                              !sinPagoCerrado
                                ? "Suba la declaración antes de notificar"
                                : !emailOk
                                  ? "Cliente sin correo válido"
                                  : undefined
                            }
                            titulo="Notificar"
                            notify={notify}
                            enviadoEn={reg?.notificadoEn}
                            onContactado={() =>
                              marcarCumplimientoNotificado(cli.id, periodo)
                            }
                          />
                        ) : catsPago.length > 0 ? (
                          <BotonCorreoCumplimiento
                            cliente={cli}
                            periodo={periodo}
                            tipo="listo"
                            registro={reg}
                            opts={{ categorias: catsPago }}
                            habilitado={
                              !!reg && previewPublicado(reg) && emailOk
                            }
                            motivo={
                              !reg || !previewPublicado(reg)
                                ? "Publique el previo primero"
                                : !emailOk
                                  ? "Cliente sin correo válido"
                                  : undefined
                            }
                            titulo="Notificar"
                            notify={notify}
                            enviadoEn={reg?.notificadoEn}
                            onContactado={() =>
                              marcarNotificadoSiAplica(
                                cli,
                                reg,
                                marcarCumplimientoNotificado,
                                periodo
                              )
                            }
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
                    {filtroFlujos.size === 0 && filtroRegimen.size === 0
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
        <div
          className="fixed inset-0 z-[60] flex justify-center items-stretch lg:items-center bg-slate-900/40 backdrop-blur-sm pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-[calc(env(safe-area-inset-bottom)+5.25rem)] lg:p-6"
          onClick={() => setSelectedClient(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle de cumplimiento · ${selectedClient.razonSocial}`}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-white h-full lg:h-[min(92vh,920px)] shadow-2xl overflow-hidden rounded-t-2xl lg:rounded-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="shrink-0 border-b border-slate-100 px-5 py-4 lg:px-8 lg:py-5">
            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="text-[13px] font-medium text-indigo-600 hover:text-indigo-800 mb-3 flex items-center gap-1"
            >
              ← {nombreCortoCliente(selectedClient.razonSocial)}
            </button>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {selectedClient.razonSocial}
              </h2>
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
            </div>
            <p className="text-[10px] font-mono text-slate-400 mb-2">{selectedClient.rfc}</p>

            {selectedClient.email && (
              <p className="text-[11px] font-bold text-indigo-500 mb-3">{selectedClient.email}</p>
            )}

            {(() => {
              const regSel = getCumplimientoPeriodo(selectedClient.id, periodo);
              const sinPago = esSinPagoImpuestos(regSel);
              const publicado = previewPublicado(regSel);
              const toggleDeshabilitado = publicado && !sinPago;
              return (
                <div className="max-w-xl">
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
                        const lineasExistentes = normalizarSaldoFavorLineas(
                          regSel?.saldoFavor
                        );
                        actualizarSaldoFavor(selectedClient.id, periodo, {
                          activo: true,
                          lineas: lineasExistentes.length
                            ? lineasExistentes
                            : [{ etiqueta: "ISR", monto: 0 }],
                        });
                        setPasoEditando("paso2");
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
                    destacado
                    label="Sin pago de impuestos este periodo"
                    description={
                      sinPago
                        ? "Declaración en ceros · se omiten pasos 3, 4 y 6. Captura abajo el saldo a favor o déjalo en 0."
                        : toggleDeshabilitado
                          ? "Elimine el previo publicado antes de activar este modo"
                          : "Active si el cliente no causó impuestos este periodo"
                    }
                  />
                  {sinPago && (
                    <div className="mt-3">
                      <SaldoFavorEditor
                        activo
                        ocultarToggle
                        lineas={normalizarSaldoFavorLineas(regSel?.saldoFavor)}
                        onToggle={() => undefined}
                        onGuardar={(lineas) =>
                          actualizarSaldoFavor(selectedClient.id, periodo, {
                            activo: true,
                            lineas,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })()}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 lg:px-8 lg:py-6">
            <div className="min-w-0">
                <div className="mb-5">
                  <FlujoCumplimientoTimeline
                    cliente={selectedClient}
                    periodo={periodo}
                    variante="ancho"
                    esquemaVerdeGris
                    pasoSeleccionado={numDePaso(pasoEditando)}
                    onSeleccionarPaso={(n) => setPasoEditando(pasoDeNum(n))}
                  />
                </div>

                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      aria-hidden
                      className="shrink-0 w-10 h-10 rounded-full bg-slate-800 text-white text-lg font-black flex items-center justify-center tabular-nums"
                    >
                      {numDePaso(pasoEditando)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Editando
                      </p>
                      <h3 className="text-base font-black text-slate-800">
                        {tituloPaso(pasoEditando)}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5 max-w-lg leading-snug">
                        Clic en la barra de arriba para cambiar de paso. El avance
                        del periodo no cambia hasta que actives o confirmes algo aquí.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {pasoEditando !== "paso1" && (
                      <button
                        type="button"
                        onClick={() => {
                          const orden: PasoBucket[] = [
                            "paso1",
                            "paso2",
                            "paso3",
                            "paso4",
                            "paso5",
                            "paso6",
                            "paso7",
                          ];
                          const i = orden.indexOf(pasoEditando);
                          const sinPago = esSinPagoImpuestos(
                            getCumplimientoPeriodo(selectedClient.id, periodo)
                          );
                          for (let j = i - 1; j >= 0; j--) {
                            const p = orden[j];
                            if (
                              sinPago &&
                              (p === "paso3" || p === "paso4" || p === "paso6")
                            ) {
                              continue;
                            }
                            setPasoEditando(p);
                            break;
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                      >
                        Anterior
                      </button>
                    )}
                    {pasoEditando !== "paso7" && (
                      <button
                        type="button"
                        onClick={() => {
                          const orden: PasoBucket[] = [
                            "paso1",
                            "paso2",
                            "paso3",
                            "paso4",
                            "paso5",
                            "paso6",
                            "paso7",
                          ];
                          const i = orden.indexOf(pasoEditando);
                          const sinPago = esSinPagoImpuestos(
                            getCumplimientoPeriodo(selectedClient.id, periodo)
                          );
                          for (let j = i + 1; j < orden.length; j++) {
                            const p = orden[j];
                            if (
                              sinPago &&
                              (p === "paso3" || p === "paso4" || p === "paso6")
                            ) {
                              continue;
                            }
                            setPasoEditando(p);
                            break;
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-900"
                      >
                        Siguiente
                      </button>
                    )}
                  </div>
                </div>

            {previoPausadoPorDuda(
              getCumplimientoPeriodo(selectedClient.id, periodo)
            ) && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-900">
                  Pausado · duda del importe
                </p>
                <p className="text-xs font-bold text-amber-800/90 mt-1 leading-relaxed">
                  El cliente pidió revisar los impuestos. No puedes declarar hasta
                  resolverlo o marcar para continuar (se salta esta espera).
                </p>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const ok = await confirm({
                      titulo: "Continuar y declarar",
                      mensaje:
                        "Saltarás la pausa por duda del cliente. Podrás subir declaración y línea de captura como de costumbre.",
                      textoConfirmar: "Continuar",
                      tono: "warning",
                    });
                    if (!ok) return;
                    liberarDudaPrevioAdmin(selectedClient.id, periodo);
                    await notify({
                      titulo: "Pausa liberada",
                      mensaje:
                        "Ya puedes declarar. Se aplicó la regla de saltar esa espera.",
                      tono: "info",
                    });
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl border border-amber-400 bg-white text-amber-900 text-[9px] font-black uppercase tracking-widest hover:bg-amber-100"
                >
                  Marcar y continuar (saltar espera)
                </button>
              </div>
            )}

            {pasoEditando === "paso1" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 mb-4">
                <p className="text-sm font-bold text-slate-700 leading-snug">
                  Periodo sin iniciar. Usa el paso 2 para avisar que ya empezaste
                  la contabilidad. El modo &quot;Sin pago&quot; de arriba omite
                  preliminar, aceptación y pago.
                </p>
              </div>
            )}

            {pasoEditando === "paso2" && (
            <>
            {(() => {
              const regSel = getCumplimientoPeriodo(selectedClient.id, periodo);
              const iniciado = contabilidadIniciada(regSel);
              const publicado = previewPublicado(regSel);
              return (
                <div className="flex items-stretch gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      marcarContabilidadIniciada(selectedClient.id, periodo)
                    }
                    disabled={iniciado || publicado}
                    className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors ${
                      iniciado || publicado
                        ? "bg-green-50 border border-green-200 text-green-700 cursor-default"
                        : "border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100"
                    }`}
                  >
                    {publicado
                      ? "✓ Ya avanzaste (previo publicado)"
                      : iniciado
                        ? "✓ Contabilidad iniciada"
                        : "Iniciar contabilidad"}
                  </button>
                  {iniciado && !publicado && (
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await confirm({
                          titulo: "Deshacer aviso",
                          mensaje:
                            "El cliente dejará de ver el estado 'En preparación'.",
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
            </>
            )}

            {pasoEditando === "paso3" && (
            <>
            {!esSinPagoImpuestos(getCumplimientoPeriodo(selectedClient.id, periodo)) && (() => {
              const regSel = getCumplimientoPeriodo(selectedClient.id, periodo);
              const saldoActivo = regSel?.saldoFavor?.activo === true;
              return (
                <SaldoFavorEditor
                  activo={saldoActivo}
                  lineas={normalizarSaldoFavorLineas(regSel?.saldoFavor)}
                  onToggle={(next) =>
                    actualizarSaldoFavor(selectedClient.id, periodo, {
                      activo: next,
                      lineas: normalizarSaldoFavorLineas(regSel?.saldoFavor),
                    })
                  }
                  onGuardar={(lineas) =>
                    actualizarSaldoFavor(selectedClient.id, periodo, {
                      activo: true,
                      lineas,
                    })
                  }
                />
              );
            })()}

            {!esSinPagoImpuestos(getCumplimientoPeriodo(selectedClient.id, periodo)) && (
              previewPublicado(getCumplimientoPeriodo(selectedClient.id, periodo)) ? (
                <div className="mb-2 space-y-2">
                  <div className="w-full py-3.5 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-[10px] font-black uppercase tracking-widest text-center">
                    ✓ Previo publicado
                  </div>
                  <button
                    type="button"
                    onClick={(e) => abrirModalPrevio(e, selectedClient)}
                    className="w-full py-2.5 rounded-xl border border-indigo-200 text-indigo-600 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50"
                  >
                    Editar previo de impuestos
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => abrirModalPrevio(e, selectedClient)}
                  className="w-full py-3.5 mb-2 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700"
                >
                  Publicar previo de impuestos
                </button>
              )
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
            </>
            )}

            {pasoEditando === "paso4" && (
            <>
            {previewPublicado(getCumplimientoPeriodo(selectedClient.id, periodo)) &&
              !clienteConfirmoPreview(
                getCumplimientoPeriodo(selectedClient.id, periodo)
              ) &&
              !previoPausadoPorDuda(
                getCumplimientoPeriodo(selectedClient.id, periodo)
              ) && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const ok = await confirm({
                      titulo: "Marcar previo como visto",
                      mensaje:
                        "Registrarás que el cliente ya vio el previo sin esperar a que abra el portal. Podrás seguir subiendo documentos con normalidad.",
                      textoConfirmar: "Marcar como visto",
                      tono: "warning",
                    });
                    if (!ok) return;
                    confirmarPreviewCliente(selectedClient.id, periodo);
                    await notify({
                      titulo: "Previo marcado como visto",
                      mensaje: "Ya puedes continuar el flujo sin esperar al cliente.",
                      tono: "info",
                    });
                  }}
                  className="w-full mb-3 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-[9px] font-black uppercase tracking-widest hover:bg-amber-100"
                >
                  Marcar como visto (sin esperar al cliente)
                </button>
              )}
            {clienteConfirmoPreview(
              getCumplimientoPeriodo(selectedClient.id, periodo)
            ) &&
              !previoPausadoPorDuda(
                getCumplimientoPeriodo(selectedClient.id, periodo)
              ) && (
              <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-800">
                  ✓ Previo visto por el cliente
                </p>
                <p className="text-xs font-bold text-teal-700/80 mt-1">
                  {clientePidioLineaCaptura(
                    getCumplimientoPeriodo(selectedClient.id, periodo)
                  )
                    ? "El cliente pidió su línea de captura. Continúa en el paso 5."
                    : "Puedes continuar en el paso 5 con los documentos."}
                </p>
              </div>
            )}
            {!previewPublicado(
              getCumplimientoPeriodo(selectedClient.id, periodo)
            ) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-3">
                <p className="text-sm font-bold text-slate-600">
                  Primero publica el previo en el paso 3.
                </p>
              </div>
            )}
            </>
            )}

            {pasoEditando === "paso5" && (
            <>
            {previoPausadoPorDuda(
              getCumplimientoPeriodo(selectedClient.id, periodo)
            ) && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-900">
                  No puedes declarar
                </p>
                <p className="text-xs font-bold text-amber-800/90 mt-1 leading-relaxed">
                  El cliente tiene duda del importe. Libera la pausa en el paso 4
                  (marcar y continuar) para subir declaración y línea de captura.
                </p>
              </div>
            )}
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Documentos · <span className="text-slate-700">{mesLabel}</span>
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
                (!sinPago || true);
              const imssOn =
                !sinPago &&
                categoriaAplicaCliente(selectedClient, "imss") &&
                !!reg?.imss.activo;
              const estOn =
                !sinPago &&
                categoriaAplicaCliente(selectedClient, "estatales") &&
                !!reg?.estatales.activo;
              return (
                <div className="space-y-3 mb-6">
                  {fedOn && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3 space-y-2">
                      <p className="text-[9px] font-black uppercase text-blue-700 tracking-widest">
                        {CATEGORIA_META.federales.label}
                      </p>
                      <button
                        type="button"
                        disabled={!adminPuedeSubirPdf(reg, "declaracion")}
                        onClick={(e) =>
                          abrirModalDoc(e, selectedClient, "declaracion")
                        }
                        className={barraDocSidebar(declCargada, "federales")}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          Declaración
                        </span>
                        <span className="text-[9px] font-bold opacity-80">
                          {declCargada ? "Ver / reemplazar" : "Subir PDF"}
                        </span>
                      </button>
                      {(() => {
                        const regFed = reg ? asegurarBloques(reg) : null;
                        const lineaFed = regFed?.federales.lineasCaptura[0];
                        if (!lineaFed) {
                          return !sinPago ? (
                            <p className="text-[9px] font-bold text-blue-600/70 px-1">
                              Publica el previo para generar la línea de captura.
                            </p>
                          ) : null;
                        }
                        const desglose =
                          lineaFed.conceptos && lineaFed.conceptos.length > 0
                            ? lineaFed.conceptos
                                .map(
                                  (c) =>
                                    `${c.etiqueta} ${formatMontoImpuesto(c.monto)}`
                                )
                                .join(" · ")
                            : lineaFed.monto > 0
                              ? formatMontoImpuesto(lineaFed.monto)
                              : null;
                        return (
                          <button
                            type="button"
                            disabled={!adminPuedeSubirPdf(reg, "impuestos")}
                            onClick={(e) =>
                              abrirModalDoc(
                                e,
                                selectedClient,
                                "impuestos",
                                lineaFed.id
                              )
                            }
                            className={barraDocSidebar(
                              !!lineaFed.documento,
                              "federales"
                            )}
                          >
                            <span className="min-w-0 text-left">
                              <span className="block text-[10px] font-black uppercase tracking-wider">
                                {categoriaTieneExtemporaneo(reg, "federales")
                                  ? "Línea original"
                                  : "Línea de captura"}
                              </span>
                              {desglose && (
                                <span className="block text-[8px] font-bold opacity-80 truncate mt-0.5 normal-case tracking-normal">
                                  {desglose}
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] font-bold opacity-80 shrink-0">
                              {lineaFed.documento
                                ? "Ver / reemplazar"
                                : "Subir PDF"}
                            </span>
                          </button>
                        );
                      })()}
                      {(() => {
                        const lineaExt = reg?.extemporaneo?.federales?.lineas[0];
                        if (!lineaExt) return null;
                        const original = getSubtotalCategoria(reg!, "federales");
                        const recargo =
                          Math.round((lineaExt.monto - original) * 100) / 100;
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              setModalExtemp({
                                cliente: selectedClient,
                                periodo,
                                categoria: "federales",
                              })
                            }
                            className={barraDocSidebar(
                              !!lineaExt.documento,
                              "extemporaneo"
                            )}
                          >
                            <span className="min-w-0 text-left">
                              <span className="block text-[10px] font-black uppercase tracking-wider">
                                Línea extemporánea
                              </span>
                              <span className="block text-[8px] font-bold opacity-90 truncate mt-0.5 normal-case tracking-normal">
                                {formatMontoImpuesto(lineaExt.monto)}
                                {recargo > 0
                                  ? ` · recargo +${formatMontoImpuesto(recargo)}`
                                  : ""}
                                {lineaExt.fechaLimite
                                  ? ` · vence ${formatFechaLimiteImpuestoCorta(lineaExt.fechaLimite)}`
                                  : ""}
                              </span>
                            </span>
                            <span className="text-[9px] font-bold opacity-80 shrink-0">
                              {lineaExt.documento ? "Ver / editar" : "Editar"}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  )}
                  {imssOn && (
                    <div className="rounded-2xl border border-green-200 bg-green-50/40 p-3 space-y-2">
                      <p className="text-[9px] font-black uppercase text-green-700 tracking-widest">
                        {CATEGORIA_META.imss.label}
                      </p>
                      <button
                        type="button"
                        disabled={!adminPuedeSubirPdf(reg, "sipare")}
                        onClick={(e) => abrirModalDoc(e, selectedClient, "sipare")}
                        className={barraDocSidebar(sipareCargado, "imss")}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          SIPARE
                        </span>
                        <span className="text-[9px] font-bold opacity-80">
                          {sipareCargado ? "Ver / reemplazar" : "Subir PDF"}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={!adminPuedeSubirPdf(reg, "ema")}
                        onClick={(e) =>
                          abrirModalDoc(e, selectedClient, "ema", undefined, 0)
                        }
                        className={barraDocSidebar(emaCargado, "imss")}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          EMA
                        </span>
                        <span className="text-[9px] font-bold opacity-80">
                          {emaCargado ? "Ver / reemplazar" : "Subir PDF"}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={!adminPuedeSubirPdf(reg, "eba")}
                        onClick={(e) =>
                          abrirModalDoc(e, selectedClient, "eba", undefined, 0)
                        }
                        className={barraDocSidebar(ebaCargado, "imss")}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          EBA
                        </span>
                        <span className="text-[9px] font-bold opacity-80">
                          {ebaCargado ? "Ver / reemplazar" : "Subir PDF"}
                        </span>
                      </button>
                      {(() => {
                        const lineaExt = reg?.extemporaneo?.imss?.lineas[0];
                        if (!lineaExt) return null;
                        const original = getSubtotalCategoria(reg!, "imss");
                        const recargo =
                          Math.round((lineaExt.monto - original) * 100) / 100;
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              setModalExtemp({
                                cliente: selectedClient,
                                periodo,
                                categoria: "imss",
                              })
                            }
                            className={barraDocSidebar(
                              !!lineaExt.documento,
                              "extemporaneo"
                            )}
                          >
                            <span className="min-w-0 text-left">
                              <span className="block text-[10px] font-black uppercase tracking-wider">
                                Línea extemporánea
                              </span>
                              <span className="block text-[8px] font-bold opacity-90 truncate mt-0.5 normal-case tracking-normal">
                                {formatMontoImpuesto(lineaExt.monto)}
                                {recargo > 0
                                  ? ` · recargo +${formatMontoImpuesto(recargo)}`
                                  : ""}
                              </span>
                            </span>
                            <span className="text-[9px] font-bold opacity-80 shrink-0">
                              {lineaExt.documento ? "Ver / editar" : "Editar"}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  )}
                  {estOn && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3 space-y-2">
                      <p className="text-[9px] font-black uppercase text-amber-700 tracking-widest">
                        {CATEGORIA_META.estatales.label}
                      </p>
                      {(reg?.estatales.lineasCaptura ?? []).map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          disabled={!adminPuedeSubirPdf(reg, "estatales")}
                          onClick={(e) =>
                            abrirModalDoc(e, selectedClient, "estatales", l.id)
                          }
                          className={barraDocSidebar(!!l.documento, "estatales")}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {categoriaTieneExtemporaneo(reg, "estatales")
                              ? "Línea original"
                              : "Línea de captura"}
                          </span>
                          <span className="text-[9px] font-bold opacity-80">
                            {l.documento ? "Ver / reemplazar" : "Subir PDF"}
                          </span>
                        </button>
                      ))}
                      {(() => {
                        const lineaExt = reg?.extemporaneo?.estatales?.lineas[0];
                        if (!lineaExt) return null;
                        const original = getSubtotalCategoria(reg!, "estatales");
                        const recargo =
                          Math.round((lineaExt.monto - original) * 100) / 100;
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              setModalExtemp({
                                cliente: selectedClient,
                                periodo,
                                categoria: "estatales",
                              })
                            }
                            className={barraDocSidebar(
                              !!lineaExt.documento,
                              "extemporaneo"
                            )}
                          >
                            <span className="min-w-0 text-left">
                              <span className="block text-[10px] font-black uppercase tracking-wider">
                                Línea extemporánea
                              </span>
                              <span className="block text-[8px] font-bold opacity-90 truncate mt-0.5 normal-case tracking-normal">
                                {formatMontoImpuesto(lineaExt.monto)}
                                {recargo > 0
                                  ? ` · recargo +${formatMontoImpuesto(recargo)}`
                                  : ""}
                              </span>
                            </span>
                            <span className="text-[9px] font-bold opacity-80 shrink-0">
                              {lineaExt.documento ? "Ver / editar" : "Editar"}
                            </span>
                          </button>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={(e) => abrirModalNomina(e, selectedClient)}
                        className={barraDocSidebar(nNominaSidebar > 0, "nomina")}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          Nómina
                        </span>
                        <span className="text-[9px] font-bold opacity-80">
                          {nNominaSidebar > 0
                            ? `${nNominaSidebar} arch. · Ver`
                            : "Subir"}
                        </span>
                      </button>
                    </div>
                  )}
                  {repseOn && (
                    <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-3 space-y-2">
                      <p className="text-[9px] font-black uppercase text-violet-700 tracking-widest">
                        REPSE · {periodoRepseLabel(pRepseSidebar)}
                      </p>
                      <p className="text-[8px] font-bold text-violet-700/70 -mt-1">
                        Se presenta en {etiquetaMesPresentacion(pRepseSidebar.cuatrimestre)}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => abrirRepse(e, selectedClient, "sisub")}
                        className={barraDocSidebar(!!regRepseSidebar?.sisub, "repse")}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          SISUB
                        </span>
                        <span className="text-[9px] font-bold opacity-80">
                          {regRepseSidebar?.sisub ? "Ver / reemplazar" : "Subir PDF"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => abrirRepse(e, selectedClient, "icsoe")}
                        className={barraDocSidebar(!!regRepseSidebar?.icsoe, "repse")}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          ICSOE
                        </span>
                        <span className="text-[9px] font-bold opacity-80">
                          {regRepseSidebar?.icsoe ? "Ver / reemplazar" : "Subir PDF"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            </>
            )}

            {pasoEditando === "paso6" && (
            <>
            <p className="text-[11px] font-semibold text-slate-500 mb-3 leading-snug">
              El cliente puede subir comprobante en PDF o imagen (JPG/PNG/WebP).
              Si ya pagó y no se refleja, usa &quot;Marcar pagado&quot;.
            </p>
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
                    Publique o actualice la línea extemporánea (con recargos) para
                    que el cliente pueda pagar. Queda aparte de la línea original.
                    Si el cliente ya pagó, márcalo abajo como pagado.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {vencidas.map((cat) => {
                      const yaExt = categoriaTieneExtemporaneo(reg, cat);
                      const lineaExt = reg?.extemporaneo?.[cat]?.lineas[0];
                      return (
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
                          {yaExt
                            ? `Editar extemporánea · ${CATEGORIA_META[cat].label}${
                                lineaExt
                                  ? ` · ${formatMontoImpuesto(lineaExt.monto)}`
                                  : ""
                              }`
                            : `+ Línea extemporánea · ${CATEGORIA_META[cat].label}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!reg || !previewPublicado(reg) || esSinPagoImpuestos(reg)) {
                return null;
              }
              const catsPago = categoriasConPagoEnPreview(
                selectedClient,
                asegurarBloques(reg)
              );
              if (!catsPago.length) return null;

              const pendientes = catsPago.filter(
                (cat) => !pagoValidadoCategoria(reg, cat)
              );
              const confirmados = catsPago.filter((cat) =>
                pagoValidadoCategoria(reg, cat)
              );
              if (!pendientes.length && !confirmados.length) return null;

              return (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 mb-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-800 mb-1">
                    Confirmación de pago
                  </p>
                  <p className="text-[10px] font-bold text-emerald-800/80 leading-snug mb-2">
                    Si el cliente ya pagó y no subió comprobante (o no se refleja),
                    márcalo como pagado. Sirve para el mes actual y meses
                    anteriores.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {pendientes.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({
                            titulo: "Marcar como pagado",
                            mensaje: `¿Confirmas que ${selectedClient.razonSocial} ya pagó ${CATEGORIA_META[cat].label} de ${periodoLabel(periodo)}? Se cerrará el periodo aunque no haya comprobante en el portal.`,
                            textoConfirmar: "Sí, marcar pagado",
                            tono: "warning",
                          });
                          if (!ok) return;
                          await marcarPagoManualCategoria(
                            selectedClient.id,
                            periodo,
                            cat
                          );
                          notify({
                            titulo: "Pago marcado",
                            mensaje: `${CATEGORIA_META[cat].label} de ${periodoLabel(periodo)} quedó como pagado.`,
                            tono: "info",
                          });
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700"
                      >
                        Marcar pagado · {CATEGORIA_META[cat].label}
                      </button>
                    ))}
                    {confirmados.map((cat) => {
                      const manual = pagoMarcadoManualCategoria(reg, cat);
                      return (
                        <div
                          key={cat}
                          className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-2.5 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                              {CATEGORIA_META[cat].label} · pagado
                            </p>
                            <p className="text-[9px] font-bold text-emerald-700/70">
                              {manual
                                ? "Marcado manualmente por el despacho"
                                : "Validado con comprobante del cliente"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await confirm({
                                titulo: "Revertir pago",
                                mensaje:
                                  "El periodo volverá a aparecer como pendiente de pago.",
                                textoConfirmar: "Revertir",
                                tono: "warning",
                              });
                              if (!ok) return;
                              await revertirValidacionPagoCategoria(
                                selectedClient.id,
                                periodo,
                                cat
                              );
                            }}
                            className="shrink-0 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[8px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                          >
                            Revertir
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!reg || !tieneResumenImpuestos(reg)) return null;
              const cats = ["federales", "imss", "estatales"] as CategoriaId[];
              const algunaExt = cats.some((c) =>
                categoriaTieneExtemporaneo(reg, c)
              );
              let montoMostrar = reg.montoImpuesto;
              if (algunaExt) {
                montoMostrar = cats.reduce((s, c) => {
                  const ext = reg.extemporaneo?.[c]?.lineas[0]?.monto;
                  if (ext != null && ext > 0) return s + ext;
                  return s + getSubtotalCategoria(reg, c);
                }, 0);
              }
              const fechaMostrar =
                getFechaLimiteMasProxima(reg) || reg.fechaLimite;
              return (
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div
                    className={`rounded-2xl border p-3 flex flex-col justify-between min-h-[90px] ${
                      algunaExt
                        ? "bg-red-50 border-red-200"
                        : "bg-slate-100 border-slate-200"
                    }`}
                  >
                    <p
                      className={`text-[8px] font-black uppercase tracking-widest ${
                        algunaExt ? "text-red-600" : "text-slate-500"
                      }`}
                    >
                      {algunaExt ? "Pago extemporáneo" : "Pago impuestos"}
                    </p>
                    <p
                      className={`text-lg font-black tabular-nums ${
                        algunaExt ? "text-red-800" : "text-slate-900"
                      }`}
                    >
                      {formatMontoImpuesto(montoMostrar)}
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl border p-3 flex flex-col justify-between min-h-[90px] ${
                      algunaExt
                        ? "bg-red-50 border-red-200"
                        : "bg-slate-100 border-slate-200"
                    }`}
                  >
                    <p
                      className={`text-[8px] font-black uppercase tracking-widest ${
                        algunaExt ? "text-red-600" : "text-slate-500"
                      }`}
                    >
                      {algunaExt ? "Nueva fecha límite" : "Fecha límite"}
                    </p>
                    <p
                      className={`text-base font-black tabular-nums tracking-wider leading-tight ${
                        algunaExt ? "text-red-800" : "text-slate-900"
                      }`}
                    >
                      {formatFechaLimiteImpuestoCompacta(fechaMostrar)}
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
                                  await revertirValidacionPagoCategoria(
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
                              onClick={() => {
                                void validarPagoCategoria(
                                  selectedClient.id,
                                  periodo,
                                  cat
                                );
                              }}
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
              if (!reg || !previewPublicado(reg) || !reg.fechaLimite) return null;
              return (
                <BotonCorreoCumplimiento
                  cliente={selectedClient}
                  periodo={periodo}
                  tipo="recordatorio_limite"
                  registro={reg}
                  variante="ancho"
                  className="mb-4"
                  titulo="Recordatorio de fecha límite"
                  habilitado={
                    !!selectedClient.email &&
                    isValidEmail(selectedClient.email ?? "")
                  }
                  motivo="Cliente sin correo válido"
                  notify={notify}
                  enviadoEn={reg.recordatorioLimiteEnviadoEn}
                  onContactado={() =>
                    marcarRecordatorioLimiteEnviado(selectedClient.id, periodo)
                  }
                />
              );
            })()}

            </>
            )}

            {pasoEditando === "paso7" && (
            <>
            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              const sinPago = esSinPagoImpuestos(reg);
              const catsPago = reg
                ? categoriasConPagoEnPreview(selectedClient, asegurarBloques(reg))
                : [];
              const emailOk =
                !!selectedClient.email && isValidEmail(selectedClient.email);
              const habilitado = sinPago
                ? !!reg &&
                  documentoAdminCargado(reg, "declaracion") &&
                  emailOk
                : puedeNotificarCumplimiento(
                    reg,
                    categoriasHabilitadasCliente(selectedClient)
                  ) &&
                  !!reg &&
                  previewPublicado(reg) &&
                  emailOk;

              return (
                <BotonCorreoCumplimiento
                  cliente={selectedClient}
                  periodo={periodo}
                  tipo={sinPago ? "sin_pago" : "listo"}
                  registro={reg}
                  opts={
                    catsPago.length > 0 ? { categorias: catsPago } : undefined
                  }
                  variante="ancho"
                  titulo={textoNotificarCorreo(selectedClient, reg)}
                  habilitado={habilitado}
                  motivo="Complete requisitos o agregue correo válido"
                  notify={notify}
                  enviadoEn={reg?.notificadoEn}
                  onContactado={() => {
                    if (sinPago) {
                      marcarCumplimientoNotificado(selectedClient.id, periodo);
                    } else {
                      marcarNotificadoSiAplica(
                        selectedClient,
                        reg,
                        marcarCumplimientoNotificado,
                        periodo
                      );
                    }
                  }}
                />
              );
            })()}
            </>
            )}
            </div>
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
