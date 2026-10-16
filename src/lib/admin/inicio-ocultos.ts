const KEY = "rdc.admin.inicio.pasosOcultos";

export function leerPasosOcultosInicio(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function guardarPasosOcultosInicio(claves: string[]): string[] {
  const next = Array.from(new Set(claves));
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function ocultarPasoInicio(clave: string): string[] {
  return guardarPasosOcultosInicio([...leerPasosOcultosInicio(), clave]);
}

export function mostrarPasosInicio(): string[] {
  return guardarPasosOcultosInicio([]);
}

/** Quita claves que ya no existen en la cola viva (el vencimiento se resolvió). */
export function podarPasosOcultosInicio(clavesVivas: string[]): string[] {
  const vivos = new Set(clavesVivas);
  return guardarPasosOcultosInicio(
    leerPasosOcultosInicio().filter((c) => vivos.has(c))
  );
}
