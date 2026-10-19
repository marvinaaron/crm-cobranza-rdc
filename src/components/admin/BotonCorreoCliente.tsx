"use client";

import { useEffect, useRef, useState } from "react";
import {
  abrirCorreoCobranza,
  buildCorreoCobranza,
  copiarCorreoHtml,
  enviarCorreoCobranzaResend,
  CORREO_BOTON_LABEL,
  CORREO_TIPOS,
  posicionCorreoCobro,
  type TipoCorreoCobranza,
} from "@/lib/correo";
import type { Cliente, Periodo } from "@/lib/clientes";
import {
  formatFechaContacto,
  VIA_CONTACTO_LABEL,
  type MarcaRecordatorio,
} from "@/lib/recordatorios";
import ModalPreviewCorreo from "@/components/admin/ModalPreviewCorreo";
import BarraMailsCobro from "@/components/admin/BarraMailsCobro";

/**
 * Botón híbrido para enviar correos de cobranza al cliente.
 *
 * Estructura:
 *   1. Botón principal con ícono de sobre (color según tipo de correo).
 *   2. Al hacer clic abre un mini-popover con:
 *      - Previsualizar / Enviar ahora / Copiar HTML / Abrir Gmail
 *   3. Tras un envío exitoso (o `enviadoEn` persistido) el botón pasa a
 *      verde para confirmar que ya se notificó.
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
  notify?: (opts: {
    titulo: string;
    mensaje?: string;
    tono?: "info" | "warning" | "danger";
  }) => void;
  /** Layout: "compacto" para tabla (botón redondo), "ancho" para tarjeta móvil. */
  variante?: "compacto" | "ancho";
  /** Se dispara cuando el admin contacta al cliente (enviar / copiar / borrador). */
  onContactado?: (
    via: "enviado" | "copiado" | "borrador",
    tipoEnviado?: TipoCorreoCobranza
  ) => void;
  /** ISO o truthy: este correo ya se envió (cambia el color del botón). */
  enviadoEn?: string | null;
  /** Última marca del periodo (enviado, copiado, borrador o a mano). */
  ultima?: MarcaRecordatorio;
  /** El cliente ya pagó este periodo. */
  pagado?: boolean;
  /** Muestra el tipo de correo junto al icono (Cobro manual). */
  conEtiqueta?: boolean;
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
  onContactado,
  enviadoEn,
  ultima,
  pagado = false,
  conEtiqueta = false,
}: BotonCorreoClienteProps) {
  const [abierto, setAbierto] = useState(false);
  const [preview, setPreview] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [marcadoLocal, setMarcadoLocal] = useState(false);
  const [tipoOverride, setTipoOverride] = useState<TipoCorreoCobranza | null>(
    null
  );
  const contenedorRef = useRef<HTMLDivElement>(null);

  const tipoEfectivo = tipoOverride ?? tipo;
  const tipoHecho = ultima?.tipo ?? tipoEfectivo;
  const etiquetaTipo = CORREO_BOTON_LABEL[tipoHecho];
  const fechaHecho = enviadoEn || ultima?.contactadoEn;
  const yaEnviado =
    Boolean(enviadoEn) || marcadoLocal || ultima?.via === "enviado";
  const yaEsteTipo =
    (marcadoLocal && tipoOverride == null) ||
    (ultima?.tipo === tipoEfectivo &&
      (ultima.via === "enviado" || Boolean(enviadoEn)));
  const puedeAbrir = habilitado || yaEnviado || Boolean(ultima) || pagado;
  const posicion = posicionCorreoCobro(ultima);
  const correoPreview = buildCorreoCobranza(cliente, periodo, tipoEfectivo);

  const fechaBoton = fechaHecho
    ? new Date(fechaHecho).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
      })
    : "";

  let linea1 = "Enviar";
  let linea2 = CORREO_BOTON_LABEL[tipoEfectivo];
  let detallePopover = `Aún no se envía. Este es el correo de ${CORREO_TIPOS[tipoEfectivo].labelCorto.toLowerCase()}.`;
  if (pagado) {
    linea1 = "Pagó";
    if (yaEnviado || ultima) {
      linea2 = `Se envió ${etiquetaTipo}`;
      detallePopover = `El cliente ya pagó. Se le mandó ${CORREO_TIPOS[tipoHecho].label}${
        fechaHecho ? ` el ${formatFechaContacto(fechaHecho)}` : ""
      }.`;
    } else {
      linea2 = "Sin correo";
      detallePopover = "El cliente ya pagó. No hubo correo de cobro.";
    }
  } else if (!habilitado && !ultima) {
    linea1 = "Sin correo";
    linea2 = motivo ?? "No se puede enviar";
    detallePopover = motivo ?? "No se puede enviar este correo.";
  } else if (ultima && ultima.tipo !== tipoEfectivo) {
    detallePopover = `Siguiente: ${CORREO_TIPOS[tipoEfectivo].label}. Ya se mandó ${CORREO_TIPOS[ultima.tipo].label}${
      fechaHecho ? ` el ${formatFechaContacto(fechaHecho)}` : ""
    }.`;
  } else if (yaEsteTipo) {
    linea1 = "Enviado";
    linea2 = fechaBoton ? `${etiquetaTipo} · ${fechaBoton}` : etiquetaTipo;
    detallePopover = `Ya se envió ${CORREO_TIPOS[tipoEfectivo].label}${
      fechaHecho ? ` el ${formatFechaContacto(fechaHecho)}` : ""
    }.`;
  } else if (ultima) {
    linea1 = VIA_CONTACTO_LABEL[ultima.via];
    linea2 = etiquetaTipo;
    detallePopover = `${VIA_CONTACTO_LABEL[ultima.via]}: ${CORREO_TIPOS[tipoHecho].label}${
      fechaHecho ? ` · ${formatFechaContacto(fechaHecho)}` : ""
    }.`;
  }

  useEffect(() => {
    if (!abierto) return;
    const handler = (e: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
        setTipoOverride(null);
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
    ? (motivo ?? "Cliente al día")
    : yaEnviado
      ? `${titulo ?? "Enviar correo"} · ya enviado`
      : `${titulo ?? "Enviar correo"}${descripcion ? ` · ${descripcion}` : ""}`;

  const handleEnviarResend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enviando) return;
    setEnviando(true);
    const correo = cliente.email?.trim();
    const res = await enviarCorreoCobranzaResend(cliente, periodo, tipoEfectivo);
    setEnviando(false);
    setAbierto(false);
    setPreview(false);
    if (res.ok) {
      setMarcadoLocal(true);
      onContactado?.("enviado", tipoEfectivo);
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
    abrirCorreoCobranza(cliente, periodo, tipoEfectivo);
    onContactado?.("borrador", tipoEfectivo);
    setAbierto(false);
  };

  const handleCopiarHtml = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copiarCorreoHtml(cliente, periodo, tipoEfectivo);
      onContactado?.("copiado", tipoEfectivo);
      setCopiado(true);
      notify?.({
        titulo: "Correo copiado con formato",
        mensaje:
          "Abre un correo nuevo en Gmail (o tu cliente preferido) y pega con Ctrl/Cmd + V. El formato HTML se conserva.",
        tono: "info",
      });
      setTimeout(() => setCopiado(false), 2400);
      setTimeout(() => setAbierto(false), 400);
    } catch {
      notify?.({
        titulo: "No se pudo copiar",
        mensaje:
          "Tu navegador bloqueó el portapapeles. Inténtalo de nuevo o usa 'Enviar ahora'.",
        tono: "warning",
      });
    }
  };

  const popover = abierto ? (
    <PopoverContenido
      encabezado={CORREO_TIPOS[tipoEfectivo].label}
      detalle={detallePopover}
      puedeEnviar={habilitado && !pagado}
      onPrevisualizar={(e) => {
        e.stopPropagation();
        setAbierto(false);
        setPreview(true);
      }}
      onEnviar={handleEnviarResend}
      onCopiarHtml={handleCopiarHtml}
      onAbrirGmail={handleAbrirGmail}
      enviando={enviando}
      copiado={copiado}
      tipoColor={colores.punto}
      yaEnviado={yaEsteTipo}
    />
  ) : null;

  const previewModal = (
    <ModalPreviewCorreo
      abierto={preview}
      titulo={correoPreview.subject}
      subtitulo={cliente.email?.trim()}
      html={correoPreview.html}
      onCerrar={() => setPreview(false)}
    />
  );

  const botonAnchoClass = !habilitado
    ? "bg-slate-50 text-slate-300 cursor-not-allowed"
    : yaEnviado
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : colores.boton;

  const botonCompactoClass = !habilitado
    ? "bg-slate-50 text-slate-300 cursor-not-allowed"
    : yaEnviado
      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ring-1 ring-emerald-300"
      : colores.boton;

  if (variante === "ancho") {
    return (
      <div className="relative" ref={contenedorRef}>
        <button
          type="button"
          disabled={!puedeAbrir}
          onClick={(e) => {
            e.stopPropagation();
            if (puedeAbrir) setAbierto((v) => !v);
          }}
          className={`w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${botonAnchoClass}`}
          title={tooltip}
        >
          {yaEnviado ? <CheckIcon /> : <MailIcon />}
          {yaEnviado ? `Enviado · ${etiquetaTipo}` : (titulo ?? "Correo")}
        </button>
        {popover}
        {previewModal}
      </div>
    );
  }

  if (conEtiqueta) {
    return (
      <div className="relative" ref={contenedorRef}>
        <BarraMailsCobro
          posicion={
            tipoOverride
              ? posicionCorreoCobro({ tipo: tipoOverride })
              : posicion
          }
          disabled={!puedeAbrir}
          onClick={() => {
            if (puedeAbrir) setAbierto((v) => !v);
          }}
          onAvanzar={(siguiente) => {
            if (!habilitado || pagado) return;
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
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        disabled={!puedeAbrir}
        onClick={(e) => {
          e.stopPropagation();
          if (puedeAbrir) setAbierto((v) => !v);
        }}
        className={`h-9 w-9 inline-flex items-center justify-center rounded-full transition-all ${botonCompactoClass}`}
        title={`${linea1} · ${linea2}`}
      >
        {yaEnviado ? <CheckIcon /> : <MailIcon />}
      </button>
      {popover}
      {previewModal}
    </div>
  );
}

function PopoverContenido({
  encabezado,
  detalle,
  puedeEnviar,
  onPrevisualizar,
  onEnviar,
  onCopiarHtml,
  onAbrirGmail,
  enviando,
  copiado,
  tipoColor,
  yaEnviado,
}: {
  encabezado: string;
  detalle: string;
  puedeEnviar: boolean;
  onPrevisualizar: (e: React.MouseEvent) => void;
  onEnviar: (e: React.MouseEvent) => void;
  onCopiarHtml: (e: React.MouseEvent) => void;
  onAbrirGmail: (e: React.MouseEvent) => void;
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
      <div className="px-3 py-2.5 mb-0.5">
        <p className="text-[12px] font-semibold text-slate-900 leading-tight">
          {encabezado}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
          {detalle}
        </p>
      </div>
      {puedeEnviar ? (
      <>
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
            Previsualizar
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Revisa el HTML exacto antes de enviarlo.
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onEnviar}
        disabled={enviando}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-violet-50/70 transition-colors group disabled:opacity-60 disabled:cursor-wait"
      >
        <div className="flex-none mt-0.5 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-violet-900/30">
          {enviando ? <SpinnerIcon /> : <SendIcon />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            {enviando ? "Enviando…" : yaEnviado ? "Reenviar ahora" : "Enviar ahora"}
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Sale automático desde el dominio del despacho, con formato HTML.
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onCopiarHtml}
        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50/70 transition-colors group"
      >
        <div
          className={`flex-none mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            copiado
              ? "bg-emerald-500 text-white"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {copiado ? <CheckIcon /> : <ClipboardIcon />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-tight">
            {copiado ? "¡Copiado!" : "Copiar con formato → Gmail"}
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Pégalo en un correo nuevo de tu Gmail y conserva el diseño.
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
            Abrir borrador en Gmail
          </p>
          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
            Solo texto plano (limitación del estándar mailto:).
          </p>
        </div>
      </button>
      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 mt-1 border-t border-slate-100">
        <span className={`w-1.5 h-1.5 rounded-full ${tipoColor}`} />
        <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">
          {yaEnviado ? "Ya enviado · puedes reenviar" : "Correo de cobro"}
        </span>
      </div>
      </>
      ) : null}
    </div>
  );
}
