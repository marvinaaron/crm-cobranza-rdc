import { type Cliente, esIngresoGeneralCliente } from "@/lib/clientes";

export type CredencialPortal = {
  clienteId: number;
  usuario: string;
  claveHash: string;
  /** Debe elegir contraseña personal al siguiente acceso. */
  debeCambiarClave: boolean;
  /** Generada por recuperación; mensaje distinto en pantalla de cambio. */
  esClaveTemporal?: boolean;
};

export type PortalSession = {
  clienteId: number;
  iniciadaEn: string;
};

export type ResultadoLoginPortal =
  | { ok: false }
  | { ok: true; clienteId: number; requiereCambioClave: boolean };

const CRED_STORAGE_KEY = "rdc-portal-credenciales-v2";
const SESSION_STORAGE_KEY = "rdc-portal-session";

export function hashClavePortal(clave: string): string {
  const normalized = clave.normalize("NFC");
  let h = 0;
  for (let i = 0; i < normalized.length; i++) {
    h = (h << 5) - h + normalized.charCodeAt(i);
    h |= 0;
  }
  return `rdc-${h.toString(36)}`;
}

export function usuarioPortalSugerido(cliente: Cliente): string {
  return cliente.rfc.trim().toLowerCase();
}

export function clavePortalDefault(cliente: Cliente): string {
  return `rdc${cliente.id}`;
}

function normalizarCredencial(raw: CredencialPortal): CredencialPortal {
  return {
    ...raw,
    debeCambiarClave: raw.debeCambiarClave ?? true,
    esClaveTemporal: raw.esClaveTemporal ?? false,
  };
}

function migrarDesdeV1(): CredencialPortal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("rdc-portal-credenciales-v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{
      clienteId: number;
      usuario: string;
      claveHash: string;
    }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c) =>
      normalizarCredencial({
        ...c,
        debeCambiarClave: true,
        esClaveTemporal: false,
      })
    );
  } catch {
    return [];
  }
}

export function loadCredencialesPortal(): CredencialPortal[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(CRED_STORAGE_KEY);
    if (!raw) {
      const migrados = migrarDesdeV1();
      if (migrados.length) {
        saveCredencialesPortal(migrados);
        return migrados;
      }
      return [];
    }
    const parsed = JSON.parse(raw) as CredencialPortal[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizarCredencial);
  } catch {
    return [];
  }
}

export function saveCredencialesPortal(lista: CredencialPortal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CRED_STORAGE_KEY, JSON.stringify(lista));
}

export function getCredencialPortal(clienteId: number): CredencialPortal | undefined {
  return loadCredencialesPortal().find((c) => c.clienteId === clienteId);
}

export function clienteRequiereCambioClave(clienteId: number): boolean {
  const cred = getCredencialPortal(clienteId);
  if (!cred) return true;
  return cred.debeCambiarClave;
}

export function guardarCredencialPortal(
  clienteId: number,
  usuario: string,
  clavePlana?: string,
  opts?: { debeCambiarClave?: boolean; esClaveTemporal?: boolean }
): void {
  const usuarioNorm = usuario.trim().toLowerCase();
  const prev = getCredencialPortal(clienteId);
  const claveHash =
    clavePlana?.trim()
      ? hashClavePortal(clavePlana)
      : prev?.claveHash ?? hashClavePortal(`rdc${clienteId}`);

  const debeCambiarClave =
    opts?.debeCambiarClave ??
    (clavePlana ? true : prev?.debeCambiarClave ?? true);

  const lista = loadCredencialesPortal().filter((c) => c.clienteId !== clienteId);
  lista.push({
    clienteId,
    usuario: usuarioNorm,
    claveHash,
    debeCambiarClave,
    esClaveTemporal: opts?.esClaveTemporal ?? false,
  });
  saveCredencialesPortal(lista);
}

export function establecerClavePersonalizada(
  clienteId: number,
  nuevaClave: string
): void {
  const cred = getCredencialPortal(clienteId);
  if (!cred) return;
  const lista = loadCredencialesPortal().filter((c) => c.clienteId !== clienteId);
  lista.push({
    ...cred,
    claveHash: hashClavePortal(nuevaClave),
    debeCambiarClave: false,
    esClaveTemporal: false,
  });
  saveCredencialesPortal(lista);
}

export function generarClaveTemporal(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function asignarClaveTemporal(clienteId: number): {
  clavePlana: string;
  usuario: string;
} {
  const cred = getCredencialPortal(clienteId);
  const usuario = cred?.usuario ?? `cliente${clienteId}`;
  const clavePlana = generarClaveTemporal();
  guardarCredencialPortal(clienteId, usuario, clavePlana, {
    debeCambiarClave: true,
    esClaveTemporal: true,
  });
  return { clavePlana, usuario };
}

export function asegurarCredencialPortal(cliente: Cliente): CredencialPortal {
  const existente = getCredencialPortal(cliente.id);
  if (existente) return existente;
  const usuario = usuarioPortalSugerido(cliente);
  const clave = clavePortalDefault(cliente);
  guardarCredencialPortal(cliente.id, usuario, clave, {
    debeCambiarClave: true,
    esClaveTemporal: false,
  });
  return getCredencialPortal(cliente.id)!;
}

export function sincronizarCredencialesPortal(clientes: Cliente[]): void {
  clientes
    .filter((c) => c.activo && !esIngresoGeneralCliente(c))
    .forEach(asegurarCredencialPortal);
}

export function buscarClientePorUsuarioPortal(
  usuario: string,
  clientes: Cliente[]
): Cliente | null {
  const usuarioNorm = usuario.trim().toLowerCase();
  const cred = loadCredencialesPortal().find((c) => c.usuario === usuarioNorm);
  if (cred) {
    const c = clientes.find(
      (x) => x.id === cred.clienteId && x.activo && !esIngresoGeneralCliente(x)
    );
    if (c) return c;
  }
  return (
    clientes.find(
      (c) =>
        c.activo &&
        !esIngresoGeneralCliente(c) &&
        usuarioPortalSugerido(c) === usuarioNorm
    ) ?? null
  );
}

export function validarLoginPortal(
  usuario: string,
  clave: string,
  clientes: Cliente[]
): ResultadoLoginPortal {
  const usuarioNorm = usuario.trim().toLowerCase();
  const hash = hashClavePortal(clave);
  const cred = loadCredencialesPortal().find(
    (c) => c.usuario === usuarioNorm && c.claveHash === hash
  );
  if (!cred) return { ok: false };
  const cliente = clientes.find(
    (c) => c.id === cred.clienteId && c.activo && !esIngresoGeneralCliente(c)
  );
  if (!cliente) return { ok: false };
  return {
    ok: true,
    clienteId: cliente.id,
    requiereCambioClave: cred.debeCambiarClave,
  };
}

export function validarNuevaClave(nueva: string, confirmar: string): string | null {
  if (nueva.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (nueva !== confirmar) {
    return "Las contraseñas no coinciden.";
  }
  return null;
}

export function loadPortalSession(): PortalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PortalSession;
    if (!parsed?.clienteId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePortalSession(session: PortalSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearPortalSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function crearPortalSession(clienteId: number): PortalSession {
  const session: PortalSession = {
    clienteId,
    iniciadaEn: new Date().toISOString(),
  };
  savePortalSession(session);
  return session;
}

export function getPortalLoginUrl(baseUrl?: string): string {
  const base =
    baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/portal/login`;
}
