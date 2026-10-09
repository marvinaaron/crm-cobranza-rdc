"use client";

import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  mensajeWhatsAppAlContador,
  waLinkPortal,
} from "@/lib/portal/whatsapp";

type Props = {
  montoPendiente?: string;
  /** `grid`: celda del inicio · `full`: tarjeta ancha (legacy). */
  variant?: "grid" | "full";
};

const MailIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2.1-.2-.5-.5-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.7 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/**
 * Tarjeta "Tu contador" con foto, nombre y contacto directo.
 * En inicio usa `variant="grid"` dentro del hub de acciones rápidas.
 */
export default function PortalContadorAsignadoCard({
  montoPendiente,
  variant = "full",
}: Props = {}) {
  const { contador, cargando } = usePortalContadorAsignado();
  const { cliente } = usePortalAuth();
  const { perfil } = usePortalPerfil();

  if (cargando || !contador) return null;

  const nombreCliente =
    perfil?.perfil.nombre?.trim() ||
    cliente?.razonSocial?.split(/[ ,]/)[0] ||
    undefined;

  const iniciales =
    contador.nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "RDC";

  const numeroWhatsapp = contador.telefono
    ? contador.telefono.replace(/[^\d]/g, "")
    : "";
  const numeroWhats =
    numeroWhatsapp.length === 10 ? `52${numeroWhatsapp}` : numeroWhatsapp;
  const tieneWhatsapp = numeroWhats.length >= 10;
  const waUrl = tieneWhatsapp
    ? waLinkPortal(
        contador.telefono,
        mensajeWhatsAppAlContador({
          nombreCliente,
          nombreContador: contador.nombre,
          montoPendiente,
        })
      )
    : "";
  const telefonoLegible = contador.telefono
    ? contador.telefono
        .replace(/\D/g, "")
        .replace(/(\d{2,3})(\d{4})(\d{4})/, "$1 $2 $3")
    : "";

  const avatarGrid = contador.avatarUrl ? (
    <img
      src={contador.avatarUrl}
      alt={contador.nombre}
      className="w-11 h-11 rounded-full object-cover ring-2 ring-[var(--portal-navy-border)] shrink-0"
    />
  ) : (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--portal-navy)] to-[var(--portal-purple)] text-white font-black text-sm flex items-center justify-center shrink-0 ring-2 ring-[var(--portal-navy-border)]">
      {iniciales}
    </div>
  );

  const avatarLg = contador.avatarUrl ? (
    <img
      src={contador.avatarUrl}
      alt={contador.nombre}
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-[var(--portal-navy-border)] shrink-0"
    />
  ) : (
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[var(--portal-navy)] to-[var(--portal-purple)] text-white font-black text-xl flex items-center justify-center shrink-0 ring-2 ring-[var(--portal-navy-border)]">
      {iniciales}
    </div>
  );

  const botonesContacto = (compacto: boolean) => (
    <div className={`flex items-center gap-1.5 ${compacto ? "" : "flex-wrap gap-2 mt-3"}`}>
      {contador.email && (
        <a
          href={`mailto:${contador.email}`}
          className={
            compacto
              ? "flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-[var(--portal-navy-soft)] hover:bg-[var(--portal-navy-muted)] text-[var(--portal-navy)] text-[8px] font-black uppercase tracking-wide transition-colors"
              : "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--portal-navy-soft)] hover:bg-[var(--portal-navy-muted)] text-[var(--portal-navy)] text-[11px] font-black uppercase tracking-widest transition-colors"
          }
        >
          <MailIcon />
          <span className="truncate">Correo</span>
        </a>
      )}
      {tieneWhatsapp && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            compacto
              ? "flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-wide transition-colors"
              : "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-widest transition-colors"
          }
        >
          <WhatsAppIcon />
          <span className="truncate">WhatsApp</span>
        </a>
      )}
      <a
        href={CONTACTO_PUBLICO.calendly.url}
        target="_blank"
        rel="noopener noreferrer"
        className={
          compacto
            ? "flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-[8px] font-black uppercase tracking-wide transition-colors"
            : "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-[11px] font-black uppercase tracking-widest transition-colors"
        }
      >
        <CalendarIcon />
        <span className="truncate">Agendar</span>
      </a>
      {contador.telefono && !tieneWhatsapp && (
        <a
          href={`tel:${contador.telefono.replace(/\D/g, "")}`}
          className={
            compacto
              ? "flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[8px] font-black uppercase tracking-wide transition-colors"
              : "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-widest transition-colors"
          }
        >
          <span className="truncate">{telefonoLegible || "Llamar"}</span>
        </a>
      )}
    </div>
  );

  if (variant === "grid") {
    return (
      <div className="rdc-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-1.5 h-full">
        <div className="flex items-center gap-2.5 min-w-0">
          {avatarGrid}
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Tu contador
            </p>
            <p className="text-sm font-black text-slate-800 dark:text-white leading-tight truncate">
              {contador.nombre}
            </p>
            {contador.cargo && (
              <p className="text-[10px] font-bold text-slate-500 mt-0.5 truncate">
                {contador.cargo}
              </p>
            )}
          </div>
        </div>
        {botonesContacto(true)}
        <p className="text-[8px] font-bold text-slate-400 leading-snug">
          Asesoría incluida en tu servicio.
        </p>
      </div>
    );
  }

  return (
    <div className="rdc-card bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-sm p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
      {avatarLg}
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Tu contador
        </p>
        <p className="text-base sm:text-lg font-black text-slate-800 leading-tight mt-0.5 truncate">
          {contador.nombre}
        </p>
        {contador.cargo && (
          <p className="text-[12px] font-bold text-slate-500 mt-0.5 truncate">
            {contador.cargo}
          </p>
        )}
        {contador.cedulaProfesional && (
          <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">
            Cédula prof. {contador.cedulaProfesional}
          </p>
        )}
        {botonesContacto(false)}
        <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">
          La asesoría por Calendly está incluida en tu servicio de contabilidad.
        </p>
      </div>
    </div>
  );
}
