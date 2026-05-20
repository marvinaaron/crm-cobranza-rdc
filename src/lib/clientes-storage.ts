import {
  type Cliente,
  CLIENTES_INICIALES,
  asegurarClienteIngresosDiversos,
} from "@/lib/clientes";
import { normalizarConfigCumplimiento } from "@/lib/config-cumplimiento-cliente";

const STORAGE_KEY = "rdc-clientes-v1";

function normalizarCliente(c: Cliente): Cliente {
  return {
    ...c,
    configCumplimiento: normalizarConfigCumplimiento(c.configCumplimiento),
  };
}

export function loadClientes(): Cliente[] {
  if (typeof window === "undefined") {
    return asegurarClienteIngresosDiversos(CLIENTES_INICIALES).map(normalizarCliente);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return asegurarClienteIngresosDiversos(CLIENTES_INICIALES).map(normalizarCliente);
    }
    const parsed = JSON.parse(raw) as Cliente[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return asegurarClienteIngresosDiversos(CLIENTES_INICIALES).map(normalizarCliente);
    }
    return asegurarClienteIngresosDiversos(parsed).map(normalizarCliente);
  } catch {
    return asegurarClienteIngresosDiversos(CLIENTES_INICIALES).map(normalizarCliente);
  }
}

export function saveClientes(lista: Cliente[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export const CLIENTES_STORAGE_KEY = STORAGE_KEY;
