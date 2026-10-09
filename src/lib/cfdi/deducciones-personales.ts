import type { CfdiRegistro } from "./types";

/** UMA diaria 2026 (valor de referencia; actualizar anualmente). */
export const UMA_DIARIA_MXN = 108.57;

export const UMA_ANUAL_5 = Math.round(UMA_DIARIA_MXN * 5 * 365 * 100) / 100;

export type CategoriaDeduccionId =
  | "gastos_medicos"
  | "gastos_funerales"
  | "donativos"
  | "intereses_hipotecarios"
  | "afore"
  | "seguros_medicos"
  | "transporte_escolar"
  | "colegiaturas"
  | "estimulo_discapacidad";

export type CategoriaDeduccion = {
  id: CategoriaDeduccionId;
  titulo: string;
  descripcion: string;
  fundamento: string;
  entraAlTope: boolean;
  limitePropio?: string;
};

export const CATALOGO_DEDUCCIONES: CategoriaDeduccion[] = [
  {
    id: "gastos_medicos",
    titulo: "Honorarios médicos, dentales y hospitalarios",
    descripcion: "Gastos médicos deducibles con CFDI.",
    fundamento: "Art. 151 fracc. I LISR",
    entraAlTope: true,
  },
  {
    id: "gastos_funerales",
    titulo: "Gastos funerales",
    descripcion: "Hasta el tope legal vigente.",
    fundamento: "Art. 151 fracc. II LISR",
    entraAlTope: true,
  },
  {
    id: "donativos",
    titulo: "Donativos",
    descripcion: "Donativos a instituciones autorizadas.",
    fundamento: "Art. 151 fracc. III LISR",
    entraAlTope: true,
  },
  {
    id: "intereses_hipotecarios",
    titulo: "Intereses reales crédito hipotecario",
    descripcion: "1 crédito, casa habitación.",
    fundamento: "Art. 151 fracc. IV LISR",
    entraAlTope: true,
  },
  {
    id: "afore",
    titulo: "Aportaciones voluntarias AFORE",
    descripcion: "Hasta 10% del ingreso anual.",
    fundamento: "Art. 151 fracc. V LISR",
    entraAlTope: true,
  },
  {
    id: "seguros_medicos",
    titulo: "Primas seguro gastos médicos",
    descripcion: "Sin límite propio dentro del tope general.",
    fundamento: "Art. 151 fracc. VI LISR",
    entraAlTope: true,
  },
  {
    id: "transporte_escolar",
    titulo: "Transporte escolar obligatorio",
    descripcion: "Solo si es obligatorio por la escuela.",
    fundamento: "Art. 151 fracc. VII LISR",
    entraAlTope: true,
  },
  {
    id: "colegiaturas",
    titulo: "Colegiaturas",
    descripcion:
      "Preescolar $14,200 · Primaria $12,900 · Secundaria $19,900 · Bachillerato $24,500 · Profesional técnico $17,100",
    fundamento: "Art. 1.8 RLISR — límite propio",
    entraAlTope: false,
    limitePropio: "Límite independiente",
  },
  {
    id: "estimulo_discapacidad",
    titulo: "Estímulo por discapacidad",
    descripcion: "Contribuyente o dependientes.",
    fundamento: "Art. 186 LISR",
    entraAlTope: false,
    limitePropio: "Límite independiente",
  },
];

export function esRegimenAsalariado(regimenClave?: string | null): boolean {
  return regimenClave === "605";
}

function textoConcepto(reg: Pick<CfdiRegistro, "conceptoResumen">): string {
  return (reg.conceptoResumen ?? "").toLowerCase();
}

export function clasificarDeduccionPersonal(
  reg: Pick<CfdiRegistro, "tipo" | "tipoComprobante" | "conceptoResumen" | "total">
): CategoriaDeduccionId | null {
  if (reg.tipo !== "recibido" || reg.tipoComprobante === "N") return null;
  const t = textoConcepto(reg);

  if (/colegiatura|escuela|universidad|preescolar|primaria|secundaria|bachillerato/.test(t)) {
    return "colegiaturas";
  }
  if (/discapacidad|est[ií]mulo/.test(t)) return "estimulo_discapacidad";
  if (/m[eé]dic|dental|hospital|consulta|laboratorio|farmacia/.test(t)) {
    return "gastos_medicos";
  }
  if (/funer|pante[oó]n|cremaci[oó]n/.test(t)) return "gastos_funerales";
  if (/donativ|dona/.test(t)) return "donativos";
  if (/hipotec|inter[eé]s real|infonavit cr[eé]dito/.test(t)) {
    return "intereses_hipotecarios";
  }
  if (/afore|aportaci[oó]n voluntaria|retiro/.test(t)) return "afore";
  if (/seguro.*m[eé]dic|gastos m[eé]dicos mayores|gmm/.test(t)) {
    return "seguros_medicos";
  }
  if (/transporte escolar|autob[uú]s escolar/.test(t)) return "transporte_escolar";

  return null;
}

export type ResumenDeduccionesAsalariado = {
  ingresoAnualNomina: number;
  topePorcentajeIngreso: number;
  topeUmas: number;
  limiteDeduccion: number;
  acumuladoEnTope: number;
  disponibleDeducir: number;
  porCategoria: { id: CategoriaDeduccionId; monto: number }[];
};

export function calcularDeduccionesAsalariado(
  registrosAnio: Pick<
    CfdiRegistro,
    "tipo" | "tipoComprobante" | "conceptoResumen" | "total" | "estatus"
  >[]
): ResumenDeduccionesAsalariado {
  const ingresoAnualNomina = registrosAnio
    .filter((r) => r.tipo === "recibido" && r.tipoComprobante === "N" && r.estatus === "vigente")
    .reduce((s, r) => s + r.total, 0);

  const topePorcentajeIngreso = Math.round(ingresoAnualNomina * 0.15 * 100) / 100;
  const topeUmas = UMA_ANUAL_5;
  const limiteDeduccion = Math.min(topePorcentajeIngreso, topeUmas);

  const montos = new Map<CategoriaDeduccionId, number>();
  for (const cat of CATALOGO_DEDUCCIONES) {
    montos.set(cat.id, 0);
  }

  for (const r of registrosAnio) {
    if (r.estatus !== "vigente") continue;
    const cat = clasificarDeduccionPersonal(r);
    if (!cat) continue;
    const info = CATALOGO_DEDUCCIONES.find((c) => c.id === cat);
    if (!info?.entraAlTope) {
      montos.set(cat, (montos.get(cat) ?? 0) + r.total);
      continue;
    }
    montos.set(cat, (montos.get(cat) ?? 0) + r.total);
  }

  const acumuladoEnTope = CATALOGO_DEDUCCIONES.filter((c) => c.entraAlTope).reduce(
    (s, c) => s + (montos.get(c.id) ?? 0),
    0
  );

  return {
    ingresoAnualNomina: Math.round(ingresoAnualNomina * 100) / 100,
    topePorcentajeIngreso,
    topeUmas,
    limiteDeduccion: Math.round(limiteDeduccion * 100) / 100,
    acumuladoEnTope: Math.round(acumuladoEnTope * 100) / 100,
    disponibleDeducir: Math.max(0, Math.round((limiteDeduccion - acumuladoEnTope) * 100) / 100),
    porCategoria: CATALOGO_DEDUCCIONES.map((c) => ({
      id: c.id,
      monto: Math.round((montos.get(c.id) ?? 0) * 100) / 100,
    })),
  };
}
