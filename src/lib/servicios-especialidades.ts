import {
  CUATRIMESTRE_META,
  etiquetaMesPresentacion,
  type Cuatrimestre,
} from "@/lib/repse";

export type EspecialidadSlug = "repse" | "icsoe" | "sisub";

export type MarcoLegalEspecialidad = {
  referencia: string;
  texto: string;
};

export type DatoDeclaracion = {
  campo: string;
  detalle: string;
  obligatorio?: boolean;
};

export type ExplicacionDestacada = {
  titulo: string;
  texto: string;
};

/** Resumen para carrusel en /servicios */
export type EspecialidadServicio = {
  slug: EspecialidadSlug;
  titulo: string;
  subtitulo: string;
  resumen: string;
  puntos: string[];
  iconColor: string;
};

export type EspecialidadPagina = {
  slug: EspecialidadSlug;
  titulo: string;
  nombreCompleto: string;
  autoridad: string;
  autoridadCorto: string;
  subtitulo: string;
  badge: string;
  introSeo: string;
  metaDescription: string;
  keywords: string[];
  heroFrom: string;
  heroTo: string;
  iconColor: string;
  accentBg: string;
  accentText: string;
  accentRing: string;
  peculiaridades: ExplicacionDestacada[];
  explicaciones: ExplicacionDestacada[];
  datosDeclaracion: DatoDeclaracion[];
  marcoLegal: MarcoLegalEspecialidad[];
  paraQuien: string[];
  queHacemos: ExplicacionDestacada[];
  cumplimiento: string[];
  esCuatrimestral: boolean;
  herramienta?: { href: string; label: string; texto: string };
  precio?: { nota: string };
};

export const SLUGS_ESPECIALIDAD: readonly EspecialidadSlug[] = [
  "repse",
  "icsoe",
  "sisub",
] as const;

export const CALENDARIO_CUATRIMESTRE = ([1, 2, 3] as Cuatrimestre[]).map((c) => ({
  cuatrimestre: c,
  periodo: CUATRIMESTRE_META[c].rango,
  presentacion: etiquetaMesPresentacion(c),
  dia: CUATRIMESTRE_META[c].diaVencimiento,
}));

const RFC_HERRAMIENTA = {
  href: "/herramientas/rfc",
  label: "Calcula el RFC con nuestra herramienta gratuita",
  texto:
    "¿No tienes el RFC de un trabajador subcontratado? Con CURP y fecha de nacimiento puedes obtenerlo en segundos — sin registro.",
};

export const ESPECIALIDADES_PAGINA: Record<EspecialidadSlug, EspecialidadPagina> = {
  repse: {
    slug: "repse",
    titulo: "REPSE",
    nombreCompleto:
      "Registro de Prestadoras de Servicios Especializados u Obras Especializadas",
    autoridad: "Secretaría del Trabajo y Previsión Social (STPS)",
    autoridadCorto: "STPS",
    subtitulo:
      "Alta, renovación y cumplimiento del registro obligatorio para empresas que subcontratan personal especializado u obras en instalaciones de terceros.",
    badge: "Outsourcing · STPS",
    introSeo:
      "El REPSE es el registro federal ante la STPS que acredita a tu empresa como prestadora de servicios especializados u obras especializadas. Sin él, no puedes subcontratar legalmente bajo la Ley de Outsourcing y te expones a multas, rechazo de deducciones y responsabilidad solidaria laboral. En RDC Contadores te acompañamos en el alta, la renovación anual, la integración de contratos y la coordinación con tus obligaciones cuatrimestrales ICSOE (IMSS) y SISUB (INFONAVIT).",
    metaDescription:
      "REPSE STPS: qué es, quién lo necesita, cómo tramitarlo y renovarlo. Contador en Guadalajara para outsourcing, ICSOE y SISUB. Cotización en 24 h.",
    keywords: [
      "qué es REPSE",
      "cómo tramitar REPSE",
      "registro outsourcing STPS",
      "contador REPSE Guadalajara",
      "renovación REPSE",
      "ley outsourcing México",
    ],
    heroFrom: "from-amber-600",
    heroTo: "to-orange-900",
    iconColor: "text-amber-100",
    accentBg: "bg-amber-50",
    accentText: "text-amber-800",
    accentRing: "ring-amber-200",
    esCuatrimestral: false,
    peculiaridades: [
      {
        titulo: "No es lo mismo que ICSOE ni SISUB",
        texto:
          "REPSE es el registro maestro ante STPS. ICSOE e IMSS, y SISUB e INFONAVIT, son informes cuatrimestrales que solo aplican si ya estás inscrito en REPSE y subcontratas personal.",
      },
      {
        titulo: "Renovación anual",
        texto:
          "El registro debe renovarse cada año y mantener vigente el dictamen de cumplimiento de obligaciones laborales. Si caduca, pierdes la capacidad de facturar servicios especializados con respaldo legal.",
      },
      {
        titulo: "Contratos y evidencia",
        texto:
          "Debes contar con contratos de servicios especializados u obras, relación de trabajadores asignados y documentación que soporte la especialización — no basta con “maquilar” nómina.",
      },
      {
        titulo: "Riesgo fiscal y laboral",
        texto:
          "Operar sin REPSE puede implicar que el SAT no reconozca deducciones por servicios subcontratados y que tus clientes asuman responsabilidad solidaria por obligaciones de tus trabajadores.",
      },
    ],
    explicaciones: [
      {
        titulo: "¿Quién debe inscribirse en REPSE?",
        texto:
          "Personas morales o físicas con actividad empresarial que presten servicios especializados u obras especializadas a otras empresas, utilizando trabajadores propios en instalaciones del cliente. También quien recibe esos servicios debe verificar que su proveedor esté registrado.",
      },
      {
        titulo: "¿Cómo se tramita el alta?",
        texto:
          "Se realiza en el portal de la STPS con e.firma, carga de acta constitutiva, constancia de situación fiscal, contrato social actualizado, relación de clientes y trabajadores, y el dictamen de cumplimiento expedido por despacho o abogado laboral autorizado.",
      },
      {
        titulo: "¿Y las declaraciones cuatrimestrales?",
        texto:
          "Una vez inscrito, cada cuatrimestre debes presentar ICSOE ante el IMSS y SISUB ante el INFONAVIT. Las ventanas de presentación son mayo, septiembre y enero — te lo llevamos en calendario para que no se te pase ninguna.",
      },
    ],
    datosDeclaracion: [
      {
        campo: "Razón social y RFC de la prestadora",
        detalle: "Deben coincidir con el registro vigente en STPS y SAT.",
        obligatorio: true,
      },
      {
        campo: "Contratos de servicios u obras especializadas",
        detalle: "Objeto del contrato, vigencia, monto y cliente beneficiario.",
        obligatorio: true,
      },
      {
        campo: "Relación de trabajadores especializados",
        detalle: "Nombre completo, NSS, RFC y puesto o especialidad asignada.",
        obligatorio: true,
      },
      {
        campo: "Dictamen de cumplimiento laboral",
        detalle: "Documento anual que acredita obligaciones de seguridad social y laborales.",
        obligatorio: true,
      },
    ],
    marcoLegal: [
      {
        referencia: "Ley de Outsourcing (2021)",
        texto: "Prohíbe la subcontratación de personal para la actividad preponderante y exige REPSE para servicios especializados u obras.",
      },
      {
        referencia: "Reglamento de la Ley de Outsourcing",
        texto: "Establece requisitos del registro, renovación, dictamen de cumplimiento y sanciones por operar sin inscripción.",
      },
      {
        referencia: "Acuerdos STPS",
        texto: "Lineamientos operativos del portal REPSE, formatos de contrato y criterios de especialización.",
      },
    ],
    paraQuien: [
      "Empresas de limpieza, seguridad, mantenimiento o TI que prestan personal en sitio del cliente",
      "Constructoras y contratistas de obra especializada",
      "Maquiladoras y plantas que subcontratan servicios auxiliares",
      "Clientes que quieren validar que sus proveedores estén registrados antes de pagar",
    ],
    queHacemos: [
      {
        titulo: "Diagnóstico de especialización",
        texto: "Revisamos si tu giro califica como servicio u obra especializada y qué documentación necesitas antes del alta.",
      },
      {
        titulo: "Trámite de alta y renovación",
        texto: "Preparamos expediente, coordinamos dictamen laboral y damos seguimiento en el portal STPS hasta la inscripción.",
      },
      {
        titulo: "Coordinación ICSOE + SISUB",
        texto: "Integramos contratos, nómina y trabajadores para que tus informes cuatrimestrales cuadren con lo declarado en REPSE.",
      },
      {
        titulo: "Calendario y recordatorios",
        texto: "Te avisamos antes de mayo, septiembre y enero — meses clave de presentación de informes vinculados.",
      },
    ],
    cumplimiento: [
      "Alta y renovación REPSE ante STPS",
      "Revisión de contratos de especialización",
      "Coordinación con dictamen de cumplimiento laboral",
      "Preparación de datos para ICSOE e IMSS",
      "Preparación de datos para SISUB e INFONAVIT",
      "Resguardo de acuses y evidencia por cuatrimestre",
    ],
    herramienta: RFC_HERRAMIENTA,
    precio: { nota: "Honorario según tamaño de plantilla y número de clientes — cotización en 24 h." },
  },

  icsoe: {
    slug: "icsoe",
    titulo: "ICSOE",
    nombreCompleto:
      "Informe de Contratos de Servicios u Obras Especializadas",
    autoridad: "Instituto Mexicano del Seguro Social (IMSS)",
    autoridadCorto: "IMSS",
    subtitulo:
      "Informe cuatrimestral ante el IMSS sobre contratos de subcontratación y trabajadores que prestan servicios especializados en instalaciones de terceros.",
    badge: "Cuatrimestral · IMSS",
    introSeo:
      "El ICSOE es la declaración informativa que las empresas inscritas en REPSE presentan ante el IMSS cada cuatrimestre. Reporta los contratos de servicios u obras especializadas celebrados y los trabajadores asignados. No implica pago de cuotas adicionales por sí mismo, pero omitirlo o presentarlo incompleto genera multas y pone en riesgo tu registro. En RDC validamos contratos, cruzamos nómina y entregamos el informe en tiempo.",
    metaDescription:
      "ICSOE IMSS: cuándo presentarlo (mayo, septiembre, enero), qué datos incluir — NSS, RFC, salario — y cómo lo gestionamos. Contador REPSE en Guadalajara.",
    keywords: [
      "qué es ICSOE",
      "cuándo presentar ICSOE",
      "ICSOE IMSS cuatrimestre",
      "informe outsourcing IMSS",
      "contador ICSOE",
      "declaración REPSE IMSS",
    ],
    heroFrom: "from-emerald-600",
    heroTo: "to-green-900",
    iconColor: "text-emerald-100",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-800",
    accentRing: "ring-emerald-200",
    esCuatrimestral: true,
    peculiaridades: [
      {
        titulo: "Tres ventanas al año",
        texto:
          "Se presenta en mayo (periodo ene–abr), septiembre (may–ago) y enero del año siguiente (sep–dic). El día límite habitual es el 17 del mes de presentación.",
      },
      {
        titulo: "Solo si estás en REPSE",
        texto:
          "Aplica a prestadoras registradas que subcontratan o prestan servicios especializados. Sin REPSE vigente, el IMSS no espera tu ICSOE — pero tampoco puedes operar legalmente.",
      },
      {
        titulo: "Cruce con contratos reales",
        texto:
          "Cada trabajador reportado debe estar ligado a un contrato de servicios u obras especializadas vigente en el cuatrimestre, con cliente y objeto claros.",
      },
      {
        titulo: "Complemento del SISUB",
        texto:
          "ICSOE va al IMSS; SISUB al INFONAVIT. Ambos cubren el mismo periodo y deben ser consistentes en número de trabajadores y datos.",
      },
    ],
    explicaciones: [
      {
        titulo: "¿Cuándo debo presentar el ICSOE?",
        texto:
          "Cada cuatrimestre, en el mes siguiente al cierre del periodo: mayo para enero–abril, septiembre para mayo–agosto, y enero para septiembre–diciembre del año anterior. Te recomendamos preparar la información la última semana del mes previo.",
      },
      {
        titulo: "¿Qué pasa si me atraso?",
        texto:
          "El IMSS puede imponer multas y tu cliente — la empresa receptora — puede exigir el acuse para seguir recibiendo tus servicios. En revisiones de outsourcing, la inconsistencia entre REPSE, ICSOE y nómina es una de las primeras banderas rojas.",
      },
      {
        titulo: "¿Necesito timbrar algo?",
        texto:
          "No es un pago ni un CFDI: es un informe electrónico. Sí necesitas tener los datos de tus trabajadores y contratos ordenados antes de cargar el archivo o capturar en el portal del IMSS.",
      },
    ],
    datosDeclaracion: [
      {
        campo: "Nombre completo del trabajador",
        detalle: "Como aparece en el IMSS, sin abreviaturas que impidan identificarlo.",
        obligatorio: true,
      },
      {
        campo: "NSS (Número de Seguridad Social)",
        detalle: "11 dígitos; debe estar activo y vinculado al patrón que reporta.",
        obligatorio: true,
      },
      {
        campo: "RFC del trabajador",
        detalle: "13 caracteres persona física; clave para cruce con nómina y SAT.",
        obligatorio: true,
      },
      {
        campo: "Salario diario integrado (SDI)",
        detalle: "Base para cuotas IMSS; debe coincidir con el movimiento afiliatorio del periodo.",
        obligatorio: true,
      },
      {
        campo: "Registro patronal y cliente",
        detalle: "Empresa receptora del servicio y contrato bajo el cual se asignó al trabajador.",
        obligatorio: true,
      },
      {
        campo: "Vigencia del contrato",
        detalle: "Fechas de inicio y fin del contrato de servicios u obras en el cuatrimestre.",
        obligatorio: true,
      },
    ],
    marcoLegal: [
      {
        referencia: "Ley del Seguro Social",
        texto: "Obligaciones de patrones y empresas de servicios especializados en materia de seguridad social.",
      },
      {
        referencia: "Ley de Outsourcing",
        texto: "Vincula el REPSE con los informes periódicos ante IMSS e INFONAVIT.",
      },
      {
        referencia: "Disposiciones IMSS",
        texto: "Formato, plazos y medios de presentación del ICSOE por cuatrimestre.",
      },
    ],
    paraQuien: [
      "Prestadoras de servicios especializados con REPSE activo",
      "Empresas de facility services, seguridad privada o logística en sitio",
      "Contratistas que rotan personal en plantas de clientes",
      "Contadores internos que necesitan tercerizar la captura cuatrimestral",
    ],
    queHacemos: [
      {
        titulo: "Recopilación de plantilla",
        texto: "Pedimos nómina del cuatrimestre, altas, bajas y movimientos de SDI para cada trabajador asignado.",
      },
      {
        titulo: "Validación de RFC y NSS",
        texto: "Cruzamos identificadores con contratos y, si falta el RFC, te orientamos con nuestra herramienta gratuita.",
      },
      {
        titulo: "Generación y envío",
        texto: "Preparamos el informe, lo cargamos ante el IMSS y te entregamos acuse y resumen para tu cliente.",
      },
      {
        titulo: "Conciliación con SISUB",
        texto: "Verificamos que los mismos trabajadores y periodos estén en ambos informes antes del cierre.",
      },
    ],
    cumplimiento: [
      "Calendario cuatrimestral mayo / septiembre / enero",
      "Validación NSS, RFC y SDI por trabajador",
      "Cruce contratos REPSE ↔ plantilla",
      "Presentación ante IMSS y acuse al cliente",
      "Histórico por cuatrimestre en tu expediente",
    ],
    herramienta: RFC_HERRAMIENTA,
    precio: { nota: "Servicio cuatrimestral — cotización según número de trabajadores y contratos." },
  },

  sisub: {
    slug: "sisub",
    titulo: "SISUB",
    nombreCompleto: "Sistema de Información de Subcontratación",
    autoridad: "Instituto del Fondo Nacional de la Vivienda (INFONAVIT)",
    autoridadCorto: "INFONAVIT",
    subtitulo:
      "Informe cuatrimestral ante el INFONAVIT con los trabajadores subcontratados que prestan servicios en instalaciones de empresas receptoras.",
    badge: "Cuatrimestral · INFONAVIT",
    introSeo:
      "El SISUB es la declaración informativa que complementa al ICSOE, pero se presenta ante el INFONAVIT. Reporta los mismos trabajadores subcontratados con sus datos de identificación y salario, para que la autoridad tenga visibilidad sobre outsourcing y vivienda. Las fechas de presentación coinciden con el ICSOE: mayo, septiembre y enero. En RDC preparamos ambos informes en paralelo para que no haya discrepancias.",
    metaDescription:
      "SISUB INFONAVIT: plazos cuatrimestrales, datos de trabajadores (NSS, RFC, SDI) y cumplimiento outsourcing. Contador REPSE Guadalajara.",
    keywords: [
      "qué es SISUB",
      "SISUB INFONAVIT cuándo",
      "declaración subcontratación INFONAVIT",
      "contador SISUB",
      "REPSE INFONAVIT",
      "informe cuatrimestral outsourcing",
    ],
    heroFrom: "from-rose-600",
    heroTo: "to-red-900",
    iconColor: "text-rose-100",
    accentBg: "bg-rose-50",
    accentText: "text-rose-800",
    accentRing: "ring-rose-200",
    esCuatrimestral: true,
    peculiaridades: [
      {
        titulo: "Mismo calendario que ICSOE",
        texto:
          "Mayo, septiembre y enero — un informe por cuatrimestre calendario. Presentar uno y olvidar el otro deja tu cumplimiento a medias.",
      },
      {
        titulo: "Enfoque INFONAVIT",
        texto:
          "Aunque no genera pago directo como una amortización, el INFONAVIT usa el SISUB para supervisar subcontratación y derechos de vivienda de los trabajadores.",
      },
      {
        titulo: "Datos idénticos en esencia",
        texto:
          "Nombre, NSS, RFC y salario deben coincidir con lo declarado al IMSS y con tu nómina timbrada del periodo.",
      },
      {
        titulo: "Cliente receptor atento",
        texto:
          "Muchas empresas grandes exigen acuses de ICSOE y SISUB antes de liberar pagos a proveedores especializados.",
      },
    ],
    explicaciones: [
      {
        titulo: "¿Cuándo debo presentar el SISUB?",
        texto:
          "En los mismos meses que el ICSOE: mayo (ene–abr), septiembre (may–ago) y enero (sep–dic). La fecha tope habitual es el día 17. Te avisamos con anticipación para que tengas plantilla y contratos listos.",
      },
      {
        titulo: "¿Qué datos pide el archivo?",
        texto:
          "Por cada trabajador subcontratado: nombre completo, NSS, RFC, salario diario integrado, datos del contrato y de la empresa receptora. Errores en el RFC o NSS rechazan el lote completo.",
      },
      {
        titulo: "¿Y si no tengo el RFC de un trabajador?",
        texto:
          "Puedes calcularlo con CURP y fecha de nacimiento usando nuestra herramienta gratuita de RFC — ideal para altas urgentes antes del cierre cuatrimestral.",
      },
    ],
    datosDeclaracion: [
      {
        campo: "Nombre completo",
        detalle: "Apellidos y nombre(s) sin errores ortográficos respecto al IMSS.",
        obligatorio: true,
      },
      {
        campo: "NSS",
        detalle: "Número de Seguridad Social de 11 dígitos del trabajador subcontratado.",
        obligatorio: true,
      },
      {
        campo: "RFC",
        detalle: "Registro Federal de Contribuyentes con homoclave; validar antes de cargar.",
        obligatorio: true,
      },
      {
        campo: "Salario diario integrado",
        detalle: "Monto diario con prestaciones integradas; debe ser coherente con el ICSOE.",
        obligatorio: true,
      },
      {
        campo: "Empresa receptora",
        detalle: "RFC y razón social del cliente donde presta servicios el trabajador.",
        obligatorio: true,
      },
      {
        campo: "Periodo del contrato",
        detalle: "Meses del cuatrimestre en que el trabajador estuvo asignado al cliente.",
        obligatorio: true,
      },
    ],
    marcoLegal: [
      {
        referencia: "Ley del INFONAVIT",
        texto: "Facultades de la institución para recibir información de subcontratación laboral.",
      },
      {
        referencia: "Ley de Outsourcing",
        texto: "Obliga informes coordinados de subcontratación ante IMSS e INFONAVIT.",
      },
      {
        referencia: "Lineamientos INFONAVIT / SISUB",
        texto: "Especificaciones técnicas del archivo, catálogos y plazos de presentación.",
      },
    ],
    paraQuien: [
      "Prestadoras REPSE con trabajadores en instalaciones de clientes",
      "Empresas de servicios con rotación de personal en múltiples sitios",
      "Proveedores que su cliente exige acuse SISUB para pago",
      "Despachos que quieren externalizar la captura cuatrimestral",
    ],
    queHacemos: [
      {
        titulo: "Plantilla unificada",
        texto: "Un solo formato para capturar datos que alimentan ICSOE y SISUB sin duplicar trabajo.",
      },
      {
        titulo: "Validación cruzada",
        texto: "Revisamos RFC, NSS y SDI contra nómina y movimientos IMSS antes de enviar.",
      },
      {
        titulo: "Carga ante INFONAVIT",
        texto: "Generamos el informe, lo presentamos y archivamos el acuse en tu expediente digital.",
      },
      {
        titulo: "Alertas de vencimiento",
        texto: "Recordatorios antes de cada ventana — mayo, septiembre y enero — con checklist de lo que falta.",
      },
    ],
    cumplimiento: [
      "Informe cuatrimestral SISUB ante INFONAVIT",
      "Conciliación con ICSOE del mismo periodo",
      "Validación de RFC con herramienta RDC",
      "Acuses entregados a ti y a tu cliente si aplica",
      "Histórico cuatrimestral consultable",
    ],
    herramienta: RFC_HERRAMIENTA,
    precio: { nota: "Paquete cuatrimestral o anual ICSOE + SISUB — cotización transparente." },
  },
};

/** @deprecated Usar ESPECIALIDADES_PAGINA */
export const ESPECIALIDADES_SERVICIO = Object.fromEntries(
  SLUGS_ESPECIALIDAD.map((slug) => {
    const p = ESPECIALIDADES_PAGINA[slug];
    return [
      slug,
      {
        slug: p.slug,
        titulo: p.titulo,
        subtitulo: p.subtitulo,
        resumen: p.introSeo.slice(0, 120) + "…",
        puntos: p.queHacemos.slice(0, 4).map((q) => q.titulo),
        iconColor: p.accentText,
      },
    ];
  })
) as Record<
  EspecialidadSlug,
  {
    slug: EspecialidadSlug;
    titulo: string;
    subtitulo: string;
    resumen: string;
    puntos: string[];
    iconColor: string;
  }
>;

export function esSlugEspecialidadValido(slug: string): slug is EspecialidadSlug {
  return slug in ESPECIALIDADES_PAGINA;
}

export function especialidadPorSlug(slug: string): EspecialidadPagina | undefined {
  if (!esSlugEspecialidadValido(slug)) return undefined;
  return ESPECIALIDADES_PAGINA[slug];
}
