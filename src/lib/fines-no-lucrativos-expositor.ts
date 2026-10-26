/**
 * Contenido de la guía 603 (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 *
 * Título III: el ISR del objeto social no se causa; lo no relacionado sí, al 30%.
 * Donataria (art. 82) es otra autorización: para que el donante deduzca.
 * IVA: no se apaga por ser 603. La DIOT viaja con el IVA, si hay actos gravados.
 * Anual: febrero (art. 86), no marzo. No comparar 603 vs 601 como tabla principal.
 */

export const FNL_FAQ = [
  {
    pregunta: "¿Qué es el régimen 603?",
    respuesta:
      "Es la clave SAT de las personas morales con fines no lucrativos (Título III de la LISR): asociaciones civiles, fundaciones, colegios, cámaras e instituciones de asistencia. El ISR del objeto social no se causa. Eso no apaga el IVA, no te hace donataria y no te permite repartir remanentes a los asociados.",
  },
  {
    pregunta: "¿Estar en 603 me exenta de ISR?",
    respuesta:
      "Del objeto social, sí, si cumples los artículos 79 y 80: los ingresos se aplican a los fines y no se distribuyen a asociados. Lo que no tiene que ver con el objeto —una actividad mercantil ajena— sí genera ISR al 30% sobre esa utilidad. La clave 603 en el RFC no basta si dejas de cumplir.",
  },
  {
    pregunta: "¿Ser asociación civil me hace donataria autorizada?",
    respuesta:
      "No. La donataria es otra autorización del SAT (art. 82). Sin ella puedes operar en 603, pero tus donantes no deducen. Con ella emites CFDI de donativo, publicas el informe de transparencia y entras al padrón. Confundir las dos es el error más común.",
  },
  {
    pregunta: "¿El IVA también queda exento?",
    respuesta:
      "No. El IVA no copia al ISR. Un donativo no es contraprestación, así que no causa IVA. Si cobras un servicio o vendes un bien gravado, el IVA nace cuando te pagan (art. 1-B LIVA). Algunos actos de enseñanza o asistencia van exentos por el artículo 15 de la LIVA, no por ser 603. La DIOT viaja con el IVA.",
  },
  {
    pregunta: "¿Cuándo se presenta la declaración anual?",
    respuesta:
      "En febrero, a más tardar el día 15 (art. 86, fracción III). Marzo es de persona moral lucrativa (601). Abril es de persona física. Si eres donataria, el informe de transparencia es otra fecha, no sustituye a la anual.",
  },
  {
    pregunta: "¿Qué pasa con el remanente si se disuelve la asociación?",
    respuesta:
      "No se reparte a asociados. El artículo 80 manda destinarlo a otra entidad del Título III o donataria. Si se entrega a particulares, se considera remanente distribuible y se causa ISR.",
  },
] as const;

export const FNL_PASOS_TITULO = [
  {
    name: "Confirma que tu objeto entra al artículo 79",
    text: "Asistencia, educación, cultura, gremio, culto. Si el fin principal es lucro, el régimen de partida es 601, no este.",
  },
  {
    name: "Separa ingresos del objeto y los ajenos",
    text: "Cuotas, donativos y actividades estatutarias de un lado. Lo mercantil no relacionado, del otro.",
  },
  {
    name: "Aplica el 100% a los fines",
    text: "El artículo 80 prohíbe repartir remanentes a asociados. El destino exclusivo es lo que sostiene la exención.",
  },
  {
    name: "Si hay ingresos no relacionados, determina el 30%",
    text: "Sobre la utilidad de esa actividad, como persona moral. El objeto social sigue sin ISR.",
  },
  {
    name: "Declara en febrero",
    text: "A más tardar el 15 (art. 86). Marzo es de 601. Ahí se informa el remanente, no se reparte.",
  },
] as const;

export const FNL_PASOS_DONATARIA = [
  {
    name: "Verifica el padrón de autorizadas",
    text: "La autorización del artículo 82 se publica. Si no estás en el padrón del ejercicio, el donante no deduce.",
  },
  {
    name: "Emite CFDI de donativo, no de ingreso",
    text: "El comprobante es el que permite la deducción del donante. Una factura de honorarios no sustituye el recibo de donativo.",
  },
  {
    name: "Aplica los donativos a los fines autorizados",
    text: "No a gastos ajenos ni a beneficios de asociados. El SAT cruza uso de recursos con el objeto de la autorización.",
  },
  {
    name: "Presenta el informe de transparencia",
    text: "Estados, montos recibidos y aplicación. Es del artículo 82 y la RMF, no del 32-D del CFF. Otra fecha que la anual de febrero.",
  },
  {
    name: "Renueva antes de que caduque",
    text: "Sin vigencia, dejas de ser donataria aunque sigas en 603. Los donantes de ese periodo ya no deducen.",
  },
] as const;

export const FNL_PASOS_IVA = [
  {
    name: "Distingue donativo de contraprestación",
    text: "El donativo no causa IVA. Si cobras un precio por un bien o un servicio, puede haber IVA aunque seas 603.",
  },
  {
    name: "Revisa si el acto va exento por la LIVA",
    text: "Enseñanza e asistencia pueden ir exentos por el artículo 15, no por la clave 603. Exento no es tasa 0%.",
  },
  {
    name: "Si hay IVA, nació cuando cobraste",
    text: "Art. 1-B LIVA: se causa con el pago, no con el CFDI. Igual que en 601, distinto del ISR del Título III.",
  },
  {
    name: "Arma la DIOT si operaste con terceros",
    text: "Viaja con el IVA, no con la anual de febrero. Sirve para cruzar el IVA acreditable.",
  },
  {
    name: "Declara el día 17 y retén si pagas a terceros",
    text: "IVA y retenciones de honorarios, rentas o salarios no se apagan por ser asociación. El sueldo no lleva IVA.",
  },
] as const;

export const FNL_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cómo se paga" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "Título vs Donataria" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const FNL_VS_DONATARIA = {
  titulo: "Título III vs donataria autorizada",
  columnas: ["Título III · clave 603", "Donataria · art. 82"] as const,
  filas: [
    {
      aspecto: "Qué autoriza",
      valores: [
        "Que el ISR del objeto social no se cause, si aplicas los recursos a los fines",
        "Que el donante deduzca el donativo en su declaración",
      ],
    },
    {
      aspecto: "Quién se beneficia",
      valores: [
        "La organización: no paga ISR de cuotas, donativos y actividades estatutarias",
        "El donante: persona física (tope art. 151) o moral (art. 27)",
      ],
    },
    {
      aspecto: "¿Es automática?",
      valores: [
        "No. Hay que caber en el artículo 79 y cumplir el 80. La clave 603 no basta sola",
        "No. Pides autorización, entras al padrón y la renovas",
      ],
    },
    {
      aspecto: "Comprobante",
      valores: [
        "CFDI de ingreso si cobras un servicio. No es recibo de donativo deducible",
        "CFDI de donativo. Sin ese comprobante, el donante no deduce",
      ],
    },
    {
      aspecto: "Transparencia",
      valores: [
        "Contabilidad y anual de febrero (art. 86)",
        "Informe de transparencia y publicación de recursos (art. 82 y RMF 3.10)",
      ],
    },
    {
      aspecto: "Si no la tienes",
      valores: [
        "Puedes operar en 603. No eres 601 por eso",
        "Sigues en 603, pero tus donantes no deducen",
      ],
    },
  ],
} as const;

export const FNL_CRITERIOS = [
  {
    n: "01",
    titulo: "Eres una persona moral sin fines de lucro",
    kicker: "Clave SAT 603",
    texto:
      "A.C., fundación, colegio, cámara o institución de asistencia. Si la sociedad es lucrativa —S.A., S. de R.L.— el régimen de partida es 601, no este.",
  },
  {
    n: "02",
    titulo: "El ISR del objeto no se causa",
    kicker: "Arts. 79 y 80 LISR",
    texto:
      "Cuotas, donativos y actividades estatutarias, si se aplican a los fines. Lo no relacionado sí paga 30% sobre esa utilidad. El remanente no se reparte a asociados.",
  },
  {
    n: "03",
    titulo: "La donataria es otra autorización",
    kicker: "Art. 82 LISR",
    texto:
      "Sirve para que el donante deduzca. Recibos de donativo, padrón e informe de transparencia. Una A.C. puede vivir en 603 toda su vida sin ser donataria.",
  },
  {
    n: "04",
    titulo: "El IVA y las retenciones siguen",
    kicker: "LIVA 1-B · DIOT",
    texto:
      "Donar no causa IVA. Cobrar un servicio gravado, sí. Si hay IVA, hay DIOT. Si hay nómina u honorarios, retienes. Nada de eso se apaga por ser 603.",
  },
] as const;

export const FNL_TITULO_TILES = [
  {
    id: "objeto",
    corto: "Objeto",
    titulo: "Sin ISR del objeto social",
    fundamento: "Arts. 79 y 80 LISR",
    texto:
      "Cuotas, donativos y actividades estatutarias, aplicados a los fines. Eso es lo que la gente llama «exento». No es una tasa 0%: el ISR de ese ingreso no se causa.",
  },
  {
    id: "ajeno",
    corto: "Ajeno",
    titulo: "30% de lo no relacionado",
    fundamento: "Art. 80 LISR",
    texto:
      "Si vendes o prestas algo ajeno al objeto, esa utilidad sí paga ISR al 30%, como persona moral. El resto del Título III no se contagia.",
  },
  {
    id: "remanente",
    corto: "Remanente",
    titulo: "No se reparte a asociados",
    fundamento: "Art. 80 LISR",
    texto:
      "Al disolverse va a otra entidad del Título III o donataria. Entregarlo a particulares lo convierte en remanente distribuible y causa ISR.",
  },
] as const;

export const FNL_DONATARIA_TILES = [
  {
    id: "padron",
    corto: "Padrón",
    titulo: "Autorización publicada",
    fundamento: "Art. 82 LISR",
    texto:
      "El SAT publica quién puede emitir donativos deducibles ese ejercicio. Fuera del padrón, el donante no deduce aunque le des un recibo.",
  },
  {
    id: "recibo",
    corto: "Recibo",
    titulo: "CFDI de donativo",
    fundamento: "Art. 82 · CFDI",
    texto:
      "No es una factura de ingreso. El comprobante de donativo es el que viaja a la anual del donante. Sin él, la deducción no existe.",
  },
  {
    id: "transparencia",
    corto: "Transparencia",
    titulo: "Informe de recursos",
    fundamento: "Art. 82 · RMF 3.10",
    texto:
      "Cuánto recibiste y en qué se aplicó. Es condición de la autorización, otra fecha que la anual de febrero. No es el artículo 32-D del CFF.",
  },
] as const;
