"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CalculadoraId,
  EstadoUsoCalculadora,
} from "@/lib/herramientas/uso-calculadora";

export function useUsoCalculadora(herramienta: CalculadoraId) {
  const [uso, setUso] = useState<EstadoUsoCalculadora | null>(null);

  const cargarUso = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/herramientas/uso?herramienta=${encodeURIComponent(herramienta)}`
      );
      if (res.ok) setUso((await res.json()) as EstadoUsoCalculadora);
    } catch {
      /* silencioso */
    }
  }, [herramienta]);

  useEffect(() => {
    void cargarUso();
  }, [cargarUso]);

  /** Registra un intento antes de calcular. Devuelve false si bloqueado. */
  const consumirIntento = useCallback(async (): Promise<{
    ok: boolean;
    uso?: EstadoUsoCalculadora;
  }> => {
    try {
      const res = await fetch("/api/herramientas/uso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ herramienta }),
      });
      const data = (await res.json()) as {
        uso?: EstadoUsoCalculadora;
        bloqueado?: boolean;
      };
      if (data.uso) setUso(data.uso);
      if (res.status === 402 || data.bloqueado) {
        return { ok: false, uso: data.uso };
      }
      if (!res.ok) return { ok: false, uso: data.uso };
      return { ok: true, uso: data.uso };
    } catch {
      return { ok: true };
    }
  }, [herramienta]);

  return { uso, cargarUso, consumirIntento };
}
