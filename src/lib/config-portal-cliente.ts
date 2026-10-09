import type { Cliente } from "@/lib/clientes";
import { esRegimenAsalariado } from "@/lib/cfdi/deducciones-personales";

export type ConfigPortalCliente = {
  /** Solo módulo CFDI / Visor fiscal; sin cumplimiento ni honorarios en portal. */
  soloVisorFiscal?: boolean;
  /** Asalariado: cumplimiento limitado a declaración anual; visor como módulo principal. */
  asalariadoSoloAnual?: boolean;
};

export type ModoPortalCliente = "completo" | "solo_visor" | "asalariado_anual";

export const CONFIG_PORTAL_DEFAULT: ConfigPortalCliente = {
  soloVisorFiscal: false,
  asalariadoSoloAnual: false,
};

export function normalizarConfigPortal(
  raw?: Partial<ConfigPortalCliente> | null
): ConfigPortalCliente {
  if (!raw) return { ...CONFIG_PORTAL_DEFAULT };
  return {
    soloVisorFiscal: raw.soloVisorFiscal === true,
    asalariadoSoloAnual: raw.asalariadoSoloAnual === true,
  };
}

export function modoPortalCliente(cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">): ModoPortalCliente {
  const cfg = normalizarConfigPortal(cliente.configPortal);
  if (cfg.soloVisorFiscal) return "solo_visor";
  if (cfg.asalariadoSoloAnual && esRegimenAsalariado(cliente.regimenFiscalClave)) {
    return "asalariado_anual";
  }
  return "completo";
}

export function portalSoloCfdi(cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">): boolean {
  return modoPortalCliente(cliente) !== "completo";
}

export function portalMuestraCumplimientoMensual(
  cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">
): boolean {
  return modoPortalCliente(cliente) === "completo";
}

export function portalMuestraDeclaracionAnual(
  cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">
): boolean {
  const modo = modoPortalCliente(cliente);
  return modo === "completo" || modo === "asalariado_anual";
}

export function portalMuestraHonorarios(
  cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">
): boolean {
  return modoPortalCliente(cliente) === "completo";
}

export function portalMuestraEncargos(
  cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">
): boolean {
  return modoPortalCliente(cliente) === "completo";
}

export function portalMuestraSituacionFiscal(
  cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">
): boolean {
  return modoPortalCliente(cliente) === "completo";
}

export function destinoPortalPrincipal(
  cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">
): string {
  return portalSoloCfdi(cliente) ? "/portal/hacienda/visor" : "/portal/inicio";
}

function rutaEsCfdi(pathname: string): boolean {
  return pathname.startsWith("/portal/hacienda");
}

/** Rutas del portal permitidas según el modo del cliente. */
export function rutaPermitidaPortal(
  pathname: string,
  cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">
): boolean {
  if (
    pathname === "/portal/perfil" ||
    pathname === "/portal/cambiar-clave" ||
    rutaEsCfdi(pathname)
  ) {
    return true;
  }

  const modo = modoPortalCliente(cliente);

  if (modo === "solo_visor") {
    return false;
  }

  if (modo === "asalariado_anual") {
    if (pathname === "/portal/inicio") return true;
    if (pathname === "/portal/cumplimiento") return true;
    return false;
  }

  return true;
}

export function etiquetaModoPortal(
  cliente: Pick<Cliente, "configPortal" | "regimenFiscalClave">
): string | null {
  const modo = modoPortalCliente(cliente);
  if (modo === "solo_visor") return "Solo Visor CFDI";
  if (modo === "asalariado_anual") return "Asalariado · Visor + anual";
  return null;
}

export function configPortalDesdeAlta(params: {
  soloVisorFiscal: boolean;
  asalariadoSoloAnual: boolean;
  regimenFiscalClave?: string;
}): ConfigPortalCliente {
  const soloVisorFiscal = params.soloVisorFiscal;
  return {
    soloVisorFiscal,
    asalariadoSoloAnual:
      !soloVisorFiscal &&
      params.asalariadoSoloAnual &&
      esRegimenAsalariado(params.regimenFiscalClave),
  };
}

export function cumplimientoDesdeModoPortal(params: {
  soloVisorFiscal: boolean;
  asalariadoSoloAnual: boolean;
  regimenFiscalClave?: string;
  federales: boolean;
  imss: boolean;
  estatales: boolean;
}): { federales: boolean; imss: boolean; estatales: boolean } {
  const cfg = configPortalDesdeAlta(params);
  if (cfg.soloVisorFiscal || cfg.asalariadoSoloAnual) {
    return { federales: false, imss: false, estatales: false };
  }
  return {
    federales: params.federales,
    imss: params.imss,
    estatales: params.estatales,
  };
}
