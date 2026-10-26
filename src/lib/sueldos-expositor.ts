/**
 * Contenido de la guía 605 (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 */

export const SUELDOS_FAQ = [
  {
    pregunta: "¿Qué es el régimen 605?",
    respuesta:
      "Es el régimen de sueldos y salarios e ingresos asimilados (clave SAT 605). Aplica a quien cobra por una relación de subordinación o por pagos asimilados a salarios (consejeros, honorarios asimilados, etc.). El patrón retiene el ISR cada mes; tú normalmente no presentas pago provisional el día 17.",
  },
  {
    pregunta: "Si mi patrón ya retiene, ¿yo no hago nada?",
    respuesta:
      "La retención es un anticipo, no el cierre del año. Si tuviste un solo patrón, menos de $400,000 y no quieres aplicar deducciones personales, el patrón puede haber cubierto el ejercicio. En cualquier otro caso —dos patrones, más de $400,000, otros ingresos o saldo a favor— la declaración anual de abril es tuya.",
  },
  {
    pregunta: "¿Cuándo es obligatoria la declaración anual?",
    respuesta:
      "Si obtuviste ingresos de dos o más patrones, si tus salarios del año rebasan $400,000, si también tuviste otros ingresos (rentas, actividad empresarial, etc.), o si el patrón no hizo el cálculo anual. También puedes presentarla de forma voluntaria para recuperar ISR con deducciones personales.",
  },
  {
    pregunta: "¿El sueldo lleva IVA?",
    respuesta:
      "No. Los sueldos y los asimilados a salarios no se gravan con IVA. El CFDI de nómina no traslada 16%. Si además facturas por honorarios o rentas, ese otro ingreso sí puede llevar IVA: no se mezcla con el 605.",
  },
  {
    pregunta: "¿Qué son los ingresos asimilados a salarios?",
    respuesta:
      "Pagos que la ley trata como salario aunque no haya una relación laboral clásica: miembros de consejos, honorarios asimilados, comisionistas en ciertos supuestos (art. 94 LISR). El pagador retiene ISR como si fueras empleado; el IVA, si aplica, va por otra vía.",
  },
  {
    pregunta: "¿Lo que me retuvieron es una deducción personal?",
    respuesta:
      "No. La retención del patrón se acredita contra el ISR anual: es un anticipo. Las deducciones personales (médicos, hipotecarios, colegiaturas, AFORE, donativos) son otra cosa: restan de la base, con CFDI, y tienen topes. Sin confundirlas.",
  },
] as const;

export const SUELDOS_PASOS_ANUAL = [
  {
    name: "Reúne los CFDI de nómina",
    text: "De todos los patrones del año, incluidos finiquitos, aguinaldo y PTU. El SAT ya los tiene; tú los contrastas.",
  },
  {
    name: "Revisa si estás obligado",
    text: "Dos o más patrones, más de $400,000, otros ingresos, o el patrón no hizo el cálculo anual. Si no, aún puedes declarar para recuperar saldo a favor.",
  },
  {
    name: "Suma gravado y retenciones",
    text: "Las percepciones gravadas del año menos lo exento (aguinaldo y PTU hasta el tope). Las retenciones del patrón se acreditan; no se restan como gasto.",
  },
  {
    name: "Aplica deducciones personales",
    text: "Médicos, dentales, hipotecarios, colegiaturas, AFORE y donativos, con CFDI. Sin factura válida, el SAT no las toma.",
  },
  {
    name: "Presenta en abril",
    text: "La declaración anual de persona física se presenta en abril. El resultado puede ser saldo a favor (devolución) o a cargo.",
  },
] as const;

export const SUELDOS_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cómo se paga" },
  { value: "limites", label: "Quién entra" },
  { value: "deducciones", label: "Deducciones" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "Nómina vs anual" },
  { value: "simulador", label: "Tarifas ISR" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const SUELDOS_COLEGIATURAS_TOPES = [
  { nivel: "Preescolar", tope: 14_200 },
  { nivel: "Primaria", tope: 12_900 },
  { nivel: "Secundaria", tope: 19_900 },
  { nivel: "Profesional técnico", tope: 17_100 },
  { nivel: "Bachillerato", tope: 24_500 },
] as const;

export type SueldosDeduccionId =
  | "medicos"
  | "colegiaturas"
  | "hipotecarios"
  | "afore"
  | "donativos"
  | "seguros"
  | "funerarios"
  | "transporte";

export type SueldosDeduccion = {
  id: SueldosDeduccionId;
  corto: string;
  titulo: string;
  fundamento: string;
  queEs: string;
  entraAlConjunto: boolean;
  topeCorto: string;
  comoSaber: { label: string; texto: string }[];
  cfdi: string;
  herramienta?: { href: string; label: string };
};

export const SUELDOS_DEDUCCIONES: SueldosDeduccion[] = [
  {
    id: "medicos",
    corto: "Médicos",
    titulo: "Honorarios médicos, dentales y hospitalarios",
    fundamento: "Art. 151 fracc. I LISR",
    queEs:
      "Consultas, dentista, hospital, análisis, enfermería y prótesis para ti, tu cónyuge o tus ascendientes y descendientes. Los lentes tienen un tope aparte.",
    entraAlConjunto: true,
    topeCorto: "Tope conjunto",
    comoSaber: [
      {
        label: "Tope conjunto",
        texto:
          "Se suma con funerarios, seguros y transporte. El SAT toma el menor entre 15% de tus ingresos del año y 5 UMA anuales.",
      },
      {
        label: "Lentes",
        texto: "$2,500 por persona al año, con receta. Ese monto sí entra al conjunto.",
      },
      {
        label: "Discapacidad",
        texto:
          "Si el gasto es por invalidez o incapacidad, no entra al tope de 15% / 5 UMA.",
      },
    ],
    cfdi: "CFDI a tu RFC. Págala con transferencia, tarjeta o cheque: el efectivo no cuenta.",
    herramienta: { href: "/herramientas/uma", label: "Ver UMA vigente" },
  },
  {
    id: "colegiaturas",
    corto: "Colegiaturas",
    titulo: "Colegiaturas",
    fundamento: "Decreto de estímulos · no es art. 151",
    queEs:
      "Colegiaturas de escuelas con autorización o reconocimiento de validez oficial. Es un estímulo: no entra al tope de 15% / 5 UMA. La universidad no aplica.",
    entraAlConjunto: false,
    topeCorto: "Tope por nivel",
    comoSaber: [
      {
        label: "Por nivel y por alumno",
        texto:
          "El tope es anual y por cada hijo. La tabla de abajo es la del decreto; la universidad no entra.",
      },
      {
        label: "Qué no entra",
        texto:
          "Inscripción, uniformes, transporte y licenciatura no son colegiatura deducible.",
      },
    ],
    cfdi: "El CFDI debe decir «colegiatura» y el nivel educativo. A tu RFC.",
  },
  {
    id: "hipotecarios",
    corto: "Hipoteca",
    titulo: "Intereses reales de crédito hipotecario",
    fundamento: "Art. 151 fracc. IV LISR",
    queEs:
      "El interés real (interés menos inflación) de un crédito para tu casa habitación. No es el pago completo de la mensualidad: solo la parte de interés real.",
    entraAlConjunto: false,
    topeCorto: "750 mil UDIs",
    comoSaber: [
      {
        label: "Tope del crédito",
        texto:
          "El principal original no debe rebasar 750,000 UDIs. Convierte con la UDI del día en que contrataste, no con el peso de hoy.",
      },
      {
        label: "Constancia",
        texto:
          "El banco o Infonavit emite la constancia de intereses reales. Ese es el dato que usa el SAT, no el estado de cuenta.",
      },
    ],
    cfdi: "Constancia del crédito a tu RFC. Un inmueble, casa habitación.",
    herramienta: { href: "/herramientas/tipo-de-cambio", label: "Consultar UDI" },
  },
  {
    id: "afore",
    corto: "AFORE",
    titulo: "Aportaciones voluntarias a AFORE",
    fundamento: "Art. 151 fracc. V LISR",
    queEs:
      "Aportaciones complementarias de retiro o voluntarias a tu cuenta individual. No es la cuota obligatoria que ya descuenta tu patrón.",
    entraAlConjunto: false,
    topeCorto: "10% o 5 UMA",
    comoSaber: [
      {
        label: "Tope propio",
        texto:
          "El menor entre el 10% de tus ingresos acumulables del año y 5 UMA anuales. No se mezcla con médicos ni funerarios.",
      },
      {
        label: "5 UMA",
        texto: "5 × UMA anual del ejercicio. El valor vigente está en la herramienta UMA.",
      },
    ],
    cfdi: "La AFORE timbra el CFDI de la aportación voluntaria a tu RFC.",
    herramienta: { href: "/herramientas/uma", label: "Ver UMA vigente" },
  },
  {
    id: "donativos",
    corto: "Donativos",
    titulo: "Donativos a donatarias autorizadas",
    fundamento: "Art. 151 fracc. III LISR",
    queEs:
      "Donativos a instituciones con autorización del SAT. No cualquier causa ni transferencia a un particular.",
    entraAlConjunto: false,
    topeCorto: "7% de ingresos",
    comoSaber: [
      {
        label: "Tope propio",
        texto:
          "Hasta el 7% de tus ingresos acumulables. Si donas a la Federación, estados o municipios, el tope sube al 8%.",
      },
      {
        label: "Lista SAT",
        texto:
          "La donataria debe aparecer en el padrón de autorizadas del ejercicio. Sin esa clave, el SAT no lo toma.",
      },
    ],
    cfdi: "CFDI de donativo con el complemento correspondiente, a tu RFC.",
  },
  {
    id: "seguros",
    corto: "Seguros",
    titulo: "Primas de seguros de gastos médicos",
    fundamento: "Art. 151 fracc. VI LISR",
    queEs:
      "La prima de un seguro de gastos médicos mayores para ti o tu familia. No es el deducible del siniestro: es lo que pagaste de póliza.",
    entraAlConjunto: true,
    topeCorto: "Tope conjunto",
    comoSaber: [
      {
        label: "Tope conjunto",
        texto:
          "Se suma con médicos, funerarios y transporte. El SAT toma el menor entre 15% de tus ingresos y 5 UMA anuales.",
      },
    ],
    cfdi: "CFDI de la aseguradora a tu RFC. Conserva la póliza del año que declaras.",
    herramienta: { href: "/herramientas/uma", label: "Ver UMA vigente" },
  },
  {
    id: "funerarios",
    corto: "Funerarios",
    titulo: "Gastos funerarios",
    fundamento: "Art. 151 fracc. II LISR",
    queEs:
      "Gastos de funeral de tu cónyuge o de tus ascendientes y descendientes. Servicio, ataúd, cremación o panteón.",
    entraAlConjunto: true,
    topeCorto: "1 UMA anual",
    comoSaber: [
      {
        label: "Tope propio y conjunto",
        texto:
          "No puede rebasar 1 UMA anual. Además entra al tope conjunto de 15% / 5 UMA.",
      },
      {
        label: "1 UMA",
        texto: "Es la UMA anual del ejercicio. El valor vigente está en la herramienta UMA.",
      },
    ],
    cfdi: "CFDI a tu RFC. El concepto debe ser el servicio funerario.",
    herramienta: { href: "/herramientas/uma", label: "Ver UMA vigente" },
  },
  {
    id: "transporte",
    corto: "Transporte",
    titulo: "Transporte escolar obligatorio",
    fundamento: "Art. 151 fracc. VII LISR",
    queEs:
      "Solo si la escuela lo exige como obligatorio. El camión opcional o el Uber a la escuela no cuentan.",
    entraAlConjunto: true,
    topeCorto: "Tope conjunto",
    comoSaber: [
      {
        label: "Tope conjunto",
        texto:
          "Se suma con médicos, funerarios y seguros. El SAT toma el menor entre 15% de tus ingresos y 5 UMA anuales.",
      },
      {
        label: "Obligatorio",
        texto:
          "Pide a la escuela que el CFDI o una constancia digan que el transporte es requisito de inscripción.",
      },
    ],
    cfdi: "CFDI a tu RFC, con el carácter de obligatorio. Sin eso, no baja la base.",
    herramienta: { href: "/herramientas/uma", label: "Ver UMA vigente" },
  },
];

export const SUELDOS_VS_ANUAL = {
  titulo: "Lo que hace el patrón vs lo que haces tú",
  columnas: ["Cada mes · el patrón", "En abril · tú"] as const,
  filas: [
    {
      aspecto: "Quién calcula el ISR",
      valores: [
        "El patrón, con la tarifa del artículo 96",
        "Tú (con tu contador), con ingresos y retenciones del año",
      ],
    },
    {
      aspecto: "Qué documento manda",
      valores: [
        "CFDI de nómina cada periodo",
        "Declaración anual de persona física",
      ],
    },
    {
      aspecto: "El día 17",
      valores: [
        "El patrón entera las retenciones al SAT",
        "No aplica. La anual es en abril, no el día 17",
      ],
    },
    {
      aspecto: "IVA",
      valores: [
        "El sueldo no lleva IVA",
        "Tampoco. Si facturas otra actividad, ese IVA va aparte",
      ],
    },
    {
      aspecto: "Deducciones personales",
      valores: [
        "No se aplican en la nómina mensual",
        "Sí: médicos, hipotecarios, colegiaturas, AFORE, donativos",
      ],
    },
    {
      aspecto: "Obligatorio si…",
      valores: [
        "Siempre: el patrón retiene aunque tú no declares",
        "Dos patrones, más de $400,000, otros ingresos, o quieres devolución",
      ],
    },
  ],
} as const;

export const SUELDOS_CRITERIOS = [
  {
    n: "01",
    titulo: "Te pagan por subordinación o asimilado",
    kicker: "Clave SAT 605",
    texto:
      "Sueldo de un patrón, o pagos que la ley trata como salario (consejos, honorarios asimilados). Si facturas por cuenta propia, ese ingreso no es 605.",
  },
  {
    n: "02",
    titulo: "El patrón retiene el ISR",
    kicker: "Arts. 96 y 97 LISR",
    texto:
      "Cada mes aplica la tarifa, retiene y entera. Tú no presentas pago provisional de sueldos el día 17. La retención es un anticipo de tu anual.",
  },
  {
    n: "03",
    titulo: "La anual no es el día 17",
    kicker: "Abril · art. 98 LISR",
    texto:
      "Si tuviste dos patrones, más de $400,000 u otros ingresos, la declaración es tuya y se presenta en abril. El patrón no la sustituye.",
  },
  {
    n: "04",
    titulo: "Deducciones personales, no de negocio",
    kicker: "Art. 151 LISR",
    texto:
      "Médicos, colegiaturas, intereses hipotecarios, AFORE y donativos. No son gastos del patrón. Sin CFDI, no bajan la base.",
  },
] as const;
