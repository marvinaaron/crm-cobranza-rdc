"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fmtMxn } from "@/components/portal/portal-ui";
import {
  firmaAvisoInicio,
  type AccionPortal,
} from "@/lib/portal/siguiente-paso";
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
  onCerrar: (firma: string) => void;
};

function ChevronDir({ izq }: { izq?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={izq ? "rotate-180" : ""}
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function PortalInicioPendiente({ acciones, onCerrar }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const multiples = acciones.length > 1;

  const sincronizar = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth <= 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndice(Math.min(Math.max(i, 0), Math.max(acciones.length - 1, 0)));
  }, [acciones.length]);

  const irA = (i: number) => {
    const el = trackRef.current;
    const next = Math.min(Math.max(i, 0), acciones.length - 1);
    setIndice(next);
    el?.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    setIndice((i) => Math.min(i, Math.max(acciones.length - 1, 0)));
  }, [acciones.length]);

  if (acciones.length === 0) return null;

  const actual = acciones[Math.min(indice, acciones.length - 1)];

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={sincronizar}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Avisos"
      >
        {acciones.map((accion, i) => (
          <div
            key={firmaAvisoInicio(accion)}
            className="w-full shrink-0 snap-center"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${acciones.length}`}
          >
            <TarjetaAviso
              accion={accion}
              onCerrar={() => onCerrar(firmaAvisoInicio(accion))}
            />
          </div>
        ))}
      </div>

      {multiples ? (
        <div className="mt-2.5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => irA(indice - 1)}
            disabled={indice <= 0}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200 disabled:opacity-30"
            aria-label="Aviso anterior"
          >
            <ChevronDir izq />
          </button>

          <div className="flex items-center gap-1.5">
            {acciones.map((accion, i) => (
              <button
                key={firmaAvisoInicio(accion)}
                type="button"
                onClick={() => irA(i)}
                aria-label={`Aviso ${i + 1}`}
                aria-current={i === indice ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  i === indice
                    ? "w-4 bg-[var(--portal-navy)]"
                    : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => irA(indice + 1)}
            disabled={indice >= acciones.length - 1}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200 disabled:opacity-30"
            aria-label="Aviso siguiente"
          >
            <ChevronDir />
          </button>
        </div>
      ) : null}

      {multiples && actual ? (
        <span className="sr-only">
          {indice + 1} de {acciones.length}: {actual.titulo}
        </span>
      ) : null}
    </div>
  );
}

function TarjetaAviso({
  accion,
  onCerrar,
}: {
  accion: AccionPortal;
  onCerrar: () => void;
}) {
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
    const quien = nombreCliente
      ? `soy ${nombreCliente}`
      : "soy cliente de RDC Contadores";
    const primerContador = contador?.nombre?.trim().split(/\s+/)[0];
    const saludo = primerContador
      ? `Hola ${primerContador}, ${quien}`
      : `Hola, ${quien}`;

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

  const ctaClass = urg
    ? "bg-red-500 hover:bg-red-600"
    : "bg-[var(--portal-navy)] hover:bg-[var(--portal-navy-hover)]";

  const cta =
    accion.contactarContador && urlWhatsApp ? (
      <a
        href={urlWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center h-11 px-5 rounded-full text-sm font-semibold text-white ${ctaClass}`}
      >
        {accion.cta}
      </a>
    ) : (
      <Link
        href={accion.href}
        className={`inline-flex items-center justify-center h-11 px-5 rounded-full text-sm font-semibold text-white ${ctaClass}`}
      >
        {accion.cta}
      </Link>
    );

  const secundarioHref =
    accion.hrefSecundario ??
    (accion.clave === "honorarios" ? "/portal/honorarios#comprobante" : null);
  const secundarioLabel =
    accion.ctaSecundario ??
    (accion.clave === "honorarios" ? "Ya pagué · subir foto" : null);

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl px-5 py-5 pr-12">
      <button
        type="button"
        onClick={onCerrar}
        className="absolute top-3.5 right-3.5 h-7 w-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 flex items-center justify-center"
        aria-label="Cerrar aviso"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      {accion.etiqueta ? (
        <p className="text-[13px] font-medium text-slate-500 mb-1">
          {accion.etiqueta}
        </p>
      ) : null}
      <h2 className="text-[22px] font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
        {accion.titulo}
      </h2>
      {accion.monto != null && accion.monto > 0 ? (
        <p
          className={`text-[28px] font-bold tabular-nums leading-none mt-2 ${
            urg ? "text-red-500" : "text-slate-900 dark:text-white"
          }`}
        >
          {fmtMxn(accion.monto)}
        </p>
      ) : null}
      {accion.desglose ? (
        <p className="text-[13px] text-slate-500 mt-1">{accion.desglose}</p>
      ) : null}
      <p className="text-[15px] text-slate-600 dark:text-slate-400 mt-2 leading-snug">
        {accion.detalle}
      </p>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        {cta}
        {secundarioHref && secundarioLabel ? (
          <Link
            href={secundarioHref}
            className="text-[15px] font-medium text-slate-500 hover:text-slate-800"
          >
            {secundarioLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
