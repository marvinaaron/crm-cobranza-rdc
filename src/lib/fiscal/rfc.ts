/**
 * Calculadora de RFC para personas físicas con homoclave + dígito
 * verificador.
 *
 * Basado en el algoritmo público del SAT publicado en "Instructivo
 * técnico para el cálculo del RFC" (Anexo 4 RMF / manuales 1995-2008).
 *
 * IMPORTANTE: el algoritmo es de referencia. La autoridad fiscal puede
 * emitir un RFC con homoclave distinta. Para validación oficial use la
 * Constancia de Situación Fiscal del SAT.
 */

// ─── Limpieza de cadenas ───────────────────────────────────────────

/** Quita acentos, diéresis y normaliza Ñ→Ñ (no la convertimos a N). */
function quitarAcentos(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u00C0-\u00C5\u00C0-\u00C5]/g, "A")
    .replace(/[\u00C8-\u00CB]/g, "E")
    .replace(/[\u00CC-\u00CF]/g, "I")
    .replace(/[\u00D2-\u00D6]/g, "O")
    .replace(/[\u00D9-\u00DC]/g, "U");
}

/**
 * Partículas que se ignoran al construir las 4 letras y la homoclave.
 * Vienen del manual del SAT.
 */
const PARTICULAS = new Set([
  "DA",
  "DAS",
  "DE",
  "DEL",
  "DER",
  "DI",
  "DIE",
  "DD",
  "EL",
  "LA",
  "LOS",
  "LAS",
  "LE",
  "LES",
  "MAC",
  "MC",
  "VAN",
  "VON",
  "Y",
  "MI",
]);

/** Normaliza nombre/apellido: mayúsculas, sin acentos, sin partículas. */
function normalizarParaLetras(s: string): string {
  const limpio = quitarAcentos(s.trim().toUpperCase())
    .replace(/[^A-ZÑ&\s]/g, "")
    .replace(/\s+/g, " ");
  return limpio
    .split(" ")
    .filter((t) => t && !PARTICULAS.has(t))
    .join(" ");
}

/**
 * Para la HOMOCLAVE el SAT NO quita partículas, pero sí limpia
 * caracteres especiales y respeta los acentos previamente quitados.
 */
function normalizarParaHomoclave(s: string): string {
  return quitarAcentos(s.trim().toUpperCase())
    .replace(/[^A-ZÑ&\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Construcción de las 4 letras ──────────────────────────────────

const VOCALES = new Set(["A", "E", "I", "O", "U"]);

/** Devuelve la primera vocal interna (no la 1ª letra). */
function primeraVocalInterna(s: string): string {
  for (let i = 1; i < s.length; i++) {
    const c = s[i];
    if (VOCALES.has(c)) return c;
  }
  return "X";
}

/** Devuelve el primer carácter "consonante segura" o X. */
function primeraLetra(s: string): string {
  return s.length > 0 ? s[0] : "X";
}

/**
 * Combinaciones inconvenientes: cuando las 4 letras resultantes forman
 * una palabra altisonante, el SAT reemplaza la 4ª letra por X.
 * Lista oficial publicada en el manual del SAT.
 */
const PALABRAS_INCONVENIENTES = new Set([
  "BACA", "BAKA", "BUEI", "BUEY", "CACA", "CACO", "CAGA", "CAGO",
  "CAKA", "CAKO", "COGE", "COGI", "COJA", "COJE", "COJI", "COJO",
  "COLA", "CULO", "FALO", "FETO", "GETA", "GUEI", "GUEY", "JETA",
  "JOTO", "KACA", "KACO", "KAGA", "KAGO", "KAKA", "KAKO", "KOGE",
  "KOGI", "KOJA", "KOJE", "KOJI", "KOJO", "KOLA", "KULO", "LILO",
  "LOCA", "LOCO", "LOKA", "LOKO", "MAME", "MAMO", "MEAR", "MEAS",
  "MEON", "MIAR", "MION", "MOCO", "MOKO", "MULA", "MULO", "NACA",
  "NACO", "PEDA", "PEDO", "PENE", "PIPI", "PITO", "POPO", "PUTA",
  "PUTO", "QULO", "RATA", "ROBA", "ROBE", "ROBO", "RUIN", "SENO",
  "TETA", "VACA", "VAGA", "VAGO", "VAKA", "VUEI", "VUEY", "WUEI", "WUEY",
]);

/**
 * Si el primer nombre es "JOSE" o "MARIA" Y hay más nombres, usa el
 * siguiente nombre para construir la cuarta letra (regla SAT).
 */
function nombreUtil(nombres: string): string {
  const tokens = nombres.split(" ").filter(Boolean);
  if (tokens.length > 1 && (tokens[0] === "JOSE" || tokens[0] === "MARIA")) {
    return tokens.slice(1).join(" ");
  }
  return tokens.join(" ");
}

// ─── Tabla de valores para HOMOCLAVE ───────────────────────────────

/**
 * Tabla oficial: cada carácter del nombre completo se mapea a 2
 * dígitos. Los huecos (10, 20, 30, 40) están reservados.
 */
const VALORES_NOMBRE: Record<string, string> = {
  " ": "00",
  "0": "00",
  "1": "01",
  "2": "02",
  "3": "03",
  "4": "04",
  "5": "05",
  "6": "06",
  "7": "07",
  "8": "08",
  "9": "09",
  "&": "10",
  A: "11",
  B: "12",
  C: "13",
  D: "14",
  E: "15",
  F: "16",
  G: "17",
  H: "18",
  I: "19",
  J: "21",
  K: "22",
  L: "23",
  M: "24",
  N: "25",
  O: "26",
  P: "27",
  Q: "28",
  R: "29",
  S: "32",
  T: "33",
  U: "34",
  V: "35",
  W: "36",
  X: "37",
  Y: "38",
  Z: "39",
  Ñ: "40",
};

/** Tabla para convertir cociente/residuo de la homoclave a carácter. */
const TABLA_HOMOCLAVE = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D",
  "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "P", "Q", "R",
  "S", "T", "U", "V", "W", "X", "Y", "Z",
];

/**
 * Calcula los 2 primeros caracteres de la homoclave (no el dígito
 * verificador). Recibe el nombre completo "APELLIDO_P APELLIDO_M
 * NOMBRES" ya normalizado (sin acentos, mayúsculas).
 */
function calcularHomoclaveBase(nombreCompleto: string): string {
  // El algoritmo SAT antepone un "0" para alinear pares.
  let cadena = "0";
  for (const ch of nombreCompleto) {
    cadena += VALORES_NOMBRE[ch] ?? "00";
  }

  let suma = 0;
  for (let i = 0; i < cadena.length - 1; i++) {
    const par = parseInt(cadena.substring(i, i + 2), 10);
    const siguiente = parseInt(cadena[i + 1], 10);
    suma += par * siguiente;
  }

  const tresUltimos = suma % 1000;
  const cociente = Math.floor(tresUltimos / 34);
  const residuo = tresUltimos % 34;

  return (TABLA_HOMOCLAVE[cociente] ?? "0") + (TABLA_HOMOCLAVE[residuo] ?? "0");
}

// ─── Dígito verificador ────────────────────────────────────────────

/** Valores para el cálculo del dígito verificador. */
const VALORES_VERIFICADOR: Record<string, number> = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9,
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 18,
  J: 19, K: 20, L: 21, M: 22, N: 23,
  "&": 24,
  O: 25, P: 26, Q: 27, R: 28, S: 29, T: 30, U: 31, V: 32, W: 33,
  X: 34, Y: 35, Z: 36,
  " ": 37,
  Ñ: 38,
};

/**
 * Calcula el dígito verificador (último carácter del RFC) sobre los
 * 12 caracteres previos. Para PF son 12 caracteres tal cual; para PM
 * (11 caracteres) se antepone un espacio.
 */
function calcularDigitoVerificador(rfcBase: string): string {
  const padded = rfcBase.length === 11 ? " " + rfcBase : rfcBase;
  let suma = 0;
  for (let i = 0; i < padded.length; i++) {
    const valor = VALORES_VERIFICADOR[padded[i]] ?? 0;
    suma += valor * (13 - i);
  }
  const residuo = suma % 11;
  if (residuo === 0) return "0";
  const diferencia = 11 - residuo;
  if (diferencia === 10) return "A";
  return String(diferencia);
}

// ─── API pública ───────────────────────────────────────────────────

export type EntradaRfcFisica = {
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
  anio: number;
  mes: number; // 1-12
  dia: number; // 1-31
};

export type ResultadoRfc = {
  rfc: string;
  letras: string;
  fecha: string;
  homoclave: string;
  digitoVerificador: string;
  /** Advertencias de validación de los datos. No bloquean el cálculo. */
  advertencias: string[];
};

/** Valida que la entrada tenga los mínimos para calcular. */
function validar(entrada: EntradaRfcFisica): string[] {
  const errores: string[] = [];
  if (!entrada.nombres?.trim()) errores.push("Falta el nombre.");
  if (!entrada.primerApellido?.trim())
    errores.push("Falta el primer apellido.");
  if (!entrada.anio || entrada.anio < 1900 || entrada.anio > 2100)
    errores.push("Año inválido.");
  if (!entrada.mes || entrada.mes < 1 || entrada.mes > 12)
    errores.push("Mes inválido.");
  if (!entrada.dia || entrada.dia < 1 || entrada.dia > 31)
    errores.push("Día inválido.");
  return errores;
}

/**
 * Calcula el RFC con homoclave de una persona física a partir de sus
 * datos. Si faltan campos críticos, devuelve `null` y la lista de
 * errores en el campo `advertencias`.
 */
export function calcularRfcPersonaFisica(
  entrada: EntradaRfcFisica
): ResultadoRfc | { error: string[] } {
  const errores = validar(entrada);
  if (errores.length > 0) return { error: errores };

  const nombres = normalizarParaLetras(entrada.nombres);
  const ap1 = normalizarParaLetras(entrada.primerApellido);
  const ap2 = normalizarParaLetras(entrada.segundoApellido ?? "");

  // Si el "primer apellido" tiene varias palabras (ej. "DE LA O"),
  // tomamos la última no-partícula. `normalizarParaLetras` ya quitó
  // las partículas, así que basta con tomar el primer token.
  const ap1Util = ap1.split(" ")[0] ?? "";
  const ap2Util = ap2.split(" ")[0] ?? "";
  const nombreUtilStr = nombreUtil(nombres);
  const primerNombre = nombreUtilStr.split(" ")[0] ?? "";

  // Construir las 4 letras.
  let letras = "";
  if (ap1Util.length >= 2 && ap2Util.length > 0) {
    // Caso normal: ambos apellidos.
    letras =
      primeraLetra(ap1Util) +
      primeraVocalInterna(ap1Util) +
      primeraLetra(ap2Util) +
      primeraLetra(primerNombre);
  } else if (ap1Util.length >= 2 && ap2Util.length === 0) {
    // Sin segundo apellido: primeras dos letras del primer apellido + 1ª del 1er apellido + 1ª nombre.
    letras =
      primeraLetra(ap1Util) +
      primeraVocalInterna(ap1Util) +
      "X" +
      primeraLetra(primerNombre);
  } else if (ap1Util.length === 1) {
    // Primer apellido de 1 letra: 1ª de ap1 + 1ª y 2ª de ap2 + 1ª nombre.
    letras =
      primeraLetra(ap1Util) +
      (ap2Util.length > 1 ? ap2Util[0] + ap2Util[1] : "XX") +
      primeraLetra(primerNombre);
  } else if (ap1Util.length === 0 && ap2Util.length > 0) {
    // Solo apellido materno: primeras dos letras de ap2 + X + 1ª nombre.
    letras =
      ap2Util[0] +
      (ap2Util[1] ?? "X") +
      "X" +
      primeraLetra(primerNombre);
  } else {
    // Sin apellidos: 4 primeras letras del nombre.
    const nombreLimpio = (primerNombre + "XXXX").substring(0, 4);
    letras = nombreLimpio;
  }

  // Reemplazo de palabras inconvenientes.
  if (PALABRAS_INCONVENIENTES.has(letras)) {
    letras = letras.substring(0, 3) + "X";
  }

  // Fecha AAMMDD.
  const aa = String(entrada.anio).slice(-2).padStart(2, "0");
  const mm = String(entrada.mes).padStart(2, "0");
  const dd = String(entrada.dia).padStart(2, "0");
  const fecha = aa + mm + dd;

  // Homoclave: usa el nombre completo ORIGINAL (sin quitar partículas),
  // en orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
  const homoBase = normalizarParaHomoclave(
    [
      entrada.primerApellido,
      entrada.segundoApellido ?? "",
      entrada.nombres,
    ]
      .filter(Boolean)
      .join(" ")
  );
  const homoclave = calcularHomoclaveBase(homoBase);

  const rfcBase = letras + fecha + homoclave;
  const digitoVerificador = calcularDigitoVerificador(rfcBase);

  return {
    rfc: rfcBase + digitoVerificador,
    letras,
    fecha,
    homoclave: homoclave + digitoVerificador,
    digitoVerificador,
    advertencias: [],
  };
}
