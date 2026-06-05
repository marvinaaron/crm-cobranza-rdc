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

/**
 * Atajos: 4 razones típicas por las que un visitante contacta. Cada uno
 * dispara WhatsApp con un mensaje específico para que el contador entre
 * a la conversación con contexto y responda rápido.
 */
export const RAZONES_CONTACTO = [
  {
    id: "cotizacion",
    titulo: "Soy nuevo — necesito cotización",
    descripcion: "Te respondemos con paquete sugerido en menos de 24 hrs.",
    icono: "spark" as const,
    mensaje:
      "Hola, soy nuevo y quisiera una cotización. Te cuento brevemente: ",
  },
  {
    id: "cambio",
    titulo: "Quiero cambiar de contador",
    descripcion: "Nos encargamos del traspaso sin que el SAT se entere mal.",
    icono: "swap" as const,
    mensaje:
      "Hola, actualmente tengo otro contador y quiero cambiarme con ustedes. ¿Cómo es el proceso?",
  },
  {
    id: "multa",
    titulo: "Tengo una multa o requerimiento del SAT",
    descripcion: "Revisamos el documento contigo y te decimos cómo proceder.",
    icono: "alert" as const,
    mensaje:
      "Hola, me llegó un requerimiento/multa del SAT y necesito ayuda. ¿Pueden revisarlo conmigo?",
  },
  {
    id: "cliente",
    titulo: "Ya soy cliente — duda rápida",
    descripcion: "Acuses, declaraciones, facturas — lo que necesites.",
    icono: "chat" as const,
    mensaje: "Hola Aaron, soy cliente del despacho y tengo una duda rápida: ",
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
    nombre: "RD Contadores",
    url: "https://www.facebook.com/rd.contadores.mx/",
  },
  youtube: {
    usuario: "@rdccontadores",
    url: "https://www.youtube.com/@rdccontadores",
  },
  /**
   * Una sola agenda de Calendly para todos. Las asesorías a prospectos
   * tienen costo; para clientes activos están incluidas en su servicio.
   * Esto se aclara en la UI con texto discreto.
   */
  calendly: {
    url: "https://calendly.com/rdcontadores/asesoria",
  },
} as const;
