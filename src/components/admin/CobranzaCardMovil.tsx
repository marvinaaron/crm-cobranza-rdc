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
import AvatarCliente from "@/components/admin/AvatarCliente";
import {
  getCorreoIndividualCliente,
  type TipoCorreoCobranza,
} from "@/lib/correo";
import BotonCorreoCliente from "@/components/admin/BotonCorreoCliente";
import BotonFacturaCobranza from "@/components/BotonFacturaCobranza";
import type { FacturaPago } from "@/lib/facturas";

const TicketIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
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
  const montoTexto =
    esGeneral && pagadoPeriodo === 0 ? "—" : `$${montoMes.toLocaleString()}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(cliente)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(cliente);
        }
      }}
      className={`w-full text-left rounded-[1.25rem] px-3 py-2.5 active:scale-[0.99] transition-colors ${
        comprobanteNuevo
          ? "bg-indigo-50/40"
          : esGeneral
            ? "bg-violet-50/30"
            : "bg-white"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <AvatarCliente cliente={cliente} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-slate-900 leading-tight truncate">
            {cliente.razonSocial}
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
            {cliente.rfc}
            {!esGeneral && (
              <span className="ml-2 font-sans font-semibold text-slate-500">
                · Día {cliente.fechaPago}
              </span>
            )}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[15px] font-bold tabular-nums text-slate-900 leading-none tracking-tight">
            {montoTexto}
          </p>
          <p className={`text-[11px] font-semibold mt-0.5 ${etiquetaMes.clase}`}>
            {esGeneral
              ? pagadoPeriodo > 0
                ? "Ingreso"
                : "Sin ingreso"
              : etiquetaMes.texto}
          </p>
          {pendienteTotal > 0 && !esGeneral && (
            <p
              className={`text-[11px] font-bold tabular-nums ${clasePendiente(estado, pendienteTotal)}`}
            >
              ${pendienteTotal.toLocaleString()}
              {extraPorCobrar > 0 ? " · extra" : ""}
            </p>
          )}
        </div>
      </div>

      <div
        className="mt-2 flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {!esGeneral && (
          <button
            type="button"
            onClick={(e) => onRegistrarPago(e, cliente)}
            className="flex-1 h-9 rounded-full bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700"
          >
            Registrar pago
          </button>
        )}
        {!esGeneral && (
          <BotonFacturaCobranza
            variante="fila"
            factura={factura}
            pagadoMes={pagadoMes}
            onClick={(e) => onFactura(e, cliente)}
          />
        )}
        {comprobanteEstado && (
          <button
            type="button"
            onClick={(e) => onRevisarComprobante(e, cliente)}
            title={
              comprobanteEstado === "aceptado"
                ? "Comprobante validado"
                : comprobanteNuevo
                  ? "Comprobante nuevo"
                  : "Revisar comprobante"
            }
            className={`h-9 w-9 rounded-full grid place-items-center shrink-0 ${
              comprobanteEstado === "aceptado"
                ? "bg-emerald-50 text-emerald-700"
                : comprobanteNuevo
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-700"
            }`}
          >
            <TicketIcon />
          </button>
        )}
        <BotonCorreoCliente
          cliente={cliente}
          periodo={periodo}
          tipo={correoInd.habilitado ? correoInd.tipo : "recordatorio"}
          habilitado={correoInd.habilitado}
          motivo={correoInd.habilitado ? undefined : correoInd.motivo}
          titulo={correoInd.habilitado ? correoInd.titulo : undefined}
          descripcion={correoInd.habilitado ? correoInd.descripcion : undefined}
          notify={notify}
          variante="compacto"
          enviadoEn={enviadoEn}
          onContactado={(via) =>
            onContactado?.(
              via,
              correoInd.habilitado ? correoInd.tipo : "recordatorio"
            )
          }
        />
      </div>
      <span className="sr-only">{mesLabel}</span>
    </div>
  );
}
