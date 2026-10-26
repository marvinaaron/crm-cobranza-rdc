/**
 * Contenido de la guía SISUB (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 *
 * Declaración cuatrimestral ante el INFONAVIT. No es un pago. Solo con REPSE
 * vigente. ICSOE es el hermano ante el IMSS, mismo periodo.
 * Tabla: SISUB vs ICSOE. No comparar SISUB vs 601.
 * El padrón se explica en /servicios/repse.
 */

export const SISUB_FAQ = [
  {
    pregunta: "¿Qué es el SISUB?",
    respuesta:
      "Es el Sistema de Información de Subcontratación ante el INFONAVIT. Reporta qué trabajadores pusiste en el sitio del cliente durante el cuatrimestre. No es un régimen, no es el REPSE y no es un pago de aportaciones.",
  },
  {
    pregunta: "¿El SISUB se paga?",
    respuesta:
      "No. Es un acuse, no una cuota extra. Las aportaciones de vivienda viajan por la nómina, aparte. Omitir la declaración o presentarla incompleta sí genera multa y pone el padrón en riesgo.",
  },
  {
    pregunta: "¿Cuándo se presenta?",
    respuesta:
      "Tres veces al año, el día 17: mayo (enero–abril), septiembre (mayo–agosto) y enero (septiembre–diciembre). Las mismas ventanas que el ICSOE. No es el día 17 de cada mes.",
  },
  {
    pregunta: "¿Qué datos pide?",
    respuesta:
      "Por cada trabajador asignado: nombre, NSS, RFC, salario diario integrado, empresa receptora y periodo del contrato. Tienen que cuadrar con el ICSOE y con la nómina. Un RFC o un NSS que no cuadre rechaza el lote.",
  },
  {
    pregunta: "¿Puedo presentarlo sin REPSE?",
    respuesta:
      "No tiene sentido. Sin padrón vigente no puedes operar el servicio especializado. El SISUB declara lo que ya prestaste con ese padrón. Primero el REPSE; después esta declaración.",
  },
  {
    pregunta: "¿En qué se diferencia del ICSOE?",
    respuesta:
      "Mismo periodo, misma plantilla, otra autoridad. SISUB va al INFONAVIT; ICSOE, al IMSS. Presentar uno y olvidar el otro deja el cuatrimestre a medias. El cliente grande suele pedir ambos acuses.",
  },
] as const;

export const SISUB_PASOS_DECLARACION = [
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
    text: "Nombre, NSS, RFC, SDI, contrato y empresa receptora. Cada trabajador debe estar ligado a un contrato de especialización vigente.",
  },
  {
    name: "Carga la declaración en el portal del INFONAVIT",
    text: "No es un CFDI ni un pago. Es un archivo o captura. Conserva el acuse: tu cliente lo va a pedir.",
  },
  {
    name: "Cruza con el ICSOE del mismo cuatrimestre",
    text: "Mismos trabajadores, otra autoridad. Presentar el SISUB y olvidar el ICSOE deja el cumplimiento a medias.",
  },
] as const;

export const SISUB_PASOS_CRUCE = [
  {
    name: "Misma gente que en el ICSOE",
    text: "Si un trabajador está en uno y no en el otro, alguna de las dos declaraciones está mal.",
  },
  {
    name: "El SDI debe cuadrar con el IMSS",
    text: "El salario diario integrado es el del movimiento afiliatorio, no un sueldo inventado para el archivo del INFONAVIT.",
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
    text: "SISUB e INFONAVIT, ICSOE e IMSS. Muchas empresas no liberan el pago sin los dos.",
  },
] as const;

export const SISUB_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cómo se declara" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "SISUB vs ICSOE" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const SISUB_VS_ICSOE = {
  titulo: "SISUB vs ICSOE",
  columnas: ["SISUB · INFONAVIT", "ICSOE · IMSS"] as const,
  filas: [
    {
      aspecto: "Qué es",
      valores: [
        "Declaración de subcontratación y trabajadores asignados",
        "Declaración de contratos y trabajadores asignados",
      ],
    },
    {
      aspecto: "Autoridad",
      valores: ["INFONAVIT", "IMSS"],
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
        "No. Es un acuse. Las aportaciones van por la nómina",
        "No. Es un acuse. Las cuotas IMSS van por la nómina",
      ],
    },
    {
      aspecto: "Plantilla",
      valores: [
        "Nombre, NSS, RFC, SDI, contrato y empresa receptora",
        "Los mismos datos. Tienen que cuadrar con el SISUB",
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

export const SISUB_CRITERIOS = [
  {
    n: "01",
    titulo: "Solo si ya estás en el REPSE",
    kicker: "Padrón primero",
    texto:
      "El SISUB declara lo que prestaste con el registro vigente. Sin padrón no hay declaración — y tampoco operación. La guía del registro es la de REPSE.",
  },
  {
    n: "02",
    titulo: "No es un pago ni un CFDI",
    kicker: "Acuse INFONAVIT",
    texto:
      "No se timbra. No se enteran aportaciones extra. Se carga un archivo o una captura y se guarda el acuse. Las aportaciones de vivienda viajan por la nómina, aparte.",
  },
  {
    n: "03",
    titulo: "Tres ventanas al año, día 17",
    kicker: "Mayo · septiembre · enero",
    texto:
      "Las mismas que el ICSOE. Enero–abril se declara en mayo; mayo–agosto, en septiembre; septiembre–diciembre, en enero.",
  },
  {
    n: "04",
    titulo: "Tiene que cuadrar con el ICSOE",
    kicker: "Misma plantilla",
    texto:
      "Mismo cuatrimestre, mismos trabajadores, otra autoridad. Presentar el SISUB y olvidar el ICSOE deja el periodo a medias.",
  },
] as const;

export const SISUB_DECLARACION_TILES = [
  {
    id: "que",
    corto: "Qué",
    titulo: "Gente asignada al cliente",
    fundamento: "INFONAVIT",
    texto:
      "Qué trabajadores pusiste en el sitio del cliente durante el cuatrimestre. No se declara la nómina entera: se declara la asignada a un contrato de especialización.",
  },
  {
    id: "cuando",
    corto: "Cuándo",
    titulo: "Día 17, tres veces al año",
    fundamento: "Cuatrimestral",
    texto:
      "Mayo, septiembre y enero. Las mismas ventanas que el ICSOE. El periodo que se declara es el cuatrimestre que ya cerró.",
  },
  {
    id: "pago",
    corto: "Pago",
    titulo: "No hay cuota extra",
    fundamento: "Acuse",
    texto:
      "El SISUB no se paga. Se presenta. Las aportaciones de vivienda siguen viajando por la nómina. El acuse es lo que el cliente te va a pedir.",
  },
] as const;

export const SISUB_CRUCE_TILES = [
  {
    id: "icsoe",
    corto: "ICSOE",
    titulo: "Misma gente, otra autoridad",
    fundamento: "IMSS",
    texto:
      "El ICSOE declara el mismo cuatrimestre ante el IMSS. Si el número de trabajadores no cuadra, alguna de las dos está mal.",
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
      "Cliente, objeto y vigencia. Un trabajador sin contrato de especialización no entra al SISUB, aunque esté en la nómina.",
  },
] as const;
