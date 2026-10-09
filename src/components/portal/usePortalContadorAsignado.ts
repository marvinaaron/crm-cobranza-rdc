"use client";

import { useEffect, useState } from "react";
import type { ContadorAsignadoPortal } from "@/app/api/portal/contador-asignado/route";

/**
 * Hook compartido que carga (una vez por sesión) los datos del contador
 * asignado del despacho. Cachea el resultado en memoria de módulo para
 * no repetir el fetch entre componentes del mismo render.
 */
let cache: ContadorAsignadoPortal | null | undefined = undefined;
let inflight: Promise<ContadorAsignadoPortal | null> | null = null;

async function cargar(): Promise<ContadorAsignadoPortal | null> {
  if (cache !== undefined) return cache;
  if (inflight) return inflight;
  inflight = fetch("/api/portal/contador-asignado", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { contador: null }))
    .then((d) => (d.contador as ContadorAsignadoPortal | null) ?? null)
    .catch(() => null)
    .then((v) => {
      cache = v;
      inflight = null;
      return v;
    });
  return inflight;
}

export function usePortalContadorAsignado(): {
  contador: ContadorAsignadoPortal | null;
  cargando: boolean;
} {
  const [contador, setContador] = useState<ContadorAsignadoPortal | null>(
    cache ?? null
  );
  const [cargando, setCargando] = useState<boolean>(cache === undefined);

  useEffect(() => {
    if (cache !== undefined) {
      setContador(cache);
      setCargando(false);
      return;
    }
    let activo = true;
    void cargar().then((v) => {
      if (!activo) return;
      setContador(v);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  return { contador, cargando };
}
