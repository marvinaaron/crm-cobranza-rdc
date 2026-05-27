"use client";

import type { Cliente, Periodo } from "@/lib/clientes";
import {
  calcularEstado,
  esIngresoGeneralCliente,
  estaPagado,
  getCompromisoMes,
  getMontoMes,
  getMontoPagado,
  getTotalPendiente,
  tienePagoParcial,
  type EstadoCliente,
} from "@/lib/clientes";
import EstadoBadge from "@/components/EstadoBadge";
import { getCorreoIndividualCliente, type TipoCorreoCobranza } from "@/lib/correo";

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

function etiquetaCompromisoMes(
  pagadoMes: boolean,
  parcialMes: boolean,
  estado: EstadoCliente
): { texto: string; clase: string } {
  if (pagadoMes) return { texto: "Pagado", clase: "text-emerald-600" };
  if (parcialMes)
    return { texto: "Pagado parcialmente", clase: "text-amber-600" };
  if (estado === "ATRASADO")
    return { texto: "Pendiente de pago", clase: "text-red-600" };
  return { texto: "Pendiente de pago", clase: "text-amber-600" };
}

function clasePendiente(estado: EstadoCliente, monto: number): string {
  if (monto <= 0) return "text-slate-400";
  if (estado === "ATRASADO") return "text-red-600";
  if (estado === "PENDIENTE") return "text-amber-600";
  return "text-indigo-600";
}

const estilosBotonCorreo = (tipo: TipoCorreoCobranza, habilitado: boolean) => {
  if (!habilitado) return "bg-slate-50 text-slate-300";
  switch (tipo) {
    case "recordatorio":
      return "bg-blue-50 text-blue-600";
    case "vencido":
      return "bg-amber-50 text-amber-700";
    case "cierre_mes":
      return "bg-indigo-50 text-indigo-600";
  }
};

export type CobranzaCardMovilProps = {
  cliente: Cliente;
  periodo: Periodo;
  mesLabel: string;
  hoy: Date;
  comprobanteNuevo: boolean;
  comprobanteEstado?: "pendiente" | "aceptado" | "rechazado";
  tieneFactura: boolean;
  pagadoMes: boolean;
  onSelect: (cli: Cliente) => void;
  onRegistrarPago: (e: React.MouseEvent, cli: Cliente) => void;
  onRevisarComprobante: (e: React.MouseEvent, cli: Cliente) => void;
  onFactura: (e: React.MouseEvent, cli: Cliente) => void;
  onCorreo: (e: React.MouseEvent, cli: Cliente, tipo: TipoCorreoCobranza) => void;
};

export default function CobranzaCardMovil({
  cliente,
  periodo,
  mesLabel,
  hoy,
  comprobanteNuevo,
  comprobanteEstado,
  tieneFactura,
  pagadoMes,
  onSelect,
  onRegistrarPago,
  onRevisarComprobante,
  onFactura,
  onCorreo,
}: CobranzaCardMovilProps) {
  const esGeneral = esIngresoGeneralCliente(cliente);
  const pagado = estaPagado(cliente, periodo);
  const parcial = tienePagoParcial(cliente, periodo);
  const pagadoPeriodo = getMontoPagado(cliente, periodo);
  const estado = calcularEstado(cliente, periodo);
  const etiquetaMes = etiquetaCompromisoMes(pagado, parcial, estado);
  const pendienteTotal = getTotalPendiente(cliente, periodo);
  const montoMes = esGeneral
    ? pagadoPeriodo
    : pagado || parcial
      ? getMontoMes(cliente, periodo)
      : getCompromisoMes(cliente, periodo);
  const correoInd = getCorreoIndividualCliente(cliente, periodo, hoy);

  return (
    <button
      type="button"
      onClick={() => onSelect(cliente)}
      className={`w-full text-left rounded-2xl bg-white ring-1 shadow-sm p-4 active:scale-[0.99] transition-all ${
        comprobanteNuevo
          ? "ring-indigo-200 bg-indigo-50/30"
          : esGeneral
            ? "ring-violet-100"
            : "ring-slate-100 hover:ring-emerald-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight truncate">
            {cliente.razonSocial}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-widest">
            {cliente.rfc}
            {!esGeneral && (
              <span className="ml-2 text-slate-500">· Día {cliente.fechaPago}</span>
            )}
          </p>
        </div>
        <EstadoBadge cliente={cliente} periodo={periodo} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {mesLabel}
          </p>
          <p className="text-base font-black text-slate-800 tabular-nums mt-0.5">
            {esGeneral && pagadoPeriodo === 0
              ? "—"
              : `$${montoMes.toLocaleString()}`}
          </p>
          <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${etiquetaMes.clase}`}>
            {esGeneral
              ? pagadoPeriodo > 0
                ? "Ingreso"
                : "Sin ingreso"
              : etiquetaMes.texto}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Pendiente total
          </p>
          <p className={`text-base font-black tabular-nums mt-0.5 ${clasePendiente(estado, pendienteTotal)}`}>
            ${pendienteTotal.toLocaleString()}
          </p>
        </div>
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {!esGeneral && (
          <button
            type="button"
            onClick={(e) => onRegistrarPago(e, cliente)}
            className="flex-1 min-w-[120px] py-2.5 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700"
          >
            Registrar pago
          </button>
        )}
        {comprobanteEstado && (
          <button
            type="button"
            onClick={(e) => onRevisarComprobante(e, cliente)}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
              comprobanteEstado === "aceptado"
                ? "bg-emerald-100 text-emerald-700"
                : comprobanteNuevo
                  ? "bg-indigo-600 text-white animate-pulse"
                  : "bg-indigo-100 text-indigo-700"
            }`}
          >
            <TicketIcon />
            {comprobanteEstado === "aceptado" ? "OK" : comprobanteNuevo ? "Nuevo" : "Cmp."}
          </button>
        )}
        {pagadoMes && !esGeneral && (
          <button
            type="button"
            onClick={(e) => onFactura(e, cliente)}
            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
              tieneFactura
                ? "bg-slate-800 text-white"
                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
            }`}
          >
            {tieneFactura ? "PDF" : "Factura"}
          </button>
        )}
        <button
          type="button"
          disabled={!correoInd.habilitado}
          onClick={(e) => {
            if (correoInd.habilitado) onCorreo(e, cliente, correoInd.tipo);
          }}
          className={`p-2.5 rounded-xl transition-all ${
            correoInd.habilitado
              ? estilosBotonCorreo(correoInd.tipo, true)
              : estilosBotonCorreo("recordatorio", false)
          }`}
          title={correoInd.habilitado ? correoInd.titulo : correoInd.motivo}
        >
          <MailIcon />
        </button>
      </div>
    </button>
  );
}
