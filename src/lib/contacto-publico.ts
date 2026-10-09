/**
 * Datos de contacto que aparecen en el sitio público (rdcontadores.com).
 *
 * Centralizado aquí para que cambiar un número, una red, el link de
 * Calendly o los mensajes pre-cargados de WhatsApp sea editar una sola
 * constante.
 *
 * Nota: el correo personal NO se expone en el sitio público para reducir
 * spam. Los clientes ya autenticados ven el correo del despacho dentro
 * del portal.
 */

const WHATSAPP_NUMERO_E164 = "523322032992";
const TELEFONO_TEL = "+523322032992";

const WHATSAPP_MENSAJE_PROSPECTO =
  "Hola, vi su sitio rdcontadores.com y me gustaría saber más sobre sus servicios contables.";

/** Helper: construye un link wa.me con mensaje pre-llenado. */
function waLink(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO_E164}?text=${encodeURIComponent(mensaje)}`;
}

export type IconoRazonContacto =
  | "spark"
  | "swap"
  | "alert"
  | "chat"
  | "users"
  | "calendar"
  | "key"
  | "id"
  | "receipt"
  | "shield"
  | "building"
  | "refund";

/**
 * Atajos: razones típicas por las que un visitante contacta. Cada uno
 * dispara WhatsApp con un mensaje específico para que el contador entre
 * a la conversación con contexto y responda rápido.
 */
export const RAZONES_CONTACTO = [
  {
    id: "cotizacion",
    eyebrow: "Soy nuevo",
    titulo: "Cotización",
    descripcion: "Te respondemos con paquete sugerido en menos de 24 hrs.",
    icono: "spark" as const,
    mensaje:
      "Hola, soy nuevo y quisiera una cotización. Te cuento brevemente: ",
  },
  {
    id: "cambio",
    eyebrow: "Cambio",
    titulo: "Otro contador",
    descripcion: "Nos encargamos del traspaso sin que el SAT se entere mal.",
    icono: "swap" as const,
    mensaje:
      "Hola, actualmente tengo otro contador y quiero cambiarme con ustedes. ¿Cómo es el proceso?",
  },
  {
    id: "multa",
    eyebrow: "SAT",
    titulo: "Multa o requerimiento",
    descripcion: "Revisamos el documento contigo y te decimos cómo proceder.",
    icono: "alert" as const,
    mensaje:
      "Hola, me llegó un requerimiento/multa del SAT y necesito ayuda. ¿Pueden revisarlo conmigo?",
  },
  {
    id: "cliente",
    eyebrow: "Cliente",
    titulo: "Duda rápida",
    descripcion: "Acuses, declaraciones, facturas — lo que necesites.",
    icono: "chat" as const,
    mensaje: "Hola Aaron, soy cliente del despacho y tengo una duda rápida: ",
  },
  {
    id: "nomina",
    eyebrow: "Nómina",
    titulo: "IMSS y sueldos",
    descripcion: "Altas, bajas, SUA y timbrado de nómina sin retrasos.",
    icono: "users" as const,
    mensaje:
      "Hola, necesito apoyo con nómina / IMSS. Te cuento cuántos empleados y qué pasa: ",
  },
  {
    id: "anual",
    eyebrow: "Anual",
    titulo: "Declaración anual",
    descripcion: "PF o PM: armamos la anual y te avisamos si hay saldo a favor.",
    icono: "calendar" as const,
    mensaje:
      "Hola, quiero apoyo con mi declaración anual. Soy PF/PM y el ejercicio es: ",
  },
  {
    id: "efirma",
    eyebrow: "e.firma",
    titulo: "Por vencer o nueva",
    descripcion: "Renovación, cita SAT o revisión de archivos .cer y .key.",
    icono: "key" as const,
    mensaje:
      "Hola, necesito ayuda con mi e.firma (renovar / tramitar / archivos). Vence o venció: ",
  },
  {
    id: "rfc",
    eyebrow: "Alta SAT",
    titulo: "RFC o régimen",
    descripcion: "Alta, cambio de régimen o actualización de obligaciones.",
    icono: "id" as const,
    mensaje:
      "Hola, necesito alta o cambio de régimen ante el SAT. Te cuento mi caso: ",
  },
  {
    id: "cfdi",
    eyebrow: "Facturación",
    titulo: "CFDI y timbrado",
    descripcion: "Errores de factura, cancelaciones o cómo timbrar bien.",
    icono: "receipt" as const,
    mensaje:
      "Hola, tengo una duda de facturación / CFDI. El detalle es: ",
  },
  {
    id: "opinion",
    eyebrow: "32-D",
    titulo: "Opinión de cumplimiento",
    descripcion: "Si te salió negativa, vemos qué obligación está trabando.",
    icono: "shield" as const,
    mensaje:
      "Hola, mi opinión de cumplimiento 32-D no está positiva. ¿Pueden revisarla?",
  },
  {
    id: "empresa",
    eyebrow: "Empresa",
    titulo: "Constituir o PM",
    descripcion: "Sociedad nueva, obligaciones de PM o primer ejercicio.",
    icono: "building" as const,
    mensaje:
      "Hola, quiero constituir / llevar la contabilidad de una persona moral. El giro es: ",
  },
  {
    id: "devolucion",
    eyebrow: "Saldo a favor",
    titulo: "Devolución ISR",
    descripcion: "Revisamos si procede y armamos la solicitud ante el SAT.",
    icono: "refund" as const,
    mensaje:
      "Hola, creo que tengo saldo a favor y quiero ver si procede una devolución. ",
  },
] as const;

export type RazonContacto = (typeof RAZONES_CONTACTO)[number];

/**
 * Horario de atención del despacho. Se usa para calcular si estamos
 * "abriendo ahora" en el indicador en vivo.
 *
 * Días: 0 = domingo, 1 = lunes, ... 6 = sábado.
 * Horas en formato 24h, zona horaria America/Mexico_City.
 */
export const HORARIO_ATENCION = {
  zonaHoraria: "America/Mexico_City",
  dias: [
    { dia: 1, abre: 9, cierra: 17, etiqueta: "Lun" },
    { dia: 2, abre: 9, cierra: 17, etiqueta: "Mar" },
    { dia: 3, abre: 9, cierra: 17, etiqueta: "Mié" },
    { dia: 4, abre: 9, cierra: 17, etiqueta: "Jue" },
    { dia: 5, abre: 9, cierra: 17, etiqueta: "Vie" },
  ],
  resumen: "Lun a Vie · 9:00 – 17:00",
  ciudad: "Guadalajara, Jalisco",
} as const;

export const CONTACTO_PUBLICO = {
  whatsapp: {
    numeroDisplay: "+52 33 2203 2992",
    /** URL lista para usar en `href`; incluye mensaje pre-llenado. */
    url: waLink(WHATSAPP_MENSAJE_PROSPECTO),
    /** Builder por si necesitas un mensaje custom desde un form. */
    buildUrl: waLink,
  },
  telefono: {
    display: "+52 33 2203 2992",
    tel: TELEFONO_TEL,
    hrefTel: `tel:${TELEFONO_TEL}`,
  },
  instagram: {
    usuario: "@rdccontadores",
    url: "https://www.instagram.com/rdccontadores/",
  },
  facebook: {
    nombre: "RDC Contadores",
    url: "https://www.facebook.com/rd.contadores.mx/",
  },
  youtube: {
    usuario: "@rdccontadores",
    url: "https://www.youtube.com/@rdccontadores",
  },
  /**
   * Una sola agenda de Calendly para todos.
   * La primera plática es sin costo.
   */
  calendly: {
    url: "https://calendly.com/rdcontadores/asesoria",
  },
} as const;
