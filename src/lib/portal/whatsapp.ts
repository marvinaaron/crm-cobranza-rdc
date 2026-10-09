import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

export type MotivoWhatsAppPortal =
  | "general"
  | "honorarios"
  | "cumplimiento"
  | "pago_impuestos"
  | "duda_impuestos"
  | "solicitudes";

/** Mensaje amigable al contador asignado (desde la tarjeta Tu contador). */
export function mensajeWhatsAppAlContador(opts?: {
  nombreCliente?: string;
  nombreContador?: string;
  montoPendiente?: string;
}): string {
  const primerNombreContador = opts?.nombreContador?.trim().split(/\s+/)[0];
  const saludo = primerNombreContador ? `Qué tal ${primerNombreContador}` : "Hola";
  const quien = opts?.nombreCliente?.trim()
    ? `soy ${opts.nombreCliente.trim()}`
    : "soy cliente de RDC Contadores";

  if (opts?.montoPendiente) {
    return `${saludo}, ${quien}. Te escribo desde mi portal — vi un saldo de ${opts.montoPendiente} y me gustaría revisarlo contigo: `;
  }

  return `${saludo}, ${quien}. Te escribo desde mi portal. Tengo una duda y me gustaría platicarla contigo: `;
}

/** Mensaje pre-llenado según el contexto del cliente en el portal. */
export function mensajeWhatsAppPortal(
  motivo: MotivoWhatsAppPortal,
  opts?: {
    nombre?: string;
    montoPendiente?: string;
    periodo?: string;
  }
): string {
  const quien = opts?.nombre?.trim()
    ? `Hola, soy ${opts.nombre.trim()}`
    : "Hola, soy cliente del portal de RDC Contadores";

  switch (motivo) {
    case "honorarios":
      return opts?.montoPendiente
        ? `${quien}. Vi un saldo pendiente de ${opts.montoPendiente} en mi portal. Quisiera pagarlo o aclararlo.`
        : `${quien}. Tengo una duda sobre mis honorarios en el portal.`;
    case "cumplimiento":
      return opts?.periodo
        ? `${quien}. Tengo una duda sobre el cierre de ${opts.periodo} en mi portal.`
        : `${quien}. Tengo una duda sobre mi cumplimiento fiscal en el portal.`;
    case "pago_impuestos":
      return `${quien}. Necesito ayuda para subir o confirmar el pago de impuestos de este periodo.`;
    case "duda_impuestos": {
      const yo = opts?.nombre?.trim()
        ? `soy ${opts.nombre.trim()}`
        : "soy cliente de RDC";
      const delPeriodo = opts?.periodo ? ` de ${opts.periodo}` : "";
      return `Contador 👋 ${yo} y tengo dudas con mis impuestos${delPeriodo} 🤔 ¿podemos revisarlos juntos?`;
    }
    case "solicitudes":
      return `${quien}. Tengo una solicitud o trámite pendiente en el portal.`;
    default:
      return `${quien} y tengo una duda: `;
  }
}

/** Link wa.me al contador asignado, o al WhatsApp general del despacho. */
export function waLinkPortal(
  telefonoContador: string | undefined,
  mensaje: string
): string {
  if (telefonoContador) {
    const digits = telefonoContador.replace(/\D/g, "");
    if (digits.length >= 10) {
      const conLada = digits.length === 10 ? `52${digits}` : digits;
      return `https://wa.me/${conLada}?text=${encodeURIComponent(mensaje)}`;
    }
  }
  return CONTACTO_PUBLICO.whatsapp.buildUrl(mensaje);
}
