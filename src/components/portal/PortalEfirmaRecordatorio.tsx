"use client";

import { useEffect, useRef } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { useClientes } from "@/context/ClientesContext";
import { getPeriodoFiscalVigente } from "@/lib/clientes";
import { etiquetaDiasRestantes } from "@/lib/efirma/vigencia";

/**
 * Si la e.firma del cliente vence en ≤30 días, agrega aviso en campana + push.
 */
export default function PortalEfirmaRecordatorio() {
  const { cliente } = usePortalAuth();
  const { agregarNotificacion } = useClientes();
  const procesado = useRef(false);

  useEffect(() => {
    if (!cliente || procesado.current) return;
    procesado.current = true;

    void fetch("/api/portal/efirma-estado")
      .then((r) => r.json())
      .then((data) => {
        if (!data.tieneEfirma || !data.enVentanaAlerta) return;
        const periodo = getPeriodoFiscalVigente();
        agregarNotificacion({
          tipo: "efirma_vence_pronto",
          destinatario: "cliente",
          clienteId: cliente.id,
          periodo,
          titulo: `🔐 ${etiquetaDiasRestantes(data.diasRestantes)} · Tu e.firma`,
          detalle: `Caduca el ${data.vigenciaFinLabel}. Escríbenos y la renovamos a tiempo, sin sustos con el SAT.`,
          href: "/portal/inicio",
        });
      })
      .catch(() => {});
  }, [cliente, agregarNotificacion]);

  return null;
}
