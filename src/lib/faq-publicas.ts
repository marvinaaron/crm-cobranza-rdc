/**
 * Lista única de preguntas frecuentes de la web pública.
 * Compartido entre la página /preguntas-frecuentes (Server Component, para
 * generar el JSON-LD del schema FAQPage) y el acordeón cliente que las renderiza.
 *
 * Si actualizas el texto, basta con cambiarlo aquí: el JSON-LD y la UI se
 * mantienen sincronizados automáticamente.
 */

export type PreguntaFrecuente = {
  pregunta: string;
  respuesta: string;
  /** Liga opcional al final de la respuesta (el JSON-LD usa sólo el texto). */
  enlace?: { href: string; label: string };
};

export const FAQ_PUBLICAS: PreguntaFrecuente[] = [
  {
    pregunta: "¿Cuánto cuesta llevar mi contabilidad con ustedes?",
    respuesta:
      "Depende de lo que llevemos, no de un precio único. El piso es la contabilidad y las declaraciones de tu régimen. Si se suma facturación a tus clientes, nómina, control IMSS, ICSOE o SISUB, el alcance crece y te armamos un presupuesto alineado con la operación de tu negocio. Personas morales o volúmenes altos los cotizamos en 24 horas, sin compromiso.",
  },
  {
    pregunta: "Ya tengo contador, ¿cómo es el cambio?",
    respuesta:
      "Más fácil de lo que parece. Nosotros nos encargamos de pedirle a tu contador anterior la información que necesitamos: papeles de trabajo, conciliaciones y declaraciones del año en curso. Tú solo nos firmas una autorización y nosotros movemos lo demás.",
  },
  {
    pregunta: "¿Necesito darles mi e.firma o contraseñas del SAT?",
    respuesta:
      "Trabajamos con tu CIEC para presentar declaraciones y con tu e.firma sólo cuando realmente se necesita (por ejemplo, opinión de cumplimiento o trámites específicos). Los archivos viven en bóvedas cifradas con acceso restringido y se usan únicamente para lo que tú nos pidas.",
  },
  {
    pregunta: "¿Cada cuánto me van a estar mandando información?",
    respuesta:
      "Mensualmente recibes el resumen de tu mes: qué impuestos pagaste, los acuses del SAT y las facturas relevantes. Si surge algo extraordinario (un requerimiento, una notificación) te avisamos en el momento, no hasta fin de mes.",
  },
  {
    pregunta: "¿Tengo que llevarles facturas en papel?",
    respuesta:
      "No, todo es digital. Tus XML llegan automáticamente al SAT y nosotros los descargamos. Si tienes algún ticket o gasto en efectivo lo subes al portal o nos lo mandas por WhatsApp. Sin sobres ni archiveros.",
  },
  {
    pregunta: "¿Para qué sirve el portal de cliente?",
    respuesta:
      "Es tu tablero personal. Ahí ves el estatus de tus pagos al SAT, descargas tu constancia de situación fiscal, tu opinión de cumplimiento y los acuses del mes. Útil cuando el banco o un cliente te los pide en automático.",
  },
  {
    pregunta: "¿Atienden personas físicas o sólo empresas?",
    respuesta:
      "Ambas. Tenemos profesionistas, prestadores de servicios y personas con honorarios, así como personas morales con o sin nómina. Cada perfil tiene su propio flujo de cumplimiento.",
  },
  {
    pregunta: "¿Qué pasa si el SAT me manda un requerimiento o una notificación?",
    respuesta:
      "Tenemos el buzón tributario monitoreado. En cuanto entra una notificación, te avisamos, te explicamos qué pide y te decimos los pasos a seguir. Si el caso requiere respuesta formal, nosotros la armamos contigo.",
  },
  {
    pregunta: "¿Pueden ayudarme a sacar mi declaración anual?",
    respuesta:
      "Sí, la declaración anual está incluida en nuestro servicio mensual. Revisamos tus deducciones personales (médicas, escolares, intereses hipotecarios) para que si te toca saldo a favor, te lo regresen lo más rápido posible.",
  },
  {
    pregunta: "¿Llevan nómina y trámites de IMSS / Infonavit?",
    respuesta:
      "Sí. Llevamos altas, bajas, modificaciones de salario, cálculo y timbrado quincenal o mensual, así como pagos a IMSS, Infonavit e Impuesto Sobre Nómina estatal. Te entregamos los recibos timbrados listos para tus empleados.",
  },
  {
    pregunta: "¿En qué ciudades atienden?",
    respuesta:
      "Atendemos a clientes en todo México de forma 100% digital. La materia fiscal es la misma en todo el país, así que la distancia no es problema. Si estás en Guadalajara o el área metropolitana, también podemos vernos en persona cuando lo necesites.",
  },
  {
    pregunta: "¿Tienen contrato forzoso o cláusulas de permanencia?",
    respuesta:
      "No. Trabajamos con confianza, no con candados. Si en algún momento decides no continuar, te entregamos toda tu información ordenada para que sigas tu camino sin trabas.",
  },
  {
    pregunta: "¿Ustedes también facturan a mis clientes?",
    respuesta:
      "Si contratas facturación, sí: emitimos y controlamos tus CFDI. Si sólo llevamos impuestos, tú facturas o tu sistema lo hace y nosotros bajamos los XML del SAT. Por eso un paquete con facturación no cuesta lo mismo que uno que sólo declara.",
  },
  {
    pregunta: "¿Qué necesitan de mí para arrancar?",
    respuesta:
      "Una autorización para pedirle la información a tu contador anterior, tu CIEC y, cuando aplique, la e.firma. Con los papeles de trabajo y las declaraciones del año en curso empezamos el mes que sigue. Si estás en Guadalajara podemos vernos; si no, todo es digital.",
  },
  {
    pregunta: "¿Qué pasa si traigo adeudos o diferencias con el SAT?",
    respuesta:
      "Primero vemos el panorama: declaraciones, buzón y opinión de cumplimiento. Te decimos qué está pendiente y armamos el plan — presentar, aclarar o pagar. No escondemos el problema para 'ya entrar'; mejor cotizar el alcance real desde el inicio.",
  },
  {
    pregunta: "¿En el portal veo también lo que les pago y el IMSS?",
    respuesta:
      "Sí. Ahí tienes el acuse del mes, tus honorarios y, si llevamos IMSS, el SIPARE. También la constancia y la opinión de cumplimiento cuando el banco o un cliente te las piden. Sin estar cazando el PDF por WhatsApp.",
  },
  {
    pregunta: "¿Cuánto me cobran por asesorarme y darme un presupuesto?",
    respuesta:
      "La primera asesoría, donde nos conocemos y vemos cómo opera tu negocio, es gratis. Ahí tocamos lo fundamental —régimen, obligaciones, qué podemos llevar— y te armamos un presupuesto. Suele durar hasta 45 minutos. Si la llamada se alarga y se vuelve orientación fiscal —estrategias, alternativas, muchas dudas de fondo— entonces sí cobramos el tiempo invertido. Pasa en casos muy particulares, no es la regla.",
  },
  {
    pregunta: "¿Dónde puedo ver mis declaraciones?",
    respuesta:
      "En el portal, sección Declaraciones. Ahí está cada mes: acuses del SAT, líneas de captura y si el periodo ya quedó presentado. Cuando el banco o un cliente te pide el PDF, lo bajas de ahí.",
  },
  {
    pregunta: "¿En el portal puedo pagar directamente mis impuestos?",
    respuesta:
      "No. Los impuestos se pagan en tu banco, con la línea de captura que te dejamos en Declaraciones. El portal no cobra al SAT: te muestra qué pagar y, cuando ya lo cubriste, subes el comprobante para que el mes quede cerrado. El dinero va directo a la autoridad, no pasa por nosotros.",
  },
  {
    pregunta: "¿En el portal puedo pagar mis honorarios?",
    respuesta:
      "Sí. En Honorarios pagas con tarjeta —incluso con Apple Pay— porque usamos Stripe, una de las plataformas internacionales más seguras para cobros en línea. El cargo llega al despacho, la factura a tu correo y el historial queda en el portal. Si prefieres transferencia, también se puede.",
  },
  {
    pregunta: "¿Dónde descargo la App de RDC?",
    respuesta:
      "No se descarga de App Store ni de Google Play. Es una web app: el mismo portal, instalado en tu pantalla de inicio. Cuando eres cliente te damos usuario, entras una vez por Safari o Chrome y la dejas como cualquier app.",
    enlace: { href: "/proceso#app", label: "Ver cómo se instala" },
  },
];
