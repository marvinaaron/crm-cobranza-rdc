"use client";

import { useMemo } from "react";
import Link from "next/link";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import {
  asegurarBloques,
  previewPublicado,
  clienteConfirmoPreview,
  contabilidadIniciada,
  esSinPagoImpuestos,
  algunDocumentoFiscalSubido,
  algunComprobantePagoCargado,
  todosPagosValidados,
  FLUJO_CUMPLIMIENTO_LABELS,
} from "@/lib/cumplimiento";

type EstadoPaso = "pendiente" | "actual" | "completo" | "omitido";

type Paso = {
  id: string;
  label: string;
  estado: EstadoPaso;
};

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  variante?: "ancho" | "compacto" | "inicio";
  /**
   * Admin: paso que se está editando (1–7). Solo UI; no muta el registro.
   * Si se pasa `onSeleccionarPaso`, los círculos son clickeables.
   */
  pasoSeleccionado?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onSeleccionarPaso?: (paso: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  /**
   * Admin: verde = completo, gris = pendiente/faltante.
   * (El portal sigue con el estilo azul del paso actual.)
   */
  esquemaVerdeGris?: boolean;
};

/** Etiquetas de los pills, tomadas de la fuente única (portal = admin = cobranza). */
const PILL_LABEL: Record<string, string> = {
  "por-trabajar": FLUJO_CUMPLIMIENTO_LABELS.por_trabajar,
  iniciando: FLUJO_CUMPLIMIENTO_LABELS.iniciando_contabilidad,
  preliminar: FLUJO_CUMPLIMIENTO_LABELS.preliminar,
  aceptacion: FLUJO_CUMPLIMIENTO_LABELS.aceptacion,
  declaraciones: FLUJO_CUMPLIMIENTO_LABELS.declaraciones,
  pago: FLUJO_CUMPLIMIENTO_LABELS.pago,
  completado: FLUJO_CUMPLIMIENTO_LABELS.completado,
};

/** Texto de la línea de estado según el paso activo del cliente. */
const STATUS_TEXT: Record<string, string> = {
  "por-trabajar": "Tu contador está recibiendo los documentos del periodo",
  iniciando: "Tu contador está iniciando el cierre de este periodo",
  preliminar: "Tu preliminar está listo · al verlo queda registrado",
  aceptacion: "Ya viste los importes · preparamos tus declaraciones",
  declaraciones: "Tus declaraciones están listas · sube tu comprobante de pago",
  pago: "Recibimos tu comprobante · tu contador lo está validando",
  completado: "Periodo completado y archivado",
};

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function FlujoCumplimientoTimeline({
  cliente,
  periodo,
  variante = "ancho",
  pasoSeleccionado,
  onSeleccionarPaso,
  esquemaVerdeGris = false,
}: Props) {
  const { getCumplimientoPeriodo } = useClientes();
  const registro = getCumplimientoPeriodo(cliente.id, periodo);

  const pasos = useMemo<Paso[]>(() => {
    const reg = registro ? asegurarBloques(registro) : undefined;

    const iniciado = contabilidadIniciada(reg);
    const sinPago = esSinPagoImpuestos(reg);
    const previoOk = previewPublicado(reg);
    const validadoPreview = clienteConfirmoPreview(reg);
    const algunDocSubido = algunDocumentoFiscalSubido(reg);
    const algunComprob = algunComprobantePagoCargado(reg);
    const todoValidado = todosPagosValidados(reg);

    const items: Omit<Paso, "estado">[] = [
      { id: "por-trabajar", label: FLUJO_CUMPLIMIENTO_LABELS.por_trabajar },
      { id: "iniciando", label: FLUJO_CUMPLIMIENTO_LABELS.iniciando_contabilidad },
      { id: "preliminar", label: FLUJO_CUMPLIMIENTO_LABELS.preliminar },
      { id: "aceptacion", label: FLUJO_CUMPLIMIENTO_LABELS.aceptacion },
      { id: "declaraciones", label: FLUJO_CUMPLIMIENTO_LABELS.declaraciones },
      { id: "pago", label: FLUJO_CUMPLIMIENTO_LABELS.pago },
      { id: "completado", label: FLUJO_CUMPLIMIENTO_LABELS.completado },
    ];

    // Modo "Sin pago de impuestos": se omiten Preliminar, Aceptación y Pago.
    // El flujo se reduce a: Por trabajar → Iniciando → Declaraciones → Completado.
    if (sinPago) {
      const completos = [
        iniciado || algunDocSubido,   // Por trabajar
        algunDocSubido,               // Iniciando contabilidad
        false,                        // Preliminar (omitido)
        false,                        // Aceptación (omitido)
        algunDocSubido,               // Declaraciones
        false,                        // Pago (omitido)
        algunDocSubido,               // Completado
      ];
      return items.map((paso, i) => {
        if (i === 2 || i === 3 || i === 5) {
          return { ...paso, estado: "omitido" as EstadoPaso };
        }
        const ok = completos[i];
        // Para el paso "actual" usamos el primer hito relevante no completo.
        const previoRelevanteOk = (() => {
          if (i === 0) return true;
          if (i === 4) return completos[1]; // Declaraciones depende de Iniciando
          if (i === 6) return completos[4]; // Completado depende de Declaraciones
          return completos[i - 1];
        })();
        const estado: EstadoPaso = ok
          ? "completo"
          : previoRelevanteOk
            ? "actual"
            : "pendiente";
        return { ...paso, estado };
      });
    }

    // Cada índice representa "este hito ya se alcanzó / ya pasamos esta etapa".
    const completos = [
      iniciado || previoOk,            // Por trabajar
      previoOk,                        // Iniciando contabilidad
      previoOk && validadoPreview,     // Preliminar (validado por cliente)
      validadoPreview && algunDocSubido, // Aceptación + docs ya subidos
      algunDocSubido && algunComprob,    // Declaraciones + comprobante recibido
      algunComprob && todoValidado,    // Pago + admin ya validó todos
      todoValidado,                    // Completado
    ];

    return items.map((paso, i) => {
      const ok = completos[i];
      const pasoPrevioOk = i === 0 ? true : completos[i - 1];
      const estado: EstadoPaso = ok
        ? "completo"
        : pasoPrevioOk
          ? "actual"
          : "pendiente";
      return { ...paso, estado };
    });
  }, [cliente, registro]);

  const pasosRelevantes = pasos.filter((p) => p.estado !== "omitido");
  const totalCompletados = pasosRelevantes.filter(
    (p) => p.estado === "completo"
  ).length;
  const porcentaje =
    pasosRelevantes.length === 0
      ? 0
      : Math.round((totalCompletados / pasosRelevantes.length) * 100);
  const sinPagoActivo = pasos.some((p) => p.estado === "omitido");

  // Variante compacta para el inicio del portal: barra de progreso, pills
  // de los pasos con scroll horizontal y una línea de estado pulsante.
  // Reutiliza exactamente la misma derivación de `pasos` de arriba.
  if (variante === "inicio") {
    const total = pasosRelevantes.length;
    const completado = total > 0 && totalCompletados === total;
    const pasoActual = pasos.find((p) => p.estado === "actual");
    const pasoNum = completado
      ? total
      : Math.min(totalCompletados + 1, Math.max(total, 1));
    const fillPct = total === 0 ? 0 : Math.round((pasoNum / total) * 100);
    const pasoEstado = completado ? pasos[pasos.length - 1] : pasoActual;
    const statusText = pasoEstado ? STATUS_TEXT[pasoEstado.id] ?? "" : "";

    return (
      <section className="rdc-card bg-white dark:bg-slate-900 rounded-[18px] border border-slate-100 dark:border-white/10 shadow-sm px-4 py-4 sm:px-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-blue-900 leading-tight truncate">
              Tu cierre de {periodoLabel(periodo)}
            </p>
            <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">
              {completado ? "Completado" : `Paso ${pasoNum} de ${total}`}
            </p>
          </div>
          <Link
            href="/portal/cumplimiento"
            className="shrink-0 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Ver más →
          </Link>
        </header>

        <div className="my-2 h-1 rounded bg-indigo-500/[0.12] overflow-hidden">
          <div
            className="h-full rounded bg-gradient-to-r from-indigo-600 to-violet-600 transition-[width] duration-700 ease-out"
            style={{ width: `${fillPct}%` }}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 hidden sm:flex [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {pasos.map((paso) => {
            const completo = paso.estado === "completo";
            const actual = paso.estado === "actual";
            const label = PILL_LABEL[paso.id] ?? paso.label;
            const clase = actual
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
              : completo
                ? "bg-indigo-500/10 border border-indigo-500/25 text-indigo-600"
                : "bg-black/[0.04] dark:bg-white/5 text-[rgba(30,27,75,0.3)] dark:text-white/25";
            return (
              <Link
                key={paso.id}
                href="/portal/cumplimiento"
                className={`shrink-0 px-2.5 py-[5px] rounded-[20px] text-[10px] whitespace-nowrap transition-colors ${clase}`}
              >
                {completo ? "✓ " : ""}
                {label}
              </Link>
            );
          })}
        </div>

        {statusText && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="rdc-pulse-dot w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
            <p className="text-[11px] text-[rgba(30,27,75,0.6)] dark:text-white/50 leading-snug">
              {statusText}
            </p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      className={`rounded-2xl bg-white border border-slate-100 shadow-sm ${
        variante === "ancho" ? "px-5 sm:px-6 py-4 sm:py-5" : "px-4 py-4"
      }`}
    >
      <header className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Avance del periodo {sinPagoActivo && <span className="text-slate-500">· Sin pago</span>}
          </p>
          <p className="text-sm font-black text-slate-700">
            {totalCompletados === pasosRelevantes.length
              ? "¡Ciclo completado!"
              : `Paso ${Math.min(totalCompletados + 1, pasosRelevantes.length)} de ${pasosRelevantes.length}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Progreso
          </p>
          <p className="text-base font-black text-emerald-600 tabular-nums">
            {porcentaje}%
          </p>
        </div>
      </header>

      <ol className="relative flex items-start justify-between gap-2">
        {pasos.map((paso, i) => {
          const completo = paso.estado === "completo";
          const actual = paso.estado === "actual";
          const omitido = paso.estado === "omitido";
          const num = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
          const seleccionado = pasoSeleccionado === num;
          const siguiente = pasos[i + 1];
          const conectorActivo = completo;
          const conectorParcial = !completo && siguiente && actual;
          const clickable = !!onSeleccionarPaso && !omitido;

          const circuloPortal = omitido
            ? "bg-slate-50 text-slate-300 border-dashed border-slate-200"
            : completo
              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100"
              : actual
                ? "bg-white text-blue-700 border-blue-500 ring-4 ring-blue-100"
                : "bg-white text-slate-400 border-slate-200";

          // Admin: solo verde (listo) / gris (faltante). El seleccionado lleva anillo.
          const circuloAdmin = omitido
            ? "bg-slate-50 text-slate-300 border-dashed border-slate-200"
            : completo
              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100"
              : "bg-white text-slate-400 border-slate-300";
          const anilloSeleccionado = seleccionado
            ? completo
              ? "ring-4 ring-emerald-200"
              : "ring-4 ring-slate-300"
            : "";

          const circulo = esquemaVerdeGris
            ? `${circuloAdmin} ${anilloSeleccionado}`
            : circuloPortal;

          const conector = omitido
            ? "bg-slate-100"
            : esquemaVerdeGris
              ? completo
                ? "bg-emerald-500"
                : "bg-slate-200"
              : conectorActivo
                ? "bg-emerald-500"
                : conectorParcial
                  ? "bg-gradient-to-r from-blue-400 to-slate-200"
                  : "bg-slate-200";

          return (
            <li
              key={paso.id}
              className="relative flex-1 flex flex-col items-center text-center min-w-0"
            >
              {i < pasos.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${conector}`}
                />
              )}
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onSeleccionarPaso?.(num)}
                  title={`Editar paso ${num} · ${paso.label}`}
                  className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all cursor-pointer hover:scale-105 ${circulo}`}
                >
                  {omitido ? "—" : completo ? <CheckIcon /> : num}
                </button>
              ) : (
                <span
                  title={
                    omitido
                      ? `${paso.label} · no aplica (sin pago)`
                      : paso.label
                  }
                  className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all ${circulo}`}
                >
                  {omitido ? "—" : completo ? <CheckIcon /> : num}
                </span>
              )}
              {esquemaVerdeGris && (
                <span
                  className={`mt-1.5 text-[9px] font-bold leading-tight line-clamp-2 px-0.5 ${
                    omitido
                      ? "text-slate-300"
                      : completo
                        ? "text-emerald-700"
                        : "text-slate-400"
                  }`}
                >
                  {paso.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
