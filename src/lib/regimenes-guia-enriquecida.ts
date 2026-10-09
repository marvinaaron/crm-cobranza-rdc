import type { GuiaEnriquecida, RegimenSlug } from "./regimenes-fiscales-types";

export const GUIA_ENRIQUECIDA: Record<RegimenSlug, GuiaEnriquecida> = {
  "sueldos-salarios": {
    calculoIsr: {
      titulo: "ISR en sueldos y salarios (605)",
      resumen:
        "En este régimen el patrón retiene y entera el ISR mensualmente. Tú, como trabajador, normalmente no calculas pagos provisionales: tu obligación principal es la declaración anual cuando el CFF lo exige.",
      formula:
        "ISR mensual (patrón) ≈ Ingreso gravable del mes × tarifa art. 96 LISR − subsidio al empleo",
      pasos: [
        "El patrón suma percepciones gravadas del periodo (sueldo, comisiones gravadas, etc.).",
        "Aplica la tarifa del artículo 96 de la LISR y resta el subsidio para el empleo si procede.",
        "Retiene el ISR y lo entera al SAT junto con el pago de nómina.",
        "En la declaración anual (si estás obligado), sumas ingresos y retenciones de todo el ejercicio.",
        "Aplicas deducciones personales autorizadas (gastos médicos, colegiaturas, etc.) con CFDI válido.",
        "El resultado puede ser saldo a favor (devolución) o saldo a cargo.",
      ],
      aclaraciones: [
        {
          titulo: "Las retenciones no son deducciones",
          texto:
            "Lo que tu patrón retuvo y enteró es un anticipo de tu impuesto anual. En la declaración se resta del ISR determinado; no se confunde con deducciones personales como gastos médicos.",
          tipo: "alerta",
        },
        {
          titulo: "¿Cuándo declaras anual?",
          texto:
            "Obligatorio si tuviste dos o más patrones, ingresos anuales superiores a $400,000, ingresos por arrendamiento además de salarios, o si quieres recuperar saldo a favor por deducciones.",
          tipo: "tip",
        },
      ],
    },
    topes: [
      { label: "Declaración anual por ingresos", valor: "> $400,000 anuales", detalle: "Uno de los supuestos del art. 150 CFF" },
      { label: "Deducciones personales", valor: "Hasta 15% del ingreso o 5 UMA", detalle: "Límite anual conjunto según tipo de deducción" },
      { label: "Pagos provisionales PF", valor: "No aplica", detalle: "El patrón retiene; tú no presentas ISR mensual como PF 612" },
    ],
    comparativa: {
      titulo: "605 Sueldos vs 612 Actividades empresariales",
      columnas: ["605 Sueldos", "612 Actividades empresariales"],
      filas: [
        { aspecto: "Tipo de ingreso", valores: ["Salario de un patrón", "Ingresos por cuenta propia"] },
        { aspecto: "Quién calcula ISR mensual", valores: ["El patrón", "Tú (con tu contador)"] },
        { aspecto: "Deducciones de negocio", valores: ["No", "Sí — gastos indispensables"] },
        { aspecto: "Facturación", valores: ["CFDI de nómina", "CFDI por cada servicio/venta"] },
        { aspecto: "Declaración mensual ISR", valores: ["No (salvo excepciones)", "Sí — pago provisional"] },
      ],
    },
    articulos: [
      {
        titulo: "Deducciones personales que sí puedes usar",
        parrafos: [
          "Gastos médicos, dentales, hospitalarios, colegiaturas (con topes), honorarios médicos, intereses reales de créditos hipotecarios, aportaciones voluntarias a AFORE y donativos a donatarias autorizadas.",
          "Cada deducción exige CFDI o documentación que cumpla requisitos fiscales. Sin comprobante válido, el SAT no la autoriza aunque el gasto sea real.",
        ],
      },
    ],
    herramientasRelacionadas: [
      {
        href: "/herramientas/isr-2026",
        label: "Tarifas ISR 2026",
        texto: "Consulta las tablas del artículo 96 que usa tu patrón para retener.",
      },
    ],
  },

  resico: {
    calculoIsr: {
      titulo: "ISR en RESICO persona física (626)",
      resumen:
        "El RESICO calcula el ISR sobre ingresos efectivamente cobrados en el mes — no sobre lo facturado si aún no te pagan. Las tasas son fijas y bajas según el rango de ingresos del periodo.",
      formula:
        "ISR del mes = Ingresos cobrados en el mes × tasa RESICO (art. 113-F LISR) − pagos de ISR de meses anteriores del mismo ejercicio",
      pasos: [
        "Identifica los ingresos efectivamente cobrados en el mes (transferencias, efectivo, etc.).",
        "No incluyas lo facturado pero no cobrado — RESICO es régimen de cobro.",
        "Ubica el total en la tabla del artículo 113-F y aplica la tasa correspondiente (aprox. 1% a 2.5%).",
        "Resta los pagos de ISR enterados en meses previos del mismo año fiscal.",
        "El resultado es el ISR a pagar (o cero si los anticipos cubren el importe).",
        "Presenta la declaración mensual y paga antes del día 17 del mes siguiente.",
      ],
      aclaraciones: [
        {
          titulo: "Cobrado ≠ facturado",
          texto:
            "Si emitiste factura en marzo pero te pagaron en abril, el ingreso va en abril. Este es el cambio más importante frente al régimen 612, que trabaja con devengado.",
          tipo: "alerta",
        },
        {
          titulo: "Los pagos anteriores no son deducción",
          texto:
            "Lo que ya pagaste de ISR en meses previos reduce tu pago del mes actual, pero no es una deducción de gastos. En RESICO no hay deducciones operativas: la tasa baja sustituye ese mecanismo.",
          tipo: "alerta",
        },
        {
          titulo: "IVA sigue siendo por devengo",
          texto:
            "Aunque el ISR sea por cobro, el IVA generalmente se determina por lo facturado en el mes. Lleva ambos criterios en paralelo.",
          tipo: "tip",
        },
      ],
    },
    topes: [
      { label: "Ingresos anuales máximos", valor: "$3,500,000", detalle: "Si los superas, sales de RESICO el mes siguiente" },
      { label: "Ingresos por plataformas tech.", valor: "Límite específico RMF", detalle: "Si recibes ingresos vía apps, revisa reglas de compatibilidad" },
      { label: "Deducciones de gastos", valor: "No permitidas", detalle: "Salvo IVA acreditable en supuestos del art. 113-G" },
      { label: "Tasa ISR máxima RESICO PF", valor: "2.5%", detalle: "Sobre ingresos cobrados del periodo" },
    ],
    comparativa: {
      titulo: "RESICO (626) vs Actividades empresariales (612)",
      columnas: ["RESICO 626", "Actividades empresariales 612"],
      filas: [
        { aspecto: "Base de ISR", valores: ["Ingresos cobrados", "Utilidad (ingresos − deducciones)"] },
        { aspecto: "Tasa", valores: ["1% – 2.5% fija", "Tarifa progresiva art. 96"] },
        { aspecto: "Deducciones", valores: ["No", "Sí — amplias"] },
        { aspecto: "Tope ingresos", valores: ["$3.5 MDP/año", "Sin tope"] },
        { aspecto: "Contabilidad", valores: ["Simplificada", "Completa — NIF"] },
      ],
    },
    herramientasRelacionadas: [
      {
        href: "/herramientas/isr-resico",
        label: "Calculadora ISR RESICO",
        texto: "Simula tu ISR mensual con ingresos cobrados antes de cerrar el mes.",
      },
    ],
  },

  "actividades-empresariales": {
    calculoIsr: {
      titulo: "ISR en actividades empresariales (612)",
      resumen:
        "El régimen 612 determina el ISR sobre la utilidad acumulada del ejercicio: ingresos acumulables menos deducciones autorizadas y PTU. Cada mes presentas un pago provisional que anticipa el impuesto anual.",
      formula:
        "Utilidad acumulada = Ingresos acumulables − Deducciones acumuladas − PTU pagada\nISR provisional ≈ (Utilidad acumulada × tarifa art. 96) − Pagos de ISR de meses anteriores",
      pasos: [
        "Acumula ingresos del mes y del ejercicio (devengados — facturados conforme a criterio fiscal).",
        "Acumula deducciones autorizadas con CFDI válido y requisitos cumplidos.",
        "Resta PTU pagada en el ejercicio si aplica.",
        "Aplica la tarifa del artículo 96 sobre la utilidad acumulada.",
        "Resta los pagos de ISR enterados en meses previos del mismo año.",
        "Presenta y paga el pago provisional antes del día 17 del mes siguiente.",
      ],
      aclaraciones: [
        {
          titulo: "Pagos provisionales ≠ deducciones",
          texto:
            "Los ISR pagados en enero a octubre son anticipos que se restan al calcular el mes actual. No disminuyen tu base gravable como si fueran un gasto deducible.",
          tipo: "alerta",
        },
        {
          titulo: "Ingresos y gastos acumulados",
          texto:
            "El cálculo mensual considera lo acumulado de enero al mes que declaras, no solo el mes aislado. Por eso en marzo tu base incluye enero + febrero + marzo.",
          tipo: "tip",
        },
        {
          titulo: "Estimación vs flujo de efectivo",
          texto:
            "Puedes tener utilidad fiscal aunque tu banco esté vacío: facturaste más de lo que gastaste con comprobantes deducibles.",
          tipo: "tip",
        },
      ],
    },
    topes: [
      { label: "Tope ingresos RESICO", valor: "$3,500,000/año", detalle: "Al superarlo debes salir de RESICO hacia 612" },
      { label: "Deducciones personales en anual", valor: "Límite 15% / 5 UMA", detalle: "En la declaración anual PF, separadas de deducciones de negocio" },
      { label: "Retención 10% ISR servicios", valor: "A PF/PM", detalle: "Cuando un cliente te retiene, se acredita en tu provisional" },
    ],
    comparativa: {
      titulo: "612 vs 605 — ¿cuál te aplica?",
      columnas: ["612 Actividades empresariales", "605 Sueldos"],
      filas: [
        { aspecto: "Relación laboral", valores: ["Independiente — sin patrón", "Subordinada — con patrón"] },
        { aspecto: "Responsable del ISR mensual", valores: ["Tú", "El patrón"] },
        { aspecto: "CFDI", valores: ["Facturas de ingreso", "Recibos de nómina"] },
        { aspecto: "Deducciones de negocio", valores: ["Sí", "No"] },
        { aspecto: "Declaración mensual", valores: ["ISR + IVA provisionales", "No (salvo casos especiales)"] },
      ],
    },
    articulos: [
      {
        titulo: "Registros contables mínimos que debes llevar",
        parrafos: [
          "Ingresos cobrados y facturados, egresos deducibles con CFDI, conciliación bancaria, inventarios si vendes productos, y respaldo de contratos y recibos.",
          "La contabilidad electrónica ante el SAT (catálogo, pólizas, balanza) es obligatoria cuando el SAT te incluye en el programa — la mayoría de PFAE con operación formal lo están.",
        ],
      },
      {
        titulo: "Alta en el régimen 612",
        parrafos: [
          "En el RFC debes tener la actividad económica acorde y seleccionar clave 612. Si vienes de RESICO por superar ingresos, el cambio es el mes siguiente al que rebasas el tope.",
        ],
      },
    ],
    herramientasRelacionadas: [
      {
        href: "/herramientas/isr-2026",
        label: "Tarifas ISR 2026",
        texto: "Tarifa progresiva del artículo 96 aplicable a tu utilidad acumulada.",
      },
      {
        href: "/herramientas/calculadora-facturacion",
        label: "Calculadora factura neto → CFDI",
        texto: "Si cotizas en neto, calcula el monto a facturar con IVA e ISR retenido.",
      },
    ],
  },

  arrendamiento: {
    calculoIsr: {
      titulo: "ISR en arrendamiento (606)",
      resumen:
        "El régimen 606 grava los ingresos por renta de inmuebles. Puedes optar por pagar el 35% sobre ingresos cobrados sin deducir, o por pagos provisionales sobre utilidad (ingresos menos deducciones como mantenimiento, predial y depreciación).",
      formula:
        "Opción utilidad: ISR ≈ (Ingresos acum. − Deducciones acum.) × tarifa − pagos previos\nOpción 35%: ISR = Ingresos cobrados del mes × 35%",
      pasos: [
        "Determina si tributas por utilidad o por el 35% sobre ingresos (según tu elección y reglas vigentes).",
        "Registra rentas cobradas y gastos deducibles del inmueble (predial, mantenimiento, administración).",
        "Aplica depreciación del inmueble conforme a porcentajes autorizados.",
        "Calcula el ISR provisional mensual y resta pagos anteriores del ejercicio.",
        "Presenta declaración mensual e IVA si arrendas con local comercial gravado.",
      ],
      aclaraciones: [
        {
          titulo: "Arrendamiento vs actividad empresarial",
          texto:
            "Si además de rentar tienes negocio operativo, puede coexistir el 606 para rentas y el 612 para tu actividad — cada uno con sus declaraciones.",
          tipo: "tip",
        },
        {
          titulo: "Retención del 10% al arrendador",
          texto:
            "Personas morales que te pagan renta deben retener 10% de ISR. Esa retención se acredita contra tu impuesto mensual.",
          tipo: "alerta",
        },
      ],
    },
    topes: [
      { label: "Opción 35% sobre ingresos", valor: "Sin deducciones", detalle: "Esquema simplificado para PF arrendadoras" },
      { label: "Depreciación inmueble", valor: "% autorizado LISR", detalle: "Deducción anual en opción por utilidad" },
      { label: "IVA en arrendamiento", valor: "Local comercial sí", detalle: "Vivienda pura suele estar exenta de IVA" },
    ],
    articulos: [
      {
        titulo: "Documentación que debes conservar",
        parrafos: [
          "Contratos de arrendamiento, CFDI de rentas emitidas, comprobantes de predial, servicios, seguros y comisiones de administración.",
          "Si usas un inmueble parcialmente para uso personal, solo deduces la proporción rentada.",
        ],
      },
    ],
  },

  "plataformas-tecnologicas": {
    calculoIsr: {
      titulo: "ISR en plataformas tecnológicas (625)",
      resumen:
        "Quienes obtienen ingresos a través de plataformas digitales (apps de transporte, delivery, hospedaje, etc.) tributan en este régimen. Las plataformas retienen ISR e IVA y entregan constancias; tú concilias y complementas en tus declaraciones.",
      formula:
        "ISR mensual PF = Ingresos de plataformas − retenciones de plataforma ± ajustes por otros ingresos del régimen",
      pasos: [
        "Recibe la constancia anual/mensual de retenciones de cada plataforma.",
        "Verifica que tus ingresos reportados coincidan con lo que recibiste en banco.",
        "Si también tienes otros ingresos fuera de plataformas, acumúlalos según el régimen que corresponda (a menudo RESICO o 612).",
        "Presenta declaraciones mensuales si tu situación lo exige tras las retenciones.",
        "En la anual, concilia retenciones vs impuesto determinado.",
      ],
      aclaraciones: [
        {
          titulo: "La plataforma retiene, pero tú sigues obligado",
          texto:
            "La retención no exime de declarar si tienes otros ingresos o si el cálculo anual arroja diferencia. Las constancias son tu principal respaldo.",
          tipo: "alerta",
        },
        {
          titulo: "Compatibilidad con RESICO",
          texto:
            "Muchos prestadores en apps pueden estar en RESICO si cumplen requisitos y no superan el tope de $3.5 MDP.",
          tipo: "tip",
        },
      ],
    },
    topes: [
      { label: "Retención plataforma ISR", valor: "Según RMF", detalle: "La plataforma entera retenciones periódicas" },
      { label: "Retención IVA", valor: "50% del IVA trasladado", detalle: "Mecanismo simplificado en operaciones con plataforma" },
      { label: "Tope RESICO si aplicas 626", valor: "$3,500,000/año", detalle: "Incluye ingresos vía plataformas" },
    ],
    comparativa: {
      titulo: "625 Plataformas vs RESICO 626",
      columnas: ["625 + retenciones", "RESICO 626"],
      filas: [
        { aspecto: "Retención en origen", valores: ["Sí — por la plataforma", "No — tú calculas y pagas"] },
        { aspecto: "Declaración", valores: ["Conciliación con constancias", "Mensual por ingresos cobrados"] },
        { aspecto: "Ideal para", valores: ["Ingresos 100% vía app", "Profesionista mixto o multi-ingreso"] },
      ],
    },
  },

  rif: {
    calculoIsr: {
      titulo: "ISR en RIF (621) — régimen en transición",
      resumen:
        "El Régimen de Incorporación Fiscal fue el antecesor del RESICO. Quienes aún están en transición tributan con tablas propias del RIF hasta migrar a RESICO u otro régimen. No se admiten nuevas altas en RIF.",
      formula:
        "ISR RIF = Ingresos del periodo × tasa según año de incorporación al RIF (tabla arts. 111 y 112 LISR)",
      pasos: [
        "Identifica tu año de incorporación al RIF — define la tasa reducida que te corresponde.",
        "Acumula ingresos del mes conforme a las reglas del RIF (criterio de devengo/cobro según supuesto).",
        "Aplica la tasa de tu tramo y resta pagos previos del ejercicio.",
        "Evalúa migración a RESICO si aún calificas — suele ser más favorable.",
      ],
      aclaraciones: [
        {
          titulo: "RIF ya no es opción para nuevos contribuyentes",
          texto:
            "Si estás dando de alta RFC hoy, tu alternativa simplificada es RESICO (626), no RIF.",
          tipo: "alerta",
        },
        {
          titulo: "Migración recomendada",
          texto:
            "La mayoría de contribuyentes en RIF benefician de evaluar cambio a RESICO con su contador antes de que venzan los periodos de transición.",
          tipo: "tip",
        },
      ],
    },
    topes: [
      { label: "Nuevas altas RIF", valor: "Cerradas", detalle: "Solo contribuyentes en transición" },
      { label: "Tope histórico RIF", valor: "$3,500,000/año", detalle: "Similar al RESICO actual" },
      { label: "Migración a RESICO", valor: "Si cumples requisitos", detalle: "Trámite de cambio de régimen en RFC" },
    ],
  },

  "regimen-general": {
    calculoIsr: {
      titulo: "ISR en persona moral — régimen general (601)",
      resumen:
        "La persona moral paga ISR del 30% sobre la utilidad fiscal anual. Cada mes presenta pagos provisionales con base en la utilidad acumulada del ejercicio, ajustada por coeficiente de utilidad o utilidad nominal según el caso.",
      formula:
        "Utilidad fiscal acum. = Ingresos acum. − Deducciones acum. − PTU\nISR provisional = Utilidad acum. × 30% − pagos de ISR de meses anteriores",
      pasos: [
        "Registra ingresos y costos/gastos deducibles conforme a NIF y LISR.",
        "Determina la utilidad fiscal acumulada de enero al mes que declaras.",
        "Aplica la tasa del 30% (salvo sociedades con tasa reducida específica).",
        "Resta los pagos provisionales enterados en meses previos.",
        "Paga el ISR provisional y presenta declaración antes del día 17.",
        "Al cierre anual, ajusta por diferencias y calcula CUFIN.",
      ],
      aclaraciones: [
        {
          titulo: "Pagos provisionales no son gasto deducible",
          texto:
            "El ISR pagado mensualmente es un anticipo del impuesto anual; se resta al calcular el mes siguiente, pero no reduce la utilidad como deducción.",
          tipo: "alerta",
        },
        {
          titulo: "¿Existe RESICO persona moral?",
          texto:
            "Sí. Las PM con ingresos hasta $35 millones pueden optar al RESICO PM (clave 626) con tasas del 1% al 2.5% sobre ingresos cobrados — alternativa al 30% sobre utilidad si cumples requisitos.",
          tipo: "tip",
        },
        {
          titulo: "Pérdidas fiscales",
          texto:
            "Pérdidas de ejercicios anteriores pueden disminuir la utilidad en el cierre anual, sujetas a límites del artículo 57 LISR.",
          tipo: "tip",
        },
      ],
    },
    topes: [
      { label: "Tasa ISR general PM", valor: "30%", detalle: "Sobre utilidad fiscal anual" },
      { label: "RESICO persona moral — tope", valor: "$35,000,000/año", detalle: "Ingresos cobrados para permanecer en RESICO PM" },
      { label: "Coeficiente de utilidad", valor: "Últimos 12 meses", detalle: "Para PM con utilidad variable en provisionales" },
      { label: "Dividendos a socios", valor: "10% adicional", detalle: "Retención ISR al repartir utilidades" },
    ],
    comparativa: {
      titulo: "601 Régimen general vs RESICO persona moral (626)",
      columnas: ["601 General", "626 RESICO PM"],
      filas: [
        { aspecto: "Base", valores: ["Utilidad fiscal", "Ingresos cobrados"] },
        { aspecto: "Tasa", valores: ["30%", "1% – 2.5%"] },
        { aspecto: "Deducciones", valores: ["Amplias", "No deduce gastos"] },
        { aspecto: "Tope ingresos", valores: ["Sin tope", "$35 MDP/año"] },
        { aspecto: "Contabilidad", valores: ["NIF completa", "Simplificada"] },
      ],
    },
    articulos: [
      {
        titulo: "CUFIN y reparto de utilidades",
        parrafos: [
          "La Cuenta de Utilidad Fiscal Neta (CUFIN) lleva el saldo de utilidades que ya pagaron ISR a nivel empresa. Al repartir dividendos, se retiene 10% adicional al accionista persona física.",
          "Llevar la CUFIN actualizada evita doble tributación y problemas en auditorías.",
        ],
      },
    ],
    herramientasRelacionadas: [
      {
        href: "/herramientas/calculadora-facturacion",
        label: "Calculadora de facturación",
        texto: "Útil para cotizar honorarios netos con IVA e ISR retenido a tu PM.",
      },
    ],
  },

  "fines-no-lucrativos": {
    calculoIsr: {
      titulo: "ISR en personas morales sin fines de lucro (603)",
      resumen:
        "Con autorización del SAT (Título III LISR), la organización puede estar exenta de ISR sobre ingresos destinados a su objeto social. Ingresos no relacionados o actividades mercantiles gravadas sí pueden generar ISR. Además existen obligaciones de transparencia y prevención de lavado de dinero.",
      formula:
        "ISR (si hay ingresos gravados) = Utilidad de actividades gravadas × 30%\nExento: ingresos con fines autorizados debidamente aplicados",
      pasos: [
        "Verifica que tu autorización de exención (art. 79-81 LISR) esté vigente.",
        "Separa ingresos relacionados con el fin autorizado vs ingresos gravados accesorios.",
        "Aplica los recursos exclusivamente a los fines de la autorización.",
        "Presenta declaración informativa anual del Título III.",
        "Cumple avisos de actividades vulnerables (anti-lavado) si recibes donativos en efectivo o en especie según umbrales.",
        "Publica información financiera conforme al artículo 32-D CFF si eres donataria autorizada.",
      ],
      aclaraciones: [
        {
          titulo: "Declaración de actividades vulnerables (anti-lavado)",
          texto:
            "Las donatarias autorizadas y otras entidades deben presentar avisos ante el SAT/Ley Antilavado cuando reciben donativos en efectivo u operaciones que superan umbrales. No es ISR, pero es obligación crítica — el incumplimiento genera multas graves.",
          tipo: "alerta",
        },
        {
          titulo: "Exención no es automática",
          texto:
            "Estar en el RFC con clave 603 no basta: necesitas autorización específica y renovarla. Sin ella, tributas como persona moral lucrativa.",
          tipo: "alerta",
        },
        {
          titulo: "Recibos de donativo",
          texto:
            "Solo con autorización de donataria puedes emitir comprobantes que permitan a tus donantes deducir en su declaración anual.",
          tipo: "tip",
        },
      ],
    },
    topes: [
      { label: "Destino de ingresos", valor: "100% fines autorizados", detalle: "No distribución de excedentes a asociados" },
      { label: "Actividades gravadas accesorias", valor: "Límite % ingresos", detalle: "Ingresos fuera del objeto pueden perder exención parcial" },
      { label: "Donativos deducibles para donantes", valor: "Con autorización vigente", detalle: "Hasta 7% ingresos PF o 4% PM del donante" },
      { label: "Avisos anti-lavado", valor: "Umbrales LFPIORPI", detalle: "Efectivo, donativos, operaciones vulnerables" },
    ],
    articulos: [
      {
        titulo: "Transparencia y artículo 32-D CFF",
        parrafos: [
          "Las donatarias autorizadas deben publicar en internet estados financieros, montos de donativos recibidos y aplicación de recursos.",
          "Esta transparencia es condición para mantener la autorización y la confianza de donantes institucionales.",
        ],
      },
      {
        titulo: "Renovación de autorización SAT",
        parrafos: [
          "La autorización de exención y la de donataria tienen vigencia y requisitos de renovación. Un despacho especializado revisa que tus estatutos, actas y registros contables cumplan antes de cada vencimiento.",
        ],
      },
    ],
  },
};
