"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminDeepLink } from "@/hooks/useAdminDeepLink";
import { useScrollLock } from "@/hooks/useScrollLock";
import MontoInput from "@/components/MontoInput";
import { parseMontoInput, formatMontoDesdeNumero } from "@/lib/monto-input";
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
  puedeNotificarCumplimiento,
  formatMontoImpuesto,
  formatFechaLimiteImpuesto,
  formatFechaLimiteImpuestoCorta,
  formatFechaLimiteImpuestoCompacta,
  contarArchivosNomina,
  getSubtotalCategoria,
  getFechaLimiteEfectivaCategoria,
  lineaExtemporaneaVigente,
  categoriaConPagoEnRegistro,
  categoriaTieneAlgunDocumento,
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
  TONO_SAT,
  TONO_IMSS,
  TONO_ESTATAL,
  TONO_REPSE,
  pagoValidadoCategoria,
  todosPagosValidados,
  algunDocumentoFiscalSubido,
  algunComprobantePagoCargado,
  contabilidadIniciada,
  cierreContableCapturado,
  getTotalImpuestos,
  getFechaLimitePrincipal,
  hayCargoEnPrevio,
  esSinPagoImpuestos,
  categoriasVencidasSinPago,
  categoriaTieneExtemporaneo,
  getFechaLimiteMasProxima,
  normalizarSaldoFavorLineas,
  documentosFiscalesCompletos,
  diasHastaLimite,
  claseUrgenciaLimiteCaptura,
  parseFechaLimite,
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
import { formatearLineaCapturaSat } from "@/lib/sat-linea-captura";
import ModalSubirNomina from "@/components/ModalSubirNomina";
import ModalPrevisImpuestos from "@/components/ModalPrevisImpuestos";
import { abrirPdfEnNuevaPestana } from "@/lib/pdf-blob";
import NotificacionesBell from "@/components/NotificacionesBell";
import FlujoCumplimientoTimeline from "@/components/FlujoCumplimientoTimeline";
import {
  tituloPaso,
  numDePaso,
  pasoDeNum,
  type PasoBucket,
} from "@/components/admin/AdminCumplimientoPasosRail";
import WorkflowCircleMini from "@/components/admin/WorkflowCircleMini";
import DiaContabilidadCircle from "@/components/admin/DiaContabilidadCircle";
import BotonesCalendarioContabilidad from "@/components/admin/BotonesCalendarioContabilidad";
import AdminPageHeading from "@/components/admin/AdminPageHeading";
import BotonExportarMenu from "@/components/admin/BotonExportarMenu";
import MenuFiltroIcono from "@/components/admin/MenuFiltroIcono";
import { getWorkflowMesCliente } from "@/lib/cobranza-workflow";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaldoFavorEditor from "@/components/admin/SaldoFavorEditor";
import AdminDocumentosSAT from "@/components/admin/AdminDocumentosSAT";
import {
  PildorasCategoriaFicha,
  PildorasSatInner,
  pestanasVisiblesCliente,
  type PestanaFicha,
  type PestanaSat,
} from "@/components/admin/FichaPildorasCumplimiento";
import FichaSatHistorico from "@/components/admin/FichaSatHistorico";
import FichaSatCarpeta from "@/components/admin/FichaSatCarpeta";
import DropClasificarPdf, {
  type DestinoDropPdf,
} from "@/components/admin/DropClasificarPdf";
import AvatarCliente from "@/components/admin/AvatarCliente";
import CumplimientoCardMovil from "@/components/admin/CumplimientoCardMovil";
import CronogramaCumplimiento from "@/components/admin/CronogramaCumplimiento";
import VistaFederalCumplimiento from "@/components/admin/VistaFederalCumplimiento";
import ConfirmarPagoImpuestos from "@/components/admin/ConfirmarPagoImpuestos";
import ModalSubirRepse from "@/components/admin/ModalSubirRepse";
import {
  type TipoDocumentoRepse,
  periodoRepseDesdePeriodoMensual,
  periodoRepseSiHayPresentacion,
  periodoRepseLabel,
  etiquetaMesPresentacion,
} from "@/lib/repse";
import { FLUJO_NUMERO } from "@/lib/cobranza-workflow";
import {
  claseChipRegimen,
  etiquetaRegimenCorto,
  regimenPorClave,
} from "@/lib/regimenes-fiscales";
import {
  fechaLimiteSATConOverride,
  formatearDiaMesCorto,
} from "@/lib/portal/fechas-fiscales";
import EditorFechaLimiteSat, {
  FechaEditableConLapiz,
} from "@/components/admin/EditorFechaLimiteSat";
import EncabezadoFiltroTabla from "@/components/admin/EncabezadoFiltroTabla";
import PedirCapturaPortal from "@/components/admin/PedirCapturaPortal";
import {
  construirExportCumplimiento,
  exportarCumplimientoExcel,
  exportarCumplimientoPdf,
  exportarVistaFederalExcel,
  exportarVistaFederalPdf,
} from "@/lib/cumplimiento-export";

/** Nombre abreviado para botones de navegación (ej. "← B-Water"). */
function nombreCortoCliente(razonSocial: string): string {
  const limpio = razonSocial.trim();
  if (limpio.length <= 18) return limpio;
  const primera = limpio.split(/\s+/)[0] ?? limpio;
  return primera.length <= 18 ? primera : `${primera.slice(0, 16)}…`;
}

function CierreContableCampos({
  ingresos,
  gastos,
  ventasExentas,
  registrado,
  esResico,
  onGuardar,
}: {
  ingresos: number;
  gastos: number;
  ventasExentas: number;
  registrado: boolean;
  esResico: boolean;
  onGuardar: (d: {
    ingresos: number;
    gastos: number;
    ventasExentas?: number;
  }) => void;
}) {
  const [ing, setIng] = useState(ingresos ? formatMontoDesdeNumero(ingresos, 2) : "");
  const [gas, setGas] = useState(gastos ? formatMontoDesdeNumero(gastos, 2) : "");
  const [exe, setExe] = useState(ventasExentas ? formatMontoDesdeNumero(ventasExentas, 2) : "");
  const nIng = parseMontoInput(ing);
  const nGas = parseMontoInput(gas);
  const nExe = parseMontoInput(exe);
  const utilidad = Math.round((nIng - nGas) * 100) / 100;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 mb-2 space-y-3">
      <p className="text-[12px] font-semibold text-slate-600 leading-snug">
        Subtotales del mes. Al guardar, este paso queda listo.
        {esResico
          ? " En RESICO el ISR va sobre ingresos, no sobre utilidad; el IVA sí usa estos subtotales."
          : " La utilidad alimenta el ISR; el subtotal de ventas queda claro aunque sea exento de IVA."}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-[10px] font-semibold text-slate-400 mb-1">
            Ingresos (subtotal)
          </span>
          <MontoInput
            decimales={2}
            value={ing}
            onChange={setIng}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-bold tabular-nums"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] font-semibold text-slate-400 mb-1">
            Gastos (subtotal)
          </span>
          <MontoInput
            decimales={2}
            value={gas}
            onChange={setGas}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-bold tabular-nums"
          />
        </label>
      </div>
      <label className="block">
        <span className="block text-[10px] font-semibold text-slate-400 mb-1">
          Ventas exentas de IVA (si aplica)
        </span>
        <MontoInput
          decimales={2}
          value={exe}
          onChange={setExe}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-bold tabular-nums"
        />
      </label>
      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
        <span className="text-[11px] font-semibold text-slate-500">Utilidad</span>
        <span
          className={`text-[15px] font-bold tabular-nums ${
            utilidad >= 0 ? "text-slate-800" : "text-red-600"
          }`}
        >
          {formatMontoImpuesto(utilidad)}
        </span>
      </div>
      <button
        type="button"
        onClick={() =>
          onGuardar({
            ingresos: nIng,
            gastos: nGas,
            ventasExentas: nExe > 0 ? nExe : undefined,
          })
        }
        className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-[11px] font-bold hover:bg-slate-900"
      >
        {registrado ? "Actualizar y continuar" : "Registrar cierre"}
      </button>
    </div>
  );
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
  archivoInicial?: File;
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
  archivoInicial?: File;
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
      return TONO_IMSS.fill;
    case "estatales":
      return TONO_ESTATAL.fill;
    case "repse":
      return TONO_REPSE.fill;
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
      imss: TONO_IMSS.fill,
      estatales: TONO_ESTATAL.fill,
      repse: TONO_REPSE.fill,
      nomina: "bg-orange-600 text-white hover:bg-orange-700",
      extemporaneo: "bg-red-600 text-white hover:bg-red-700",
    }[cat];
    return `${base} ${solido}`;
  }
  const outline = {
    federales: "bg-white border border-blue-200 text-blue-800 hover:bg-blue-50",
    imss: "bg-white border border-green-200 text-green-800 hover:bg-green-50",
    estatales: TONO_ESTATAL.outline,
    repse: TONO_REPSE.outline,
    nomina: "bg-white border border-orange-200 text-orange-800 hover:bg-orange-50",
    extemporaneo: "bg-white border border-red-200 text-red-800 hover:bg-red-50",
  }[cat];
  return `${base} ${outline}`;
}

const SIN_REGIMEN = "__sin__";

function diasHastaUnaFecha(dt: Date, hoy = new Date()): number {
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fin = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  return Math.round((fin.getTime() - inicio.getTime()) / 86_400_000);
}

function claseUrgenciaFecha(fecha: Date | string | null | undefined): string {
  if (!fecha) return "text-slate-400";
  if (fecha instanceof Date) return claseUrgenciaLimiteCaptura(diasHastaUnaFecha(fecha));
  return claseUrgenciaLimiteCaptura(diasHastaLimite(fecha));
}

/** Venc. decl.: gris en plazo, negro si quedan ≤5 días, rojo si ya venció. */
function claseVencDecl(fecha: Date | null): string {
  if (!fecha) return "text-slate-400";
  const dias = diasHastaUnaFecha(fecha);
  if (dias < 0) return "text-red-600";
  if (dias <= 5) return "text-slate-900";
  return "text-slate-500";
}

function etiquetaFechaCorta(fecha: string): string {
  const dt = parseFechaLimite(fecha);
  return dt ? formatearDiaMesCorto(dt) : fecha;
}

function regimenLabelCliente(c: Cliente): string {
  if (!c.regimenFiscalClave) return "Sin régimen";
  return regimenPorClave(c.regimenFiscalClave)?.label ?? c.regimenFiscalClave;
}

function claveRegimenCliente(c: Cliente): string {
  return c.regimenFiscalClave ?? SIN_REGIMEN;
}
/** Separador vertical entre grupos de columnas (tenue). */
const SEP_GRUPO = "border-l border-black/10";
/** Ancho único SAT / IMSS / Estatales; REPSE (ICSOE+SISUB) suma el mismo. */
const COL_OBLIG = "w-[8.75rem] min-w-[8.75rem] max-w-[8.75rem]";
const COL_REPSE = "w-[4.375rem] min-w-[4.375rem] max-w-[4.375rem]";

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
      disabled={!habilitado && !cargado}
      title={
        !habilitado && !cargado
          ? "Publica el previo para habilitar"
          : cargado
            ? "Ver o reemplazar PDF"
            : undefined
      }
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${
        !habilitado && !cargado
          ? "bg-slate-50 text-slate-300 cursor-not-allowed"
          : chipDocumento(cargado, variante)
      }`}
    >
      <PdfIcon />
      {etiqueta ?? (cargado ? "PDF" : "Subir")}
    </button>
  );
}

const PUNTO_PDF: Record<CategoriaId, { fill: string; ring: string }> = {
  federales: { fill: "bg-[#1D4ED8]", ring: "border-[#1D4ED8]" },
  imss: { fill: "bg-[#006847]", ring: "border-[#006847]" },
  estatales: { fill: "bg-[#D98638]", ring: "border-[#D98638]" },
};

function PuntoPdf({ cat, cargado }: { cat: CategoriaId; cargado: boolean }) {
  const t = PUNTO_PDF[cat];
  return (
    <span
      title={cargado ? "PDF cargado" : "Sin PDF"}
      className={`mx-auto mb-1 block h-1.5 w-1.5 rounded-full ${
        cargado ? t.fill : `border-[1.5px] bg-transparent ${t.ring}`
      }`}
      aria-label={cargado ? "PDF cargado" : "Sin PDF"}
    />
  );
}

function CeldaMontoLimite({
  reg,
  cat,
  aplica,
  conPago,
  borderClass = "",
}: {
  reg: import("@/lib/cumplimiento").RegistroCumplimiento | undefined;
  cat: CategoriaId;
  aplica: boolean;
  conPago: boolean;
  borderClass?: string;
}) {
  if (!aplica) {
    return <td className={`px-3 py-3 text-center ${COL_OBLIG} ${borderClass}`} />;
  }
  const cargado = categoriaTieneAlgunDocumento(reg, cat);
  if (!reg || !conPago) {
    return (
      <td className={`px-3 py-3 text-center ${COL_OBLIG} ${borderClass}`}>
        <PuntoPdf cat={cat} cargado={cargado} />
        <span className="text-[12px] text-slate-300">—</span>
      </td>
    );
  }
  const monto = getSubtotalCategoria(reg, cat);
  const fecha = getFechaLimiteEfectivaCategoria(reg, cat);
  return (
    <td className={`px-3 py-3 text-center ${COL_OBLIG} ${borderClass}`}>
      <PuntoPdf cat={cat} cargado={cargado} />
      <p className="text-[13px] font-bold tabular-nums text-slate-900">
        {formatMontoImpuesto(monto)}
      </p>
      {fecha ? (
        <p className={`text-[12px] font-semibold tabular-nums mt-0.5 ${claseUrgenciaFecha(fecha)}`}>
          {etiquetaFechaCorta(fecha)}
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
    irAPeriodo,
    getCumplimientoPeriodo,
    marcarCumplimientoNotificado,
    marcarRecordatorioLimiteEnviado,
    marcarPreLimiteEnviado,
    marcarCorreoCumplimientoPaso,
    eliminarPreviewImpuestos,
    revertirValidacionPagoCategoria,
    marcarContabilidadIniciada,
    revertirContabilidadIniciada,
    guardarCierreContable,
    revertirCierreContable,
    revertirPreviewPublicado,
    revertirConfirmacionPreview,
    marcarSinPagoImpuestos,
    revertirSinPagoImpuestos,
    actualizarSaldoFavor,
    actualizarCliente,
    getRegistroRepseCliente,
    confirmarPreviewCliente,
    liberarDudaPrevioAdmin,
    guardarFechaLimiteDeclaracion,
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
  const [pestanaFicha, setPestanaFicha] = useState<PestanaFicha>("sat");
  const [pestanaSat, setPestanaSat] = useState<PestanaSat>("cumplimiento");
  const [cierreClave, setCierreClave] = useState<string | null>(null);
  const [cierreVisto, setCierreVisto] = useState<string | null>(null);
  const [modalRepse, setModalRepse] = useState<ModalRepseState | null>(null);
  const [vistaLista, setVistaLista] = useState<"tabla" | "anual" | "federal">(
    "tabla"
  );
  const [resaltadoId, setResaltadoId] = useState<number | null>(null);

  useAdminDeepLink({
    listaClientes,
    onPeriodo: irAPeriodo,
    onCliente: (c) => {
      setResaltadoId(c.id);
      setSelectedClient(c);
    },
  });

  useScrollLock(Boolean(selectedClient));
  useEffect(() => {
    if (!selectedClient) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedClient(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedClient]);

  const mesLabel = periodoLabel(periodo);

  useEffect(() => {
    if (!resaltadoId) return;
    const t = window.setTimeout(() => {
      const nodos = document.querySelectorAll(
        `[data-cumplimiento-cli="${resaltadoId}"]`
      );
      for (const el of nodos) {
        if (el.getBoundingClientRect().height > 0) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
    }, 280);
    return () => window.clearTimeout(t);
  }, [resaltadoId, periodo.mes, periodo.anio]);

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
    const visibles = pestanasVisiblesCliente({
      sat: categoriaAplicaCliente(selectedClient, "federales"),
      imss: categoriaAplicaCliente(selectedClient, "imss"),
      estatales: categoriaAplicaCliente(selectedClient, "estatales"),
      repse: selectedClient.configRepse?.habilitado === true,
    });
    setPestanaFicha(visibles[0] ?? "sat");
    setPestanaSat("cumplimiento");
    // Solo al abrir/cambiar cliente o periodo — no al mutar el registro.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bucket al abrir
  }, [selectedClient?.id, periodo.mes, periodo.anio]);

  const bucketSel = selectedClient ? bucketCliente(selectedClient) : null;
  useEffect(() => {
    if (!selectedClient || bucketSel !== "paso7") return;
    const clave = `${selectedClient.id}-${periodo.mes}-${periodo.anio}`;
    if (cierreVisto !== clave) setCierreClave(clave);
  }, [selectedClient, bucketSel, periodo.mes, periodo.anio, cierreVisto]);

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
        const ta = fedA
          ? fechaLimiteSATConOverride(
              a.rfc,
              periodo,
              getCumplimientoPeriodo(a.id, periodo)?.fechaLimiteDeclaracion
            ).getTime()
          : 0;
        const tb = fedB
          ? fechaLimiteSATConOverride(
              b.rfc,
              periodo,
              getCumplimientoPeriodo(b.id, periodo)?.fechaLimiteDeclaracion
            ).getTime()
          : 0;
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
    getCumplimientoPeriodo,
  ]);

  const columnasTablero = useMemo(() => {
    const hayImss = clientes.some((c) => categoriaAplicaCliente(c, "imss"));
    const hayEstatales = clientes.some((c) => categoriaAplicaCliente(c, "estatales"));
    const pRepse = periodoRepseSiHayPresentacion(periodo);
    const hayRepse =
      !!pRepse && clientes.some((c) => c.configRepse?.habilitado === true);
    const cols =
      4 + 1 + (hayImss ? 1 : 0) + (hayEstatales ? 1 : 0) + (hayRepse ? 2 : 0) + 2;
    return { hayImss, hayEstatales, hayRepse, pRepse, cols };
  }, [clientes, periodo]);

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
    setExportando(true);
    try {
      if (vistaLista === "federal") {
        await exportarVistaFederalExcel(
          clientes,
          periodo,
          getCumplimientoPeriodo
        );
        void notify({
          titulo: "Excel descargado",
          mensaje: `Vista federal ${periodo.anio} · ${clientes.length} clientes.`,
          tono: "info",
        });
        return;
      }
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
    setExportando(true);
    try {
      if (vistaLista === "federal") {
        await exportarVistaFederalPdf(
          clientes,
          periodo,
          getCumplimientoPeriodo
        );
        void notify({
          titulo: "PDF descargado",
          mensaje: `Vista federal ${periodo.anio} · importes del año.`,
          tono: "info",
        });
        return;
      }
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
    const pRepse =
      periodoRepseSiHayPresentacion(periodo) ??
      periodoRepseDesdePeriodoMensual(periodo);
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

  const abrirDocDesdeDrop = (d: DestinoDropPdf) => {
    if (!selectedClient) return;
    if (d.tipoId === "icsoe" || d.tipoId === "sisub") {
      const pRepse =
        periodoRepseSiHayPresentacion(d.periodo) ??
        periodoRepseDesdePeriodoMensual(d.periodo);
      setModalRepse({
        cliente: selectedClient,
        periodoRepse: pRepse,
        tipo: d.tipoId,
        archivoInicial: d.file,
      });
      return;
    }
    if (d.tipoId === "nomina") {
      setModalNomina({
        cliente: selectedClient,
        periodo: d.periodo,
        modo: "nomina",
      });
      return;
    }
    const tipo = d.tipoId as TipoDocumentoSingular;
    const reg = getCumplimientoPeriodo(selectedClient.id, d.periodo);
    const lineaId =
      tipo === "impuestos" && reg
        ? asegurarBloques(reg).federales.lineasCaptura[0]?.id
        : undefined;
    setModalDoc({
      cliente: selectedClient,
      periodo: d.periodo,
      tipo: tipo === "imss" ? "sipare" : tipo,
      lineaId,
      archivoInicial: d.file,
    });
  };

  const pestanasCliente = selectedClient
    ? pestanasVisiblesCliente({
        sat: categoriaAplicaCliente(selectedClient, "federales"),
        imss: categoriaAplicaCliente(selectedClient, "imss"),
        estatales: categoriaAplicaCliente(selectedClient, "estatales"),
        repse: selectedClient.configRepse?.habilitado === true,
      })
    : [];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-full overflow-x-hidden">
      <AdminPageHeading
        titulo="Cumplimiento"
        subtitulo={`${mesLabel} · Periodo fiscal`}
        acciones={
          <>
            <div className="relative flex-1 min-w-0 lg:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="search"
                placeholder="Buscar…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full min-w-0 lg:w-52 pl-9 pr-3 rounded-full bg-white ring-1 ring-black/[0.06] text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <MenuFiltroIcono
              grupos={[
                {
                  titulo: "Tipo de trabajo",
                  modo: "multiple",
                  opciones: TRABAJO_ORDEN.map((t) => ({
                    id: t,
                    label: TRABAJO_LABEL[t],
                    count: conteoTrabajo[t],
                  })),
                  seleccion: [...filtroTrabajo],
                  onChange: (ids) => setFiltroTrabajo(new Set(ids as TipoTrabajo[])),
                },
                {
                  titulo: "Régimen",
                  modo: "multiple",
                  opciones: regimenesEnCartera.map((r) => ({
                    id: r.clave,
                    label: r.label,
                    count: r.count,
                  })),
                  seleccion: [...filtroRegimen],
                  onChange: (ids) => setFiltroRegimen(new Set(ids)),
                },
              ]}
            />
            <BotonesCalendarioContabilidad compacto />
            <div className="hidden lg:flex shrink-0 rounded-full bg-slate-100 p-1">
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
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                    vistaLista === op.id
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
            <BotonExportarMenu
              exportando={exportando}
              disabled={clientes.length === 0}
              opciones={[
                { id: "excel", label: "Excel", onClick: () => void exportarExcel() },
                { id: "pdf", label: "PDF", onClick: () => void exportarPdf() },
              ]}
            />
          </>
        }
      />

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

      {/* Vista móvil: cards (oculta en escritorio) */}
      <div className="lg:hidden space-y-3 px-1">
        {clientes.length === 0 ? (
          <div className="rounded-[1.25rem] bg-white ring-1 ring-slate-200 p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
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
      <div className={`${vistaLista !== "tabla" ? "hidden" : "hidden lg:block"} bg-white rounded-[1.25rem] border border-slate-50 shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0 table-fixed">
            <colgroup>
              <col />
              <col className="w-[8.5rem]" />
              <col className="w-[5.75rem]" />
              <col className="w-[6.5rem]" />
              <col className={COL_OBLIG} />
              {columnasTablero.hayImss ? <col className={COL_OBLIG} /> : null}
              {columnasTablero.hayEstatales ? <col className={COL_OBLIG} /> : null}
              {columnasTablero.hayRepse ? (
                <>
                  <col className={COL_REPSE} />
                  <col className={COL_REPSE} />
                </>
              ) : null}
              <col className="w-[5.25rem]" />
              <col className="w-[3.5rem]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th
                  rowSpan={columnasTablero.hayRepse ? 2 : 1}
                  className="px-5 py-3 text-[11px] font-semibold text-slate-400 align-bottom bg-slate-50"
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
                  alineacion="center"
                  rowSpan={columnasTablero.hayRepse ? 2 : 1}
                  className="bg-slate-50"
                />
                <th
                  rowSpan={columnasTablero.hayRepse ? 2 : 1}
                  className="px-2 py-3 text-[11px] font-semibold text-slate-400 text-center align-bottom bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrdenVencDecl((prev) =>
                        prev === null ? "asc" : prev === "asc" ? "desc" : null
                      );
                    }}
                    className={`inline-flex items-center gap-1 hover:text-slate-700 ${
                      ordenVencDecl ? "text-slate-800" : ""
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
                  alineacion="center"
                  rowSpan={columnasTablero.hayRepse ? 2 : 1}
                  className="bg-slate-50"
                />
                <th
                  rowSpan={columnasTablero.hayRepse ? 2 : 1}
                  className={`${COL_OBLIG} p-0 align-middle bg-transparent ${SEP_GRUPO}`}
                >
                  <div className={`mx-0.5 h-full ${columnasTablero.hayRepse ? "min-h-[4.5rem]" : "min-h-[2.5rem]"} rounded-t-xl flex items-center justify-center text-[11px] font-bold ${TONO_SAT.header}`}>
                    SAT
                  </div>
                </th>
                {columnasTablero.hayImss ? (
                  <th
                    rowSpan={columnasTablero.hayRepse ? 2 : 1}
                    className={`${COL_OBLIG} p-0 align-middle bg-transparent ${SEP_GRUPO}`}
                  >
                    <div className={`mx-0.5 h-full ${columnasTablero.hayRepse ? "min-h-[4.5rem]" : "min-h-[2.5rem]"} rounded-t-xl flex items-center justify-center text-[11px] font-bold ${TONO_IMSS.header}`}>
                      IMSS
                    </div>
                  </th>
                ) : null}
                {columnasTablero.hayEstatales ? (
                  <th
                    rowSpan={columnasTablero.hayRepse ? 2 : 1}
                    className={`${COL_OBLIG} p-0 align-middle bg-transparent ${SEP_GRUPO}`}
                  >
                    <div className={`mx-0.5 h-full ${columnasTablero.hayRepse ? "min-h-[4.5rem]" : "min-h-[2.5rem]"} rounded-t-xl flex items-center justify-center text-[11px] font-bold ${TONO_ESTATAL.header}`}>
                      Estatales
                    </div>
                  </th>
                ) : null}
                {columnasTablero.hayRepse ? (
                  <th
                    colSpan={2}
                    className={`p-0 bg-transparent ${SEP_GRUPO}`}
                  >
                    <div className={`mx-0.5 h-10 rounded-t-xl flex items-center justify-center text-[11px] font-bold ${TONO_REPSE.header}`}>
                      REPSE
                    </div>
                  </th>
                ) : null}
                <th
                  rowSpan={columnasTablero.hayRepse ? 2 : 1}
                  className={`px-3 py-3 text-[11px] font-semibold text-slate-500 text-center align-bottom bg-slate-50 ${SEP_GRUPO}`}
                >
                  Total
                </th>
                <th
                  rowSpan={columnasTablero.hayRepse ? 2 : 1}
                  className="px-2 py-3 text-[11px] font-semibold text-slate-500 text-center align-bottom bg-slate-50"
                >
                  Mail
                </th>
              </tr>
              {columnasTablero.hayRepse ? (
                <tr className="border-b border-slate-100">
                  <th className={`${COL_REPSE} p-0 bg-transparent ${SEP_GRUPO}`}>
                    <div className={`ml-0.5 h-8 flex items-center justify-center text-[10px] font-bold ${TONO_REPSE.header}`}>
                      ICSOE
                    </div>
                  </th>
                  <th className={`${COL_REPSE} p-0 bg-transparent`}>
                    <div className={`mr-0.5 h-8 flex items-center justify-center text-[10px] font-bold ${TONO_REPSE.header} border-l border-black/10`}>
                      SISUB
                    </div>
                  </th>
                </tr>
              ) : null}
            </thead>
            <tbody>
              {clientes.length > 0 ? (
                clientes.map((cli) => {
                  const reg = getCumplimientoPeriodo(cli.id, periodo);
                  const emailOk = !!cli.email?.trim() && isValidEmail(cli.email);
                  const fedOn = categoriaAplicaCliente(cli, "federales");
                  const imssOn = categoriaAplicaCliente(cli, "imss");
                  const estOn = categoriaAplicaCliente(cli, "estatales");
                  const fedPago = fedOn && !!reg && categoriaConPagoEnRegistro(reg, "federales");
                  const imssPago = imssOn && !!reg && categoriaConPagoEnRegistro(reg, "imss");
                  const estPago = estOn && !!reg && categoriaConPagoEnRegistro(reg, "estatales");
                  const catsPago = reg
                    ? categoriasConPagoEnPreview(cli, asegurarBloques(reg))
                    : [];
                  const totalGeneral = catsPago.reduce(
                    (s, cat) => s + getSubtotalCategoria(reg!, cat),
                    0
                  );
                  const sinPago = esSinPagoImpuestos(reg);
                  const sinPagoCerrado =
                    sinPago && documentoAdminCargado(reg, "declaracion");
                  const bucket = bucketCliente(cli);
                  const filaTono = BUCKET_FILA[bucket];
                  const vencDecl = fedOn
                    ? fechaLimiteSATConOverride(
                        cli.rfc,
                        periodo,
                        reg?.fechaLimiteDeclaracion
                      )
                    : null;
                  const pRepse = columnasTablero.pRepse;
                  const regRepse =
                    pRepse && cli.configRepse?.habilitado
                      ? getRegistroRepseCliente(cli.id, pRepse)
                      : undefined;

                  return (
                    <tr
                      key={cli.id}
                      data-cumplimiento-cli={cli.id}
                      onClick={() => setSelectedClient(cli)}
                      className={`group border-b cursor-pointer transition-colors ${
                        filaTono
                          ? filaTono
                          : "border-slate-50 hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <AvatarCliente cliente={cli} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-slate-900 leading-tight truncate">
                              {cli.razonSocial}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                              {cli.rfc}
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-0.5">
                            <DiaContabilidadCircle cliente={cli} />
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
                      <td className="px-2 py-3 text-center">
                        <span
                          title={regimenLabelCliente(cli)}
                          className={`inline-block max-w-[7.5rem] truncate text-[12px] font-semibold ${claseChipRegimen(cli.regimenFiscalClave)}`}
                        >
                          {etiquetaRegimenCorto(cli.regimenFiscalClave)}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        {vencDecl ? (
                          <span className={`text-[12px] font-semibold tabular-nums ${claseVencDecl(vencDecl)}`}>
                            {formatearDiaMesCorto(vencDecl)}
                          </span>
                        ) : (
                          <span className="text-[12px] text-slate-300">—</span>
                        )}
                      </td>
                      <td
                        className="px-3 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <WorkflowCircleMini
                          resumen={getWorkflowMesCliente(cli, periodo, reg)}
                          popoverHacia="right"
                        />
                      </td>
                      <CeldaMontoLimite
                        reg={reg}
                        cat="federales"
                        aplica={fedOn}
                        conPago={!!fedPago}
                        borderClass={SEP_GRUPO}
                      />
                      {columnasTablero.hayImss ? (
                        <CeldaMontoLimite
                          reg={reg}
                          cat="imss"
                          aplica={imssOn}
                          conPago={!!imssPago}
                          borderClass={SEP_GRUPO}
                        />
                      ) : null}
                      {columnasTablero.hayEstatales ? (
                        <CeldaMontoLimite
                          reg={reg}
                          cat="estatales"
                          aplica={estOn}
                          conPago={!!estPago}
                          borderClass={SEP_GRUPO}
                        />
                      ) : null}
                      {columnasTablero.hayRepse ? (
                        <>
                          <td className={`px-1 py-3 text-center ${COL_REPSE} ${SEP_GRUPO}`}>
                            {cli.configRepse?.habilitado ? (
                              <BotonPdf
                                cargado={!!regRepse?.icsoe}
                                habilitado
                                variante="repse"
                                etiqueta="ICSOE"
                                onClick={(e) => abrirRepse(e, cli, "icsoe")}
                              />
                            ) : null}
                          </td>
                          <td className={`px-1 py-3 text-center ${COL_REPSE}`}>
                            {cli.configRepse?.habilitado ? (
                              <BotonPdf
                                cargado={!!regRepse?.sisub}
                                habilitado
                                variante="repse"
                                etiqueta="SISUB"
                                onClick={(e) => abrirRepse(e, cli, "sisub")}
                              />
                            ) : null}
                          </td>
                        </>
                      ) : null}
                      <td className={`px-3 py-3 min-w-[6.5rem] text-center ${SEP_GRUPO}`}>
                        {sinPago ? (
                          <p className="text-[13px] font-bold text-slate-500 tabular-nums">
                            {formatMontoImpuesto(0)}
                          </p>
                        ) : catsPago.length > 0 && reg ? (
                          <p className="text-[13px] font-bold text-slate-900 tabular-nums">
                            {formatMontoImpuesto(totalGeneral)}
                          </p>
                        ) : (
                          <span className="text-[12px] text-slate-300">—</span>
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
                            conBarra
                            habilitado={
                              !!reg &&
                              puedeNotificarCumplimiento(reg, catsPago) &&
                              emailOk
                            }
                            motivo={
                              !reg || !previewPublicado(reg)
                                ? "Publique el previo primero"
                                : !puedeNotificarCumplimiento(reg, catsPago)
                                  ? "Suba declaración y línea de captura"
                                : !emailOk
                                  ? "Cliente sin correo válido"
                                  : undefined
                            }
                            titulo="Notificar"
                            notify={notify}
                            enviadoEn={
                              reg?.ultimoCorreoTipo
                                ? reg.notificadoEn ||
                                  reg.preLimiteEnviadoEn ||
                                  reg.recordatorioLimiteEnviadoEn
                                : reg?.notificadoEn
                            }
                            onContactado={(_via, tipoEnviado) => {
                              const paso =
                                tipoEnviado === "pre_limite"
                                  ? "pre_limite"
                                  : tipoEnviado === "recordatorio_limite"
                                    ? "recordatorio_limite"
                                    : tipoEnviado === "cerrado" ||
                                        tipoEnviado === "sin_pago"
                                      ? tipoEnviado
                                      : "listo";
                              if (
                                paso === "listo" ||
                                paso === "cerrado" ||
                                paso === "sin_pago"
                              ) {
                                marcarNotificadoSiAplica(
                                  cli,
                                  reg,
                                  (id, p) =>
                                    marcarCorreoCumplimientoPaso(id, p, paso),
                                  periodo
                                );
                              } else {
                                marcarCorreoCumplimientoPaso(
                                  cli.id,
                                  periodo,
                                  paso
                                );
                              }
                            }}
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
                    colSpan={columnasTablero.cols}
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
          className="fixed inset-0 z-[60] flex justify-center items-stretch lg:items-center bg-slate-900/40 backdrop-blur-sm pt-[calc(env(safe-area-inset-top)+4.25rem)] pb-[calc(env(safe-area-inset-bottom)+5.25rem)] px-0 lg:p-6"
          onClick={() => setSelectedClient(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle de cumplimiento · ${selectedClient.razonSocial}`}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white h-full lg:h-[min(92vh,880px)] shadow-2xl overflow-hidden rounded-[1.75rem] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="shrink-0 border-b border-slate-100 px-5 py-3 lg:px-6 lg:py-3">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                {selectedClient.razonSocial}
              </h2>
              <div className="flex items-center gap-1 shrink-0">
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
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                aria-label="Cerrar"
                className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-slate-400">
                  {selectedClient.rfc}
                  <span className="ml-2 font-semibold text-slate-500">· {mesLabel}</span>
                </p>
                {selectedClient.email ? (
                  <p className="text-[11px] font-bold text-indigo-500 truncate">
                    {selectedClient.email}
                  </p>
                ) : null}
              </div>
            {pestanaFicha === "sat" && pestanaSat === "cumplimiento" ? (() => {
              const regSel = getCumplimientoPeriodo(selectedClient.id, periodo);
              const sinPago = esSinPagoImpuestos(regSel);
              const publicado = previewPublicado(regSel);
              const toggleDeshabilitado = publicado && !sinPago;
              return (
                <ToggleSwitch
                    compacto
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
                        setPasoEditando("paso5");
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
                    tono="amber"
                    label="Sin pago"
                  />
              );
            })() : null}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <PildorasCategoriaFicha
                visibles={pestanasCliente}
                activa={pestanaFicha}
                onChange={(id) => {
                  setPestanaFicha(id);
                  if (id === "sat") setPestanaSat("cumplimiento");
                }}
              />
              {pestanaFicha === "sat" ? (
                <PildorasSatInner activa={pestanaSat} onChange={setPestanaSat} />
              ) : null}
            </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-slate-50 px-5 py-4 lg:px-6 lg:py-5">
            {pestanaFicha === "sat" && pestanaSat === "historico" ? (
              <FichaSatHistorico
                cliente={selectedClient}
                anio={periodo.anio}
                mesDefault={periodo.mes}
                getCumplimientoPeriodo={getCumplimientoPeriodo}
              />
            ) : null}
            {pestanaFicha === "sat" && pestanaSat === "carpeta" ? (
              <FichaSatCarpeta
                cliente={selectedClient}
                anio={periodo.anio}
                mesDefault={periodo.mes}
                getCumplimientoPeriodo={getCumplimientoPeriodo}
                onCargar={({ file, tipo, periodo: p }) =>
                  abrirDocDesdeDrop({ file, tipoId: tipo, periodo: p })
                }
                onAbrirTipo={(tipo, p) => {
                  const reg = getCumplimientoPeriodo(selectedClient.id, p);
                  const lineaId =
                    tipo === "impuestos" && reg
                      ? asegurarBloques(reg).federales.lineasCaptura[0]?.id
                      : undefined;
                  setModalDoc({
                    cliente: selectedClient,
                    periodo: p,
                    tipo,
                    lineaId,
                  });
                }}
              />
            ) : null}
            {pestanaFicha === "imss" ? (() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              const sipareCargado = documentoAdminCargado(reg, "sipare");
              const emaCargado = documentoAdminCargado(reg, "ema");
              const ebaCargado = documentoAdminCargado(reg, "eba");
              const lineaExt = lineaExtemporaneaVigente(reg, "imss");
              const original = reg ? getSubtotalCategoria(reg, "imss") : 0;
              const recargo = lineaExt
                ? Math.round((lineaExt.monto - original) * 100) / 100
                : 0;
              return (
                <div className="space-y-3">
                  <DropClasificarPdf
                    anio={periodo.anio}
                    mesDefault={periodo.mes}
                    opciones={[
                      { id: "sipare", label: "SIPARE" },
                      { id: "ema", label: "EMA" },
                      { id: "eba", label: "EBA" },
                    ]}
                    onListo={abrirDocDesdeDrop}
                    etiqueta="Suelta SIPARE, EMA o EBA"
                  />
                  <div className="rounded-2xl border border-green-200 bg-green-50/40 p-3 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#006847]">
                      IMSS · {mesLabel}
                    </p>
                    <button
                      type="button"
                      disabled={!sipareCargado && !adminPuedeSubirPdf(reg, "sipare")}
                      onClick={(e) => abrirModalDoc(e, selectedClient, "sipare")}
                      className={barraDocSidebar(sipareCargado, "imss")}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">SIPARE</span>
                      <span className="text-[9px] font-bold opacity-80">
                        {sipareCargado ? "Ver / reemplazar" : "Subir PDF"}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={!emaCargado && !adminPuedeSubirPdf(reg, "ema")}
                      onClick={(e) => abrirModalDoc(e, selectedClient, "ema", undefined, 0)}
                      className={barraDocSidebar(emaCargado, "imss")}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">EMA</span>
                      <span className="text-[9px] font-bold opacity-80">
                        {emaCargado ? "Ver / reemplazar" : "Subir PDF"}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={!ebaCargado && !adminPuedeSubirPdf(reg, "eba")}
                      onClick={(e) => abrirModalDoc(e, selectedClient, "eba", undefined, 0)}
                      className={barraDocSidebar(ebaCargado, "imss")}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">EBA</span>
                      <span className="text-[9px] font-bold opacity-80">
                        {ebaCargado ? "Ver / reemplazar" : "Subir PDF"}
                      </span>
                    </button>
                    {lineaExt ? (
                      <button
                        type="button"
                        onClick={() =>
                          setModalExtemp({
                            cliente: selectedClient,
                            periodo,
                            categoria: "imss",
                          })
                        }
                        className={barraDocSidebar(!!lineaExt.documento, "extemporaneo")}
                      >
                        <span className="min-w-0 text-left">
                          <span className="block text-[10px] font-black uppercase tracking-wider">
                            Línea extemporánea
                          </span>
                          <span className="block text-[8px] font-bold opacity-90 truncate mt-0.5 normal-case tracking-normal">
                            {formatMontoImpuesto(lineaExt.monto)}
                            {recargo > 0 ? ` · recargo +${formatMontoImpuesto(recargo)}` : ""}
                          </span>
                        </span>
                        <span className="text-[9px] font-bold opacity-80 shrink-0">
                          {lineaExt.documento ? "Ver / editar" : "Editar"}
                        </span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })() : null}
            {pestanaFicha === "estatales" ? (() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              const nNomina = contarArchivosNomina(reg);
              const lineaExt = lineaExtemporaneaVigente(reg, "estatales");
              const original = reg ? getSubtotalCategoria(reg, "estatales") : 0;
              const recargo = lineaExt
                ? Math.round((lineaExt.monto - original) * 100) / 100
                : 0;
              return (
                <div className="space-y-3">
                  <DropClasificarPdf
                    anio={periodo.anio}
                    mesDefault={periodo.mes}
                    opciones={[
                      { id: "estatales", label: "Línea de captura" },
                      { id: "nomina", label: "Nómina" },
                    ]}
                    onListo={abrirDocDesdeDrop}
                    etiqueta="Suelta línea estatal o nómina"
                  />
                  <div className={`rounded-2xl p-3 space-y-2 border ${TONO_ESTATAL.border} ${TONO_ESTATAL.bg}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${TONO_ESTATAL.text}`}>
                      Estatales · {mesLabel}
                    </p>
                    {(reg?.estatales.lineasCaptura ?? []).map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        disabled={!l.documento && !adminPuedeSubirPdf(reg, "estatales")}
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
                    {lineaExt ? (
                      <button
                        type="button"
                        onClick={() =>
                          setModalExtemp({
                            cliente: selectedClient,
                            periodo,
                            categoria: "estatales",
                          })
                        }
                        className={barraDocSidebar(!!lineaExt.documento, "extemporaneo")}
                      >
                        <span className="min-w-0 text-left">
                          <span className="block text-[10px] font-black uppercase tracking-wider">
                            Línea extemporánea
                          </span>
                          <span className="block text-[8px] font-bold opacity-90 truncate mt-0.5 normal-case tracking-normal">
                            {formatMontoImpuesto(lineaExt.monto)}
                            {recargo > 0 ? ` · recargo +${formatMontoImpuesto(recargo)}` : ""}
                          </span>
                        </span>
                        <span className="text-[9px] font-bold opacity-80 shrink-0">
                          {lineaExt.documento ? "Ver / editar" : "Editar"}
                        </span>
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={(e) => abrirModalNomina(e, selectedClient)}
                      className={barraDocSidebar(nNomina > 0, "nomina")}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">Nómina</span>
                      <span className="text-[9px] font-bold opacity-80">
                        {nNomina > 0 ? `${nNomina} arch. · Ver` : "Subir"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })() : null}
            {pestanaFicha === "repse" ? (() => {
              const pRepse =
                periodoRepseSiHayPresentacion(periodo) ??
                periodoRepseDesdePeriodoMensual(periodo);
              const regRepse = getRegistroRepseCliente(selectedClient.id, pRepse);
              return (
                <div className="space-y-3">
                  <DropClasificarPdf
                    anio={periodo.anio}
                    mesDefault={periodo.mes}
                    opciones={[
                      { id: "icsoe", label: "ICSOE" },
                      { id: "sisub", label: "SISUB" },
                    ]}
                    onListo={abrirDocDesdeDrop}
                    etiqueta="Suelta ICSOE o SISUB"
                  />
                  <div className={`rounded-2xl p-3 space-y-2 border ${TONO_REPSE.border} ${TONO_REPSE.bg}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${TONO_REPSE.text}`}>
                      REPSE · {periodoRepseLabel(pRepse)}
                    </p>
                    <p className={`text-[8px] font-bold -mt-1 ${TONO_REPSE.text} opacity-70`}>
                      Se presenta en {etiquetaMesPresentacion(pRepse.cuatrimestre)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => abrirRepse(e, selectedClient, "icsoe")}
                      className={barraDocSidebar(!!regRepse?.icsoe, "repse")}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">ICSOE</span>
                      <span className="text-[9px] font-bold opacity-80">
                        {regRepse?.icsoe ? "Ver / reemplazar" : "Subir PDF"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => abrirRepse(e, selectedClient, "sisub")}
                      className={barraDocSidebar(!!regRepse?.sisub, "repse")}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">SISUB</span>
                      <span className="text-[9px] font-bold opacity-80">
                        {regRepse?.sisub ? "Ver / reemplazar" : "Subir PDF"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })() : null}
            {pestanaFicha === "sat" && pestanaSat === "cumplimiento" ? (
            <div className="min-w-0">
                <div className="mb-3">
                  <EditorFechaLimiteSat
                    rfc={selectedClient.rfc}
                    periodo={periodo}
                    registro={getCumplimientoPeriodo(selectedClient.id, periodo)}
                    onGuardar={(iso) =>
                      guardarFechaLimiteDeclaracion(
                        selectedClient.id,
                        periodo,
                        iso
                      )
                    }
                  />
                </div>
                <div className="mb-3">
                  <FlujoCumplimientoTimeline
                    cliente={selectedClient}
                    periodo={periodo}
                    variante="compacto"
                    esquemaVerdeGris
                    pasoSeleccionado={numDePaso(pasoEditando)}
                    onSeleccionarPaso={(n) => setPasoEditando(pasoDeNum(n))}
                  />
                </div>

                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold text-slate-800">
                      {tituloPaso(pasoEditando)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
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
                    <button
                      type="button"
                      title="Desmarcar este paso"
                      onClick={async () => {
                        const reg = getCumplimientoPeriodo(
                          selectedClient.id,
                          periodo
                        );
                        if (pasoEditando === "paso1") {
                          if (!contabilidadIniciada(reg)) return;
                          revertirContabilidadIniciada(
                            selectedClient.id,
                            periodo
                          );
                          return;
                        }
                        if (pasoEditando === "paso2") {
                          if (!cierreContableCapturado(reg)) return;
                          revertirCierreContable(selectedClient.id, periodo);
                          return;
                        }
                        if (pasoEditando === "paso3") {
                          if (!previewPublicado(reg)) return;
                          const ok = await confirm({
                            titulo: "Desmarcar previo",
                            mensaje:
                              "El cliente dejará de ver este preliminar. La contabilidad iniciada se conserva.",
                            textoConfirmar: "Desmarcar",
                            tono: "warning",
                          });
                          if (ok) {
                            revertirPreviewPublicado(
                              selectedClient.id,
                              periodo
                            );
                          }
                          return;
                        }
                        if (pasoEditando === "paso4") {
                          if (!clienteConfirmoPreview(reg)) return;
                          revertirConfirmacionPreview(
                            selectedClient.id,
                            periodo
                          );
                          return;
                        }
                        if (pasoEditando === "paso6" && reg) {
                          const cats = categoriasConPagoEnPreview(
                            selectedClient,
                            asegurarBloques(reg)
                          );
                          for (const cat of cats) {
                            if (pagoValidadoCategoria(reg, cat)) {
                              await revertirValidacionPagoCategoria(
                                selectedClient.id,
                                periodo,
                                cat
                              );
                            }
                          }
                        }
                      }}
                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm font-bold"
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      title="Borrar todo el periodo"
                      onClick={async () => {
                        const ok = await confirm({
                          titulo: "Borrar este periodo",
                          mensaje:
                            "Se eliminan todos los pasos, el previo, documentos y pagos de este mes. El cambio es irreversible.",
                          textoConfirmar: "Borrar todo",
                          tono: "danger",
                        });
                        if (!ok) return;
                        eliminarPreviewImpuestos(selectedClient.id, periodo);
                        setPasoEditando("paso1");
                      }}
                      className="w-8 h-8 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                    {pasoEditando !== "paso7" &&
                    !(
                      pasoEditando === "paso1" &&
                      !contabilidadIniciada(
                        getCumplimientoPeriodo(selectedClient.id, periodo)
                      ) &&
                      !previewPublicado(
                        getCumplimientoPeriodo(selectedClient.id, periodo)
                      )
                    ) && (
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
            <>
            {(() => {
              const regSel = getCumplimientoPeriodo(selectedClient.id, periodo);
              const iniciado = contabilidadIniciada(regSel);
              const publicado = previewPublicado(regSel);
              return (
                <div className="rounded-2xl border border-slate-100 bg-white p-3 mb-2 space-y-2">
                  <p className="text-[12px] font-semibold text-slate-600 leading-snug">
                    {iniciado || publicado
                      ? "El cliente ya ve En preparación. Sigue al paso 2 con ingresos y gastos."
                      : "El cliente verá En preparación. Es el mismo aviso que en su portal."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      marcarContabilidadIniciada(selectedClient.id, periodo);
                      setPasoEditando("paso2");
                    }}
                    disabled={iniciado || publicado}
                    className={`w-full py-2.5 rounded-xl text-[11px] font-bold transition-colors ${
                      iniciado || publicado
                        ? "bg-slate-100 text-slate-500 cursor-default"
                        : "bg-sky-600 text-white hover:bg-sky-700"
                    }`}
                  >
                    {publicado
                      ? "✓ Ya avanzaste (previo publicado)"
                      : iniciado
                        ? "✓ Contabilidad iniciada"
                        : "Iniciar contabilidad"}
                  </button>
                </div>
              );
            })()}
            </>
            )}

            {pasoEditando === "paso2" && (
            <>
            {(() => {
              const regSel = getCumplimientoPeriodo(selectedClient.id, periodo);
              const iniciado = contabilidadIniciada(regSel);
              const publicado = previewPublicado(regSel);
              const cierre = regSel?.cierreContable;
              const registrado = cierreContableCapturado(regSel);
              const clave = selectedClient.regimenFiscalClave ?? "";
              const esResico = clave === "626" || clave === "620";
              if (!iniciado && !publicado) {
                return (
                  <div className="rounded-2xl border border-slate-100 bg-white p-3 mb-2">
                    <p className="text-[12px] font-semibold text-slate-600 mb-2">
                      Primero inicia la contabilidad en el paso 1.
                    </p>
                    <button
                      type="button"
                      onClick={() => setPasoEditando("paso1")}
                      className="w-full py-2.5 rounded-xl bg-sky-600 text-white text-[11px] font-bold hover:bg-sky-700"
                    >
                      Ir a iniciar contabilidad
                    </button>
                  </div>
                );
              }
              return (
                <CierreContableCampos
                  ingresos={cierre?.ingresos ?? 0}
                  gastos={cierre?.gastos ?? 0}
                  ventasExentas={cierre?.ventasExentas ?? 0}
                  registrado={registrado}
                  esResico={esResico}
                  onGuardar={(datos) => {
                    if (!iniciado) {
                      marcarContabilidadIniciada(selectedClient.id, periodo);
                    }
                    guardarCierreContable(selectedClient.id, periodo, datos);
                    setPasoEditando("paso3");
                  }}
                />
              );
            })()}
            </>
            )}

            {pasoEditando === "paso3" && (
            <>
            {!esSinPagoImpuestos(getCumplimientoPeriodo(selectedClient.id, periodo)) &&
              !hayCargoEnPrevio(
                getCumplimientoPeriodo(selectedClient.id, periodo)
              ) &&
              !previewPublicado(
                getCumplimientoPeriodo(selectedClient.id, periodo)
              ) && (() => {
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
                <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-800">
                      Previo publicado
                    </span>
                    <button
                      type="button"
                      onClick={(e) => abrirModalPrevio(e, selectedClient)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = await confirm({
                          titulo: "Eliminar previo publicado",
                          mensaje:
                            "El cliente dejará de ver el importe. La contabilidad iniciada se conserva.",
                          textoConfirmar: "Quitar previo",
                          tono: "danger",
                        });
                        if (!ok) return;
                        revertirPreviewPublicado(selectedClient.id, periodo);
                      }}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                  {(() => {
                    const regSel = getCumplimientoPeriodo(
                      selectedClient.id,
                      periodo
                    );
                    if (!regSel) return null;
                    const linea =
                      asegurarBloques(regSel).federales.lineasCaptura[0];
                    const conceptos = linea?.conceptos ?? [];
                    if (!conceptos.length && !linea) return null;
                    return (
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        {(conceptos.length
                          ? conceptos
                          : linea
                            ? [
                                {
                                  etiqueta: linea.etiqueta,
                                  monto: linea.monto,
                                  aFavor: false as boolean,
                                },
                              ]
                            : []
                        )
                          .filter((c) => Number(c.monto) > 0)
                          .map((c, i) => (
                            <div
                              key={`${c.etiqueta}-${i}`}
                              className={`flex items-center justify-between text-[12px] font-semibold ${
                                c.aFavor ? "text-emerald-700" : "text-slate-700"
                              }`}
                            >
                              <span>
                                {c.etiqueta}
                                {c.aFavor ? " · a favor" : ""}
                              </span>
                              <span className="tabular-nums">
                                {formatMontoImpuesto(Number(c.monto) || 0)}
                              </span>
                            </div>
                          ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3">
                  <p className="text-[12px] font-semibold text-slate-600 mb-2">
                    Publica ISR e IVA. A cargo suma a la línea; a favor se ve en verde, sin signo negativo.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => abrirModalPrevio(e, selectedClient)}
                    className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700"
                  >
                    Publicar previo
                  </button>
                </div>
              )
            )}
            </>
            )}

            {pasoEditando === "paso4" && (
            <>
            {(() => {
              const regPaso4 = getCumplimientoPeriodo(
                selectedClient.id,
                periodo
              );
              if (!regPaso4 || !previewPublicado(regPaso4)) return null;
              const cierreOk = cierreContableCapturado(regPaso4);
              const aPagar = getTotalImpuestos(regPaso4);
              const fechaPago =
                getFechaLimitePrincipal(regPaso4) ||
                regPaso4.fechaLimite?.trim() ||
                "";
              return (
                <div className="rounded-2xl border border-slate-100 bg-white p-4 mb-3 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Resumen del mes
                  </p>
                  <ul className="space-y-1.5">
                    <li className="flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-semibold text-slate-500">
                        Ingresos
                      </span>
                      <span className="text-[13px] font-semibold tabular-nums text-slate-800">
                        {cierreOk
                          ? formatMontoImpuesto(
                              regPaso4.cierreContable?.ingresos ?? 0
                            )
                          : "—"}
                      </span>
                    </li>
                    <li className="flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-semibold text-slate-500">
                        Gastos
                      </span>
                      <span className="text-[13px] font-semibold tabular-nums text-slate-800">
                        {cierreOk
                          ? formatMontoImpuesto(
                              regPaso4.cierreContable?.gastos ?? 0
                            )
                          : "—"}
                      </span>
                    </li>
                    <li className="flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-semibold text-slate-700">
                        A pagar
                      </span>
                      <span className="text-[13px] font-semibold tabular-nums text-slate-900">
                        {formatMontoImpuesto(aPagar)}
                      </span>
                    </li>
                    <li className="flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-semibold text-slate-500">
                        Fecha de pago
                      </span>
                      <span className="text-[13px] font-semibold tabular-nums text-slate-800">
                        {fechaPago
                          ? formatFechaLimiteImpuestoCorta(fechaPago)
                          : "Por confirmar"}
                      </span>
                    </li>
                  </ul>
                </div>
              );
            })()}
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
              const fedOn = categoriaAplicaCliente(selectedClient, "federales");
              return (
                <div className="space-y-3 mb-6">
                  {fedOn && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3 space-y-2">
                      <p className="text-[9px] font-black uppercase text-blue-700 tracking-widest">
                        {CATEGORIA_META.federales.label}
                      </p>
                      <button
                        type="button"
                        disabled={!declCargada && !adminPuedeSubirPdf(reg, "declaracion")}
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
                          if (sinPago) {
                            return (
                              <button
                                type="button"
                                onClick={(e) =>
                                  abrirModalDoc(e, selectedClient, "impuestos")
                                }
                                className={barraDocSidebar(false, "federales")}
                              >
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  Impuestos
                                </span>
                                <span className="text-[9px] font-bold opacity-80">
                                  Subir PDF
                                </span>
                              </button>
                            );
                          }
                          return (
                            <p className="text-[9px] font-bold text-blue-600/70 px-1">
                              Publica el previo para generar la línea de captura.
                            </p>
                          );
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
                            disabled={
                              !lineaFed.documento &&
                              !adminPuedeSubirPdf(reg, "impuestos")
                            }
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
                                  : sinPago
                                    ? "Impuestos"
                                    : "Línea de captura"}
                              </span>
                              {desglose && (
                                <span className="block text-[8px] font-bold opacity-80 truncate mt-0.5 normal-case tracking-normal">
                                  {desglose}
                                </span>
                              )}
                              {lineaFed.referencia ? (
                                <span className="block text-[8px] font-mono font-bold opacity-80 truncate mt-0.5 tracking-wide">
                                  {formatearLineaCapturaSat(lineaFed.referencia)}
                                </span>
                              ) : null}
                            </span>
                            <span className="text-[9px] font-bold opacity-80 shrink-0">
                              {lineaFed.documento
                                ? "Ver / reemplazar"
                                : "Subir PDF"}
                            </span>
                          </button>
                        );
                      })()}
                      {(reg?.extemporaneo?.federales?.lineas ?? []).map((lineaExt, idx, arr) => {
                        const original = getSubtotalCategoria(reg!, "federales");
                        const recargo =
                          Math.round((lineaExt.monto - original) * 100) / 100;
                        const vigente = idx === arr.length - 1;
                        return (
                          <button
                            key={lineaExt.id}
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
                                {arr.length > 1
                                  ? `Extemporánea ${idx + 1}${vigente ? " · vigente" : ""}`
                                  : "Línea extemporánea"}
                              </span>
                              <span className="block text-[8px] font-bold opacity-90 truncate mt-0.5 normal-case tracking-normal">
                                {formatMontoImpuesto(lineaExt.monto)}
                                {recargo > 0
                                  ? ` · recargo +${formatMontoImpuesto(recargo)}`
                                  : ""}
                                {lineaExt.fechaLimiteAnterior
                                  ? ` · venció ${formatFechaLimiteImpuestoCompacta(lineaExt.fechaLimiteAnterior)}`
                                  : ""}
                                {lineaExt.fechaLimite
                                  ? ` · vence ${formatFechaLimiteImpuestoCompacta(lineaExt.fechaLimite)}`
                                  : ""}
                              </span>
                            </span>
                            <span className="text-[9px] font-bold opacity-80 shrink-0">
                              {lineaExt.documento ? "Ver / editar" : "Editar"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            </>
            )}

            {pasoEditando === "paso6" && (
            <>
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
                  const ext = lineaExtemporaneaVigente(reg, c)?.monto;
                  if (ext != null && ext > 0) return s + ext;
                  return s + getSubtotalCategoria(reg, c);
                }, 0);
              }
              const fechaMostrar =
                getFechaLimiteMasProxima(reg) ||
                reg.fechaLimiteDeclaracion ||
                reg.fechaLimite;
              const isoVence = fechaMostrar?.slice(0, 10) ?? "";
              return (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div
                    className={`rounded-2xl p-3 min-h-[88px] flex flex-col ${
                      algunaExt
                        ? "bg-red-50 border border-red-200"
                        : "bg-[#1a164d] text-white"
                    }`}
                  >
                    <p className={`flex items-center gap-1.5 text-[10px] font-semibold ${algunaExt ? "text-red-600" : "text-white/70"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                      {algunaExt ? "Pago extemporáneo" : "A pagar"}
                    </p>
                    <p className={`mt-auto text-lg font-bold tabular-nums ${algunaExt ? "text-red-800" : "text-white"}`}>
                      {formatMontoImpuesto(montoMostrar)}
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl p-3 min-h-[88px] flex flex-col ${
                      algunaExt
                        ? "bg-red-50 border border-red-200"
                        : "bg-violet-700 text-white"
                    }`}
                  >
                    <p className={`flex items-center gap-1.5 text-[10px] font-semibold ${algunaExt ? "text-red-600" : "text-white/70"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      {algunaExt ? "Nueva fecha límite" : "Vence"}
                    </p>
                    <FechaEditableConLapiz
                      iso={isoVence}
                      tono={algunaExt ? "alerta" : "oscuro"}
                      onGuardar={(iso) =>
                        guardarFechaLimiteDeclaracion(
                          selectedClient.id,
                          periodo,
                          iso
                        )
                      }
                    />
                  </div>
                </div>
              );
            })()}
            <div className="mb-3">
              <PedirCapturaPortal cliente={selectedClient} tipo="impuestos" variante="compacto" />
            </div>
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
                      const lineaExt = lineaExtemporaneaVigente(reg, cat);
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

            <ConfirmarPagoImpuestos
              cliente={selectedClient}
              periodo={periodo}
            />

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!reg || !previewPublicado(reg) || !reg.fechaLimite) return null;
              const emailOk =
                !!selectedClient.email &&
                isValidEmail(selectedClient.email ?? "");
              const pdfsOk =
                documentoAdminCargado(reg, "declaracion") &&
                documentoAdminCargado(reg, "impuestos");
              return (
                <div className="mb-4 space-y-2">
                  <BotonCorreoCumplimiento
                    cliente={selectedClient}
                    periodo={periodo}
                    tipo="pre_limite"
                    registro={reg}
                    variante="ancho"
                    titulo="Pronto vence"
                    habilitado={emailOk && pdfsOk}
                    motivo={
                      !emailOk
                        ? "Cliente sin correo válido"
                        : "Sube declaración e impuestos (PDFs) antes del pre-aviso"
                    }
                    notify={notify}
                    enviadoEn={reg.preLimiteEnviadoEn}
                    onContactado={() =>
                      marcarPreLimiteEnviado(selectedClient.id, periodo)
                    }
                  />
                  <BotonCorreoCumplimiento
                    cliente={selectedClient}
                    periodo={periodo}
                    tipo="recordatorio_limite"
                    registro={reg}
                    variante="ancho"
                    titulo="Plazo vencido"
                    habilitado={emailOk && pdfsOk}
                    motivo={
                      !emailOk
                        ? "Cliente sin correo válido"
                        : "Sube declaración e impuestos (PDFs) antes de avisar el plazo"
                    }
                    notify={notify}
                    enviadoEn={reg.recordatorioLimiteEnviadoEn}
                    onContactado={() =>
                      marcarRecordatorioLimiteEnviado(
                        selectedClient.id,
                        periodo
                      )
                    }
                  />
                </div>
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
              const saldoActivo = reg?.saldoFavor?.activo === true;

              return (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                    <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white text-2xl font-bold">
                      ✓
                    </span>
                    <p className="text-[15px] font-bold text-emerald-800">
                      Cierre de {mesLabel} terminado
                    </p>
                    <p className="text-[12px] font-medium text-emerald-700/80 mt-1">
                      {sinPago
                        ? "Periodo en ceros. Ya puedes notificar al cliente."
                        : "El ciclo de este mes quedó cerrado."}
                    </p>
                  </div>
                  <BotonCorreoCumplimiento
                    cliente={selectedClient}
                    periodo={periodo}
                    tipo={sinPago ? "sin_pago" : "cerrado"}
                    registro={reg}
                    opts={
                      catsPago.length > 0 ? { categorias: catsPago } : undefined
                    }
                    variante="ancho"
                    titulo={
                      sinPago
                        ? textoNotificarCorreo(selectedClient, reg)
                        : "Mes cerrado · sin pendientes"
                    }
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
                  {sinPago ? (
                    <SaldoFavorEditor
                      activo={saldoActivo}
                      lineas={normalizarSaldoFavorLineas(reg?.saldoFavor)}
                      onToggle={(next) =>
                        actualizarSaldoFavor(selectedClient.id, periodo, {
                          activo: next,
                          lineas: normalizarSaldoFavorLineas(reg?.saldoFavor),
                        })
                      }
                      onGuardar={(lineas) =>
                        actualizarSaldoFavor(selectedClient.id, periodo, {
                          activo: true,
                          lineas,
                        })
                      }
                    />
                  ) : null}
                </div>
              );
            })()}
            </>
            )}
            </div>
            ) : null}
            </div>
            {cierreClave && selectedClient ? (
              <div className="absolute inset-0 z-[5] bg-white/90 backdrop-blur-[2px] flex items-center justify-center p-6">
                <div className="w-full max-w-xs rounded-3xl bg-white shadow-xl border border-emerald-100 p-6 text-center">
                  <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white text-3xl font-bold">
                    ✓
                  </span>
                  <p className="text-lg font-bold text-slate-800">
                    Cierre de {mesLabel} terminado
                  </p>
                  <p className="text-[13px] font-medium text-slate-500 mt-1 mb-5">
                    El trabajo de {nombreCortoCliente(selectedClient.razonSocial)} en este mes ya está listo.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCierreVisto(cierreClave);
                      setCierreClave(null);
                      setPasoEditando("paso7");
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700"
                  >
                    OK
                  </button>
                </div>
              </div>
            ) : null}
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
          archivoInicial={modalDoc.archivoInicial}
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
          archivoInicial={modalRepse.archivoInicial}
          onClose={() => setModalRepse(null)}
        />
      )}
    </div>
  );
}
