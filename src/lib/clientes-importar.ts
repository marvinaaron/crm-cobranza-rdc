import { MESES_NOM, type Cliente } from "@/lib/clientes";
import { isValidEmail, normalizarEmail } from "@/lib/email";
import { CONFIG_CUMPLIMIENTO_DEFAULT } from "@/lib/config-cumplimiento-cliente";

export type FilaImportada = {
  razonSocial: string;
  rfc: string;
  email: string;
  honorarios: number;
  diaPago: string;
  inicioMes: number;
  inicioAnio: string;
  esPersonaMoral: boolean;
  federales: boolean;
  imss: boolean;
  estatales: boolean;
  repse: boolean;
};

export type ErrorImportacion = {
  campo:
    | "razonSocial"
    | "rfc"
    | "email"
    | "honorarios"
    | "diaPago"
    | "inicioMes"
    | "inicioAnio"
    | "duplicado";
  mensaje: string;
};

export type FilaProcesada = {
  numero: number;
  fila: FilaImportada;
  errores: ErrorImportacion[];
  duplicadoExistente?: boolean;
  duplicadoEnArchivo?: boolean;
};

export type ResultadoParseo = {
  filas: FilaProcesada[];
  encabezadoDetectado: boolean;
};

const ALIAS_COLUMNAS: Record<string, keyof FilaImportada | "ignorar"> = {
  // Razón social
  "razon social": "razonSocial",
  "razón social": "razonSocial",
  razonsocial: "razonSocial",
  cliente: "razonSocial",
  nombre: "razonSocial",
  empresa: "razonSocial",
  // RFC
  rfc: "rfc",
  // Email
  email: "email",
  correo: "email",
  "correo electronico": "email",
  "correo electrónico": "email",
  // Honorarios
  honorarios: "honorarios",
  monto: "honorarios",
  cobro: "honorarios",
  "cuota mensual": "honorarios",
  // Día de pago
  "dia de pago": "diaPago",
  "día de pago": "diaPago",
  "dia pago": "diaPago",
  "día pago": "diaPago",
  "fecha pago": "diaPago",
  diapago: "diaPago",
  // Inicio mes (relación comercial)
  "mes inicio": "inicioMes",
  "mes de inicio": "inicioMes",
  "mes inicio relacion": "inicioMes",
  "mes inicio relación": "inicioMes",
  "mes inicio de la relacion": "inicioMes",
  iniciomes: "inicioMes",
  // Inicio año
  "anio inicio": "inicioAnio",
  "año inicio": "inicioAnio",
  "año de inicio": "inicioAnio",
  "anio inicio relacion": "inicioAnio",
  "año inicio relación": "inicioAnio",
  inicioanio: "inicioAnio",
  // Persona moral
  "persona moral": "esPersonaMoral",
  pm: "esPersonaMoral",
  "tipo persona": "esPersonaMoral",
  // Categorías
  federales: "federales",
  "impuestos federales": "federales",
  sat: "federales",
  imss: "imss",
  estatales: "estatales",
  "impuestos estatales": "estatales",
  nomina: "estatales",
  nómina: "estatales",
  repse: "repse",
};

function normalizarHeader(h: string): string {
  return h
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectarHeader(fila: unknown[]): Record<number, keyof FilaImportada> | null {
  if (!fila || fila.length === 0) return null;
  const mapeo: Record<number, keyof FilaImportada> = {};
  let aciertos = 0;
  fila.forEach((celda, i) => {
    const clave = normalizarHeader(String(celda ?? ""));
    if (!clave) return;
    const sinTildes = clave.replace(/[áéíóúñ]/g, (c) => {
      return { á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n" }[c] ?? c;
    });
    const dest =
      ALIAS_COLUMNAS[clave] ?? ALIAS_COLUMNAS[sinTildes] ?? undefined;
    if (dest && dest !== "ignorar") {
      mapeo[i] = dest;
      aciertos += 1;
    }
  });
  if (aciertos >= 3) return mapeo;
  return null;
}

const ORDEN_POR_DEFECTO: (keyof FilaImportada)[] = [
  "razonSocial",
  "rfc",
  "email",
  "honorarios",
  "diaPago",
  "inicioMes",
  "inicioAnio",
  "esPersonaMoral",
  "federales",
  "imss",
  "estatales",
  "repse",
];

function parsearBool(valor: unknown, porDefecto: boolean): boolean {
  if (valor === undefined || valor === null || valor === "") return porDefecto;
  const v = String(valor).trim().toLowerCase();
  if (["1", "si", "sí", "yes", "y", "verdadero", "true", "x", "pm"].includes(v))
    return true;
  if (["0", "no", "false", "falso", "n", "pf"].includes(v)) return false;
  return porDefecto;
}

function parsearPersonaMoral(valor: unknown): boolean {
  if (valor === undefined || valor === null || valor === "") return true;
  const v = String(valor).trim().toLowerCase();
  if (["pm", "moral", "persona moral", "m"].includes(v)) return true;
  if (["pf", "fisica", "física", "persona fisica", "persona física", "f"].includes(v))
    return false;
  return parsearBool(valor, true);
}

function parsearMes(valor: unknown): number {
  if (valor === undefined || valor === null || valor === "") return 0;
  const num = Number(valor);
  if (Number.isFinite(num) && num >= 1 && num <= 12) return num - 1;
  if (Number.isFinite(num) && num >= 0 && num <= 11) return num;
  const v = String(valor)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const idx = MESES_NOM.findIndex((m) =>
    m
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .startsWith(v.slice(0, 3))
  );
  if (idx >= 0) return idx;
  return new Date().getMonth();
}

function parsearAnio(valor: unknown): string {
  if (valor === undefined || valor === null || valor === "") {
    return String(new Date().getFullYear());
  }
  const num = Math.floor(Number(valor));
  if (Number.isFinite(num) && num >= 2000 && num <= 2100) return String(num);
  return String(new Date().getFullYear());
}

function parsearHonorarios(valor: unknown): number {
  if (valor === undefined || valor === null || valor === "") return 0;
  const limpio = String(valor).replace(/[^0-9.\-]/g, "");
  const n = Number(limpio);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

function parsearDiaPago(valor: unknown): string {
  if (valor === undefined || valor === null || valor === "") return "01";
  const n = Number(String(valor).replace(/[^0-9]/g, ""));
  if (!Number.isFinite(n) || n < 1 || n > 31) return "01";
  return String(n).padStart(2, "0");
}

function filaVacia(celdas: unknown[]): boolean {
  return celdas.every(
    (c) => c === undefined || c === null || String(c).trim() === ""
  );
}

function mapearFila(
  celdas: unknown[],
  mapeo: Record<number, keyof FilaImportada> | null
): FilaImportada {
  const datos: Partial<Record<keyof FilaImportada, unknown>> = {};
  if (mapeo) {
    for (const [idxStr, campo] of Object.entries(mapeo)) {
      datos[campo] = celdas[Number(idxStr)];
    }
  } else {
    ORDEN_POR_DEFECTO.forEach((campo, i) => {
      datos[campo] = celdas[i];
    });
  }

  return {
    razonSocial: String(datos.razonSocial ?? "").trim(),
    rfc: String(datos.rfc ?? "").trim().toUpperCase(),
    email: normalizarEmail(String(datos.email ?? "").trim()),
    honorarios: parsearHonorarios(datos.honorarios),
    diaPago: parsearDiaPago(datos.diaPago),
    inicioMes: parsearMes(datos.inicioMes),
    inicioAnio: parsearAnio(datos.inicioAnio),
    esPersonaMoral: parsearPersonaMoral(datos.esPersonaMoral),
    federales: parsearBool(datos.federales, CONFIG_CUMPLIMIENTO_DEFAULT.federales),
    imss: parsearBool(datos.imss, CONFIG_CUMPLIMIENTO_DEFAULT.imss),
    estatales: parsearBool(datos.estatales, CONFIG_CUMPLIMIENTO_DEFAULT.estatales),
    repse: parsearBool(datos.repse, false),
  };
}

function validarFila(fila: FilaImportada): ErrorImportacion[] {
  const errores: ErrorImportacion[] = [];
  if (!fila.razonSocial) {
    errores.push({ campo: "razonSocial", mensaje: "Falta la razón social." });
  }
  const longitudRfc = fila.esPersonaMoral ? 12 : 13;
  if (fila.rfc.length !== longitudRfc) {
    errores.push({
      campo: "rfc",
      mensaje: `El RFC debe tener ${longitudRfc} caracteres (${fila.esPersonaMoral ? "PM" : "PF"}).`,
    });
  }
  if (fila.email && !isValidEmail(fila.email)) {
    errores.push({ campo: "email", mensaje: "Correo no es válido." });
  }
  if (!fila.honorarios || fila.honorarios <= 0) {
    errores.push({
      campo: "honorarios",
      mensaje: "Honorarios debe ser un número mayor a 0.",
    });
  }
  return errores;
}

function detectarDuplicados(
  filas: FilaImportada[],
  clientesExistentes: Cliente[]
): { existentes: boolean[]; enArchivo: boolean[] } {
  const rfcsExistentes = new Set(
    clientesExistentes.map((c) => c.rfc.toUpperCase().trim()).filter(Boolean)
  );
  const vistos = new Map<string, number>();
  const existentes: boolean[] = [];
  const enArchivo: boolean[] = [];
  filas.forEach((f, idx) => {
    const rfc = f.rfc.trim();
    existentes.push(!!rfc && rfcsExistentes.has(rfc));
    if (!rfc) {
      enArchivo.push(false);
    } else if (vistos.has(rfc)) {
      enArchivo.push(true);
    } else {
      vistos.set(rfc, idx);
      enArchivo.push(false);
    }
  });
  return { existentes, enArchivo };
}

export function procesarMatrizCrudos(
  filas: unknown[][],
  clientesExistentes: Cliente[]
): ResultadoParseo {
  if (!filas.length) return { filas: [], encabezadoDetectado: false };

  const mapeo = detectarHeader(filas[0]);
  const sinHeader = mapeo === null;
  const datos = sinHeader ? filas : filas.slice(1);

  const filasLimpias = datos.filter((f) => !filaVacia(f));
  const mapeadas = filasLimpias.map((f) => mapearFila(f, mapeo));
  const dup = detectarDuplicados(mapeadas, clientesExistentes);

  const procesadas: FilaProcesada[] = mapeadas.map((fila, i) => {
    const errores = validarFila(fila);
    if (dup.existentes[i]) {
      errores.push({
        campo: "duplicado",
        mensaje: "Ya existe un cliente con este RFC.",
      });
    }
    if (dup.enArchivo[i]) {
      errores.push({
        campo: "duplicado",
        mensaje: "Este RFC aparece más de una vez en el archivo.",
      });
    }
    return {
      numero: i + 1,
      fila,
      errores,
      duplicadoExistente: dup.existentes[i],
      duplicadoEnArchivo: dup.enArchivo[i],
    };
  });

  return { filas: procesadas, encabezadoDetectado: !sinHeader };
}

/** Convierte texto pegado (TSV o CSV) a matriz. */
export function parsearTexto(texto: string): unknown[][] {
  const lineas = texto.replace(/\r\n?/g, "\n").split("\n");
  return lineas.map((linea) => {
    if (linea.includes("\t")) return linea.split("\t");
    return parsearLineaCSV(linea);
  });
}

function parsearLineaCSV(linea: string): string[] {
  const celdas: string[] = [];
  let actual = "";
  let enComillas = false;
  for (let i = 0; i < linea.length; i += 1) {
    const c = linea[i];
    if (c === '"') {
      if (enComillas && linea[i + 1] === '"') {
        actual += '"';
        i += 1;
      } else {
        enComillas = !enComillas;
      }
    } else if (c === "," && !enComillas) {
      celdas.push(actual);
      actual = "";
    } else {
      actual += c;
    }
  }
  celdas.push(actual);
  return celdas;
}

/** Genera una plantilla TSV pegable directamente en Excel/Numbers/Sheets. */
export function plantillaCSV(): string {
  const encabezados = [
    "Razón social",
    "RFC",
    "Email",
    "Honorarios",
    "Día de pago",
    "Mes inicio relación",
    "Año inicio relación",
    "Persona moral (PM/PF)",
    "Federales",
    "IMSS",
    "Estatales",
    "REPSE",
  ];
  const ejemplo1 = [
    "Constructora Ejemplo S.A. de C.V.",
    "CEX120101ABC",
    "contacto@ejemplo.mx",
    "3500",
    "10",
    "Enero",
    "2026",
    "PM",
    "Sí",
    "No",
    "No",
    "No",
  ];
  const ejemplo2 = [
    "Juan Pérez García",
    "PEGJ800101AB1",
    "juan.perez@correo.com",
    "1200",
    "15",
    "Marzo",
    "2026",
    "PF",
    "Sí",
    "No",
    "No",
    "No",
  ];
  return [encabezados, ejemplo1, ejemplo2].map((f) => f.join(",")).join("\n");
}
