import type { TipoCorreoCobranza } from "@/lib/correo";
import type { Periodo } from "@/lib/clientes";

/**
 * Centro de Recordatorios — modelo de datos.
 *
 * Dos piezas independientes:
 *  - `MarcaRecordatorio`: bitácora de "a quién ya contacté este mes" (para no
 *    duplicar ni olvidar). Se marca automático al enviar/copiar/abrir borrador,
 *    y también a mano.
 *  - `ScriptCorreo`: biblioteca de plantillas/fragmentos reutilizables que el
 *    admin copia y pega para armar correos ad-hoc.
 *
 * Ambas son herramientas del propietario (manejan dinero/cobranza), no de
 * colaboradores sin acceso a cobranza.
 */

export type ViaContacto = "enviado" | "copiado" | "borrador" | "manual";

export const VIA_CONTACTO_LABEL: Record<ViaContacto, string> = {
  enviado: "Enviado",
  copiado: "Copiado",
  borrador: "Borrador",
  manual: "Marcado a mano",
};

export type MarcaRecordatorio = {
  id: string;
  clienteId: number;
  /** `${anio}-${mes}` del periodo cobrado. */
  periodoKey: string;
  tipo: TipoCorreoCobranza;
  via: ViaContacto;
  /** ISO de cuándo se contactó. */
  contactadoEn: string;
};

export type ScriptCorreo = {
  id: string;
  titulo: string;
  cuerpo: string;
  creadoEn: string;
  actualizadoEn?: string;
};

export function nuevoIdMarca(): string {
  return `mr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nuevoIdScript(): string {
  return `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function periodoKeyStr(p: Periodo): string {
  return `${p.anio}-${p.mes}`;
}

/** Última vez que se contactó al cliente en ese periodo (o undefined). */
export function getUltimaMarca(
  marcas: MarcaRecordatorio[],
  clienteId: number,
  periodoKey: string
): MarcaRecordatorio | undefined {
  return marcas
    .filter((m) => m.clienteId === clienteId && m.periodoKey === periodoKey)
    .sort((a, b) => b.contactadoEn.localeCompare(a.contactadoEn))[0];
}

/** Último envío real (Resend) al cliente en ese periodo, si existe. */
export function getUltimoEnvioResend(
  marcas: MarcaRecordatorio[],
  clienteId: number,
  periodoKey: string
): MarcaRecordatorio | undefined {
  return marcas
    .filter(
      (m) =>
        m.clienteId === clienteId &&
        m.periodoKey === periodoKey &&
        m.via === "enviado"
    )
    .sort((a, b) => b.contactadoEn.localeCompare(a.contactadoEn))[0];
}

export function formatFechaContacto(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
