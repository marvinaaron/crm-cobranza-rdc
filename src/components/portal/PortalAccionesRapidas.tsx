"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";

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
  tono: "blue" | "emerald" | "violet" | "amber";
};

const TONOS: Record<Accion["tono"], { bg: string; iconBg: string; iconText: string; hover: string }> = {
  blue: {
    bg: "bg-blue-50/60",
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
    hover: "hover:bg-blue-50",
  },
  emerald: {
    bg: "bg-emerald-50/60",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    hover: "hover:bg-emerald-50",
  },
  violet: {
    bg: "bg-violet-50/60",
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    hover: "hover:bg-violet-50",
  },
  amber: {
    bg: "bg-amber-50/60",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    hover: "hover:bg-amber-50",
  },
};

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

export default function PortalAccionesRapidas() {
  const { contador } = usePortalContadorAsignado();
  const emailContador = contador?.email;

  const acciones: Accion[] = [
    {
      titulo: "Subir comprobante",
      descripcion: "Pago de impuestos del periodo",
      href: "/portal/cumplimiento",
      icono: <UploadIcon />,
      tono: "blue",
    },
    {
      titulo: "Mis declaraciones",
      descripcion: "Acuses y documentos del SAT",
      href: "/portal/cumplimiento",
      icono: <FileTextIcon />,
      tono: "violet",
    },
    {
      titulo: "Pagar honorarios",
      descripcion: "Historial y saldo del despacho",
      href: "/portal/honorarios",
      icono: <CreditCardIcon />,
      tono: "emerald",
    },
    {
      titulo: "Contactar despacho",
      descripcion: emailContador
        ? "Escríbenos por correo"
        : "Ponte en contacto con tu contador",
      href: emailContador ? `mailto:${emailContador}` : "/portal/perfil",
      externo: !!emailContador,
      icono: <MessageCircleIcon />,
      tono: "amber",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {acciones.map((a) => {
        const t = TONOS[a.tono];
        const contenido = (
          <div
            className={`${t.bg} ${t.hover} border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-colors h-full`}
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${t.iconBg} ${t.iconText} flex items-center justify-center`}
            >
              {a.icono}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 leading-tight">
                {a.titulo}
              </p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5 leading-snug">
                {a.descripcion}
              </p>
            </div>
          </div>
        );
        if (!a.href) {
          return <button key={a.titulo} type="button" className="text-left">{contenido}</button>;
        }
        if (a.externo) {
          return (
            <a
              key={a.titulo}
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {contenido}
            </a>
          );
        }
        return (
          <Link key={a.titulo} href={a.href} className="block">
            {contenido}
          </Link>
        );
      })}
    </div>
  );
}
