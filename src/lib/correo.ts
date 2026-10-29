import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  periodoLabel,
  getSaldoMes,
  getCompromisoMes,
  estaPagado,
  getTotalPendiente,
  getTotalDeudaPendiente,
  getTotalExtraPorCobrar,
  clienteActivoEnPeriodo,
  calcularEstado,
  listarMesesImpagos,
  periodoKey,
} from "@/lib/clientes";
import { isValidEmail } from "@/lib/email";
import {
  buildHistorialHtmlBlock,
  buildHistorialTextoBlock,
  debeIncluirHistorialEnCorreo,
  listarExtrasImpagos,
} from "@/lib/correo-eventos";

import {
  DESPACHO_NOMBRE,
  DESPACHO_EMAIL,
  DESPACHO_SITIO,
  abrirBorradorCorreo,
  armarCorreoHtml,
  cardCorreoHtml,
  ctaCorreoHtml,
  duoMontoFechaCorreoHtml,
  firmaCorreoTexto,
  formatFechaCorreoDiaMesAnio,
  CORREO_UI,
} from "@/lib/workspace-email";

export { DESPACHO_NOMBRE, DESPACHO_EMAIL, DESPACHO_SITIO };

export type TipoCorreoCobranza =
  | "recordatorio"
  | "preaviso"
  | "vencido"
  | "cierre_mes";

export const CORREO_TIPOS: Record<
  TipoCorreoCobranza,
  {
    label: string;
    labelCorto: string;
    descripcion: string;
    momento: string;
  }
> = {
  /** @deprecated Ya no va en la secuencia: al corriente solo pre-aviso + vencido. */
  recordatorio: {
    label: "Inicio de mes",
    labelCorto: "Honorarios",
    descripcion:
      "Legado. Al corriente no recibe inicio de mes; solo pre-aviso (5 días) y vencido.",
    momento: "Deprecado · usar preaviso.",
  },
  preaviso: {
    label: "Pre-aviso",
    labelCorto: "Pronto vence",
    descripcion:
      "Faltan 5 días (o menos) para la fecha límite. Un solo toque amable antes de vencer.",
    momento: "5 días antes de la fecha límite del honorario.",
  },
  vencido: {
    label: "Honorarios atrasados",
    labelCorto: "Atrasados",
    descripcion:
      "La fecha ya pasó: invita a ponerse al corriente y, si ya pagó, subir el comprobante.",
    momento: "Después de la fecha límite del honorario.",
  },
  cierre_mes: {
    label: "Adeudo / estado de cuenta",
    labelCorto: "Adeudo",
    descripcion:
      "Solo si ya hay meses vencidos: estado de cuenta al inicio de mes (o cuando acumula adeudo).",
    momento: "Inicio de mes · con adeudo previo.",
  },
};

/** Texto corto para el botón de cobro: qué mail es. */
export const CORREO_BOTON_LABEL: Record<TipoCorreoCobranza, string> = {
  recordatorio: "Inicio",
  preaviso: "Pre-aviso",
  vencido: "Vencido",
  cierre_mes: "Adeudo",
};

/**
 * Secuencia inteligente (menos es más):
 * Pre-aviso (5 días) → Vencido → Adeudo (solo si acumula meses).
 * El “inicio de mes” amable ya no forma parte del flujo.
 */
export const PASOS_CORREO_COBRO: TipoCorreoCobranza[] = [
  "preaviso",
  "vencido",
  "cierre_mes",
];

/** Días antes del límite en que aplica el pre-aviso (incluye el día límite). */
export const DIAS_PREAVISO_COBRO = 5;

export function indicePasoCorreo(tipo: TipoCorreoCobranza): number {
  if (tipo === "recordatorio") return -1;
  const i = PASOS_CORREO_COBRO.indexOf(tipo);
  return i < 0 ? 0 : i;
}

/** 0 = nada · 1 = pre-aviso · 2 = vencido · 3 = adeudo. */
export function posicionCorreoCobro(
  ultima?: { tipo: TipoCorreoCobranza } | null
): number {
  if (!ultima) return 0;
  const i = indicePasoCorreo(ultima.tipo);
  return i < 0 ? 0 : i + 1;
}

export function siguientePasoCorreo(
  ultima?: { tipo: TipoCorreoCobranza } | null
): TipoCorreoCobranza | null {
  const pos = posicionCorreoCobro(ultima);
  return pos >= PASOS_CORREO_COBRO.length ? null : PASOS_CORREO_COBRO[pos];
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getPortalClienteUrl(
  clienteId: number,
  baseUrl?: string,
  destino?: string
): string {
  const base = baseUrl ?? getBaseUrl();
  const url = `${base}/portal/login?cliente=${clienteId}`;
  return destino ? `${url}&next=${encodeURIComponent(destino)}` : url;
}

export function fechaLimitePago(client: Cliente, periodo: Periodo): string {
  const dia = Number(client.fechaPago);
  const mes = MESES_NOM[periodo.mes];
  return `${dia} de ${mes} de ${periodo.anio}`;
}

/** Formato corto portal: «10 OCT 2026». */
export function fechaLimitePagoCorta(client: Cliente, periodo: Periodo): string {
  const dia = Math.min(
    Number(client.fechaPago) || 1,
    diasEnMes(periodo.mes, periodo.anio)
  );
  return formatFechaCorreoDiaMesAnio(dia, periodo.mes, periodo.anio);
}

export function getFechaLimiteDate(client: Cliente, periodo: Periodo): Date {
  const dia = Math.min(
    Number(client.fechaPago) || 1,
    diasEnMes(periodo.mes, periodo.anio)
  );
  return new Date(periodo.anio, periodo.mes, dia);
}

export function diasEnMes(mes: number, anio: number): number {
  return new Date(anio, mes + 1, 0).getDate();
}

export function ultimoDiaDelMes(periodo: Periodo): number {
  return diasEnMes(periodo.mes, periodo.anio);
}

function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inicioDeMes(fecha: Date): boolean {
  return fecha.getDate() === 1;
}

function finDeMes(fecha: Date, periodo: Periodo): boolean {
  return fecha.getDate() === ultimoDiaDelMes(periodo);
}

export function clienteTieneSaldoPendiente(client: Cliente, periodo: Periodo): boolean {
  if (!clienteActivoEnPeriodo(client, periodo)) return false;
  if (estaPagado(client, periodo)) return false;
  const estado = calcularEstado(client, periodo);
  return estado === "PENDIENTE" || estado === "ATRASADO";
}

/** Día 1 del mes: recordatorio amable */
export function aplicaCorreoRecordatorio(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  if (!clienteTieneSaldoPendiente(client, periodo)) return false;
  return inicioDeMes(fechaRef);
}

/** Exactamente 5 días antes de la fecha límite. */
export function aplicaCorreoPreaviso(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  if (!clienteTieneSaldoPendiente(client, periodo)) return false;
  return (
    diasHastaFechaLimitePago(client, periodo, fechaRef) === DIAS_PREAVISO_COBRO
  );
}

/** Día siguiente a la fecha límite del cliente */
export function aplicaCorreoVencido(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  if (!clienteTieneSaldoPendiente(client, periodo)) return false;
  const limite = getFechaLimiteDate(client, periodo);
  const diaSiguiente = new Date(limite);
  diaSiguiente.setDate(diaSiguiente.getDate() + 1);
  return mismoDia(fechaRef, diaSiguiente);
}

/** Último día del mes */
export function aplicaCorreoCierreMes(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  if (!clienteTieneSaldoPendiente(client, periodo)) return false;
  return (
    finDeMes(fechaRef, periodo) &&
    fechaRef.getMonth() === periodo.mes &&
    fechaRef.getFullYear() === periodo.anio
  );
}

export function aplicaCorreoPorTipo(
  tipo: TipoCorreoCobranza,
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  switch (tipo) {
    case "recordatorio":
      return aplicaCorreoRecordatorio(client, periodo, fechaRef);
    case "preaviso":
      return aplicaCorreoPreaviso(client, periodo, fechaRef);
    case "vencido":
      return aplicaCorreoVencido(client, periodo, fechaRef);
    case "cierre_mes":
      return aplicaCorreoCierreMes(client, periodo, fechaRef);
  }
}

export function filtrarClientesParaCorreo(
  tipo: TipoCorreoCobranza,
  clientes: Cliente[],
  periodo: Periodo,
  fechaRef = new Date()
): Cliente[] {
  return clientes.filter((c) => aplicaCorreoPorTipo(tipo, c, periodo, fechaRef));
}

function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export function diasHastaFechaLimitePago(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): number {
  const limite = inicioDelDia(getFechaLimiteDate(client, periodo));
  const hoy = inicioDelDia(fechaRef);
  return Math.round((limite.getTime() - hoy.getTime()) / 86_400_000);
}

/** Clientes que deben recibir este correo según saldo y fechas (para revisión y envío). */
export function elegibleParaCorreo(
  tipo: TipoCorreoCobranza,
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  if (!clienteTieneSaldoPendiente(client, periodo)) return false;

  switch (tipo) {
    case "recordatorio":
      return true;
    case "preaviso": {
      const dias = diasHastaFechaLimitePago(client, periodo, fechaRef);
      return dias >= 0 && dias <= DIAS_PREAVISO_COBRO;
    }
    case "vencido": {
      const limite = inicioDelDia(getFechaLimiteDate(client, periodo));
      const hoy = inicioDelDia(fechaRef);
      return hoy > limite;
    }
    case "cierre_mes":
      return true;
  }
}

export function filtrarClientesElegiblesCorreo(
  tipo: TipoCorreoCobranza,
  clientes: Cliente[],
  periodo: Periodo,
  fechaRef = new Date()
): Cliente[] {
  return clientes.filter((c) => elegibleParaCorreo(tipo, c, periodo, fechaRef));
}

export type CorreoIndividualCliente =
  | {
      habilitado: true;
      tipo: TipoCorreoCobranza;
      titulo: string;
      descripcion: string;
      labelCorto: string;
    }
  | {
      habilitado: false;
      motivo: string;
    };

/**
 * Correo individual en fila de cobranza, según estatus del cliente.
 * AL CORRIENTE → deshabilitado. PENDIENTE / ATRASADO → tipo acorde al caso.
 */
export function getCorreoIndividualCliente(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): CorreoIndividualCliente {
  const estado = calcularEstado(client, periodo);

  if (!client.activo || !clienteActivoEnPeriodo(client, periodo)) {
    return { habilitado: false, motivo: "Cliente inactivo en este periodo" };
  }

  if (estado === "AL CORRIENTE" || !clienteTieneSaldoPendiente(client, periodo)) {
    return {
      habilitado: false,
      motivo: "Al corriente — no hay recordatorio por enviar",
    };
  }

  if (!client.email?.trim() || !isValidEmail(client.email)) {
    return { habilitado: false, motivo: "Sin correo válido en el expediente" };
  }

  const limite = inicioDelDia(getFechaLimiteDate(client, periodo));
  const hoy = inicioDelDia(fechaRef);
  const pasoVencimiento = hoy > limite;
  const diasHasta = diasHastaFechaLimitePago(client, periodo, fechaRef);
  const enVentanaPreaviso =
    !pasoVencimiento && diasHasta >= 0 && diasHasta <= DIAS_PREAVISO_COBRO;
  const mesesImpagos = listarMesesImpagos(client, periodo);
  const tieneAdeudoPrevio = mesesImpagos.some(
    (m) => periodoKey(m.periodo) < periodoKey(periodo)
  );

  let tipo: TipoCorreoCobranza;

  // Con adeudo: al inicio de mes (o si ya arrastra meses) → estado de cuenta.
  if (tieneAdeudoPrevio) {
    tipo =
      inicioDeMes(fechaRef) || estado === "ATRASADO"
        ? "cierre_mes"
        : pasoVencimiento
          ? "vencido"
          : enVentanaPreaviso
            ? "preaviso"
            : "cierre_mes";
  } else if (pasoVencimiento) {
    tipo = "vencido";
  } else if (enVentanaPreaviso) {
    tipo = "preaviso";
  } else {
    return {
      habilitado: false,
      motivo: `Aún no toca: el pre-aviso sale ${DIAS_PREAVISO_COBRO} días antes del límite`,
    };
  }

  const meta = CORREO_TIPOS[tipo];
  return {
    habilitado: true,
    tipo,
    titulo: `Enviar ${meta.labelCorto.toLowerCase()}`,
    descripcion: meta.descripcion,
    labelCorto: meta.labelCorto,
  };
}

/** Si hoy es el día programado del calendario para este tipo de correo. */
export function esDiaProgramadoCorreo(
  tipo: TipoCorreoCobranza,
  fechaRef = new Date()
): boolean {
  switch (tipo) {
    case "recordatorio":
      return inicioDeMes(fechaRef);
    case "preaviso":
      return false;
    case "vencido":
      return false;
    case "cierre_mes":
      return finDeMes(fechaRef, {
        mes: fechaRef.getMonth(),
        anio: fechaRef.getFullYear(),
      });
  }
}

export function enviarCorreosMasivo(
  clientes: Cliente[],
  periodo: Periodo,
  tipo: TipoCorreoCobranza,
  baseUrl?: string,
  delayMs = 400
): void {
  clientes.forEach((cliente, i) => {
    setTimeout(() => abrirCorreoCobranza(cliente, periodo, tipo, baseUrl), i * delayMs);
  });
}

export type CorreoCobranza = {
  tipo: TipoCorreoCobranza;
  subject: string;
  texto: string;
  html: string;
  portalUrl: string;
};

function formatMonto(client: Cliente, periodo: Periodo): string {
  const monto = getSaldoMes(client, periodo) || getCompromisoMes(client, periodo);
  return formatMontoNumero(monto);
}

function formatMontoNumero(monto: number): string {
  return monto.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

/** Honorarios pendientes + extras por cobrar. */
function formatMontoTotal(client: Cliente, periodo: Periodo): string {
  return formatMontoNumero(getTotalDeudaPendiente(client, periodo));
}

function buildDesgloseDeudaExtraCajaHtml(
  client: Cliente,
  periodo: Periodo,
  mesLabel: string
): string {
  const saldoMes = getSaldoMes(client, periodo);
  const compromisoMes = getCompromisoMes(client, periodo);
  const honorariosPend =
    saldoMes > 0 ? saldoMes : compromisoMes > 0 && !estaPagado(client, periodo) ? compromisoMes : 0;
  const extras = listarExtrasImpagos(client);
  const limite = fechaLimitePago(client, periodo);
  const partes: string[] = [];

  if (honorariosPend > 0) {
    partes.push(
      `<p style="margin:0;font-size:13px;color:#475569;"><strong>Honorarios ${mesLabel}:</strong> ${formatMontoNumero(honorariosPend)}</p>`
    );
  }
  for (const x of extras) {
    partes.push(
      `<p style="margin:8px 0 0;font-size:13px;color:#92400e;"><strong>${x.concepto}</strong> · ${x.periodo}: ${formatMontoNumero(x.saldo)}</p>`
    );
  }
  if (honorariosPend > 0) {
    partes.push(
      `<p style="margin:8px 0 0;font-size:13px;color:#475569;"><strong>Fecha límite de honorarios:</strong> ${limite}</p>`
    );
  }
  return partes.join("");
}

/**
 * Meses con saldo cuya fecha límite YA pasó (vencidos de verdad). Sirve para
 * que el correo "vencido" no afirme que la fecha del mes en curso ya venció
 * cuando aún no llega: un cliente puede estar atrasado por un mes anterior y
 * tener el mes actual todavía dentro de plazo.
 */
function mesesVencidosReales(client: Cliente, periodo: Periodo) {
  const hoy = new Date();
  const hoyMid = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate()
  ).getTime();
  return listarMesesImpagos(client, periodo).filter(
    (m) => getFechaLimiteDate(client, m.periodo).getTime() < hoyMid
  );
}

type PlantillaCorreo = {
  subject: string;
  headerTitle: string;
  headerGradient: string;
  buttonGradient: string;
  intro: string;
  cuerpo: string;
  cta: string;
  pie: string;
  badgeMonto?: string;
  extraCaja?: string;
  headerVariante?: "oscuro" | "claro";
  /** Layout de cards del cuerpo. */
  cardsLayout?: "single" | "duo_monto_fecha" | "lista_saldos";
  fechaCorta?: string;
};

function formatSaldoCorreo(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function buildListaSaldosPendientesHtml(
  client: Cliente,
  periodo: Periodo
): string {
  const vencidos = mesesVencidosReales(client, periodo);
  if (vencidos.length === 0) return "";
  const filas = vencidos
    .map((v, i) => {
      const saldo = getSaldoMes(client, v.periodo);
      const borde =
        i < vencidos.length - 1
          ? `border-bottom:1px solid ${CORREO_UI.line};`
          : "";
      return `<tr><td style="padding:10px 0;${borde}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="font-size:14px;font-weight:700;color:${CORREO_UI.navy};">${v.label}</td><td align="right" style="font-size:14px;font-weight:800;color:${CORREO_UI.navy};white-space:nowrap;">${formatSaldoCorreo(saldo)}</td></tr></table></td></tr>`;
    })
    .join("");
  return `<p style="margin:14px 0 0;padding-top:12px;border-top:1px solid ${CORREO_UI.line};font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:${CORREO_UI.mute};font-weight:800;">Saldos pendientes</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${filas}</table>`;
}

function plantillaPorTipo(
  tipo: TipoCorreoCobranza,
  client: Cliente,
  periodo: Periodo
): PlantillaCorreo {
  const mesLabel = periodoLabel(periodo);
  const limiteCorta = fechaLimitePagoCorta(client, periodo);
  const extrasPend = getTotalExtraPorCobrar(client);

  switch (tipo) {
    case "recordatorio":
      /* Mail 4 — inicio de mes, amable; dos cards: importe + fecha. */
      return {
        subject: `${DESPACHO_NOMBRE} · Honorarios ${mesLabel}`,
        headerTitle: "Nuevo mes",
        headerGradient: CORREO_UI.navy,
        buttonGradient: CORREO_UI.navy,
        intro: `Estamos iniciando el mes y te recordamos tu fecha límite de honorarios. Gracias por estar siempre al corriente.`,
        cuerpo: `Tu honorario de <strong>${mesLabel}</strong> vence el <strong>${limiteCorta}</strong>.`,
        cta: "Consulta el detalle en tu portal:",
        pie: "Si ya pagaste, sube el comprobante al portal para validarlo.",
        badgeMonto: "Honorarios",
        cardsLayout: "duo_monto_fecha",
        fechaCorta: limiteCorta,
      };
    case "preaviso": {
      const dias = diasHastaFechaLimitePago(client, periodo);
      const diasTxt =
        dias <= 0
          ? "hoy"
          : dias === 1
            ? "mañana"
            : `en ${dias} días`;
      return {
        subject: `${DESPACHO_NOMBRE} · Pronto vence · ${mesLabel}`,
        headerTitle: "Pronto vence",
        headerGradient: CORREO_UI.violeta,
        buttonGradient: CORREO_UI.navy,
        intro: `Te escribimos con anticipación: tu fecha límite de pago de honorarios de <strong>${mesLabel}</strong> es <strong>${diasTxt}</strong> (<strong>${limiteCorta}</strong>). Queremos darte tiempo de organizar el pago sin prisas de último momento.`,
        cuerpo: `Mantenerte al corriente nos permite seguir cuidando tu contabilidad a tiempo. Si ya realizaste el pago, <strong>súbelo al portal</strong> para que lo validemos y dejemos el periodo al corriente en el sistema.`,
        cta: "Consulta el detalle o sube tu comprobante:",
        pie: "Gracias por mantenerte al corriente.",
        badgeMonto: "Honorarios",
        cardsLayout: "duo_monto_fecha",
        fechaCorta: limiteCorta,
      };
    }
    case "vencido": {
      /* Honorarios atrasados — naranja marca + letras negras; monto solo en cuadros. */
      const vencidos = mesesVencidosReales(client, periodo);
      const masAntiguo = vencidos[0];
      const limiteMasAntiguo = masAntiguo
        ? fechaLimitePagoCorta(client, masAntiguo.periodo)
        : limiteCorta;

      let introVencido: string;
      if (vencidos.length > 1) {
        introVencido = `Te informamos que tienes <strong>${vencidos.length} mensualidades</strong> con fecha límite de honorarios vencida (la más antigua, <strong>${masAntiguo.label}</strong>). Te recordamos que es importante estar al corriente para evitar la suspensión de nuestros servicios y que tu contabilidad y tu situación ante la autoridad te generen recargos y actualizaciones por falta de declaraciones o pagos.`;
      } else {
        const periodoTxt =
          vencidos.length === 1 ? masAntiguo.label : mesLabel;
        introVencido = `Te informamos que tu fecha límite de pago de honorarios de <strong>${periodoTxt}</strong> ya pasó. Te recordamos que es importante estar al corriente con estos honorarios para evitar la suspensión de nuestros servicios y que tu contabilidad y tu situación ante la autoridad te generen recargos y actualizaciones por falta de declaraciones o pagos.`;
      }

      return {
        subject: `${DESPACHO_NOMBRE} · Honorarios atrasados · ${mesLabel}`,
        headerTitle: "Honorarios atrasados",
        headerGradient: CORREO_UI.naranja,
        headerVariante: "claro",
        buttonGradient: CORREO_UI.navy,
        intro: introVencido,
        cuerpo: `Si ya realizaste el pago, <strong>súbelo al portal</strong> para que lo validemos en nuestro sistema. Si aún no, te invitamos a ponerte al corriente lo antes posible.`,
        cta: "Sube tu comprobante o revisa tu cuenta:",
        pie: "Estamos para ayudarte con cualquier aclaración.",
        badgeMonto: "Saldo pendiente",
        cardsLayout: "duo_monto_fecha",
        fechaCorta: limiteMasAntiguo || limiteCorta,
      };
    }
    case "cierre_mes": {
      /* Adeudo / estado de cuenta — lista de saldos. */
      const vencidos = mesesVencidosReales(client, periodo);
      const listaMeses =
        vencidos.length > 0
          ? vencidos.map((v) => v.label).join(", ")
          : mesLabel;
      const listaSaldos =
        vencidos.length > 0
          ? buildListaSaldosPendientesHtml(client, periodo)
          : extrasPend > 0
            ? buildDesgloseDeudaExtraCajaHtml(client, periodo, mesLabel)
            : `<p style="margin:8px 0 0;font-size:13px;color:${CORREO_UI.mute};">Meses: ${listaMeses}</p>`;
      return {
        subject: `${DESPACHO_NOMBRE} · Estado de cuenta · adeudo`,
        headerTitle: "Adeudo pendiente",
        headerGradient: CORREO_UI.rojoBrillante,
        headerVariante: "claro",
        buttonGradient: CORREO_UI.navy,
        intro: `Te compartimos tu <strong>estado de cuenta</strong> con los periodos que aún tienen saldo. Te invitamos a ponerte al corriente para evitar la suspensión de nuestros servicios y que tu situación ante la autoridad te genere recargos o actualizaciones por falta de declaraciones o pagos.`,
        cuerpo: `Si ya pagaste algún mes, <strong>sube el comprobante a tu portal</strong> para que lo validemos y evitemos correos similares sobre esos periodos.`,
        cta: "Revisa tu estado de cuenta y sube comprobantes:",
        pie: "Gracias por tu atención. Estamos para apoyarte a regularizar.",
        badgeMonto: extrasPend > 0 ? "Total por pagar" : "Adeudo acumulado",
        cardsLayout: "lista_saldos",
        extraCaja: listaSaldos,
      };
    }
  }
}

function buildHtmlCorreo(
  client: Cliente,
  periodo: Periodo,
  portalUrl: string,
  plantilla: PlantillaCorreo,
  montoFmt: string
): string {
  const mesLabel = periodoLabel(periodo);
  const historialBlock = debeIncluirHistorialEnCorreo(client, periodo)
    ? buildHistorialHtmlBlock(client, periodo)
    : "";

  const layout = plantilla.cardsLayout ?? "single";
  let cardsHtml: string;
  if (layout === "duo_monto_fecha") {
    cardsHtml = duoMontoFechaCorreoHtml({
      labelMonto: plantilla.badgeMonto ?? "Honorarios",
      monto: montoFmt,
      labelFecha: "Fecha límite",
      fecha: plantilla.fechaCorta ?? "",
      familia: "cobranza",
    });
  } else if (layout === "lista_saldos") {
    cardsHtml = cardCorreoHtml(
      `<p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:${CORREO_UI.mute};font-weight:800;">${plantilla.badgeMonto ?? "Adeudo acumulado"}</p>
       <p style="margin:0;font-size:28px;font-weight:800;color:${CORREO_UI.navy};">${montoFmt}</p>
       ${plantilla.extraCaja ?? ""}`,
      "cobranza"
    );
  } else {
    cardsHtml = cardCorreoHtml(
      `<p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:${CORREO_UI.mute};font-weight:800;">${plantilla.badgeMonto ?? "Monto"}</p>
       <p style="margin:0;font-size:28px;font-weight:800;color:${CORREO_UI.navy};">${montoFmt}</p>
       ${plantilla.extraCaja ?? ""}`,
      "cobranza"
    );
  }

  const cuerpo = `
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#334155;">Hola, <strong>${client.razonSocial}</strong>,</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:${CORREO_UI.mute};">${plantilla.intro}</p>
${cardsHtml}
<p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:#334155;">${plantilla.cuerpo}</p>
${historialBlock}
<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:${CORREO_UI.mute};">${plantilla.cta}</p>
${ctaCorreoHtml(portalUrl, "Abrir mi portal", "cobranza")}
<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${CORREO_UI.mute};">${plantilla.pie}</p>
<p style="margin:0 0 8px;font-size:11px;line-height:1.45;color:#94a3b8;">Enlace: <a href="${portalUrl}" style="color:${CORREO_UI.navy};word-break:break-all;">${portalUrl}</a></p>`;

  return armarCorreoHtml({
    encabezado: {
      color: plantilla.headerGradient,
      titulo: plantilla.headerTitle,
      descripcion: mesLabel,
      variante: plantilla.headerVariante,
      familia: "cobranza",
    },
    cuerpoHtml: cuerpo,
  });
}

function buildTextoCorreo(
  client: Cliente,
  periodo: Periodo,
  portalUrl: string,
  plantilla: PlantillaCorreo,
  montoFmt: string
): string {
  const mesLabel = periodoLabel(periodo);
  const totalFmt = formatMontoTotal(client, periodo);

  const parrafos: string[] = [`Hola, ${client.razonSocial},`, ""];

  const historialTxt = debeIncluirHistorialEnCorreo(client, periodo)
    ? buildHistorialTextoBlock(client, periodo)
    : "";

  if (plantilla.headerTitle === "Nuevo mes") {
    const limiteCorta = fechaLimitePagoCorta(client, periodo);
    parrafos.push(
      `Estamos iniciando el mes y te recordamos tu fecha límite de honorarios. Gracias por estar siempre al corriente.`,
      "",
      `Honorarios ${mesLabel}: ${montoFmt}`,
      `Fecha límite: ${limiteCorta}`,
      "",
      "Si ya pagaste, sube el comprobante al portal para validarlo."
    );
  } else if (plantilla.headerTitle === "Pronto vence") {
    const limiteCorta = fechaLimitePagoCorta(client, periodo);
    const dias = diasHastaFechaLimitePago(client, periodo);
    const diasTxt =
      dias <= 0 ? "hoy" : dias === 1 ? "mañana" : `en ${dias} días`;
    parrafos.push(
      `Te escribimos con anticipación: tu fecha límite de pago de honorarios de ${mesLabel} es ${diasTxt} (${limiteCorta}). Queremos darte tiempo de organizar el pago sin prisas de último momento.`,
      "",
      `Honorarios ${mesLabel}: ${montoFmt}`,
      `Fecha límite: ${limiteCorta}`,
      "",
      "Si ya realizaste el pago, súbelo al portal para que lo validemos."
    );
  } else if (plantilla.headerTitle === "Honorarios atrasados") {
    const vencidos = mesesVencidosReales(client, periodo);
    const masAntiguo = vencidos[0];
    if (vencidos.length > 1) {
      parrafos.push(
        `Te informamos que tienes ${vencidos.length} mensualidades con fecha límite de honorarios vencida (la más antigua, ${masAntiguo.label}). Te recordamos que es importante estar al corriente para evitar la suspensión de nuestros servicios y que tu contabilidad y tu situación ante la autoridad te generen recargos y actualizaciones por falta de declaraciones o pagos.`
      );
    } else {
      const periodoTxt =
        vencidos.length === 1 ? masAntiguo.label : mesLabel;
      parrafos.push(
        `Te informamos que tu fecha límite de pago de honorarios de ${periodoTxt} ya pasó. Te recordamos que es importante estar al corriente con estos honorarios para evitar la suspensión de nuestros servicios y que tu contabilidad y tu situación ante la autoridad te generen recargos y actualizaciones por falta de declaraciones o pagos.`
      );
    }
    parrafos.push(
      "",
      `Saldo pendiente: ${montoFmt}`,
      "",
      "Si ya realizaste el pago, súbelo al portal para que lo validemos. Si aún no, te invitamos a ponerte al corriente lo antes posible."
    );
  } else {
    /* Adeudo serio */
    const vencidos = mesesVencidosReales(client, periodo);
    parrafos.push(
      "Te compartimos tu estado de cuenta con los periodos que aún tienen saldo. Te invitamos a ponerte al corriente para evitar la suspensión de nuestros servicios y que tu situación ante la autoridad te genere recargos o actualizaciones por falta de declaraciones o pagos.",
      "",
      `Saldo acumulado: ${totalFmt}.`,
      ""
    );
    if (vencidos.length > 0) {
      parrafos.push("Saldos pendientes:");
      for (const v of vencidos) {
        parrafos.push(
          `· ${v.label}: ${formatSaldoCorreo(getSaldoMes(client, v.periodo))}`
        );
      }
      parrafos.push("");
    }
    parrafos.push(
      "Si ya pagaste algún mes, sube el comprobante a tu portal para que lo validemos y evitemos correos similares sobre esos periodos."
    );
  }

  if (historialTxt) parrafos.push(historialTxt);

  parrafos.push(
    "",
    "Portal:",
    portalUrl,
    firmaCorreoTexto()
  );

  return parrafos.join("\n");
}

export function buildCorreoCobranza(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoCobranza = "recordatorio",
  baseUrl?: string
): CorreoCobranza {
  const portalUrl = getPortalClienteUrl(client.id, baseUrl, "/portal/honorarios");
  const plantilla = plantillaPorTipo(tipo, client, periodo);
  const extrasPend = getTotalExtraPorCobrar(client);
  // Vencido o con extras: el monto principal refleja honorarios + adicionales.
  const montoFmt =
    tipo === "vencido" || extrasPend > 0
      ? formatMontoTotal(client, periodo)
      : formatMonto(client, periodo);
  const texto = buildTextoCorreo(client, periodo, portalUrl, plantilla, montoFmt);
  const html = buildHtmlCorreo(client, periodo, portalUrl, plantilla, montoFmt);

  return { tipo, subject: plantilla.subject, texto, html, portalUrl };
}

export function abrirCorreoCobranza(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoCobranza = "recordatorio",
  baseUrl?: string
): void {
  const { subject, texto } = buildCorreoCobranza(client, periodo, tipo, baseUrl);
  abrirBorradorCorreo({
    to: client.email?.trim(),
    subject,
    body: texto,
  });
}

export type ResultadoEnvioResend = {
  ok: boolean;
  error?: string;
  id?: string;
};

/**
 * Envía el correo de cobranza por Resend (HTML completo + texto de respaldo)
 * usando el endpoint `/api/admin/correo/enviar`. El admin debe estar
 * autenticado. Devuelve un resultado plano para que la UI muestre toast.
 */
export async function enviarCorreoCobranzaResend(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoCobranza = "recordatorio",
  baseUrl?: string
): Promise<ResultadoEnvioResend> {
  const correoCliente = client.email?.trim();
  if (!correoCliente) {
    return {
      ok: false,
      error: "El cliente no tiene correo registrado.",
    };
  }
  const { subject, html, texto } = buildCorreoCobranza(
    client,
    periodo,
    tipo,
    baseUrl
  );
  try {
    const res = await fetch("/api/admin/correo/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: correoCliente,
        subject,
        html,
        text: texto,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      id?: string;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error:
          data.error ??
          `Error ${res.status} al enviar el correo. Revisa la configuración de Resend.`,
      };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error de red al enviar.",
    };
  }
}

export async function copiarCorreoHtml(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoCobranza = "recordatorio",
  baseUrl?: string
): Promise<void> {
  const { texto, html } = buildCorreoCobranza(client, periodo, tipo, baseUrl);
  if (typeof ClipboardItem !== "undefined") {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([texto], { type: "text/plain" }),
      }),
    ]);
    return;
  }
  await navigator.clipboard.writeText(texto);
}

/** @deprecated Use buildCorreoCobranza con tipo */
export function buildRecordatorio(client: Cliente, periodo: Periodo): string {
  return buildCorreoCobranza(client, periodo, "recordatorio").texto;
}

function escaparHtmlCorreo(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Convierte texto libre en párrafos HTML (doble salto = párrafo, salto simple = <br>). */
function cuerpoLibreAHtml(cuerpo: string): string {
  return cuerpo
    .split(/\n{2,}/)
    .map((bloque) => bloque.trim())
    .filter(Boolean)
    .map(
      (bloque) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${escaparHtmlCorreo(
          bloque
        ).replace(/\n/g, "<br>")}</p>`
    )
    .join("");
}

/**
 * Envuelve un texto libre (un "script") en la misma plantilla de marca del
 * despacho (encabezado, tipografía y firma) para que, al copiarlo y pegarlo en
 * Gmail / Apple Mail, conserve el diseño en lugar de pegarse como texto plano.
 */
export function buildCorreoLibre(cuerpo: string): { html: string; texto: string } {
  const cuerpoHtml =
    cuerpoLibreAHtml(cuerpo) ||
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;"></p>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#4f46e5 100%);padding:24px 32px;text-align:center;">
              ${logoCorreoHtml()}
              <p style="margin:0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#ffffff;font-weight:bold;">${DESPACHO_NOMBRE}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${cuerpoHtml}
              ${firmaHtmlCorreo()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const texto = `${cuerpo.trim()}\n${firmaCorreoTexto()}`;
  return { html, texto };
}

/** Copia un script al portapapeles con formato HTML de marca (y respaldo en texto). */
export async function copiarCorreoLibreHtml(cuerpo: string): Promise<void> {
  const { html, texto } = buildCorreoLibre(cuerpo);
  if (typeof ClipboardItem !== "undefined") {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([texto], { type: "text/plain" }),
      }),
    ]);
    return;
  }
  await navigator.clipboard.writeText(texto);
}
