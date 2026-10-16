"use client";

import {
  type Cliente,
  esIngresoGeneralCliente,
  estadoCumpleanos,
  huecosContactoCliente,
} from "@/lib/clientes";
import { etiquetaRegimenCliente } from "@/lib/regimenes-fiscales";

export type ClienteCardMovilProps = {
  cliente: Cliente;
  onSelect: (cli: Cliente) => void;
  onEditar: (cli: Cliente, e: React.MouseEvent) => void;
  onFelicitarCumple?: (cli: Cliente, e: React.MouseEvent) => void;
  enviandoCumple?: boolean;
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const CakeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M2 21h20" />
    <path d="M7 8v2" />
    <path d="M12 8v2" />
    <path d="M17 8v2" />
    <path d="M7 4v2" />
    <path d="M12 4v2" />
    <path d="M17 4v2" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ClienteCardMovil({
  cliente,
  onSelect,
  onEditar,
  onFelicitarCumple,
  enviandoCumple,
}: ClienteCardMovilProps) {
  const esIngreso = esIngresoGeneralCliente(cliente);
  const estadoCumple = esIngreso ? "sin_fecha" : estadoCumpleanos(cliente);
  const mostrarCumple =
    estadoCumple === "hoy" ||
    estadoCumple === "mes_actual" ||
    estadoCumple === "ya_notificado";
  const huecos = huecosContactoCliente(cliente);

  return (
    <div className="flex items-stretch gap-1">
      <button
        type="button"
        onClick={() => onSelect(cliente)}
        className="min-w-0 flex-1 text-left rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] hover:ring-violet-200 transition-shadow shadow-sm px-3.5 py-3"
      >
        <p className="text-[15px] font-semibold text-slate-900 leading-tight truncate">
          {cliente.razonSocial}
        </p>
            <p className="text-[12px] font-mono text-slate-500 mt-0.5 uppercase tracking-wide truncate">
          {cliente.rfc}
        </p>
        <p className="text-[12px] text-slate-500 mt-0.5 truncate">
          {etiquetaRegimenCliente(cliente.regimenFiscalClave)}
        </p>
        {huecos.length > 0 ? (
          <p className="mt-1 text-[12px] text-orange-600">Falta {huecos.join(" y ")}</p>
        ) : null}
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-semibold tabular-nums text-slate-800">
            {esIngreso ? (
              <span className="text-violet-600 text-[12px] font-semibold uppercase tracking-wide">
                Variable
              </span>
            ) : (
              `$${cliente.honorarios.toLocaleString()}`
            )}
          </p>
          <p className="text-[12px] font-medium text-slate-500">Día {cliente.fechaPago}</p>
        </div>
      </button>
      <div className="flex flex-col justify-center gap-1 shrink-0">
        {mostrarCumple && onFelicitarCumple ? (
          <button
            type="button"
            aria-label="Felicitación de cumpleaños"
            disabled={estadoCumple !== "hoy" || enviandoCumple}
            onClick={(e) => {
              e.stopPropagation();
              onFelicitarCumple(cliente, e);
            }}
            className={`h-10 w-10 inline-flex items-center justify-center rounded-full ${
              estadoCumple === "ya_notificado"
                ? "bg-emerald-50 text-emerald-600"
                : estadoCumple === "hoy"
                  ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                  : "bg-violet-50 text-violet-500"
            } disabled:cursor-not-allowed`}
          >
            {estadoCumple === "ya_notificado" ? <CheckIcon /> : <CakeIcon />}
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Editar cliente"
          onClick={(e) => {
            e.stopPropagation();
            onEditar(cliente, e);
          }}
          className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <EditIcon />
        </button>
      </div>
    </div>
  );
}
