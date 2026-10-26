/**
 * Contenido de la guía 601 (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 *
 * ISR: lo facturado (devengado, arts. 9 y 17). No es lo cobrado.
 * IVA: lo efectivamente cobrado (art. 1-B LIVA). La DIOT viaja con el IVA.
 * CUFIN (art. 77) y CUCA (art. 78) se actualizan en el cierre, no en el mes.
 * RESICO PM también es 30% sobre utilidad; no usar 1%–2.5% de RESICO PF.
 */

export const PM_FAQ = [
  {
    pregunta: "¿Qué es el régimen 601?",
    respuesta:
      "Es el Régimen General de Ley de personas morales (clave SAT 601, Título II de la LISR). Aplica a la mayoría de las sociedades lucrativas: S.A., S. de R.L., S.A.P.I. Paga ISR al 30% sobre utilidad fiscal, IVA sobre lo cobrado, retenciones cuando paga a terceros y declaración anual en marzo.",
  },
  {
    pregunta: "¿El ISR se paga de lo facturado o de lo cobrado?",
    respuesta:
      "De lo facturado. En 601 el ingreso se acumula cuando se emite el CFDI o se presta el servicio (arts. 16 y 17 LISR), aunque el cliente aún no pague. El 30% no es sobre ese ingreso: es sobre la utilidad. Pero la base de partida es lo facturado, no el depósito en el banco.",
  },
  {
    pregunta: "¿El IVA funciona igual?",
    respuesta:
      "No. El IVA de la persona moral se causa cuando el pago se cobra de verdad (art. 1-B LIVA). Si facturaste y no cobraste, hay ISR sobre ese ingreso y todavía no hay IVA. La DIOT viaja con el IVA: informa las operaciones con terceros para que el SAT cruce el IVA acreditable.",
  },
  {
    pregunta: "¿Qué son la CUFIN y la CUCA?",
    respuesta:
      "La CUFIN (art. 77) guarda las utilidades que ya pagaron ISR en la empresa; al repartir dividendos a una persona física se retiene el 10% extra (art. 140). La CUCA (art. 78) guarda las aportaciones de los socios, actualizadas. Una reducción de capital que no rebase la CUCA no es dividendo. Las dos se actualizan en el cierre, no cada mes.",
  },
  {
    pregunta: "¿Qué retenciones me tocan como persona moral?",
    respuesta:
      "Tres familias. ISR: honorarios a persona física, rentas (10% si el arrendador es PF) y dividendos (10%). IVA: dos tercios cuando pagas servicios a una PF, y 6% en subcontratación de personal. Salarios: el ISR de la nómina (arts. 96 y 97); el sueldo no lleva IVA. Todo eso se entera el día 17.",
  },
  {
    pregunta: "¿Cuándo se presenta la declaración anual?",
    respuesta:
      "En marzo, no en abril. Abril es de persona física. La sociedad cierra el ejercicio, acredita los provisionales y actualiza CUFIN y CUCA.",
  },
] as const;

export const PM_PASOS_ISR = [
  {
    name: "Suma lo facturado de enero al mes",
    text: "Ingresos nominales acumulados, aunque no los hayas cobrado. En 601 el ISR no espera al depósito.",
  },
  {
    name: "Aplica el coeficiente del último ejercicio de 12 meses",
    text: "Utilidad fiscal entre ingresos nominales de ese año. Resta PTU pagada y pérdidas que el artículo 14 deje aplicar.",
  },
  {
    name: "Aplica el 30% y resta lo enterado",
    text: "Ese ISR es anticipo, no deducción. El 30% es sobre la utilidad estimada, no sobre lo facturado entero.",
  },
  {
    name: "Declara el ISR el día 17",
    text: "Doce veces al año. El IVA y las retenciones viajan el mismo día, pero no se calculan con esta base.",
  },
  {
    name: "En marzo cierra utilidad, CUFIN y CUCA",
    text: "Ahí sí es el 30% sobre la utilidad fiscal real. Abril es de persona física.",
  },
] as const;

export const PM_PASOS_IVA = [
  {
    name: "Separa lo cobrado de lo solo facturado",
    text: "El IVA no nace con el CFDI. Nace cuando el cliente paga (art. 1-B LIVA).",
  },
  {
    name: "Determina el IVA trasladado",
    text: "16% sobre las contraprestaciones efectivamente cobradas. Exentos y tasa 0% no se mezclan aquí.",
  },
  {
    name: "Resta el IVA acreditable pagado",
    text: "El de tus proveedores, cuando tú ya pagaste. Sin CFDI y sin pago, no se acredita.",
  },
  {
    name: "Arma la DIOT",
    text: "La Declaración Informativa de Operaciones con Terceros cruza con quién operaste. Es del IVA, no del ISR.",
  },
  {
    name: "Declara IVA y DIOT el día 17",
    text: "Mismo calendario que el ISR, distinta base. Facturaste y no cobraste: el IVA de esa operación todavía no entra.",
  },
] as const;

export const PM_PASOS_RETENCIONES = [
  {
    name: "Identifica si eres retenedor",
    text: "La persona moral retiene cuando paga a persona física, renta inmuebles, reparte dividendos o tiene nómina.",
  },
  {
    name: "Retén ISR según el tipo de pago",
    text: "Honorarios y asimilados con tarifa. Arrendamiento a PF: 10%. Dividendos a PF: 10% al repartir, no cada mes.",
  },
  {
    name: "Retén IVA cuando la ley lo manda",
    text: "Dos tercios del IVA en servicios que te presta una PF. 6% en subcontratación de personal. El CFDI debe mostrar la retención.",
  },
  {
    name: "Calcula el ISR de salarios",
    text: "Tarifa de los artículos 96 y 97, CFDI de nómina, IMSS e INFONAVIT. El sueldo no lleva IVA.",
  },
  {
    name: "Entera el día 17 y entrega constancia",
    text: "Las retenciones viajan con las declaraciones del mes. Sin el CFDI o la constancia, el tercero no puede acreditar.",
  },
] as const;

export const PM_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cómo se paga" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "ISR vs IVA" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const PM_VS_IVA = {
  titulo: "ISR de lo facturado vs IVA de lo cobrado",
  columnas: ["ISR · lo facturado", "IVA · lo cobrado"] as const,
  filas: [
    {
      aspecto: "Cuándo nace",
      valores: [
        "Al emitir el CFDI o prestar el servicio, aunque no te paguen",
        "Cuando el cliente paga de verdad (art. 1-B LIVA)",
      ],
    },
    {
      aspecto: "Base",
      valores: [
        "Utilidad sobre ingresos nominales (coeficiente en el mes; art. 9 en marzo)",
        "Contraprestaciones efectivamente cobradas, menos IVA acreditable pagado",
      ],
    },
    {
      aspecto: "Si facturaste y no cobraste",
      valores: [
        "Ese ingreso ya entra al ISR",
        "Ese IVA todavía no se causa",
      ],
    },
    {
      aspecto: "Informativa",
      valores: [
        "No hay un equivalente a la DIOT en el ISR",
        "La DIOT declara operaciones con terceros y cruza el IVA acreditable",
      ],
    },
    {
      aspecto: "El día 17",
      valores: [
        "Pago provisional de ISR, doce veces al año",
        "Declaración de IVA y DIOT, el mismo día, otra base",
      ],
    },
    {
      aspecto: "Cierre",
      valores: [
        "Anual en marzo: utilidad real, CUFIN y CUCA",
        "No hay anual de IVA. Cada mes se cierra solo",
      ],
    },
  ],
} as const;

export const PM_CRITERIOS = [
  {
    n: "01",
    titulo: "Eres una sociedad lucrativa",
    kicker: "Clave SAT 601",
    texto:
      "S.A., S. de R.L., S.A.P.I. y demás personas morales con fin de lucro. Si eres asociación o fundación, el régimen de partida es 603, no este.",
  },
  {
    n: "02",
    titulo: "El ISR se calcula sobre lo facturado",
    kicker: "Arts. 9 y 17 LISR",
    texto:
      "El ingreso se acumula con el CFDI, aunque el cliente no haya pagado. El 30% es sobre la utilidad, no sobre el total facturado. El mes usa coeficiente, no la ganancia contable.",
  },
  {
    n: "03",
    titulo: "El IVA se calcula sobre lo cobrado",
    kicker: "Art. 1-B LIVA · DIOT",
    texto:
      "No funciona como el ISR. El IVA nace cuando cobras. La DIOT informa las operaciones con terceros y viaja con esa declaración, no con el ISR.",
  },
  {
    n: "04",
    titulo: "Si pagas a terceros, retienes",
    kicker: "ISR, IVA y salarios",
    texto:
      "Honorarios, rentas y dividendos llevan retención de ISR. Servicios de PF y subcontratación, de IVA. La nómina lleva ISR (arts. 96 y 97) y no lleva IVA.",
  },
] as const;

export const PM_RETENCIONES = [
  {
    id: "isr",
    corto: "ISR",
    titulo: "Retención de ISR",
    fundamento: "LISR arts. 96, 116 y 140",
    texto:
      "Cuando la sociedad paga a una persona física. Honorarios y asimilados, con tarifa. Arrendamiento: 10%. Dividendos: 10% al socio PF, al momento de repartir, no en el provisional.",
  },
  {
    id: "iva",
    corto: "IVA",
    titulo: "Retención de IVA",
    fundamento: "LIVA art. 1-A",
    texto:
      "Dos tercios del IVA si te presta un servicio una persona física. 6% sobre la contraprestación en subcontratación de personal. El CFDI tiene que traer esa retención para que el tercero la acredite.",
  },
  {
    id: "salarios",
    corto: "Salarios",
    titulo: "ISR de nómina",
    fundamento: "LISR arts. 96 y 97",
    texto:
      "El patrón calcula, retiene y entera el ISR de cada trabajador. CFDI de nómina, IMSS e INFONAVIT. El sueldo no lleva IVA: esa retención no se mezcla con la de honorarios.",
  },
] as const;
