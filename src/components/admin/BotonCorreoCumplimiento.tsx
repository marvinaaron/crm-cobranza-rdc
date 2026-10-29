"use client";

import { useEffect, useRef, useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import {
  buildCorreoCumplimientoListo,
  buildCorreoMesCerrado,
  buildCorreoPreLimite,
  buildCorreoRecordatorioLimite,
  buildCorreoSinPagoImpuestos,
  copiarCorreoCumplimientoHtml,
  copiarCorreoPreLimiteHtml,
  copiarCorreoRecordatorioLimiteHtml,
  copiarCorreoSinPagoHtml,
  enviarCorreoCumplimientoListoResend,
  enviarCorreoMesCerradoResend,
  enviarCorreoPreLimiteResend,
  enviarCorreoRecordatorioLimiteResend,
  enviarCorreoSinPagoImpuestosResend,
  posicionCorreoCumplimiento,
  type OpcionesCorreoCumplimientoListo,
  type TipoCorreoCumplimiento,
  type TipoPasoCorreoCumplimiento,
} from "@/lib/correo-cumplimiento";
import ModalPreviewCorreo from "@/components/admin/ModalPreviewCorreo";
import BarraMailsCumplimiento from "@/components/admin/BarraMailsCumplimiento";

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
  onContactado?: (
    via: "enviado" | "copiado" | "borrador",
    tipoEnviado?: TipoCorreoCumplimiento
  ) => void;
  /** ISO o truthy: el correo de este tipo ya se envió (cambia el color del botón). */
  enviadoEn?: string | null;
  /** Barra Listo → Pre-límite → Plazo → Cerrado (tablero). */
  conBarra?: boolean;
};

const COLORES: Record<TipoCorreoCumplimiento, { boton: string; punto: string }> =
  {
    listo: {
      boton: "bg-slate-900 text-white hover:bg-slate-800",
      punto: "bg-slate-900",
    },
    pre_limite: {
      boton: "bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
      punto: "bg-cyan-600",
    },
    cerrado: {
      boton: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
      punto: "bg-emerald-600",
    },
    sin_pago: {
      boton: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
      punto: "bg-emerald-600",
    },
    recordatorio_limite: {
      boton: "bg-red-50 text-red-700 hover:bg-red-100",
      punto: "bg-red-600",
    },
    /** Legado: mismo estilo que listo (ya no es “preliminar”). */
    previo: {
      boton: "bg-slate-900 text-white hover:bg-slate-800",
      punto: "bg-slate-900",
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

function EyeIcon() {
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
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
  enviadoEn,
  conBarra = false,
}: BotonCorreoCumplimientoProps) {
  const [abierto, setAbierto] = useState(false);
  const [preview, setPreview] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [marcadoLocal, setMarcadoLocal] = useState(false);
  const [tipoOverride, setTipoOverride] = useState<TipoCorreoCumplimiento | null>(
    null
  );
  const contenedorRef = useRef<HTMLDivElement>(null);

  const tipoEfectivo = tipoOverride ?? tipo;
  const yaEnviado = Boolean(enviadoEn) || marcadoLocal;
  const posicion = posicionCorreoCumplimiento(
    registro?.ultimoCorreoTipo
      ? { tipo: registro.ultimoCorreoTipo }
      : null,
    registro
  );

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

  const colores = COLORES[tipoEfectivo];
  const tooltip = !habilitado
    ? (motivo ?? "No disponible")
    : yaEnviado
      ? `${titulo ?? "Correo"} · ya enviado`
      : (titulo ?? "Enviar correo");

  const buildPreview = () => {
    if (tipoEfectivo === "sin_pago") {
      return buildCorreoSinPagoImpuestos(cliente, periodo);
    }
    if (tipoEfectivo === "cerrado") {
      return buildCorreoMesCerrado(cliente, periodo);
    }
    if (!registro) return null;
    if (tipoEfectivo === "listo" || tipoEfectivo === "previo") {
      return buildCorreoCumplimientoListo(
        cliente,
        periodo,
        registro,
        undefined,
        opts
      );
    }
    if (tipoEfectivo === "pre_limite") {
      return buildCorreoPreLimite(cliente, periodo, registro);
    }
    return buildCorreoRecordatorioLimite(cliente, periodo, registro);
  };

  const handleEnviarResend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enviando) return;
    setEnviando(true);
    const correo = cliente.email?.trim();

    let res: { ok: boolean; error?: string };
    if (tipoEfectivo === "sin_pago") {
      res = await enviarCorreoSinPagoImpuestosResend(cliente, periodo);
    } else if (tipoEfectivo === "cerrado") {
      res = await enviarCorreoMesCerradoResend(cliente, periodo);
    } else if (!registro) {
      res = { ok: false, error: "Falta el registro de cumplimiento." };
    } else if (tipoEfectivo === "listo" || tipoEfectivo === "previo") {
      res = await enviarCorreoCumplimientoListoResend(
        cliente,
        periodo,
        registro,
        undefined,
        opts
      );
    } else if (tipoEfectivo === "pre_limite") {
      res = await enviarCorreoPreLimiteResend(cliente, periodo, registro);
    } else {
      res = await enviarCorreoRecordatorioLimiteResend(
        cliente,
        periodo,
        registro
      );
    }

    setEnviando(false);
    setAbierto(false);
    setPreview(false);
    if (res.ok) {
      setMarcadoLocal(true);
      onContactado?.("enviado", tipoEfectivo);
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

  const handleCopiarHtml = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (tipoEfectivo === "sin_pago") {
        await copiarCorreoSinPagoHtml(cliente, periodo);
      } else if (tipoEfectivo === "cerrado") {
        const { texto, html } = buildCorreoMesCerrado(cliente, periodo);
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([texto], { type: "text/plain" }),
          }),
        ]);
      } else if (registro) {
        if (tipoEfectivo === "listo" || tipoEfectivo === "previo") {
          await copiarCorreoCumplimientoHtml(
            cliente,
            periodo,
            registro,
            undefined,
            opts
          );
        } else if (tipoEfectivo === "pre_limite") {
          await copiarCorreoPreLimiteHtml(cliente, periodo, registro);
        } else {
          await copiarCorreoRecordatorioLimiteHtml(
            cliente,
            periodo,
            registro
          );
        }
      }
      onContactado?.("copiado", tipoEfectivo);
      setCopiado(true);
      notify?.({
        titulo: "Correo copiado",
        mensaje: "Quedó en el portapapeles con formato.",
        tono: "info",
      });
      setTimeout(() => setCopiado(false), 2400);
      setTimeout(() => setAbierto(false), 400);
    } catch {
      notify?.({
        titulo: "No se pudo copiar",
        mensaje: "Usa «Enviar» o «Visualizar».",
        tono: "warning",
      });
    }
  };

  const correoPreview = buildPreview();

  const popover = abierto ? (
    <PopoverContenido
      onPrevisualizar={(e) => {
        e.stopPropagation();
        setAbierto(false);
        setPreview(true);
      }}
      onEnviar={handleEnviarResend}
      onCopiarHtml={handleCopiarHtml}
      enviando={enviando}
      copiado={copiado}
      tipoColor={colores.punto}
      yaEnviado={yaEnviado}
    />
  ) : null;

  const previewModal = correoPreview ? (
    <ModalPreviewCorreo
      abierto={preview}
      titulo={correoPreview.subject}
      subtitulo={cliente.email?.trim()}
      html={correoPreview.html}
      onCerrar={() => setPreview(false)}
    />
  ) : null;

  /* Ya enviado → gris claro (sigue abriendo el menú para reenviar). */
  const botonAnchoClass = !habilitado
    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
    : yaEnviado
      ? "bg-slate-200 text-slate-600 hover:bg-slate-300 ring-1 ring-slate-300/80"
      : tipoEfectivo === "recordatorio_limite"
        ? "bg-white text-red-600 border border-red-200 hover:bg-red-50"
        : tipoEfectivo === "pre_limite"
          ? "bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100"
          : "bg-slate-900 text-white hover:bg-slate-800";

  const botonCompactoClass = !habilitado
    ? "bg-slate-50 text-slate-300 cursor-not-allowed"
    : yaEnviado
      ? "bg-slate-200 text-slate-500 hover:bg-slate-300 ring-1 ring-slate-300"
      : colores.boton;

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
          className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${botonAnchoClass}`}
          title={tooltip}
        >
          {yaEnviado ? <CheckIcon /> : <MailIcon />}
          {yaEnviado ? "Ya enviado" : (titulo ?? "Correo")}
        </button>
        {popover}
        {previewModal}
      </div>
    );
  }

  if (conBarra) {
    return (
      <div className={`relative ${className}`} ref={contenedorRef}>
        <BarraMailsCumplimiento
          posicion={
            tipoOverride
              ? posicionCorreoCumplimiento({ tipo: tipoOverride }, registro)
              : posicion
          }
          disabled={!habilitado && posicion === 0}
          onClick={() => {
            if (habilitado || posicion > 0) setAbierto((v) => !v);
          }}
          onAvanzar={(siguiente: TipoPasoCorreoCumplimiento) => {
            if (!habilitado && posicion === 0) return;
            setTipoOverride(siguiente);
            setAbierto(true);
          }}
        />
        {popover}
        {previewModal}
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
        className={`p-2.5 rounded-full transition-all ${botonCompactoClass}`}
        title={tooltip}
      >
        {yaEnviado ? <CheckIcon /> : <MailIcon />}
      </button>
      {popover}
      {previewModal}
    </div>
  );
}

function PopoverContenido({
  onPrevisualizar,
  onEnviar,
  onCopiarHtml,
  enviando,
  copiado,
  tipoColor,
  yaEnviado,
}: {
  onPrevisualizar: (e: React.MouseEvent) => void;
  onEnviar: (e: React.MouseEvent) => void;
  onCopiarHtml: (e: React.MouseEvent) => void;
  enviando: boolean;
  copiado: boolean;
  tipoColor: string;
  yaEnviado: boolean;
}) {
  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-900/10 p-1.5 origin-top-right"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onPrevisualizar}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-sky-50/70 transition-colors"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
          <EyeIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            Visualizar
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Mira el correo tal como lo recibirá el cliente.
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
            {copiado ? "¡Copiado!" : "Copiar correo"}
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            HTML con formato al portapapeles.
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onEnviar}
        disabled={enviando}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-violet-50/70 transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
          {enviando ? <SpinnerIcon /> : <SendIcon />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            {enviando ? "Enviando…" : yaEnviado ? "Reenviar sin cambios" : "Enviar sin cambios"}
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Desde no-reply@rdcontadores.com · tal cual.
          </p>
        </div>
      </button>
      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 mt-1 border-t border-slate-100">
        <span className={`w-1.5 h-1.5 rounded-full ${tipoColor}`} />
        <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">
          {yaEnviado ? "Ya enviado · puedes reenviar" : "Cumplimiento · correo"}
        </span>
      </div>
    </div>
  );
}
