import type { Cliente } from "@/lib/clientes";
import type { CategoriaId } from "@/lib/cumplimiento-categorias";
import {
  categoriaActivaEnPreview,
  categoriaTieneExtemporaneo,
  getSubtotalCategoria,
  getFechaLimiteCategoria,
  type RegistroCumplimiento,
} from "@/lib/cumplimiento";

export type ConfigCumplimientoCliente = {
  federales: boolean;
  imss: boolean;
  estatales: boolean;
};

export const CONFIG_CUMPLIMIENTO_DEFAULT: ConfigCumplimientoCliente = {
  federales: true,
  imss: false,
  estatales: false,
};

export function normalizarConfigCumplimiento(
  raw?: Partial<ConfigCumplimientoCliente> | null
): ConfigCumplimientoCliente {
  if (!raw) return { ...CONFIG_CUMPLIMIENTO_DEFAULT };
  return {
    federales: raw.federales ?? true,
    imss: raw.imss ?? false,
    estatales: raw.estatales ?? false,
  };
}

export function categoriasHabilitadasCliente(cliente: Cliente): CategoriaId[] {
  const cfg = normalizarConfigCumplimiento(cliente.configCumplimiento);
  const out: CategoriaId[] = [];
  if (cfg.federales) out.push("federales");
  if (cfg.imss) out.push("imss");
  if (cfg.estatales) out.push("estatales");
  return out;
}

export function categoriaAplicaCliente(cliente: Cliente, cat: CategoriaId): boolean {
  return categoriasHabilitadasCliente(cliente).includes(cat);
}

export function alMenosUnaCategoriaCumplimiento(cliente: Cliente): boolean {
  return categoriasHabilitadasCliente(cliente).length > 0;
}

export function categoriaVisibleParaCliente(
  cliente: Cliente,
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId
): boolean {
  if (!categoriaAplicaCliente(cliente, cat) || !reg) return false;
  const activa =
    categoriaActivaEnPreview(reg, cat) || categoriaTieneExtemporaneo(reg, cat);
  if (!activa) return false;
  if (categoriaTieneExtemporaneo(reg, cat)) return true;
  return getSubtotalCategoria(reg, cat) > 0;
}

/** Categorías habilitadas en el cliente con monto a pagar en el previo publicado. */
export function categoriasConPagoEnPreview(
  cliente: Cliente,
  reg: RegistroCumplimiento
): CategoriaId[] {
  return categoriasHabilitadasCliente(cliente).filter(
    (cat) =>
      categoriaActivaEnPreview(reg, cat) && getSubtotalCategoria(reg, cat) > 0
  );
}

export function categoriaPreviewValidadaPorCliente(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId
): boolean {
  if (!reg) return false;
  if (reg.clienteConfirmoPreviewEn) return true;
  return !!reg.previewValidacionCategorias?.[cat];
}

export function todasCategoriasPreviewValidadas(
  cliente: Cliente,
  reg: RegistroCumplimiento | undefined
): boolean {
  if (!reg) return false;
  if (reg.clienteConfirmoPreviewEn) return true;
  const pendientes = categoriasConPagoEnPreview(cliente, reg);
  if (!pendientes.length) return false;
  return pendientes.every((cat) => categoriaPreviewValidadaPorCliente(reg, cat));
}

export { getFechaLimiteCategoria };
