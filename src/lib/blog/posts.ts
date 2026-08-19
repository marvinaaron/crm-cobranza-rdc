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
      tipo: "faq";
      titulo?: string;
      items: { pregunta: string; respuesta: string }[];
    }
  | {
      /**
       * Bloque interactivo/animado embebido en el artículo. Cada `variante`
       * la dibuja un componente cliente dedicado en `BlogContenido`.
       */
      tipo: "mock";
      variante:
        | "opinion-cumplimiento"
        | "vencimiento-declaracion"
        | "efirma-vigente";
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
  /**
   * Segunda herramienta en el sidebar, típicamente un paso previo
   * (ej. calculadora de RFC antes de la de vencimiento).
   */
  herramientaComplementaria?: {
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
    slug: "eliminar-multas-recargos-sat-anos-anteriores",
    titulo:
      "¿Quieres ponerte al corriente? Cómo eliminar hasta el 100% de multas y recargos del SAT de años anteriores",
    tituloSeo: "Eliminar hasta 100% de multas y recargos SAT | RDC",
    resumen:
      "Si arrastras impuestos de 2024 y años anteriores, el SAT puede reducir hasta el 100% de multas y recargos. Te explicamos el filtro de años, el plazo de 15 días y la estrategia para usar tus saldos a favor.",
    categoria: "impuestos",
    tags: [
      "regularización fiscal",
      "multas SAT",
      "recargos",
      "condonación",
      "saldo a favor",
      "opinión de cumplimiento",
      "créditos fiscales",
      "e.firma",
      "declaraciones complementarias",
    ],
    fecha: "2026-08-19",
    actualizado: "2026-08-19",
    emoji: "⚖️",
    portada: "/blog/portada-regularizacion-fiscal.jpg",
    portadaAlt:
      "Ilustración de un contribuyente revisando su historial fiscal con carpetas de años anteriores, un sello de regularización y una balanza.",
    lectura: 7,
    destacado: true,
    herramienta: {
      eyebrow: "Diagnóstico",
      titulo: "Agenda tu regularización",
      descripcion:
        "Auditamos tu historial, ordenamos las declaraciones y aplicamos la reducción de multas y recargos ante el SAT.",
      etiquetaBoton: "Quiero ponerme al corriente",
      href: "/contacto",
    },
    herramientaComplementaria: {
      eyebrow: "Cumplimiento",
      titulo: "Opinión en positiva",
      descripcion:
        "El objetivo no es solo pagar: es recuperar tu opinión de cumplimiento para contratar, cobrar y dormir tranquilo.",
      etiquetaBoton: "Cómo se ve una opinión positiva",
      href: "/blog/opinion-de-cumplimiento-publica-que-es",
    },
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "Si cada vez que ves un correo del SAT se te encoge el estómago, no estás solo. Arrastrar **créditos fiscales** y declaraciones omitidas no es pereza: es una bola de nieve. Llega la multa, luego los recargos, y el miedo se vuelve concreto: **cuentas congeladas**, embargo y una opinión de cumplimiento en negativa que te cierra contratos.",
      },
      {
        tipo: "parrafo",
        texto:
          "La buena noticia es que **sí hay una ventana para ponerte al corriente** sin pagar el costo completo del atraso. La mala —y hay que decirla con claridad— es que no es un botón mágico ni aplica para todo lo que debes hoy.",
      },
      {
        tipo: "subtitulo",
        texto: "Filtro de temporalidad: 2024 hacia atrás, no el 2026 en curso",
      },
      {
        tipo: "parrafo",
        texto:
          "Este es el dato que más dinero te puede costar si lo ignoras. La **reducción de multas, recargos y gastos de ejecución aplica únicamente a adeudos del ejercicio 2024 y de años anteriores**. El SAT aligera el pasado; no subsidia el presente.",
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "No aplica al ejercicio 2026",
        texto:
          "Esta facilidad **no cubre pagos provisionales, declaraciones ni obligaciones del ejercicio 2026 en curso**. Lo de este año se declara y se paga en tiempo. Si mezclas el atraso viejo con lo vigente, el SAT no te “perdona” el 2026 y puede trabarte el beneficio de lo anterior.",
      },
      {
        tipo: "subtitulo",
        texto: "Qué sí te reducen (y qué sí tienes que pagar)",
      },
      {
        tipo: "parrafo",
        texto:
          "El beneficio es potente, pero hay que precisarlo. La autoridad puede reducir **hasta el 100% de las multas, los recargos y los gastos de ejecución**. Eso es el castigo del atraso, no el impuesto.",
      },
      {
        tipo: "lista",
        items: [
          "**Lo que sí se puede reducir hasta en 100%:** multas, recargos y gastos de ejecución ligados a adeudos de **2024 y años anteriores**.",
          "**Lo que sí debes liquidar:** el **impuesto histórico** (la contribución omitida) y su **actualización** por inflación. Eso no desaparece.",
          "**El reloj del pago:** una vez que el SAT te emite la **línea de captura**, tienes **15 días hábiles** para pagarla. Si se te vence, el beneficio se cae y vuelves al escenario caro.",
        ],
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "Piensa en dos columnas",
        texto:
          "Columna A: el impuesto que siempre debiste (más actualización). Columna B: el recargo y la multa. El programa ataca la columna B. Quien te diga que “no vas a pagar nada” te está vendiendo una historia incompleta.",
      },
      {
        tipo: "subtitulo",
        texto: "Requisito operativo: e.firma vigente",
      },
      {
        tipo: "cita",
        texto:
          "Sin e.firma vigente no hay regularización: no puedes firmar complementarias, compensar saldos a favor ni concluir el trámite ante el SAT. Renueva el certificado antes de mover un solo ejercicio.",
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "Advertencia operativa",
        texto:
          "La **e.firma (firma electrónica / FIEL) tiene que estar vigente**. Es el candado de todo el proceso: declaraciones complementarias, compensación de saldos a favor y la solicitud de reducción de multas y recargos. Si está vencida, el SAT no te deja firmar. Si vence a mitad del trámite, se te cae la secuencia. Revisa la fecha del .cer **antes** de presentar el primer año.",
      },
      {
        tipo: "mock",
        variante: "efirma-vigente",
        titulo: "Así se ve un certificado listo para regularizar",
        pie: "Mock ilustrativo. En el portal de RDC te avisamos cuando tu e.firma está por vencer.",
      },
      {
        tipo: "subtitulo",
        texto: "La estrategia fiscal: el orden cronológico es la regla de oro",
      },
      {
        tipo: "parrafo",
        texto:
          "Regularizarte no es subir declaraciones al azar ni empezar por el año que más te urge. Exige una **verdadera estrategia fiscal**: reconstruir el historial y presentarlo en la **secuencia que el SAT va a cruzar**.",
      },
      {
        tipo: "parrafo",
        texto:
          "La **regla de oro** es simple y no negociable: se declara en **estricto orden cronológico**, del año más antiguo al más reciente. 2021, luego 2022, luego 2023, luego 2024. No al revés. No “el que más duele primero”.",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "Por qué el orden no es burocracia",
        texto:
          "El SAT cruza ejercicios. Si presentas 2024 antes de cerrar 2022, el sistema ve un salto. Ese salto se traduce en **rechazo de devoluciones**, compensaciones observadas y una opinión de cumplimiento que no se limpia aunque hayas pagado “algo”.",
      },
      {
        tipo: "subtitulo",
        texto: "El as bajo la manga: tus saldos a favor",
      },
      {
        tipo: "parrafo",
        texto:
          "Declarar en orden no es solo “quedar bien”. Es la forma limpia de usar lo que el SAT **ya te debe**. Si en 2022 te quedó un **saldo a favor**, ese saldo puede **amortizar o cancelar** el impuesto de 2023 o 2024. Puedes regularizarte **sin desembolsar todo en efectivo**.",
      },
      {
        tipo: "lista",
        items: [
          "Ejemplo: saldo a favor en **2022** + impuesto a cargo en **2023** → el primero puede absorber el segundo si ambos ejercicios están declarados y enlazados en secuencia.",
          "Si declaras 2023 primero y 2022 después, el SAT ve **inconsistencia**: te cobra el 2023 en efectivo y, encima, te observa o te niega la compensación del 2022.",
          "El desorden no solo te cuesta dinero: te cuesta **tiempo** y meses con la opinión en negativa.",
        ],
      },
      {
        tipo: "cita",
        texto:
          "Ponerse al corriente no es un pago. Es una secuencia. El que declara en desorden paga dos veces: una al SAT y otra en oportunidades perdidas.",
        autor: "RD Contadores",
      },
      {
        tipo: "subtitulo",
        texto: "Cómo lo resolvemos en RD Contadores",
      },
      {
        tipo: "parrafo",
        texto:
          "En **RD Contadores** no empezamos por la línea de captura: empezamos por tu historia. Auditamos el **historial fiscal** y diseñamos la **secuencia cronológica** que el SAT acepta. Recuperas la **Opinión de Cumplimiento en positiva** y aplicamos la reducción de multas y recargos en los ejercicios que sí califican (2024 y anteriores).",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Diagnóstico: qué ejercicios están sucios, cuáles tienen saldo a favor y cuáles sí entran a la reducción.",
          "Estrategia: orden de presentación, compensación de saldos y monto real a desembolsar (impuesto + actualización).",
          "Ejecución ante el SAT: declaraciones, línea de captura y seguimiento de los **15 días hábiles** para que el beneficio no se caiga.",
        ],
      },
      {
        tipo: "faq",
        titulo: "Preguntas frecuentes sobre la regularización fiscal",
        items: [
          {
            pregunta: "¿El SAT me va a auditar si pido este beneficio?",
            respuesta:
              "Pedir la reducción **no dispara una auditoría por sí sola**. El SAT ya tiene tus CFDI, tus declaraciones y tus omisiones. Lo que sí eleva el riesgo es presentarte **sin estrategia**: complementarias en desorden, saldos que no cuadran y un 2026 mezclado con años viejos. Una secuencia limpia reduce inconsistencias; el desorden es lo que enciende revisiones.",
          },
          {
            pregunta: "¿Puedo usar saldos a favor de 2026 para pagar deudas pasadas?",
            respuesta:
              "**No.** El 2026 sigue en curso: no es un ejercicio cerrado que puedas usar como “caja” contra 2023 o 2024. La reducción y la compensación ordenada aplican a **2024 y años anteriores**. Un saldo a favor de 2022 sí puede absorber un impuesto viejo si declaras en orden cronológico. Mezclar el año actual con deudas pasadas es el error más caro.",
          },
          {
            pregunta: "¿Cuánto tarda el SAT en responder la solicitud de reducción?",
            respuesta:
              "El plazo que sí controlas —y el que tumba el beneficio— son los **15 días hábiles** para pagar la **línea de captura** una vez emitida. La autoridad puede tardar en generar esa línea; lo que no puedes hacer es dejarla vencer. Por eso la estrategia incluye tener la e.firma lista y el dinero (o la compensación) amarrados **antes** de disparar la solicitud.",
          },
          {
            pregunta: "¿Qué riesgo corro si declaro mis años pasados en desorden?",
            respuesta:
              "El SAT rechaza **devoluciones y compensaciones** por inconsistencia, tu opinión de cumplimiento no limpia y terminas pagando en efectivo un impuesto que podías absorber con un saldo a favor. Declarar “el año que más duele” primero no acelera nada: **rompe la cadena**. El orden cronológico no es burocracia; es la única forma de que el beneficio y los saldos a favor sí te cuenten.",
          },
        ],
      },
      {
        tipo: "cta",
        texto:
          "Si arrastras años anteriores y quieres saber cuánto pagarías de verdad —y cuánto de multa y recargo se puede ir a cero— agenda un diagnóstico de regularización. Lo vemos juntos, en orden, y sin sorpresas.",
        etiquetaBoton: "Agendar diagnóstico de regularización",
        href: "/contacto",
      },
    ],
  },
  {
    slug: "cuando-vence-mi-declaracion-segun-rfc",
    titulo:
      "¿Cuándo vence mi declaración? El calendario del SAT explicado con tu RFC",
    tituloSeo:
      "Vencimiento de declaración mensual según RFC | Calendario SAT | RDC",
    resumen:
      "No todos vencen el día 17: el SAT suma días según el 6º dígito de tu RFC y recorre fines de semana. Te lo explicamos fácil y calcula tu fecha exacta gratis.",
    categoria: "impuestos",
    tags: [
      "vencimiento declaración",
      "calendario fiscal",
      "RFC",
      "SAT",
      "ISR",
      "IVA",
      "días hábiles",
    ],
    fecha: "2026-06-15",
    actualizado: "2026-06-15",
    emoji: "📅",
    portada: "/blog/portada-vencimiento-declaracion.jpg",
    portadaAlt:
      "Ilustración de un calendario fiscal con el día 17 resaltado, un RFC con el sexto dígito brillando y flechas que muestran días hábiles adicionales.",
    lectura: 8,
    destacado: true,
    herramientaComplementaria: {
      eyebrow: "Paso 1",
      titulo: "¿No sabes tu RFC?",
      descripcion:
        "Consúltalo gratis con la Calculadora de RFC: captura tu nombre y fecha de nacimiento y obtén tu clave con homoclave al instante.",
      etiquetaBoton: "Calcular mi RFC",
      href: "/herramientas/rfc",
    },
    herramienta: {
      eyebrow: "Paso 2",
      titulo: "Tu fecha exacta en 10 segundos",
      descripcion:
        "Ingresa tu RFC, elige mes y año del periodo y obtén el vencimiento de tu declaración mensual con desglose paso a paso.",
      etiquetaBoton: "Abrir calculadora",
      href: "/herramientas/vencimiento-declaracion",
    },
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "“¿Hasta cuándo tengo para declarar?” Es una de las preguntas que más nos hacen — y la respuesta corta es: depende de tu RFC. No es capricho del SAT: es un calendario escalonado para que no todos los contribuyentes de México paguen el mismo día. Aquí te explicamos la regla en simple, qué pasa si cae en fin de semana y, al final, una calculadora para que veas tu fecha exacta sin adivinar.",
      },
      { tipo: "subtitulo", texto: "La regla de oro: día 17 + tu RFC" },
      {
        tipo: "parrafo",
        texto:
          "Para la declaración mensual de ISR e IVA, el SAT fija como punto de partida el día 17 del mes siguiente al periodo que declaras. Si vas a declarar abril, tu plazo empieza en mayo. Pero ahí no termina: al 17 se le suman días hábiles según el sexto dígito numérico de tu RFC (no la homoclave, sino el sexto número contando desde el inicio del RFC).",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "¿Dónde está el 6º dígito?",
        texto:
          "En un RFC de persona física como LOMA900315AB1, los números son 900315. El sexto dígito es el 5 (el último del bloque de fecha). En personas morales funciona igual: cuenta los seis primeros dígitos numéricos del RFC.",
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "¿Aún no tienes tu RFC a la mano?",
        texto:
          "No pasa nada. En el lateral del artículo (o justo debajo del campo RFC en la calculadora) tienes la Calculadora de RFC gratis: con tu nombre y fecha de nacimiento obtienes tu clave con homoclave en segundos, 100% privado.",
      },
      { tipo: "subtitulo", texto: "Cuántos días te suman según tu RFC" },
      {
        tipo: "tabla",
        encabezados: ["Si tu 6º dígito termina en…", "Días hábiles que se suman al 17"],
        filas: [
          ["1 o 2", "+ 1 día hábil"],
          ["3 o 4", "+ 2 días hábiles"],
          ["5 o 6", "+ 3 días hábiles"],
          ["7 u 8", "+ 4 días hábiles"],
          ["9 o 0", "+ 5 días hábiles"],
        ],
        pie: "Regla de vencimiento mensual ISR/IVA personas físicas y morales en el régimen general.",
      },
      {
        tipo: "parrafo",
        texto:
          "Ejemplo rápido: si tu sexto dígito es 5, al 17 de mayo le sumas 3 días hábiles. Si el 17 cae en sábado, primero cuentas los días hábiles y después, si hace falta, aplicas el recorrido por fin de semana que veremos abajo.",
      },
      { tipo: "subtitulo", texto: "¿Y si cae en sábado o domingo?" },
      {
        tipo: "parrafo",
        texto:
          "Cuando la fecha resultante cae en fin de semana, el vencimiento se recorre al lunes inmediato siguiente. Es la regla que usa el SAT para declaraciones mensuales federales: no te “regalan” el viernes ni te castigan con el sábado; simplemente saltan al siguiente día hábil de la semana.",
      },
      {
        tipo: "lista",
        items: [
          "Sábado → vence el lunes siguiente.",
          "Domingo → vence el lunes siguiente.",
          "Los días hábiles que suma tu RFC no incluyen sábados, domingos ni festivos oficiales.",
        ],
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "Ojo con los festivos",
        texto:
          "Además del fin de semana, hay días inhábiles oficiales (1° de enero, 1° de mayo, 16 de septiembre, 25 de diciembre, etc.). En otras obligaciones —como algunos pagos estatales— el recorrido también considera festivos. Para la declaración mensual federal la regla principal que aplicas es fin de semana → lunes.",
      },
      { tipo: "subtitulo", texto: "Ejemplo completo paso a paso" },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Periodo a declarar: marzo 2026 → el plazo corre en abril 2026.",
          "Fecha base: 17 de abril de 2026.",
          "RFC con sexto dígito 2 → sumas 1 día hábil → 20 de abril (si el 18 es inhábil, se salta).",
          "Si el resultado fuera sábado 18, el vencimiento pasa al lunes 20.",
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Calcula tu vencimiento ahora (en vivo)",
      },
      {
        tipo: "parrafo",
        texto:
          "No necesitas Excel ni tablas del SAT. Escribe tu RFC, elige el mes y año del periodo que vas a declarar y la herramienta te muestra la fecha exacta con el desglose. Pruébala aquí 👇",
      },
      {
        tipo: "mock",
        variante: "vencimiento-declaracion",
        titulo: "Calculadora · Vencimiento Impuestos",
        pie: "Cálculo informativo en tu navegador. No guardamos tu RFC.",
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "¿Eres cliente RDC?",
        texto:
          "En tu portal del cliente el calendario fiscal ya trae tus fechas calculadas con tu RFC, con recordatorios y tus acuses en un solo lugar.",
      },
      {
        tipo: "cta",
        texto:
          "Guarda la calculadora en favoritos o compártela con tu equipo: siempre está gratis.",
        etiquetaBoton: "Abrir calculadora completa",
        href: "/herramientas/vencimiento-declaracion",
      },
    ],
  },
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
    slug: "que-es-el-salario-diario-integrado-sdi-2026",
    titulo:
      "Qué es el Salario Diario Integrado (SDI) 2026 en México",
    tituloSeo:
      "Salario Diario Integrado (SDI) 2026: qué es y cómo calcularlo | RDC",
    resumen:
      "El SDI es la base para calcular cuotas al IMSS, Infonavit e indemnizaciones. Te explicamos qué incluye, cómo se calcula paso a paso, la tabla del factor de integración y los errores más comunes.",
    categoria: "nomina",
    tags: [
      "SDI",
      "salario diario integrado",
      "IMSS",
      "Infonavit",
      "nómina",
      "factor de integración",
      "prestaciones laborales",
      "salario mínimo 2026",
    ],
    fecha: "2026-07-03",
    actualizado: "2026-07-03",
    emoji: "💰",
    portada: "/blog/portada-sdi.jpg",
    portadaAlt:
      "Ilustración de un recibo de nómina con calculadora, mapa de México, trabajadores y el escudo del IMSS, representando el Salario Diario Integrado.",
    lectura: 10,
    herramienta: {
      eyebrow: "Calcula gratis",
      titulo: "Calculadora de SDI",
      descripcion:
        "Ingresa tu salario mensual o diario, selecciona tus años de antigüedad y obtén tu Salario Diario Integrado al instante.",
      etiquetaBoton: "Calcular mi SDI",
      href: "/herramientas/salario-diario-integrado",
    },
    herramientaComplementaria: {
      eyebrow: "Complemento",
      titulo: "Calculadora de Prima Vacacional",
      descripcion:
        "Calcula cuánto te corresponde de prima vacacional según tu salario y días de vacaciones.",
      etiquetaBoton: "Calcular prima vacacional",
      href: "/herramientas/prima-vacacional",
    },
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "Si estás a cargo de gestionar la nómina de empleados en México, es importante que conozcas el Salario Diario Integrado (SDI) para asegurar el cumplimiento legal y una adecuada administración del talento. Este concepto impacta directamente en las aportaciones al Instituto Mexicano del Seguro Social (IMSS), las prestaciones laborales y en la relación con tus colaboradores.",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "Puntos clave",
        texto:
          "El SDI está compuesto por el salario base más las prestaciones mínimas de ley (aguinaldo, vacaciones y prima vacacional). El SDI mínimo en 2026 es de $330.53 pesos diarios. Se calcula multiplicando tu salario diario por el factor de integración.",
      },
      { tipo: "subtitulo", texto: "¿Qué es el Salario Diario Integrado o SDI en México?" },
      {
        tipo: "parrafo",
        texto:
          "El Salario Diario Integrado es un concepto clave en la gestión de nómina, ya que representa el salario base diario de un trabajador más el valor de determinadas prestaciones que recibe, como aguinaldo, vacaciones, prima vacacional, bonos y otras compensaciones. Su cálculo es fundamental para determinar las aportaciones ante el IMSS y al Instituto del Fondo Nacional de la Vivienda para los Trabajadores (Infonavit).",
      },
      { tipo: "subtitulo", texto: "¿Por qué es importante conocer el SDI?" },
      {
        tipo: "parrafo",
        texto:
          "Para una gestión financiera y laboral eficiente, comprender el SDI es esencial. No solo permite llevar una contabilidad precisa y alineada con la normativa, sino que también garantiza el cumplimiento de las obligaciones legales. Además, el SDI cobra importancia en situaciones como la liquidación: los pagos por indemnización (los tres meses de salario que establece la ley) se calculan con base en el SDI, no sobre el salario diario simple.",
      },
      {
        tipo: "lista",
        items: [
          "Determinar el monto de las cuotas obrero-patronales al IMSS y aportaciones al Infonavit.",
          "Establecer la capacidad de crédito del trabajador ante el Infonavit.",
          "Calcular correctamente el pago de indemnizaciones por despido o liquidación.",
          "Evitar errores en el cálculo de cuotas y contribuciones.",
          "Cumplir con la Ley del Seguro Social y la Ley Federal del Trabajo.",
        ],
      },
      { tipo: "subtitulo", texto: "Diferencia entre salario diario y salario diario integrado" },
      {
        tipo: "parrafo",
        texto:
          "La diferencia entre Salario Diario y SDI radica en que el primero consiste en la cuota diaria que percibe el trabajador por el desempeño de sus labores; en cambio, el SDI es la suma de dichas percepciones salariales y las prestaciones de ley que recibe. Tales prestaciones pueden ser las mínimas obligatorias (como el aguinaldo) o las \"superiores a las de ley\", por ejemplo, los bonos de productividad.",
      },
      { tipo: "subtitulo", texto: "¿Qué se incluye en el SDI?" },
      {
        tipo: "lista",
        items: [
          "Aguinaldo (mínimo 15 días de salario por cada año trabajado).",
          "Vacaciones (al menos 12 días por año, con aumento progresivo por antigüedad).",
          "Prima vacacional (equivalente al 25% del salario correspondiente a los días de vacaciones).",
          "Vales de despensa (un porcentaje del salario mínimo).",
          "Bonos de productividad y gratificaciones adicionales.",
          "Subsidio de transporte o alimentos.",
        ],
      },
      { tipo: "subtitulo", texto: "¿Qué NO se incluye en el SDI?" },
      {
        tipo: "lista",
        items: [
          "Prestaciones sindicales.",
          "Cuotas al IMSS o Infonavit.",
          "Fondo de ahorro.",
          "Reparto de utilidades (PTU).",
          "Aportaciones a planes de pensiones.",
          "Viáticos comprobados.",
        ],
      },
      { tipo: "subtitulo", texto: "¿Cuál es el SDI mínimo en 2026?" },
      {
        tipo: "parrafo",
        texto:
          "Con el incremento del 12% al salario mínimo, en 2026 el salario mínimo general es de $315.04 pesos diarios y el de la Zona Libre de la Frontera Norte es de $440.87 pesos diarios. Aplicando el factor de integración mínimo de 1.0493 (primer año de antigüedad, prestaciones mínimas de ley), el SDI mínimo en 2026 es de $330.53 pesos diarios para la zona general.",
      },
      { tipo: "subtitulo", texto: "¿Cómo se calcula el Salario Diario Integrado?" },
      {
        tipo: "parrafo",
        texto:
          "El cálculo del SDI se realiza en 3 pasos sencillos:",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Calcular el salario diario base: divide el salario mensual entre 30 días. Por ejemplo, si ganas $15,000 al mes: $15,000 ÷ 30 = $500 diarios.",
          "Calcular el factor de integración: Factor = (365 + días de aguinaldo + (días de vacaciones × prima vacacional)) ÷ 365. Para un trabajador con 15 días de aguinaldo, 12 días de vacaciones y prima vacacional del 25%: Factor = (365 + 15 + (12 × 0.25)) ÷ 365 = 383 ÷ 365 = 1.0493.",
          "Multiplicar el salario diario por el factor: $500 × 1.0493 = $524.65. Ese es tu Salario Diario Integrado.",
        ],
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "¿No quieres hacer cuentas a mano?",
        texto:
          "Usa nuestra Calculadora de SDI: ingresa tu salario, selecciona tu antigüedad y obtén el resultado al instante. Gratis y sin registro.",
      },
      { tipo: "subtitulo", texto: "Ejemplo: trabajador con 5 años de antigüedad" },
      {
        tipo: "parrafo",
        texto: "Supongamos un trabajador con salario mensual de $30,000 y 5 años de antigüedad:",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Salario diario: $30,000 ÷ 30 = $1,000 diarios.",
          "Factor de integración: (365 + 15 + (20 × 0.25)) ÷ 365 = (365 + 15 + 5) ÷ 365 = 385 ÷ 365 = 1.0548.",
          "SDI: $1,000 × 1.0548 = $1,054.80.",
        ],
      },
      { tipo: "subtitulo", texto: "Tabla del factor de integración para el cálculo del SDI" },
      {
        tipo: "parrafo",
        texto:
          "Esta tabla te permite obtener el factor de integración de forma directa según los años de antigüedad del trabajador, con las prestaciones mínimas de ley (15 días de aguinaldo y 25% de prima vacacional):",
      },
      {
        tipo: "tabla",
        encabezados: ["Años de antigüedad", "Días de aguinaldo", "Días de vacaciones", "% Prima vacacional", "Factor de integración"],
        alinearDerecha: [1, 2, 3, 4],
        filas: [
          ["1 año", "15", "12", "25%", "1.0493"],
          ["2 años", "15", "14", "25%", "1.0507"],
          ["3 años", "15", "16", "25%", "1.0521"],
          ["4 años", "15", "18", "25%", "1.0534"],
          ["5 años", "15", "20", "25%", "1.0548"],
          ["6-10 años", "15", "22", "25%", "1.0562"],
          ["11-15 años", "15", "24", "25%", "1.0575"],
          ["16-20 años", "15", "26", "25%", "1.0589"],
          ["21-25 años", "15", "28", "25%", "1.0603"],
          ["26-30 años", "15", "30", "25%", "1.0616"],
          ["31-35 años", "15", "32", "25%", "1.0630"],
        ],
        pie: "Factor mínimo de ley. Si tu empresa otorga prestaciones superiores (más días de aguinaldo, prima vacacional mayor), el factor será más alto. Fuente: Ley del Seguro Social y Ley Federal del Trabajo.",
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "Revisa tu contrato laboral",
        texto:
          "El factor de integración puede variar si tu empresa otorga prestaciones superiores a las de ley. Revisa tu contrato laboral o pregunta a Recursos Humanos para conocer exactamente tus días de aguinaldo, vacaciones y porcentaje de prima vacacional.",
      },
      { tipo: "subtitulo", texto: "Tabla de vacaciones por años trabajados (LFT 2026)" },
      {
        tipo: "parrafo",
        texto:
          "Con la reforma a la Ley Federal del Trabajo, los días de vacaciones se incrementaron significativamente. Esta tabla te muestra los días que te corresponden según tu antigüedad:",
      },
      {
        tipo: "tabla",
        encabezados: ["Años trabajados", "Días de vacaciones"],
        alinearDerecha: [1],
        filas: [
          ["1 año", "12 días"],
          ["2 años", "14 días"],
          ["3 años", "16 días"],
          ["4 años", "18 días"],
          ["5 años", "20 días"],
          ["6-10 años", "22 días"],
          ["11-15 años", "24 días"],
          ["16-20 años", "26 días"],
          ["21-25 años", "28 días"],
          ["26-30 años", "30 días"],
          ["31-35 años", "32 días"],
        ],
        pie: "Fuente: Artículo 76 de la Ley Federal del Trabajo reformado.",
      },
      { tipo: "subtitulo", texto: "4 errores comunes al calcular el SDI" },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Considerar solo el sueldo base y olvidar integrar las proporciones diarias de prestaciones de ley como el aguinaldo (mínimo 15 días) y la prima vacacional (mínimo 25% de las vacaciones).",
          "No ajustar el cálculo cuando el trabajador recibe un aumento salarial, una promoción o cuando cambia su antigüedad. El SDI debe recalcularse al cambiar cualquiera de estos factores.",
          "Incluir en el cálculo pagos que la ley del IMSS excluye de la integración, como viáticos comprobados, fondos de ahorro o ciertos vales de despensa. Esto hace que el patrón pague cuotas más altas de lo necesario.",
          "No actualizar el factor de integración cuando los días de vacaciones cambian por antigüedad. Cada aniversario laboral puede modificar el factor.",
        ],
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "Errores en el SDI = multas del IMSS",
        texto:
          "Calcular incorrectamente el SDI conlleva el pago de cuotas de seguridad social incorrectas, lo que resulta en multas del IMSS e Infonavit. Asegúrate de mantenerlo actualizado.",
      },
      {
        tipo: "cita",
        texto:
          "El SDI no es un número que calculas una vez y olvidas. Cada aumento, cada aniversario laboral, cada cambio en prestaciones debe reflejarse. Es la base de la seguridad social de tus trabajadores.",
        autor: "Aaron Rosales, RDC Contadores",
      },
      {
        tipo: "cta",
        texto:
          "Calcula tu Salario Diario Integrado al instante con nuestra herramienta gratuita.",
        etiquetaBoton: "Abrir calculadora de SDI",
        href: "/herramientas/salario-diario-integrado",
      },
      {
        tipo: "cta",
        texto:
          "¿Necesitas ayuda con la nómina de tu empresa? Nosotros calculamos y timbrandos tus recibos sin errores.",
        etiquetaBoton: "Hablar con un asesor",
        href: "/contacto",
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
  {
    slug: "como-crear-una-empresa-en-mexico-2026",
    titulo: "Cómo crear una empresa en México en 2026: Guía completa",
    tituloSeo:
      "Cómo crear una empresa en México 2026 | SAS, SA, SAPI | Guía paso a paso | RDC",
    resumen:
      "¿Quieres formalizar tu negocio? Conoce los tipos de sociedades mercantiles en México, cómo constituir una SAS en 24 horas sin notario, requisitos fiscales, costos y los errores más comunes al emprender.",
    categoria: "pymes",
    tags: [
      "empresa",
      "SAS",
      "sociedad mercantil",
      "emprender",
      "constitución",
      "SAT",
      "persona moral",
    ],
    fecha: "2026-07-03",
    actualizado: "2026-07-03",
    emoji: "🏢",
    portada: "/blog/portada-crear-empresa.jpg",
    portadaAlt:
      "Ilustración de un emprendedor firmando el acta constitutiva de su empresa frente a una laptop con el portal gob.mx, con la bandera de México y el Palacio de Bellas Artes al fondo.",
    lectura: 12,
    herramienta: {
      eyebrow: "HERRAMIENTA",
      titulo: "Calcula tu RFC gratis",
      descripcion:
        "Antes de constituir tu empresa necesitas tu RFC. Calcula el tuyo en segundos.",
      etiquetaBoton: "Calcular RFC",
      href: "/herramientas/rfc",
    },
    contenido: [
      {
        tipo: "parrafo",
        texto:
          "México es uno de los países más atractivos de Latinoamérica para emprender. Con una economía diversificada, tratados comerciales con más de 50 países y un ecosistema emprendedor en crecimiento, formalizar tu negocio es una decisión que puede abrirte puertas a financiamiento, contratos gubernamentales, proveedores más grandes y, sobre todo, certeza jurídica.",
      },
      {
        tipo: "parrafo",
        texto:
          "En esta guía te explicamos paso a paso cómo crear una empresa en México en 2026: desde elegir el tipo de sociedad mercantil adecuada, hasta darte de alta en el SAT y abrir tu cuenta bancaria empresarial.",
      },
      {
        tipo: "subtitulo",
        texto: "¿Persona física o persona moral?",
      },
      {
        tipo: "parrafo",
        texto:
          "Antes de elegir un tipo de sociedad, es importante entender la diferencia fundamental. Como persona física puedes operar tu negocio directamente bajo regímenes como RESICO o Actividades Empresariales, pero tu patrimonio personal responde por las deudas del negocio. Al constituir una persona moral (empresa), creas una entidad legal separada: tu responsabilidad se limita a lo que aportaste como capital y tu patrimonio personal queda protegido.",
      },
      {
        tipo: "callout",
        variante: "tip",
        titulo: "¿Cuándo conviene crear una empresa?",
        texto:
          "Si facturas más de $3.5 millones al año, tienes socios, necesitas acceder a licitaciones o quieres separar tu patrimonio personal del negocio, constituir una persona moral es la mejor decisión.",
      },
      {
        tipo: "subtitulo",
        texto: "Tipos de sociedades mercantiles en México",
      },
      {
        tipo: "parrafo",
        texto:
          "La Ley General de Sociedades Mercantiles reconoce varios tipos de sociedades. Las más comunes para emprendedores y PyMEs son:",
      },
      {
        tipo: "tabla",
        encabezados: [
          "Tipo de sociedad",
          "Abreviatura",
          "Capital mínimo",
          "Socios mín.",
          "Notario requerido",
          "Ideal para",
        ],
        filas: [
          [
            "Sociedad por Acciones Simplificada",
            "SAS",
            "Desde $1 MXN",
            "1",
            "No",
            "Micro y pequeñas empresas",
          ],
          [
            "Sociedad Anónima",
            "SA",
            "$50,000 MXN",
            "2",
            "Sí",
            "Empresas medianas y grandes",
          ],
          [
            "Sociedad Anónima Promotora de Inversión",
            "SAPI",
            "$50,000 MXN",
            "2",
            "Sí",
            "Startups con inversionistas",
          ],
          [
            "Sociedad de Responsabilidad Limitada",
            "S. de R.L.",
            "$3,000 MXN",
            "2",
            "Sí",
            "Negocios familiares",
          ],
          [
            "Sociedad Anónima de Capital Variable",
            "SA de CV",
            "$50,000 MXN",
            "2",
            "Sí",
            "La más usada en México",
          ],
        ],
        pie: "Fuente: Ley General de Sociedades Mercantiles y portal gob.mx/tuempresa.",
      },
      {
        tipo: "subtitulo",
        texto: "La Sociedad por Acciones Simplificada (SAS): tu empresa en 24 horas",
      },
      {
        tipo: "parrafo",
        texto:
          "La SAS es la opción más ágil y económica para emprendedores en México. Fue creada en 2016 precisamente para eliminar la informalidad y simplificar la constitución de micro y pequeñas empresas. Su gran ventaja: se constituye 100% en línea, sin notario, sin costo y en menos de 24 horas.",
      },
      {
        tipo: "subtitulo",
        texto: "Características principales de la SAS",
      },
      {
        tipo: "lista",
        estilo: "vinetas",
        items: [
          "Puedes constituirla con un solo socio (persona física). Es el único régimen que lo permite.",
          "El capital social puede ser desde $1 peso mexicano.",
          "No necesitas acudir a un notario ni corredor público.",
          "Los ingresos anuales no pueden superar los 5 millones de pesos (cifra actualizable en el DOF).",
          "Los accionistas tienen responsabilidad limitada: solo responden hasta el monto de sus aportaciones.",
          "Si superas el límite de ingresos, debes transformarte a otro tipo de sociedad.",
          "Se inscribe automáticamente en RESICO (Régimen Simplificado de Confianza).",
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Requisitos para constituir una SAS",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Firma electrónica (e.firma) vigente de todos los accionistas.",
          "Que al menos un accionista cuente con la autorización de la denominación social (se obtiene en línea en el portal tuempresa.gob.mx).",
          "Los accionistas no pueden ser administradores o accionistas mayoritarios de otra sociedad mercantil.",
          "Dar consentimiento electrónico a los estatutos sociales que proporciona la Secretaría de Economía.",
        ],
      },
      {
        tipo: "callout",
        variante: "info",
        titulo: "¿No tienes e.firma?",
        texto:
          "La e.firma (antes FIEL) se tramita presencialmente en las oficinas del SAT. Necesitas una cita previa, tu INE vigente, CURP y comprobante de domicilio. El trámite toma aproximadamente 30 minutos y es gratuito.",
      },
      {
        tipo: "subtitulo",
        texto: "Paso a paso: cómo constituir tu SAS en línea",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Ingresa al portal tuempresa.gob.mx y solicita la autorización de tu nombre comercial (denominación social).",
          "Una vez aprobado el nombre, ingresa al sistema electrónico de constitución de SAS en el mismo portal.",
          "Completa los estatutos sociales con los datos de los accionistas, domicilio, objeto social y capital.",
          "Todos los accionistas firman electrónicamente con su e.firma.",
          "El sistema genera el contrato social y lo envía automáticamente al Registro Público de Comercio.",
          "Recibes digitalmente tu acta constitutiva inscrita.",
          "Automáticamente se genera tu alta en el RFC como persona moral.",
          "Opcionalmente, tramita tu e.firma como empresa y da de alta tu cuenta bancaria empresarial.",
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Obligaciones de una SAS",
      },
      {
        tipo: "parrafo",
        texto:
          "Una vez constituida, tu SAS debe cumplir con obligaciones específicas para mantenerse en regla:",
      },
      {
        tipo: "lista",
        estilo: "vinetas",
        items: [
          "Publicar en el Sistema Electrónico de Publicaciones de Sociedades Mercantiles los contratos celebrados entre el accionista único y la sociedad.",
          "Publicar el aviso cuando se haya suscrito y pagado la totalidad del capital social.",
          "Llevar el libro de registro de acciones de la sociedad.",
          "Publicar la convocatoria de asamblea de accionistas y el informe anual sobre la situación financiera.",
          "Todas las acciones deben pagarse en un plazo no mayor a un año.",
          "Presentar declaraciones mensuales y anuales ante el SAT.",
          "Si tienes empleados: alta patronal ante el IMSS, pago de cuotas obrero-patronales, y cumplimiento del ICSOE y SISUB.",
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Beneficios fiscales de las SAS",
      },
      {
        tipo: "parrafo",
        texto:
          "Las SAS inscritas en el RFC tributan bajo el esquema de flujo de efectivo, lo que significa que solo acumulas los ingresos y deducciones efectivamente cobrados y pagados. Esto simplifica enormemente la contabilidad y evita pagar impuestos sobre ingresos que aún no has cobrado.",
      },
      {
        tipo: "lista",
        estilo: "vinetas",
        items: [
          "ISR basado en flujo de efectivo: solo pagas sobre lo que efectivamente cobraste.",
          "Exención de presentar la DIOT (Declaración Informativa de Operaciones con Terceros).",
          "Contabilidad simplificada a través del portal del SAT.",
          "Acceso a programas de financiamiento para PyMEs.",
        ],
      },
      {
        tipo: "subtitulo",
        texto: "¿Cuándo NO conviene una SAS?",
      },
      {
        tipo: "parrafo",
        texto:
          "La SAS es ideal para negocios pequeños, pero tiene limitaciones importantes. Si tu negocio supera los 5 millones de pesos en ingresos anuales, deberás transformarte obligatoriamente a otra sociedad. Si buscas inversionistas, una SAPI ofrece más flexibilidad para emitir diferentes clases de acciones. Y si necesitas un esquema corporativo más robusto con consejo de administración, la SA de CV es la elección natural.",
      },
      {
        tipo: "subtitulo",
        texto: "Constituir una SA de CV: la ruta tradicional",
      },
      {
        tipo: "parrafo",
        texto:
          "La Sociedad Anónima de Capital Variable sigue siendo el tipo de sociedad más popular en México. A diferencia de la SAS, requiere mínimo 2 socios, un capital mínimo de $50,000 MXN y la intervención de un notario público para su constitución.",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Solicita la autorización de tu denominación social en el portal tuempresa.gob.mx.",
          "Acude con un notario público con la documentación de todos los socios (INE, CURP, comprobante de domicilio, RFC).",
          "El notario redacta el acta constitutiva con los estatutos sociales.",
          "Los socios firman ante el notario y se protocoliza la escritura.",
          "El notario inscribe la sociedad en el Registro Público de Comercio.",
          "Tramita tu RFC y e.firma como persona moral ante el SAT.",
          "Abre tu cuenta bancaria empresarial.",
        ],
      },
      {
        tipo: "callout",
        variante: "alerta",
        titulo: "Costo aproximado",
        texto:
          "Constituir una SA de CV ante notario cuesta entre $8,000 y $25,000 MXN dependiendo de la entidad federativa y el notario. Adicionalmente hay gastos de inscripción en el Registro Público de Comercio.",
      },
      {
        tipo: "subtitulo",
        texto: "Trámites obligatorios después de constituir tu empresa",
      },
      {
        tipo: "parrafo",
        texto:
          "Sin importar el tipo de sociedad que elijas, una vez constituida debes completar estos trámites para operar legalmente:",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "Alta en el RFC como persona moral: se genera automáticamente con la SAS; para otras sociedades, se tramita en el SAT con el acta constitutiva.",
          "Obtener la e.firma de la empresa: necesaria para emitir facturas electrónicas (CFDI).",
          "Tramitar tu Certificado de Sello Digital (CSD): indispensable para timbrar facturas.",
          "Activar tu Buzón Tributario: obligatorio para recibir notificaciones del SAT.",
          "Abrir una cuenta bancaria empresarial: separa las finanzas del negocio de las personales.",
          "Alta patronal ante el IMSS (si tienes empleados): dentro de los primeros 5 días hábiles de iniciar operaciones.",
          "Inscripción en el REPSE (si prestas servicios especializados): obligatorio desde 2021.",
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Errores comunes al crear una empresa en México",
      },
      {
        tipo: "lista",
        estilo: "numeros",
        items: [
          "No elegir el régimen fiscal correcto: muchos emprendedores se quedan en un régimen que no les corresponde y terminan pagando más impuestos de los necesarios.",
          "Mezclar finanzas personales y del negocio: esto genera problemas contables y fiscales graves ante una auditoría.",
          "No registrarse en el REPSE cuando es obligatorio: las multas por no cumplir con el registro de servicios especializados son muy elevadas.",
          "Olvidar obligaciones del IMSS: no dar de alta a los trabajadores desde el primer día es una infracción que puede tener consecuencias legales.",
          "No llevar contabilidad formal desde el inicio: aunque seas una SAS con contabilidad simplificada, necesitas orden desde el día uno.",
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Tabla comparativa: SAS vs SA de CV",
      },
      {
        tipo: "tabla",
        encabezados: [
          "Característica",
          "SAS",
          "SA de CV",
        ],
        filas: [
          ["Socios mínimos", "1 (persona física)", "2 (personas físicas o morales)"],
          ["Capital mínimo", "Desde $1 MXN", "$50,000 MXN"],
          ["Notario", "No requerido", "Obligatorio"],
          ["Costo de constitución", "Gratuito", "$8,000 – $25,000 MXN"],
          ["Tiempo de constitución", "24 horas", "2 a 6 semanas"],
          ["Límite de ingresos", "5 millones anuales", "Sin límite"],
          ["Régimen fiscal", "RESICO", "General de ley (601)"],
          ["Ideal para", "Micro y pequeñas empresas", "Empresas medianas y grandes"],
        ],
        pie: "Fuente: Ley General de Sociedades Mercantiles y SAT.",
      },
      {
        tipo: "cita",
        texto:
          "Crear tu empresa es el primer paso para crecer formalmente. Lo importante no es solo constituirte, sino mantener tus obligaciones fiscales al día desde el principio. Ahí es donde un buen contador hace la diferencia.",
        autor: "Aaron Rosales, RDC Contadores",
      },
      {
        tipo: "cta",
        texto:
          "¿Necesitas constituir tu empresa o ya la tienes y buscas un despacho que lleve tu contabilidad? En RDC Contadores te ayudamos con todo el proceso.",
        etiquetaBoton: "Hablar con un contador",
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
    if (b.tipo === "faq") {
      return (
        acc +
        b.items.reduce(
          (n, q) => n + `${q.pregunta} ${q.respuesta}`.split(/\s+/).length,
          0
        )
      );
    }
    if ("texto" in b) {
      return acc + b.texto.split(/\s+/).length;
    }
    return acc;
  }, 0);
  return Math.max(1, Math.round(palabras / 200));
}

function quitarNegritas(s: string): string {
  return s.replace(/\*\*([^*]+)\*\*/g, "$1");
}

/** FAQs embebidas en un artículo (para JSON-LD FAQPage). */
export function getFaqsDelPost(
  post: BlogPost
): { pregunta: string; respuesta: string }[] {
  return post.contenido.flatMap((b) =>
    b.tipo === "faq"
      ? b.items.map((q) => ({
          pregunta: quitarNegritas(q.pregunta),
          respuesta: quitarNegritas(q.respuesta),
        }))
      : []
  );
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
