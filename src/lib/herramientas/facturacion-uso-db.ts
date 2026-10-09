import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  evaluarUsoFacturacion,
  LIMITE_VISITANTE_ANONIMO,
  type EstadoUsoFacturacion,
} from "@/lib/herramientas/facturacion-uso";

type RowUso = {
  visitor_id: string;
  calculos: number;
  cuenta_verificada: boolean;
  es_pro: boolean;
};

async function leerFila(visitorId: string): Promise<RowUso | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("herramientas_facturacion_uso")
    .select("visitor_id, calculos, cuenta_verificada, es_pro")
    .eq("visitor_id", visitorId)
    .maybeSingle();
  if (error) {
    if (error.message.includes("does not exist")) return null;
    throw new Error(error.message);
  }
  return data as RowUso | null;
}

async function upsertFila(
  visitorId: string,
  patch: Partial<Pick<RowUso, "calculos" | "cuenta_verificada" | "es_pro">>
): Promise<RowUso> {
  const admin = getSupabaseAdmin();
  const existente = await leerFila(visitorId);
  const next = {
    visitor_id: visitorId,
    calculos: patch.calculos ?? existente?.calculos ?? 0,
    cuenta_verificada:
      patch.cuenta_verificada ?? existente?.cuenta_verificada ?? false,
    es_pro: patch.es_pro ?? existente?.es_pro ?? false,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await admin
    .from("herramientas_facturacion_uso")
    .upsert(next, { onConflict: "visitor_id" })
    .select("visitor_id, calculos, cuenta_verificada, es_pro")
    .single();
  if (error) throw new Error(error.message);
  return data as RowUso;
}

function estadoDesdeFila(visitorId: string, fila: RowUso): EstadoUsoFacturacion {
  const base = evaluarUsoFacturacion({
    calculos: fila.calculos,
    cuentaVerificada: fila.cuenta_verificada,
    esPro: fila.es_pro,
  });
  return { visitorId, ...base };
}

export function estadoVisitanteNuevo(visitorId: string): EstadoUsoFacturacion {
  return {
    visitorId,
    calculosUsados: 0,
    cuentaVerificada: false,
    esPro: false,
    limite: LIMITE_VISITANTE_ANONIMO,
    restantes: LIMITE_VISITANTE_ANONIMO,
    puedeCalcular: true,
    requiereCuenta: false,
    requierePago: false,
  };
}

export async function obtenerEstadoUso(
  visitorId: string
): Promise<EstadoUsoFacturacion> {
  try {
    const fila = await leerFila(visitorId);
    if (!fila) return estadoVisitanteNuevo(visitorId);
    return estadoDesdeFila(visitorId, fila);
  } catch {
    return estadoVisitanteNuevo(visitorId);
  }
}

export async function registrarCalculo(
  visitorId: string
): Promise<EstadoUsoFacturacion> {
  try {
    const fila = await leerFila(visitorId);
    const calculos = (fila?.calculos ?? 0) + 1;
    const actualizada = await upsertFila(visitorId, { calculos });
    return estadoDesdeFila(visitorId, actualizada);
  } catch {
    const estado = estadoVisitanteNuevo(visitorId);
    return {
      ...estado,
      calculosUsados: 1,
      restantes: Math.max(0, estado.limite - 1),
      puedeCalcular: estado.limite > 1,
    };
  }
}
