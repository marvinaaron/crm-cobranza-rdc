"use client";

import Link from "next/link";
import {
  type Cliente,
  esIngresoGeneralCliente,
  estadoCumpleanos,
  alertasFichaCliente,
} from "@/lib/clientes";
import { claseChipRegimen, etiquetaRegimenCorto } from "@/lib/regimenes-fiscales";
import type { WorkflowResumen } from "@/lib/cobranza-workflow";
import type { Pendiente } from "@/lib/pendientes";
import AvatarCliente from "@/components/admin/AvatarCliente";
import WorkflowCircleMini from "@/components/admin/WorkflowCircleMini";
import PildoraPendientesCliente from "@/components/admin/PildoraPendientesCliente";

export type ClienteCardMovilProps = {
  cliente: Cliente;
  onSelect: (cli: Cliente) => void;
  onEditar: (cli: Cliente, e: React.MouseEvent) => void;
  onFelicitarCumple?: (cli: Cliente, e: React.MouseEvent) => void;
  enviandoCumple?: boolean;
  workflow?: WorkflowResumen | null;
  pendientesAbiertos?: Pendiente[];
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const CakeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M2 21h20" />
    <path d="M7 8v2M12 8v2M17 8v2M7 4v2M12 4v2M17 4v2" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ClienteCardMovil({
  cliente,
  onSelect,
  onEditar,
  onFelicitarCumple,
  enviandoCumple,
  workflow,
  pendientesAbiertos = [],
}: ClienteCardMovilProps) {
  const esIngreso = esIngresoGeneralCliente(cliente);
  const estadoCumple = esIngreso ? "sin_fecha" : estadoCumpleanos(cliente);
  const mostrarCumple =
    estadoCumple === "hoy" ||
    estadoCumple === "mes_actual" ||
    estadoCumple === "ya_notificado";
  const alertas = alertasFichaCliente(cliente);
  const regimenCorto = etiquetaRegimenCorto(cliente.regimenFiscalClave);

  return (
    <div className="rounded-[1.1rem] bg-white ring-1 ring-black/[0.04] shadow-sm px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={() => onSelect(cliente)}
          className="min-w-0 flex-1 flex items-start gap-2.5 text-left"
        >
          <AvatarCliente cliente={cliente} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-slate-900 leading-tight truncate">
              {cliente.razonSocial}
            </p>
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wide truncate mt-0.5">
              {cliente.rfc}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-0.5 shrink-0">
          {mostrarCumple && onFelicitarCumple ? (
            <button
              type="button"
              aria-label="Felicitación de cumpleaños"
              disabled={estadoCumple !== "hoy" || enviandoCumple}
              onClick={(e) => {
                e.stopPropagation();
                onFelicitarCumple(cliente, e);
              }}
              className={`h-8 w-8 inline-flex items-center justify-center rounded-full ${
                estadoCumple === "ya_notificado"
                  ? "bg-emerald-50 text-emerald-600"
                  : estadoCumple === "hoy"
                    ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                    : "text-violet-500 hover:bg-violet-50"
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
            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <EditIcon />
          </button>
          {workflow ? (
            <Link
              href={`/cumplimiento?cliente=${cliente.id}`}
              title={`Cumplimiento · ${workflow.labelCorto}`}
              aria-label={`Abrir cumplimiento de ${cliente.razonSocial}, paso ${workflow.paso}`}
              className="inline-flex"
            >
              <WorkflowCircleMini resumen={workflow} size="xs" sinPopover />
            </Link>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(cliente)}
        className="mt-0.5 w-full flex items-baseline justify-between gap-2 text-left"
      >
        <span
          className={`truncate text-[11px] font-semibold ${claseChipRegimen(cliente.regimenFiscalClave)}`}
        >
          {regimenCorto}
        </span>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-800">
          {esIngreso ? (
            <span className="text-violet-600">Variable · DÍA {cliente.fechaPago}</span>
          ) : (
            `$${cliente.honorarios.toLocaleString()} · DÍA ${cliente.fechaPago}`
          )}
        </span>
      </button>

      {alertas.length > 0 ? (
        <p className="mt-1 text-[11px] text-orange-600">Falta {alertas.join(", ")}</p>
      ) : null}

      {pendientesAbiertos.length > 0 ? (
        <div className="mt-1.5">
          <PildoraPendientesCliente
            clienteId={cliente.id}
            pendientes={pendientesAbiertos}
          />
        </div>
      ) : null}
    </div>
  );
}
