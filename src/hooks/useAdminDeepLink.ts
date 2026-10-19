"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Cliente, Periodo } from "@/lib/clientes";

type Opciones = {
  listaClientes: Cliente[];
  onCliente?: (cliente: Cliente) => void;
  onPeriodo?: (periodo: Periodo) => void;
  onFiltro?: (filtro: string) => void;
  /** Si `revisar=1` en la URL, se invoca tras seleccionar el cliente. */
  onRevisarCliente?: (cliente: Cliente) => void;
  /** `accion=pago` u otras acciones directas desde la bandeja. */
  onAccion?: (accion: string, cliente: Cliente) => void;
  /** `encargo=<id>` abre el detalle del encargo. */
  onEncargo?: (encargoId: string, cliente?: Cliente) => void;
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
  onPeriodo,
  onFiltro,
  onRevisarCliente,
  onAccion,
  onEncargo,
  filtrosValidos,
}: Opciones) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ultimaClave = useRef<string | null>(null);

  const clienteParam = searchParams.get("cliente");
  const filtroParam = searchParams.get("filtro");
  const revisarParam = searchParams.get("revisar");
  const accionParam = searchParams.get("accion");
  const encargoParam = searchParams.get("encargo");
  const mesParam = searchParams.get("mes");
  const anioParam = searchParams.get("anio");

  useEffect(() => {
    if (
      !clienteParam &&
      !filtroParam &&
      !revisarParam &&
      !accionParam &&
      !encargoParam &&
      !mesParam &&
      !anioParam
    ) {
      ultimaClave.current = null;
      return;
    }

    const clave = `${clienteParam ?? ""}|${filtroParam ?? ""}|${revisarParam ?? ""}|${accionParam ?? ""}|${encargoParam ?? ""}|${mesParam ?? ""}|${anioParam ?? ""}`;
    if (ultimaClave.current === clave) return;

    if (clienteParam && listaClientes.length === 0) return;

    ultimaClave.current = clave;

    if (onPeriodo && mesParam && anioParam) {
      const mesCal = Number(mesParam);
      const anio = Number(anioParam);
      if (
        Number.isInteger(mesCal) &&
        mesCal >= 1 &&
        mesCal <= 12 &&
        Number.isInteger(anio) &&
        anio >= 2000 &&
        anio <= 2100
      ) {
        onPeriodo({ mes: mesCal - 1, anio });
      }
    }

    if (filtroParam && onFiltro) {
      if (!filtrosValidos || filtrosValidos.includes(filtroParam)) {
        onFiltro(filtroParam);
      }
    }

    let cliente: Cliente | undefined;
    if (clienteParam) {
      const id = Number(clienteParam);
      cliente = listaClientes.find((c) => c.id === id);
    }

    if (cliente && onCliente) {
      onCliente(cliente);
      if (revisarParam === "1" && onRevisarCliente) {
        onRevisarCliente(cliente);
      }
      if (accionParam && onAccion) {
        onAccion(accionParam, cliente);
      }
    }

    if (encargoParam && onEncargo) {
      onEncargo(encargoParam, cliente);
    }

    router.replace(pathname, { scroll: false });
  }, [
    clienteParam,
    filtroParam,
    revisarParam,
    accionParam,
    encargoParam,
    mesParam,
    anioParam,
    listaClientes,
    onCliente,
    onPeriodo,
    onFiltro,
    onRevisarCliente,
    onAccion,
    onEncargo,
    filtrosValidos,
    router,
    pathname,
  ]);
}
