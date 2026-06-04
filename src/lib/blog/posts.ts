/**
 * Capa de datos del BLOG de RDC Contadores.
 *
 * Filosofía del esqueleto: el blog está pensado para CRECER. Agregar un
 * artículo nuevo = agregar un objeto al array `POSTS` (abajo). No hace
 * falta tocar componentes, rutas ni SEO: todo se deriva de aquí.
 *
 *   - Las páginas (`/blog` y `/blog/[slug]`) leen de este array.
 *   - El sitemap, los breadcrumbs y el JSON-LD se generan solos.
 *   - El filtro por categoría aparece automáticamente cuando hay posts
 *     de esa categoría.
 *
 * El contenido se modela como BLOQUES tipados (parrafo, subtítulo, lista,
 * cita, callout, cta…) en lugar de MDX, para mantener todo en TypeScript
 * puro, type-safe y sin tooling extra. Si algún día quieres MDX, este
 * array es fácil de migrar.
 */

/* ────────────────────────────────────────────────────────────────────
 * CATEGORÍAS
 * Cada categoría trae su propio "tema" de color (mismo lenguaje visual
 * que las tarjetas de /herramientas) para que el blog se vea vivo y
 * escaneable conforme se llena.
 * ──────────────────────────────────────────────────────────────────── */

export type CategoriaId =
  | "guias"
  | "sat"
  | "impuestos"
  | "nomina"
  | "pymes";

export type TemaColor = {
  /** Texto del eyebrow / etiqueta de categoría. */
  texto: string;
  /** Fondo suave del pill/chip. */
  pill: string;
  /** Ring del pill/chip. */
  pillRing: string;
  /** Fondo del icono. */
  iconoFondo: string;
  /** Color del icono. */
  icono: string;
  /** Ring de la tarjeta en hover. */
  hoverRing: string;
  /** Punto de color (listas, badges). */
  punto: string;
  /** Gradiente claro del bloque de color superior de la card. */
  bloque: string;
};

export type CategoriaBlog = {
  id: CategoriaId;
  /** Nombre corto para pills y filtros. */
  label: string;
  /** Descripción para la cabecera de la categoría / SEO. */
  descripcion: string;
  color: TemaColor;
};

export const CATEGORIAS: CategoriaBlog[] = [
  {
    id: "guias",
    label: "Guías prácticas",
    descripcion:
      "Paso a paso para resolver trámites y dudas fiscales sin enredos.",
    color: {
      texto: "text-indigo-600",
      pill: "bg-indigo-50",
      pillRing: "ring-indigo-200",
      iconoFondo: "bg-indigo-100",
      icono: "text-indigo-700",
      hoverRing: "hover:ring-indigo-400",
      punto: "bg-indigo-500",
      bloque: "from-indigo-50 to-indigo-100",
    },
  },
  {
    id: "sat",
    label: "Trámites SAT",
    descripcion:
      "RFC, e.firma, constancias, opiniones de cumplimiento y todo lo del SAT.",
    color: {
      texto: "text-emerald-600",
      pill: "bg-emerald-50",
      pillRing: "ring-emerald-200",
      iconoFondo: "bg-emerald-100",
      icono: "text-emerald-700",
      hoverRing: "hover:ring-emerald-400",
      punto: "bg-emerald-500",
      bloque: "from-emerald-50 to-emerald-100",
    },
  },
  {
    id: "impuestos",
    label: "Impuestos",
    descripcion:
      "ISR, IVA, RESICO, declaraciones y cómo pagar lo justo a tiempo.",
    color: {
      texto: "text-amber-600",
      pill: "bg-amber-50",
      pillRing: "ring-amber-200",
      iconoFondo: "bg-amber-100",
      icono: "text-amber-700",
      hoverRing: "hover:ring-amber-400",
      punto: "bg-amber-500",
      bloque: "from-amber-50 to-amber-100",
    },
  },
  {
    id: "nomina",
    label: "Nómina y RH",
    descripcion:
      "IMSS, Infonavit, salarios, prestaciones y obligaciones del patrón.",
    color: {
      texto: "text-sky-600",
      pill: "bg-sky-50",
      pillRing: "ring-sky-200",
      iconoFondo: "bg-sky-100",
      icono: "text-sky-700",
      hoverRing: "hover:ring-sky-400",
      punto: "bg-sky-500",
      bloque: "from-sky-50 to-sky-100",
    },
  },
  {
    id: "pymes",
    label: "PyMEs y negocios",
    descripcion:
      "Tips fiscales y financieros para emprendedores y dueños de negocio.",
    color: {
      texto: "text-violet-600",
      pill: "bg-violet-50",
      pillRing: "ring-violet-200",
      iconoFondo: "bg-violet-100",
      icono: "text-violet-700",
      hoverRing: "hover:ring-violet-400",
      punto: "bg-violet-500",
      bloque: "from-violet-50 to-violet-100",
    },
  },
];

/* ────────────────────────────────────────────────────────────────────
 * BLOQUES DE CONTENIDO
 * El cuerpo de cada artículo es un array de estos bloques. El renderer
 * (`BlogContenido.tsx`) sabe dibujar cada tipo.
 * ──────────────────────────────────────────────────────────────────── */

export type BloqueContenido =
  | { tipo: "parrafo"; texto: string }
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "lista"; estilo?: "vinetas" | "numeros"; items: string[] }
  | { tipo: "cita"; texto: string; autor?: string }
  | {
      tipo: "callout";
      variante?: "tip" | "info" | "alerta";
      titulo?: string;
      texto: string;
    }
  | {
      tipo: "tabla";
      /** Encabezados de columna. */
      encabezados: string[];
      /** Filas; cada fila es un arreglo de celdas (mismo largo que encabezados). */
      filas: string[][];
      /** Pie de tabla opcional (fuente, nota). */
      pie?: string;
      /**
       * Índices de columnas (0-based) que deben alinearse a la derecha
       * (típico para montos/porcentajes). Por defecto, todo a la izquierda.
       */
      alinearDerecha?: number[];
    }
  | { tipo: "cta"; texto: string; etiquetaBoton: string; href: string }
  | {
      /**
       * Bloque interactivo/animado embebido en el artículo. Cada `variante`
       * la dibuja un componente cliente dedicado en `BlogContenido`.
       */
      tipo: "mock";
      variante: "opinion-cumplimiento";
      titulo?: string;
      pie?: string;
    };

/* ────────────────────────────────────────────────────────────────────
 * POST
 * ──────────────────────────────────────────────────────────────────── */

export type BlogPost = {
  /** Slug en kebab-case. Define la URL: /blog/<slug>. Único. */
  slug: string;
  /** Título visible (H1 y card). */
  titulo: string;
  /** Title SEO (≤ 60 chars idealmente). Si se omite usa `titulo`. */
  tituloSeo?: string;
  /** Descripción SEO + excerpt de la card (120-160 chars). */
  resumen: string;
  /** Categoría a la que pertenece. */
  categoria: CategoriaId;
  /** Etiquetas para SEO / relacionados. */
  tags: string[];
  /** Fecha de publicación en ISO (YYYY-MM-DD). */
  fecha: string;
  /** Fecha de última actualización en ISO (opcional). */
  actualizado?: string;
  /** Autor. Por defecto, el contador titular. */
  autor?: string;
  /** Minutos de lectura. Si se omite se estima del contenido. */
  lectura?: number;
  /** Marca el artículo como destacado (aparece en el hero del índice). */
  destacado?: boolean;
  /**
   * Imagen de portada ilustrativa (ruta pública, ej. "/blog/portada-rfc.jpg").
   * Si se define, las cards y la cabecera del artículo la usan en lugar del
   * emoji. Ideal en formato horizontal ~3:2.
   */
  portada?: string;
  /** Texto alternativo de la portada (accesibilidad/SEO). */
  portadaAlt?: string;
  /** Emoji grande de portada (fallback visual cuando no hay imagen). */
  emoji?: string;
  /**
   * Herramienta relacionada que se promociona en el sidebar del artículo
   * (estilo "deja de adivinar, mejor calcúlalo"). Es el gancho que invita
   * a interactuar y seguir explorando. Opcional: cada post puede tener una
   * distinta o ninguna.
   */
  herramienta?: {
    /** Etiqueta pequeña arriba del título (ej. "Calcula gratis"). */
    eyebrow?: string;
    titulo: string;
    descripcion: string;
    etiquetaBoton: string;
    href: string;
  };
  /** Cuerpo del artículo en bloques. */
  contenido: BloqueContenido[];
};

const AUTOR_DEFAULT = "Aaron Rosales";

/* ────────────────────────────────────────────────────────────────────
 * POSTS
 * 👇 Para publicar un artículo nuevo, copia un objeto y edítalo.
 *    Ordénalos como quieras: el código los reordena por fecha.
 * ──────────────────────────────────────────────────────────────────── */

export const POSTS: BlogPost[] = [
  {
    slug: "opinion-de-cumplimiento-publica-que-es",
    titulo:
      "Opinión de cumplimiento pública: qué es, por qué conviene tenerla y si es confiable",
    tituloSeo: "Opinión de cumplimiento pública (32-D): qué es | RDC",
    resumen:
      "Es como tu “carta de buena conducta” ante el SAT. Te explicamos qué es la opinión de cumplimiento, qué significa que sea positiva, por qué conviene hacerla pública y por qué es totalmente confiable. Con una demo de cómo se ve en tu portal.",
    categoria: "sat",
    tags: [
      "opinión de cumplimiento",
      "32-D",
      "SAT",
      "cumplimiento fiscal",
      "licitaciones",
      "CFF",
    ],
    fecha: "2026-06-04",
    actualizado: "2026-06-04",
    emoji: "✅",
    portada: "/blog/portada-opinion-cumplimiento.jpg",
    portadaAlt:
      "Ilustración de un teléfono mostrando el portal del cliente con una opinión de cumplimiento positiva (sello verde con palomita) y una etiqueta de “Pública” conectada al SAT.",
    lectura: 7,
    herramienta: {
      eyebrow: "Cumplimiento al día",
      titulo: "¿Tu opinión sale positiva y pública?",
      descripcion:
        "Nosotros mantenemos tus obligaciones al corriente y activamos tu opinión pública para que puedas verificarla cuando la necesites.",
      etiquetaBoton: "Quiero estar al corriente",
      href: "/contacto",
    },
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "Cada vez que una empresa quiere venderle al gobierno, pedir un crédito grande o cerrar un contrato importante, le piden lo mismo: “mándame tu opinión de cumplimiento”. Suena a trámite raro, pero en realidad es uno de los documentos más útiles que tienes como contribuyente. Aquí te lo explicamos en simple, te enseñamos cómo se ve en tu portal cuando sale bien, y al final te dejamos el detalle técnico para los que quieren la letra chiquita.",
      },
      { tipo: "subtitulo", texto: "¿Qué es la opinión de cumplimiento?" },
      {
        tipo: "parrafo",
        texto:
          "Piensa en ella como tu “carta de buena conducta” fiscal. Es un documento que genera el propio SAT y que dice, en una palabra, si estás al corriente con tus obligaciones: que presentaste tus declaraciones, que no tienes créditos fiscales firmes sin pagar y que estás bien localizado en el RFC. No la escribes tú ni tu contador: la calcula el SAT con base en lo que tiene registrado de ti.",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "También le dicen “la 32-D”",
        texto:
          "Su nombre formal es Opinión del Cumplimiento de Obligaciones Fiscales, y sale del artículo 32-D del Código Fiscal de la Federación. Por eso muchos la piden como “la 32-D”. Es la misma cosa.",
      },
      { tipo: "subtitulo", texto: "¿Qué significa que salga “positiva”?" },
      {
        tipo: "parrafo",
        texto:
          "La opinión puede salir con uno de varios resultados. El que todos quieren ver es “Positiva”:",
      },
      {
        tipo: "lista",
        items: [
          "Positiva: estás al corriente. Es la luz verde que abre puertas (contratos, créditos, proveedores).",
          "Negativa: tienes pendientes (declaraciones sin presentar o adeudos firmes). Hay que regularizar antes de que te sirva.",
          "Inscrito sin obligaciones: estás en el RFC pero no tienes obligaciones que reportar en el periodo.",
          "No inscrito: no estás registrado en el RFC, así que no hay nada que opinar.",
        ],
      },
      { tipo: "subtitulo", texto: "¿Por qué conviene tenerla pública?" },
      {
        tipo: "parrafo",
        texto:
          "Por defecto, tu opinión es privada: solo tú puedes generarla. Pero el SAT te deja autorizar que sea pública, es decir, que un tercero (un cliente, una dependencia de gobierno, un banco) pueda consultarla por su cuenta con solo tu RFC. ¿Por qué te conviene?",
      },
      {
        tipo: "lista",
        items: [
          "Te la piden mucho: en licitaciones y contratos con gobierno es prácticamente obligatoria, y cada vez más empresas privadas la exigen a sus proveedores.",
          "Genera confianza: que cualquiera pueda comprobar que estás al corriente te hace ver serio y transparente. Es un sello de buena reputación fiscal.",
          "Te ahorra vueltas: en lugar de estar generando y mandando el PDF cada vez que te lo piden, el interesado lo verifica solo, al instante.",
          "Da tranquilidad: si la consultas seguido (o tu portal la consulta por ti), te enteras a tiempo si algo cambió a “negativa”.",
        ],
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "En RDC la vigilamos por ti",
        texto:
          "Si eres cliente, tu portal consulta tu opinión directo con el SAT y te la muestra en tiempo real. Si algo se pone en rojo, lo vemos antes de que te cause un problema en un contrato.",
      },
      {
        tipo: "subtitulo",
        texto: "Así se ve en tu portal cuando es positiva y pública",
      },
      {
        tipo: "parrafo",
        texto:
          "Esto es lo bonito: no tienes que entrar al SAT ni descifrar nada. En tu portal de cliente, tu opinión aparece consultándose en vivo y, cuando todo está en orden, se pinta de verde con un “Positiva”. Pruébalo aquí 👇 (dale a “Verificar de nuevo” para volver a verlo):",
      },
      {
        tipo: "mock",
        variante: "opinion-cumplimiento",
        titulo: "Tu portal · Opinión de cumplimiento",
        pie: "Demostración. En tu portal real, el estatus se consulta directo al servicio público del SAT.",
      },
      { tipo: "subtitulo", texto: "¿Es confiable?" },
      {
        tipo: "parrafo",
        texto:
          "Mucho. Y por una razón clave: el documento lo genera el SAT, no tú. No es un PDF que alguien pueda editar en su computadora para “verse” al corriente. Cuando tu opinión es pública, el tercero la consulta directo en el portal del SAT con tu RFC y obtiene el resultado del momento, sellado por la autoridad. Es, hoy por hoy, la forma más rápida y segura de demostrar que estás en regla.",
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "Cuidado: cambia con el tiempo",
        texto:
          "Una opinión positiva no es para siempre. Si dejas de presentar una declaración o te queda un adeudo, puede pasar a negativa. Por eso muchos contratos piden que tenga una antigüedad no mayor a 30 días: quieren una foto reciente, no una de hace meses.",
      },
      {
        tipo: "cita",
        texto:
          "La opinión positiva no es un papel más: es la llave que te deja competir por los contratos grandes. Mantenerla al corriente es de las mejores inversiones que puede hacer un negocio.",
        autor: "Aaron Rosales, RDC Contadores",
      },
      {
        tipo: "subtitulo",
        texto: "En términos técnicos (para los que quieren el detalle)",
      },
      {
        tipo: "parrafo",
        texto:
          "Hasta aquí la versión simple. Si te gusta el fundamento, esto es lo que hay detrás:",
      },
      {
        tipo: "parrafo",
        texto:
          "La opinión del cumplimiento se emite conforme al artículo 32-D del Código Fiscal de la Federación (CFF) y al procedimiento que cada año detalla la Resolución Miscelánea Fiscal (RMF). El SAT la genera de forma automatizada cruzando, a la fecha de la consulta, tu situación en el RFC (inscripción y localización), el cumplimiento de tus declaraciones (provisionales, definitivas e informativas) y la existencia de créditos fiscales firmes, exigibles o garantizados.",
      },
      {
        tipo: "tabla",
        encabezados: ["Sentido de la opinión", "Qué refleja"],
        filas: [
          [
            "Positiva",
            "Estás inscrito y localizado, sin declaraciones omitidas ni créditos fiscales firmes pendientes.",
          ],
          [
            "Negativa",
            "Hay incumplimientos: omisión de declaraciones, créditos firmes no pagados ni garantizados, o no localización.",
          ],
          [
            "Inscrito sin obligaciones",
            "Estás en el RFC pero sin obligaciones registradas que generen revisión en el periodo.",
          ],
          [
            "No inscrito",
            "El RFC consultado no existe o no está registrado ante el SAT.",
          ],
        ],
        pie: "Fundamento: Art. 32-D del CFF y reglas de la RMF vigente sobre la opinión del cumplimiento de obligaciones fiscales.",
      },
      {
        tipo: "parrafo",
        texto:
          "Para que sea pública, el contribuyente debe autorizar expresamente al SAT a liberar el resultado, desde su buzón / portal del SAT, en la opción para autorizar a terceros la consulta de la opinión. Una vez autorizada, cualquier interesado puede consultarla en línea proporcionando el RFC; el sistema entrega el resultado vigente, identificado con folio y sello de la autoridad.",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "Cuándo te la van a exigir sí o sí",
        texto:
          "El propio 32-D obliga a las dependencias públicas a verificar la opinión positiva antes de contratar adquisiciones, arrendamientos, servicios u obra pública por encima de los montos que marca la ley, y antes de otorgar subsidios o estímulos. También es requisito recurrente para el REPSE, devoluciones relevantes y muchos contratos entre privados.",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "El resultado es a la fecha de la consulta: es dinámico, no un certificado permanente.",
          "Si sale negativa, identifica el motivo (declaración omitida, crédito firme, no localización) y se corrige el origen; al regularizar, vuelve a positiva.",
          "Conviene revisar que el domicilio fiscal esté activo y localizable: la “no localización” por sí sola tumba la opinión a negativa.",
        ],
      },
      {
        tipo: "cta",
        texto:
          "¿Quieres que tu opinión salga positiva y la dejemos pública para tus contratos? Nosotros mantenemos tus obligaciones al día y la vigilamos por ti.",
        etiquetaBoton: "Hablar con un asesor",
        href: "/contacto",
      },
    ],
  },
  {
    slug: "que-pasa-si-se-vence-mi-efirma",
    titulo: "Se venció mi e.firma: qué hacer (y cómo recuperarla sin ir al SAT)",
    tituloSeo: "¿Se venció tu e.firma? Renueva en línea con SAT ID | RDC",
    resumen:
      "Tu e.firma dura 4 años. Si ya venció, todavía la puedes renovar EN LÍNEA con SAT ID sin pisar el SAT, siempre que no haya pasado más de 1 año. Aquí te explicamos cómo y cuándo.",
    categoria: "sat",
    tags: ["e.firma", "SAT", "SAT ID", "firma electrónica", "trámites"],
    fecha: "2026-06-03",
    actualizado: "2026-06-03",
    emoji: "🔐",
    portada: "/blog/portada-efirma.jpg",
    portadaAlt:
      "Ilustración de una memoria USB de e.firma con verificación biométrica de SAT ID y un calendario con alerta de vencimiento.",
    lectura: 6,
    herramienta: {
      eyebrow: "Trámite en línea",
      titulo: "Renueva tu e.firma con SAT ID",
      descripcion:
        "Si venció hace menos de un año, la renuevas desde tu casa con reconocimiento facial. Entra al portal oficial del SAT.",
      etiquetaBoton: "Ir a SAT ID",
      href: "https://satid.sat.gob.mx",
    },
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "La e.firma (antes Firma Electrónica) es tu identidad digital ante el SAT: con ella firmas declaraciones, facturas, trámites y hasta documentos en el banco, la SEP o el Infonavit. El problema es que casi nadie revisa su fecha de vencimiento… hasta que la necesita con urgencia y ya caducó. La buena noticia: si actúas a tiempo, la recuperas sin pisar las oficinas del SAT.",
      },
      { tipo: "subtitulo", texto: "¿Cuánto dura la e.firma?" },
      {
        tipo: "parrafo",
        texto:
          "La e.firma tiene una vigencia de 4 años a partir de su emisión. Se compone de tres elementos: el certificado (archivo .cer), la llave privada (archivo .key) y la contraseña de la llave privada. Los tres tienen que estar en orden para que funcione.",
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "Revisa tu fecha antes de que te urja",
        texto:
          "Si eres cliente de RDC, en tu portal te avisamos cuando tu e.firma está por vencer para que no te agarre en mal momento (por ejemplo, justo antes de tu declaración anual).",
      },
      { tipo: "subtitulo", texto: "¿Qué pasa si se vence? Los 3 escenarios" },
      {
        tipo: "parrafo",
        texto:
          "Aquí está lo más importante de todo el artículo. Lo que puedes hacer depende de cuánto tiempo lleva vencida y de si conservas tus archivos:",
      },
      {
        tipo: "tabla",
        encabezados: ["Tu situación", "Qué puedes hacer"],
        filas: [
          [
            "Aún vigente (le queda al menos 1 día)",
            "Renovación 100% en línea con tu propia e.firma (Certifica/CertiSAT). Sin cita.",
          ],
          [
            "Venció hace MENOS de 1 año",
            "Renuevas en línea con SAT ID (verificación facial). Sin cita presencial. ✅",
          ],
          [
            "Venció hace MÁS de 1 año, o perdiste archivos/contraseña",
            "No hay atajo digital: cita presencial en el SAT con USB e identificación.",
          ],
        ],
        pie: "Fuente: SAT — Renovación del Certificado de e.firma y servicio SAT ID.",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "La clave: el plazo de 1 año",
        texto:
          "Si tu e.firma venció hace menos de un año, NO necesitas ir al SAT. Puedes renovarla desde tu casa con SAT ID usando reconocimiento facial. Pasado ese año, ya es forzoso acudir presencialmente.",
      },
      { tipo: "subtitulo", texto: "Cómo renovar con SAT ID (paso a paso)" },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Entra a satid.sat.gob.mx (o descarga la app SAT ID) y elige “Renovación de e.firma”.",
          "Captura tu RFC y un correo electrónico.",
          "Sube una foto de tu identificación oficial vigente (INE) por ambos lados.",
          "Graba el video de verificación diciendo la frase que te indica y haz el reconocimiento facial.",
          "Firma la solicitud y envíala. En un plazo de hasta 5 días hábiles el SAT te responde por correo con las indicaciones para generar tus nuevos archivos.",
          "Genera tu nueva e.firma (archivos .cer y .key) y define una nueva contraseña. Tu certificado vuelve a tener vigencia de 4 años.",
        ],
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "Ojo: la contraseña NO se recupera",
        texto:
          "Si conservas tus archivos .cer y .key pero olvidaste la contraseña de la llave privada, no hay forma de recuperarla: el SAT no la guarda. En ese caso esos archivos quedan inservibles y tendrás que tramitar la revocación y una nueva e.firma.",
      },
      { tipo: "subtitulo", texto: "Requisitos para usar SAT ID" },
      {
        tipo: "lista",
        items: [
          "Ser persona física mayor de edad.",
          "Que tu e.firma haya vencido hace menos de un año (o esté por vencer).",
          "Identificación oficial vigente (INE/IFE, pasaporte o cédula profesional).",
          "Un correo electrónico personal y un teléfono con cámara.",
        ],
      },
      {
        tipo: "cita",
        texto:
          "El error más común es dejar pasar el año. Renovar a tiempo es la diferencia entre hacerlo en 10 minutos desde el celular o perder media mañana en una fila del SAT.",
        autor: "Aaron Rosales, RDC Contadores",
      },
      {
        tipo: "cta",
        texto:
          "¿No sabes cuándo vence tu e.firma o quieres que la renovemos por ti? Te ayudamos.",
        etiquetaBoton: "Hablar con un asesor",
        href: "/contacto",
      },
    ],
  },
  {
    slug: "gastos-no-deducibles-que-son-y-como-evitarlos",
    titulo: "Gastos no deducibles: por qué el SAT te los rechaza (y cómo evitarlo)",
    tituloSeo: "Gastos no deducibles 2026: qué son y cómo evitarlos | RDC",
    resumen:
      "No es lo mismo un gasto prohibido por ley que uno que solo falló en la forma de pago. Te explicamos la diferencia entre el Art. 27 y el 28 de la LISR, por qué pierdes también el IVA y cómo no caer en la trampa.",
    categoria: "impuestos",
    tags: [
      "gastos no deducibles",
      "deducciones",
      "ISR",
      "IVA",
      "LISR",
      "CFDI",
    ],
    fecha: "2026-06-02",
    actualizado: "2026-06-03",
    emoji: "🧾",
    portada: "/blog/portada-gastos-no-deducibles.jpg",
    portadaAlt:
      "Ilustración de un ticket de gasto bajo una lupa, con un pago con tarjeta marcado como válido y efectivo marcado como no deducible.",
    lectura: 7,
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "Pocas cosas duelen más que cerrar el año y descubrir que la mitad de tus gastos “no contaron”. La cuenta de gastos no deducibles es de las más malentendidas: muchos meten ahí todo lo que el SAT rechaza, sin distinguir por qué. Y esa diferencia es justo lo que separa un gasto que puedes salvar de uno que estaba perdido desde el principio.",
      },
      { tipo: "subtitulo", texto: "Dos cosas distintas que solemos confundir" },
      {
        tipo: "parrafo",
        texto:
          "La Ley del ISR distingue dos situaciones que no son iguales, aunque las dos terminen en “no lo puedes deducir”:",
      },
      {
        tipo: "lista",
        items: [
          "Gastos que NO reúnen requisitos (Art. 27 LISR): son gastos indispensables y reales para tu negocio, pero fallaron en la forma (por ejemplo, pagaste en efectivo algo que debía ir por banco, o falta el CFDI). El fondo es válido; falló el procedimiento.",
          "Gastos NO deducibles (Art. 28 LISR): están prohibidos por la ley sin importar cómo los pagues o factures (multas, recargos, gastos personales, obsequios, consumos en bares, etc.).",
        ],
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "El ejemplo clásico: la gasolina en efectivo",
        texto:
          "Cargaste combustible para la camioneta del negocio y pagaste en efectivo. El gasto es real e indispensable, pero el Art. 27 exige pagar combustible siempre con medio bancarizado. No es que sea un gasto “prohibido”: simplemente no reunió el requisito de forma. Con tarjeta o transferencia, sí lo deduces.",
      },
      { tipo: "subtitulo", texto: "Los requisitos para que un gasto SÍ sea deducible" },
      {
        tipo: "lista",
        items: [
          "Que sea estrictamente indispensable para tu actividad.",
          "Que tengas el CFDI 4.0 válido, con tu RFC correcto.",
          "Que esté pagado con medio bancarizado si supera $2,000 (transferencia, tarjeta o cheque nominativo).",
          "Que el método de pago del CFDI coincida con cómo realmente pagaste.",
          "Que esté correctamente registrado en tu contabilidad.",
        ],
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "La gasolina tiene regla propia",
        texto:
          "El combustible NUNCA es deducible si lo pagas en efectivo, sin importar el monto. Y desde el 24 de abril de 2026, la factura de gasolina o diésel debe incluir el Complemento de Hidrocarburos y Petrolíferos en el XML; si falta, pierdes la deducción y el IVA.",
      },
      { tipo: "subtitulo", texto: "El golpe doble: si pierdes el ISR, pierdes el IVA" },
      {
        tipo: "parrafo",
        texto:
          "Aquí está el detalle que más caro sale. La Ley del IVA (Art. 5) pone una regla de oro: para que el IVA sea acreditable, el gasto que lo originó debe ser deducible para ISR. Es decir, si el gasto “muere” fiscalmente —ya sea por el Art. 27 o el 28—, el IVA que pagaste también se pierde y se vuelve un costo más. Un solo error de forma te pega dos veces.",
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "Y la DIOT también se entera",
        texto:
          "Desde 2025 la DIOT obliga a informar el IVA no acreditable de los gastos que no reunieron requisitos. Sin una contabilidad bien separada, esto genera errores y sanciones al presentar la informativa.",
      },
      { tipo: "subtitulo", texto: "Errores más comunes que te cuestan deducciones" },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Pagar en efectivo gastos mayores a $2,000.",
          "Cargar gasolina en efectivo o sin el complemento de hidrocarburos.",
          "Pedir la factura con RFC equivocado o sin el uso de CFDI correcto.",
          "Meter gastos personales (que no son del negocio) a la contabilidad.",
          "Intentar deducir multas, recargos o consumos en bares (Art. 28: prohibidos).",
        ],
      },
      {
        tipo: "cita",
        texto:
          "La mayoría de los “no deducibles” no eran gastos malos: eran gastos buenos mal pagados. Cuidar la forma de pago es la deducción más barata que existe.",
        autor: "Aaron Rosales, RDC Contadores",
      },
      {
        tipo: "cta",
        texto:
          "¿Quieres dejar de perder deducciones por errores de forma? Nosotros revisamos tus gastos y te decimos qué sí y qué no.",
        etiquetaBoton: "Agendar una asesoría",
        href: "/contacto",
      },
    ],
  },
  {
    slug: "complemento-carta-porte-que-es-y-requisitos",
    titulo: "Complemento Carta Porte: qué es, cuándo aplica y qué requisitos necesitas",
    tituloSeo: "Carta Porte 2026: qué es, requisitos y los 30 km | RDC",
    resumen:
      "Si transportas mercancía en México, esto te toca. Te explicamos qué es el Complemento Carta Porte, la regla de los 30 km, los requisitos (chofer, vehículo, permiso SICT, mercancía) y la clave que usas para facturar si eres trailero.",
    categoria: "pymes",
    tags: [
      "Carta Porte",
      "autotransporte",
      "transportistas",
      "CFDI",
      "SAT",
      "SICT",
      "facturación",
    ],
    fecha: "2026-06-03",
    actualizado: "2026-06-03",
    emoji: "🚚",
    portada: "/blog/portada-carta-porte.jpg",
    portadaAlt:
      "Ilustración de un tractocamión en ruta con un CFDI con Complemento Carta Porte, escudo de permiso y seguro, y la mercancía con su código.",
    lectura: 8,
    herramienta: {
      eyebrow: "Para transportistas",
      titulo: "¿Eres trailero o transportas mercancía?",
      descripcion:
        "Nosotros emitimos tu Carta Porte sin errores y te declaramos como RESICO. Olvídate de multas y retenciones en la carretera.",
      etiquetaBoton: "Quiero que me ayuden",
      href: "/contacto",
    },
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "Si te dedicas al transporte de carga —o mueves tu propia mercancía de un punto a otro— el Complemento Carta Porte es de las obligaciones que más caro sale ignorar: una revisión en carretera sin él puede terminar en multa, retención de la mercancía e incluso del vehículo. Aquí te explicamos, sin tecnicismos, qué es, cuándo estás obligado y qué necesitas para emitirla bien.",
      },
      { tipo: "subtitulo", texto: "¿Qué es el Complemento Carta Porte?" },
      {
        tipo: "parrafo",
        texto:
          "Es un complemento que se agrega a tu factura electrónica (CFDI) para amparar el traslado de bienes o mercancías en territorio nacional, ya sea por vía terrestre, marítima, aérea o ferroviaria. En pocas palabras: es el documento digital que demuestra qué se transporta, de dónde a dónde, en qué vehículo y quién lo maneja. Lo establece la SICT (Secretaría de Infraestructura, Comunicaciones y Transportes) junto con el SAT.",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "Versión vigente: 3.1",
        texto:
          "Desde el 17 de julio de 2024 solo es válida la emisión del CFDI 4.0 con el Complemento Carta Porte versión 3.1. Si tu sistema sigue generando versiones anteriores, tus comprobantes ya no son válidos.",
      },
      { tipo: "subtitulo", texto: "¿Quién debe emitirla?" },
      {
        tipo: "lista",
        items: [
          "Transportistas que cobran por el servicio (autotransporte de carga): emiten un CFDI de tipo Ingreso con Complemento Carta Porte.",
          "Dueños de la mercancía que la trasladan con vehículos propios o arrendados, sin cobrar flete: emiten un CFDI de tipo Traslado con Complemento Carta Porte.",
          "Intermediarios o agentes de transporte que coordinan el traslado.",
        ],
      },
      { tipo: "subtitulo", texto: "¿Cuándo estás obligado? La regla de los 30 km" },
      {
        tipo: "parrafo",
        texto:
          "La duda más común es a partir de cuántos kilómetros aplica. La clave está en el tipo de vehículo y en cuánto tramo de carretera federal recorres. Estás EXENTO solo si usas un vehículo igual o menor a un camión tipo C2 (2 ejes) y tu trayecto en tramo federal no excede un radio de 30 km entre origen y destino. En cualquier otro caso, la necesitas:",
      },
      {
        tipo: "tabla",
        encabezados: ["Tipo de vehículo", "¿Requiere Carta Porte?", "Distancia en tramo federal"],
        filas: [
          ["Camioneta / pickup ligera", "No", "Cualquiera (transporte local)"],
          ["Camión C2 (2 ejes)", "Solo si supera 30 km", "Más de 30 km de radio"],
          ["Camión C3 (3 ejes o más)", "Sí, siempre", "Cualquier distancia"],
          ["Tractocamión / tráiler", "Sí, siempre", "Cualquier distancia"],
        ],
        pie: "Referencia: NOM-012-SCT-2-2017 y reglas 2.7.7 de la RMF. El radio de 30 km se mide entre origen inicial y destino final, incluyendo puntos intermedios.",
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "Ojo si manejas tráiler o camión de 3 ejes",
        texto:
          "Si tu vehículo es mayor a un C2 (un C3, un tractocamión, etc.), estás obligado a emitir Carta Porte aunque el trayecto sea menor a 30 km. La exención de los 30 km solo aplica a vehículos pequeños.",
      },
      { tipo: "subtitulo", texto: "Requisitos para tu Carta Porte" },
      {
        tipo: "parrafo",
        texto:
          "Para llenar el complemento sin que te lo rechacen necesitas tener a la mano cuatro bloques de información. Estos son los datos que más se piden:",
      },
      {
        tipo: "parrafo",
        texto: "1. Datos del operador (el chofer):",
      },
      {
        tipo: "lista",
        items: [
          "Número de licencia de conducir vigente.",
          "RFC del operador.",
          "CURP del operador.",
          "Nombre completo.",
        ],
      },
      {
        tipo: "parrafo",
        texto: "2. Datos del vehículo y permisos:",
      },
      {
        tipo: "lista",
        items: [
          "Permiso de la SICT: tipo de permiso (catálogo c_TipoPermiso, p. ej. TPAF01 para autotransporte federal de carga) y número de permiso.",
          "Configuración vehicular según catálogo (C2, C3, T3S2, etc.).",
          "Placas y año-modelo del vehículo (y del remolque si aplica).",
          "Seguro de responsabilidad civil: aseguradora y número de póliza (obligatorio).",
        ],
      },
      {
        tipo: "parrafo",
        texto: "3. Ubicaciones de carga y descarga:",
      },
      {
        tipo: "lista",
        items: [
          "Dirección de origen (carga) con código postal y fecha-hora estimada de salida.",
          "Dirección de destino (descarga) con código postal y fecha-hora estimada de llegada.",
          "Distancia recorrida y, si aplica, puntos intermedios.",
        ],
      },
      {
        tipo: "parrafo",
        texto: "4. La mercancía que transportas:",
      },
      {
        tipo: "lista",
        items: [
          "Clave de producto del catálogo c_ClaveProdServCP (el código de la mercancía dentro del complemento).",
          "Descripción de los bienes y cantidad.",
          "Peso bruto total en kilogramos.",
          "Unidad de medida y, si es material peligroso, la clave del catálogo correspondiente y el tipo de embalaje.",
        ],
      },
      { tipo: "subtitulo", texto: "El código de facturación si eres trailero" },
      {
        tipo: "parrafo",
        texto:
          "Aquí está el dato que casi nadie te explica claro. Cuando prestas el servicio de transporte de carga por carretera, emites un CFDI de tipo Ingreso y, en el concepto, usas la clave de producto/servicio 78101800 — “Transporte de carga por carretera” — con clave de unidad E48 (“Unidad de servicio”). La mercancía que llevas NO va en el concepto: va dentro del complemento, en el campo de bienes transportados (BienesTransp), con su propia clave del catálogo ClaveProdServCP.",
      },
      {
        tipo: "tabla",
        encabezados: ["Clave", "Cuándo se usa"],
        filas: [
          ["78101800", "Transporte de carga por carretera (general)"],
          ["78101801", "Carga por carretera en camión, área local"],
          ["78101802", "Carga por carretera en camión, nivel regional y nacional"],
        ],
        pie: "Clave de unidad en todos los casos: E48 (Unidad de servicio). Fuente: apéndices del instructivo de llenado del Complemento Carta Porte (SAT).",
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "Truco para no equivocarte",
        texto:
          "El concepto de tu factura describe el SERVICIO (78101800), no el producto que mueves. El producto se describe aparte, dentro del complemento. Confundir ambos es el error #1 que provoca rechazos del CFDI.",
      },
      { tipo: "subtitulo", texto: "¿Qué pasa si no la emites?" },
      {
        tipo: "lista",
        items: [
          "Multas que pueden ir de varios miles de pesos por cada CFDI mal emitido o no emitido.",
          "Retención de la mercancía y hasta del vehículo en revisiones de autoridades federales.",
          "El gasto del traslado puede volverse no deducible y sin IVA acreditable.",
        ],
      },
      {
        tipo: "cita",
        texto:
          "En la carretera no hay margen para improvisar: o llevas tu Carta Porte bien hecha, o te arriesgas a perder el viaje completo y la mercancía. Vale la pena dejarlo en manos de tu contador.",
        autor: "Aaron Rosales, RDC Contadores",
      },
      {
        tipo: "cta",
        texto:
          "¿Eres transportista o mueves mercancía? Nosotros emitimos tu Carta Porte sin errores y te llevamos toda la contabilidad.",
        etiquetaBoton: "Hablar con un asesor",
        href: "/contacto",
      },
    ],
  },
  {
    slug: "como-calcular-tu-rfc-con-homoclave",
    titulo: "Cómo se calcula tu RFC con homoclave (explicado fácil)",
    tituloSeo: "Cómo se calcula el RFC con homoclave | Guía RDC",
    resumen:
      "Te explicamos los 13 caracteres del RFC de persona física: las 4 letras del nombre, la fecha y la homoclave. Con ejemplo y calculadora gratis.",
    categoria: "sat",
    tags: ["RFC", "homoclave", "SAT", "persona física"],
    fecha: "2026-06-03",
    destacado: true,
    emoji: "🪪",
    portada: "/blog/portada-rfc.jpg",
    portadaAlt:
      "Ilustración de una credencial fiscal con los 13 caracteres del RFC y una lupa resaltando la homoclave.",
    lectura: 5,
    herramienta: {
      eyebrow: "Calcula gratis",
      titulo: "Saca tu RFC en segundos",
      descripcion:
        "Captura tu nombre y fecha de nacimiento y obtén tu RFC con homoclave al instante. 100% privado.",
      etiquetaBoton: "Calcular mi RFC",
      href: "/herramientas/rfc",
    },
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "El RFC (Registro Federal de Contribuyentes) es la clave con la que el SAT te identifica. Para una persona física tiene 13 caracteres y, aunque parezca un código aleatorio, cada parte tiene un significado claro. Aquí te lo desglosamos sin tecnicismos.",
      },
      { tipo: "subtitulo", texto: "Las 3 partes del RFC" },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "4 letras de tu nombre: salen de tus apellidos y tu primer nombre.",
          "6 dígitos de tu fecha de nacimiento: en formato AAMMDD.",
          "3 caracteres de homoclave: 2 que asigna una tabla del SAT y 1 dígito verificador.",
        ],
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "Hazlo en segundos",
        texto:
          "No tienes que calcularlo a mano. Nuestra calculadora de RFC lo hace al instante y es 100% privada: tus datos nunca salen de tu navegador.",
      },
      { tipo: "subtitulo", texto: "Ejemplo: LOMA900315AB1" },
      {
        tipo: "parrafo",
        texto:
          "Para una persona ficticia, Ana López Martínez, nacida el 15 de marzo de 1990: LOMA (apellidos + nombre), 900315 (fecha) y AB1 (homoclave + verificador). Cada bloque encaja como piezas de un rompecabezas.",
      },
      {
        tipo: "cta",
        texto:
          "¿Quieres ver el tuyo? Calcúlalo gratis con el desglose letra por letra.",
        etiquetaBoton: "Calcular mi RFC",
        href: "/herramientas/rfc",
      },
    ],
  },
  {
    slug: "que-es-resico-y-quien-puede-usarlo",
    titulo: "Qué es RESICO y quién puede aprovecharlo en 2026",
    tituloSeo: "Qué es RESICO y quién puede usarlo en 2026 | RDC",
    resumen:
      "El Régimen Simplificado de Confianza puede bajar mucho tu carga fiscal. Te explicamos requisitos, tasas y a quién le conviene de verdad.",
    categoria: "impuestos",
    tags: ["RESICO", "ISR", "régimen fiscal", "personas físicas"],
    fecha: "2026-05-28",
    actualizado: "2026-06-03",
    emoji: "📉",
    portada: "/blog/portada-resico.jpg",
    portadaAlt:
      "Ilustración del Régimen Simplificado de Confianza con una comparativa de carga fiscal entre regímenes.",
    lectura: 8,
    herramienta: {
      eyebrow: "Nueva herramienta",
      titulo: "Deja de adivinar tu ISR",
      descripcion:
        "Escribe tu ingreso del mes y calcula al instante cuánto pagarías de ISR en RESICO. Gratis y sin registro.",
      etiquetaBoton: "Probar calculadora",
      href: "/herramientas/isr-resico",
    },
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "RESICO (Régimen Simplificado de Confianza) es uno de los regímenes más atractivos para personas físicas con actividad empresarial, profesional o de arrendamiento, porque maneja tasas de ISR muy bajas comparadas con el régimen general. En lugar de aplicar tablas complejas con cuota fija y excedentes, multiplicas tu ingreso del mes por una tasa que va del 1.00 % al 2.50 %. Así de simple.",
      },
      { tipo: "subtitulo", texto: "Tabla de tasas RESICO 2026" },
      {
        tipo: "parrafo",
        texto:
          "Esta es la tabla que usas para calcular tu ISR en los pagos provisionales mensuales. Ubicas tu ingreso del mes en el rango que le corresponde y aplicas la tasa directamente sobre el total facturado:",
      },
      {
        tipo: "tabla",
        encabezados: ["Ingresos mensuales", "Tasa de ISR", "Ejemplo de ISR"],
        alinearDerecha: [1],
        filas: [
          ["Hasta $25,000", "1.00%", "$250 por cada $25,000"],
          ["$25,001 – $50,000", "1.10%", "$550 por $50,000"],
          ["$50,001 – $83,333", "1.50%", "$1,250 por $83,333"],
          ["$83,334 – $208,333", "2.00%", "$4,166 por $208,333"],
          ["$208,334 – $291,666", "2.50%", "$7,291 por $291,666"],
        ],
        pie: "Fuente: LISR Art. 113-E y RMF 2026. El tope mensual de $291,666 corresponde al límite anual de $3,500,000 dividido entre 12.",
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "Calcula el tuyo en un clic",
        texto:
          "No tienes que hacer cuentas a mano: escribe tu ingreso del mes en nuestra Calculadora de ISR RESICO y te dice cuánto pagarías al instante, resaltando el rango que te aplica.",
      },
      { tipo: "subtitulo", texto: "RESICO vs régimen general: ¿cuánto te ahorras?" },
      {
        tipo: "parrafo",
        texto:
          "La diferencia es enorme. Como en RESICO la tasa es plana y baja, un contribuyente que en el régimen general pagaría miles de pesos, en RESICO paga una fracción. Estos son ejemplos aproximados de referencia:",
      },
      {
        tipo: "tabla",
        encabezados: ["Ingreso mensual", "ISR en RESICO", "ISR régimen general", "Ahorro aprox."],
        alinearDerecha: [1, 2, 3],
        filas: [
          ["$15,000", "$150 (1.00%)", "~$1,400", "~$1,250/mes"],
          ["$30,000", "$330 (1.10%)", "~$3,900", "~$3,570/mes"],
          ["$80,000", "$1,200 (1.50%)", "~$16,100", "~$14,900/mes"],
          ["$200,000", "$4,000 (2.00%)", "~$49,700", "~$45,700/mes"],
        ],
        pie: "Cifras aproximadas con fines ilustrativos. El cálculo del régimen general depende de tus deducciones autorizadas.",
      },
      { tipo: "subtitulo", texto: "¿A quién le conviene?" },
      {
        tipo: "lista",
        items: [
          "Personas físicas con ingresos de hasta 3.5 millones de pesos al año.",
          "Quienes facturan servicios o venden productos y quieren simplificar.",
          "Profesionistas independientes que hoy pagan de más en el régimen general.",
          "Arrendadores de bienes inmuebles que buscan una carga fiscal más ligera.",
        ],
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "Ojo con los requisitos",
        texto:
          "No todos pueden entrar a RESICO: quedan fuera los socios o accionistas de empresas, quienes superen el límite de ingresos, los esquemas que simulan sueldos y quienes operan vía fideicomisos. Además, RESICO no permite deducciones. Antes de cambiarte, conviene revisar tu caso con un contador.",
      },
      { tipo: "subtitulo", texto: "¿Qué cambió en RESICO para 2026?" },
      {
        tipo: "parrafo",
        texto:
          "Las cinco tasas (1.00 %, 1.10 %, 1.50 %, 2.00 % y 2.50 %) son idénticas a años anteriores. Lo que cambió son tres aspectos operativos:",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Recargos por pago extemporáneo: subieron al 2.07 % mensual (antes 1.47 %). Si se te pasa la fecha de tu declaración, el atraso cuesta más.",
          "Devoluciones mensuales de ISR: si te retienen de más (por ejemplo, cuando facturas a personas morales), desde 2026 puedes pedir la devolución mes a mes, sin esperar a la anual (Regla RMF 3.13.34).",
          "Retención en plataformas digitales: se estandarizó al 2.5 % para ingresos por MercadoLibre, Uber, Rappi y similares.",
        ],
      },
      { tipo: "subtitulo", texto: "Ejemplo: freelancer que factura $45,000/mes" },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Identifica tu ingreso del mes: $45,000.",
          "Ubica tu rango: $25,001 – $50,000 → tasa del 1.10 %.",
          "Calcula: $45,000 × 1.10 % = $495 de ISR.",
        ],
      },
      {
        tipo: "parrafo",
        texto:
          "Eso es todo. Sin restar límites inferiores, sin sumar cuotas fijas. Por eso se llama régimen \u201csimplificado\u201d.",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "¿Y si un mes facturo más de $291,666?",
        texto:
          "Nada inmediato. No sales del régimen de golpe: lo que importa es el acumulado anual. Si al cierre del año tus ingresos totales no superan los $3,500,000, sigues en RESICO.",
      },
      {
        tipo: "cita",
        texto:
          "Cambiar de régimen sin analizar tus números puede costarte más de lo que ahorras. Vale la pena hacer cuentas antes.",
        autor: "Aaron Rosales, RDC Contadores",
      },
      {
        tipo: "cta",
        texto:
          "Calcula cuánto pagarías de ISR en RESICO con tu ingreso del mes, gratis y sin registro.",
        etiquetaBoton: "Abrir calculadora de ISR RESICO",
        href: "/herramientas/isr-resico",
      },
      {
        tipo: "cta",
        texto: "¿Te conviene RESICO? Lo revisamos contigo sin compromiso.",
        etiquetaBoton: "Agendar una asesoría",
        href: "/contacto",
      },
    ],
  },
  {
    slug: "calendario-fiscal-fechas-clave-2026",
    titulo: "Calendario fiscal 2026: las fechas que no debes brincarte",
    tituloSeo: "Calendario fiscal 2026: fechas clave del SAT | RDC",
    resumen:
      "Declaraciones mensuales, anual, DIOT y avisos. Te dejamos las fechas clave del SAT en 2026 para que no te agarre el susto de un recargo.",
    categoria: "guias",
    tags: ["calendario fiscal", "declaraciones", "SAT", "obligaciones"],
    fecha: "2026-05-20",
    emoji: "🗓️",
    portada: "/blog/portada-calendario.jpg",
    portadaAlt:
      "Ilustración de un calendario fiscal con fechas clave marcadas y una alerta de vencimiento.",
    lectura: 4,
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "Cumplir a tiempo es la forma más barata de hacer impuestos: evitas recargos, multas y dolores de cabeza. Estas son las fechas que todo contribuyente debería tener en el radar durante 2026.",
      },
      { tipo: "subtitulo", texto: "Lo mensual" },
      {
        tipo: "lista",
        items: [
          "Día 17 de cada mes: declaración mensual de ISR e IVA.",
          "DIOT: informativa de operaciones con terceros.",
          "Pagos de cuotas IMSS e Infonavit (si tienes trabajadores).",
        ],
      },
      { tipo: "subtitulo", texto: "Lo anual" },
      {
        tipo: "lista",
        items: [
          "Personas morales: declaración anual en marzo.",
          "Personas físicas: declaración anual en abril.",
        ],
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "Tip de despacho",
        texto:
          "Si eres cliente de RDC, tu portal te muestra tu calendario y tus acuses en tiempo real, así no tienes que estar adivinando qué sigue.",
      },
      {
        tipo: "cta",
        texto: "¿Quieres dejar de cargar tú con las fechas? Nosotros te avisamos.",
        etiquetaBoton: "Conocer nuestros servicios",
        href: "/servicios",
      },
    ],
  },
  {
    slug: "que-es-repse-icsoe-sisub",
    titulo: "REPSE, ICSOE y SISUB: qué son y quién los necesita",
    tituloSeo: "Qué es el REPSE y cómo presentar ICSOE y SISUB | RDC",
    resumen:
      "Qué es el REPSE, quién está obligado a registrarse y cómo se presentan los informes ICSOE (IMSS) y SISUB (Infonavit) de forma cuatrimestral.",
    categoria: "nomina",
    tags: [
      "REPSE",
      "ICSOE",
      "SISUB",
      "subcontratación",
      "servicios especializados",
      "IMSS",
      "Infonavit",
      "STPS",
    ],
    fecha: "2026-06-03",
    emoji: "📋",
    portada: "/blog/portada-repse.jpg",
    portadaAlt:
      "Ilustración del registro REPSE con un escudo de cumplimiento conectado a los informes ICSOE del IMSS y SISUB del Infonavit.",
    lectura: 7,
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "Desde la reforma a la subcontratación de 2021, las empresas que prestan servicios especializados u obras especializadas tienen tres obligaciones que van de la mano: estar registradas en el REPSE y presentar, cada cuatrimestre, los informes ICSOE ante el IMSS y SISUB ante el Infonavit. Si subcontratas o eres proveedor de servicios, esto te toca de cerca.",
      },
      { tipo: "subtitulo", texto: "¿Qué es el REPSE?" },
      {
        tipo: "parrafo",
        texto:
          "El REPSE (Registro de Prestadoras de Servicios Especializados u Obras Especializadas) es un padrón de la Secretaría del Trabajo y Previsión Social (STPS). En él deben inscribirse las personas físicas o morales que ponen a sus trabajadores a disposición de un tercero para realizar servicios u obras especializadas, es decir, actividades que no forman parte del objeto social ni de la actividad económica preponderante de quien las contrata.",
      },
      {
        tipo: "parrafo",
        texto:
          "El registro no es para siempre: se renueva cada 3 años y exige tener al corriente obligaciones fiscales y de seguridad social. Sin REPSE vigente, ni el proveedor puede facturar el servicio especializado ni el contratante puede deducirlo o acreditar el IVA.",
      },
      { tipo: "subtitulo", texto: "¿Quién necesita el REPSE?" },
      {
        tipo: "lista",
        items: [
          "Empresas de seguridad privada, limpieza, vigilancia y mantenimiento.",
          "Proveedores de servicios de TI, ingeniería, construcción especializada y consultoría con personal en sitio.",
          "Cualquier persona física o moral que proporcione trabajadores propios para ejecutar servicios u obras especializadas a otra empresa.",
          "Grupos de empresas que se prestan personal entre sí (servicios intragrupo).",
        ],
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "El contratante también es responsable",
        texto:
          "Si tu empresa contrata servicios especializados, debes verificar que el proveedor tenga su REPSE vigente y conservar sus acuses de ICSOE y SISUB. De lo contrario, el SAT puede rechazarte la deducción y el acreditamiento del IVA de esas facturas.",
      },
      { tipo: "subtitulo", texto: "¿Qué es el ICSOE y cómo se presenta?" },
      {
        tipo: "parrafo",
        texto:
          "El ICSOE (Informe de Contratos de Servicios u Obras Especializadas) es el reporte que se presenta ante el IMSS a través de su plataforma. En él, el prestador de servicios informa los contratos que tiene celebrados, los trabajadores asignados a cada contrato y los datos de las empresas contratantes. Es la forma en que el IMSS verifica que las cuotas de seguridad social de esos trabajadores se estén pagando correctamente.",
      },
      { tipo: "subtitulo", texto: "¿Qué es el SISUB y cómo se presenta?" },
      {
        tipo: "parrafo",
        texto:
          "El SISUB (Sistema de Información de Subcontratación) es el informe equivalente ante el Infonavit. Se presenta en el portal empresarial del Infonavit y reporta los mismos contratos de servicios especializados, los trabajadores involucrados y la información de los clientes, para confirmar que las aportaciones y los créditos de vivienda estén en orden. ICSOE y SISUB son informes hermanos: uno mira al IMSS y el otro al Infonavit.",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "Se presentan de forma cuatrimestral",
        texto:
          "Tanto el ICSOE como el SISUB son obligaciones cuatrimestrales: se presentan 3 veces al año, dentro de los primeros 17 días de enero, mayo y septiembre, reportando el cuatrimestre que acaba de terminar. No es un trámite mensual ni anual, pero brincarse un cuatrimestre puede costarte multas y poner en riesgo tu REPSE.",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "1er cuatrimestre (enero–abril): se reporta en mayo.",
          "2º cuatrimestre (mayo–agosto): se reporta en septiembre.",
          "3er cuatrimestre (septiembre–diciembre): se reporta en enero del año siguiente.",
        ],
      },
      {
        tipo: "cita",
        texto:
          "El REPSE no es solo registrarte una vez; es mantener el ICSOE y el SISUB al día cada cuatrimestre. Ahí es donde la mayoría se atora.",
        autor: "Aaron Rosales, RDC Contadores",
      },
      {
        tipo: "cta",
        texto:
          "¿Necesitas registrar tu REPSE o presentar tu ICSOE y SISUB sin errores? Lo hacemos por ti, cada cuatrimestre.",
        etiquetaBoton: "Quiero ayuda con mi REPSE",
        href: "/contacto",
      },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────
 * HELPERS
 * ──────────────────────────────────────────────────────────────────── */

/** Estima minutos de lectura a partir de los bloques de texto (~200 ppm). */
function estimarLectura(post: BlogPost): number {
  const palabras = post.contenido.reduce((acc, b) => {
    if (b.tipo === "lista") {
      return acc + b.items.join(" ").split(/\s+/).length;
    }
    if ("texto" in b) {
      return acc + b.texto.split(/\s+/).length;
    }
    return acc;
  }, 0);
  return Math.max(1, Math.round(palabras / 200));
}

/** Post enriquecido con datos derivados listos para la UI. */
export type BlogPostVista = BlogPost & {
  autor: string;
  lectura: number;
  categoriaInfo: CategoriaBlog;
};

function aVista(post: BlogPost): BlogPostVista {
  const categoriaInfo =
    CATEGORIAS.find((c) => c.id === post.categoria) ?? CATEGORIAS[0];
  return {
    ...post,
    autor: post.autor ?? AUTOR_DEFAULT,
    lectura: post.lectura ?? estimarLectura(post),
    categoriaInfo,
  };
}

/** Todos los posts, ordenados del más reciente al más antiguo. */
export function getPosts(): BlogPostVista[] {
  return [...POSTS]
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .map(aVista);
}

/** Un post por slug, o null si no existe. */
export function getPost(slug: string): BlogPostVista | null {
  const post = POSTS.find((p) => p.slug === slug);
  return post ? aVista(post) : null;
}

/** El post destacado (primer `destacado: true`), o el más reciente. */
export function getPostDestacado(): BlogPostVista | null {
  const lista = getPosts();
  return lista.find((p) => p.destacado) ?? lista[0] ?? null;
}

/** Categorías que efectivamente tienen al menos un post. */
export function getCategoriasConPosts(): CategoriaBlog[] {
  const usadas = new Set(POSTS.map((p) => p.categoria));
  return CATEGORIAS.filter((c) => usadas.has(c.id));
}

/** Info de una categoría por id. */
export function getCategoria(id: CategoriaId): CategoriaBlog | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}

/**
 * Posts relacionados: misma categoría primero, luego por tags en común.
 * Excluye el propio post. Devuelve hasta `limite`.
 */
export function getPostsRelacionados(
  slug: string,
  limite = 3
): BlogPostVista[] {
  const actual = getPost(slug);
  if (!actual) return [];
  const otros = getPosts().filter((p) => p.slug !== slug);
  const puntuados = otros
    .map((p) => {
      let score = 0;
      if (p.categoria === actual.categoria) score += 3;
      score += p.tags.filter((t) => actual.tags.includes(t)).length;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);
  return puntuados.slice(0, limite).map((x) => x.p);
}

/** Formatea una fecha ISO a "3 de junio de 2026" (es-MX). */
export function formatearFecha(iso: string): string {
  const fecha = new Date(`${iso}T12:00:00`);
  return fecha.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
