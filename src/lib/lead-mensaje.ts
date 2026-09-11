/**
 * Separa el texto libre del prospecto de los bloques automáticos
 * (perfil, paquete, autocalificación) para mostrar lo que realmente escribió.
 */

export type MensajeLeadPartido = {
  libre: string;
  perfil: string[];
  servicios: string[];
  autocalificacion: string[];
};

function bullets(bloque: string): string[] {
  return bloque
    .split("\n")
    .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
    .filter(Boolean);
}

export function partirMensajeLead(mensaje: string | null | undefined): MensajeLeadPartido {
  const raw = (mensaje ?? "").trim();
  if (!raw) {
    return { libre: "", perfil: [], servicios: [], autocalificacion: [] };
  }

  let resto = raw;
  let perfil: string[] = [];
  let servicios: string[] = [];
  let autocalificacion: string[] = [];

  const auto = resto.split(/\n+— Autocalificación[^\n]*:\n?/i);
  if (auto.length > 1) {
    resto = auto[0].trim();
    autocalificacion = bullets(auto.slice(1).join("\n"));
  }

  const mPerfil = resto.match(/Perfil:\s*\n([\s\S]*?)(?=\n\nMe interesa cotizar:|\n\n|$)/i);
  if (mPerfil) {
    perfil = bullets(mPerfil[1]);
    resto = (resto.slice(0, mPerfil.index) + resto.slice((mPerfil.index ?? 0) + mPerfil[0].length)).trim();
  }

  const mServ = resto.match(/Me interesa cotizar:\s*\n([\s\S]*?)(?=\n\n|$)/i);
  if (mServ) {
    servicios = bullets(mServ[1]);
    resto = (resto.slice(0, mServ.index) + resto.slice((mServ.index ?? 0) + mServ[0].length)).trim();
  }

  return {
    libre: resto.trim(),
    perfil,
    servicios,
    autocalificacion,
  };
}
