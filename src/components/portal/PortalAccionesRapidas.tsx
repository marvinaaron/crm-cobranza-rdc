"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { useClientes } from "@/context/ClientesContext";
import { encargoAbierto } from "@/lib/encargos";

/** Construye un link de WhatsApp a partir del teléfono del contador. */
function waLinkContador(telefono: string | undefined): string {
  const mensaje =
    "Hola, soy cliente del portal de RDC Contadores y tengo una duda: ";
  if (telefono) {
    const digits = telefono.replace(/\D/g, "");
    if (digits.length >= 10) {
      const conLada = digits.length === 10 ? `52${digits}` : digits;
      return `https://wa.me/${conLada}?text=${encodeURIComponent(mensaje)}`;
    }
  }
  // Fallback: WhatsApp general del despacho.
  return CONTACTO_PUBLICO.whatsapp.buildUrl(mensaje);
}

/**
 * Grid de "Acciones rápidas" en el inicio del portal del cliente.
 *
 * Convierte el inicio en un hub: los 4 caminos más comunes están a un solo
 * tap de distancia (subir comprobante, ver declaraciones, perfil, contacto).
 * En desktop son 4 columnas, en móvil 2.
 */

type Accion = {
  titulo: string;
  descripcion: string;
  href?: string;
  externo?: boolean;
  icono: ReactNode;
  tono: "blue" | "emerald" | "violet" | "amber" | "indigo";
  /** Número opcional que se pinta como badge en la esquina (pendientes). */
  badge?: number;
};

const TONOS: Record<
  Accion["tono"],
  { bg: string; iconBg: string; iconText: string; hover: string; chip: string }
> = {
  blue: {
    bg: "bg-blue-50/60",
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
    hover: "hover:bg-blue-50",
    chip: "rdc-chip rdc-chip-blue",
  },
  emerald: {
    bg: "bg-emerald-50/60",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    hover: "hover:bg-emerald-50",
    chip: "rdc-chip rdc-chip-green",
  },
  violet: {
    bg: "bg-violet-50/60",
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    hover: "hover:bg-violet-50",
    chip: "rdc-chip rdc-chip-violet",
  },
  amber: {
    bg: "bg-amber-50/60",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    hover: "hover:bg-amber-50",
    chip: "rdc-chip rdc-chip-amber",
  },
  indigo: {
    bg: "bg-indigo-50/60",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-700",
    hover: "hover:bg-indigo-50",
    chip: "rdc-chip rdc-chip-indigo",
  },
};

const ClipboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const MessageCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.043zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
);

export default function PortalAccionesRapidas() {
  const { contador } = usePortalContadorAsignado();
  const { cliente } = usePortalAuth();
  const { getEncargosCliente } = useClientes();
  const emailContador = contador?.email;
  const waUrl = waLinkContador(contador?.telefono);

  const encargosAbiertos = cliente
    ? getEncargosCliente(cliente.id).filter(encargoAbierto).length
    : 0;

  const acciones: Accion[] = [
    {
      titulo: "Confirmar mi pago",
      descripcion: "Pago de impuestos del periodo",
      href: "/portal/cumplimiento",
      icono: <UploadIcon />,
      tono: "indigo",
    },
    {
      titulo: "Solicitudes",
      descripcion: "Facturas, documentos y trámites",
      href: "/portal/encargos",
      icono: <ClipboardIcon />,
      tono: "violet",
      badge: encargosAbiertos,
    },
    {
      titulo: "Situación SAT",
      descripcion: "Opinión 32-D, CSF y e.firma",
      href: "/portal/sat",
      icono: <FileTextIcon />,
      tono: "blue",
    },
    {
      titulo: "Pagar honorarios",
      descripcion: "Historial y saldo del despacho",
      href: "/portal/honorarios",
      icono: <CreditCardIcon />,
      tono: "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {acciones.map((a) => {
        const t = TONOS[a.tono];
        return (
          <Link key={a.titulo} href={a.href!} className="block">
            <div
              className={`rdc-card ${t.bg} ${t.hover} border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-colors h-full`}
            >
              <div
                className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${t.iconBg} ${t.iconText} ${t.chip} flex items-center justify-center`}
              >
                {a.icono}
                {a.badge != null && a.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {a.badge > 9 ? "9+" : a.badge}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                  {a.titulo}
                </p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {a.descripcion}
                </p>
              </div>
            </div>
          </Link>
        );
      })}

      {/* Contactar despacho: WhatsApp + correo en la misma tarjeta. */}
      <div className="rdc-card bg-amber-50/60 border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 h-full">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-100 text-amber-700 rdc-chip rdc-chip-amber flex items-center justify-center">
          <MessageCircleIcon />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">
            Contactar despacho
          </p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            Estamos para ayudarte
          </p>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-95 transition"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
          {emailContador ? (
            <a
              href={`mailto:${emailContador}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition"
            >
              <MailIcon />
              Correo
            </a>
          ) : (
            <Link
              href="/portal/perfil"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition"
            >
              <MailIcon />
              Correo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
