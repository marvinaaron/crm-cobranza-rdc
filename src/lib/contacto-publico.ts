/**
 * Datos de contacto que aparecen en el sitio público (rdcontadores.com).
 *
 * Centralizado aquí para que cambiar un número, una red o el link de
 * Calendly sea editar una sola constante.
 *
 * Nota: el correo personal NO se expone en el sitio público para reducir
 * spam. Los clientes ya autenticados ven el correo del despacho dentro
 * del portal.
 */

const WHATSAPP_NUMERO_E164 = "523322032992";
const WHATSAPP_MENSAJE_PROSPECTO =
  "Hola, vi su sitio rdcontadores.com y me gustaría saber más sobre sus servicios contables.";

export const CONTACTO_PUBLICO = {
  whatsapp: {
    numeroDisplay: "+52 33 2203 2992",
    /** URL lista para usar en `href`; incluye mensaje pre-llenado. */
    url: `https://wa.me/${WHATSAPP_NUMERO_E164}?text=${encodeURIComponent(
      WHATSAPP_MENSAJE_PROSPECTO
    )}`,
  },
  instagram: {
    usuario: "@rdccontadores",
    url: "https://www.instagram.com/rdccontadores/",
  },
  facebook: {
    nombre: "RD Contadores",
    url: "https://www.facebook.com/rd.contadores.mx/",
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
