/**
 * Resumen del paso del workflow de cumplimiento en el que está un
 * cliente para un periodo dado. Reutiliza la misma escala de 7 pasos
 * que se muestra en `/cumplimiento`, asegurando un solo lenguaje
 * visual en todo el CRM:
 *
 *   1. Por trabajar          (slate)
 *   2. Iniciando contabilidad (sky)
 *   3. Preliminar             (amber)
 *   4. Visto por cliente      (teal)
 *   5. Declaraciones          (violet)
 *   6. Pago                   (indigo)
 *   7. Completado             (emerald)
 *
 * Se replica la misma lógica `bucketCliente` que vive en
 * `src/app/(admin)/cumplimiento/page.tsx`, porque considera la config
 * del cliente (qué categorías aplican) y el modo "sin pago" — cosas
 * que `getFlujoCumplimiento` solo no resuelve. Aquí queda en un
 * helper compartido para que cobranza, cartera y cumplimiento usen
 * exactamente el mismo cálculo.
 */

import { type Cliente, type Periodo } from "@/lib/clientes";
import {
  type FlujoCumplimiento,
  type RegistroCumplimiento,
  FLUJO_CUMPLIMIENTO_LABELS,
} from "@/lib/cumplimiento";
import {
  asegurarBloques,
  algunDocumentoFiscalSubido,
  algunComprobantePagoCargado,
  todosPagosValidados,
  documentosFiscalesCompletos,
} from "@/lib/cumplimiento-categorias";
import { categoriasConPagoEnPreview } from "@/lib/config-cumplimiento-cliente";

export type FlujoTono =
  | "slate"
  | "sky"
  | "amber"
  | "teal"
  | "violet"
  | "indigo"
  | "emerald";

export type WorkflowResumen = {
  /** Estado canónico del cliente en /cumplimiento. */
  flujo: FlujoCumplimiento;
  /** Número del paso (1-7). Se muestra grande dentro del círculo. */
  paso: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Total de pasos del flujo (siempre 7 por ahora). */
  totalPasos: 7;
  /** Label completo (p. ej. "Iniciando contabilidad"). */
  label: string;
  /** Label corto, ideal para el subtítulo bajo el círculo. */
  labelCorto: string;
  /** Token de color (alineado con `/cumplimiento`). */
  tono: FlujoTono;
  /** Descripción operativa del estado para tooltips/popovers. */
  descripcion: string;
  /** `true` cuando el cliente alcanzó el paso 7. */
  esCompleto: boolean;
  /** Lista de los 7 pasos con indicador del actual y los superados. */
  pasos: WorkflowPaso[];
};

export type WorkflowPaso = {
  numero: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  flujo: FlujoCumplimiento;
  label: string;
  labelCorto: string;
  tono: FlujoTono;
  descripcion: string;
  /** Paso en el que se encuentra actualmente el cliente. */
  actual: boolean;
  /** Paso ya superado (cliente está en uno posterior). */
  superado: boolean;
};

// Mapas canónicos. Mantener en sync con /cumplimiento (BUCKET_TONO y
// BUCKET_LABEL allá).
export const FLUJO_NUMERO: Record<FlujoCumplimiento, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
  por_trabajar: 1,
  iniciando_contabilidad: 2,
  preliminar: 3,
  aceptacion: 4,
  declaraciones: 5,
  pago: 6,
  completado: 7,
};

export const FLUJO_TONO: Record<FlujoCumplimiento, FlujoTono> = {
  por_trabajar: "slate",
  iniciando_contabilidad: "sky",
  preliminar: "amber",
  aceptacion: "teal",
  declaraciones: "violet",
  pago: "indigo",
  completado: "emerald",
};

export const FLUJO_LABEL_CORTO: Record<FlujoCumplimiento, string> =
  FLUJO_CUMPLIMIENTO_LABELS;

export const FLUJO_DESCRIPCION: Record<FlujoCumplimiento, string> = {
  por_trabajar: "Aún no se ha empezado la contabilidad del mes.",
  iniciando_contabilidad:
    "Contabilidad capturada; falta publicar el previo al cliente.",
  preliminar:
    "Previo publicado; esperando que el cliente lo abra en su portal.",
  aceptacion:
    "Cliente ya vio los montos; faltan declaraciones / líneas de captura.",
  declaraciones:
    "Documentos fiscales subidos; el cliente debe pagar los impuestos.",
  pago: "Comprobantes de pago de impuestos recibidos; falta validación.",
  completado: "Cumplimiento del mes terminado: pagos validados al 100%.",
};

/** Paleta para anillo de progreso + número grande, alineada con cumplimiento. */
export const TONO_RING: Record<
  FlujoTono,
  { hex: string; numText: string; subtitleText: string }
> = {
  slate: {
    hex: "#94a3b8",
    numText: "text-slate-600",
    subtitleText: "text-slate-500",
  },
  sky: {
    hex: "#0ea5e9",
    numText: "text-sky-700",
    subtitleText: "text-sky-600",
  },
  amber: {
    hex: "#f59e0b",
    numText: "text-amber-700",
    subtitleText: "text-amber-600",
  },
  teal: {
    hex: "#14b8a6",
    numText: "text-teal-700",
    subtitleText: "text-teal-600",
  },
  violet: {
    hex: "#8b5cf6",
    numText: "text-violet-700",
    subtitleText: "text-violet-600",
  },
  indigo: {
    hex: "#6366f1",
    numText: "text-indigo-700",
    subtitleText: "text-indigo-600",
  },
  emerald: {
    hex: "#10b981",
    numText: "text-emerald-700",
    subtitleText: "text-emerald-600",
  },
};

const ORDEN_FLUJO: FlujoCumplimiento[] = [
  "por_trabajar",
  "iniciando_contabilidad",
  "preliminar",
  "aceptacion",
  "declaraciones",
  "pago",
  "completado",
];

/**
 * Determina el bucket de flujo del cliente. Replica exactamente la
 * lógica de `bucketCliente` en /cumplimiento para evitar discrepancias
 * visuales entre páginas. Se aceptan los mismos casos especiales:
 *
 *   · Modo "sin pago" (cliente confirmó que no debe nada de impuestos
 *     en el mes) → flujo abreviado.
 *   · Categorías habilitadas por cliente → respeta config.
 */
function calcularFlujoCliente(
  cliente: Cliente,
  registro: RegistroCumplimiento | undefined
): FlujoCumplimiento {
  if (!registro) return "por_trabajar";

  const sinPago = !!registro.sinPagoImpuestos;
  const contabIniciada = !!registro.contabilidadIniciadaEn;
  const previewPub = !!registro.previewPublicadoEn;
  const confirmPrev = !!registro.clienteConfirmoPreviewEn;

  if (sinPago) {
    if (algunDocumentoFiscalSubido(registro)) return "completado";
    return contabIniciada ? "iniciando_contabilidad" : "por_trabajar";
  }

  if (!previewPub) {
    return contabIniciada ? "iniciando_contabilidad" : "por_trabajar";
  }

  const regB = asegurarBloques(registro);
  const catsPago = categoriasConPagoEnPreview(cliente, regB);

  // Sin nada que pagar este mes → trabajo cerrado.
  if (catsPago.length === 0) return "completado";
  // Previo publicado desbloquea al despacho (no espera aceptación del cliente).
  if (todosPagosValidados(registro, catsPago)) return "completado";
  if (algunComprobantePagoCargado(registro, catsPago)) return "pago";
  if (algunDocumentoFiscalSubido(registro, catsPago)) {
    // Docs parciales o completos → declaraciones si ya están todos; si no, aceptacion.
    return documentosFiscalesCompletos(registro, catsPago)
      ? "declaraciones"
      : "aceptacion";
  }
  if (confirmPrev) return "aceptacion";
  return "preliminar";
}

export function getWorkflowMesCliente(
  cliente: Cliente,
  // periodo se mantiene en la firma por compatibilidad con callers que
  // ya lo pasan; el cálculo del flujo no lo necesita porque el
  // registro ya viene amarrado al periodo correspondiente.
  _periodo: Periodo,
  registro: RegistroCumplimiento | undefined
): WorkflowResumen {
  const flujo = calcularFlujoCliente(cliente, registro);
  const paso = FLUJO_NUMERO[flujo];
  const tono = FLUJO_TONO[flujo];

  const pasos: WorkflowPaso[] = ORDEN_FLUJO.map((f) => {
    const num = FLUJO_NUMERO[f];
    return {
      numero: num,
      flujo: f,
      label: FLUJO_CUMPLIMIENTO_LABELS[f],
      labelCorto: FLUJO_LABEL_CORTO[f],
      tono: FLUJO_TONO[f],
      descripcion: FLUJO_DESCRIPCION[f],
      actual: f === flujo,
      superado: num < paso,
    };
  });

  return {
    flujo,
    paso,
    totalPasos: 7,
    label: FLUJO_CUMPLIMIENTO_LABELS[flujo],
    labelCorto: FLUJO_LABEL_CORTO[flujo],
    tono,
    descripcion: FLUJO_DESCRIPCION[flujo],
    esCompleto: flujo === "completado",
    pasos,
  };
}
