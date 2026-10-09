import { type Periodo, periodoLabel } from "@/lib/clientes";
import {
  type FlujoCumplimiento,
  esSinPagoImpuestos,
  formatFechaLimiteImpuesto,
  getCumplimientoPeriodo,
  getFlujoCumplimiento,
  type RegistroCumplimiento,
} from "@/lib/cumplimiento";
import type { CategoriaId } from "@/lib/cumplimiento-categorias";
import {
  categoriaTieneExtemporaneo,
  getFechaLimiteEfectivaCategoria,
  pagoValidadoCategoria,
  tieneComprobantePagoCategoria,
} from "@/lib/cumplimiento-categorias";
import { limiteVencido } from "@/lib/cumplimiento-fechas";
import {
  fechaLimiteSAT,
  formatearDiaMesCorto,
} from "@/lib/portal/fechas-fiscales";
import type { AccionPortal } from "@/lib/portal/siguiente-paso";

function diasHasta(fecha: Date, hoy: Date): number {
  const a = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const b = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function periodoAnteriorDe(p: Periodo): Periodo {
  if (p.mes === 0) return { mes: 11, anio: p.anio - 1 };
  return { mes: p.mes - 1, anio: p.anio };
}

function periodosAnteriores(desde: Periodo, cantidad: number): Periodo[] {
  const out: Periodo[] = [];
  let actual = periodoAnteriorDe(desde);
  for (let i = 0; i < cantidad; i++) {
    out.push(actual);
    actual = periodoAnteriorDe(actual);
  }
  return out;
}

type MesAnteriorPendiente = {
  periodo: Periodo;
  motivo: "extemporaneo" | "comprobante" | "preliminar";
  monto?: number;
  fechaLimite?: string;
};

function extemporaneoPendiente(
  reg: RegistroCumplimiento,
  periodo: Periodo,
  categorias: CategoriaId[]
): MesAnteriorPendiente | null {
  const catsExt = categorias.filter(
    (cat) =>
      categoriaTieneExtemporaneo(reg, cat) &&
      !tieneComprobantePagoCategoria(reg, cat) &&
      !pagoValidadoCategoria(reg, cat) &&
      !reg.comprobantePago
  );
  if (!catsExt.length) return null;

  let monto = 0;
  let fechaLimite = "";
  for (const cat of catsExt) {
    const linea = reg.extemporaneo?.[cat]?.lineas[0];
    if (linea?.monto) monto += linea.monto;
    const fl = getFechaLimiteEfectivaCategoria(reg, cat);
    if (fl && (!fechaLimite || fl < fechaLimite)) fechaLimite = fl;
  }
  return {
    periodo,
    motivo: "extemporaneo",
    monto: monto > 0 ? monto : undefined,
    fechaLimite: fechaLimite || undefined,
  };
}

/**
 * Mes anterior con acción pendiente del cliente (no del despacho).
 * Ignora periodos vacíos o solo en preparación.
 */
function detectarMesAnteriorPendiente(
  reg: RegistroCumplimiento | undefined,
  periodo: Periodo,
  categorias: CategoriaId[]
): MesAnteriorPendiente | null {
  if (!reg || esSinPagoImpuestos(reg)) return null;

  const ext = extemporaneoPendiente(reg, periodo, categorias);
  if (ext) return ext;

  const flujo = getFlujoCumplimiento(reg);
  if (flujo === "preliminar") {
    return { periodo, motivo: "preliminar" };
  }
  if (flujo !== "declaraciones") return null;

  const fechas = categorias
    .filter(
      (cat) =>
        !tieneComprobantePagoCategoria(reg, cat) && !reg.comprobantePago
    )
    .map((c) => getFechaLimiteEfectivaCategoria(reg, c))
    .filter(Boolean)
    .sort();

  return {
    periodo,
    motivo: "comprobante",
    monto: reg.montoImpuesto > 0 ? reg.montoImpuesto : undefined,
    fechaLimite: fechas[0] || reg.fechaLimite || undefined,
  };
}

/**
 * Banner de impuestos cuando el periodo fiscal aún no está cerrado ante el SAT.
 * El copy está pensado para que el cliente **nos contacte**: muchos olvidan
 * fechas aunque ya les hayamos escrito por otro medio.
 */
export function bannerImpuestosPendientesInicio(opts: {
  registro: RegistroCumplimiento | undefined;
  flujo: FlujoCumplimiento;
  periodoFiscal: Periodo;
  rfc?: string | null;
  hoy?: Date;
}): AccionPortal | null {
  const { registro, flujo, periodoFiscal, rfc } = opts;
  const hoy = opts.hoy ?? new Date();

  if (esSinPagoImpuestos(registro)) return null;
  if (flujo === "preliminar" || flujo === "declaraciones") return null;
  if (flujo === "completado" || flujo === "pago") return null;

  const flujosPendientes: FlujoCumplimiento[] = [
    "por_trabajar",
    "iniciando_contabilidad",
    "aceptacion",
  ];
  if (!flujosPendientes.includes(flujo)) return null;

  const limiteSat = fechaLimiteSAT(rfc, periodoFiscal);
  const diasAlSat = diasHasta(limiteSat, hoy);
  const fechaSat = formatearDiaMesCorto(limiteSat);
  const periodoTxt = periodoLabel(periodoFiscal);

  let titulo: string;
  let detalle: string;
  let urgente = false;

  if (diasAlSat < 0) {
    urgente = true;
    titulo = `Impuestos de ${periodoTxt} sin cerrar`;
    detalle =
      "El plazo del SAT ya pasó. Escríbenos si tienes dudas. Tienes que estar al corriente — te ayudamos a regularizarte.";
  } else if (diasAlSat <= 7) {
    urgente = true;
    titulo =
      diasAlSat === 0
        ? `Hoy vence el SAT · ${periodoTxt}`
        : `Te quedan ${diasAlSat} día${diasAlSat === 1 ? "" : "s"} para el SAT`;
    detalle =
      diasAlSat === 0
        ? "Hoy es la fecha límite. Escríbenos si tienes dudas."
        : "Aún estás a tiempo. Escríbenos si necesitas orientación.";
  } else if (diasAlSat <= 15) {
    titulo = `Impuestos de ${periodoTxt} pendientes`;
    detalle =
      "Tu cierre sigue abierto ante el SAT. Escríbenos si quieres saber cómo va.";
  } else {
    titulo = `Impuestos de ${periodoTxt} en proceso`;
    detalle =
      "Tu cierre está en marcha. Aquí verás el avance. Escríbenos si tienes dudas.";
  }

  return {
    clave: "impuestos_pendientes",
    etiqueta: "Impuestos SAT",
    titulo,
    desglose: `SAT · ${fechaSat}`,
    detalle,
    cta: "Escríbenos",
    href: "/portal/cumplimiento",
    contactarContador: true,
    ctaSecundario: "Ver Mi Cuenta",
    hrefSecundario: "/portal/cumplimiento",
    urgente,
  };
}

/**
 * Aviso en Inicio solo si hay mes(es) anteriores con algo pendiente del cliente
 * (comprobante, preliminar o línea extemporánea). No duplica el timeline de Cumplimiento.
 */
export function avisoMesesAnterioresPendientesInicio(opts: {
  lista: RegistroCumplimiento[];
  clienteId: number;
  periodoFiscal: Periodo;
  categorias?: CategoriaId[];
  mesesAtras?: number;
}): AccionPortal | null {
  const {
    lista,
    clienteId,
    periodoFiscal,
    categorias = ["federales", "imss", "estatales"],
    mesesAtras = 5,
  } = opts;

  const pendientes = periodosAnteriores(periodoFiscal, mesesAtras)
    .map((periodo) => {
      const reg = getCumplimientoPeriodo(lista, clienteId, periodo);
      return detectarMesAnteriorPendiente(reg, periodo, categorias);
    })
    .filter((p): p is MesAnteriorPendiente => !!p);

  if (!pendientes.length) return null;

  const labels = pendientes.map((p) => periodoLabel(p.periodo));
  const solo = pendientes.length === 1 ? pendientes[0] : null;
  const hayExt = pendientes.some((p) => p.motivo === "extemporaneo");
  const urgente =
    hayExt ||
    pendientes.some(
      (p) => p.motivo === "comprobante" || (p.fechaLimite && limiteVencido(p.fechaLimite))
    );

  if (solo?.motivo === "extemporaneo") {
    return {
      clave: "meses_anteriores",
      etiqueta: "Mes anterior",
      titulo: `Pago extemporáneo de ${labels[0]}`,
      monto: solo.monto,
      desglose: solo.fechaLimite
        ? `Nueva fecha · ${formatFechaLimiteImpuesto(solo.fechaLimite)}`
        : undefined,
      detalle:
        "Quedó pendiente un mes anterior. Sube el comprobante o escríbenos para regularizarte.",
      cta: "Ir a Cumplimiento",
      href: "/portal/cumplimiento#pago-extemporaneo",
      urgente: true,
    };
  }

  if (solo?.motivo === "preliminar") {
    return {
      clave: "meses_anteriores",
      etiqueta: "Mes anterior",
      titulo: `Impuestos de ${labels[0]} por revisar`,
      detalle:
        "Un mes anterior sigue abierto. Revísalo en Cumplimiento para no acumular atraso.",
      cta: "Ver mes anterior",
      href: "/portal/cumplimiento",
      urgente: false,
    };
  }

  if (solo) {
    return {
      clave: "meses_anteriores",
      etiqueta: "Mes anterior",
      titulo: `Falta cerrar ${labels[0]}`,
      monto: solo.monto,
      desglose: solo.fechaLimite
        ? `Venció · ${formatFechaLimiteImpuesto(solo.fechaLimite)}`
        : undefined,
      detalle:
        "Ese periodo aún no tiene comprobante. Entra a Cumplimiento y tócalo en el historial de meses.",
      cta: "Ir a Cumplimiento",
      href: "/portal/cumplimiento",
      urgente,
    };
  }

  const listado =
    labels.length === 2
      ? `${labels[0]} y ${labels[1]}`
      : `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;

  return {
    clave: "meses_anteriores",
    etiqueta: "Meses anteriores",
    titulo: `Tienes ${pendientes.length} meses anteriores pendientes`,
    detalle: `${listado} siguen sin cerrar. Revísalos en el historial de Cumplimiento.`,
    cta: "Ver historial",
    href: "/portal/cumplimiento",
    urgente: true,
  };
}
