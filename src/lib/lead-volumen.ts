/**
 * Volumen opcional de Cotizar (facturación / CFDI) para la bandeja de prospectos.
 * Si no lo llenaron, queda en blanco. No se usa en WhatsApp.
 */

import {
  CFDI_MAX,
  INGRESOS_MAX,
  type PerfilCotizacion,
} from "@/lib/servicios-cotizables";

export type VolumenLead = {
  ingresosMensuales: number | null;
  ingresosMas300: boolean;
  cfdiMensuales: number | null;
  cfdiMas50: boolean;
};

export const VOLUMEN_LEAD_VACIO: VolumenLead = {
  ingresosMensuales: null,
  ingresosMas300: false,
  cfdiMensuales: null,
  cfdiMas50: false,
};

export function volumenDesdePerfil(perfil: PerfilCotizacion): VolumenLead {
  const ingresos = Number.isFinite(perfil.ingresos)
    ? Math.min(INGRESOS_MAX, Math.max(0, Math.round(perfil.ingresos)))
    : 0;
  const cfdi = Number.isFinite(perfil.cfdi)
    ? Math.min(CFDI_MAX, Math.max(1, Math.round(perfil.cfdi)))
    : 1;
  const tieneIngresos = perfil.ingresosMas300 || ingresos > 0;
  const tieneCfdi = perfil.cfdiMas50 || cfdi > 1;
  return {
    ingresosMensuales: tieneIngresos
      ? perfil.ingresosMas300
        ? INGRESOS_MAX
        : ingresos
      : null,
    ingresosMas300: Boolean(tieneIngresos && perfil.ingresosMas300),
    cfdiMensuales: tieneCfdi ? (perfil.cfdiMas50 ? CFDI_MAX : cfdi) : null,
    cfdiMas50: Boolean(tieneCfdi && perfil.cfdiMas50),
  };
}

export function parseVolumenDesdeCuerpo(perfilRaw: unknown): VolumenLead {
  if (!perfilRaw || typeof perfilRaw !== "object") return VOLUMEN_LEAD_VACIO;
  const o = perfilRaw as Record<string, unknown>;
  const ingresosNum =
    typeof o.ingresos === "number"
      ? o.ingresos
      : typeof o.ingresos === "string"
        ? Number(o.ingresos.replace(/[^\d]/g, ""))
        : 0;
  const cfdiNum =
    typeof o.cfdi === "number"
      ? o.cfdi
      : typeof o.cfdi === "string"
        ? Number(o.cfdi.replace(/[^\d]/g, ""))
        : 1;
  return volumenDesdePerfil({
    tipo: undefined,
    regimenes: [],
    ingresos: Number.isFinite(ingresosNum) ? ingresosNum : 0,
    ingresosMas300: o.ingresosMas300 === true,
    cfdi: Number.isFinite(cfdiNum) ? cfdiNum : 1,
    cfdiMas50: o.cfdiMas50 === true,
  });
}

export function volumenDesdeMensaje(mensaje: string | null | undefined): VolumenLead {
  const v: VolumenLead = { ...VOLUMEN_LEAD_VACIO };
  if (!mensaje) return v;

  if (/Ingresos aprox\.:\s*\+\$300,000/i.test(mensaje)) {
    v.ingresosMas300 = true;
    v.ingresosMensuales = INGRESOS_MAX;
  } else {
    const mIng = mensaje.match(/Ingresos aprox\.:\s*\$([0-9,]+)/i);
    if (mIng) {
      const n = Number(mIng[1].replace(/,/g, ""));
      if (Number.isFinite(n) && n > 0) v.ingresosMensuales = Math.min(INGRESOS_MAX, n);
    }
  }

  if (/Volumen CFDI:\s*\+50/i.test(mensaje)) {
    v.cfdiMas50 = true;
    v.cfdiMensuales = CFDI_MAX;
  } else {
    const mCfdi = mensaje.match(/Volumen CFDI:\s*(\d+)/i);
    if (mCfdi) {
      const n = Number(mCfdi[1]);
      if (Number.isFinite(n) && n > 1) v.cfdiMensuales = Math.min(CFDI_MAX, n);
    }
  }

  return v;
}

export function leadTieneVolumen(v: VolumenLead): boolean {
  return (
    v.ingresosMas300 ||
    (v.ingresosMensuales != null && v.ingresosMensuales > 0) ||
    v.cfdiMas50 ||
    (v.cfdiMensuales != null && v.cfdiMensuales > 0)
  );
}

export function fusionarVolumen(
  primario: VolumenLead,
  respaldo: VolumenLead
): VolumenLead {
  if (leadTieneVolumen(primario)) {
    return {
      ingresosMensuales:
        primario.ingresosMensuales ?? respaldo.ingresosMensuales,
      ingresosMas300: primario.ingresosMas300 || respaldo.ingresosMas300,
      cfdiMensuales: primario.cfdiMensuales ?? respaldo.cfdiMensuales,
      cfdiMas50: primario.cfdiMas50 || respaldo.cfdiMas50,
    };
  }
  return respaldo;
}

export function formatearFacturacionLead(v: VolumenLead): string | null {
  if (v.ingresosMas300) return "+$300,000 / mes";
  if (v.ingresosMensuales != null && v.ingresosMensuales > 0) {
    return `$${v.ingresosMensuales.toLocaleString("es-MX")} / mes`;
  }
  return null;
}

export function formatearCfdiLead(v: VolumenLead): string | null {
  if (v.cfdiMas50) return "+50 / mes";
  if (v.cfdiMensuales != null && v.cfdiMensuales > 0) {
    return `${v.cfdiMensuales} / mes`;
  }
  return null;
}

export function volumenDesdeLeadRow(lead: {
  ingresos_mensuales?: number | null;
  ingresos_mas_300?: boolean | null;
  cfdi_mensuales?: number | null;
  cfdi_mas_50?: boolean | null;
  mensaje?: string | null;
}): VolumenLead {
  const fromDb: VolumenLead = {
    ingresosMensuales: lead.ingresos_mensuales ?? null,
    ingresosMas300: Boolean(lead.ingresos_mas_300),
    cfdiMensuales: lead.cfdi_mensuales ?? null,
    cfdiMas50: Boolean(lead.cfdi_mas_50),
  };
  if (leadTieneVolumen(fromDb)) return fromDb;
  return volumenDesdeMensaje(lead.mensaje);
}
