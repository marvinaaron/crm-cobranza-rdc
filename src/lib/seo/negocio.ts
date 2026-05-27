/**
 * Datos del negocio para schemas estructurados de Google (JSON-LD) y para
 * metadatos Open Graph / Twitter Card.
 *
 * Centralizado para que cambiar dirección, horarios o teléfono se haga en
 * un solo lugar y se refleje en todos los schemas del sitio.
 */

import { SITE_URL } from "./site";

export const NEGOCIO = {
  /** Nombre comercial. */
  nombre: "RDC Contadores",
  /** Razón social. */
  razonSocial: "RDC Contadores",
  /** Tipo schema.org más específico para un despacho contable. */
  tipo: "AccountingService" as const,
  /** Slogan/descripción corta (≤160 chars). */
  descripcionCorta:
    "Despacho contable y fiscal en Guadalajara con portal propio. RESICO desde $812/mes. Cero declaraciones brincadas.",
  /** Descripción larga para Organization schema. */
  descripcionLarga:
    "RDC Contadores es un despacho contable y fiscal en Guadalajara, Jalisco, especializado en personas físicas con actividad empresarial, RESICO, personas morales con nómina, transportistas, dentistas, contratistas con ICSOE/SISUB y profesionistas. Operamos con un portal exclusivo para clientes donde ves tu cumplimiento fiscal, acuses del SAT y calendario en tiempo real. Cumplimiento puntual con SAT, IMSS, Infonavit, ISN y REPSE.",
  fundado: "2022",
  url: SITE_URL,
  logoUrl: `${SITE_URL}/logos/rdc-black.png`,
  /** Imagen para Google Knowledge Panel y schemas (1024×1024 o similar). */
  imagenMarcaUrl: `${SITE_URL}/og-default.jpg`,
  telefono: {
    nacional: "+52 33 2203 2992",
    e164: "+523322032992",
  },
  email: "contacto@rdcontadores.com",
  /** Ubicación física para LocalBusiness schema. */
  ubicacion: {
    pais: "MX" as const,
    estado: "Jalisco",
    ciudad: "Guadalajara",
    /** Aproximado de Guadalajara centro — refina con la dirección exacta cuando la tengas. */
    latitud: 20.6597,
    longitud: -103.3496,
  },
  /** Horario en formato schema.org (https://schema.org/openingHours). */
  horario: [
    "Mo-Fr 09:00-17:00",
  ],
  /** Resumen humano de horario. */
  horarioHumano: "Lunes a viernes de 9:00 a 17:00 (CST)",
  /** Áreas geográficas donde aceptamos clientes. */
  areaDeServicio: [
    "Guadalajara, Jalisco",
    "Ciudad de México",
    "Estado de México",
    "Puebla",
    "Querétaro",
    "Chihuahua",
    "Colima",
  ],
  redes: {
    instagram: "https://www.instagram.com/rdccontadores/",
    facebook: "https://www.facebook.com/rd.contadores.mx/",
    whatsapp: "https://wa.me/523322032992",
  },
  /** Persona propietaria/contador titular del despacho. */
  contadorTitular: {
    nombre: "Aaron Rosales",
    titulo: "Contador Público",
    descripcion:
      "Contador público fundador de RDC Contadores. Especialista en personas físicas con actividad empresarial, RESICO y personas morales. Más de 10 años de experiencia en cumplimiento fiscal y contabilidad para PYMES en México.",
    /** Imagen profesional. */
    foto: `${SITE_URL}/equipo/aaron.jpg`,
  },
  /** Catálogo de servicios principales con precios para Service schema. */
  serviciosCatalogo: [
    {
      nombre: "Contabilidad RESICO Persona Física",
      descripcion:
        "Contabilidad mensual completa para personas físicas en régimen RESICO: cálculo, presentación, declaración anual incluida y portal de cliente.",
      precioDesde: 812,
      moneda: "MXN" as const,
      unidad: "mes",
    },
    {
      nombre: "Contabilidad Persona Moral con nómina",
      descripcion:
        "Contabilidad mensual para personas morales: pólizas, balanzas, IMSS, Infonavit, ISN, presentación al SAT y portal de cliente. Cotización personalizada.",
      precioDesde: null,
      moneda: "MXN" as const,
      unidad: "mes",
    },
    {
      nombre: "Cumplimiento REPSE / ICSOE / SISUB para contratistas",
      descripcion:
        "Cumplimiento mensual de obligaciones especiales para contratistas: REPSE, ICSOE y SISUB.",
      precioDesde: null,
      moneda: "MXN" as const,
      unidad: "mes",
    },
  ],
} as const;
