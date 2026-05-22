"use client";

import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  esIngresoGeneralCliente,
} from "@/lib/clientes";
import EstadoBadge from "@/components/EstadoBadge";

export type ClienteCardMovilProps = {
  cliente: Cliente;
  periodo: Periodo;
  onSelect: (cli: Cliente) => void;
  onEditar: (cli: Cliente, e: React.MouseEvent) => void;
  onAccesoPortal: (cli: Cliente, e: React.MouseEvent) => void;
  onEliminar: (cli: Cliente, e: React.MouseEvent) => void;
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function ClienteCardMovil({
  cliente,
  periodo,
  onSelect,
  onEditar,
  onAccesoPortal,
  onEliminar,
}: ClienteCardMovilProps) {
  const esIngreso = esIngresoGeneralCliente(cliente);
  return (
    <button
      type="button"
      onClick={() => onSelect(cliente)}
      className="w-full max-w-full text-left rounded-2xl bg-white ring-1 ring-slate-100 hover:ring-indigo-300 transition-all shadow-sm p-3 active:scale-[0.99] overflow-hidden"
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight truncate">
            {cliente.razonSocial}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-widest truncate">
            {cliente.rfc}
          </p>
        </div>
        <div className="shrink-0">
          <EstadoBadge cliente={cliente} periodo={periodo} />
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center min-w-0">
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
            Honorarios
          </p>
          <p className="text-sm font-black text-slate-800 mt-0.5 tabular-nums truncate">
            {esIngreso
              ? <span className="text-violet-600 text-[10px] uppercase tracking-widest">Variable</span>
              : `$${cliente.honorarios.toLocaleString()}`}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
            Inicia
          </p>
          <p className="text-xs font-bold text-slate-600 italic mt-0.5 truncate">
            {MESES_NOM[cliente.inicioMes]} {cliente.inicioAnio}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
            Día pago
          </p>
          <p className="text-sm font-black text-slate-800 mt-0.5 truncate">
            {cliente.fechaPago}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-0.5">
        {!esIngreso ? (
          <span
            role="button"
            aria-label="Acceso al portal"
            onClick={(e) => onAccesoPortal(cliente, e)}
            className="p-1.5 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
          >
            <KeyIcon />
          </span>
        ) : null}
        <span
          role="button"
          aria-label="Editar cliente"
          onClick={(e) => onEditar(cliente, e)}
          className="p-1.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        >
          <EditIcon />
        </span>
        {!esIngreso ? (
          <span
            role="button"
            aria-label="Eliminar cliente"
            onClick={(e) => onEliminar(cliente, e)}
            className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            <TrashIcon />
          </span>
        ) : null}
      </div>
    </button>
  );
}
