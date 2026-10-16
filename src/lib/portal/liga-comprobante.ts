import type { Cliente } from "@/lib/clientes";
import { getPortalClienteUrl } from "@/lib/correo";
import { SITE_URL } from "@/lib/seo/site";
import { waLinkTelefono } from "@/lib/telefono";

export type TipoLigaComprobante = "impuestos" | "honorarios";

export function parseTipoLigaComprobante(
  raw: string | null | undefined
): TipoLigaComprobante {
  return raw === "impuestos" ? "impuestos" : "honorarios";
}

export function destinoComprobantePortal(tipo: TipoLigaComprobante): string {
  return tipo === "honorarios"
    ? "/portal/honorarios#comprobante"
    : "/portal/cumplimiento#comprobante";
}

/**
 * Liga pública para WhatsApp (con portada OG).
 * Lleva `c` del cliente para que, al abrirla, caiga en su portal.
 */
export function ligaComprobantePortal(
  clienteId: number,
  tipo: TipoLigaComprobante
): string {
  const q = new URLSearchParams({
    c: String(clienteId),
    tipo,
  });
  return `${SITE_URL}/subir-pago?${q.toString()}`;
}

/** Login del portal con destino a Subir comprobante. */
export function ligaLoginComprobantePortal(
  clienteId: number | null,
  tipo: TipoLigaComprobante
): string {
  const destino = destinoComprobantePortal(tipo);
  if (!clienteId || !Number.isFinite(clienteId) || clienteId <= 0) {
    return `${SITE_URL}/portal/login?next=${encodeURIComponent(destino)}`;
  }
  return getPortalClienteUrl(clienteId, SITE_URL, destino);
}

export function etiquetaLigaComprobante(tipo: TipoLigaComprobante): string {
  return tipo === "honorarios" ? "honorarios" : "impuestos";
}

export function mensajePedirComprobanteWhatsApp(opts: {
  cliente: Pick<Cliente, "id" | "razonSocial">;
  tipo: TipoLigaComprobante;
}): string {
  const liga = ligaComprobantePortal(opts.cliente.id, opts.tipo);
  return [
    "Hola 👋",
    "",
    "Al parecer recibimos un pago de tu parte 💳",
    "De ser así, ¿nos ayudas a subirlo a tu portal del cliente para validarlo?",
    "",
    liga,
    "",
    "Gracias 🙌",
  ].join("\n");
}

export function waPedirComprobante(
  cliente: Pick<Cliente, "id" | "razonSocial" | "whatsapp">,
  tipo: TipoLigaComprobante
): string | null {
  return waLinkTelefono(
    cliente.whatsapp,
    mensajePedirComprobanteWhatsApp({ cliente, tipo })
  );
}
