/**
 * Contenido de la guía 606 (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 */

export const ARRENDAMIENTO_FAQ = [
  {
    pregunta: "¿Qué es el régimen 606?",
    respuesta:
      "Es el régimen de arrendamiento de inmuebles (clave SAT 606). Aplica a la persona física que cobra renta por casa, departamento, local o bodega. El ISR se determina sobre la renta cobrada menos deducciones; la tarifa es la progresiva del artículo 96. El IVA va aparte: vivienda pura suele ir exenta; comercial o amueblada, al 16%.",
  },
  {
    pregunta: "¿El 35% es el impuesto que pago?",
    respuesta:
      "No. El 35% es una deducción opcional (art. 115 LISR), no una tasa. Restas el 35% de la renta cobrada, más el predial, y sobre esa base aplicas la tarifa de ISR. Quienes eligen esta vía no acumulan mantenimiento, seguros ni depreciación de ese inmueble.",
  },
  {
    pregunta: "¿Cuándo conviene el 35% y cuándo los comprobantes?",
    respuesta:
      "El 35% más predial conviene si tus gastos documentados (mantenimiento, seguros, intereses, depreciación) no llegan a ese porcentaje. Si el inmueble trae CFDI altos y depreciación, suele rendir más restar comprobantes. Se evalúa con tus números, no por default.",
  },
  {
    pregunta: "Si mi inquilino es empresa, ¿ya no declaro?",
    respuesta:
      "La persona moral te retiene 10% de ISR sobre la renta (art. 116 LISR) y, si hay IVA, normalmente 2/3 del IVA. Esa retención es un anticipo: la acreditas en tu declaración del día 17. La retención no cierra el mes.",
  },
  {
    pregunta: "¿La renta de casa habitación lleva IVA?",
    respuesta:
      "La vivienda para casa habitación, sin amueblar y sin servicios de hospedaje, está exenta de IVA. Exento no es tasa 0%: no cobras IVA y no lo acreditas. Si el inmueble va amueblado, con servicios, o es local comercial, oficina o bodega, el IVA es 16%. Mezclar ambos tipos en un mismo CFDI es el error que dispara requerimientos.",
  },
  {
    pregunta: "¿Puedo estar en RESICO si solo rento?",
    respuesta:
      "Sí, si calificas: ingresos hasta $3.5 MDP, sin las causales de exclusión. En RESICO el ISR es 1% a 2.5% sobre lo cobrado y no deduces gastos del inmueble. Si el 35% o tus comprobantes ya bajan mucho la base en 606, compara ambos escenarios antes de cambiar.",
  },
] as const;

export const ARRENDAMIENTO_PASOS_ISR = [
  {
    name: "Suma las rentas cobradas",
    text: "Entra lo efectivamente cobrado del mes, incluidos depósitos en garantía que no devolviste. No es lo pactado en el contrato si aún no te pagaron.",
  },
  {
    name: "Elige cómo deducir",
    text: "Opción 35%: restas ese porcentaje más el predial. Opción comprobantes: predial, mantenimiento, seguros, intereses y depreciación de la construcción, con CFDI.",
  },
  {
    name: "Aplica la tarifa y acredita retenciones",
    text: "Sobre la base se aplica la tarifa del artículo 96. Si tu inquilino es persona moral, el 10% que ya te retuvo se resta del ISR a cargo.",
  },
  {
    name: "Declara a más tardar el día 17",
    text: "Presenta ISR e IVA del mes en la misma fecha, sin mezclarlos. Vivienda exenta no genera IVA a cargo; el comercial sí.",
  },
] as const;

export const ARRENDAMIENTO_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cuánto se paga" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "35% vs CFDI" },
  { value: "simulador", label: "Calculadora" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const ARRENDAMIENTO_VS_DEDUCCION = {
  titulo: "Deducción del 35% vs comprobantes reales",
  columnas: ["Opción 35% + predial", "Comprobantes y depreciación"] as const,
  filas: [
    {
      aspecto: "Qué restas de la renta",
      valores: [
        "El 35% de lo cobrado, más el predial del inmueble",
        "Predial, mantenimiento, seguros, intereses y depreciación, con CFDI",
      ],
    },
    {
      aspecto: "El 35% no es el impuesto",
      valores: [
        "Es una deducción. Sobre lo que queda se aplica la tarifa del art. 96",
        "Tampoco: la tarifa va sobre la utilidad del inmueble, no sobre el bruto",
      ],
    },
    {
      aspecto: "Predial",
      valores: [
        "Sí se resta, aunque hayas elegido el 35%",
        "También se resta, con el recibo o línea de captura",
      ],
    },
    {
      aspecto: "Depreciación de la construcción",
      valores: [
        "No. Quedó sustituida por el 35%",
        "Sí: porcentaje autorizado sobre el valor de la construcción",
      ],
    },
    {
      aspecto: "IVA",
      valores: [
        "No cambia: vivienda exenta, comercial o amueblada al 16%",
        "Igual. El IVA no se mezcla con esta elección de ISR",
      ],
    },
    {
      aspecto: "Conviene si…",
      valores: [
        "Tus gastos documentados no llegan al 35% de la renta",
        "El inmueble trae CFDI altos, crédito hipotecario o construcción reciente",
      ],
    },
  ],
} as const;

export const ARRENDAMIENTO_CRITERIOS = [
  {
    n: "01",
    titulo: "Cobras renta de un inmueble",
    kicker: "Uso o goce temporal",
    texto:
      "Casa, departamento, local, oficina o bodega. Si el ingreso te lo paga el inquilino por habitar o usar el inmueble, este es el régimen de partida —clave SAT 606.",
  },
  {
    n: "02",
    titulo: "La vivienda y el local no se mezclan",
    kicker: "El IVA cambia según el uso",
    texto:
      "Casa habitación sin amueblar: IVA exento. Amueblada, con servicios, o local comercial: IVA 16%. El CFDI tiene que decir cuál es.",
  },
  {
    n: "03",
    titulo: "El 35% es una deducción",
    kicker: "No es la tasa de ISR",
    texto:
      "Puedes restar 35% de lo cobrado más predial, o ir por comprobantes y depreciación. En ambos casos, sobre la base se aplica la tarifa progresiva.",
  },
  {
    n: "04",
    titulo: "La empresa inquilina retiene",
    kicker: "10% de ISR en origen",
    texto:
      "Si quien te paga es persona moral, retiene 10% de ISR (y, si hay IVA, normalmente 2/3). Tú recibes el neto y acreditas esa retención el día 17.",
  },
] as const;
