const STORAGE_KEY = "rdc-stripe-sesiones-procesadas-v1";

function leer(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function guardar(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(-200)));
}

export function sesionStripeYaProcesada(sessionId: string): boolean {
  return leer().includes(sessionId);
}

export function marcarSesionStripeProcesada(sessionId: string) {
  const ids = leer();
  if (ids.includes(sessionId)) return;
  guardar([...ids, sessionId]);
}
