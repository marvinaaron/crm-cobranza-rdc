import type { RegimenServicioBase } from "./regimenes-fiscales-types";

export const REGIMENES_PF = {
  "sueldos-salarios": {
    slug: "sueldos-salarios",
    codigoSat: "605",
    nombreCompleto: "Régimen de Sueldos y Salarios e Ingresos Asimilados a Salarios",
    tipoPersona: "pf",
    titulo: "Sueldos y salarios",
    subtitulo:
      "Asesoría para asalariados y quienes reciben ingresos asimilados: declaración anual, deducciones personales y cumplimiento sin complicaciones.",
    badge: "Persona física · Clave SAT 605",
    introSeo:
      "El régimen de sueldos y salarios (clave SAT 605) aplica a personas físicas cuyo ingreso principal proviene de una relación laboral subordinada o de pagos asimilados a salarios. Aunque el patrón retiene y entera ISR e IMSS, muchos contribuyentes deben presentar declaración anual para recuperar saldos a favor, aplicar deducciones personales o regularizar ingresos de más de un empleador. En RDC Contadores acompañamos a asalariados en Guadalajara y todo México con revisión de retenciones, cálculo de deducciones autorizadas y presentación oportuna ante el SAT.",
    metaDescription:
      "Contabilidad y asesoría fiscal para sueldos y salarios (SAT 605): declaración anual, deducciones personales, CFDI de nómina y cumplimiento SAT. Cotización en 24 h.",
    keywords: [
      "contador sueldos y salarios",
      "declaración anual asalariados México",
      "régimen 605 SAT",
      "deducciones personales ISR",
      "asesoría fiscal empleados",
      "contabilidad nómina persona física",
    ],
    heroFrom: "from-slate-700",
    heroTo: "to-slate-900",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    peculiaridades: [
      {
        titulo: "Retención en origen",
        texto:
          "El patrón calcula y entera el ISR mensualmente conforme a las tablas del artículo 96 de la LISR. Tu obligación principal es verificar que las retenciones coincidan con tus ingresos reales.",
      },
      {
        titulo: "Declaración anual",
        texto:
          "Si tuviste dos o más patrones, ingresos superiores a $400,000 anuales u otros supuestos del artículo 150 del CFF, debes presentar declaración anual para determinar saldo a favor o cargo.",
      },
      {
        titulo: "Deducciones personales",
        texto:
          "Gastos médicos, colegiaturas, intereses hipotecarios, aportaciones a AFORE y donativos pueden disminuir la base gravable cuando cuentas con CFDI que cumpla los requisitos fiscales.",
      },
      {
        titulo: "Ingresos asimilados",
        texto:
          "Miembros de consejos, comisionistas asimilados y otros supuestos del artículo 94 fracción IV de la LISR tributan en este régimen aunque no exista relación laboral tradicional.",
      },
    ],
    marcoLegal: [
      {
        referencia: "LISR, art. 94",
        texto: "Define los ingresos por salarios y los asimilados a salarios que integran la base gravable del contribuyente asalariado.",
      },
      {
        referencia: "LISR, arts. 95 y 96",
        texto: "Establecen ingresos exentos, la tarifa progresiva aplicable y el procedimiento de retención mensual que debe aplicar el patrón.",
      },
      {
        referencia: "CFF, art. 150",
        texto: "Señala los supuestos en que las personas físicas deben presentar declaración anual, incluidos asalariados con más de un patrón o ingresos elevados.",
      },
      {
        referencia: "RMF 2026, reglas 2.3.3. y Anexo 1",
        texto: "Regula la presentación de la declaración anual de personas físicas y confirma la clave 605 en el catálogo c_RegimenFiscal del SAT.",
      },
    ],
    paraQuien: [
      "Empleados con dos o más empleadores en el mismo ejercicio fiscal",
      "Asalariados con ingresos anuales que obligan a declarar ante el SAT",
      "Directores, consejeros o comisionistas con pagos asimilados a salarios",
      "Personas que desean recuperar ISR retenido en exceso mediante deducciones personales",
    ],
    queHacemos: [
      {
        titulo: "Revisión de retenciones",
        texto: "Contrastamos tus CFDI de nómina contra las tablas del SAT para detectar retenciones incorrectas antes de la declaración anual.",
      },
      {
        titulo: "Declaración anual",
        texto: "Calculamos tu saldo a favor o cargo, aplicamos deducciones personales válidas y presentamos la declaración en tiempo y forma.",
      },
      {
        titulo: "Deducciones personales",
        texto: "Te guiamos para reunir comprobantes fiscales de gastos médicos, escolares, hipotecarios y donativos deducibles.",
      },
      {
        titulo: "Asesoría continua",
        texto: "Resolvemos dudas sobre finiquitos, aguinaldo, PTU y cambios de empleo que afectan tu situación fiscal anual.",
      },
    ],
    cumplimiento: [
      "Declaración anual de personas físicas (cuando proceda)",
      "Revisión de CFDI de nómina y retenciones del patrón",
      "Cálculo y aplicación de deducciones personales autorizadas",
      "Solicitud de devolución de saldos a favor ante el SAT",
      "Atención a requerimientos y aclaraciones del fisco",
      "Orientación sobre subcontratación y finiquitos",
    ],
    portal: [
      "Resumen anual de ingresos y retenciones por patrón",
      "Repositorio de CFDI de nómina organizados por mes",
      "Estado de tu declaración anual y acuse de presentación",
      "Comunicación directa con tu contador asignado",
    ],
    precio: {
      nota: "Honorarios según complejidad · declaración anual desde cotización personalizada",
    },
  },
  resico: {
    slug: "resico",
    codigoSat: "626",
    nombreCompleto: "Régimen Simplificado de Confianza — Personas Físicas",
    tipoPersona: "pf",
    titulo: "RESICO Persona Física",
    subtitulo:
      "Contabilidad mensual para profesionistas y emprendedores con ingresos hasta 3.5 millones de pesos: ISR simplificado, IVA y portal de cliente incluido.",
    badge: "Persona física · Clave SAT 626",
    introSeo:
      "El Régimen Simplificado de Confianza (RESICO) es la opción más popular para personas físicas con actividad empresarial cuyos ingresos anuales no superan 3.5 millones de pesos. Ofrece tasas de ISR reducidas, contabilidad simplificada y obligaciones mensuales claras. En RDC Contadores llevamos tu RESICO de punta a punta: desde el alta en el RFC hasta el cálculo mensual de impuestos, la emisión de facturas y la declaración anual, con un portal donde consultas el estado de cada mes.",
    metaDescription:
      "Contabilidad RESICO persona física desde $812/mes IVA incluido. ISR mensual, IVA, facturación, declaración anual y portal de cliente. Ingresos hasta 3.5 MDP.",
    keywords: [
      "contador RESICO",
      "contabilidad RESICO precio",
      "régimen simplificado de confianza",
      "RESICO persona física Guadalajara",
      "honorarios contador RESICO",
      "clave SAT 626",
    ],
    heroFrom: "from-violet-600",
    heroTo: "to-indigo-800",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    peculiaridades: [
      {
        titulo: "Tope de ingresos",
        texto:
          "Puedes permanecer en RESICO mientras tus ingresos anuales no excedan 3.5 millones de pesos. Si los superas, debes cambiar de régimen a partir del mes siguiente.",
      },
      {
        titulo: "Tasas preferenciales de ISR",
        texto:
          "El ISR se calcula con tasas del 1% al 2.5% sobre ingresos cobrados (no devengados), significativamente menores que el régimen de actividades empresariales.",
      },
      {
        titulo: "Sin deducciones autorizadas",
        texto:
          "A diferencia del régimen tradicional, en RESICO no se deducen gastos operativos; la tasa baja compensa la simplificación contable.",
      },
      {
        titulo: "IVA acreditable limitado",
        texto:
          "Solo puedes acreditar IVA de gastos estrictamente indispensables vinculados a tu actividad, conforme al artículo 113-G de la LISR.",
      },
    ],
    marcoLegal: [
      {
        referencia: "LISR, art. 113-E",
        texto: "Establece los requisitos, supuestos de aplicación y causales de exclusión del RESICO para personas físicas.",
      },
      {
        referencia: "LISR, art. 113-F",
        texto: "Define las tasas de ISR aplicables según el monto de ingresos cobrados en el periodo de declaración mensual.",
      },
      {
        referencia: "LISR, art. 113-G",
        texto: "Regula las obligaciones de pago provisional, acreditamiento de IVA y presentación de declaraciones informativas del contribuyente RESICO.",
      },
      {
        referencia: "RMF 2026, reglas 2.7.1. y Anexo 1",
        texto: "Detalla procedimientos de inscripción, cambio de régimen y la clave 626 en el catálogo c_RegimenFiscal vigente ante el SAT.",
      },
    ],
    paraQuien: [
      "Profesionistas independientes con ingresos hasta 3.5 MDP anuales",
      "Freelancers, consultores y prestadores de servicios profesionales",
      "Emprendedores que buscan contabilidad simple y tasas bajas de ISR",
      "Contribuyentes que migran desde actividades empresariales o plataformas tecnológicas",
    ],
    queHacemos: [
      {
        titulo: "Alta y cambio de régimen",
        texto: "Gestionamos tu inscripción o cambio a RESICO en el RFC sin costo adicional dentro del servicio mensual.",
      },
      {
        titulo: "Cálculo mensual de impuestos",
        texto: "Determinamos ISR e IVA de cada mes con base en tus ingresos cobrados y gastos acreditables permitidos.",
      },
      {
        titulo: "Facturación y contabilidad",
        texto: "Te apoyamos con la emisión de CFDI, registro de ingresos y conciliación bancaria simplificada.",
      },
      {
        titulo: "Declaración anual",
        texto: "Presentamos tu declaración anual del ejercicio y resolvemos cualquier requerimiento del SAT.",
      },
    ],
    cumplimiento: [
      "Declaraciones mensuales de ISR RESICO",
      "Declaraciones mensuales de IVA (cuando aplique)",
      "Declaración anual de persona física",
      "Emisión y control de facturas electrónicas (CFDI)",
      "Monitoreo del buzón tributario del SAT",
      "Asesoría para cambio de régimen si superas el tope de ingresos",
      "Contabilidad electrónica cuando sea exigible",
    ],
    portal: [
      "Dashboard mensual con ISR, IVA y estado de pago",
      "Carga y consulta de comprobantes fiscales",
      "Acuses de declaraciones presentadas ante el SAT",
      "Facturas de honorarios y historial de pagos",
    ],
    precio: {
      monto: "$812",
      nota: "IVA incluido · ingresos anuales hasta 3.5 MDP",
    },
    herramienta: {
      href: "/herramientas/isr-resico",
      label: "Calculadora ISR RESICO",
    },
  },
  "actividades-empresariales": {
    slug: "actividades-empresariales",
    codigoSat: "612",
    nombreCompleto:
      "Régimen de las Personas Físicas con Actividades Empresariales y Profesionales",
    tipoPersona: "pf",
    titulo: "Actividades empresariales",
    subtitulo:
      "Contabilidad completa para negocios y profesionistas que necesitan deducir gastos, llevar registros contables y optimizar su carga fiscal.",
    badge: "Persona física · Clave SAT 612",
    introSeo:
      "El régimen de actividades empresariales y profesionales (clave SAT 612) es el esquema tradicional para personas físicas que operan un negocio propio o ejercen una profesión de forma independiente. Permite deducir gastos estrictamente indispensables y determinar el ISR con tarifa progresiva sobre la utilidad fiscal. Es la opción natural cuando tus ingresos superan el tope de RESICO, tienes gastos significativos que deducir o requieres estructura contable robusta. En RDC Contadores ofrecemos contabilidad mensual, nómina si la necesitas y acompañamiento fiscal integral.",
    metaDescription:
      "Contabilidad para actividades empresariales y profesionales (SAT 612): deducciones, ISR mensual, IVA, nómina y declaración anual. Cotización personalizada en 24 h.",
    keywords: [
      "contador actividades empresariales",
      "régimen 612 SAT",
      "contabilidad persona física con negocio",
      "deducciones ISR persona física",
      "contador profesionistas independientes",
      "honorarios contabilidad PF",
    ],
    heroFrom: "from-cyan-600",
    heroTo: "to-sky-800",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    peculiaridades: [
      {
        titulo: "Base gravable por utilidad",
        texto:
          "El ISR se calcula sobre ingresos acumulables menos deducciones autorizadas y PTU, aplicando la tarifa del artículo 96 de la LISR.",
      },
      {
        titulo: "Deducciones amplias",
        texto:
          "Puedes deducir sueldos, renta, insumos, depreciación, honorarios y otros gastos estrictamente indispensables con comprobante fiscal.",
      },
      {
        titulo: "Pagos provisionales mensuales",
        texto:
          "Debes enterar ISR e IVA mensualmente con base en la utilidad del periodo, conforme a los artículos 106 y 127 de la LISR.",
      },
      {
        titulo: "Sin tope de ingresos",
        texto:
          "A diferencia de RESICO, no existe límite de ingresos; es el régimen obligatorio cuando excedes 3.5 MDP o no cumples requisitos del RESICO.",
      },
    ],
    marcoLegal: [
      {
        referencia: "LISR, art. 95, fracc. IV",
        texto: "Incluye entre los ingresos acumulables los derivados de actividades empresariales y profesionales independientes.",
      },
      {
        referencia: "LISR, arts. 106 a 110",
        texto: "Establecen el método de cálculo del ISR para personas físicas con actividad empresarial, incluidos pagos provisionales.",
      },
      {
        referencia: "LISR, arts. 115 a 121",
        texto: "Regulan las deducciones autorizadas, requisitos de los comprobantes y límites para gastos específicos.",
      },
      {
        referencia: "RMF 2026, reglas 2.3.2. y Anexo 1",
        texto: "Detalla obligaciones de contabilidad electrónica, declaraciones y la clave 612 en el catálogo c_RegimenFiscal.",
      },
    ],
    paraQuien: [
      "Dueños de negocios con gastos operativos significativos que conviene deducir",
      "Profesionistas con ingresos superiores al tope de RESICO (3.5 MDP)",
      "Comerciantes, talleres, consultorios y pequeñas empresas familiares",
      "Contribuyentes que salen de RESICO por exceder el límite de ingresos",
    ],
    queHacemos: [
      {
        titulo: "Contabilidad mensual",
        texto: "Registramos ingresos, egresos y conciliaciones bancarias para determinar tu utilidad fiscal real cada mes.",
      },
      {
        titulo: "Cálculo de ISR e IVA",
        texto: "Presentamos pagos provisionales mensuales con la tarifa correcta y maximizamos deducciones válidas.",
      },
      {
        titulo: "Facturación y CFDI",
        texto: "Configuramos tu emisión de facturas, complementos y cancelaciones conforme a las reglas del SAT.",
      },
      {
        titulo: "Declaración anual",
        texto: "Cerramos el ejercicio fiscal, ajustamos deducciones y presentamos la declaración anual completa.",
      },
    ],
    cumplimiento: [
      "Pagos provisionales mensuales de ISR",
      "Declaraciones mensuales de IVA",
      "Declaración anual de persona física",
      "Contabilidad electrónica (catálogo de cuentas y pólizas)",
      "Control de retenciones de ISR e IVA a terceros",
      "DIOT y obligaciones informativas cuando aplique",
      "Asesoría en deducciones y estructura de gastos",
    ],
    portal: [
      "Estado de resultados y balanza mensual simplificada",
      "Comprobantes fiscales cargados y clasificados",
      "Calendario de obligaciones y vencimientos",
      "Acuses de declaraciones y comprobantes de pago",
    ],
    precio: {
      nota: "Honorarios según volumen de operaciones · cotización personalizada en 24 h",
    },
  },
  arrendamiento: {
    slug: "arrendamiento",
    codigoSat: "606",
    nombreCompleto: "Régimen de Arrendamiento de Inmuebles",
    tipoPersona: "pf",
    titulo: "Arrendamiento",
    subtitulo:
      "Asesoría fiscal para propietarios que rentan casas, departamentos o locales: ISR sobre rentas, deducciones y cumplimiento mensual ante el SAT.",
    badge: "Persona física · Clave SAT 606",
    introSeo:
      "El régimen de arrendamiento (clave SAT 606, no confundir con la clave 609 de consolidación) aplica a personas físicas que obtienen ingresos por el uso o goce temporal de inmuebles. El ISR se determina sobre la renta cobrada menos deducciones como depósitos en garantía no devueltos, cuotas de mantenimiento y, en ciertos casos, depreciación del inmueble. En RDC Contadores ayudamos a propietarios individuales y pequeños inversionistas inmobiliarios a cumplir con sus obligaciones mensuales, facturar correctamente a inquilinos y optimizar su carga fiscal dentro del marco legal.",
    metaDescription:
      "Contabilidad y asesoría fiscal para arrendamiento de inmuebles (SAT 606): ISR sobre rentas, deducciones, facturación a inquilinos y declaración anual.",
    keywords: [
      "contador arrendamiento",
      "ISR renta de inmuebles",
      "régimen 606 SAT",
      "declaración mensual arrendamiento",
      "asesoría fiscal renta de casas",
      "impuestos por rentar departamento México",
    ],
    heroFrom: "from-amber-600",
    heroTo: "to-orange-800",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    peculiaridades: [
      {
        titulo: "Ingreso por renta cobrada",
        texto:
          "Los ingresos acumulables son las rentas efectivamente cobradas en el mes, incluyendo depósitos en garantía que no fueron devueltos al inquilino.",
      },
      {
        titulo: "Deducción de inversión",
        texto:
          "Puedes deducir la inversión del inmueble mediante depreciación lineal al 5% anual sobre el valor de adquisición actualizado, conforme al artículo 136 de la LISR.",
      },
      {
        titulo: "Pagos provisionales mensuales",
        texto:
          "El ISR se paga mensualmente aplicando la tarifa del artículo 96 sobre la base gravable (rentas menos deducciones del periodo).",
      },
      {
        titulo: "Retención al inquilino persona moral",
        texto:
          "Si tu inquilino es persona moral, debe retener el 10% de ISR sobre la renta y enterarlo al SAT, generándote crédito fiscal.",
      },
    ],
    marcoLegal: [
      {
        referencia: "LISR, arts. 136 a 142",
        texto: "Regulan los ingresos por arrendamiento, deducciones permitidas, depreciación de inmuebles y determinación del ISR.",
      },
      {
        referencia: "LISR, art. 118, fracc. I",
        texto: "Establece el tratamiento de la inversión en bienes inmuebles destinados al arrendamiento para efectos de deducción.",
      },
      {
        referencia: "CFF, art. 127",
        texto: "Obliga a las personas morales que paguen renta a retener el 10% de ISR y enterarlo al fisco mediante declaración informativa.",
      },
      {
        referencia: "RMF 2026, Anexo 1, clave 606",
        texto: "Confirma el régimen de arrendamiento en el catálogo c_RegimenFiscal y las reglas de presentación de declaraciones mensuales.",
      },
    ],
    paraQuien: [
      "Propietarios que rentan una o varias viviendas o departamentos",
      "Inversionistas con locales comerciales o bodegas en arrendamiento",
      "Personas físicas con ingresos mixtos que incluyen rentas inmobiliarias",
      "Quienes heredaron inmuebles y desean regularizar su situación fiscal",
    ],
    queHacemos: [
      {
        titulo: "Registro de rentas",
        texto: "Llevamos el control mensual de rentas cobradas, depósitos en garantía y gastos deducibles de cada inmueble.",
      },
      {
        titulo: "Cálculo de ISR mensual",
        texto: "Determinamos la base gravable, aplicamos depreciación y presentamos pagos provisionales ante el SAT.",
      },
      {
        titulo: "Facturación a inquilinos",
        texto: "Te asesoramos para emitir CFDI de arrendamiento con el IVA y retenciones que correspondan según tu inquilino.",
      },
      {
        titulo: "Declaración anual",
        texto: "Consolidamos todos tus inmuebles en la declaración anual y verificamos retenciones de inquilinos morales.",
      },
    ],
    cumplimiento: [
      "Pagos provisionales mensuales de ISR por arrendamiento",
      "Declaración anual de persona física",
      "Emisión de CFDI de arrendamiento",
      "Control de retenciones de ISR por inquilinos personas morales",
      "Registro de depreciación de inmuebles",
      "Asesoría sobre IVA en arrendamiento de inmuebles habitacionales y comerciales",
    ],
    portal: [
      "Resumen de rentas por inmueble y por mes",
      "Comprobantes de renta y contratos archivados",
      "Estado de pagos provisionales y acuses SAT",
      "Alertas de vencimientos mensuales",
    ],
    precio: {
      nota: "Honorarios según número de inmuebles · cotización en 24 h",
    },
  },
  "plataformas-tecnologicas": {
    slug: "plataformas-tecnologicas",
    codigoSat: "625",
    nombreCompleto:
      "Régimen de las Actividades Empresariales con Ingresos a través de Plataformas Tecnológicas",
    tipoPersona: "pf",
    titulo: "Plataformas tecnológicas",
    subtitulo:
      "Contabilidad para repartidores, conductores y vendedores en apps: retenciones de plataformas, ISR, IVA y facturación alineada al SAT.",
    badge: "Persona física · Clave SAT 625",
    introSeo:
      "El régimen de plataformas tecnológicas (clave SAT 625) regula a personas físicas que obtienen ingresos a través de aplicaciones digitales como Uber, DiDi, Rappi, Mercado Libre y similares. Las plataformas están obligadas a retener ISR e IVA, pero el contribuyente debe presentar declaraciones mensuales, conciliar retenciones y, en muchos casos, migrar a RESICO para optimizar su carga fiscal. En RDC Contadores conocemos las particularidades de este régimen y ayudamos a trabajadores de la economía digital a cumplir sin sorpresas.",
    metaDescription:
      "Contabilidad para plataformas tecnológicas (SAT 625): Uber, DiDi, Rappi. Retenciones, ISR, IVA, RESICO y facturación. Calculadora y cotización en 24 h.",
    keywords: [
      "contador Uber DiDi",
      "impuestos plataformas tecnológicas",
      "régimen 625 SAT",
      "contabilidad repartidores",
      "retenciones apps delivery",
      "RESICO conductores",
    ],
    heroFrom: "from-emerald-600",
    heroTo: "to-green-800",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    peculiaridades: [
      {
        titulo: "Retenciones de la plataforma",
        texto:
          "Las plataformas retienen ISR (1% a 20% según el caso) e IVA del 8% sobre cada pago, y emiten CFDI de retenciones que debes conciliar mensualmente.",
      },
      {
        titulo: "Posibilidad de migrar a RESICO",
        texto:
          "Si tus ingresos totales no superan 3.5 MDP y cumples requisitos, puedes cambiar a RESICO (626) para tasas de ISR más favorables.",
      },
      {
        titulo: "IVA sobre comisiones",
        texto:
          "Las comisiones que la plataforma cobra generan IVA acreditable; es fundamental registrar correctamente estos CFDI para no pagar de más.",
      },
      {
        titulo: "Declaraciones mensuales obligatorias",
        texto:
          "Aunque la plataforma retenga, debes presentar declaración mensual de ISR e IVA aplicando las retenciones como crédito fiscal.",
      },
    ],
    marcoLegal: [
      {
        referencia: "LISR, arts. 113-B a 113-D",
        texto: "Establecen el régimen de ingresos por plataformas tecnológicas, retenciones y obligaciones de los prestadores de servicios.",
      },
      {
        referencia: "LISR, art. 113-E",
        texto: "Permite a contribuyentes de plataformas migrar al RESICO cuando cumplan los requisitos de ingresos y actividad.",
      },
      {
        referencia: "CFF, art. 27, fracc. III",
        texto: "Obliga a plataformas tecnológicas residentes en México a retener ISR e IVA y emitir comprobantes de retenciones.",
      },
      {
        referencia: "RMF 2026, reglas 2.7.3. y Anexo 1, clave 625",
        texto: "Detalla procedimientos de registro, declaraciones mensuales y retenciones aplicables a prestadores de servicios en plataformas.",
      },
    ],
    paraQuien: [
      "Conductores de Uber, DiDi, InDriver y apps de movilidad",
      "Repartidores de Rappi, Uber Eats y servicios de delivery",
      "Vendedores en Mercado Libre, Amazon y marketplaces digitales",
      "Freelancers que cobran a través de plataformas tecnológicas reguladas",
    ],
    queHacemos: [
      {
        titulo: "Conciliación de retenciones",
        texto: "Cruzamos los CFDI de la plataforma con tus ingresos reales para presentar declaraciones correctas cada mes.",
      },
      {
        titulo: "Evaluación RESICO",
        texto: "Analizamos si conviene migrar a RESICO y gestionamos el cambio de régimen ante el SAT.",
      },
      {
        titulo: "Declaraciones mensuales",
        texto: "Calculamos ISR e IVA aplicando retenciones como crédito fiscal y presentamos en tiempo y forma.",
      },
      {
        titulo: "Facturación complementaria",
        texto: "Te orientamos para emitir facturas cuando tus clientes o la plataforma lo requieran.",
      },
    ],
    cumplimiento: [
      "Declaraciones mensuales de ISR con retenciones de plataforma",
      "Declaraciones mensuales de IVA",
      "Declaración anual de persona física",
      "Conciliación de CFDI de ingresos y retenciones",
      "Cambio de régimen a RESICO cuando convenga",
      "Atención a requerimientos del SAT por discrepancias de retenciones",
    ],
    portal: [
      "Ingresos consolidados por plataforma y por mes",
      "CFDI de retenciones organizados automáticamente",
      "Comparativo RESICO vs régimen de plataformas",
      "Acuses de declaraciones y estado de cumplimiento",
    ],
    precio: {
      nota: "Honorarios accesibles para trabajadores de plataformas · cotización en 24 h",
    },
    herramienta: {
      href: "/herramientas/calculadora-facturacion",
      label: "Calculadora de facturación e impuestos",
    },
  },
  rif: {
    slug: "rif",
    codigoSat: "621",
    nombreCompleto:
      "Régimen de Incorporación Fiscal (en transición)",
    tipoPersona: "pf",
    titulo: "RIF en transición",
    subtitulo:
      "Acompañamiento a contribuyentes del extinto RIF: cumplimiento durante el periodo de transición, migración a RESICO y planeación fiscal hasta 2031.",
    badge: "Persona física · Clave SAT 621 · En extinción",
    introSeo:
      "El Régimen de Incorporación Fiscal (RIF) fue derogado a partir de 2022 y ya no admite nuevas altas. Los contribuyentes que estaban incorporados continúan en transición bajo la clave SAT 621, con beneficios decrecientes, hasta completar su periodo o migrar a RESICO u otro régimen. En RDC Contadores asesoramos a quienes aún están en RIF para cumplir sus obligaciones, planear la migración oportuna y aprovechar las tasas residuales mientras dure la transición, que para muchos contribuyentes puede extenderse hasta aproximadamente 2031.",
    metaDescription:
      "Asesoría fiscal RIF en transición (SAT 621): derogado desde 2022, migración a RESICO, obligaciones mensuales y planeación hasta 2031. Cotización en 24 h.",
    keywords: [
      "RIF en transición",
      "régimen incorporación fiscal 2026",
      "migrar de RIF a RESICO",
      "clave SAT 621",
      "RIF derogado México",
      "contador RIF",
    ],
    heroFrom: "from-rose-600",
    heroTo: "to-pink-800",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    peculiaridades: [
      {
        titulo: "Régimen derogado desde 2022",
        texto:
          "La Ley de Ingresos de la Federación para 2022 eliminó el RIF para nuevas incorporaciones. Solo continúan quienes ya estaban registrados.",
      },
      {
        titulo: "Periodo de transición prolongado",
        texto:
          "Los contribuyentes incorporados mantienen beneficios decrecientes durante el plazo original de 10 años, pudiendo extenderse hasta cerca de 2031 según su fecha de alta.",
      },
      {
        titulo: "Migración recomendada a RESICO",
        texto:
          "Para la mayoría de contribuyentes, RESICO ofrece tasas similares o mejores con obligaciones más claras; evaluamos el momento óptimo de cambio.",
      },
      {
        titulo: "Sin nuevas altas",
        texto:
          "Si inicias actividad empresarial hoy, no puedes incorporarte al RIF; debes elegir RESICO, actividades empresariales u otro régimen vigente.",
      },
    ],
    marcoLegal: [
      {
        referencia: "LIF 2022, art. transitorio",
        texto: "Derogó el Régimen de Incorporación Fiscal para nuevas altas y estableció las reglas de transición para contribuyentes activos.",
      },
      {
        referencia: "LISR, art. 111 (derogado)",
        texto: "El Capítulo II Sección II que regulaba el RIF fue abrogado; los contribuyentes en transición se rigen por disposiciones transitorias.",
      },
      {
        referencia: "LISR, art. 113-E",
        texto: "Regula el RESICO como régimen de destino natural para contribuyentes que migran desde el extinto RIF.",
      },
      {
        referencia: "RMF 2026, Anexo 1, clave 621",
        texto: "Mantiene la clave 621 en el catálogo c_RegimenFiscal exclusivamente para contribuyentes en periodo de transición del RIF.",
      },
    ],
    paraQuien: [
      "Contribuyentes incorporados al RIF antes de 2022 que aún están en transición",
      "Pequeños comerciantes y artesanos con clave SAT 621 activa",
      "Quienes buscan migrar a RESICO sin perder beneficios pendientes",
      "Contribuyentes con dudas sobre cuándo termina su periodo de incorporación",
    ],
    queHacemos: [
      {
        titulo: "Diagnóstico de transición",
        texto: "Revisamos tu fecha de incorporación, años restantes y beneficios vigentes para planear la migración.",
      },
      {
        titulo: "Cumplimiento mensual",
        texto: "Presentamos declaraciones bajo las reglas transitorias del RIF mientras permanezcas en este régimen.",
      },
      {
        titulo: "Migración a RESICO",
        texto: "Gestionamos el cambio de régimen en el momento más favorable para no perder incentivos ni pagar de más.",
      },
      {
        titulo: "Regularización",
        texto: "Atendemos rezagos, requerimientos del SAT y situaciones de contribuyentes que nunca presentaron declaraciones.",
      },
    ],
    cumplimiento: [
      "Declaraciones mensuales bajo reglas transitorias del RIF",
      "Declaración anual de persona física",
      "Evaluación y ejecución de migración a RESICO",
      "Control de vigencia del periodo de incorporación",
      "Emisión y control de facturas electrónicas",
      "Atención a requerimientos del SAT",
    ],
    portal: [
      "Línea de tiempo de tu periodo de transición RIF",
      "Comparativo fiscal RIF vs RESICO actualizado",
      "Historial de declaraciones y acuses",
      "Alertas para migración de régimen",
    ],
    precio: {
      nota: "Honorarios según situación de transición · cotización personalizada en 24 h",
    },
  },
} as const satisfies Record<string, RegimenServicioBase>;
