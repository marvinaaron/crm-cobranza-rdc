import { type Cliente } from "@/lib/clientes";
import { isValidEmail, normalizarEmail } from "@/lib/email";
import {
  esTelefonoValido,
  normalizarTelefonoDisplay,
} from "@/lib/telefono";

export type FilaContactoImport = {
  razonSocial: string;
  rfc: string;
  email: string;
  whatsapp: string;
};

export type ErrorContactoImport = {
  campo: "rfc" | "email" | "whatsapp" | "no_encontrado" | "duplicado";
  mensaje: string;
};

export type FilaContactoProcesada = {
  numero: number;
  fila: FilaContactoImport;
  errores: ErrorContactoImport[];
  clienteId?: number;
  clienteNombre?: string;
  emailActual?: string;
  whatsappActual?: string;
  actualizaraEmail: boolean;
  actualizaraWhatsapp: boolean;
};

export type ResultadoContactoParseo = {
  filas: FilaContactoProcesada[];
  encabezadoDetectado: boolean;
};

const ALIAS: Record<string, keyof FilaContactoImport | "ignorar"> = {
  cliente: "razonSocial",
  "razon social": "razonSocial",
  "razón social": "razonSocial",
  nombre: "razonSocial",
  rfc: "rfc",
  email: "email",
  correo: "email",
  "correo electronico": "email",
  "correo electrónico": "email",
  whatsapp: "whatsapp",
  telefono: "whatsapp",
  teléfono: "whatsapp",
  "whatsapp / telefono": "whatsapp",
  "whatsapp / teléfono": "whatsapp",
  celular: "whatsapp",
};

function normalizarHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectarHeader(
  fila: unknown[]
): Record<number, keyof FilaContactoImport> | null {
  const mapeo: Record<number, keyof FilaContactoImport> = {};
  let aciertos = 0;
  fila.forEach((celda, i) => {
    const clave = normalizarHeader(String(celda ?? ""));
    const dest = ALIAS[clave];
    if (dest && dest !== "ignorar") {
      mapeo[i] = dest;
      aciertos += 1;
    }
  });
  if (aciertos >= 2 && mapeo && Object.values(mapeo).includes("rfc")) {
    return mapeo;
  }
  return null;
}

const ORDEN_DEFECTO: (keyof FilaContactoImport)[] = [
  "razonSocial",
  "rfc",
  "email",
  "whatsapp",
];

function filaVacia(celdas: unknown[]): boolean {
  return celdas.every(
    (c) => c === undefined || c === null || String(c).trim() === ""
  );
}

function mapearFila(
  celdas: unknown[],
  mapeo: Record<number, keyof FilaContactoImport> | null
): FilaContactoImport {
  const datos: Partial<Record<keyof FilaContactoImport, unknown>> = {};
  if (mapeo) {
    for (const [idxStr, campo] of Object.entries(mapeo)) {
      datos[campo] = celdas[Number(idxStr)];
    }
  } else {
    ORDEN_DEFECTO.forEach((campo, i) => {
      datos[campo] = celdas[i];
    });
  }
  return {
    razonSocial: String(datos.razonSocial ?? "").trim(),
    rfc: String(datos.rfc ?? "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ""),
    email: normalizarEmail(String(datos.email ?? "").trim()),
    whatsapp: normalizarTelefonoDisplay(String(datos.whatsapp ?? "")),
  };
}

function validarFila(
  fila: FilaContactoImport,
  cliente: Cliente | undefined
): ErrorContactoImport[] {
  const errores: ErrorContactoImport[] = [];
  if (!fila.rfc) {
    errores.push({ campo: "rfc", mensaje: "Falta el RFC." });
  } else if (fila.rfc.length !== 12 && fila.rfc.length !== 13) {
    errores.push({
      campo: "rfc",
      mensaje: "El RFC debe tener 12 (PM) o 13 (PF) caracteres.",
    });
  }
  if (!cliente) {
    errores.push({
      campo: "no_encontrado",
      mensaje: "No hay un cliente en el CRM con este RFC.",
    });
  }
  if (fila.email && !isValidEmail(fila.email)) {
    errores.push({ campo: "email", mensaje: "Correo no válido." });
  }
  if (fila.whatsapp && !esTelefonoValido(fila.whatsapp)) {
    errores.push({
      campo: "whatsapp",
      mensaje: "WhatsApp / teléfono debe tener al menos 10 dígitos.",
    });
  }
  if (!fila.whatsapp && !fila.email) {
    errores.push({
      campo: "whatsapp",
      mensaje: "Indica WhatsApp o correo para actualizar.",
    });
  }
  return errores;
}

export function procesarContactosCrudos(
  filas: unknown[][],
  clientesExistentes: Cliente[]
): ResultadoContactoParseo {
  if (!filas.length) return { filas: [], encabezadoDetectado: false };

  const mapeo = detectarHeader(filas[0]);
  const sinHeader = mapeo === null;
  const datos = sinHeader ? filas : filas.slice(1);
  const porRfc = new Map(
    clientesExistentes.map((c) => [c.rfc.toUpperCase().trim(), c])
  );
  const vistos = new Set<string>();

  const procesadas: FilaContactoProcesada[] = datos
    .filter((f) => !filaVacia(f))
    .map((f, i) => {
      const fila = mapearFila(f, mapeo);
      const cliente = porRfc.get(fila.rfc);
      const errores = validarFila(fila, cliente);

      if (fila.rfc && vistos.has(fila.rfc)) {
        errores.push({
          campo: "duplicado",
          mensaje: "Este RFC aparece más de una vez en el archivo.",
        });
      }
      if (fila.rfc) vistos.add(fila.rfc);

      const emailNuevo = fila.email || undefined;
      const whatsappNuevo = fila.whatsapp || undefined;

      return {
        numero: i + 1,
        fila,
        errores,
        clienteId: cliente?.id,
        clienteNombre: cliente?.razonSocial,
        emailActual: cliente?.email,
        whatsappActual: cliente?.whatsapp,
        actualizaraEmail: Boolean(
          emailNuevo &&
            cliente &&
            normalizarEmail(cliente.email) !== emailNuevo
        ),
        actualizaraWhatsapp: Boolean(
          whatsappNuevo &&
            cliente &&
            normalizarTelefonoDisplay(cliente.whatsapp) !== whatsappNuevo
        ),
      };
    });

  return { filas: procesadas, encabezadoDetectado: !sinHeader };
}

/** Aplica filas válidas sobre la lista de clientes (match por RFC). */
export function aplicarContactosImportados(
  clientes: Cliente[],
  filas: FilaContactoProcesada[]
): Cliente[] {
  const porRfc = new Map(
    filas
      .filter((f) => f.errores.length === 0 && f.clienteId != null)
      .map((f) => [f.fila.rfc, f])
  );
  if (porRfc.size === 0) return clientes;

  return clientes.map((c) => {
    const match = porRfc.get(c.rfc.toUpperCase().trim());
    if (!match) return c;
    const next = { ...c };
    if (match.fila.email) next.email = match.fila.email;
    if (match.fila.whatsapp) next.whatsapp = match.fila.whatsapp;
    return next;
  });
}

export function plantillaContactosCSV(): string {
  const encabezados = ["CLIENTE", "RFC", "EMAIL", "WHATSAPP / TELEFONO"];
  const ejemplo = [
    "Juan Pérez García",
    "PEGJ800101AB1",
    "juan@correo.com",
    "33 1234 5678",
  ];
  return [encabezados, ejemplo].map((f) => f.join(",")).join("\n");
}
