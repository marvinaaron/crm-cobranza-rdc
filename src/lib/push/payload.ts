import type { TipoNotificacion, DestinatarioNotificacion } from "@/lib/notificaciones";

/** Acción visible en la notificación push (máx. 2 en la mayoría de plataformas). */
export type PushAction = {
  action: string;
  title: string;
  icon?: string;
};

export type PushActionUrls = Record<string, string>;

type ArgsAdmin = {
  tipo: TipoNotificacion;
  clienteId: number;
  href?: string;
};

type ArgsCliente = {
  tipo: TipoNotificacion;
  href?: string;
};

const ICON_ADMIN = "/icon-192-admin.png";
const ICON_PORTAL = "/icon-192.png";

function urlCumplimientoCliente(clienteId: number): string {
  return `/cumplimiento?cliente=${clienteId}`;
}

function urlCobranzaRevisar(clienteId: number): string {
  return `/cobranza?cliente=${clienteId}&filtro=comprobantes&revisar=1`;
}

/**
 * URLs por acción + lista de botones para notificaciones al admin.
 */
export function buildAdminPushExtras({
  tipo,
  clienteId,
  href,
}: ArgsAdmin): {
  url: string;
  actions: PushAction[];
  actionUrls: PushActionUrls;
  requireInteraction: boolean;
} {
  const base = href ?? "/dashboard";
  const actionUrls: PushActionUrls = { abrir: base };

  switch (tipo) {
    case "cobranza_cliente_subio_comprobante":
    case "cliente_subio_comprobante": {
      const revisar = urlCobranzaRevisar(clienteId);
      actionUrls.revisar = revisar;
      actionUrls.cobranza = `/cobranza?filtro=comprobantes`;
      return {
        url: revisar,
        actionUrls,
        requireInteraction: true,
        actions: [
          { action: "revisar", title: "Revisar comprobante", icon: ICON_ADMIN },
          { action: "cobranza", title: "Lista cobranza", icon: ICON_ADMIN },
        ],
      };
    }
    case "cliente_previo_validado": {
      const cumplimiento = urlCumplimientoCliente(clienteId);
      actionUrls.cumplimiento = cumplimiento;
      return {
        url: cumplimiento,
        actionUrls,
        requireInteraction: true,
        actions: [
          { action: "cumplimiento", title: "Ver cumplimiento", icon: ICON_ADMIN },
          { action: "abrir", title: "Abrir CRM", icon: ICON_ADMIN },
        ],
      };
    }
    case "vencimiento_sin_pago":
    case "admin_documentos_listos":
    case "admin_sin_pago":
    case "admin_extemporaneo_publicado":
    case "admin_contabilidad_iniciada":
    case "admin_previo_publicado": {
      const cumplimiento = urlCumplimientoCliente(clienteId);
      actionUrls.cumplimiento = cumplimiento;
      return {
        url: cumplimiento,
        actionUrls,
        requireInteraction: false,
        actions: [
          { action: "cumplimiento", title: "Ver cumplimiento", icon: ICON_ADMIN },
          { action: "abrir", title: "Abrir CRM", icon: ICON_ADMIN },
        ],
      };
    }
    case "admin_efirma_vence_pronto": {
      actionUrls.efirmas = "/efirmas";
      return {
        url: "/efirmas",
        actionUrls,
        requireInteraction: false,
        actions: [
          { action: "efirmas", title: "Ver e.firmas", icon: ICON_ADMIN },
          { action: "abrir", title: "Abrir CRM", icon: ICON_ADMIN },
        ],
      };
    }
    case "encargo_solicitud_cliente": {
      actionUrls.encargos = "/encargos";
      return {
        url: "/encargos",
        actionUrls,
        requireInteraction: true,
        actions: [
          { action: "encargos", title: "Ver encargos", icon: ICON_ADMIN },
          { action: "abrir", title: "Abrir CRM", icon: ICON_ADMIN },
        ],
      };
    }
    default:
      return {
        url: base,
        actionUrls,
        requireInteraction: false,
        actions: [{ action: "abrir", title: "Abrir", icon: ICON_ADMIN }],
      };
  }
}

/** Botones para notificaciones al cliente en el portal. */
export function buildClientePushExtras({
  tipo,
  href,
}: ArgsCliente): {
  url: string;
  actions: PushAction[];
  actionUrls: PushActionUrls;
  requireInteraction: boolean;
} {
  const base = href ?? "/portal/inicio";
  const actionUrls: PushActionUrls = { abrir: base };

  switch (tipo) {
    case "admin_documentos_listos":
    case "admin_previo_publicado":
    case "admin_contabilidad_iniciada":
    case "admin_extemporaneo_publicado":
    case "admin_sin_pago":
    case "cliente_previo_validado":
      actionUrls.cumplimiento = "/portal/cumplimiento";
      return {
        url: "/portal/cumplimiento",
        actionUrls,
        requireInteraction: false,
        actions: [
          { action: "cumplimiento", title: "Ver documentos", icon: ICON_PORTAL },
          { action: "abrir", title: "Abrir portal", icon: ICON_PORTAL },
        ],
      };
    case "cobranza_pago_validado":
    case "cobranza_factura_disponible":
      actionUrls.honorarios = "/portal/honorarios";
      return {
        url: "/portal/honorarios",
        actionUrls,
        requireInteraction: false,
        actions: [
          { action: "honorarios", title: "Ver honorarios", icon: ICON_PORTAL },
          { action: "abrir", title: "Abrir portal", icon: ICON_PORTAL },
        ],
      };
    case "cierre_mes_completado":
      actionUrls.cumplimiento = "/portal/cumplimiento";
      return {
        url: "/portal/cumplimiento",
        actionUrls,
        requireInteraction: true,
        actions: [
          { action: "cumplimiento", title: "Ver mi mes", icon: ICON_PORTAL },
          { action: "abrir", title: "Abrir portal", icon: ICON_PORTAL },
        ],
      };
    case "cobranza_comprobante_rechazado":
    case "vencimiento_sin_pago":
      actionUrls.honorarios = "/portal/honorarios";
      actionUrls.cumplimiento = "/portal/cumplimiento";
      return {
        url: base.includes("honorarios") ? "/portal/honorarios" : "/portal/cumplimiento",
        actionUrls,
        requireInteraction: true,
        actions: [
          { action: "honorarios", title: "Subir comprobante", icon: ICON_PORTAL },
          { action: "cumplimiento", title: "Cumplimiento", icon: ICON_PORTAL },
        ],
      };
    case "efirma_vence_pronto":
      return {
        url: base,
        actionUrls,
        requireInteraction: false,
        actions: [{ action: "abrir", title: "Abrir portal", icon: ICON_PORTAL }],
      };
    case "encargo_estado_cliente":
    case "encargo_listo_cliente": {
      actionUrls.encargos = "/portal/encargos";
      return {
        url: "/portal/encargos",
        actionUrls,
        requireInteraction: tipo === "encargo_listo_cliente",
        actions: [
          { action: "encargos", title: "Mis encargos", icon: ICON_PORTAL },
          { action: "abrir", title: "Abrir portal", icon: ICON_PORTAL },
        ],
      };
    }
    default:
      return {
        url: base,
        actionUrls,
        requireInteraction: false,
        actions: [{ action: "abrir", title: "Abrir portal", icon: ICON_PORTAL }],
      };
  }
}

/** Atajo para payloads enviados sin tipo explícito (compatibilidad). */
export function pushExtrasPorDestinatario(
  destinatario: DestinatarioNotificacion,
  args: ArgsAdmin | ArgsCliente
) {
  return destinatario === "admin"
    ? buildAdminPushExtras(args as ArgsAdmin)
    : buildClientePushExtras(args as ArgsCliente);
}
