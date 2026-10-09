import type { RegimenServicioBase } from "./regimenes-fiscales-types";

export const REGIMENES_PM = {
  "regimen-general": {
    slug: "regimen-general",
    codigoSat: "601",
    nombreCompleto: "Régimen General de Ley Personas Morales",
    tipoPersona: "pm",
    titulo: "Régimen general",
    subtitulo:
      "Contabilidad integral para empresas: estados financieros, ISR, IVA, nómina, DIOT y cumplimiento mensual ante el SAT y IMSS.",
    badge: "Persona moral · Clave SAT 601",
    introSeo:
      "El régimen general de ley (Título II de la LISR, clave SAT 601) es el esquema fiscal obligatorio para la mayoría de las personas morales que realizan actividades lucrativas en México. Comprende el cálculo de ISR sobre utilidad fiscal, IVA mensual, retenciones, obligaciones laborales y contabilidad electrónica. En RDC Contadores ofrecemos servicio mensual completo para empresas en Guadalajara y todo el país: desde la contabilidad y nómina hasta la declaración anual y la representación ante el fisco.",
    metaDescription:
      "Contabilidad para personas morales régimen general (SAT 601): ISR, IVA, nómina, DIOT, estados financieros y declaración anual. Cotización en 24 h.",
    keywords: [
      "contador persona moral",
      "contabilidad régimen general",
      "régimen 601 SAT",
      "honorarios contador empresa",
      "ISR IVA persona moral",
      "contabilidad empresas Guadalajara",
    ],
    heroFrom: "from-indigo-600",
    heroTo: "to-blue-900",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    peculiaridades: [
      {
        titulo: "ISR sobre utilidad fiscal",
        texto:
          "La persona moral paga ISR al 30% sobre la utilidad fiscal anual, con pagos provisionales mensuales calculados conforme al artículo 14 de la LISR.",
      },
      {
        titulo: "Contabilidad electrónica obligatoria",
        texto:
          "Debes enviar al SAT catálogo de cuentas, balanza de comprobación y pólizas del periodo, conforme al artículo 28 del CFF y la RMF vigente.",
      },
      {
        titulo: "IVA mensual y DIOT",
        texto:
          "Enteras IVA mensualmente y presentas la Declaración Informativa de Operaciones con Terceros (DIOT) cuando realizas pagos a proveedores.",
      },
      {
        titulo: "Obligaciones laborales",
        texto:
          "Si tienes empleados, debes calcular y enterar ISR por salarios, IMSS, INFONAVIT y presentar las declaraciones informativas correspondientes.",
      },
    ],
    marcoLegal: [
      {
        referencia: "LISR, Título II, arts. 9 a 11",
        texto: "Establecen la obligación de las personas morales de pagar ISR sobre su utilidad fiscal a la tasa del 30%.",
      },
      {
        referencia: "LISR, art. 14",
        texto: "Regula los pagos provisionales mensuales de ISR para personas morales con base en la utilidad del periodo.",
      },
      {
        referencia: "CFF, arts. 28 y 29",
        texto: "Obligan a llevar contabilidad electrónica y a conservar la documentación comprobatoria de las operaciones.",
      },
      {
        referencia: "RMF 2026, reglas 2.3.1. y Anexo 1, clave 601",
        texto: "Detalla obligaciones de declaración, contabilidad electrónica y la clave 601 en el catálogo c_RegimenFiscal.",
      },
    ],
    paraQuien: [
      "Sociedades mercantiles (S.A., S. de R.L., S.A.P.I.) con actividad lucrativa",
      "Empresas con facturación mensual y obligaciones de IVA",
      "Negocios con empleados que requieren nómina y cumplimiento IMSS",
      "Personas morales que superan los topes de RESICO PM o no califican",
    ],
    queHacemos: [
      {
        titulo: "Contabilidad mensual completa",
        texto: "Registramos operaciones, conciliamos bancos y generamos balanza y estado de resultados cada mes.",
      },
      {
        titulo: "Nómina y obligaciones laborales",
        texto: "Calculamos sueldos, retenciones, cuotas IMSS/INFONAVIT y presentamos declaraciones informativas.",
      },
      {
        titulo: "ISR, IVA y retenciones",
        texto: "Determinamos pagos provisionales mensuales, DIOT y retenciones a proveedores y asimilados.",
      },
      {
        titulo: "Declaración anual y CUFIN",
        texto: "Cerramos el ejercicio, calculamos la CUFIN y presentamos la declaración anual de la persona moral.",
      },
    ],
    cumplimiento: [
      "Pagos provisionales mensuales de ISR",
      "Declaraciones mensuales de IVA",
      "DIOT mensual de operaciones con terceros",
      "Nómina, IMSS, INFONAVIT y retenciones de ISR",
      "Contabilidad electrónica (catálogo, balanza, pólizas)",
      "Declaración anual de persona moral",
      "REPSE, ICSOE y SISUB cuando aplique por subcontratación",
    ],
    portal: [
      "Estados financieros mensuales y reportes de gestión",
      "Control de facturas emitidas y recibidas",
      "Calendario fiscal con vencimientos de impuestos y nómina",
      "Acuses de declaraciones y comprobantes de pago SAT/IMSS",
    ],
    precio: {
      nota: "Honorarios según volumen, nómina y complejidad · cotización en 24 h",
    },
  },
  "fines-no-lucrativos": {
    slug: "fines-no-lucrativos",
    codigoSat: "603",
    nombreCompleto:
      "Personas Morales con Fines no Lucrativos",
    tipoPersona: "pm",
    titulo: "Fines no lucrativos",
    subtitulo:
      "Asesoría fiscal para asociaciones civiles, fundaciones e instituciones de asistencia social: autorización SAT, transparencia y cumplimiento del Título III de la LISR.",
    badge: "Persona moral · Clave SAT 603",
    introSeo:
      "Las personas morales con fines no lucrativos (clave SAT 603, Título III de la LISR) pueden obtener autorización del SAT para estar exentas del ISR, siempre que destinen sus recursos exclusivamente a los fines autorizados. Sin embargo, deben cumplir obligaciones de transparencia, presentar declaraciones informativas y mantener su autorización vigente. En RDC Contadores acompañamos a asociaciones civiles, fundaciones, colegios y organizaciones de asistencia social en su cumplimiento fiscal y en la renovación de su autorización.",
    metaDescription:
      "Contabilidad para personas morales sin fines de lucro (SAT 603): autorización SAT, declaración informativa, transparencia y cumplimiento Título III LISR.",
    keywords: [
      "contador asociación civil",
      "personas morales fines no lucrativos",
      "régimen 603 SAT",
      "autorización SAT donativos",
      "contabilidad ONG México",
      "Título III LISR",
    ],
    heroFrom: "from-teal-600",
    heroTo: "to-cyan-800",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    peculiaridades: [
      {
        titulo: "Autorización del SAT",
        texto:
          "Para estar exenta de ISR necesitas autorización vigente conforme a los artículos 79 a 81 de la LISR, con actividad acorde a tu objeto social.",
      },
      {
        titulo: "Destino exclusivo de ingresos",
        texto:
          "Los ingresos deben aplicarse íntegramente a los fines autorizados; la distribución de excedentes a socios o asociados está prohibida.",
      },
      {
        titulo: "Donativos deducibles",
        texto:
          "Con la autorización correcta (incluida la de donataria autorizada), tus donantes pueden deducir los donativos en su declaración anual.",
      },
      {
        titulo: "Transparencia y reportes",
        texto:
          "Debes publicar información financiera y presentar declaración informativa anual ante el SAT para mantener la exención.",
      },
    ],
    marcoLegal: [
      {
        referencia: "LISR, arts. 79 a 82",
        texto: "Regulan la autorización, requisitos y causales de revocación de la exención de ISR para organizaciones sin fines de lucro.",
      },
      {
        referencia: "LISR, arts. 83 a 87",
        texto: "Establecen las obligaciones de destino de ingresos, actividades mercantiles accesorias y tratamiento de ingresos no relacionados.",
      },
      {
        referencia: "CFF, art. 32-D",
        texto: "Obliga a publicar información financiera en medios electrónicos para contribuyentes con autorización de donataria.",
      },
      {
        referencia: "RMF 2026, reglas 3.10. y Anexo 1, clave 603",
        texto: "Detalla requisitos de la declaración informativa anual, renovación de autorización y la clave 603 en el catálogo c_RegimenFiscal.",
      },
    ],
    paraQuien: [
      "Asociaciones civiles (A.C.) con actividad sin fines de lucro",
      "Fundaciones y instituciones de asistencia social",
      "Colegios, cámaras y organizaciones gremiales autorizadas",
      "ONG que buscan o renovar autorización de donataria ante el SAT",
    ],
    queHacemos: [
      {
        titulo: "Contabilidad y transparencia",
        texto: "Llevamos registros contables claros y preparamos la información para cumplir con el artículo 32-D del CFF.",
      },
      {
        titulo: "Declaración informativa anual",
        texto: "Presentamos la declaración informativa del Título III y verificamos que los ingresos se destinen correctamente.",
      },
      {
        titulo: "Autorización y renovación SAT",
        texto: "Te asesoramos para obtener, mantener o renovar la autorización de exención y de donataria autorizada.",
      },
      {
        titulo: "Emisión de recibos de donativo",
        texto: "Configuramos la emisión de comprobantes fiscales de donativo conforme a los requisitos del SAT.",
      },
    ],
    cumplimiento: [
      "Declaración informativa anual (Título III LISR)",
      "Publicación de información financiera (art. 32-D CFF)",
      "Contabilidad electrónica cuando sea exigible",
      "Emisión de recibos de donativo deducibles",
      "IVA en actividades gravadas accesorias",
      "Retenciones de ISR e IVA a proveedores y asimilados",
      "Renovación de autorización de donataria ante el SAT",
    ],
    portal: [
      "Reportes de ingresos y egresos por programa o proyecto",
      "Documentación para transparencia y donantes",
      "Estado de autorizaciones SAT vigentes",
      "Acuses de declaraciones informativas presentadas",
    ],
    precio: {
      nota: "Honorarios según tamaño y actividades de la organización · cotización en 24 h",
    },
  },
} as const satisfies Record<string, RegimenServicioBase>;
