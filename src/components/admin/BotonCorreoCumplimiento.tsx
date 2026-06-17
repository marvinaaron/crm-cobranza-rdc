"use client";

import { useEffect, useRef, useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import {
  abrirCorreoCumplimientoListo,
  abrirCorreoImpuestosCalculados,
  abrirCorreoRecordatorioLimite,
  abrirCorreoSinPagoImpuestos,
  copiarCorreoCumplimientoHtml,
  copiarCorreoImpuestosCalculadosHtml,
  copiarCorreoRecordatorioLimiteHtml,
  copiarCorreoSinPagoHtml,
  enviarCorreoCumplimientoListoResend,
  enviarCorreoImpuestosCalculadosResend,
  enviarCorreoRecordatorioLimiteResend,
  enviarCorreoSinPagoImpuestosResend,
  type OpcionesCorreoCumplimientoListo,
  type TipoCorreoCumplimiento,
} from "@/lib/correo-cumplimiento";

export type BotonCorreoCumplimientoProps = {
  cliente: Cliente;
  periodo: Periodo;
  tipo: TipoCorreoCumplimiento;
  registro?: RegistroCumplimiento;
  opts?: OpcionesCorreoCumplimientoListo;
  habilitado: boolean;
  motivo?: string;
  titulo?: string;
  notify?: (opts: {
    titulo: string;
    mensaje?: string;
    tono?: "info" | "warning" | "danger";
  }) => void;
  variante?: "compacto" | "ancho";
  className?: string;
  onContactado?: (via: "enviado" | "copiado" | "borrador") => void;
};

const COLORES: Record<TipoCorreoCumplimiento, { boton: string; punto: string }> =
  {
    listo: {
      boton: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
      punto: "bg-indigo-500",
    },
    sin_pago: {
      boton: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      punto: "bg-emerald-500",
    },
    recordatorio_limite: {
      boton: "bg-red-50 text-red-600 hover:bg-red-100",
      punto: "bg-red-500",
    },
    previo: {
      boton: "bg-amber-50 text-amber-700 hover:bg-amber-100",
      punto: "bg-amber-500",
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

function ClipboardIcon() {
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
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
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

export default function BotonCorreoCumplimiento({
  cliente,
  periodo,
  tipo,
  registro,
  opts,
  habilitado,
  motivo,
  titulo,
  notify,
  variante = "compacto",
  className = "",
  onContactado,
}: BotonCorreoCumplimientoProps) {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);
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
    ? titulo ?? "Enviar correo"
    : (motivo ?? "No disponible");

  const handleEnviarResend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enviando) return;
    setEnviando(true);
    const correo = cliente.email?.trim();

    let res: { ok: boolean; error?: string };
    if (tipo === "sin_pago") {
      res = await enviarCorreoSinPagoImpuestosResend(cliente, periodo);
    } else if (!registro) {
      res = { ok: false, error: "Falta el registro de cumplimiento." };
    } else if (tipo === "listo") {
      res = await enviarCorreoCumplimientoListoResend(
        cliente,
        periodo,
        registro,
        undefined,
        opts
      );
    } else if (tipo === "previo") {
      res = await enviarCorreoImpuestosCalculadosResend(
        cliente,
        periodo,
        registro
      );
    } else {
      res = await enviarCorreoRecordatorioLimiteResend(
        cliente,
        periodo,
        registro
      );
    }

    setEnviando(false);
    setAbierto(false);
    if (res.ok) {
      onContactado?.("enviado");
      notify?.({
        titulo: "Correo enviado",
        mensaje: correo
          ? `Se envió a ${correo} desde no-reply@rdcontadores.com.`
          : "Se envió el correo correctamente.",
        tono: "info",
      });
    } else {
      notify?.({
        titulo: "No se pudo enviar",
        mensaje:
          res.error ??
          "Revisa RESEND_API_KEY y que rdcontadores.com esté verificado en Resend.",
        tono: "warning",
      });
    }
  };

  const handleAbrirGmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let ok = false;
    if (tipo === "sin_pago") {
      ok = await abrirCorreoSinPagoImpuestos(cliente, periodo);
    } else if (registro) {
      if (tipo === "listo") {
        ok = await abrirCorreoCumplimientoListo(
          cliente,
          periodo,
          registro,
          undefined,
          opts
        );
      } else if (tipo === "previo") {
        ok = await abrirCorreoImpuestosCalculados(cliente, periodo, registro);
      } else {
        ok = await abrirCorreoRecordatorioLimite(cliente, periodo, registro);
      }
    }
    if (ok) {
      onContactado?.("borrador");
      notify?.({
        titulo: "Borrador en Gmail",
        mensaje:
          "Se abrió Gmail y el HTML quedó en el portapapeles. Pega con Ctrl/Cmd + V si quieres editarlo.",
        tono: "info",
      });
    }
    setAbierto(false);
  };

  const handleCopiarHtml = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (tipo === "sin_pago") {
        await copiarCorreoSinPagoHtml(cliente, periodo);
      } else if (registro) {
        if (tipo === "listo") {
          await copiarCorreoCumplimientoHtml(
            cliente,
            periodo,
            registro,
            undefined,
            opts
          );
        } else if (tipo === "previo") {
          await copiarCorreoImpuestosCalculadosHtml(cliente, periodo, registro);
        } else {
          await copiarCorreoRecordatorioLimiteHtml(
            cliente,
            periodo,
            registro
          );
        }
      }
      onContactado?.("copiado");
      setCopiado(true);
      notify?.({
        titulo: "Correo copiado con formato",
        mensaje: "Pégalo en Gmail si quieres revisarlo antes de enviar.",
        tono: "info",
      });
      setTimeout(() => setCopiado(false), 2400);
      setTimeout(() => setAbierto(false), 400);
    } catch {
      notify?.({
        titulo: "No se pudo copiar",
        mensaje: "Usa «Enviar ahora» o abre el borrador en Gmail.",
        tono: "warning",
      });
    }
  };

  const popover = abierto ? (
    <PopoverContenido
      onEnviar={handleEnviarResend}
      onCopiarHtml={handleCopiarHtml}
      onAbrirGmail={handleAbrirGmail}
      enviando={enviando}
      copiado={copiado}
      tipoColor={colores.punto}
    />
  ) : null;

  if (variante === "ancho") {
    return (
      <div className={`relative ${className}`} ref={contenedorRef}>
        <button
          type="button"
          disabled={!habilitado}
          onClick={(e) => {
            e.stopPropagation();
            if (habilitado) setAbierto((v) => !v);
          }}
          className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            habilitado
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          }`}
          title={tooltip}
        >
          <MailIcon />
          {titulo ?? "Correo"}
        </button>
        {popover}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={contenedorRef}>
      <button
        type="button"
        disabled={!habilitado}
        onClick={(e) => {
          e.stopPropagation();
          if (habilitado) setAbierto((v) => !v);
        }}
        className={`p-2.5 rounded-full transition-all ${
          habilitado ? colores.boton : "bg-slate-50 text-slate-300 cursor-not-allowed"
        }`}
        title={tooltip}
      >
        <MailIcon />
      </button>
      {popover}
    </div>
  );
}

function PopoverContenido({
  onEnviar,
  onCopiarHtml,
  onAbrirGmail,
  enviando,
  copiado,
  tipoColor,
}: {
  onEnviar: (e: React.MouseEvent) => void;
  onCopiarHtml: (e: React.MouseEvent) => void;
  onAbrirGmail: (e: React.MouseEvent) => void;
  enviando: boolean;
  copiado: boolean;
  tipoColor: string;
}) {
  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-900/10 p-1.5 origin-top-right"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onEnviar}
        disabled={enviando}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-violet-50/70 transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-violet-900/30">
          {enviando ? <SpinnerIcon /> : <SendIcon />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            {enviando ? "Enviando…" : "Enviar ahora"}
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Desde no-reply@rdcontadores.com · HTML automático.
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onCopiarHtml}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50/70 transition-colors"
      >
        <div
          className={`flex-none mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${
            copiado ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {copiado ? <CheckIcon /> : <ClipboardIcon />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            {copiado ? "¡Copiado!" : "Copiar con formato → Gmail"}
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Revisa o edita antes de enviar desde tu cuenta.
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onAbrirGmail}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <OpenIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            Abrir borrador en Gmail
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Cuerpo en texto plano + HTML en portapapeles.
          </p>
        </div>
      </button>
      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 mt-1 border-t border-slate-100">
        <span className={`w-1.5 h-1.5 rounded-full ${tipoColor}`} />
        <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">
          Cumplimiento · correo
        </span>
      </div>
    </div>
  );
}
