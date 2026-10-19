"use client";

import type { Cliente, Periodo } from "@/lib/clientes";
import {
  calcularEstado,
  esIngresoGeneralCliente,
  estaPagado,
  getCompromisoMes,
  getMontoMes,
  getMontoPagado,
  getTotalDeudaPendiente,
  getTotalExtraPorCobrar,
  tienePagoParcial,
  type EstadoCliente,
} from "@/lib/clientes";
import EstadoBadge from "@/components/EstadoBadge";
import AvatarCliente from "@/components/admin/AvatarCliente";
import { getCorreoIndividualCliente } from "@/lib/correo";
import BotonCorreoCliente from "@/components/admin/BotonCorreoCliente";
import BotonPedirCapturaCobranza from "@/components/admin/BotonPedirCapturaCobranza";
import BotonCorreoFactura from "@/components/admin/BotonCorreoFactura";
import {
  type FacturaPago,
  facturaPdfArchivada,
  facturaPdfDisponible,
  facturaRegistrada,
} from "@/lib/facturas";
import type { TipoCorreoCobranza } from "@/lib/correo";

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
    return { texto: "Pendiente de pago", clase: "text-rose-600" };
  return { texto: "Pendiente de pago", clase: "text-amber-600" };
}

function clasePendiente(estado: EstadoCliente, monto: number): string {
  if (monto <= 0) return "text-slate-400";
  if (estado === "ATRASADO") return "text-rose-600";
  if (estado === "PENDIENTE") return "text-amber-600";
  return "text-indigo-600";
}

export type CobranzaCardMovilProps = {
  cliente: Cliente;
  periodo: Periodo;
  mesLabel: string;
  hoy: Date;
  comprobanteNuevo: boolean;
  comprobanteEstado?: "pendiente" | "aceptado" | "rechazado";
  factura?: FacturaPago;
  pagadoMes: boolean;
  onSelect: (cli: Cliente) => void;
  onRegistrarPago: (e: React.MouseEvent, cli: Cliente) => void;
  onRevisarComprobante: (e: React.MouseEvent, cli: Cliente) => void;
  onFactura: (e: React.MouseEvent, cli: Cliente) => void;
  /** Toast/notify del provider; se usa para feedback del envío por Resend. */
  notify?: (opts: { titulo: string; mensaje?: string; tono?: "info" | "warning" | "danger" }) => void;
  /** ISO del último envío Resend (colorea el botón en verde). */
  enviadoEn?: string | null;
  onContactado?: (
    via: "enviado" | "copiado" | "borrador",
    tipo: TipoCorreoCobranza
  ) => void;
};

export default function CobranzaCardMovil({
  cliente,
  periodo,
  mesLabel,
  hoy,
  comprobanteNuevo,
  comprobanteEstado,
  factura,
  pagadoMes,
  onSelect,
  onRegistrarPago,
  onRevisarComprobante,
  onFactura,
  notify,
  enviadoEn,
  onContactado,
}: CobranzaCardMovilProps) {
  const esGeneral = esIngresoGeneralCliente(cliente);
  const pagado = estaPagado(cliente, periodo);
  const parcial = tienePagoParcial(cliente, periodo);
  const pagadoPeriodo = getMontoPagado(cliente, periodo);
  const estado = calcularEstado(cliente, periodo);
  const etiquetaMes = etiquetaCompromisoMes(pagado, parcial, estado);
  const pendienteTotal = getTotalDeudaPendiente(cliente, periodo);
  const extraPorCobrar = getTotalExtraPorCobrar(cliente);
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
      className={`w-full text-left rounded-[1.25rem] p-3.5 active:scale-[0.99] transition-colors ${
        comprobanteNuevo
          ? "bg-indigo-50/40"
          : esGeneral
            ? "bg-violet-50/30"
            : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <AvatarCliente cliente={cliente} size="sm" />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-slate-900 leading-tight truncate">
              {cliente.razonSocial}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {cliente.rfc}
              {!esGeneral && (
                <span className="ml-2 font-semibold text-slate-500">· Día {cliente.fechaPago}</span>
              )}
            </p>
          </div>
        </div>
        <EstadoBadge cliente={cliente} periodo={periodo} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-[1rem] bg-slate-50 px-3 py-2 dark:bg-white/5">
          <p className="text-[11px] font-semibold text-slate-400">
            {mesLabel}
          </p>
          <p className="text-[17px] font-bold text-slate-900 tabular-nums mt-0.5 leading-none tracking-tight">
            {esGeneral && pagadoPeriodo === 0
              ? "—"
              : `$${montoMes.toLocaleString()}`}
          </p>
          <p className={`text-[11px] font-semibold mt-1 ${etiquetaMes.clase}`}>
            {esGeneral
              ? pagadoPeriodo > 0
                ? "Ingreso"
                : "Sin ingreso"
              : etiquetaMes.texto}
          </p>
        </div>
        <div className="rounded-[1rem] bg-slate-50 px-3 py-2 dark:bg-white/5">
          <p className="text-[11px] font-semibold text-slate-400">
            Pendiente total
          </p>
          <p className={`text-[17px] font-bold tabular-nums mt-0.5 leading-none tracking-tight ${clasePendiente(estado, pendienteTotal)}`}>
            ${pendienteTotal.toLocaleString()}
          </p>
          {!esGeneral && extraPorCobrar > 0 && (
            <p className="text-[11px] font-medium text-amber-600 mt-1 tabular-nums">
              incl. {extraPorCobrar.toLocaleString()} extra
            </p>
          )}
        </div>
      </div>

      <div
        className="mt-2.5 flex flex-wrap items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {!esGeneral && (
          <button
            type="button"
            onClick={(e) => onRegistrarPago(e, cliente)}
            className="flex-1 min-w-[96px] h-9 rounded-full bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700"
          >
            Registrar pago
          </button>
        )}
        {!esGeneral && (
          <BotonPedirCapturaCobranza
            cliente={cliente}
            tipo="honorarios"
            variante="ancho"
          />
        )}
        {comprobanteEstado && (
          <button
            type="button"
            onClick={(e) => onRevisarComprobante(e, cliente)}
            className={`inline-flex items-center gap-1 h-9 px-3 rounded-full text-[12px] font-semibold ${
              comprobanteEstado === "aceptado"
                ? "bg-emerald-50 text-emerald-700"
                : comprobanteNuevo
                  ? "bg-indigo-600 text-white animate-pulse"
                  : "bg-indigo-50 text-indigo-700"
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
            className={`h-9 px-3 rounded-full text-[12px] font-semibold ${
              facturaPdfDisponible(factura)
                ? "bg-slate-800 text-white"
                : facturaRegistrada(factura)
                  ? "bg-slate-100 text-slate-600"
                  : "bg-amber-50 text-amber-700"
            }`}
            title={
              facturaPdfDisponible(factura)
                ? "Factura PDF disponible"
                : facturaPdfArchivada(factura)
                  ? "Facturado · PDF archivado"
                  : "Subir factura"
            }
          >
            {facturaPdfDisponible(factura)
              ? "PDF"
              : facturaRegistrada(factura)
                ? "Facturado"
                : "Factura"}
          </button>
        )}
        <BotonCorreoFactura
          cliente={cliente}
          periodo={periodo}
          factura={factura}
          variante="ancho"
        />
        <div className="flex-1 min-w-[96px]">
          <BotonCorreoCliente
            cliente={cliente}
            periodo={periodo}
            tipo={correoInd.habilitado ? correoInd.tipo : "recordatorio"}
            habilitado={correoInd.habilitado}
            motivo={correoInd.habilitado ? undefined : correoInd.motivo}
            titulo={correoInd.habilitado ? correoInd.titulo : undefined}
            descripcion={correoInd.habilitado ? correoInd.descripcion : undefined}
            notify={notify}
            variante="ancho"
            enviadoEn={enviadoEn}
            onContactado={(via) =>
              onContactado?.(
                via,
                correoInd.habilitado ? correoInd.tipo : "recordatorio"
              )
            }
          />
        </div>
      </div>
    </button>
  );
}
