/**
 * Contenido de la guía ICSOE (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 *
 * Declaración cuatrimestral ante el IMSS. No es un pago. Solo con REPSE vigente.
 * SISUB es la hermana ante INFONAVIT, mismo periodo. Tabla: ICSOE vs SISUB.
 * No comparar ICSOE vs 601. El padrón se explica en /servicios/repse.
 */

export const ICSOE_FAQ = [
  {
    pregunta: "¿Qué es el ICSOE?",
    respuesta:
      "Es la declaración de Contratos de Servicios u Obras Especializadas ante el IMSS. Reporta qué contratos tuviste en el cuatrimestre y qué trabajadores asignaste. No es un régimen, no es el REPSE y no es un pago de cuotas.",
  },
  {
    pregunta: "¿El ICSOE se paga?",
    respuesta:
      "No. Es un acuse, no una cuota extra. Las cuotas IMSS viajan por la nómina, aparte. Omitir la declaración o presentarla incompleta sí genera multa y pone el padrón en riesgo.",
  },
  {
    pregunta: "¿Cuándo se presenta?",
    respuesta:
      "Tres veces al año, el día 17: mayo (enero–abril), septiembre (mayo–agosto) y enero (septiembre–diciembre). No es el día 17 de cada mes. Confundirlo con el ISR es el error más común.",
  },
  {
    pregunta: "¿Qué datos pide?",
    respuesta:
      "Por cada trabajador asignado: nombre, NSS, RFC, salario diario integrado, cliente receptor y vigencia del contrato de especialización. El IMSS lo cruza con tu nómina. Un NSS o un SDI que no cuadre rechaza el lote.",
  },
  {
    pregunta: "¿Puedo presentarlo sin REPSE?",
    respuesta:
      "No tiene sentido. Sin padrón vigente no puedes operar el servicio especializado. El ICSOE declara lo que ya prestaste con ese padrón. Primero el REPSE; después esta declaración.",
  },
  {
    pregunta: "¿En qué se diferencia del SISUB?",
    respuesta:
      "Mismo periodo, misma plantilla, otra autoridad. ICSOE va al IMSS; SISUB, al INFONAVIT. Presentar uno y olvidar el otro deja el cuatrimestre a medias. El cliente grande suele pedir ambos acuses.",
  },
] as const;

export const ICSOE_PASOS_DECLARACION = [
  {
    name: "Confirma que el REPSE sigue vigente",
    text: "Sin padrón no hay declaración que presentar. Y tampoco hay operación legal. La guía del registro está en REPSE.",
  },
  {
    name: "Identifica el cuatrimestre cerrado",
    text: "Enero–abril se declara en mayo. Mayo–agosto, en septiembre. Septiembre–diciembre, en enero. Día 17.",
  },
  {
    name: "Arma la plantilla del periodo",
    text: "Nombre, NSS, RFC, SDI, contrato y cliente. Cada trabajador debe estar ligado a un contrato de especialización vigente.",
  },
  {
    name: "Carga la declaración en el portal del IMSS",
    text: "No es un CFDI ni un pago. Es un archivo o captura. Conserva el acuse: tu cliente lo va a pedir.",
  },
  {
    name: "Cruza con el SISUB del mismo cuatrimestre",
    text: "Mismos trabajadores, otra autoridad. Presentar el ICSOE y olvidar el SISUB deja el cumplimiento a medias.",
  },
] as const;

export const ICSOE_PASOS_CRUCE = [
  {
    name: "Misma gente que en el SISUB",
    text: "Si un trabajador está en uno y no en el otro, alguna de las dos declaraciones está mal.",
  },
  {
    name: "El SDI debe cuadrar con el IMSS",
    text: "El salario diario integrado del ICSOE es el del movimiento afiliatorio, no un sueldo inventado para el archivo.",
  },
  {
    name: "El contrato debe existir en el REPSE",
    text: "Cliente, objeto y vigencia. Un trabajador sin contrato de especialización no entra.",
  },
  {
    name: "El RFC y el NSS no se improvisan",
    text: "Once dígitos de NSS, trece del RFC. Un error de captura rechaza el lote completo.",
  },
  {
    name: "Entrega ambos acuses al cliente",
    text: "ICSOE e IMSS, SISUB e INFONAVIT. Muchas empresas no liberan el pago sin los dos.",
  },
] as const;

export const ICSOE_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cómo se declara" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "ICSOE vs SISUB" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const ICSOE_VS_SISUB = {
  titulo: "ICSOE vs SISUB",
  columnas: ["ICSOE · IMSS", "SISUB · INFONAVIT"] as const,
  filas: [
    {
      aspecto: "Qué es",
      valores: [
        "Declaración de contratos y trabajadores asignados",
        "Declaración de subcontratación y trabajadores asignados",
      ],
    },
    {
      aspecto: "Autoridad",
      valores: ["IMSS", "INFONAVIT"],
    },
    {
      aspecto: "Cuándo",
      valores: [
        "Día 17 de mayo, septiembre y enero",
        "Las mismas tres ventanas. Mismo cuatrimestre",
      ],
    },
    {
      aspecto: "Hay pago",
      valores: [
        "No. Es un acuse. Las cuotas IMSS van por la nómina",
        "No. Es un acuse. Las aportaciones van por la nómina",
      ],
    },
    {
      aspecto: "Plantilla",
      valores: [
        "Nombre, NSS, RFC, SDI, contrato y cliente receptor",
        "Los mismos datos. Tienen que cuadrar con el ICSOE",
      ],
    },
    {
      aspecto: "Si presentas uno solo",
      valores: [
        "El cuatrimestre queda a medias. El padrón y el cliente lo notan",
        "Igual: sin el par, el cumplimiento no cierra",
      ],
    },
  ],
} as const;

export const ICSOE_CRITERIOS = [
  {
    n: "01",
    titulo: "Solo si ya estás en el REPSE",
    kicker: "Padrón primero",
    texto:
      "El ICSOE declara lo que prestaste con el registro vigente. Sin padrón no hay declaración — y tampoco operación. La guía del registro es la de REPSE.",
  },
  {
    n: "02",
    titulo: "No es un pago ni un CFDI",
    kicker: "Acuse IMSS",
    texto:
      "No se timbra. No se enteran cuotas extra. Se carga un archivo o una captura y se guarda el acuse. Las cuotas viajan por la nómina, aparte.",
  },
  {
    n: "03",
    titulo: "Tres ventanas al año, día 17",
    kicker: "Mayo · septiembre · enero",
    texto:
      "No es el mensual del ISR. Enero–abril se declara en mayo; mayo–agosto, en septiembre; septiembre–diciembre, en enero.",
  },
  {
    n: "04",
    titulo: "Tiene que cuadrar con el SISUB",
    kicker: "Misma plantilla",
    texto:
      "Mismo cuatrimestre, mismos trabajadores, otra autoridad. Presentar el ICSOE y olvidar el SISUB deja el periodo a medias.",
  },
] as const;

export const ICSOE_DECLARACION_TILES = [
  {
    id: "que",
    corto: "Qué",
    titulo: "Contratos y gente asignada",
    fundamento: "IMSS",
    texto:
      "Qué contratos de especialización tuviste en el cuatrimestre y qué trabajadores pusiste en el sitio del cliente. No se declara la nómina entera: se declara la asignada.",
  },
  {
    id: "cuando",
    corto: "Cuándo",
    titulo: "Día 17, tres veces al año",
    fundamento: "Cuatrimestral",
    texto:
      "Mayo, septiembre y enero. No el 17 de cada mes. El periodo que se declara es el cuatrimestre que ya cerró.",
  },
  {
    id: "pago",
    corto: "Pago",
    titulo: "No hay cuota extra",
    fundamento: "Acuse",
    texto:
      "El ICSOE no se paga. Se presenta. Las cuotas IMSS siguen viajando por la nómina. El acuse es lo que el cliente te va a pedir.",
  },
] as const;

export const ICSOE_CRUCE_TILES = [
  {
    id: "sisub",
    corto: "SISUB",
    titulo: "Misma gente, otra autoridad",
    fundamento: "INFONAVIT",
    texto:
      "El SISUB declara el mismo cuatrimestre ante el INFONAVIT. Si el número de trabajadores no cuadra, alguna de las dos está mal.",
  },
  {
    id: "nomina",
    corto: "Nómina",
    titulo: "El SDI es el del IMSS",
    fundamento: "Movimiento afiliatorio",
    texto:
      "Altas, bajas y modificaciones del periodo. Un SDI distinto al de la afiliación es bandera roja en revisión.",
  },
  {
    id: "repse",
    corto: "REPSE",
    titulo: "El contrato tiene que existir",
    fundamento: "Padrón STPS",
    texto:
      "Cliente, objeto y vigencia. Un trabajador sin contrato de especialización no entra al ICSOE, aunque esté en la nómina.",
  },
] as const;
