import type { RegimenServicioBase } from "./regimenes-fiscales-types";

export const REGIMENES_PM = {
  "regimen-general": {
    slug: "regimen-general",
    codigoSat: "601",
    nombreCompleto: "Régimen General de Ley Personas Morales",
    tipoPersona: "pm",
    titulo: "Régimen general",
    subtitulo:
      "El ISR se calcula sobre lo facturado. El IVA, sobre lo cobrado. La DIOT viaja con el IVA. El cierre es en marzo.",
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
        referencia: "LISR, arts. 9 y 17",
        texto:
          "El ISR es el 30% sobre utilidad fiscal. El ingreso se acumula al facturar o prestar el servicio, aunque no se haya cobrado.",
      },
      {
        referencia: "LIVA, art. 1-B · DIOT",
        texto:
          "El IVA se causa cuando el pago se cobra de verdad. La DIOT informa las operaciones con terceros y cruza el IVA acreditable.",
      },
      {
        referencia: "LISR, art. 14",
        texto:
          "Pagos provisionales mensuales con coeficiente de utilidad sobre ingresos nominales acumulados. No es el 30% de la utilidad contable del mes.",
      },
      {
        referencia: "LISR, arts. 77 y 78",
        texto:
          "La CUFIN guarda utilidades que ya pagaron ISR. La CUCA guarda las aportaciones de los socios. Las dos se actualizan en el cierre.",
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
        titulo: "Declaración anual, CUFIN y CUCA",
        texto:
          "Cerramos el ejercicio, actualizamos CUFIN y CUCA y presentamos la declaración anual de la persona moral.",
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
      "El ISR del objeto social no se causa. La donataria es otra autorización. El IVA no se apaga. El cierre es en febrero.",
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
        referencia: "LISR, arts. 79 y 80",
        texto:
          "Quién entra al Título III y el destino exclusivo de los ingresos. El remanente no se reparte a asociados. Lo no relacionado paga ISR al 30%.",
      },
      {
        referencia: "LISR, art. 82",
        texto:
          "La donataria es otra autorización: el donante deduce, tú emites CFDI de donativo y presentas el informe de transparencia.",
      },
      {
        referencia: "LISR, art. 86",
        texto:
          "La declaración anual del Título III es en febrero, a más tardar el día 15. Marzo es de persona moral lucrativa.",
      },
      {
        referencia: "LIVA, arts. 1-B y 15",
        texto:
          "El IVA no se apaga por ser 603. Un donativo no lo causa. Un servicio gravado sí, al cobrarse. Algunos actos van exentos por la LIVA, no por la clave.",
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
        titulo: "Contabilidad del objeto y de lo ajeno",
        texto:
          "Separamos ingresos estatutarios de los no relacionados. El 30% solo entra donde la ley lo manda.",
      },
      {
        titulo: "Anual de febrero y remanente",
        texto:
          "Presentamos la declaración del artículo 86 y verificamos que el remanente no se reparta a asociados.",
      },
      {
        titulo: "Donataria e informe de transparencia",
        texto:
          "Tramitamos, sostenemos o renovamos la autorización del artículo 82 y armamos el informe de recursos.",
      },
      {
        titulo: "IVA, DIOT y retenciones",
        texto:
          "El IVA no se apaga. Declaramos lo gravado, la DIOT y las retenciones de nómina u honorarios.",
      },
    ],
    cumplimiento: [
      "Declaración anual del Título III en febrero",
      "Separación de ingresos del objeto y no relacionados",
      "Informe de transparencia si eres donataria (art. 82)",
      "CFDI de donativo cuando hay autorización vigente",
      "IVA y DIOT en actos gravados",
      "Retenciones de ISR e IVA a honorarios, rentas y salarios",
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
