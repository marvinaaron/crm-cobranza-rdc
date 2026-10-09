import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  type CalculadoraId,
  evaluarUsoCalculadora,
  type EstadoUsoCalculadora,
  LIMITE_CALCULADORA,
} from "@/lib/herramientas/uso-calculadora";

type ContadoresLocal = Partial<Record<CalculadoraId, number>>;

async function leerDb(
  visitorId: string,
  herramienta: CalculadoraId
): Promise<number | null> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("herramientas_calculadora_uso")
      .select("calculos")
      .eq("visitor_id", visitorId)
      .eq("herramienta_id", herramienta)
      .maybeSingle();
    if (error) {
      if (error.message.includes("does not exist")) return null;
      throw new Error(error.message);
    }
    return data?.calculos ?? 0;
  } catch {
    return null;
  }
}

async function escribirDb(
  visitorId: string,
  herramienta: CalculadoraId,
  calculos: number
): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("herramientas_calculadora_uso").upsert(
      {
        visitor_id: visitorId,
        herramienta_id: herramienta,
        calculos,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "visitor_id,herramienta_id" }
    );
    if (error) {
      if (error.message.includes("does not exist")) return false;
      throw new Error(error.message);
    }
    return true;
  } catch {
    return false;
  }
}

export function parseContadoresLocal(raw: string | undefined): ContadoresLocal {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ContadoresLocal;
  } catch {
    return {};
  }
}

export function serializarContadoresLocal(data: ContadoresLocal): string {
  return JSON.stringify(data);
}

export async function obtenerEstadoCalculadora(
  visitorId: string,
  herramienta: CalculadoraId,
  esPro: boolean,
  contadoresLocal?: ContadoresLocal
): Promise<EstadoUsoCalculadora> {
  const desdeDb = await leerDb(visitorId, herramienta);
  const calculos =
    desdeDb ??
    contadoresLocal?.[herramienta] ??
    0;
  return evaluarUsoCalculadora(herramienta, visitorId, calculos, esPro);
}

export async function registrarCalculoCalculadora(
  visitorId: string,
  herramienta: CalculadoraId,
  esPro: boolean,
  contadoresLocal?: ContadoresLocal
): Promise<{
  estado: EstadoUsoCalculadora;
  contadoresLocal: ContadoresLocal;
}> {
  const actual = await obtenerEstadoCalculadora(
    visitorId,
    herramienta,
    esPro,
    contadoresLocal
  );
  if (!actual.puedeCalcular) {
    return { estado: actual, contadoresLocal: contadoresLocal ?? {} };
  }

  const nextCount = actual.calculosUsados + 1;
  const okDb = await escribirDb(visitorId, herramienta, nextCount);
  const local: ContadoresLocal = { ...(contadoresLocal ?? {}) };
  if (!okDb) {
    local[herramienta] = nextCount;
  }

  return {
    estado: evaluarUsoCalculadora(herramienta, visitorId, nextCount, esPro),
    contadoresLocal: local,
  };
}

export function estadoInicialCalculadora(
  visitorId: string,
  herramienta: CalculadoraId
): EstadoUsoCalculadora {
  return evaluarUsoCalculadora(herramienta, visitorId, 0, false);
}

export { LIMITE_CALCULADORA };
