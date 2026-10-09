import { enviarCorreo } from "@/lib/mailer";
import { plantillaEfirmaProximaVencer } from "@/lib/mailer/templates";
import {
  listarEfirmas,
  marcarNotificado,
  obtenerEfirmaPorCliente,
  yaNotificado,
} from "./db";
import { diasHastaVencimiento, formatFechaCertificado, umbralRecordatorioAplicable } from "./vigencia";
import type { RegistroEfirma, UmbralRecordatorio } from "./types";

export type ClienteBasico = {
  id: number;
  razonSocial: string;
  email: string;
  activo: boolean;
};

export async function enviarCorreoRecordatorioEfirma(
  reg: RegistroEfirma,
  cliente: ClienteBasico,
  diasRestantes: number,
  origin: string
): Promise<{ ok: boolean; error?: string }> {
  if (!cliente.email?.trim()) {
    return { ok: false, error: "El cliente no tiene correo registrado." };
  }

  const nombreDespacho =
    process.env.NEXT_PUBLIC_DESPACHO_NOMBRE?.trim() || "RDC Contadores";
  const correoSoporte =
    process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim() ||
    "contacto@rdcontadores.com";
  const sitioWeb = process.env.NEXT_PUBLIC_DESPACHO_SITIO?.trim();

  const plantilla = plantillaEfirmaProximaVencer({
    nombreCliente: cliente.razonSocial,
    diasRestantes,
    fechaVencimiento: formatFechaCertificado(reg.vigenciaFin),
    urlPortal: `${origin}/portal/inicio`,
    nombreDespacho,
    correoSoporte,
    sitioWeb,
  });

  const envio = await enviarCorreo({
    to: cliente.email.trim(),
    subject: plantilla.asunto,
    html: plantilla.html,
    text: plantilla.texto,
  });

  return envio.ok ? { ok: true } : { ok: false, error: envio.error };
}

export async function procesarRecordatoriosAutomaticos(
  clientes: ClienteBasico[],
  origin: string,
  umbralForzado?: UmbralRecordatorio
): Promise<{
  procesados: number;
  enviados: number;
  errores: string[];
}> {
  const registros = await listarEfirmas();
  const mapaClientes = new Map(clientes.map((c) => [c.id, c]));
  let enviados = 0;
  const errores: string[] = [];

  for (const reg of registros) {
    const cliente = mapaClientes.get(reg.clienteId);
    if (!cliente?.activo) continue;

    const dias = diasHastaVencimiento(reg.vigenciaFin);
    if (dias > 30) continue;

    const umbral = umbralForzado ?? umbralRecordatorioAplicable(dias);
    if (!umbral) continue;
    if (yaNotificado(reg, umbral)) continue;

    const resultado = await enviarCorreoRecordatorioEfirma(reg, cliente, dias, origin);
    if (resultado.ok) {
      await marcarNotificado(reg.id, umbral);
      enviados += 1;
    } else if (resultado.error) {
      errores.push(`${cliente.razonSocial}: ${resultado.error}`);
    }
  }

  return { procesados: registros.length, enviados, errores };
}

export async function notificarClienteEfirmaManual(
  clienteId: number,
  clientes: ClienteBasico[],
  origin: string
): Promise<{ ok: boolean; error?: string; diasRestantes?: number }> {
  const reg = await obtenerEfirmaPorCliente(clienteId);
  if (!reg) return { ok: false, error: "Este cliente no tiene e.firma registrada." };

  const cliente = clientes.find((c) => c.id === clienteId);
  if (!cliente) return { ok: false, error: "Cliente no encontrado." };

  const dias = diasHastaVencimiento(reg.vigenciaFin);
  const resultado = await enviarCorreoRecordatorioEfirma(reg, cliente, dias, origin);
  if (!resultado.ok) return resultado;

  const umbral = umbralRecordatorioAplicable(dias);
  if (umbral) await marcarNotificado(reg.id, umbral);

  return { ok: true, diasRestantes: dias };
}
