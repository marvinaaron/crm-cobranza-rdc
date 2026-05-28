"use client";

import { useEffect, useRef, useState } from "react";
import {
  abrirCorreoCobranza,
  enviarCorreoCobranzaResend,
  type TipoCorreoCobranza,
} from "@/lib/correo";
import type { Cliente, Periodo } from "@/lib/clientes";

/**
 * Botón híbrido para enviar correos de cobranza al cliente.
 *
 * Estructura:
 *   1. Botón principal con ícono de sobre (color según tipo de correo).
 *   2. Al hacer clic abre un mini-popover con dos acciones:
 *      - "Enviar ahora": envía vía Resend con la plantilla HTML del
 *        despacho. El cliente recibe el correo formateado al instante.
 *      - "Abrir en Gmail": comportamiento clásico `mailto:` — abre el
 *        cliente de correo del admin con borrador en texto plano.
 *
 * Si el cliente no tiene correo o está al día, el botón aparece
 * deshabilitado con el motivo en el `title`.
 */
export type BotonCorreoClienteProps = {
  cliente: Cliente;
  periodo: Periodo;
  tipo: TipoCorreoCobranza;
  habilitado: boolean;
  motivo?: string;
  titulo?: string;
  descripcion?: string;
  /** Notificación tipo toast/modal (típicamente useNotify del provider). */
  notify?: (opts: { titulo: string; mensaje?: string; tono?: "info" | "warning" | "danger" }) => void;
  /** Layout: "compacto" para tabla (botón redondo), "ancho" para tarjeta móvil. */
  variante?: "compacto" | "ancho";
};

const COLORES: Record<
  TipoCorreoCobranza,
  { boton: string; punto: string }
> = {
  recordatorio: {
    boton: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    punto: "bg-blue-500",
  },
  vencido: {
    boton: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    punto: "bg-amber-500",
  },
  cierre_mes: {
    boton: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    punto: "bg-indigo-500",
  },
};

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SendIcon() {
  return (
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
    >
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

function OpenIcon() {
  return (
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
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function BotonCorreoCliente({
  cliente,
  periodo,
  tipo,
  habilitado,
  motivo,
  titulo,
  descripcion,
  notify,
  variante = "compacto",
}: BotonCorreoClienteProps) {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const handler = (e: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, [abierto]);

  const colores = COLORES[tipo];
  const tooltip = habilitado
    ? `${titulo ?? "Enviar correo"}${descripcion ? ` · ${descripcion}` : ""}`
    : (motivo ?? "Cliente al día");

  const handleEnviarResend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enviando) return;
    setEnviando(true);
    const correo = cliente.email?.trim();
    const res = await enviarCorreoCobranzaResend(cliente, periodo, tipo);
    setEnviando(false);
    setAbierto(false);
    if (res.ok) {
      notify?.({
        titulo: "Correo enviado",
        mensaje: correo
          ? `Se envió el correo HTML a ${correo} desde el dominio del despacho.`
          : "Se envió el correo correctamente.",
        tono: "info",
      });
    } else {
      notify?.({
        titulo: "No se pudo enviar",
        mensaje:
          res.error ??
          "Revisa la variable RESEND_API_KEY en el servidor y que el dominio esté verificado.",
        tono: "warning",
      });
    }
  };

  const handleAbrirGmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    abrirCorreoCobranza(cliente, periodo, tipo);
    setAbierto(false);
  };

  if (variante === "ancho") {
    return (
      <div className="relative" ref={contenedorRef}>
        <button
          type="button"
          disabled={!habilitado}
          onClick={(e) => {
            e.stopPropagation();
            if (habilitado) setAbierto((v) => !v);
          }}
          className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            habilitado
              ? colores.boton
              : "bg-slate-50 text-slate-300 cursor-not-allowed"
          }`}
          title={tooltip}
        >
          <MailIcon />
          {titulo ?? "Correo"}
        </button>
        {abierto && (
          <PopoverContenido
            onEnviar={handleEnviarResend}
            onAbrirGmail={handleAbrirGmail}
            enviando={enviando}
            tipoColor={colores.punto}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        disabled={!habilitado}
        onClick={(e) => {
          e.stopPropagation();
          if (habilitado) setAbierto((v) => !v);
        }}
        className={`p-3 rounded-full transition-all ${
          habilitado
            ? colores.boton
            : "bg-slate-50 text-slate-300 cursor-not-allowed"
        }`}
        title={tooltip}
      >
        <MailIcon />
      </button>
      {abierto && (
        <PopoverContenido
          onEnviar={handleEnviarResend}
          onAbrirGmail={handleAbrirGmail}
          enviando={enviando}
          tipoColor={colores.punto}
        />
      )}
    </div>
  );
}

function PopoverContenido({
  onEnviar,
  onAbrirGmail,
  enviando,
  tipoColor,
}: {
  onEnviar: (e: React.MouseEvent) => void;
  onAbrirGmail: (e: React.MouseEvent) => void;
  enviando: boolean;
  tipoColor: string;
}) {
  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-900/10 p-1.5 origin-top-right"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onEnviar}
        disabled={enviando}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-violet-50/70 transition-colors group disabled:opacity-60 disabled:cursor-wait"
      >
        <div
          className={`flex-none mt-0.5 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-violet-900/30`}
        >
          {enviando ? <SpinnerIcon /> : <SendIcon />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            {enviando ? "Enviando…" : "Enviar ahora"}
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Llega al cliente con el formato HTML del despacho.
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onAbrirGmail}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <OpenIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            Abrir en Gmail
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Abre un borrador en tu correo personal (sale como texto).
          </p>
        </div>
      </button>
      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 mt-1 border-t border-slate-100">
        <span className={`w-1.5 h-1.5 rounded-full ${tipoColor}`} />
        <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">
          Correo inteligente
        </span>
      </div>
    </div>
  );
}
