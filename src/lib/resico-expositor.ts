/**
 * Contenido de la guía RESICO (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 */

export const RESICO_FAQ = [
  {
    pregunta: "¿Qué es RESICO persona física?",
    respuesta:
      "El Régimen Simplificado de Confianza (RESICO) es el esquema del SAT para personas físicas con actividad empresarial, profesional o arrendamiento cuyos ingresos anuales no superan 3.5 millones de pesos. Usa la clave 626. El ISR se calcula con tasas fijas del 1% al 2.5% sobre ingresos efectivamente cobrados, sin deducir gastos operativos.",
  },
  {
    pregunta: "¿El IVA desaparece en RESICO?",
    respuesta:
      "No. RESICO simplifica principalmente el ISR. El IVA se determina por separado: normalmente se traslada al cliente (con frecuencia 16%) y el pago mensual es el IVA cobrado menos el IVA acreditable que cumpla requisitos. La tasa y el acreditamiento dependen de tu actividad y de tus CFDI.",
  },
  {
    pregunta: "¿Conviene RESICO si tengo muchos gastos?",
    respuesta:
      "No siempre. En RESICO los gastos operativos no bajan la base de ISR. Si deduces mucho en el régimen general (clave 612), esa tarifa sobre utilidad puede salir más barata que el 1%–2.5% sobre ingreso bruto. Conviene comparar ambos escenarios con un contador según tu nivel de gastos.",
  },
  {
    pregunta: "¿Qué pasa si rebaso el tope de 3.5 millones?",
    respuesta:
      "Debes revisar el cambio de régimen desde el momento que corresponda, no esperar a la declaración anual. Superar el tope de ingresos anuales implica salir de RESICO y pasar a un esquema como actividades empresariales (612), con otras reglas de ISR y contabilidad.",
  },
  {
    pregunta: "¿Cuándo se presenta la declaración mensual?",
    respuesta:
      "A más tardar el día 17 del mes siguiente al que se declara. Ejemplo: los ingresos cobrados en mayo se declaran a más tardar el 17 de junio. El ISR de RESICO usa ingresos cobrados; el IVA, por regla general, sigue el criterio de lo facturado en el mes.",
  },
  {
    pregunta: "¿Qué documentos debo tener listos?",
    respuesta:
      "Constancia de situación fiscal, e.firma o contraseña SAT, CFDI emitidos y recibidos, control de cobros (para saber qué se cobró en el mes) y una revisión de compatibilidad si tienes socios, ingresos por plataformas o varias actividades.",
  },
] as const;

export const RESICO_PASOS_ISR = [
  {
    name: "Suma lo cobrado en el mes",
    text: "Identifica los ingresos efectivamente cobrados (transferencias, efectivo, depósitos). No incluyas lo facturado si aún no te pagan.",
  },
  {
    name: "Aplica la tasa del artículo 113-F",
    text: "Ubica el total cobrado en la tarifa RESICO: 1.00%, 1.10%, 1.50%, 2.00% o 2.50% según el rango del mes.",
  },
  {
    name: "No restes gastos ni meses anteriores",
    text: "El ISR de cada mes se calcula solo sobre lo cobrado en ese mes. Los gastos operativos no bajan la base y los pagos de meses previos no se restan aquí.",
  },
  {
    name: "Declara a más tardar el día 17",
    text: "Presenta la declaración mensual y paga antes del día 17 del mes siguiente.",
  },
] as const;

export const RESICO_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cuánto se paga" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "626 vs 612" },
  { value: "simulador", label: "Simular ISR" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

/** Tabla 626 vs 612 para sentarse con el cliente (más completa que la guía genérica). */
export const RESICO_VS_612 = {
  titulo: "RESICO (626) vs Actividades empresariales (612)",
  columnas: ["RESICO 626", "Actividades empresariales 612"],
  filas: [
    { aspecto: "Clave SAT", valores: ["626", "612"] },
    {
      aspecto: "Base de ISR",
      valores: ["Ingresos efectivamente cobrados del mes", "Utilidad (ingresos − deducciones)"],
    },
    {
      aspecto: "Tasa de ISR",
      valores: ["1.00%, 1.10%, 1.50%, 2.00% o 2.50% según el tramo", "Tarifa progresiva del artículo 96"],
    },
    {
      aspecto: "Deducciones de gastos en ISR",
      valores: ["No se restan", "Sí, gastos estrictamente indispensables con CFDI"],
    },
    {
      aspecto: "Tope de ingresos",
      valores: ["$3,500,000 anuales", "Sin tope"],
    },
    {
      aspecto: "IVA",
      valores: ["Aparte: traslado − acreditable", "Aparte: traslado − acreditable"],
    },
    {
      aspecto: "Momento del ingreso (ISR)",
      valores: ["Cuando te pagan (cobrado)", "Según criterio fiscal (en general, facturado)"],
    },
    {
      aspecto: "Declaración mensual",
      valores: ["Día 17 del mes siguiente", "Día 17 — pago provisional acumulado del año"],
    },
    {
      aspecto: "ISR de meses previos",
      valores: ["Cada mes se calcula solo", "Se restan los provisionales ya enterados"],
    },
    {
      aspecto: "Contabilidad",
      valores: ["Simplificada", "Completa (NIF)"],
    },
    {
      aspecto: "Conviene si…",
      valores: ["Pocos gastos frente a lo que cobras", "Gastos altos que sí puedes comprobar"],
    },
  ],
} as const;

export const RESICO_CRITERIOS = [
  {
    n: "01",
    titulo: "Tope de $3.5 MDP",
    kicker: "Límite anual",
    texto:
      "Hasta $3,500,000 de ingresos anuales para personas físicas con actividades empresariales, profesionales o arrendamiento. Si los superas, sales del régimen.",
  },
  {
    n: "02",
    titulo: "Sin deducción en ISR",
    kicker: "Ingresos cobrados",
    texto:
      "El ISR se calcula sobre lo cobrado. Los gastos operativos no se restan como en el régimen general; la tasa baja sustituye ese mecanismo.",
  },
  {
    n: "03",
    titulo: "Control formal SAT",
    kicker: "Digital y vigente",
    texto:
      "Necesitas RFC, CFDI y declaraciones mensuales. Registra bien facturas y cobros: el SAT cruza lo timbrado con lo declarado.",
  },
  {
    n: "04",
    titulo: "Casos especiales",
    kicker: "Revisar compatibilidad",
    texto:
      "Hay reglas para socios o accionistas, ingresos por plataformas y combinaciones de actividades. La compatibilidad se revisa caso por caso.",
  },
] as const;
