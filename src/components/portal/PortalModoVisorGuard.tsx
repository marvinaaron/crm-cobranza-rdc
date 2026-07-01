"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Cliente } from "@/lib/clientes";
import {
  destinoPortalPrincipal,
  rutaPermitidaPortal,
} from "@/lib/config-portal-cliente";

type Props = {
  cliente: Cliente;
};

/** Redirige rutas bloqueadas cuando el cliente es solo Visor o asalariado anual. */
export default function PortalModoVisorGuard({ cliente }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/portal")) return;
    if (rutaPermitidaPortal(pathname, cliente)) return;
    router.replace(destinoPortalPrincipal(cliente));
  }, [pathname, cliente, router]);

  return null;
}
