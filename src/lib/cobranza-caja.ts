import {
  type Cliente,
  type Periodo,
  type PagoRealizado,
  type MetodoPago,
  type CuentaBancoDespacho,
  periodoBancarioDePago,
  periodoLabel,
  periodoLabelCorto,
  esIngresoGeneralCliente,
  getExtrasEsperados,
  METODOS_PAGO,
  CUENTAS_BANCO_DESPACHO,
} from "@/lib/clientes";
import {
  type FacturaPago,
  facturaRegistrada,
  getFacturaPeriodo,
} from "@/lib/facturas";

export type MovimientoBancarioCobranza = {
  id: string;
  clienteId: number;
  clienteNombre: string;
  rfc: string;
  fechaPago: string;
  monto: number;
  /** Periodo de honorarios / contable al que se aplicó el abono. */
  periodoAplicado: Periodo;
  periodoAplicadoLabel: string;
  categoria: "honorarios" | "adicional" | "extra" | "general";
  categoriaLabel: string;
  metodoPago?: MetodoPago;
  metodoLabel: string;
  cuentaBanco?: CuentaBancoDespacho;
  cuentaLabel?: string;
  mesesPagadosLabel: string;
  nota?: string;
  esIngresoGeneral: boolean;
};

export type MovimientoBancarioEnriquecido = MovimientoBancarioCobranza & {
  facturado: boolean;
  factura?: FacturaPago;
};

export type ResumenFacturacionBanco = {
  todoFacturado: boolean;
  movimientos: number;
  conFactura: number;
  sinFactura: number;
  montoTotal: number;
  montoSinFactura: number;
};

function etiquetaMetodo(m?: MetodoPago): string {
  if (!m) return "Transferencia";
  return METODOS_PAGO.find((x) => x.id === m)?.label ?? m;
}

export function isoInicioPeriodo(p: Periodo): string {
  return `${p.anio}-${String(p.mes + 1).padStart(2, "0")}-01`;
}

export function isoFinPeriodo(p: Periodo): string {
  const ultimo = new Date(p.anio, p.mes + 1, 0).getDate();
  return `${p.anio}-${String(p.mes + 1).padStart(2, "0")}-${String(ultimo).padStart(2, "0")}`;
}

export function isoInicioAnio(anio: number): string {
  return `${anio}-01-01`;
}

export function isoFinAnio(anio: number): string {
  return `${anio}-12-31`;
}

/**
 * Transferencias viejas sin `cuentaBanco` se asumen BBVA (cuenta principal).
 * Efectivo / tarjeta / Stripe no caen en una cuenta SPEI.
 */
export function cuentaBancariaDePago(
  pago: Pick<PagoRealizado, "metodoPago" | "cuentaBanco">
): CuentaBancoDespacho | undefined {
  if (pago.cuentaBanco) return pago.cuentaBanco;
  const metodo = pago.metodoPago ?? "transferencia";
  if (metodo === "transferencia" || metodo === "deposito") return "bbva";
  return undefined;
}

function etiquetaCuenta(id?: CuentaBancoDespacho): string | undefined {
  if (!id) return undefined;
  return CUENTAS_BANCO_DESPACHO.find((c) => c.id === id)?.label ?? id;
}

function etiquetaMesesPagados(
  categoria: MovimientoBancarioCobranza["categoria"],
  periodoAplicado: Periodo,
  categoriaLabel: string
): string {
  if (categoria === "honorarios") return periodoLabelCorto(periodoAplicado);
  return categoriaLabel;
}

function etiquetaMovimiento(
  cliente: Cliente,
  pago: PagoRealizado
): { categoria: MovimientoBancarioCobranza["categoria"]; categoriaLabel: string } {
  const periodoAplicado: Periodo = {
    mes: pago.mes,
    anio: Number(pago.anio),
  };
  const mesLabel = periodoLabel(periodoAplicado);

  if (esIngresoGeneralCliente(cliente)) {
    return {
      categoria: "general",
      categoriaLabel: pago.nota?.trim() || "Ingreso diverso",
    };
  }
  if (pago.tipo === "adicional" && pago.extraEsperadoId) {
    const extra = getExtrasEsperados(cliente).find((e) => e.id === pago.extraEsperadoId);
    return {
      categoria: "extra",
      categoriaLabel: extra
        ? `Extra · ${extra.concepto}`
        : "Abono a extra por cobrar",
    };
  }
  if (pago.tipo === "adicional") {
    return {
      categoria: "adicional",
      categoriaLabel: pago.concepto?.trim()
        ? `Adicional · ${pago.concepto.trim()}`
        : `Adicional · ${mesLabel}`,
    };
  }
  return {
    categoria: "honorarios",
    categoriaLabel: `Honorarios · ${mesLabel}`,
  };
}

function armarMovimiento(
  cliente: Cliente,
  pago: PagoRealizado,
  idx: number
): MovimientoBancarioCobranza | null {
  if (pago.monto <= 0) return null;
  const banco = periodoBancarioDePago(pago);
  const periodoAplicado: Periodo = {
    mes: pago.mes,
    anio: Number(pago.anio),
  };
  const { categoria, categoriaLabel } = etiquetaMovimiento(cliente, pago);
  const fecha =
    pago.fechaPago ??
    `${String(banco.anio).padStart(4, "0")}-${String(banco.mes + 1).padStart(2, "0")}-01`;
  const cuentaBanco = cuentaBancariaDePago(pago);

  return {
    id:
      pago.id ??
      `${cliente.id}-${pago.mes}-${pago.anio}-${idx}-${pago.monto}-${fecha}`,
    clienteId: cliente.id,
    clienteNombre: cliente.razonSocial,
    rfc: cliente.rfc,
    fechaPago: fecha,
    monto: pago.monto,
    periodoAplicado,
    periodoAplicadoLabel: periodoLabel(periodoAplicado),
    categoria,
    categoriaLabel,
    metodoPago: pago.metodoPago,
    metodoLabel: etiquetaMetodo(pago.metodoPago),
    cuentaBanco,
    cuentaLabel: etiquetaCuenta(cuentaBanco),
    mesesPagadosLabel: etiquetaMesesPagados(
      categoria,
      periodoAplicado,
      categoriaLabel
    ),
    nota: pago.nota,
    esIngresoGeneral: esIngresoGeneralCliente(cliente),
  };
}

function ordenNaturalCaja(
  a: MovimientoBancarioCobranza,
  b: MovimientoBancarioCobranza
): number {
  const porFecha = b.fechaPago.localeCompare(a.fechaPago);
  if (porFecha !== 0) return porFecha;
  return a.clienteNombre.localeCompare(b.clienteNombre, "es");
}

/**
 * Movimientos de caja del mes calendario: todo pago cuya `fechaPago` (o el
 * periodo aplicado en pagos legacy sin fecha) cae en `periodoCaja`.
 */
export function listarMovimientosBancariosMes(
  clientes: Cliente[],
  periodoCaja: Periodo
): MovimientoBancarioCobranza[] {
  return listarMovimientosBancariosRango(
    clientes,
    isoInicioPeriodo(periodoCaja),
    isoFinPeriodo(periodoCaja)
  );
}

/** Movimientos cuya fecha de caja cae entre `desde` y `hasta` (ISO, inclusive). */
export function listarMovimientosBancariosRango(
  clientes: Cliente[],
  desde: string,
  hasta: string
): MovimientoBancarioCobranza[] {
  const movimientos: MovimientoBancarioCobranza[] = [];

  for (const cliente of clientes) {
    if (!cliente.activo) continue;
    cliente.pagosRealizados.forEach((pago, idx) => {
      const mov = armarMovimiento(cliente, pago, idx);
      if (!mov) return;
      if (mov.fechaPago < desde || mov.fechaPago > hasta) return;
      movimientos.push(mov);
    });
  }

  movimientos.sort(ordenNaturalCaja);
  return movimientos;
}

export function totalMovimientosBancariosMes(
  clientes: Cliente[],
  periodoCaja: Periodo
): number {
  return listarMovimientosBancariosMes(clientes, periodoCaja).reduce(
    (acc, m) => acc + m.monto,
    0
  );
}

function enriquecerFactura(
  movimientos: MovimientoBancarioCobranza[],
  facturas: FacturaPago[]
): MovimientoBancarioEnriquecido[] {
  return movimientos.map((m) => {
    const factura = getFacturaPeriodo(facturas, m.clienteId, m.periodoAplicado);
    return {
      ...m,
      factura,
      facturado: facturaRegistrada(factura),
    };
  });
}

/** Movimientos del mes con estado de factura (periodo de honorarios aplicado). */
export function listarMovimientosBancariosConFactura(
  clientes: Cliente[],
  periodoCaja: Periodo,
  facturas: FacturaPago[]
): MovimientoBancarioEnriquecido[] {
  return enriquecerFactura(
    listarMovimientosBancariosMes(clientes, periodoCaja),
    facturas
  );
}

export function listarMovimientosBancariosConFacturaRango(
  clientes: Cliente[],
  desde: string,
  hasta: string,
  facturas: FacturaPago[]
): MovimientoBancarioEnriquecido[] {
  return enriquecerFactura(
    listarMovimientosBancariosRango(clientes, desde, hasta),
    facturas
  );
}

export function resumenFacturacionBanco(
  movimientos: MovimientoBancarioEnriquecido[]
): ResumenFacturacionBanco {
  const sinFactura = movimientos.filter((m) => !m.facturado);
  const montoTotal = movimientos.reduce((acc, m) => acc + m.monto, 0);
  const montoSinFactura = sinFactura.reduce((acc, m) => acc + m.monto, 0);
  return {
    todoFacturado: movimientos.length > 0 && sinFactura.length === 0,
    movimientos: movimientos.length,
    conFactura: movimientos.length - sinFactura.length,
    sinFactura: sinFactura.length,
    montoTotal,
    montoSinFactura,
  };
}
