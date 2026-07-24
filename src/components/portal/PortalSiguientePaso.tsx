"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import Fiscalino from "@/components/Fiscalino";
import { fmtMxn } from "@/components/portal/portal-ui";
import type { AccionPortal } from "@/lib/portal/siguiente-paso";
import type { FiscalinoMood } from "@/components/Fiscalino";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";
import {
  mensajeWhatsAppAlContador,
  mensajeWhatsAppPortal,
  waLinkPortal,
} from "@/lib/portal/whatsapp";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

type Props = {
  acciones: AccionPortal[];
};

function moodFiscalino(accion: AccionPortal): FiscalinoMood {
  if (accion.urgente) return "worried";
  if (
    accion.clave === "impuestos_pendientes" ||
    accion.clave === "meses_anteriores" ||
    accion.clave === "preliminar" ||
    accion.clave === "declaraciones"
  ) {
    return "worried";
  }
  return "happy";
}

function PasoBanner({ accion, indice, total }: { accion: AccionPortal; indice: number; total: number }) {
  const urg = accion.urgente;
  const { cliente } = usePortalAuth();
  const { perfil } = usePortalPerfil();
  const { contador } = usePortalContadorAsignado();

  const nombreCliente =
    perfil?.perfil.nombre?.trim() ||
    cliente?.razonSocial?.split(/[ ,]/)[0] ||
    undefined;

  const urlWhatsApp = useMemo(() => {
    if (!accion.contactarContador) return null;

    const quien = nombreCliente ? `soy ${nombreCliente}` : "soy cliente de RDC Contadores";
    const primerContador = contador?.nombre?.trim().split(/\s+/)[0];
    const saludo = primerContador ? `Hola ${primerContador}, ${quien}` : `Hola, ${quien}`;

    let msg: string;
    if (accion.clave === "impuestos_pendientes") {
      msg = `${saludo}. Revisé mi portal: mis impuestos siguen pendientes${
        accion.desglose ? ` (${accion.desglose})` : ""
      }. ¿Me orientas?`;
    } else if (accion.clave === "meses_anteriores") {
      msg = `${saludo}. Revisé mi portal: tengo un mes anterior pendiente${
        accion.titulo ? ` (${accion.titulo})` : ""
      }. ¿Me orientas para regularizarlo?`;
    } else if (contador?.telefono) {
      msg = mensajeWhatsAppAlContador({
        nombreCliente,
        nombreContador: contador.nombre,
        montoPendiente:
          accion.monto != null && accion.monto > 0
            ? fmtMxn(accion.monto)
            : undefined,
      });
    } else {
      const motivo =
        accion.clave === "honorarios"
          ? "honorarios"
          : accion.clave === "declaraciones"
            ? "pago_impuestos"
            : "cumplimiento";
      msg = mensajeWhatsAppPortal(motivo, {
        nombre: nombreCliente,
        montoPendiente:
          accion.monto != null && accion.monto > 0
            ? fmtMxn(accion.monto)
            : undefined,
      });
    }

    const tel = contador?.telefono;
    if (tel) return waLinkPortal(tel, msg);
    return CONTACTO_PUBLICO.whatsapp.buildUrl(msg);
  }, [accion, contador, nombreCliente]);

  const eyebrow =
    total > 1
      ? `Pendiente ${indice + 1} de ${total}${accion.etiqueta ? ` · ${accion.etiqueta}` : ""}`
      : accion.etiqueta ?? "Tu siguiente paso";

  return (
    <div
      className={`rounded-[1.5rem] border px-4 py-3.5 sm:px-5 sm:py-4 ${
        urg
          ? "rdc-glass-alert-red border-red-100 bg-red-50/80"
          : "rdc-glass-alert-orange border-amber-100 bg-amber-50/80"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] font-black uppercase tracking-widest ${
              urg ? "text-red-600" : "text-amber-700"
            }`}
          >
            {eyebrow}
          </p>
          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug mt-0.5">
            {accion.titulo}
          </h2>
          {accion.monto != null && accion.monto > 0 && (
            <p
              className={`text-2xl sm:text-3xl font-black tabular-nums leading-none mt-1.5 ${
                urg ? "text-red-600" : "text-slate-900"
              }`}
            >
              {fmtMxn(accion.monto)}
            </p>
          )}
          {accion.desglose && (
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
              {accion.desglose}
            </p>
          )}
          <p
            className={`text-xs font-bold leading-snug mt-1.5 ${
              urg ? "text-red-700" : "text-slate-600"
            }`}
          >
            {accion.detalle}
          </p>
        </div>
        <div
          className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 pointer-events-none"
          aria-hidden
        >
          <Fiscalino mood={moodFiscalino(accion)} size={48} />
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center justify-center gap-2 w-full">
        {accion.contactarContador && urlWhatsApp ? (
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 w-full max-w-[280px] px-5 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-colors ${
              urg
                ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                : "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20"
            }`}
          >
            {accion.cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2.1-.2-.5-.5-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.7 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
            </svg>
          </a>
        ) : (
          <Link
            href={accion.href}
            className={`inline-flex items-center justify-center gap-2 w-full max-w-[280px] px-5 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-colors ${
              urg
                ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                : "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20"
            }`}
          >
            {accion.cta}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        )}
        {accion.hrefSecundario && accion.ctaSecundario && (
          <Link
            href={accion.hrefSecundario}
            className={`text-center text-[10px] font-bold underline-offset-2 hover:underline ${
              urg ? "text-red-700" : "text-amber-800"
            }`}
          >
            {accion.ctaSecundario}
          </Link>
        )}
        {accion.clave === "honorarios" && !accion.ctaSecundario && (
          <Link
            href="/portal/honorarios#pago"
            className={`text-center text-[10px] font-bold underline-offset-2 hover:underline ${
              urg ? "text-red-700" : "text-amber-800"
            }`}
          >
            Ya pagué · subir comprobante
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PortalSiguientePaso({ acciones }: Props) {
  const carruselRef = useRef<HTMLDivElement>(null);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const multiples = acciones.length > 1;

  const sincronizarIndice = useCallback(() => {
    const el = carruselRef.current;
    if (!el || el.clientWidth <= 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndiceActivo(Math.min(Math.max(i, 0), acciones.length - 1));
  }, [acciones.length]);

  const irASlide = (i: number) => {
    const el = carruselRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndiceActivo(i);
  };

  if (!acciones.length) return null;

  if (!multiples) {
    return (
      <div className="space-y-2">
        <PasoBanner accion={acciones[0]} indice={0} total={1} />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3 px-0.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Tus pendientes
        </p>
        <p className="text-[10px] font-bold text-slate-400">
          Desliza →
        </p>
      </div>

      <div
        ref={carruselRef}
        onScroll={sincronizarIndice}
        className="flex items-start overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Pendientes del portal"
      >
        {acciones.map((accion, i) => (
          <div
            key={accion.clave}
            className="w-full shrink-0 snap-center self-start"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${acciones.length}`}
          >
            <PasoBanner accion={accion} indice={i} total={acciones.length} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pt-0.5">
        {acciones.map((accion, i) => (
          <button
            key={accion.clave}
            type="button"
            onClick={() => irASlide(i)}
            aria-label={`Ver pendiente: ${accion.etiqueta ?? accion.titulo}`}
            aria-current={i === indiceActivo ? "true" : undefined}
            className={`h-2 rounded-full transition-all ${
              i === indiceActivo
                ? `w-6 ${accion.urgente ? "bg-red-500" : "bg-amber-500"}`
                : "w-2 bg-slate-200 hover:bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
