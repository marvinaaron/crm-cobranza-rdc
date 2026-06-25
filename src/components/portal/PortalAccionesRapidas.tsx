"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { useClientes } from "@/context/ClientesContext";
import { encargoAbierto } from "@/lib/encargos";
import type { FlujoCumplimiento } from "@/lib/cumplimiento";
import PortalContadorAsignadoCard from "@/components/portal/PortalContadorAsignadoCard";

type Props = {
  /** Oculta la tarjeta duplicada cuando ya hay alerta de pago arriba. */
  ocultarPagarHonorarios?: boolean;
  /** Sube "Pagar honorarios" en el grid cuando hay deuda y la tarjeta sigue visible. */
  priorizarHonorarios?: boolean;
  montoPendiente?: string;
  flujo?: FlujoCumplimiento;
  sinPagoImpuestos?: boolean;
};

/**
 * Grid de "Acciones rápidas" en el inicio del portal del cliente.
 *
 * Convierte el inicio en un hub: los 4 caminos más comunes están a un solo
 * tap de distancia (subir comprobante, ver declaraciones, perfil, contacto).
 * En desktop son 4 columnas, en móvil 2.
 */

type AccionId = "cumplimiento" | "solicitudes" | "sat" | "honorarios";

type Accion = {
  id: AccionId;
  titulo: string;
  descripcion: string;
  href?: string;
  externo?: boolean;
  icono: ReactNode;
  tono: "blue" | "emerald" | "violet" | "amber" | "indigo";
  /** Número opcional que se pinta como badge en la esquina (pendientes). */
  badge?: number;
};

function ordenAcciones(ctx: {
  flujo?: FlujoCumplimiento;
  sinPagoImpuestos?: boolean;
  encargosAbiertos: number;
  ocultarPagarHonorarios: boolean;
  priorizarHonorarios: boolean;
}): AccionId[] {
  const {
    flujo,
    sinPagoImpuestos,
    encargosAbiertos,
    priorizarHonorarios,
  } = ctx;

  if (flujo === "declaraciones" && !sinPagoImpuestos) {
    return ["cumplimiento", "solicitudes", "sat", "honorarios"];
  }
  if (flujo === "preliminar" && !sinPagoImpuestos) {
    return ["cumplimiento", "solicitudes", "sat", "honorarios"];
  }
  if (encargosAbiertos > 0) {
    return ["solicitudes", "cumplimiento", "sat", "honorarios"];
  }
  if (priorizarHonorarios) {
    return ["honorarios", "cumplimiento", "solicitudes", "sat"];
  }
  return ["cumplimiento", "solicitudes", "sat", "honorarios"];
}

const TONOS: Record<
  Accion["tono"],
  { bg: string; iconBg: string; iconText: string; hover: string; chip: string }
> = {
  blue: {
    bg: "bg-[var(--portal-navy-soft)]",
    iconBg: "bg-[var(--portal-navy-muted)]",
    iconText: "text-[var(--portal-navy)]",
    hover: "hover:bg-[var(--portal-navy-soft)]",
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
    bg: "bg-[var(--portal-navy-soft)]",
    iconBg: "bg-[var(--portal-navy-muted)]",
    iconText: "text-[var(--portal-navy)]",
    hover: "hover:bg-[var(--portal-navy-soft)]",
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

export default function PortalAccionesRapidas({
  ocultarPagarHonorarios = false,
  priorizarHonorarios = false,
  montoPendiente,
  flujo,
  sinPagoImpuestos = false,
}: Props) {
  const { contador, cargando } = usePortalContadorAsignado();
  const { cliente } = usePortalAuth();
  const { getEncargosCliente } = useClientes();

  const encargosAbiertos = cliente
    ? getEncargosCliente(cliente.id).filter(encargoAbierto).length
    : 0;

  const esPreliminar = flujo === "preliminar" && !sinPagoImpuestos;
  const esDeclaraciones = flujo === "declaraciones" && !sinPagoImpuestos;
  const muestraContador = !cargando && Boolean(contador);

  const acciones = useMemo(() => {
    const catalogo: Accion[] = [
      {
        id: "cumplimiento",
        titulo: esPreliminar ? "Revisar preliminar" : "Confirmar mi pago",
        descripcion: esPreliminar
          ? "Aprueba impuestos del periodo"
          : esDeclaraciones
            ? "Sube comprobante de impuestos"
            : "Pago de impuestos del periodo",
        href: "/portal/cumplimiento",
        icono: esPreliminar ? <FileTextIcon /> : <UploadIcon />,
        tono: esPreliminar || esDeclaraciones ? "amber" : "indigo",
      },
      {
        id: "solicitudes",
        titulo: "Solicitudes",
        descripcion: "Facturas, documentos y trámites",
        href: "/portal/encargos",
        icono: <ClipboardIcon />,
        tono: "violet",
        badge: encargosAbiertos,
      },
      {
        id: "sat",
        titulo: "Situación SAT",
        descripcion: "Opinión 32-D, CSF y e.firma",
        href: "/portal/sat",
        icono: <FileTextIcon />,
        tono: "blue",
      },
      {
        id: "honorarios",
        titulo: "Pagar honorarios",
        descripcion: "Historial y saldo del despacho",
        href: priorizarHonorarios ? "/portal/honorarios#pago" : "/portal/honorarios",
        icono: <CreditCardIcon />,
        tono: "emerald",
      },
    ];

    const orden = ordenAcciones({
      flujo,
      sinPagoImpuestos,
      encargosAbiertos,
      ocultarPagarHonorarios,
      priorizarHonorarios,
    });

    return orden
      .map((id) => catalogo.find((a) => a.id === id))
      .filter((a): a is Accion => Boolean(a))
      .filter((a) => !(ocultarPagarHonorarios && a.id === "honorarios"));
  }, [
    esPreliminar,
    esDeclaraciones,
    encargosAbiertos,
    flujo,
    sinPagoImpuestos,
    ocultarPagarHonorarios,
    priorizarHonorarios,
  ]);

  return (
    <div
      className={`grid grid-cols-2 gap-3 ${
        ocultarPagarHonorarios
          ? muestraContador
            ? "lg:grid-cols-4"
            : "lg:grid-cols-3"
          : muestraContador
            ? "lg:grid-cols-5"
            : "lg:grid-cols-4"
      }`}
    >
      {acciones.map((a) => {
        const t = TONOS[a.tono];
        return (
          <Link key={a.id} href={a.href!} className="block">
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

      {muestraContador && (
        <PortalContadorAsignadoCard
          variant="grid"
          montoPendiente={montoPendiente}
        />
      )}
    </div>
  );
}
