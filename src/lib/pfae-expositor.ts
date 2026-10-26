/**
 * Contenido de la guía 612 (página expositora).
 * Una sola fuente para UI, FAQPage JSON-LD y HowTo.
 */

import type { RenglonTarifa } from "@/lib/fiscal/isr";
import { RESICO_VS_612 } from "@/lib/resico-expositor";

export const PFAE_FAQ = [
  {
    pregunta: "¿Qué es el régimen 612?",
    respuesta:
      "Es el régimen de las Personas Físicas con Actividades Empresariales y Profesionales (clave SAT 612). Aplica a quien opera un negocio propio o ejerce una profesión de forma independiente. El ISR se determina sobre la utilidad fiscal —ingresos acumulables menos deducciones autorizadas y PTU—, con la tarifa progresiva del artículo 96.",
  },
  {
    pregunta: "¿Puedo deducir gastos en 612?",
    respuesta:
      "Sí. Sueldos, renta, insumos, depreciación, honorarios y otros gastos estrictamente indispensables bajan la base de ISR si traen CFDI vigente y cumplen requisitos. El IVA de esos mismos gastos se acredita por separado: no se resta del ISR.",
  },
  {
    pregunta: "¿Conviene 612 o RESICO?",
    respuesta:
      "Depende de tus gastos comprobables. RESICO cobra 1% a 2.5% sobre lo cobrado, sin restar gastos. El 612 cobra tarifa progresiva sobre la utilidad. Si deduces poco, RESICO suele salir más barato. Si tus gastos son altos y documentados, 612 puede convenir. En RDC comparamos ambos escenarios antes de darte de alta.",
  },
  {
    pregunta: "¿Qué pasa si rebaso 3.5 millones en RESICO?",
    respuesta:
      "Sales de RESICO y pasas a 612 (u otro régimen que te corresponda). El cambio aplica desde el mes siguiente al que rebasas el tope; no esperes a la declaración anual. A partir de ahí el ISR va sobre utilidad, con contabilidad completa y sin tope de ingresos.",
  },
  {
    pregunta: "¿El pago de cada mes es solo de ese mes?",
    respuesta:
      "No. El provisional se calcula con lo acumulado de enero al mes que declaras. Sobre esa utilidad se aplica la tarifa del mes y se restan los ISR ya enterados en meses previos. Esos pagos anteriores son anticipos, no un gasto deducible.",
  },
  {
    pregunta: "¿Cuándo se presenta la declaración mensual?",
    respuesta:
      "A más tardar el día 17 del mes siguiente. ISR e IVA viajan juntos en la misma fecha, pero no se mezclan: el ISR va sobre utilidad acumulada; el IVA, por lo facturado del mes menos lo acreditable y, si aplica, lo retenido.",
  },
] as const;

export const PFAE_PASOS_ISR = [
  {
    name: "Acumula ingresos del ejercicio",
    text: "Suma lo acumulable de enero al mes que declaras (en general, lo facturado conforme a criterio fiscal). No es solo el mes aislado.",
  },
  {
    name: "Resta deducciones autorizadas",
    text: "Gastos estrictamente indispensables con CFDI válido. Si pagaste PTU en el ejercicio, también se resta de la base.",
  },
  {
    name: "Aplica la tarifa del mes",
    text: "Sobre esa utilidad acumulada usa la tarifa progresiva (cuota fija + porcentaje sobre el excedente). El SAT publica una tabla por mes porque la base va creciendo.",
  },
  {
    name: "Resta los provisionales ya pagados",
    text: "Al ISR determinado se le restan los pagos de meses previos del mismo año. El resultado es lo que enteras este mes.",
  },
  {
    name: "Declara a más tardar el día 17",
    text: "Presenta el pago provisional de ISR junto con el IVA antes del día 17 del mes siguiente.",
  },
] as const;

export const PFAE_SECCIONES = [
  { value: "cuanto-se-paga", label: "Cuánto se paga" },
  { value: "limites", label: "Quién entra" },
  { value: "preguntas", label: "Preguntas" },
  { value: "comparativa", label: "612 vs 626" },
  { value: "simulador", label: "Ver tarifa" },
  { value: "cumplimiento", label: "Qué cubrimos" },
] as const;

export const PFAE_VS_RESICO = {
  titulo: "Actividades empresariales (612) vs RESICO (626)",
  columnas: ["Actividades empresariales 612", "RESICO 626"] as const,
  filas: RESICO_VS_612.filas.map((f) => ({
    aspecto: f.aspecto,
    valores: [f.valores[1], f.valores[0]] as [string, string],
  })),
};

export const PFAE_CRITERIOS = [
  {
    n: "01",
    titulo: "Sin tope de ingresos",
    kicker: "Régimen abierto",
    texto:
      "No hay límite de $3.5 MDP. Es el esquema cuando superas el tope de RESICO, no cumples sus requisitos o tu operación pide contabilidad completa.",
  },
  {
    n: "02",
    titulo: "ISR sobre utilidad",
    kicker: "Ingresos menos gastos",
    texto:
      "La base es ingresos acumulables menos deducciones autorizadas y PTU. Los gastos sí bajan el ISR, a diferencia de RESICO.",
  },
  {
    n: "03",
    titulo: "Contabilidad completa",
    kicker: "Registros y SAT",
    texto:
      "Ingresos, egresos, conciliación bancaria y, en la mayoría de los casos, contabilidad electrónica (catálogo, pólizas, balanza).",
  },
  {
    n: "04",
    titulo: "Pagos provisionales",
    kicker: "Acumulado del año",
    texto:
      "Cada mes anticipas el ISR anual con la utilidad de enero a ese mes, menos lo ya pagado. El cierre se ajusta en la declaración anual.",
  },
] as const;

export function isrSobreUtilidad(base: number, renglones: readonly RenglonTarifa[]) {
  const renglon =
    renglones.find((r) => base <= r.limiteSuperior) ?? renglones[renglones.length - 1];
  const excedente = Math.max(0, base - renglon.limiteInferior);
  const isr =
    Math.round((renglon.cuotaFija + excedente * (renglon.porcentajeExcedente / 100)) * 100) /
    100;
  return { renglon, excedente, isr };
}
