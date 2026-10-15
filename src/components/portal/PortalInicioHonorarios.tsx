"use client";

import { fmtMxn } from "@/components/portal/portal-ui";
import { GroupedSection } from "@/components/portal/PortalGroupedList";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  mensajeWhatsAppAlContador,
  waLinkPortal,
} from "@/lib/portal/whatsapp";
import Link from "next/link";

type Props = {
  deuda: number;
  pagadoMes: boolean;
};

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2.1-.2-.5-.5-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.7 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function PortalInicioHonorarios({ deuda, pagadoMes }: Props) {
  const { contador, cargando } = usePortalContadorAsignado();
  const { cliente } = usePortalAuth();
  const { perfil } = usePortalPerfil();

  const nombreCliente =
    perfil?.perfil.nombre?.trim() ||
    cliente?.razonSocial?.split(/[ ,]/)[0] ||
    undefined;

  const iniciales =
    contador?.nombre
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "RDC";

  const waUrl = waLinkPortal(
    contador?.telefono,
    mensajeWhatsAppAlContador({
      nombreCliente,
      nombreContador: contador?.nombre,
      montoPendiente: deuda > 0 ? fmtMxn(deuda) : undefined,
    })
  );

  return (
    <GroupedSection label="Honorarios">
      <div className="px-4 py-4 space-y-4">
        <div>
          <p className="text-[13px] text-slate-500">Saldo con el despacho</p>
          <p
            className={`mt-0.5 text-[28px] font-bold tabular-nums leading-none ${
              deuda > 0 ? "text-slate-900" : "text-emerald-600"
            }`}
          >
            {deuda > 0 ? fmtMxn(deuda) : "Al corriente"}
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            {pagadoMes && deuda > 0
              ? "Este mes cubierto · queda trabajo adicional"
              : pagadoMes
                ? "Este mes cubierto"
                : "Incluye el mes en curso"}
          </p>
        </div>

        {deuda > 0 ? (
          <Link
            href="/portal/honorarios#pago"
            className="flex items-center justify-center gap-1 h-11 rounded-xl bg-[var(--portal-navy)] text-white text-[15px] font-semibold"
          >
            Pagar ahora
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        ) : null}

        {cargando || !contador ? null : (
          <div className="flex items-center gap-3 pt-1">
            {contador.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contador.avatarUrl}
                alt={contador.nombre}
                className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[var(--portal-navy)] text-white font-semibold text-sm flex items-center justify-center shrink-0">
                {iniciales}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-slate-900 truncate">
                {contador.nombre}
              </p>
              <p className="text-[13px] text-slate-500 truncate">
                {contador.cargo || "Tu contador"}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-11 rounded-xl bg-emerald-50 text-emerald-700 text-[15px] font-semibold"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
          <a
            href={CONTACTO_PUBLICO.calendly.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-11 rounded-xl bg-[var(--portal-navy-soft)] text-[var(--portal-navy)] text-[15px] font-semibold"
          >
            <CalendarIcon />
            Agendar
          </a>
        </div>
      </div>
    </GroupedSection>
  );
}
