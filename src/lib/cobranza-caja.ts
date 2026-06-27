import {
  type Cliente,
  type Periodo,
  type PagoRealizado,
  type MetodoPago,
  periodoBancarioDePago,
  periodoLabel,
  esIngresoGeneralCliente,
  getExtrasEsperados,
  METODOS_PAGO,
} from "@/lib/clientes";

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
  nota?: string;
  esIngresoGeneral: boolean;
};

function etiquetaMetodo(m?: MetodoPago): string {
  if (!m) return "Transferencia";
  return METODOS_PAGO.find((x) => x.id === m)?.label ?? m;
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

/**
 * Movimientos de caja del mes calendario: todo pago cuya `fechaPago` (o el
 * periodo aplicado en pagos legacy sin fecha) cae en `periodoCaja`.
 */
export function listarMovimientosBancariosMes(
  clientes: Cliente[],
  periodoCaja: Periodo
): MovimientoBancarioCobranza[] {
  const movimientos: MovimientoBancarioCobranza[] = [];

  for (const cliente of clientes) {
    if (!cliente.activo) continue;

    cliente.pagosRealizados.forEach((pago, idx) => {
      const banco = periodoBancarioDePago(pago);
      if (banco.mes !== periodoCaja.mes || banco.anio !== periodoCaja.anio) return;
      if (pago.monto <= 0) return;

      const periodoAplicado: Periodo = {
        mes: pago.mes,
        anio: Number(pago.anio),
      };
      const { categoria, categoriaLabel } = etiquetaMovimiento(cliente, pago);
      const fecha =
        pago.fechaPago ??
        `${String(banco.anio).padStart(4, "0")}-${String(banco.mes + 1).padStart(2, "0")}-01`;

      movimientos.push({
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
        nota: pago.nota,
        esIngresoGeneral: esIngresoGeneralCliente(cliente),
      });
    });
  }

  movimientos.sort((a, b) => {
    const porFecha = b.fechaPago.localeCompare(a.fechaPago);
    if (porFecha !== 0) return porFecha;
    return a.clienteNombre.localeCompare(b.clienteNombre, "es");
  });

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
