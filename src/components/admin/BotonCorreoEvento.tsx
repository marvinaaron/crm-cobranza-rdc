"use client";

import { useEffect, useRef, useState } from "react";
import {
  abrirCorreoEvento,
  buildCorreoEvento,
  copiarCorreoEventoHtml,
  enviarCorreoEventoResend,
  type OpcionesCorreoEvento,
  type TipoCorreoEvento,
} from "@/lib/correo-eventos";
import type { Cliente, Periodo } from "@/lib/clientes";
import ModalPreviewCorreo from "@/components/admin/ModalPreviewCorreo";

export type BotonCorreoEventoProps = {
  cliente: Cliente;
  periodo: Periodo;
  tipo: TipoCorreoEvento;
  opciones?: OpcionesCorreoEvento;
  habilitado?: boolean;
  motivo?: string;
  titulo?: string;
  variante?: "compacto" | "ancho" | "barra";
  notify?: (opts: {
    titulo: string;
    mensaje?: string;
    tono?: "info" | "warning" | "danger";
  }) => void;
  onEnviado?: () => void;
  /** ISO o truthy: el correo ya se envió (cambia el color del botón). */
  enviadoEn?: string | null;
};

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function BotonCorreoEvento({
  cliente,
  periodo,
  tipo,
  opciones,
  habilitado = true,
  motivo,
  titulo = "Correo al cliente",
  variante = "compacto",
  notify,
  onEnviado,
  enviadoEn,
}: BotonCorreoEventoProps) {
  const [abierto, setAbierto] = useState(false);
  const [preview, setPreview] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [marcadoLocal, setMarcadoLocal] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const correo = buildCorreoEvento(cliente, periodo, tipo, opciones);
  const tieneEmail = Boolean(cliente.email?.trim());
  const activo = habilitado && tieneEmail;
  const yaEnviado = Boolean(enviadoEn) || marcadoLocal;
  const tooltip = activo
    ? yaEnviado
      ? `${titulo} · ya enviado`
      : titulo
    : (motivo ?? (tieneEmail ? "No disponible" : "Sin correo del cliente"));

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
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  const handleEnviar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enviando) return;
    setEnviando(true);
    const res = await enviarCorreoEventoResend(cliente, periodo, tipo, opciones);
    setEnviando(false);
    setAbierto(false);
    if (res.ok) {
      setMarcadoLocal(true);
      onEnviado?.();
      notify?.({
        titulo: "Correo enviado",
        mensaje: `Confirmación de pago enviada a ${cliente.email?.trim()}.`,
        tono: "info",
      });
    } else {
      notify?.({
        titulo: "No se pudo enviar",
        mensaje: res.error,
        tono: "warning",
      });
    }
  };

  const handleCopiar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copiarCorreoEventoHtml(cliente, periodo, tipo, opciones);
      setCopiado(true);
      notify?.({
        titulo: "Correo copiado",
        mensaje: "Pégalo en Gmail para conservar el formato HTML.",
        tono: "info",
      });
      setTimeout(() => setCopiado(false), 2400);
      setTimeout(() => setAbierto(false), 400);
    } catch {
      notify?.({
        titulo: "No se pudo copiar",
        mensaje: "Usa «Enviar ahora» o «Previsualizar».",
        tono: "warning",
      });
    }
  };

  const handleGmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    abrirCorreoEvento(cliente, periodo, tipo, opciones);
    setAbierto(false);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(true);
    setAbierto(false);
  };

  const popover = abierto ? (
    <div
      className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-900/10 p-1.5 origin-top-right"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handlePreview}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50/70 transition-colors"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <EyeIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            Previsualizar
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Ve el correo con checkmark y remanente antes de enviar.
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={handleEnviar}
        disabled={enviando}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-violet-50/70 transition-colors disabled:opacity-60"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white flex items-center justify-center">
          {enviando ? <SpinnerIcon /> : <SendIcon />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            {enviando ? "Enviando…" : "Enviar ahora"}
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Desde el dominio del despacho (Resend).
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={handleCopiar}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <ClipboardIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            {copiado ? "¡Copiado!" : "Copiar con formato"}
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Pégalo en tu Gmail manualmente.
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={handleGmail}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <OpenIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            Borrador en Gmail
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Solo texto plano (mailto).
          </p>
        </div>
      </button>
    </div>
  ) : null;

  const previewModal = (
    <ModalPreviewCorreo
      abierto={preview}
      titulo={correo.subject}
      subtitulo={cliente.email?.trim()}
      html={correo.html}
      onCerrar={() => setPreview(false)}
    />
  );

  if (variante === "barra") {
    return (
      <>
        <div
          ref={contenedorRef}
          className={`relative flex flex-wrap items-center gap-2 rounded-2xl border px-3 py-2.5 ${
            yaEnviado
              ? "border-emerald-300 bg-emerald-100/80"
              : "border-emerald-100 bg-emerald-50/60"
          }`}
        >
          <p className="text-[11px] font-bold text-emerald-800 flex-1 min-w-[140px]">
            {yaEnviado ? "Correo de pago enviado" : "Correo de pago confirmado"}
          </p>
          <button
            type="button"
            disabled={!activo}
            onClick={() => setPreview(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-[10px] font-black uppercase tracking-wider text-emerald-700 disabled:opacity-40"
          >
            <EyeIcon /> Previsualizar
          </button>
          <button
            type="button"
            disabled={!activo || enviando}
            onClick={(e) => void handleEnviar(e)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-40 ${
              yaEnviado ? "bg-emerald-700" : "bg-emerald-600"
            }`}
          >
            {enviando ? <SpinnerIcon /> : <SendIcon />}{" "}
            {yaEnviado ? "Reenviar" : "Enviar"}
          </button>
          <button
            type="button"
            disabled={!activo}
            onClick={() => setAbierto((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600 disabled:opacity-40"
          >
            <MailIcon /> Más
          </button>
          {popover}
        </div>
        {previewModal}
      </>
    );
  }

  const btnClass =
    variante === "ancho"
      ? `w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${
          !activo
            ? "bg-slate-50 text-slate-300 cursor-not-allowed"
            : yaEnviado
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`
      : `p-3 rounded-full transition-all ${
          !activo
            ? "bg-slate-50 text-slate-300 cursor-not-allowed"
            : yaEnviado
              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`;

  return (
    <>
      <div className="relative" ref={contenedorRef}>
        <button
          type="button"
          disabled={!activo}
          title={tooltip}
          onClick={(e) => {
            e.stopPropagation();
            if (activo) setAbierto((v) => !v);
          }}
          className={btnClass}
        >
          <MailIcon />
          {variante === "ancho"
            ? yaEnviado
              ? "Enviado"
              : titulo
            : null}
        </button>
        {popover}
      </div>
      {previewModal}
    </>
  );
}
