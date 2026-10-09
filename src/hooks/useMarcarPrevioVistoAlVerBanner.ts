"use client";

import { useEffect } from "react";
import { type Periodo } from "@/lib/clientes";
import {
  previewPublicado,
  clienteConfirmoPreview,
  type RegistroCumplimiento,
} from "@/lib/cumplimiento";
import { useClientes } from "@/context/ClientesContext";

/**
 * Marca el previo como "visto" en cuanto el cliente ve un banner/card
 * con el preliminar publicado (Inicio o Declaraciones). No pide aceptación.
 */
export function useMarcarPrevioVistoAlVerBanner(
  clienteId: number,
  periodo: Periodo,
  registro: RegistroCumplimiento | undefined,
  /** Solo marcar si el banner de preliminar está visible / aplica. */
  bannerVisible: boolean
) {
  const { confirmarPreviewCliente } = useClientes();
  const hayPreview = previewPublicado(registro);
  const yaVisto = clienteConfirmoPreview(registro);

  useEffect(() => {
    if (!bannerVisible || !hayPreview || yaVisto || !registro) return;
    confirmarPreviewCliente(clienteId, periodo);
  }, [
    bannerVisible,
    hayPreview,
    yaVisto,
    registro,
    clienteId,
    periodo,
    confirmarPreviewCliente,
  ]);
}
