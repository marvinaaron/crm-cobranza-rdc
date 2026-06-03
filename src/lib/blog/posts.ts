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
  /** Emoji grande de portada (placeholder visual hasta tener imágenes). */
  emoji?: string;
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
    lectura: 5,
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
    emoji: "📉",
    lectura: 6,
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "RESICO (Régimen Simplificado de Confianza) es uno de los regímenes más atractivos para personas físicas con actividad empresarial y profesional, porque maneja tasas de ISR muy bajas comparadas con el régimen general.",
      },
      { tipo: "subtitulo", texto: "¿A quién le conviene?" },
      {
        tipo: "lista",
        items: [
          "Personas físicas con ingresos de hasta 3.5 millones de pesos al año.",
          "Quienes facturan servicios o venden productos y quieren simplificar.",
          "Profesionistas independientes que hoy pagan de más en el régimen general.",
        ],
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "Ojo con los requisitos",
        texto:
          "No todos pueden entrar a RESICO: hay exclusiones (socios de empresas, ciertos ingresos por asimilados, etc.). Antes de cambiarte, conviene revisar tu caso con un contador.",
      },
      {
        tipo: "cita",
        texto:
          "Cambiar de régimen sin analizar tus números puede costarte más de lo que ahorras. Vale la pena hacer cuentas antes.",
        autor: "Aaron Rosales, RDC Contadores",
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
