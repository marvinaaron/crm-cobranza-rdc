"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
 * Lee `?cliente=&filtro=&revisar=` para abrir directamente un cliente desde
 * enlaces de notificaciones (push del sistema o campana dentro del CRM) y
 * atajos PWA.
 *
 * Reacciona a cambios en los parámetros (vía `useSearchParams`), así funciona
 * tanto al entrar desde cero como cuando ya estás en la página y haces clic en
 * una notificación de la campana (navegación suave de Next, sin recargar).
 */
export function useAdminDeepLink({
  listaClientes,
  onCliente,
  onFiltro,
  onRevisarCliente,
  filtrosValidos,
}: Opciones) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Última combinación de params ya aplicada, para no repetir la acción.
  const ultimaClave = useRef<string | null>(null);

  const clienteParam = searchParams.get("cliente");
  const filtroParam = searchParams.get("filtro");
  const revisarParam = searchParams.get("revisar");

  useEffect(() => {
    if (!clienteParam && !filtroParam && !revisarParam) {
      // URL ya limpia: permitimos volver a aplicar si llega otra notificación.
      ultimaClave.current = null;
      return;
    }

    const clave = `${clienteParam ?? ""}|${filtroParam ?? ""}|${revisarParam ?? ""}`;
    if (ultimaClave.current === clave) return;

    // El cliente debe existir ya en la lista para poder abrirlo.
    if (clienteParam && listaClientes.length === 0) return;

    ultimaClave.current = clave;

    if (filtroParam && onFiltro) {
      if (!filtrosValidos || filtrosValidos.includes(filtroParam)) {
        onFiltro(filtroParam);
      }
    }

    if (clienteParam && onCliente) {
      const id = Number(clienteParam);
      const cliente = listaClientes.find((c) => c.id === id);
      if (cliente) {
        onCliente(cliente);
        if (revisarParam === "1" && onRevisarCliente) {
          onRevisarCliente(cliente);
        }
      }
    }

    // Limpia los parámetros (oculta el id del cliente y evita re-aplicar al
    // navegar). Usamos el router de Next para no desincronizar useSearchParams.
    router.replace(pathname, { scroll: false });
  }, [
    clienteParam,
    filtroParam,
    revisarParam,
    listaClientes,
    onCliente,
    onFiltro,
    onRevisarCliente,
    filtrosValidos,
    router,
    pathname,
  ]);
}
