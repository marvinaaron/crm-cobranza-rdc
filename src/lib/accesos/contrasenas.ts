import seed2026 from "@/data/accesos-contrasenas-2026.json";
import type { Cliente } from "@/lib/clientes";
import { normalizarRfc } from "@/lib/cfdi/parser";
import { regimenPorClave } from "@/lib/regimenes-fiscales";

export type FilaContrasenas = {
  id: string;
  regimen: string;
  cliente: string;
  rfc: string;
  satPassword: string;
  fiel: string;
  csd: string;
  idse: string;
  repse: string;
  sipare: string;
  infonavit: string;
  repseCorreo: string;
  /**
   * Si es true (default), nombre y régimen se toman del catálogo cuando el RFC coincide.
   * En false se usan los valores guardados en esta fila.
   */
  homologarConCrm?: boolean;
};

export type FilaContrasenasDisplay = FilaContrasenas & {
  clienteDisplay: string;
  regimenDisplay: string;
  vinculadoCrm: boolean;
  clienteCrmId?: number;
};

export type CategoriaAcceso = "SAT" | "IMSS" | "REPSE" | "SISUB";

export type CampoContrasena = {
  key: keyof Omit<FilaContrasenas, "id">;
  label: string;
  categoria: CategoriaAcceso | "meta";
};

/** Columnas en el mismo orden que el Excel (sin contar régimen). */
export const CAMPOS_CONTRASENAS: CampoContrasena[] = [
  { key: "cliente", label: "Cliente", categoria: "meta" },
  { key: "rfc", label: "RFC", categoria: "SAT" },
  { key: "satPassword", label: "Contraseña", categoria: "SAT" },
  { key: "fiel", label: "FIEL", categoria: "SAT" },
  { key: "csd", label: "CSD", categoria: "SAT" },
  { key: "idse", label: "IDSE", categoria: "IMSS" },
  { key: "repse", label: "REPSE", categoria: "REPSE" },
  { key: "sipare", label: "SIPARE", categoria: "IMSS" },
  { key: "infonavit", label: "INFONAVIT", categoria: "SISUB" },
  { key: "repseCorreo", label: "REPSE correo", categoria: "REPSE" },
];

export const CATEGORIAS_HEADER: Array<{
  id: CategoriaAcceso;
  label: string;
  colspan: number;
}> = [
  { id: "SAT", label: "SAT", colspan: 4 },
  { id: "IMSS", label: "IMSS", colspan: 2 },
  { id: "REPSE", label: "REPSE", colspan: 2 },
  { id: "SISUB", label: "SISUB", colspan: 1 },
];

/** Columnas que el usuario puede mostrar u ocultar (no incluye Régimen/Cliente fijos). */
export const COLUMNAS_TOGGLEABLES = CAMPOS_CONTRASENAS.filter(
  (c) => c.categoria !== "meta"
);

export type ColumnaContrasenasKey = (typeof COLUMNAS_TOGGLEABLES)[number]["key"];

export const STORAGE_COLUMNAS_CONTRASENAS = "rdc-accesos-contrasenas-columnas-v1";

export function columnasContrasenasPorDefecto(): Record<ColumnaContrasenasKey, boolean> {
  return Object.fromEntries(
    COLUMNAS_TOGGLEABLES.map((c) => [c.key, true])
  ) as Record<ColumnaContrasenasKey, boolean>;
}

export function cargarVisibilidadColumnasContrasenas(): Record<
  ColumnaContrasenasKey,
  boolean
> {
  const def = columnasContrasenasPorDefecto();
  if (typeof window === "undefined") return def;
  try {
    const raw = localStorage.getItem(STORAGE_COLUMNAS_CONTRASENAS);
    if (!raw) return def;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    for (const col of COLUMNAS_TOGGLEABLES) {
      if (typeof parsed[col.key] === "boolean") def[col.key] = parsed[col.key];
    }
    return def;
  } catch {
    return def;
  }
}

export function guardarVisibilidadColumnasContrasenas(
  visibles: Record<ColumnaContrasenasKey, boolean>
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_COLUMNAS_CONTRASENAS, JSON.stringify(visibles));
}

export function camposContrasenasVisibles(
  visibles: Record<ColumnaContrasenasKey, boolean>
): CampoContrasena[] {
  return COLUMNAS_TOGGLEABLES.filter((c) => visibles[c.key]);
}

export function categoriasContrasenasVisibles(
  campos: CampoContrasena[]
): Array<{ id: CategoriaAcceso; label: string; colspan: number }> {
  return CATEGORIAS_HEADER.map((cat) => ({
    ...cat,
    colspan: campos.filter((c) => c.categoria === cat.id).length,
  })).filter((cat) => cat.colspan > 0);
}

export function contarColumnasContrasenasVisibles(
  visibles: Record<ColumnaContrasenasKey, boolean>
): { activas: number; total: number } {
  const total = COLUMNAS_TOGGLEABLES.length;
  const activas = COLUMNAS_TOGGLEABLES.filter((c) => visibles[c.key]).length;
  return { activas, total };
}

export function seedContrasenas2026(): FilaContrasenas[] {
  return seed2026 as FilaContrasenas[];
}

export function valorCampo(fila: FilaContrasenas, key: CampoContrasena["key"]): string {
  return String(fila[key] ?? "").trim();
}

export function filaTieneDatos(fila: FilaContrasenas): boolean {
  return Boolean(fila.cliente || fila.rfc);
}

export function mapaClientesPorRfc(clientes: Cliente[]): Map<string, Cliente> {
  const map = new Map<string, Cliente>();
  for (const c of clientes) {
    const rfc = normalizarRfc(c.rfc ?? "");
    if (!rfc || rfc === "ING-GENERAL") continue;
    if (!map.has(rfc)) map.set(rfc, c);
  }
  return map;
}

export function etiquetaRegimenCliente(cliente: Cliente): string {
  if (!cliente.regimenFiscalClave) {
    return cliente.esPersonaMoral ? "PM" : "PF";
  }
  const reg = regimenPorClave(cliente.regimenFiscalClave);
  return reg?.label ?? cliente.regimenFiscalClave;
}

export function resolverFilaContrasenas(
  fila: FilaContrasenas,
  porRfc: Map<string, Cliente>
): FilaContrasenasDisplay {
  const homologar = fila.homologarConCrm !== false;
  const rfcNorm = normalizarRfc(fila.rfc ?? "");
  const match = homologar && rfcNorm ? porRfc.get(rfcNorm) : undefined;

  if (match) {
    const regimenCrm = match.regimenFiscalClave
      ? etiquetaRegimenCliente(match)
      : fila.regimen;
    return {
      ...fila,
      clienteDisplay: match.razonSocial,
      regimenDisplay: regimenCrm,
      vinculadoCrm: true,
      clienteCrmId: match.id,
    };
  }

  return {
    ...fila,
    clienteDisplay: fila.cliente,
    regimenDisplay: fila.regimen,
    vinculadoCrm: false,
  };
}

export function enriquecerFilasContrasenas(
  filas: FilaContrasenas[],
  clientes: Cliente[]
): FilaContrasenasDisplay[] {
  const porRfc = mapaClientesPorRfc(clientes);
  return filas.map((f) => resolverFilaContrasenas(f, porRfc));
}

/** Campos editables en el modal (sin id). */
export const CAMPOS_EDITABLES_CONTRASENAS: Array<{
  key: keyof Omit<FilaContrasenas, "id" | "homologarConCrm">;
  label: string;
  grupo: "identidad" | "credenciales";
}> = [
  { key: "regimen", label: "Régimen", grupo: "identidad" },
  { key: "cliente", label: "Cliente", grupo: "identidad" },
  { key: "rfc", label: "RFC", grupo: "identidad" },
  { key: "satPassword", label: "Contraseña SAT", grupo: "credenciales" },
  { key: "fiel", label: "FIEL", grupo: "credenciales" },
  { key: "csd", label: "CSD", grupo: "credenciales" },
  { key: "idse", label: "IDSE", grupo: "credenciales" },
  { key: "repse", label: "REPSE", grupo: "credenciales" },
  { key: "sipare", label: "SIPARE", grupo: "credenciales" },
  { key: "infonavit", label: "INFONAVIT", grupo: "credenciales" },
  { key: "repseCorreo", label: "REPSE correo", grupo: "credenciales" },
];

export function filaContrasenasVacia(id: string): FilaContrasenas {
  return {
    id,
    regimen: "",
    cliente: "",
    rfc: "",
    satPassword: "",
    fiel: "",
    csd: "",
    idse: "",
    repse: "",
    sipare: "",
    infonavit: "",
    repseCorreo: "",
    homologarConCrm: true,
  };
}
