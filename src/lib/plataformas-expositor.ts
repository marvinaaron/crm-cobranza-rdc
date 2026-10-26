/**
 * Contenido de la guía 625 (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 */

export const PLATAFORMAS_FAQ = [
  {
    pregunta: "¿Qué es el régimen 625?",
    respuesta:
      "Es el régimen de actividades empresariales con ingresos a través de plataformas tecnológicas (clave SAT 625). Aplica a quien cobra vía apps como Uber, DiDi, Rappi, Mercado Libre o similares. La plataforma retiene ISR e IVA en cada pago y emite CFDI de retenciones; tú concilias esas constancias y presentas tus declaraciones.",
  },
  {
    pregunta: "Si la app ya me retuvo, ¿ya no declaro?",
    respuesta:
      "Depende. Si calificas a pagos definitivos (el año anterior no rebasaste $300,000 y solo cobras por apps), la retención de la plataforma cierra el ISR de esos ingresos: no presentas declaración mensual por ellos. Si vas por pagos provisionales, la retención es un anticipo: concilias CFDI, acreditas y declaras a más tardar el día 17.",
  },
  {
    pregunta: "¿Cuánto me retiene la plataforma?",
    respuesta:
      "En 2026 la retención de ISR con RFC se unificó en 2.50% para Uber, DiDi, Rappi, Mercado Libre y similares. Si no diste RFC, la plataforma retiene 20%. El IVA va aparte: normalmente retiene el 50% del IVA trasladado (8% cuando la tasa es 16%).",
  },
  {
    pregunta:
      "¿Qué es la constancia de retenciones y qué función tiene?",
    respuesta:
      "Es el CFDI de retenciones que emite cada app (Uber, DiDi, Rappi, YouTube, Mercado Libre, etc.) por los pagos del periodo. Trae el ingreso bruto, el ISR retenido y el IVA retenido. En pagos provisionales se acredita contra lo que declares el día 17; en pagos definitivos se resguarda como prueba de que el impuesto ya se enteró. El SAT cruza ese timbrado con tu declaración: si no cuadra, llega el requerimiento.",
  },
  {
    pregunta: "¿Qué son los pagos definitivos en plataformas?",
    respuesta:
      "Es la opción del artículo 113-A: si el año anterior tus ingresos por apps no rebasaron $300,000 y no tienes otra actividad que te obligue a provisionales, las retenciones de ISR (y, por regla, el IVA que ya enteró la app) se consideran pago definitivo. No presentas declaración mensual por esos ingresos; resguardas las constancias. Si rebasas el tope o facturas fuera de la app, pasas a pagos provisionales.",
  },
  {
    pregunta: "¿El IVA de las comisiones de la app se puede acreditar?",
    respuesta:
      "Sí, cuando la comisión trae CFDI vigente y es un gasto estrictamente indispensable de tu actividad. Ese IVA se acredita contra el IVA a cargo, no contra el ISR. Sin factura de la plataforma, no hay acreditamiento aunque te hayan descontado la comisión del depósito.",
  },
  {
    pregunta: "¿Cuándo se presenta la declaración mensual?",
    respuesta:
      "A más tardar el día 17 del mes siguiente. ISR e IVA viajan en la misma fecha, pero no se mezclan: el ISR acredita la retención de la app; el IVA, el 50% que ya enteró la plataforma más el acreditable de tus gastos.",
  },
] as const;

export const PLATAFORMAS_PASOS_ISR = [
  {
    name: "Reúne las constancias de cada app",
    text: "Descarga el CFDI de retenciones de Uber, DiDi, Rappi, YouTube, Mercado Libre o la plataforma que uses. Ahí viene el ingreso bruto y lo que ya te retuvieron de ISR e IVA.",
  },
  {
    name: "Cruza con lo que te depositaron",
    text: "El SAT compara lo timbrado con lo declarado. Si el depósito no cuadra con la constancia, corrige antes de presentar: comisiones, cancelaciones y propinas suelen ser el descuadre.",
  },
  {
    name: "Acredita las retenciones del mes",
    text: "El ISR retenido se resta de tu ISR a cargo. El IVA retenido se resta del IVA a cargo. No son un gasto deducible: son anticipos que la app ya enteró por ti.",
  },
  {
    name: "Cierra el mes según tu vía",
    text: "En provisionales, declara ISR e IVA a más tardar el día 17 y acredita lo de la constancia. En definitivos, resguarda la constancia: esa retención ya enteró el impuesto.",
  },
] as const;

export const PLATAFORMAS_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cuánto se paga" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "Definitivo vs prov." },
  { value: "simulador", label: "Calculadora" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const PLATAFORMAS_VS_PAGOS = {
  titulo: "Pagos definitivos vs pagos provisionales",
  columnas: ["Pagos definitivos", "Pagos provisionales"] as const,
  filas: [
    {
      aspecto: "Tope",
      valores: [
        "Hasta $300,000 en el ejercicio anterior, solo ingresos por apps",
        "Rebasaste $300,000 o tienes otros ingresos de negocio",
      ],
    },
    {
      aspecto: "Qué es la retención",
      valores: [
        "Cierra el impuesto: la app ya pagó por ti",
        "Es un anticipo: se acredita en tu declaración",
      ],
    },
    {
      aspecto: "Declaración mensual de ISR",
      valores: [
        "No presentas por esos ingresos",
        "Sí, a más tardar el día 17",
      ],
    },
    {
      aspecto: "IVA",
      valores: [
        "El 50% que retuvo la app suele quedar como definitivo",
        "Traslado − acreditable − retenido; tú enteras la diferencia",
      ],
    },
    {
      aspecto: "IVA de comisiones de la app",
      valores: [
        "No se acredita: el mes ya quedó cerrado",
        "Sí, con CFDI vigente de la plataforma",
      ],
    },
    {
      aspecto: "Lo que tú haces",
      valores: [
        "Resguardar constancias de retenciones",
        "Cruzar CFDI vs depósitos y declarar la diferencia",
      ],
    },
    {
      aspecto: "Conviene si…",
      valores: [
        "Solo cobras por apps y no rebasas el tope",
        "Varias fuentes de ingreso o ya superaste $300 K",
      ],
    },
  ],
} as const;

export const PLATAFORMAS_CRITERIOS = [
  {
    n: "01",
    titulo: "Cobras a través de una app",
    kicker: "El ingreso entra por la plataforma",
    texto:
      "Conductores, repartidores, vendedores en marketplaces, anfitriones y creadores. Si el pago te lo hace la app —no tu factura propia— este es el régimen de partida.",
  },
  {
    n: "02",
    titulo: "La plataforma retiene",
    kicker: "ISR e IVA en cada depósito",
    texto:
      "ISR retenido = ingreso × 2.50% (con RFC) o × 20% (sin RFC). El IVA va aparte: la app retiene el 50% del trasladado. Tú recibes el neto.",
  },
  {
    n: "03",
    titulo: "La constancia de retenciones",
    kicker: "Es tu comprobante ante el SAT",
    texto:
      "Cada app emite un CFDI de retenciones. Trae el ingreso bruto, el ISR y el IVA ya enterados. En provisionales se acredita el día 17; en definitivos se resguarda como prueba de que el impuesto ya se pagó.",
  },
  {
    n: "04",
    titulo: "Tope de $300 K",
    kicker: "Pagos definitivos",
    texto:
      "Si el año anterior no rebasaste $300,000 y solo cobras por apps, las retenciones pueden ser pago definitivo: no presentas ISR mensual por esos ingresos. Si rebasas, pasas a provisionales.",
  },
] as const;

export const PLATAFORMAS_GRUPOS = [
  {
    label: "Movilidad",
    apps: [
      {
        nombre: "Uber",
        src: "/plataformas/uber.png",
        hover:
          "Conductores. ISR 2.50% con RFC (20% sin RFC) e IVA al 50%. La constancia de retenciones llega con cada periodo de pagos.",
      },
      {
        nombre: "DiDi",
        src: "/plataformas/didi.png",
        hover:
          "Conductores. Misma mecánica 625: la app retiene y timbra; tú concilias la constancia con lo depositado.",
      },
      {
        nombre: "inDrive",
        src: "/plataformas/indrive.png",
        hover:
          "Viajes. Si el pago te lo hace la plataforma, aplica retención de ISR e IVA y debes resguardar el CFDI de retenciones.",
      },
    ],
  },
  {
    label: "Entrega",
    apps: [
      {
        nombre: "Rappi",
        src: "/plataformas/rappi.png",
        hover:
          "Repartidores. El depósito ya viene neto. El ingreso fiscal y lo retenido se leen en la constancia, no en el banco.",
      },
      {
        nombre: "Uber Eats",
        src: "/plataformas/ubereats.png",
        hover:
          "Reparto a domicilio. ISR 2.50% con RFC e IVA 50%. Comisiones con CFDI sí se acreditan en IVA, no en ISR.",
      },
    ],
  },
  {
    label: "Marketplaces",
    apps: [
      {
        nombre: "Mercado Libre",
        src: "/plataformas/mercadolibre.png",
        hover:
          "Vendedores. Cada liquidación trae retención. Cruza la constancia con las ventas del mes antes de declarar.",
      },
      {
        nombre: "Amazon",
        src: "/plataformas/amazon.png",
        hover:
          "Marketplace. Si Amazon te paga a ti, es régimen 625. ISR e IVA retenidos se acreditan o se resguardan según tu vía.",
      },
    ],
  },
  {
    label: "Contenido y hospedaje",
    apps: [
      {
        nombre: "YouTube",
        src: "/plataformas/youtube.png",
        hover:
          "Creadores. Los pagos de la plataforma traen retención. La constancia documenta ingreso, ISR e IVA ante el SAT.",
      },
      {
        nombre: "Airbnb",
        src: "/plataformas/airbnb.png",
        hover:
          "Anfitriones. Hospedaje vía app entra a 625. La plataforma retiene; tú concilias o resguardas según definitivos o provisionales.",
      },
    ],
  },
] as const;

export const RETENCIONES_PLATAFORMAS = [
  {
    supuesto: "Con RFC · tasa 2026",
    tasa: "2.50%",
    detalle: "Uber, DiDi, Rappi, Mercado Libre y similares",
    destacado: true,
  },
  {
    supuesto: "Sin RFC",
    tasa: "20%",
    detalle: "La plataforma aplica la tasa máxima",
    destacado: false,
  },
] as const;
