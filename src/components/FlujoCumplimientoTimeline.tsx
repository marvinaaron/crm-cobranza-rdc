"use client";

import { useMemo } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
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
  variante?: "ancho" | "compacto";
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
      { id: "por-trabajar", label: "Por trabajar" },
      { id: "iniciando", label: "Iniciando contabilidad" },
      { id: "preliminar", label: "Preliminar" },
      { id: "aceptacion", label: "Aceptación" },
      { id: "declaraciones", label: "Declaraciones" },
      { id: "pago", label: "Pago" },
      { id: "completado", label: "Completado" },
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
          const siguiente = pasos[i + 1];
          const conectorActivo = completo;
          const conectorParcial = !completo && siguiente && actual;
          return (
            <li
              key={paso.id}
              className="relative flex-1 flex flex-col items-center text-center min-w-0"
            >
              {i < pasos.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    omitido
                      ? "bg-slate-100"
                      : conectorActivo
                        ? "bg-emerald-500"
                        : conectorParcial
                          ? "bg-gradient-to-r from-blue-400 to-slate-200"
                          : "bg-slate-200"
                  }`}
                />
              )}
              <span
                title={omitido ? `${paso.label} · no aplica (sin pago)` : paso.label}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all ${
                  omitido
                    ? "bg-slate-50 text-slate-300 border-dashed border-slate-200"
                    : completo
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100"
                      : actual
                        ? "bg-white text-blue-700 border-blue-500 ring-4 ring-blue-100"
                        : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                {omitido ? "—" : completo ? <CheckIcon /> : i + 1}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
