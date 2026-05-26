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
};

export const FAQ_PUBLICAS: PreguntaFrecuente[] = [
  {
    pregunta: "¿Cuánto cuesta llevar mi contabilidad con ustedes?",
    respuesta:
      "Depende de tu régimen y volumen de facturación. Para RESICO Persona Física empezamos desde $812 al mes (IVA incluido). Para personas morales o esquemas con nómina te armamos un paquete a la medida con cotización gratis en 24 horas, sin compromiso.",
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
      "Atendemos a clientes en todo México de forma 100% digital. La fiscal es la misma en todo el país, así que la distancia no es problema. Si estás en Tijuana, también podemos vernos en persona cuando lo necesites.",
  },
  {
    pregunta: "¿Tienen contrato forzoso o cláusulas de permanencia?",
    respuesta:
      "No. Trabajamos con confianza, no con candados. Si en algún momento decides no continuar, te entregamos toda tu información ordenada para que sigas tu camino sin trabas.",
  },
];
