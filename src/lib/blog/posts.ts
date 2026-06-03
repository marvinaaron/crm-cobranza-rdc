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
  | { tipo: "cta"; texto: string; etiquetaBoton: string; href: string };

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
    portada: "/blog/portada-resico.png",
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
