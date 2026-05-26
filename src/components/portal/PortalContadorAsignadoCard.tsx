"use client";

import { useEffect, useState } from "react";
import type { ContadorAsignadoPortal } from "@/app/api/portal/contador-asignado/route";

/**
 * Tarjeta "Tu contador" para el inicio del portal del cliente.
 *
 * Muestra al contador principal del despacho (propietario admin) con sus
 * datos públicos de contacto: foto, nombre, cargo, correo y WhatsApp.
 *
 * Es un punto de calidez/humano dentro del portal: el cliente sabe a quién
 * acudir y puede contactar con un solo tap.
 */
export default function PortalContadorAsignadoCard() {
  const [contador, setContador] = useState<ContadorAsignadoPortal | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    void fetch("/api/portal/contador-asignado", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { contador: null }))
      .then((d) => setContador(d.contador ?? null))
      .catch(() => setContador(null))
      .finally(() => setCargado(true));
  }, []);

  if (!cargado || !contador) return null;

  const iniciales = contador.nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "RDC";

  const numeroWhatsapp = contador.telefono
    ? contador.telefono.replace(/[^\d]/g, "")
    : "";
  // Para WhatsApp internacional necesitamos lada. Si el número son 10 dígitos
  // (formato mexicano local) le anteponemos 52.
  const numeroWhats =
    numeroWhatsapp.length === 10 ? `52${numeroWhatsapp}` : numeroWhatsapp;
  const tieneWhatsapp = numeroWhats.length >= 10;
  const telefonoLegible = contador.telefono
    ? contador.telefono.replace(/\D/g, "").replace(/(\d{2,3})(\d{4})(\d{4})/, "$1 $2 $3")
    : "";

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
      {contador.avatarUrl ? (
        <img
          src={contador.avatarUrl}
          alt={contador.nombre}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
        />
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-600 to-violet-700 text-white font-black text-xl flex items-center justify-center shrink-0 ring-2 ring-blue-100">
          {iniciales}
        </div>
      )}
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

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {contador.email && (
            <a
              href={`mailto:${contador.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              Correo
            </a>
          )}
          {tieneWhatsapp && (
            <a
              href={`https://wa.me/${numeroWhats}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2.1-.2-.5-.5-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.7 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
              </svg>
              WhatsApp
            </a>
          )}
          {contador.telefono && !tieneWhatsapp && (
            <a
              href={`tel:${contador.telefono.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {telefonoLegible || "Llamar"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
