import type { Cliente } from "@/lib/clientes";
import type { SnapshotCliente } from "@/lib/supabase/portal-acceso";

/**
 * Convierte un Cliente del CRM al snapshot mínimo que se guarda en
 * `app_metadata` del usuario del portal. Lo usa el portal del cliente para
 * mostrar los datos básicos sin depender del localStorage del admin.
 */
export function snapshotDeCliente(cliente: Cliente): SnapshotCliente {
  return {
    razonSocial: cliente.razonSocial,
    rfc: cliente.rfc,
    email: cliente.email,
    honorarios: cliente.honorarios,
    fechaPago: cliente.fechaPago,
    inicioMes: cliente.inicioMes,
    inicioAnio: cliente.inicioAnio,
    esPersonaMoral: cliente.esPersonaMoral,
    esIngresoGeneral: cliente.esIngresoGeneral,
    activo: cliente.activo,
    estado: cliente.estado,
    configCumplimiento: cliente.configCumplimiento,
    historialHonorarios: cliente.historialHonorarios,
  };
}

/**
 * Reconstruye un objeto Cliente "esqueleto" a partir del snapshot del portal.
 * Como el snapshot no incluye pagos ni cumplimiento (esos viven en
 * localStorage del admin), regresamos arreglos vacíos para mantener la
 * estructura del tipo Cliente.
 */
export function clienteDesdeSnapshot(params: {
  clienteId: number;
  email: string;
  snapshot: SnapshotCliente;
}): Cliente {
  const s = params.snapshot;
  return {
    id: params.clienteId,
    razonSocial: s.razonSocial,
    rfc: s.rfc,
    email: s.email || params.email,
    honorarios: s.honorarios,
    historialHonorarios:
      (s.historialHonorarios as Cliente["historialHonorarios"]) ??
      (s.honorarios
        ? [{ mes: s.inicioMes ?? 0, monto: s.honorarios }]
        : []),
    fechaPago: s.fechaPago ?? "1",
    estado: s.estado ?? "AL CORRIENTE",
    activo: s.activo !== false,
    inicioMes: s.inicioMes ?? 0,
    inicioAnio: s.inicioAnio ?? String(new Date().getFullYear()),
    pagosRealizados: [],
    esPersonaMoral: s.esPersonaMoral === true,
    esIngresoGeneral: s.esIngresoGeneral === true,
    configCumplimiento: s.configCumplimiento as Cliente["configCumplimiento"],
  };
}
