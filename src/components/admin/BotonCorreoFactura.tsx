"use client";

import { useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { useNotify } from "@/components/ConfirmProvider";
import {
  type FacturaPago,
  facturaCorreoEnviado,
  facturaPdfDisponible,
  formatFechaFactura,
} from "@/lib/facturas";
import { isValidEmail } from "@/lib/email";

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="animate-spin"
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  factura?: FacturaPago;
  variante?: "compacto" | "ancho";
};

export default function BotonCorreoFactura({
  cliente,
  periodo,
  factura,
  variante = "compacto",
}: Props) {
  const { enviarCorreoFactura } = useClientes();
  const notify = useNotify();
  const [enviando, setEnviando] = useState(false);

  if (!facturaPdfDisponible(factura)) return null;

  const enviado = facturaCorreoEnviado(factura);
  const emailOk = isValidEmail(cliente.email ?? "");
  const error = factura?.correoError?.trim();

  const titulo = !emailOk
    ? "El cliente no tiene correo válido"
    : enviado
      ? `Correo enviado${factura?.correoEnviadoEn ? ` · ${formatFechaFactura(factura.correoEnviadoEn)}` : ""}`
      : error
        ? `No se envió: ${error}. Clic para reintentar.`
        : "Enviar recibo con PDF al cliente";

  const onEnviar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!emailOk || enviando || enviado) return;
    setEnviando(true);
    try {
      const correo = await enviarCorreoFactura(cliente.id, periodo, factura);
      if (correo.ok) {
        notify({
          titulo: "Correo enviado",
          mensaje: `Recibo con factura enviado a ${cliente.email?.trim()}.`,
          tono: "info",
        });
      } else {
        notify({
          titulo: "No se pudo enviar",
          mensaje: correo.error ?? "Inténtalo de nuevo.",
          tono: "warning",
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  const base =
    variante === "ancho"
      ? "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest"
      : "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest";

  if (enviado) {
    return (
      <span
        title={titulo}
        onClick={(e) => e.stopPropagation()}
        className={`${base} bg-emerald-100 text-emerald-700`}
      >
        <CheckIcon />
        {variante === "ancho" ? "Enviado" : "Ok"}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => void onEnviar(e)}
      disabled={!emailOk || enviando}
      title={titulo}
      className={`${base} transition-all ${
        !emailOk
          ? "bg-slate-50 text-slate-300 cursor-not-allowed"
          : error
            ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            : "bg-slate-800 text-white hover:bg-slate-700"
      }`}
    >
      {enviando ? <SpinnerIcon /> : <MailIcon />}
      {variante === "ancho"
        ? enviando
          ? "Enviando"
          : error
            ? "Reenviar"
            : "Mail"
        : enviando
          ? "…"
          : "Mail"}
    </button>
  );
}
