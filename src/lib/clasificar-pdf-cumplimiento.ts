/** Adivina tipo, mes (0–11) y año a partir del nombre del PDF. */

const MESES_NOMBRE: Array<{ re: RegExp; mes: number }> = [
  { re: /\b(ene(?:ro)?|jan(?:uary)?)\b/i, mes: 0 },
  { re: /\b(feb(?:rero)?|february)\b/i, mes: 1 },
  { re: /\b(mar(?:zo)?|march)\b/i, mes: 2 },
  { re: /\b(abr(?:il)?|apr(?:il)?)\b/i, mes: 3 },
  { re: /\b(may(?:o)?)\b/i, mes: 4 },
  { re: /\b(jun(?:io)?|june)\b/i, mes: 5 },
  { re: /\b(jul(?:io)?|july)\b/i, mes: 6 },
  { re: /\b(ago(?:sto)?|aug(?:ust)?)\b/i, mes: 7 },
  { re: /\b(sep(?:tiembre|t)?|september)\b/i, mes: 8 },
  { re: /\b(oct(?:ubre)?|october)\b/i, mes: 9 },
  { re: /\b(nov(?:iembre)?|november)\b/i, mes: 10 },
  { re: /\b(dic(?:iembre)?|dec(?:ember)?)\b/i, mes: 11 },
];

export type DestinoPdfAdivinado = {
  tipoId: string | null;
  mes: number | null;
  anio: number | null;
};

function nombreBase(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^.*[/\\]/, "")
    .replace(/\.[Pp][Dd][Ff]$/i, "");
}

export function adivinarMesDeNombre(nombre: string): number | null {
  const n = nombreBase(nombre);
  const leading = n.match(/^(0[1-9]|1[0-2])(?=[^0-9]|$)/);
  if (leading) return Number(leading[1]) - 1;
  const iso = n.match(/\b(20\d{2})[-_./ ](0[1-9]|1[0-2])\b/);
  if (iso) return Number(iso[2]) - 1;
  const isoInv = n.match(/\b(0[1-9]|1[0-2])[-_./ ](20\d{2})\b/);
  if (isoInv) return Number(isoInv[1]) - 1;
  for (const { re, mes } of MESES_NOMBRE) {
    if (re.test(n)) return mes;
  }
  return null;
}

export function adivinarAnioDeNombre(nombre: string): number | null {
  const n = nombreBase(nombre);
  const years = [...n.matchAll(/(?:^|[^0-9])(20\d{2})(?![0-9])/g)].map((m) =>
    Number(m[1])
  );
  if (!years.length) return null;
  return years[years.length - 1] ?? null;
}

export function adivinarTipoDeNombre(nombre: string): string | null {
  const n = nombreBase(nombre).toLowerCase();
  if (/\bicsoe\b/.test(n)) return "icsoe";
  if (/\bsisub\b/.test(n)) return "sisub";
  if (/\bsipare\b/.test(n)) return "sipare";
  if (/\bema\b/.test(n)) return "ema";
  if (/\beba\b/.test(n)) return "eba";
  if (/\bnomina\b/.test(n)) return "nomina";
  if (/impuestos|linea\s*de\s*captura|\bcaptura\b|\bdpa\b|pago referenciado/.test(n)) {
    return "impuestos";
  }
  if (/declaraci|\bacuse\b/.test(n)) return "declaracion";
  if (/\bestatal/.test(n) || /\bisn\b/.test(n)) return "estatales";
  return null;
}

export function adivinarDestinoPdf(nombre: string): DestinoPdfAdivinado {
  return {
    tipoId: adivinarTipoDeNombre(nombre),
    mes: adivinarMesDeNombre(nombre),
    anio: adivinarAnioDeNombre(nombre),
  };
}
