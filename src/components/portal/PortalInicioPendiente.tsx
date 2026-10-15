"use client";

import Link from "next/link";
import { useMemo } from "react";
import { fmtMxn } from "@/components/portal/portal-ui";
import type { AccionPortal } from "@/lib/portal/siguiente-paso";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";
import {
  mensajeWhatsAppAlContador,
  mensajeWhatsAppPortal,
  waLinkPortal,
} from "@/lib/portal/whatsapp";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

/** Un solo pendiente, bloque blanco. Sin mascota ni carrusel. */
export default function PortalInicioPendiente({ accion }: { accion: AccionPortal }) {
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

  const cta = accion.contactarContador && urlWhatsApp ? (
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-5">
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
