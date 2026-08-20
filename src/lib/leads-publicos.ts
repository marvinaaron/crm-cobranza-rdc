/**
 * Validación anti-spam de prospectos públicos (/empezar).
 * El formulario también puede usarla para mensajes de error amables;
 * la fuente de verdad es el POST del API.
 */

const VOCALES = /[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/;
const SOLO_LETRAS_NOMBRE =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ.'' -]*$/;
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LIMITES_LEAD = {
  nombreMin: 3,
  nombreMax: 80,
  mensajeMin: 12,
  mensajeMax: 800,
  segundosMinimos: 4,
  segundosMaximos: 60 * 60 * 2,
  porIpPorHora: 5,
} as const;

export type LeadPublicoValidado = {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  fuente: string;
};

export type ResultadoLead =
  | { ok: true; data: LeadPublicoValidado }
  | { ok: false; error: string };

function cambiosDeCaja(s: string): number {
  let n = 0;
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1];
    const b = s[i];
    if (/[A-ZÁÉÍÓÚÜÑ]/.test(a) !== /[A-ZÁÉÍÓÚÜÑ]/.test(b) && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(a) && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(b)) {
      n += 1;
    }
  }
  return n;
}

/** Cadena tipo bot: SYvwCpRPYdEFumcMlFxCBH */
export function pareceTextoAleatorio(s: string): boolean {
  const compacto = s.replace(/\s+/g, "");
  if (compacto.length < 10) return false;
  if (!/^[A-Za-z0-9]+$/.test(compacto)) return false;
  if (!VOCALES.test(compacto)) return true;
  return cambiosDeCaja(compacto) >= 4;
}

function nombreHumano(nombre: string): boolean {
  if (!SOLO_LETRAS_NOMBRE.test(nombre)) return false;
  if (pareceTextoAleatorio(nombre)) return false;
  const palabras = nombre.split(/\s+/).filter(Boolean);
  if (palabras.length < 1) return false;
  if (palabras.some((p) => p.length < 2 || !VOCALES.test(p))) return false;
  return true;
}

export function correoLeadInvalido(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!RE_CORREO.test(e)) return true;
  const [local, dominio] = e.split("@");
  if (!local || !dominio) return true;
  if (dominio === "gmail.com" || dominio === "googlemail.com") {
    const puntos = (local.match(/\./g) ?? []).length;
    // Gmail ignora puntos: isa.c.ot.og.u79@gmail.com es un truco de bots.
    if (puntos >= 3) return true;
  }
  return false;
}

function telefonoBasura(digitos: string): boolean {
  if (digitos.length !== 10) return true;
  if (/^(\d)\1{9}$/.test(digitos)) return true;
  if (digitos === "1234567890" || digitos === "0123456789") return true;
  return false;
}

export type CuerpoLeadCrudo = {
  nombre?: unknown;
  email?: unknown;
  telefono?: unknown;
  mensaje?: unknown;
  fuente?: unknown;
  aceptaPrivacidad?: unknown;
  web?: unknown;
  iniciadoEn?: unknown;
};

export function validarLeadPublico(raw: CuerpoLeadCrudo): ResultadoLead {
  if (typeof raw.web === "string" && raw.web.trim() !== "") {
    return { ok: false, error: "honeypot" };
  }

  if (raw.aceptaPrivacidad !== true) {
    return { ok: false, error: "Debes aceptar el aviso de privacidad." };
  }

  const nombre = typeof raw.nombre === "string" ? raw.nombre.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const telefonoRaw = typeof raw.telefono === "string" ? raw.telefono.trim() : "";
  const mensaje = typeof raw.mensaje === "string" ? raw.mensaje.trim() : "";
  const fuente =
    typeof raw.fuente === "string" && raw.fuente.trim()
      ? raw.fuente.trim().slice(0, 40)
      : "empezar";

  if (nombre.length < LIMITES_LEAD.nombreMin) {
    return { ok: false, error: "Indica tu nombre completo." };
  }
  if (nombre.length > LIMITES_LEAD.nombreMax) {
    return { ok: false, error: "El nombre es demasiado largo." };
  }
  if (!nombreHumano(nombre)) {
    return {
      ok: false,
      error: "Usa tu nombre real (letras y, si puedes, apellido).",
    };
  }

  if (correoLeadInvalido(email)) {
    if (!RE_CORREO.test(email)) {
      return { ok: false, error: "Correo electrónico inválido." };
    }
    return { ok: false, error: "Usa un correo válido, sin puntos de más." };
  }

  if (mensaje.length < LIMITES_LEAD.mensajeMin) {
    return {
      ok: false,
      error: "Cuéntanos un poco más: régimen, si ya tienes contador, etc.",
    };
  }
  if (mensaje.length > LIMITES_LEAD.mensajeMax) {
    return { ok: false, error: "El mensaje es demasiado largo." };
  }
  if (mensaje.split(/\s+/).filter(Boolean).length < 2 || pareceTextoAleatorio(mensaje)) {
    return {
      ok: false,
      error: "Escribe con tus palabras en qué te podemos ayudar.",
    };
  }

  const telefono = telefonoRaw.replace(/\D/g, "");
  if (telefono) {
    if (telefonoBasura(telefono)) {
      return {
        ok: false,
        error: "Teléfono inválido: usa 10 dígitos o omítelo.",
      };
    }
  }

  if (typeof raw.iniciadoEn !== "number" || !Number.isFinite(raw.iniciadoEn)) {
    return { ok: false, error: "honeypot" };
  }
  const segundos = (Date.now() - raw.iniciadoEn) / 1000;
  if (segundos < LIMITES_LEAD.segundosMinimos) {
    return { ok: false, error: "honeypot" };
  }
  if (segundos > LIMITES_LEAD.segundosMaximos) {
    return {
      ok: false,
      error: "La sesión del formulario caducó. Recarga e intenta de nuevo.",
    };
  }

  return {
    ok: true,
    data: {
      nombre,
      email,
      telefono: telefono || undefined,
      mensaje,
      fuente,
    },
  };
}

const enviosPorIp = new Map<string, number[]>();

export function ipDeRequest(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** true si este IP ya superó el cupo de la hora. */
export function ipExcedioLimite(ip: string): boolean {
  const ahora = Date.now();
  const ventana = 60 * 60 * 1000;
  const prev = (enviosPorIp.get(ip) ?? []).filter((t) => ahora - t < ventana);
  if (prev.length >= LIMITES_LEAD.porIpPorHora) {
    enviosPorIp.set(ip, prev);
    return true;
  }
  prev.push(ahora);
  enviosPorIp.set(ip, prev);
  return false;
}
