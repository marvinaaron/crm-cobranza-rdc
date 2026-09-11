export const ESTATUS_LEAD = [
  "nuevo",
  "contactado",
  "aceptado",
  "rechazado",
] as const;

export type EstatusLead = (typeof ESTATUS_LEAD)[number];

export const ESTATUS_LEAD_LABEL: Record<EstatusLead, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};

export const ESTATUS_LEAD_CLASE: Record<EstatusLead, string> = {
  nuevo: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200",
  contactado:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  aceptado:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
  rechazado: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
};

export const MOTIVO_RECHAZO_MIN = 20;
export const MOTIVO_RECHAZO_MAX = 2000;

export function esEstatusLead(v: unknown): v is EstatusLead {
  return typeof v === "string" && (ESTATUS_LEAD as readonly string[]).includes(v);
}

export function normalizarEstatusLead(v: unknown): EstatusLead {
  return esEstatusLead(v) ? v : "nuevo";
}

export function validarMotivoRechazo(
  raw: unknown
): { ok: true; motivo: string } | { ok: false; error: string } {
  const motivo = typeof raw === "string" ? raw.trim() : "";
  if (motivo.length < MOTIVO_RECHAZO_MIN) {
    return {
      ok: false,
      error: `Cuéntanos un poco más (mínimo ${MOTIVO_RECHAZO_MIN} caracteres): precio, timing, eligió a otro, etc.`,
    };
  }
  if (motivo.length > MOTIVO_RECHAZO_MAX) {
    return { ok: false, error: "El motivo es demasiado largo." };
  }
  return { ok: true, motivo };
}
