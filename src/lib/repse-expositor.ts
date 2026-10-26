/**
 * Contenido de la guía REPSE (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 *
 * No es un régimen del SAT. Es el padrón de la STPS (LFT arts. 13 y 15).
 * Vigencia: 3 años, no anual. ICSOE (IMSS) y SISUB (INFONAVIT) vienen después.
 * El contratante no deduce ISR ni acredita IVA sin verificar el padrón.
 * Tabla principal: padrón vs informes. No comparar REPSE vs 601.
 */

export const REPSE_FAQ = [
  {
    pregunta: "¿Qué es el REPSE?",
    respuesta:
      "Es el Registro de Prestadoras de Servicios Especializados u Obras Especializadas, ante la STPS. No es una clave SAT. Acredita que puedes poner a tus trabajadores en el sitio del cliente para un servicio especializado, no para el giro de él.",
  },
  {
    pregunta: "¿El REPSE es un régimen fiscal?",
    respuesta:
      "No. Te montas al padrón encima de tu régimen: 601, 612 u otro. El SAT no te da de alta en REPSE. La STPS sí. Confundirlo con una clave de RFC es el error más común.",
  },
  {
    pregunta: "¿Puedo subcontratar el personal de mi actividad principal?",
    respuesta:
      "No. El artículo 13 de la LFT lo prohíbe. El artículo 15 deja pasar solo servicios u obras especializados, distintos del objeto social y de la actividad preponderante del cliente. Limpieza en una planta puede calificar. Operarios de la línea, no.",
  },
  {
    pregunta: "¿Quién se inscribe y quién verifica?",
    respuesta:
      "El prestador se inscribe. El contratante verifica en el padrón público antes de pagar. Sin esa constancia vigente, el cliente no deduce el gasto ni acredita el IVA, y puede quedar solidario de la nómina y el IMSS de esa gente.",
  },
  {
    pregunta: "¿Se renueva cada año?",
    respuesta:
      "No. El artículo 15 de la LFT manda renovar cada tres años. Lo que sí es continuo: estar al corriente de SAT, IMSS e INFONAVIT. Si dejas de estarlo, la STPS puede cancelar el registro antes de que venzan los tres años.",
  },
  {
    pregunta: "¿Qué son el ICSOE y el SISUB?",
    respuesta:
      "Declaraciones cuatrimestrales que vienen después del padrón. ICSOE va al IMSS; SISUB, al INFONAVIT. Mismo periodo, dos autoridades, día 17 de mayo, septiembre y enero. No hay pago: hay acuse. Sin REPSE vigente no tienes nada que presentar — y tampoco puedes operar.",
  },
] as const;

export const REPSE_PASOS_PADRON = [
  {
    name: "Confirma que el servicio es especializado",
    text: "Debe ser distinto del objeto y de la actividad preponderante del cliente (arts. 13 y 15 LFT). Si es el núcleo de él, no hay padrón que lo salve.",
  },
  {
    name: "Ponte al corriente de SAT, IMSS e INFONAVIT",
    text: "La STPS cruza opiniones de cumplimiento. Un crédito fiscal o una omisión de cuotas echa abajo el trámite.",
  },
  {
    name: "Arma el expediente",
    text: "Acta o constancia de situación fiscal, objeto social, contratos de especialización y relación de trabajadores asignados. No basta maquilar nómina.",
  },
  {
    name: "Inscríbete en el portal de la STPS",
    text: "Con e.firma. El padrón es público: tu cliente va a buscarte ahí, no en una carta membretada.",
  },
  {
    name: "Renueva a los tres años y no dejes caducar obligaciones",
    text: "Tres años, no uno. Mientras tanto, ICSOE y SISUB cada cuatrimestre, y las opiniones de cumplimiento al corriente.",
  },
] as const;

export const REPSE_PASOS_INFORMES = [
  {
    name: "Confirma que el REPSE sigue vigente",
    text: "Sin padrón no hay ICSOE ni SISUB que presentar. Y tampoco hay operación legal.",
  },
  {
    name: "Arma la plantilla del cuatrimestre",
    text: "Nombre, NSS, RFC, SDI, contrato y cliente receptor. Cada trabajador debe estar ligado a un contrato de especialización.",
  },
  {
    name: "Presenta el ICSOE ante el IMSS",
    text: "Informe de contratos y trabajadores. No es un pago ni un CFDI: es un acuse. El IMSS cruza con tu nómina.",
  },
  {
    name: "Presenta el SISUB ante el INFONAVIT",
    text: "Mismo periodo, otra autoridad. Los datos tienen que cuadrar con el ICSOE. Presentar uno y olvidar el otro deja el cumplimiento a medias.",
  },
  {
    name: "Cierra el día 17 de mayo, septiembre o enero",
    text: "Tres ventanas al año, no doce. El cliente grande suele pedir ambos acuses antes de liberar el pago.",
  },
] as const;

export const REPSE_PASOS_FISCAL = [
  {
    name: "Pide la constancia vigente al prestador",
    text: "El contratante no se inscribe. Verifica. Una carta del proveedor no sustituye el padrón de la STPS.",
  },
  {
    name: "Cruza el padrón público",
    text: "Razón social, RFC y objeto del servicio. Si no aparece, no pagues como servicio especializado.",
  },
  {
    name: "Conserva el contrato de especialización",
    text: "Objeto, vigencia y que no sea tu actividad preponderante. El SAT lo pide cuando niega la deducción.",
  },
  {
    name: "Sin padrón, no deduces ni acreditas IVA",
    text: "Artículo 27 de la LISR y artículo 5 de la LIVA. La factura existe; el efecto fiscal, no.",
  },
  {
    name: "Si opera sin registro, hay solidaridad",
    text: "Nómina, IMSS e INFONAVIT de esa gente pueden caer en el contratante. No es solo una multa del prestador.",
  },
] as const;

export const REPSE_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cómo funciona" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "Padrón vs Declaraciones" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const REPSE_VS_INFORMES = {
  titulo: "Padrón STPS vs declaraciones cuatrimestrales",
  columnas: ["REPSE · padrón STPS", "ICSOE y SISUB · declaraciones"] as const,
  filas: [
    {
      aspecto: "Qué es",
      valores: [
        "El registro para poder prestar el servicio especializado",
        "Las declaraciones de lo que ya prestaste en el cuatrimestre",
      ],
    },
    {
      aspecto: "Autoridad",
      valores: ["STPS", "ICSOE: IMSS. SISUB: INFONAVIT"],
    },
    {
      aspecto: "Cuándo",
      valores: [
        "Alta, y renovación cada tres años",
        "Tres veces al año: mayo, septiembre y enero, día 17",
      ],
    },
    {
      aspecto: "Hay pago",
      valores: [
        "No. Es un registro. Sí exiges opiniones de cumplimiento al corriente",
        "No. Es un acuse, no una cuota extra",
      ],
    },
    {
      aspecto: "Si no lo tienes",
      valores: [
        "No puedes poner personal en el sitio del cliente. Él no deduce ni acredita IVA",
        "Multas, cliente que no te paga, y el padrón en riesgo",
      ],
    },
    {
      aspecto: "Orden",
      valores: [
        "Primero el padrón. Sin él, las declaraciones no aplican — y tampoco la operación",
        "Después del padrón, cada cuatrimestre. Los dos, no uno",
      ],
    },
  ],
} as const;

export const REPSE_CRITERIOS = [
  {
    n: "01",
    titulo: "No es un régimen del SAT",
    kicker: "Padrón STPS",
    texto:
      "Se monta encima de 601 o 612. La STPS te inscribe; el SAT no. Si buscas una clave de RFC, esta no es.",
  },
  {
    n: "02",
    titulo: "Solo especialización, nunca el núcleo",
    kicker: "Arts. 13 y 15 LFT",
    texto:
      "El artículo 13 prohíbe subcontratar la actividad preponderante del cliente. El 15 deja pasar el servicio especializado, con padrón.",
  },
  {
    n: "03",
    titulo: "El prestador se inscribe; el cliente verifica",
    kicker: "Dos lados",
    texto:
      "Tú, si pones gente en sitio ajeno. Él, si te paga. Sin constancia vigente, su factura no le sirve de deducción ni de IVA.",
  },
  {
    n: "04",
    titulo: "ICSOE y SISUB vienen después",
    kicker: "Tres veces al año",
    texto:
      "IMSS e INFONAVIT, mismo cuatrimestre, día 17 de mayo, septiembre y enero. El padrón es el permiso. Esas dos son las declaraciones.",
  },
] as const;

export const REPSE_PADRON_TILES = [
  {
    id: "especializado",
    corto: "Especializado",
    titulo: "Servicio u obra distintos del cliente",
    fundamento: "Art. 15 LFT",
    texto:
      "Limpieza, seguridad, mantenimiento, TI en sitio, obra especializada. Tienen que ser distintos del objeto social y de la actividad preponderante de quien te contrata.",
  },
  {
    id: "nucleo",
    corto: "Núcleo",
    titulo: "La actividad preponderante está prohibida",
    fundamento: "Art. 13 LFT",
    texto:
      "No puedes poner en la planta del cliente a la gente que hace lo que él hace. Eso era el outsourcing que se cerró en 2021. El padrón no lo blanquea.",
  },
  {
    id: "vigencia",
    corto: "Vigencia",
    titulo: "Tres años, no uno",
    fundamento: "Art. 15 LFT",
    texto:
      "Se renueva cada tres años. Lo continuo es estar al corriente de SAT, IMSS e INFONAVIT: sin opiniones de cumplimiento, la STPS puede darte de baja antes.",
  },
] as const;

export const REPSE_INFORME_TILES = [
  {
    id: "icsoe",
    corto: "ICSOE",
    titulo: "Informe de contratos al IMSS",
    fundamento: "IMSS · cuatrimestral",
    texto:
      "Contratos y trabajadores asignados. NSS, RFC, SDI y cliente receptor. El IMSS lo cruza con tu nómina.",
  },
  {
    id: "sisub",
    corto: "SISUB",
    titulo: "Informe de subcontratación al INFONAVIT",
    fundamento: "INFONAVIT · cuatrimestral",
    texto:
      "Mismos trabajadores, otra autoridad. Presentar el ICSOE y olvidar el SISUB deja el cuatrimestre a medias.",
  },
] as const;

export const REPSE_FISCAL_TILES = [
  {
    id: "isr",
    corto: "ISR",
    titulo: "Sin padrón, no se deduce",
    fundamento: "Art. 27 LISR",
    texto:
      "El contratante no puede deducir el pago por servicios especializados si el prestador no está en el REPSE. La factura no alcanza.",
  },
  {
    id: "iva",
    corto: "IVA",
    titulo: "Sin padrón, no se acredita",
    fundamento: "Art. 5 LIVA",
    texto:
      "El IVA de ese servicio no es acreditable para el cliente. Mismo requisito: constancia vigente y contrato de especialización.",
  },
  {
    id: "solidaria",
    corto: "Solidaria",
    titulo: "Nómina e IMSS pueden caer en el cliente",
    fundamento: "Art. 14 LFT",
    texto:
      "Si el prestador incumple con esa gente, el beneficiario responde. Verificar el padrón no es un favor: es su defensa.",
  },
] as const;
