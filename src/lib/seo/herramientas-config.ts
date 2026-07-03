import type { Metadata } from "next";
import { INPC_FALLBACK } from "@/lib/fiscal/inpc";
import { SALARIO_MINIMO_VIGENTE } from "@/lib/fiscal/salario-minimo";
import { UMA_VIGENTE } from "@/lib/fiscal/uma";
import { ORGANIZACION, SITE_URL } from "./site";

export type HerramientaId =
  | "rfc"
  | "resico"
  | "facturacion"
  | "vencimiento"
  | "inpc"
  | "isr"
  | "uma"
  | "salario"
  | "recargos"
  | "divisas"
  | "sdi"
  | "prima-vacacional";

export type HerramientaSeoConfig = {
  id: HerramientaId;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  subtitulo: string;
  intro: string[];
  faq: Array<{ pregunta: string; respuesta: string }>;
  /** Si true, muestra el ticker de mercados bajo el header. */
  ticker?: boolean;
};

const ultimoInpc = INPC_FALLBACK[INPC_FALLBACK.length - 1];

export const HERRAMIENTAS: HerramientaSeoConfig[] = [
  {
    id: "rfc",
    path: "/herramientas/rfc",
    title: "Calculadora de RFC con homoclave 2026 | RDC Contadores",
    description:
      "Calcula tu RFC con homoclave gratis: persona física, algoritmo público del SAT. Resultado instantáneo, sin registro. Para contadores, RH y contribuyentes.",
    keywords: [
      "calculadora RFC",
      "calcular RFC",
      "RFC con homoclave",
      "generador RFC",
      "RFC persona física",
      "RFC SAT",
      "obtener RFC",
      "RFC online",
    ],
    h1: "Calculadora de RFC con homoclave",
    subtitulo:
      "Persona física · Algoritmo público del SAT · Resultado instantáneo y gratis",
    intro: [
      "El Registro Federal de Contribuyentes (RFC) es la clave que identifica a cada persona física o moral ante el Servicio de Administración Tributaria (SAT). Para personas físicas se conforma por 13 caracteres: 4 letras del nombre, 6 dígitos de la fecha de nacimiento y 3 caracteres de homoclave.",
      "Esta herramienta calcula el RFC con homoclave usando el algoritmo público del SAT a partir de tu nombre, apellidos y fecha de nacimiento. Es ideal para contadores, encargados de recursos humanos y contribuyentes que necesitan estimar el RFC antes de tramitar la Constancia de Situación Fiscal.",
      "El cálculo es instantáneo, gratuito y se realiza en tu navegador (no enviamos tus datos a ningún servidor). Recuerda que el RFC oficial es el que asigna el SAT en tu Constancia de Situación Fiscal.",
    ],
    faq: [
      {
        pregunta: "¿Cómo se calcula el RFC de una persona física?",
        respuesta:
          "Se forma con 4 letras del nombre (1ª y vocal interna del 1er apellido, 1ª del 2º apellido, 1ª del nombre), 6 dígitos de la fecha de nacimiento (AAMMDD) y 3 caracteres de homoclave (2 calculados con tabla del SAT + 1 dígito verificador).",
      },
      {
        pregunta: "¿La homoclave calculada es siempre la correcta?",
        respuesta:
          "El algoritmo es público y suele coincidir con el RFC oficial en la mayoría de los casos. En homonimias, registros previos o asignaciones especiales del SAT, la homoclave oficial puede diferir. Para validación oficial consulta tu Constancia de Situación Fiscal en sat.gob.mx.",
      },
      {
        pregunta: "¿Esta calculadora envía mis datos al SAT o a algún servidor?",
        respuesta:
          "No. El cálculo se realiza completamente en tu navegador. No almacenamos ni transmitimos tu nombre, apellidos ni fecha de nacimiento.",
      },
      {
        pregunta: "¿Qué pasa si mi nombre tiene José, María o partículas como De, Del, La?",
        respuesta:
          "La herramienta aplica las reglas del SAT: si el primer nombre es José o María y hay más nombres, usa el siguiente; las partículas (De, La, Los, Y, Mac, Mc, Van, Von) se ignoran al construir las letras. Tu cálculo será consistente con el manual oficial.",
      },
      {
        pregunta: "¿Funciona para personas morales (empresas)?",
        respuesta:
          "Por ahora la calculadora cubre personas físicas. Próximamente agregaremos personas morales (RFC de 12 caracteres) y cálculo en lote para nóminas.",
      },
    ],
  },
  {
    id: "resico",
    path: "/herramientas/isr-resico",
    title: "Calculadora de ISR RESICO 2026 | Persona Física · RDC Contadores",
    description:
      "Calcula tu ISR de RESICO 2026 gratis: ingresa tu ingreso del mes y obtén el impuesto al instante con las tasas oficiales (1.00 % a 2.50 %). Sin registro.",
    keywords: [
      "calculadora ISR RESICO",
      "ISR RESICO 2026",
      "tabla RESICO 2026",
      "tasas RESICO",
      "régimen simplificado de confianza",
      "calcular ISR RESICO",
      "RESICO persona física",
      "pago provisional RESICO",
    ],
    h1: "Calculadora de ISR RESICO",
    subtitulo:
      "Persona física · Tasas oficiales 2026 (1.00 % a 2.50 %) · Resultado instantáneo y gratis",
    intro: [
      "El Régimen Simplificado de Confianza (RESICO) permite a las personas físicas con actividad empresarial, profesional o de arrendamiento pagar el ISR aplicando una tasa baja directamente sobre sus ingresos del mes, sin deducciones ni cuota fija.",
      "Esta calculadora aplica la tarifa mensual del artículo 113-E de la Ley del ISR: ubica tu ingreso del mes en uno de los cinco rangos y multiplica por la tasa correspondiente (1.00 %, 1.10 %, 1.50 %, 2.00 % o 2.50 %). Es ideal para freelancers, profesionistas y pequeños negocios que quieren estimar su pago provisional.",
      "El cálculo es instantáneo, gratuito y se realiza en tu navegador. Recuerda que el ISR definitivo depende del cumplimiento de los requisitos del régimen y de tu acumulado anual (límite de $3,500,000).",
    ],
    faq: [
      {
        pregunta: "¿Cómo se calcula el ISR en RESICO?",
        respuesta:
          "Se aplica una tasa fija sobre el total de tus ingresos facturados del mes, sin deducciones ni cuota fija. Por ejemplo, si facturas $45,000 caes en el rango de $25,001 a $50,000 (tasa 1.10 %): $45,000 × 1.10 % = $495 de ISR.",
      },
      {
        pregunta: "¿Cuáles son las tasas de RESICO en 2026?",
        respuesta:
          "Hasta $25,000 → 1.00 %; de $25,001 a $50,000 → 1.10 %; de $50,001 a $83,333 → 1.50 %; de $83,334 a $208,333 → 2.00 %; y de $208,334 a $291,666 → 2.50 %. Son las mismas desde 2022.",
      },
      {
        pregunta: "¿Cuál es el límite de ingresos para estar en RESICO?",
        respuesta:
          "$3,500,000 de ingresos anuales (equivale a $291,666.67 mensuales en promedio). Si un mes facturas más, no sales automáticamente: lo que importa es el acumulado anual. Si lo superas al cierre del año, cambias al régimen general.",
      },
      {
        pregunta: "¿El RESICO permite deducciones?",
        respuesta:
          "No. A cambio de las tasas bajas, RESICO no permite aplicar deducciones. Por eso conviene comparar tu caso: para algunos contribuyentes con muchos gastos deducibles, el régimen general podría resultar mejor.",
      },
      {
        pregunta: "¿Esta calculadora guarda o envía mis datos?",
        respuesta:
          "No. El cálculo se realiza completamente en tu navegador, no almacenamos ni transmitimos tu ingreso. Es solo una herramienta informativa de referencia.",
      },
    ],
  },
  {
    id: "facturacion",
    path: "/herramientas/calculadora-facturacion",
    title: "Calculadora de Facturación 2026 · Neto a CFDI | RDC Contadores",
    description:
      "Calcula cuánto facturar para recibir un neto: subtotal, IVA, retenciones ISR e IVA. RESICO, PFAE, honorarios, arrendamiento, AGAPES. 3 consultas gratis.",
    keywords: [
      "calculadora de facturación",
      "cuánto facturar para recibir",
      "neto a factura",
      "retenciones ISR IVA",
      "RESICO retenciones",
      "PFAE honorarios",
      "calcular CFDI neto",
      "facturación persona física",
    ],
    h1: "Calculadora de Facturación",
    subtitulo:
      "Neto deseado → subtotal, IVA y retenciones · RESICO, PFAE y PM · 3 consultas gratis",
    intro: [
      "Cuando facturas a una persona moral, el receptor retiene ISR e IVA. Si quieres recibir un monto neto en tu cuenta, necesitas calcular al revés: partir del neto deseado y obtener el subtotal y el total del CFDI.",
      "Esta calculadora aplica las tasas vigentes para RESICO (1.25% ISR), PFAE (10% en honorarios, arrendamiento y comisiones), retención de IVA (10.6667% o 4% en autotransporte), IVA exento en casa doméstica y la regla AGAPES exento de la RMF 2026.",
      "Selecciona emisor, receptor, tipo de operación y el neto que quieres recibir. Obtendrás el desglose listo para tu factura. Tres consultas gratuitas sin registro; Pro ilimitado próximamente.",
    ],
    faq: [
      {
        pregunta: "¿Cómo funciona el cálculo inverso de facturación?",
        respuesta:
          "Partimos de tu neto deseado y resolvemos el subtotal con la fórmula: subtotal = neto ÷ (1 + IVA − ret. IVA − ret. ISR). Luego calculamos IVA, retenciones y total del CFDI.",
      },
      {
        pregunta: "¿Qué retenciones aplica RESICO hacia persona moral?",
        respuesta:
          "ISR 1.25% sobre el pago sin IVA (Art. 113-J LISR) y retención de IVA de 2/3 del IVA trasladado (10.6667% con IVA 16%). En autotransporte la ret. IVA es 4%.",
      },
      {
        pregunta: "¿Y si facturo a otra persona física?",
        respuesta:
          "Entre personas físicas, por regla general no hay retenciones de ISR ni IVA en los escenarios modelados. Solo verás IVA trasladado si aplica.",
      },
      {
        pregunta: "¿Cuántas consultas gratis tengo?",
        respuesta:
          "Tres cálculos anónimos por navegador. Al crear cuenta y verificar correo obtendrás uno extra (cuatro en total). Después, desbloquea Pro para uso ilimitado.",
      },
      {
        pregunta: "¿Es asesoría fiscal?",
        respuesta:
          "No. Es una herramienta de referencia con tasas oficiales. Para casos específicos (deducciones, excepciones, contratos) consulta con tu contador.",
      },
    ],
  },
  {
    id: "vencimiento",
    path: "/herramientas/vencimiento-declaracion",
    title: "¿Cuándo vence mi declaración? Calculadora por RFC | RDC Contadores",
    description:
      "Calcula gratis la fecha límite de tu declaración mensual SAT (ISR/IVA): ingresa tu RFC, mes y año. Reglas del 6º dígito, días hábiles y fines de semana.",
    keywords: [
      "cuándo vence mi declaración",
      "fecha límite declaración SAT",
      "vencimiento ISR IVA",
      "calendario fiscal RFC",
      "sexto dígito RFC",
      "días hábiles SAT",
      "declaración mensual vencimiento",
    ],
    h1: "Calculadora de vencimiento de declaración",
    subtitulo:
      "ISR/IVA mensual · Reglas del 6º dígito del RFC · Días hábiles y fines de semana",
    intro: [
      "La declaración mensual de ISR e IVA no vence el mismo día para todos. El SAT parte del día 17 del mes siguiente al periodo que declaras y, según el sexto dígito numérico de tu RFC, suma de 1 a 5 días hábiles adicionales.",
      "Si esa fecha cae en sábado o domingo, el vencimiento se recorre al lunes siguiente. Así el calendario fiscal se reparte entre contribuyentes y evita que todos paguen el mismo día.",
      "Esta calculadora aplica esas reglas al instante: captura tu RFC, elige el mes y año del periodo fiscal y obtén tu fecha límite con el desglose paso a paso. El cálculo es 100% en tu navegador.",
    ],
    faq: [
      {
        pregunta: "¿Por qué el SAT usa el sexto dígito del RFC?",
        respuesta:
          "Es la forma oficial de escalonar vencimientos: contribuyentes con distinto sexto dígito tienen plazos distintos sin cambiar la regla general del día 17.",
      },
      {
        pregunta: "¿Qué pasa si mi fecha cae en fin de semana?",
        respuesta:
          "Para declaraciones mensuales federales, si el resultado cae en sábado o domingo, el vencimiento pasa al lunes inmediato siguiente.",
      },
      {
        pregunta: "¿La declaración de abril vence en abril?",
        respuesta:
          "No. La declaración del periodo de abril vence en mayo (mes siguiente). Por ejemplo, abril 2026 se declara en mayo 2026.",
      },
      {
        pregunta: "¿Esta herramienta guarda mi RFC?",
        respuesta:
          "No. Todo el cálculo ocurre en tu navegador; no enviamos ni almacenamos tu RFC.",
      },
    ],
  },
  {
    id: "inpc",
    path: "/herramientas/inpc",
    title: "INPC 2026 · Índice Nacional de Precios al Consumidor | RDC Contadores",
    description: `Consulta el INPC 2026 (${ultimoInpc.valor.toFixed(3)} base jul 2018=100), histórico mensual desde 2016, variación anual y gráfica. Datos INEGI actualizados.`,
    keywords: [
      "INPC 2026",
      "INPC México",
      "índice nacional de precios al consumidor",
      "INPC histórico",
      "INPC INEGI",
      "inflación México",
      "actualización fiscal INPC",
    ],
    h1: "INPC 2026 · Índice Nacional de Precios al Consumidor",
    subtitulo: "Histórico mensual, variación anual y gráfica · Base 100 = 2.ª quincena julio 2018",
    intro: [
      "El Índice Nacional de Precios al Consumidor (INPC) mide la evolución de los precios de bienes y servicios que consumen los hogares en México. INEGI lo publica los días 10 y 25 de cada mes.",
      "Contadores y contribuyentes lo usan para actualizar contratos, créditos, rentas, honorarios y cálculos fiscales que requieren ajuste por inflación. En esta página encontrará el valor más reciente, la variación interanual, una gráfica interactiva y la matriz histórica año por mes.",
      `Último dato de referencia: ${ultimoInpc.valor.toFixed(3)} (${ultimoInpc.mes}/${ultimoInpc.anio}). Con token INEGI o Banxico configurado, el valor se sincroniza automáticamente desde la fuente oficial.`,
    ],
    faq: [
      {
        pregunta: "¿Qué es el INPC?",
        respuesta:
          "Es el indicador oficial de inflación al consumidor en México, publicado por el INEGI. Su base es 100 en la segunda quincena de julio de 2018.",
      },
      {
        pregunta: "¿Con qué frecuencia se actualiza el INPC?",
        respuesta:
          "INEGI publica la variación quincenal y mensual; el cierre mensual es el dato más usado en materia fiscal y contractual.",
      },
      {
        pregunta: "¿Para qué sirve el INPC en contabilidad?",
        respuesta:
          "Sirve para actualizar montos en pesos, comparar variaciones de precios, elaborar proyecciones y aplicar factores de actualización en obligaciones fiscales que lo referencien.",
      },
    ],
  },
  {
    id: "isr",
    path: "/herramientas/isr-2026",
    title: "Tarifas ISR 2026 · Tablas SAT Anexo 8 RMF | RDC Contadores",
    description:
      "Tarifas ISR 2026 vigentes: anual, retenciones (diaria a mensual), pagos provisionales mensuales PF y RIF bimestral. Subsidio al empleo 2026. Fuente Anexo 8 RMF.",
    keywords: [
      "ISR 2026",
      "tarifa ISR 2026",
      "tabla ISR SAT",
      "retenciones ISR 2026",
      "pago provisional ISR",
      "RIF bimestral 2026",
      "subsidio al empleo 2026",
      "Anexo 8 RMF",
    ],
    h1: "Tarifas ISR 2026",
    subtitulo: "Anual · Retenciones · Provisionales mensuales PF · RIF bimestral · Subsidio al empleo",
    intro: [
      "Las tablas del Impuesto Sobre la Renta (ISR) para 2026 se publican en el Anexo 8 de la Resolución Miscelánea Fiscal. Aquí puede consultar todas las tarifas que usa un despacho contable en el día a día.",
      "Incluye la tarifa anual del ejercicio, las tablas de retenciones por periodicidad (diaria, semanal, decenal, quincenal y mensual), los pagos provisionales mensuales de personas físicas con actividad empresarial y las tarifas bimestrales del Régimen de Incorporación Fiscal (RIF).",
      "Los montos son de referencia conforme a la legislación vigente; para casos específicos (deducciones, coeficientes, estímulos) consulte con su contador.",
    ],
    faq: [
      {
        pregunta: "¿Qué tarifas ISR incluye esta página?",
        respuesta:
          "Tarifa anual 2026, retenciones por periodicidad, pagos provisionales mensuales de PF y tarifas bimestrales RIF, además del subsidio al empleo vigente.",
      },
      {
        pregunta: "¿De dónde provienen las tablas ISR 2026?",
        respuesta:
          "Del Anexo 8 de la RMF publicada en el Diario Oficial (artículos 97 y 152 de la Ley del ISR y disposiciones de retenciones).",
      },
      {
        pregunta: "¿Puedo usar estas tablas para calcular mi impuesto?",
        respuesta:
          "Son referenciales para ubicar límites inferiores, cuotas fijas y porcentajes sobre el excedente. El cálculo definitivo depende de ingresos, deducciones y régimen fiscal.",
      },
    ],
  },
  {
    id: "uma",
    path: "/herramientas/uma",
    title: `UMA 2026 · Unidad de Medida y Actualización (${UMA_VIGENTE.diaria} diaria) | RDC`,
    description: `UMA vigente ${UMA_VIGENTE.anio}: diaria $${UMA_VIGENTE.diaria}, mensual $${UMA_VIGENTE.mensual}, anual $${UMA_VIGENTE.anual}. Histórico y vigencia. Multas, topes y previsión social.`,
    keywords: [
      "UMA 2026",
      "UMA México",
      "unidad de medida y actualización",
      "valor UMA diaria",
      "UMA vigente",
      "UMA histórico",
    ],
    h1: "UMA · Unidad de Medida y Actualización",
    subtitulo: `Vigencia ${UMA_VIGENTE.vigenciaDesde} al ${UMA_VIGENTE.vigenciaHasta}`,
    intro: [
      "La Unidad de Medida y Actualización (UMA) es la referencia económica en México para calcular multas, obligaciones fiscales, deducciones, prestaciones y topes de seguridad social, entre otros conceptos.",
      `El valor diario vigente es ${UMA_VIGENTE.diaria.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}; el mensual equivale a ${UMA_VIGENTE.mensual.toLocaleString("es-MX", { style: "currency", currency: "MXN" })} y el anual a ${UMA_VIGENTE.anual.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}.`,
      "INEGI publica la UMA cada año; entra en vigor el 1° de febrero. Consulte también el histórico anual en la tabla inferior.",
    ],
    faq: [
      {
        pregunta: "¿Qué es la UMA?",
        respuesta:
          "Es la unidad de referencia económica en México que sustituyó al salario mínimo para fines legales distintos al laboral (multas, topes fiscales, etc.).",
      },
      {
        pregunta: "¿Cuándo cambia la UMA?",
        respuesta:
          "Se actualiza anualmente y aplica del 1° de febrero al 31 de enero del año siguiente.",
      },
      {
        pregunta: "¿La UMA es igual al salario mínimo?",
        respuesta:
          "No. Son conceptos distintos: el salario mínimo regula salarios; la UMA es referencia para multas, obligaciones y topes en otras materias.",
      },
    ],
  },
  {
    id: "salario",
    path: "/herramientas/salario-minimo-2026",
    title: `Salario mínimo 2026 · $${SALARIO_MINIMO_VIGENTE.general} general y $${SALARIO_MINIMO_VIGENTE.fronteraNorte} frontera | RDC`,
    description: `Salario mínimo 2026 en México: zona general $${SALARIO_MINIMO_VIGENTE.general} y frontera norte $${SALARIO_MINIMO_VIGENTE.fronteraNorte} diarios. Histórico CONASAMI y profesiones.`,
    keywords: [
      "salario mínimo 2026",
      "salario mínimo México",
      "salario mínimo frontera norte 2026",
      "SMG 2026",
      "CONASAMI salario mínimo",
    ],
    h1: "Salario mínimo 2026",
    subtitulo: `Vigente desde ${SALARIO_MINIMO_VIGENTE.vigenciaDesde} · Zona general y Frontera Norte`,
    intro: [
      "El salario mínimo general es la retribución mínima que debe recibir un trabajador en México. La Comisión Nacional de Salarios Mínimos (CONASAMI) lo revisa cada año.",
      `Para 2026 el salario mínimo general es $${SALARIO_MINIMO_VIGENTE.general.toFixed(2)} pesos diarios y en la Zona Libre de la Frontera Norte es $${SALARIO_MINIMO_VIGENTE.fronteraNorte.toFixed(2)} pesos diarios.`,
      "Estos valores impactan nóminas, prestaciones, subsidio al empleo y múltiples cálculos laborales y fiscales.",
    ],
    faq: [
      {
        pregunta: "¿Cuánto es el salario mínimo en 2026?",
        respuesta: `Zona general: $${SALARIO_MINIMO_VIGENTE.general} diarios. Frontera Norte: $${SALARIO_MINIMO_VIGENTE.fronteraNorte} diarios, vigentes desde enero de 2026.`,
      },
      {
        pregunta: "¿Qué es la zona Frontera Norte?",
        respuesta:
          "Es la Zona Libre de la Frontera Norte (ZLFN), con un salario mínimo superior al del resto del país.",
      },
    ],
  },
  {
    id: "recargos",
    path: "/herramientas/recargos-federales",
    title: "Recargos federales 2026 · Tasas SAT | RDC Contadores",
    description:
      "Tabla de recargos por mora en contribuciones federales 2026: tasa mensual para pagos extemporáneos. Referencia SAT para contadores y contribuyentes.",
    keywords: [
      "recargos federales 2026",
      "recargos SAT",
      "tasa recargos mora",
      "pago extemporáneo SAT",
      "intereses moratorios fiscales",
    ],
    h1: "Recargos federales 2026",
    subtitulo: "Tasas de recargo por pago extemporáneo en contribuciones federales",
    intro: [
      "Cuando una contribución federal se paga después de su vencimiento, el SAT cobra recargos por mora. La tasa depende del tipo de obligación y del periodo de retraso.",
      "En esta página encontrará la tabla de tasas mensuales vigentes para 2026, útil para estimar el costo de un pago tardío antes de presentar la declaración o realizar la parcialidad.",
    ],
    faq: [
      {
        pregunta: "¿Qué son los recargos federales?",
        respuesta:
          "Son el accesorio que se causa por pagar contribuciones federales fuera del plazo legal, además del impuesto principal.",
      },
      {
        pregunta: "¿Los recargos son lo mismo que multas?",
        respuesta:
          "No. Los recargos compensan el pago tardío; las multas sancionan incumplimientos distintos (por ejemplo, no presentar declaraciones).",
      },
    ],
  },
  {
    id: "divisas",
    path: "/herramientas/tipo-de-cambio",
    title: "Tipo de cambio hoy · USD FIX, divisas, UDI y TIIE | RDC Contadores",
    description:
      "Tipo de cambio USD/MXN, euro, libra y yen; USD FIX Banxico, UDI, TIIE 28 días, bitcoin y oro. Conversor y cotizaciones de referencia para México.",
    keywords: [
      "tipo de cambio hoy",
      "dólar hoy México",
      "USD FIX Banxico",
      "tipo de cambio USD MXN",
      "UDI hoy",
      "TIIE 28 días",
      "euro peso mexicano",
    ],
    h1: "Tipo de cambio y mercados",
    subtitulo: "Divisas vs MXN · USD FIX · UDI · TIIE · Referencia diaria",
    intro: [
      "El tipo de cambio es esencial para operaciones internacionales, facturación en USD y cumplimiento fiscal. En México, el tipo de cambio FIX del Banco de México es la referencia oficial para muchos efectos fiscales.",
      "Esta herramienta muestra cotizaciones de divisas principales (Frankfurter/BCE), el FIX y los indicadores UDI y TIIE cuando hay conexión con Banxico, además de referencias de bitcoin y oro (no oficiales para contabilidad).",
      "Use el conversor rápido para estimar montos en pesos y personalice las divisas que desea ver en su cuadrícula.",
    ],
    ticker: true,
    faq: [
      {
        pregunta: "¿Cuál es el tipo de cambio oficial en México?",
        respuesta:
          "Para efectos fiscales suele usarse el tipo de cambio FIX que publica Banxico en el Diario Oficial de la Federación.",
      },
      {
        pregunta: "¿Con qué frecuencia se actualizan las divisas?",
        respuesta:
          "Las divisas de referencia (BCE/Frankfurter) se actualizan diariamente; FIX, UDI y TIIE siguen el calendario de publicación de Banxico.",
      },
    ],
  },
  {
    id: "sdi",
    path: "/herramientas/salario-diario-integrado",
    title: "Calculadora de Salario Diario Integrado (SDI) 2026 | RDC Contadores",
    description:
      "Calcula tu Salario Diario Integrado gratis: ingresa tu sueldo, antigüedad y prima vacacional. Factor de integración, tabla LFT 2026 y desglose paso a paso.",
    keywords: [
      "salario diario integrado",
      "calculadora SDI",
      "factor de integración 2026",
      "SDI IMSS",
      "salario diario integrado cálculo",
      "factor integración tabla",
      "SDI nómina",
      "prestaciones de ley",
    ],
    h1: "Calculadora de Salario Diario Integrado (SDI)",
    subtitulo:
      "Factor de integración LFT 2026 · Antigüedad, aguinaldo y prima vacacional · Gratis",
    intro: [
      "El Salario Diario Integrado (SDI) es la base que se usa para calcular las cuotas del IMSS, INFONAVIT, indemnizaciones y liquidaciones laborales. Integra el salario base más prestaciones como aguinaldo, vacaciones y prima vacacional.",
      "Esta calculadora aplica la fórmula oficial: Factor = (365 + días de aguinaldo + días de vacaciones × prima vacacional) ÷ 365. El SDI es el salario diario multiplicado por el factor de integración resultante.",
      "El cálculo es instantáneo, gratuito y se realiza en tu navegador. Es ideal para patrones, contadores y trabajadores que necesitan estimar su SDI antes de reportar al IMSS o calcular una liquidación.",
    ],
    faq: [
      {
        pregunta: "¿Qué es el Salario Diario Integrado (SDI)?",
        respuesta:
          "Es el salario que incluye todas las prestaciones que recibe un trabajador (aguinaldo, vacaciones, prima vacacional) expresado como monto diario. Se usa para calcular cuotas IMSS e INFONAVIT.",
      },
      {
        pregunta: "¿Cuál es el factor mínimo de integración en 2026?",
        respuesta:
          "Para un trabajador con 1 año de antigüedad, 15 días de aguinaldo y 12 días de vacaciones con 25% de prima vacacional, el factor mínimo es 1.0493.",
      },
      {
        pregunta: "¿Cada cuánto se actualiza el SDI?",
        respuesta:
          "El SDI se recalcula cuando cambia el salario del trabajador, al cumplir un año más de antigüedad, o cuando se modifican las prestaciones. El patrón debe informar al IMSS dentro de los 5 días hábiles siguientes al cambio.",
      },
      {
        pregunta: "¿El SDI incluye horas extra, propinas o comisiones?",
        respuesta:
          "Sí, el IMSS establece que todo concepto que se entregue al trabajador de forma habitual forma parte del salario integrado. Esta calculadora cubre las prestaciones fijas mínimas de ley.",
      },
      {
        pregunta: "¿Esta calculadora guarda mis datos?",
        respuesta:
          "No. El cálculo se realiza completamente en tu navegador, no almacenamos ni transmitimos tu información salarial.",
      },
    ],
  },
  {
    id: "prima-vacacional",
    path: "/herramientas/prima-vacacional",
    title: "Calculadora de Prima Vacacional 2026 | LFT México | RDC Contadores",
    description:
      "Calcula tu prima vacacional 2026 gratis: ingresa tu salario mensual, días de vacaciones y porcentaje. Tabla de días por antigüedad LFT y desglose paso a paso.",
    keywords: [
      "prima vacacional 2026",
      "calculadora prima vacacional",
      "cómo calcular prima vacacional",
      "días de vacaciones LFT",
      "prima vacacional México",
      "vacaciones por antigüedad",
      "tabla vacaciones LFT 2026",
      "prestaciones laborales",
    ],
    h1: "Calculadora de Prima Vacacional",
    subtitulo:
      "Tabla de días LFT 2026 · Porcentaje configurable · Resultado instantáneo y gratis",
    intro: [
      "La prima vacacional es una prestación que todo trabajador en México tiene derecho a recibir al tomar sus vacaciones. Equivale al menos al 25% del salario correspondiente a los días de vacaciones, según el artículo 80 de la Ley Federal del Trabajo.",
      "Esta calculadora te permite estimar tu prima vacacional ingresando tu salario mensual, los días de vacaciones que te corresponden y el porcentaje de prima que otorga tu empresa (25% mínimo de ley, aunque muchas empresas ofrecen 50% o 100%).",
      "El cálculo es instantáneo, gratuito y se realiza en tu navegador. Ideal para trabajadores que quieren conocer el monto de su prima antes de solicitar vacaciones.",
    ],
    faq: [
      {
        pregunta: "¿Qué es la prima vacacional?",
        respuesta:
          "Es un pago adicional que el patrón debe entregar al trabajador cuando disfruta de su periodo vacacional. El mínimo legal es 25% del salario correspondiente a los días de vacaciones (Art. 80 LFT).",
      },
      {
        pregunta: "¿Cuándo se paga la prima vacacional?",
        respuesta:
          "Debe pagarse antes de que el trabajador inicie su periodo vacacional. Si la empresa tiene política de pago en nómina regular, puede distribuirse proporcionalmente.",
      },
      {
        pregunta: "¿Cuántos días de vacaciones me corresponden en 2026?",
        respuesta:
          "Con la reforma LFT vigente: 12 días al cumplir 1 año, 14 días al cumplir 2 años, y así sucesivamente hasta 32 días con más de 30 años de antigüedad.",
      },
      {
        pregunta: "¿La prima vacacional causa ISR?",
        respuesta:
          "Sí, es un ingreso gravable. Sin embargo, la Ley del ISR otorga una exención de hasta 15 UMAs diarias (aproximadamente $1,776 en 2026). El excedente se grava como ingreso ordinario.",
      },
      {
        pregunta: "¿Esta calculadora guarda mis datos?",
        respuesta:
          "No. Todo el cálculo ocurre en tu navegador; no almacenamos ni transmitimos tu información salarial.",
      },
    ],
  },
];

export function getHerramientaConfig(id: HerramientaId): HerramientaSeoConfig {
  const config = HERRAMIENTAS.find((h) => h.id === id);
  if (!config) throw new Error(`Herramienta desconocida: ${id}`);
  return config;
}

export function buildHerramientaMetadata(config: HerramientaSeoConfig): Metadata {
  const url = `${SITE_URL}${config.path}`;
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "es_MX",
      url,
      title: config.title,
      description: config.description,
      siteName: ORGANIZACION.name,
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
    },
    robots: { index: true, follow: true },
  };
}

export function buildHerramientaJsonLd(config: HerramientaSeoConfig) {
  const url = `${SITE_URL}${config.path}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: config.h1,
      description: config.description,
      url,
      inLanguage: "es-MX",
      isPartOf: {
        "@type": "WebSite",
        name: ORGANIZACION.name,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: ORGANIZACION.name,
        url: ORGANIZACION.url,
        logo: ORGANIZACION.logo,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Herramientas fiscales",
          item: `${SITE_URL}/herramientas`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: config.h1,
          item: url,
        },
      ],
    },
    ...(config.faq.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: config.faq.map((f) => ({
              "@type": "Question",
              name: f.pregunta,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.respuesta,
              },
            })),
          },
        ]
      : []),
  ];
}
