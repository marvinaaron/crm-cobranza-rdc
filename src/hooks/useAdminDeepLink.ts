"use client";

import { useEffect, useRef } from "react";
import type { Cliente } from "@/lib/clientes";

type Opciones = {
  listaClientes: Cliente[];
  onCliente?: (cliente: Cliente) => void;
  onFiltro?: (filtro: string) => void;
  /** Si `revisar=1` en la URL, se invoca tras seleccionar el cliente. */
  onRevisarCliente?: (cliente: Cliente) => void;
  filtrosValidos?: string[];
};

/**
 * Lee `?cliente=&filtro=&revisar=` una vez al cargar la página admin.
 * Útil para enlaces desde notificaciones push y atajos PWA.
 */
export function useAdminDeepLink({
  listaClientes,
  onCliente,
  onFiltro,
  onRevisarCliente,
  filtrosValidos,
}: Opciones) {
  const aplicado = useRef(false);

  useEffect(() => {
    if (aplicado.current || typeof window === "undefined") return;
    if (listaClientes.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const tieneParams =
      params.has("cliente") || params.has("filtro") || params.has("revisar");
    if (!tieneParams) return;

    aplicado.current = true;

    const filtro = params.get("filtro");
    if (filtro && onFiltro) {
      if (!filtrosValidos || filtrosValidos.includes(filtro)) {
        onFiltro(filtro);
      }
    }

    const idRaw = params.get("cliente");
    if (idRaw && onCliente) {
      const id = Number(idRaw);
      const cliente = listaClientes.find((c) => c.id === id);
      if (cliente) {
        onCliente(cliente);
        if (params.get("revisar") === "1" && onRevisarCliente) {
          onRevisarCliente(cliente);
        }
      }
    }

    // Limpia la barra de dirección sin recargar (evita re-aplicar al navegar).
    const limpio = window.location.pathname;
    window.history.replaceState(null, "", limpio);
  }, [listaClientes, onCliente, onFiltro, onRevisarCliente, filtrosValidos]);
}
