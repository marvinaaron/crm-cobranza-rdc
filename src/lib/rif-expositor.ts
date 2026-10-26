/**
 * Contenido de la guía 621 (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 */

export const RIF_FAQ = [
  {
    pregunta: "¿Qué es el régimen 621?",
    respuesta:
      "Es la clave SAT del Régimen de Incorporación Fiscal (RIF). Desde 2022 no admite altas nuevas. Solo sigue vigente para quien ya estaba incorporado: tributa con las reglas de transición, beneficios decrecientes y declaraciones bimestrales, hasta completar sus 10 años o migrar.",
  },
  {
    pregunta: "¿Puedo darme de alta en RIF hoy?",
    respuesta:
      "No. La Ley de Ingresos de 2022 cerró el RIF para nuevas incorporaciones. Si arrancas actividad ahora, tu vía simplificada es RESICO (626), no el 621.",
  },
  {
    pregunta: "¿Hasta cuándo puedo quedarme en 621?",
    respuesta:
      "Hasta completar los 10 años desde tu alta en RIF, o antes si rebasas el tope o pides el cambio. Quien se incorporó al final de 2021 puede transitar cerca de 2031. El año 10 ya no hay reducción que valga la pena: hay que salir.",
  },
  {
    pregunta: "¿El RIF se declara el día 17 de cada mes?",
    respuesta:
      "No. El RIF es bimestral: seis periodos al año. Presentas a más tardar el día 17 del mes siguiente al bimestre (marzo, mayo, julio, septiembre, noviembre y enero). Confundirlo con el mensual de RESICO o 612 es el error más común.",
  },
  {
    pregunta: "¿Me conviene migrar a RESICO?",
    respuesta:
      "En la mayoría de los casos, sí: RESICO está vigente, se declara cada mes y las tasas (1% a 2.5% sobre lo cobrado) suelen ganar a un RIF de años avanzados, cuando la reducción ya es chica. Lo revisamos con tu año de incorporación y tus ingresos antes de mover el RFC.",
  },
  {
    pregunta: "¿Cuál es el tope de ingresos en RIF?",
    respuesta:
      "Dos millones de pesos al año. No es el tope de RESICO ($3.5 MDP). Si lo rebasas, sales del 621. Los ingresos de sueldos no se suman a ese tope, pero sí pueden obligarte a anual.",
  },
] as const;

export const RIF_PASOS_BIMESTRE = [
  {
    name: "Confirma que sigues en 621",
    text: "La constancia de situación fiscal debe traer la clave 621. Si el SAT ya te pasó a otro régimen, estas reglas no aplican.",
  },
  {
    name: "Cuenta tu año de incorporación",
    text: "El año 1 es el de tu alta en RIF. Ese número define el porcentaje de reducción de ISR (y del IVA, si usas el estímulo).",
  },
  {
    name: "Suma lo cobrado en el bimestre",
    text: "Dos meses, no uno. Ingresos de la actividad RIF efectivamente cobrados, amparados por CFDI.",
  },
  {
    name: "Aplica la tabla y la reducción",
    text: "Primero el ISR de la tabla del RIF; luego se reduce según tu año. En el año 8, por ejemplo, enteras el 70% de ese ISR.",
  },
  {
    name: "Declara el día 17 posterior al bimestre",
    text: "Seis fechas al año, no doce. El IVA del bimestre viaja en la misma declaración.",
  },
] as const;

export const RIF_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cómo se paga" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "621 vs RESICO" },
  { value: "simulador", label: "Ver RESICO" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const RIF_REDUCCION = [
  { anio: 1, reduccion: 100, aCargo: 0 },
  { anio: 2, reduccion: 90, aCargo: 10 },
  { anio: 3, reduccion: 80, aCargo: 20 },
  { anio: 4, reduccion: 70, aCargo: 30 },
  { anio: 5, reduccion: 60, aCargo: 40 },
  { anio: 6, reduccion: 50, aCargo: 50 },
  { anio: 7, reduccion: 40, aCargo: 60 },
  { anio: 8, reduccion: 30, aCargo: 70 },
  { anio: 9, reduccion: 20, aCargo: 80 },
  { anio: 10, reduccion: 10, aCargo: 90 },
] as const;

export const RIF_VS_RESICO = {
  titulo: "Quedarte en 621 vs salir a RESICO",
  columnas: ["En 621 · transitas", "En RESICO · si sales"] as const,
  filas: [
    {
      aspecto: "¿Puedo darme de alta?",
      valores: [
        "No. Cerrado desde 2022",
        "Sí, si calificas (tope $3.5 MDP y demás requisitos)",
      ],
    },
    {
      aspecto: "Periodicidad",
      valores: [
        "Bimestral · 6 declaraciones al año",
        "Mensual · día 17 de cada mes",
      ],
    },
    {
      aspecto: "ISR",
      valores: [
        "Tabla RIF × reducción según tu año de alta",
        "1.00% a 2.50% sobre lo cobrado (art. 113-F)",
      ],
    },
    {
      aspecto: "Tope de ingresos",
      valores: ["$2,000,000 al año", "$3,500,000 al año"],
    },
    {
      aspecto: "IVA",
      valores: [
        "Puede llevar la misma reducción del año, si no optaste por el IVA general",
        "IVA general. Esa reducción del RIF no viaja",
      ],
    },
    {
      aspecto: "Vigencia",
      valores: [
        "Se acaba a los 10 años de tu alta, o antes si sales o rebasas tope",
        "Régimen vigente. No tiene fecha de caducidad",
      ],
    },
  ],
} as const;

export const RIF_CRITERIOS = [
  {
    n: "01",
    titulo: "Ya estabas en RIF antes de 2022",
    kicker: "Clave SAT 621",
    texto:
      "Si tu RFC se dio de alta en RIF después de esa fecha, no es 621. Las altas nuevas no existen. Hoy el régimen simplificado vigente es RESICO.",
  },
  {
    n: "02",
    titulo: "La declaración es bimestral",
    kicker: "Seis veces al año",
    texto:
      "No es el día 17 de cada mes. Presentas al cierre de cada bimestre. Confundirlo con RESICO es el error que más requerimientos dispara.",
  },
  {
    n: "03",
    titulo: "La reducción depende de tu año de alta",
    kicker: "Tabla art. 111 LISR",
    texto:
      "Año 1: 100% de reducción. Año 10: 10%. El ISR de la tabla no desaparece: se descuenta ese porcentaje. Mientras más años lleves, menos conviene quedarse.",
  },
  {
    n: "04",
    titulo: "El destino natural es RESICO",
    kicker: "Art. 113-E LISR",
    texto:
      "Cuando se acaban tus 10 años, o cuando el número ya no cierra, sales a 626 si calificas, o a 612. No hay un RIF 2.0.",
  },
] as const;
